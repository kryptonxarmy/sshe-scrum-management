"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";
import CreateTaskModal from "@/components/CreateTaskModal";
import { useAuth } from "@/contexts/AuthContext";

function TasksPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  // Fetch sprints for filter
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/sprints`)
      .then((res) => res.json())
      .then((data) => {
        setSprints(data.sprints || []);
        if (data.sprints && data.sprints.length > 0) {
          setSelectedSprint(data.sprints[0].id);
        }
      });
  }, [projectId]);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/members`);
        const data = await res.json();

        // Use the teamMembers array from API which has proper roles
        if (data.teamMembers) {
          setTeamMembers(data.teamMembers);
        } else {
          // Fallback to old format if needed
          const uniqueMembers = [];
          const seenIds = new Set();

          // Add owner if exists
          if (data.owner) {
            uniqueMembers.push({
              ...data.owner,
              projectRole: "PROJECT_OWNER",
              isOwner: true,
            });
            seenIds.add(data.owner.id);
          }

          // Add scrum master if exists and not already added
          if (data.scrumMaster && !seenIds.has(data.scrumMaster.id)) {
            uniqueMembers.push({
              ...data.scrumMaster,
              projectRole: "SCRUM_MASTER",
              isScrumMaster: true,
            });
            seenIds.add(data.scrumMaster.id);
          }

          // Add members that are not already in the list
          if (data.members) {
            data.members.forEach((member) => {
              if (!seenIds.has(member.userId || member.id)) {
                uniqueMembers.push({
                  ...member,
                  projectRole: "TEAM_MEMBER",
                });
                seenIds.add(member.userId || member.id);
              }
            });
          }

          setTeamMembers(uniqueMembers);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.priority === "HIGH" ? "bg-red-100 text-red-700" : project.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
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
                        <span className="font-medium text-slate-700">{project.department || "-"}</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Start:</span>
                        <span className="font-medium text-slate-700">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Due:</span>
                        <span className="font-medium text-slate-700">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}</span>
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="mt-4">
                      <h3 className="font-semibold text-base mb-2">Team Members ({teamMembers.length})</h3>
                      <div className="flex flex-wrap gap-3">
                        {teamMembers.length === 0 ? (
                          <span className="text-slate-400 text-sm">No team members found.</span>
                        ) : (
                          teamMembers.map((member, index) => (
                            <div key={`member-${member.id || member.userId || index}`} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex flex-col items-start min-w-[130px]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-700 text-sm">{member.name}</span>
                                {member.isOwner && <span className="bg-amber-100 text-amber-700 text-xs px-1 py-0.5 rounded">Owner</span>}
                                {member.isScrumMaster && <span className="bg-green-100 text-green-700 text-xs px-1 py-0.5 rounded">SM</span>}
                              </div>
                              <span className="text-xs text-slate-500">
                                {member.projectRole
                                  ? member.projectRole
                                      .replace("_", " ")
                                      .toLowerCase()
                                      .replace(/\b\w/g, (c) => c.toUpperCase())
                                  : (member.role || "")
                                      .replace("_", " ")
                                      .toLowerCase()
                                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              {member.department && <span className="text-xs text-slate-400 mt-0.5">{member.department}</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {user?.role === "PROJECT_OWNER" || user?.role === "SCRUM_MASTER" ? (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm" onClick={() => setIsModalOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create Task
                  </button>
                ) : (
                  <span className="text-slate-400 text-sm"></span>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs & Sprint/Assignee Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              {["all", "todo", "progress", "done"].map((f) => (
                <button key={f} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setFilter(f)}>
                  {f === "all" ? "🔄 All Tasks" : f === "todo" ? "📋 To Do" : f === "progress" ? "⏳ In Progress" : "✅ Done"}
                </button>
              ))}
              {/* Sprint Filter */}
              <select value={selectedSprint} onChange={(e) => setSelectedSprint(e.target.value)} className="ml-4 px-3 py-2 rounded border text-sm">
                <option value="">All Sprints</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
              {/* Assignee Filter */}
              <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="ml-2 px-3 py-2 rounded border text-sm">
                <option value="">All Assignees</option>
                {teamMembers.map((member) => (
                  <option key={member.id || member.userId} value={member.id || member.userId}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Board */}
          <KanbanBoard functionId={projectId} filter={filter} sprintId={selectedSprint} assigneeId={selectedAssignee} key={refreshTasks} />
        </div>

        <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectId={projectId} onTaskCreated={() => setRefreshTasks((prev) => prev + 1)} />
      </div>
    </ProtectedRoute>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-4">Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  );
}
