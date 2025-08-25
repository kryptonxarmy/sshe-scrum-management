"use client";

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CompletedTasksList from "./CompletedTasksList";
import { useAuth } from "@/contexts/AuthContext";

const KanbanBoard = ({ functionId, filter = "all" }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({
    todo: [],
    progress: [],
    done: [],
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${functionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      // Organize tasks by status
      const organizedTasks = {
        todo: data.tasks.filter((task) => task.status === "TODO"),
        progress: data.tasks.filter((task) => task.status === "IN_PROGRESS"),
        done: data.tasks.filter((task) => task.status === "DONE"),
      };
      setTasks(organizedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const response = await fetch(`/api/tasks?projectId=${functionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        // Organize tasks by status
        const organizedTasks = {
          todo: data.tasks.filter((task) => task.status === "TODO"),
          progress: data.tasks.filter((task) => task.status === "IN_PROGRESS"),
          done: data.tasks.filter((task) => task.status === "DONE"),
        };
        setTasks(organizedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (functionId) {
      fetchTasksData();
    }
  }, [functionId]);

  const handleTaskUpdated = () => {
    // Refresh tasks after update
    fetchTasks();
  };

  const handleTaskDeleted = (deletedTaskId) => {
    // Remove the deleted task from the state
    setTasks((prevTasks) => ({
      todo: prevTasks.todo.filter((task) => task.id !== deletedTaskId),
      progress: prevTasks.progress.filter((task) => task.id !== deletedTaskId),
      done: prevTasks.done.filter((task) => task.id !== deletedTaskId),
    }));
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Get source and destination lists
    const sourceList = tasks[source.droppableId];
    const destList = tasks[destination.droppableId];

    // Get the task being moved
    const [movedTask] = sourceList.splice(source.index, 1);

    // Update task status based on destination
    const newStatus = destination.droppableId === "todo" ? "TODO" : destination.droppableId === "progress" ? "IN_PROGRESS" : "DONE";

    // Add task to destination list
    destList.splice(destination.index, 0, { ...movedTask, status: newStatus });

    // Update state (optimistic)
    setTasks({
      ...tasks,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    });

    // Update task status and order in backend
    try {
      console.log("Updating task status:", { taskId: movedTask.id, newStatus });
      const response = await fetch(`/api/tasks/${movedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update task status:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Task status updated successfully:", result);

      // Refetch tasks from backend to ensure sync
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert optimistic update on error
      const revertedTasks = { ...tasks };
      revertedTasks[destination.droppableId].splice(destination.index, 1);
      revertedTasks[source.droppableId].splice(source.index, 0, movedTask);
      setTasks(revertedTasks);
    }
  };

  // Helper: apakah user team_member dan tidak di-assign di task
  const isTeamMemberAndNotAssigned = (task) => {
    if (!user || user.role !== "TEAM_MEMBER") return false;
    if (task.assignees && Array.isArray(task.assignees)) {
      return !task.assignees.some((assignee) => {
        const userId = assignee.user ? assignee.user.id : assignee.userId;
        return userId === user.id;
      });
    }
    return true;
  };

  let columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: tasks.todo || [],
      headerClass: "text-slate-800",
      icon: Circle,
      bgClass: "bg-slate-50",
      emptyMessage: "No tasks to do yet",
    },
    {
      id: "progress",
      title: "In Progress",
      tasks: tasks.progress || [],
      headerClass: "text-blue-600",
      icon: Clock,
      bgClass: "bg-blue-50",
      emptyMessage: "No tasks in progress",
    },
    {
      id: "done",
      title: "Done",
      tasks: tasks.done || [],
      headerClass: "text-green-600",
      icon: CheckCircle2,
      bgClass: "bg-green-50",
      emptyMessage: "No completed tasks",
    },
  ];

  if (filter !== "all") {
    columns = columns.filter((col) => col.id === filter);
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid gap-6 mb-12 ${filter === "all" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
          {columns.map((column) => {
            const Icon = column.icon;
            return (
              <Droppable key={column.id} droppableId={column.id} isDropDisabled={false}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`rounded-lg border border-slate-200 overflow-hidden ${column.bgClass} ${snapshot.isDraggingOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}>
                    <div className="bg-white border-b border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${column.headerClass}`} />
                          <h3 className={`text-lg font-semibold ${column.headerClass}`}>{column.title}</h3>
                        </div>
                        <span className="text-sm font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">{column.tasks.length}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      {column.tasks.length > 0 ? (
                        <div className="space-y-3">
                          {column.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index} isDragDisabled={isTeamMemberAndNotAssigned(task)}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={snapshot.isDragging ? "opacity-80" : ""}>
                                  <TaskCard task={task} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 px-4">
                          <Icon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">{column.emptyMessage}</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Completed Tasks List */}
      <CompletedTasksList tasks={tasks.done} />
    </>
  );
};

export default KanbanBoard;
