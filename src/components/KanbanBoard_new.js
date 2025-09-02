"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import TaskCard from "./TaskCard";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const KanbanBoard = ({ functionId, filter = "all", refreshTrigger = 0 }) => {
  const { user, canUpdateTaskProgress } = useAuth();
  const [tasks, setTasks] = useState({
    todo: [],
    progress: [],
    done: []
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const dragOverColumnRef = useRef(null);

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
  }, [functionId, refreshTrigger]);

  // Drag and Drop Functions
  const handleDragStart = (e, task) => {
    if (!canUpdateTaskProgress(task)) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add drag styling to the dragged element
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setDraggedTask(null);
    dragOverColumnRef.current = null;
    
    // Reset styling
    e.target.style.opacity = '1';
    
    // Remove all drag-over styling from columns
    document.querySelectorAll('.kanban-column').forEach(col => {
      col.classList.remove('drag-over');
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, columnStatus) => {
    e.preventDefault();
    if (!draggedTask || !canUpdateTaskProgress(draggedTask)) return;
    
    const column = e.currentTarget;
    dragOverColumnRef.current = columnStatus;
    
    // Remove drag-over class from all columns
    document.querySelectorAll('.kanban-column').forEach(col => {
      col.classList.remove('drag-over');
    });
    
    // Add drag-over class to current column
    column.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only remove styling if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    
    if (!draggedTask || !canUpdateTaskProgress(draggedTask)) return;
    
    const sourceStatus = draggedTask.status;
    
    // Don't do anything if dropped in the same column
    if (sourceStatus === targetStatus) {
      return;
    }
    
    // Map UI status to API status
    const statusMap = {
      'todo': 'TODO',
      'progress': 'IN_PROGRESS', 
      'done': 'DONE'
    };
    
    const newStatus = statusMap[targetStatus];
    
    try {
      // Optimistic update - update UI immediately
      const updatedTask = { ...draggedTask, status: newStatus };
      
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        
        // Remove task from source column
        const sourceColumn = sourceStatus === 'TODO' ? 'todo' : 
                           sourceStatus === 'IN_PROGRESS' ? 'progress' : 'done';
        newTasks[sourceColumn] = newTasks[sourceColumn].filter(task => task.id !== draggedTask.id);
        
        // Add task to target column
        newTasks[targetStatus] = [...newTasks[targetStatus], updatedTask];
        
        return newTasks;
      });
      
      // Update task status via API
      const response = await fetch(`/api/tasks/${draggedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          userId: user.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
    } catch (error) {
      console.error('Error updating task status:', error);
      
      // Revert optimistic update on error
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        
        // Remove task from target column
        newTasks[targetStatus] = newTasks[targetStatus].filter(task => task.id !== draggedTask.id);
        
        // Add task back to source column
        const sourceColumn = sourceStatus === 'TODO' ? 'todo' : 
                           sourceStatus === 'IN_PROGRESS' ? 'progress' : 'done';
        newTasks[sourceColumn] = [...newTasks[sourceColumn], draggedTask];
        
        return newTasks;
      });
      
      alert('Failed to update task status. Please try again.');
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
    <>
      <style jsx>{`
        .drag-over {
          background: #f0f9ff !important;
          border: 2px dashed #0ea5e9 !important;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
        
        .task-card {
          cursor: grab;
          transition: all 0.3s ease;
        }
        
        .task-card:active {
          cursor: grabbing;
        }
        
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .kanban-column {
          transition: all 0.2s ease;
        }
      `}</style>
      
      <div className={`grid gap-6 mb-12 ${filter === "all" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div
              key={column.id}
              className={`kanban-column rounded-lg border border-slate-200 overflow-hidden ${column.bgClass}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
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
                      <div
                        key={task.id}
                        className="task-card"
                        draggable={canUpdateTaskProgress(task)}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                      >
                        <TaskCard task={task} />
                      </div>
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
    </>
  );
};

export default KanbanBoard;
