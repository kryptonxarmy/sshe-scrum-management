"use client";

import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";

import { useState, useEffect } from "react";
import CreateTaskModal from "@/components/CreateTaskModal";


export default function TasksPage() {
  const { canCreateTask } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();
        setProject(data.project || null);
      } catch {
        setProject(null);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleTaskCreated = (newTask) => {
    // Trigger refresh of KanbanBoard
    setRefreshTrigger(prev => prev + 1);
  };


  if (!projectId) {
    return <div className="min-h-screen bg-slate-50 p-4">Please select a project first.</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar active="tasks" />
        <div className="max-w-7xl mx-auto p-4">
          {/* Project Header Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-800">{project?.name || "Project"}</h1>
                  {project?.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      project.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {project.priority.charAt(0) + project.priority.slice(1).toLowerCase()} Priority
                    </span>
                  )}
                </div>
                
                {project && (
                  <>
                    <p className="text-slate-600 mb-4">{project.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Department</span>
                        <span className="font-medium text-slate-700">{project.department || '-'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Status</span>
                        <span className={`font-medium ${
                          project.status === 'ACTIVE' ? 'text-green-600' :
                          project.status === 'ON_HOLD' ? 'text-yellow-600' :
                          'text-slate-700'
                        }`}>
                          {project.status || '-'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Start Date</span>
                        <span className="font-medium text-slate-700">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Due Date</span>
                        <span className="font-medium text-slate-700">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                {canCreateTask() && (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    onClick={() => setIsModalOpen(true)}
                    disabled={!project}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create Task
                  </button>
                )}
                {!canCreateTask() && (
                  <div className="text-sm text-slate-500 text-center py-2">
                    Only Scrum Masters and Project Owners can create tasks
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-6">
            <div className="flex gap-2">
              {['all', 'todo', 'progress', 'done'].map((f) => (
                <button
                  key={f}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? '🔄 All Tasks' : 
                   f === 'todo' ? '📋 To Do' : 
                   f === 'progress' ? '⏳ In Progress' : 
                   '✅ Done'}
                </button>
              ))}
            </div>
          </div>

          {/* Kanban Board */}
          <KanbanBoard functionId={projectId} filter={filter} refreshTrigger={refreshTrigger} />
        </div>
        <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskCreated={handleTaskCreated} />
      </div>
    </ProtectedRoute>
  );
}
