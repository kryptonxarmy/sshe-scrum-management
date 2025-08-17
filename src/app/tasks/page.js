"use client";

import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";

import { useState, useEffect } from "react";
import CreateTaskModal from "@/components/CreateTaskModal";


export default function TasksPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/members`);
        const data = await res.json();
        setTeamMembers([
          ...(data.owner ? [{ ...data.owner }] : []),
          ...(data.members || [])
        ]);
      } catch {
        setTeamMembers([]);
      }
    };
    fetchMembers();
  }, [projectId]);

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


  if (!projectId) {
    return <div className="min-h-screen bg-slate-50 p-4">Please select a project first.</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar active="kanban" showTasks={true} />
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
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Department:</span>
                        <span className="font-medium text-slate-700">{project.department || '-'}</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Start:</span>
                        <span className="font-medium text-slate-700">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Due:</span>
                        <span className="font-medium text-slate-700">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>
                    {/* Team Members List */}
                    <div className="mt-4">
                      <h3 className="font-semibold text-base mb-2">Team Members</h3>
                      <div className="flex flex-wrap gap-3">
                        {teamMembers.length === 0 ? (
                          <span className="text-slate-400 text-sm">No team members found.</span>
                        ) : (
                          teamMembers.map((member) => (
                            <div key={member.id} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex flex-col items-start min-w-[120px]">
                              <span className="font-medium text-slate-700 text-sm">{member.name}</span>
                              <span className="text-xs text-slate-500">{member.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Task
                </button>
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
          <KanbanBoard 
            functionId={projectId} 
            filter={filter} 
            key={refreshTasks} // Force re-render when tasks change
          />
        </div>
        <CreateTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          projectId={projectId}
          onTaskCreated={() => setRefreshTasks(prev => prev + 1)}
        />
      </div>
    </ProtectedRoute>
  );
}
