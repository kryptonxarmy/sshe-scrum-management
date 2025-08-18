"use client";

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";

const KanbanBoard = ({ functionId }) => {
  const [tasks, setTasks] = useState({
    todo: [],
    progress: [],
    done: []
  });

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
  
  useEffect(() => {
    const fetchTasksData = async () => {
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
      fetchTasksData();
    }
  }, [functionId]);

  const handleTaskUpdated = () => {
    // Refresh tasks after update
    fetchTasks();
  };

  const columns = [
    { 
      id: "todo", 
      title: "Todo", 
      tasks: tasks.todo || [], 
      headerClass: "text-slate-800"
    },
    { 
      id: "progress", 
      title: "In Progress", 
      tasks: tasks.progress || [], 
      headerClass: "text-blue-600"
    },
    { 
      id: "done", 
      title: "Done", 
      tasks: tasks.done || [], 
      headerClass: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {columns.map((column) => (
        <div
          key={column.id}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${column.headerClass}`}>
              {column.title}
            </h3>
            <span className="text-sm text-slate-500">
              {column.tasks.length} {column.tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          {column.tasks.length > 0 ? (
            <div className="space-y-4">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} onTaskUpdated={handleTaskUpdated} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No tasks in this column
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
