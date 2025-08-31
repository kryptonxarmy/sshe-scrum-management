"use client";
import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { CheckCircle2, Circle, Clock, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CompletedTasksList from "./CompletedTasksList";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const KanbanBoard = ({ functionId, filter = "all", sprintId = "", assigneeId = "" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState({
    todo: [],
    progress: [],
    done: [],
  });
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      let url = `/api/tasks?projectId=${functionId}`;
      if (sprintId) url += `&sprintId=${sprintId}`;
      if (assigneeId) url += `&assigneeId=${assigneeId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      const organizedTasks = {
        todo: data.tasks.filter((task) => task.status === "TODO"),
        progress: data.tasks.filter((task) => task.status === "IN_PROGRESS"),
        done: data.tasks.filter((task) => task.status === "DONE"),
      };
      setTasks(organizedTasks);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching tasks:", error);
    }
  };

  // Fetch project detail
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${functionId}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setProject(data.project);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching project:", error);
    }
  };

  useEffect(() => {
    if (!functionId) {
  setError("Project ID not found. Unable to fetch tasks.");
      return;
    }
    fetchTasks();
    fetchProject();
  }, [functionId, sprintId, assigneeId]);

  const handleTaskUpdated = () => fetchTasks();

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prevTasks) => ({
      todo: prevTasks.todo.filter((task) => task.id !== deletedTaskId),
      progress: prevTasks.progress.filter((task) => task.id !== deletedTaskId),
      done: prevTasks.done.filter((task) => task.id !== deletedTaskId),
    }));
  };

  // Owner & Scrum Master punya full control
  const hasFullControl = () => {
    if (!user || !project) return false;
    // Project Owner
    if (user.id === project.ownerId) return true;
    // Scrum Master (regardless of role)
    if (user.id === project.scrumMasterId) return true;
    return false;
  };

  // Cek apakah user boleh drag ke DONE
  const canDragToDone = () => hasFullControl();

  // Cek apakah user boleh create task
  const canCreateTask = () => hasFullControl();

  // Helper: apakah user team_member dan tidak di-assign di task
  const isTeamMemberAndNotAssigned = (task) => {
    // Project Owner & Scrum Master always can drag any task
    if (!user) return false;
    if (project && (user.id === project.ownerId || user.id === project.scrumMasterId)) return false;
    // Team member: only if assigned
    if (user.role === "TEAM_MEMBER") {
      if (task.assignees && Array.isArray(task.assignees)) {
        return !task.assignees.some((assignee) => {
          const userId = assignee.user ? assignee.user.id : assignee.userId;
          return userId === user.id;
        });
      }
      return true;
    }
    return false;
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Get source and destination lists
    const sourceList = [...tasks[source.droppableId]];
    const destList = source.droppableId === destination.droppableId ? sourceList : [...tasks[destination.droppableId]];
    const [movedTask] = sourceList.splice(source.index, 1);

    // Prevent moving DONE tasks back to IN_PROGRESS or TODO
    if (source.droppableId === "done" && destination.droppableId !== "done") {
      toast({
        title: "Access Denied",
        description: "Completed (DONE) tasks cannot be moved back.",
        variant: "destructive",
        className: "text-base px-6 py-5 rounded-xl bg-red-600 text-white",
      });
      return;
    }

    // Prevent moving to DONE if not owner/scrum master
    if (destination.droppableId === "done" && !canDragToDone()) {
      toast({
        title: "Access Denied",
        description: "Only Project Owner or Scrum Master can move tasks to DONE.",
        variant: "destructive",
        className: "text-base px-6 py-5 rounded-xl bg-red-600 text-white",
      });
      return;
    }

    // Check if team member can drag this task
    if (isTeamMemberAndNotAssigned(movedTask)) {
      toast({
        title: "Access Denied",
        description: "You can only move tasks assigned to you.",
        variant: "destructive",
        className: "text-base px-6 py-5 rounded-xl bg-red-600 text-white",
      });
      return;
    }

    // Update task status based on destination
    const newStatus = destination.droppableId === "todo" ? "TODO" : destination.droppableId === "progress" ? "IN_PROGRESS" : "DONE";
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
      const originalSourceList = [...tasks[source.droppableId]];
      const originalDestList = [...tasks[destination.droppableId]];
      
      // Add the task back to original position
      originalSourceList.splice(source.index, 0, movedTask);
      
      setTasks({
        ...revertedTasks,
        [source.droppableId]: originalSourceList,
        [destination.droppableId]: originalDestList,
      });
      
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
        className: "text-base px-6 py-5 rounded-xl bg-red-600 text-white",
      });
    }
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
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          <b>Error:</b> {error}
        </div>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className={`grid gap-6 mb-12 ${
            filter === "all" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {columns.map((column) => {
            const Icon = column.icon;
            return (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`rounded-lg border border-slate-200 overflow-hidden ${column.bgClass} ${snapshot.isDraggingOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
                      <h3 className={`text-lg font-semibold ${column.headerClass}`}>
                        {column.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                          {column.tasks.length}
                        </span>
                        {canCreateTask() && (
                          <button
                            onClick={() => console.log("Open create task modal for:", column.id)}
                            className="ml-2 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      {column.tasks.length > 0 ? (
                        <div className="space-y-3">
                          {column.tasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id.toString()}
                              index={index}
                              isDragDisabled={!hasFullControl() && isTeamMemberAndNotAssigned(task)}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={snapshot.isDragging ? "opacity-80" : ""}
                                >
                                  <TaskCard
                                    task={task}
                                    onTaskUpdated={handleTaskUpdated}
                                    onTaskDeleted={handleTaskDeleted}
                                  />
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
      <CompletedTasksList tasks={tasks.done} />
    </>
  );
};

export default KanbanBoard;