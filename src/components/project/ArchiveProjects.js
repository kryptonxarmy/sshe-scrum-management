"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle } from "lucide-react";

const ArchiveProjects = () => {
  const { user } = useAuth();
  const [releasedProjects, setReleasedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch released projects from API
  useEffect(() => {
    const fetchReleasedProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/projects/released?userId=${user.id}`);

        if (!response.ok) {
          if (response.status === 403) {
            setError("You don't have permission to view archived projects");
            return;
          }
          throw new Error("Failed to fetch released projects");
        }

        const data = await response.json();
        setReleasedProjects(data.projects || []);
      } catch (error) {
        console.error("Error fetching released projects:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReleasedProjects();
  }, [user]);

  const getProjectStats = (project) => {
    const tasks = project.tasks || [];
    const total = tasks.length;

    if (total === 0) {
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        completionRate: 0,
      };
    }

    const todo = tasks.filter((task) => task.status === "TODO").length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const done = tasks.filter((task) => task.status === "DONE").length;

    return {
      total,
      todo,
      inProgress,
      done,
      completionRate: Math.round((done / total) * 100),
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.MEDIUM;
  };

  const handleRestoreToActive = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/release`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "active" }),
      });
      if (!response.ok) throw new Error("Failed to restore project to ACTIVE");
      // Refresh released projects
      const data = await response.json();
      setReleasedProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      setError("Gagal mengembalikan project ke ACTIVE");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading archived projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (releasedProjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Released Projects</h3>
          <p className="text-slate-500">You haven not released any projects yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Released Projects Archive</h2>
          <p className="text-slate-600">Comprehensive overview of your completed and released projects</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {releasedProjects.length} Released Projects
          </Badge>
          <div className="text-sm text-slate-500">Total Value: {releasedProjects.length} Projects</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Released</p>
              <p className="text-3xl font-bold">{releasedProjects.length}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Avg Completion</p>
              <p className="text-3xl font-bold">
                {releasedProjects.length > 0
                  ? Math.round(
                      releasedProjects.reduce((acc, project) => {
                        const stats = getProjectStats(project);
                        return acc + stats.completionRate;
                      }, 0) / releasedProjects.length
                    )
                  : 0}
                %
              </p>
            </div>
            <Users className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold">
                {releasedProjects.reduce((acc, project) => {
                  const stats = getProjectStats(project);
                  return acc + stats.total;
                }, 0)}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Team Members</p>
              <p className="text-3xl font-bold">
                {releasedProjects.reduce((acc, project) => {
                  return acc + project.members.length;
                }, 0)}
              </p>
            </div>
            <Users className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {releasedProjects.map((project) => {
          const stats = getProjectStats(project);

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg leading-6">{project.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                      <Badge className="bg-green-100 text-green-800">RELEASED</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => handleRestoreToActive(project.id)}>
                    Restore to ACTIVE
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">Owner:</span> {project.owner.name}
                  </div>
                  {project.scrumMaster && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-medium">Scrum Master:</span> {project.scrumMaster.name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">Department:</span> {project.department}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} />
                    <span>Released: {formatDate(project.updatedAt)}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 space-y-2 border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Task Progress</span>
                    <span className="text-slate-600">{stats.completionRate}%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-100 rounded text-center py-2">
                      <div className="font-semibold text-slate-700">{stats.todo}</div>
                      <div className="text-slate-500">To Do</div>
                    </div>
                    <div className="bg-blue-50 rounded text-center py-2">
                      <div className="font-semibold text-blue-700">{stats.inProgress}</div>
                      <div className="text-blue-600">In Progress</div>
                    </div>
                    <div className="bg-green-50 rounded text-center py-2">
                      <div className="font-semibold text-green-700">{stats.done}</div>
                      <div className="text-green-600">Done</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Total: {stats.total} tasks</span>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{project.members.length} members</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ArchiveProjects;
