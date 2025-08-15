"use client";

import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import KanbanBoard from "@/components/KanbanBoard";

import { useState, useEffect } from "react";
import CreateTaskModal from "@/components/CreateTaskModal";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();
        setProjectTitle(data.project?.name || "");
      } catch {
        setProjectTitle("");
      }
    };
    fetchProject();
  }, [projectId]);

  if (!projectId) {
    return <div className="min-h-screen bg-slate-50 p-4">Please select a project first.</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <div>
              <h1 className="text-2xl font-bold mb-1">{projectTitle || "Project"}</h1>
              <div className="flex gap-2 mt-2">
                {['all', 'todo', 'progress', 'done'].map((f) => (
                  <button
                    key={f}
                    className={`px-3 py-1 rounded text-sm border transition ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All Tasks' : f === 'todo' ? 'To Do' : f === 'progress' ? 'In Progress' : 'Done'}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setIsModalOpen(true)}
            >
              + Create Task
            </button>
          </div>
          <KanbanBoard functionId={projectId} filter={filter} />
        </div>
        <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
