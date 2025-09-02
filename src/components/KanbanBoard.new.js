"use client";

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";

const KanbanBoard = ({ functionId, currentUser }) => {
  const [tasks, setTasks] = useState({ todo: [], progress: [], done: [] });
  const [project, setProject] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${functionId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks({
        todo: data.tasks.filter((t) => t.status === "TODO"),
        progress: data.tasks.filter((t) => t.status === "IN_PROGRESS"),
        done: data.tasks.filter((t) => t.status === "DONE"),
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Fetch project
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${functionId}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  useEffect(() => {
    if (functionId) {
      fetchTasks();
      fetchProject();
    }
  }, [functionId]);

  // Rule siapa yang boleh drag
  const canDragTask = (task) => {
    if (!project || !currentUser) return false;
    return (
      currentUser.id === task.assigneeId ||
      currentUser.id === project.ownerId ||
      currentUser.id === project.scrumMasterId
    );
  };

  const handleTaskUpdated = () => fetchTasks();
  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => ({
      todo: prev.todo.filter((t) => t.id !== deletedTaskId),
      progress: prev.progress.filter((t) => t.id !== deletedTaskId),
      done: prev.done.filter((t) => t.id !== deletedTaskId),
    }));
  };

  const columns = [
    { id: "todo", title: "Todo", tasks: tasks.todo, headerClass: "text-slate-800" },
    { id: "progress", title: "In Progress", tasks: tasks.progress, headerClass: "text-blue-600" },
    { id: "done", title: "Done", tasks: tasks.done, headerClass: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {columns.map((col) => (
        <div key={col.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${col.headerClass}`}>{col.title}</h3>
            <span className="text-sm text-slate-500">
              {col.tasks.length} {col.tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          {col.tasks.length > 0 ? (
            <div className="space-y-4">
              {col.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                  canDrag={() => canDragTask(task)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">No tasks in this column</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
