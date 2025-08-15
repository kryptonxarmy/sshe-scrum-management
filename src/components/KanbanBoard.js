"use client";

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { CheckCircle2, Circle, Clock } from "lucide-react";


const KanbanBoard = ({ functionId, filter = "all" }) => {
  const [tasks, setTasks] = useState({
    todo: [],
    progress: [],
    done: []
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?projectId=${functionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        // Organize tasks by status
        const organizedTasks = {
          todo: data.tasks.filter(task => task.status === 'TODO'),
          progress: data.tasks.filter(task => task.status === 'IN_PROGRESS'),
          done: data.tasks.filter(task => task.status === 'DONE')
        };
        setTasks(organizedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    if (functionId) {
      fetchTasks();
    }
  }, [functionId]);

  let columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: tasks.todo || [],
      headerClass: "text-slate-800",
      icon: Circle,
      bgClass: "bg-slate-50",
      emptyMessage: "No tasks to do yet"
    },
    {
      id: "progress",
      title: "In Progress",
      tasks: tasks.progress || [],
      headerClass: "text-blue-600",
      icon: Clock,
      bgClass: "bg-blue-50",
      emptyMessage: "No tasks in progress"
    },
    {
      id: "done",
      title: "Done",
      tasks: tasks.done || [],
      headerClass: "text-green-600",
      icon: CheckCircle2,
      bgClass: "bg-green-50",
      emptyMessage: "No completed tasks"
    }
  ];

  if (filter !== "all") {
    columns = columns.filter(col => col.id === filter);
  }

  return (
    <div className={`grid gap-6 mb-12 ${filter === "all" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
      {columns.map((column) => {
        const Icon = column.icon;
        return (
          <div
            key={column.id}
            className={`rounded-lg border border-slate-200 overflow-hidden ${column.bgClass}`}
          >
            <div className="bg-white border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${column.headerClass}`} />
                  <h3 className={`text-lg font-semibold ${column.headerClass}`}>
                    {column.title}
                  </h3>
                </div>
                <span className="text-sm font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  {column.tasks.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {column.tasks.length > 0 ? (
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <Icon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">
                    {column.emptyMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
