import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ListChecks, CheckCircle, Clock, ArrowUpRight } from "lucide-react";

const SprintProjectsReport = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projects?.[0]?.id || "");
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/projects/${selectedProjectId}/sprints`)
      .then((res) => res.json())
      .then((data) => {
        setSprints(data.sprints || []);
      })
      .catch(() => setError("Failed to fetch sprints"))
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Projects per Sprint</h3>
      <div className="mb-4 flex items-center gap-4">
        <div>
          <label className="text-sm font-medium mr-2">Select Project:</label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProject && (
          <Button asChild variant="outline" size="sm" className="inline-flex self-end items-center">
            <Link href={`/tasks?projectId=${selectedProject.id}`} target="_blank" rel="noopener noreferrer">
              Go to Project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading sprints...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : sprints.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No sprints found for this project.</div>
      ) : (
        <div className="space-y-8">
          {sprints.map((sprint) => {
            const backlogTasks = sprint.tasks?.filter((t) => t.isOverdue && t.status !== "DONE") || [];
            const completedTasks = sprint.tasks?.filter((t) => t.status === "DONE") || [];
            const inProgressTasks = sprint.tasks?.filter((t) => t.status === "IN_PROGRESS") || [];
            const todoTasks = sprint.tasks?.filter((t) => t.status === "TODO") || [];
            return (
              <Card key={sprint.id} className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    <span className="font-bold">{sprint.name}</span>
                    <Badge variant={sprint.status === "ACTIVE" ? "default" : "secondary"}>{sprint.status}</Badge>
                  </CardTitle>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      Start: <b>{sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "-"}</b>
                    </span>
                    <span>
                      End: <b>{sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "-"}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Progress value={sprint.completionRate || 0} className="w-32" />
                    <span className="text-xs text-gray-600">{sprint.completionRate || 0}% Complete</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Backlog/Overdue Tasks */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Sprint Backlog & Overdue Tasks
                        <Badge variant="destructive">{backlogTasks.length}</Badge>
                      </h4>
                      {backlogTasks.length > 0 ? (
                        <ul className="space-y-2">
                          {backlogTasks.map((task) => (
                            <li key={task.id} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded px-3 py-2">
                              <span className="font-medium text-red-700">{task.title}</span>
                              <Badge variant="outline">Overdue</Badge>
                              <span className="text-xs text-red-500">Suggest move to next sprint</span>
                              <span className="text-xs text-gray-400 ml-auto">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-gray-400">No backlog/overdue tasks in this sprint.</div>
                      )}
                    </div>
                    {/* Other Tasks */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Tasks Overview
                      </h4>
                      <div className="space-y-2">
                        {todoTasks.length > 0 && (
                          <div>
                            <span className="font-semibold text-xs text-gray-700">To Do:</span>
                            <ul className="ml-2">
                              {todoTasks.map((task) => (
                                <li key={task.id} className="flex items-center gap-2 text-gray-700">
                                  <Badge variant="outline">To Do</Badge>
                                  <span>{task.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {inProgressTasks.length > 0 && (
                          <div>
                            <span className="font-semibold text-xs text-gray-700">In Progress:</span>
                            <ul className="ml-2">
                              {inProgressTasks.map((task) => (
                                <li key={task.id} className="flex items-center gap-2 text-blue-700">
                                  <Badge variant="default">In Progress</Badge>
                                  <span>{task.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {completedTasks.length > 0 && (
                          <div>
                            <span className="font-semibold text-xs text-gray-700">Completed:</span>
                            <ul className="ml-2">
                              {completedTasks.map((task) => (
                                <li key={task.id} className="flex items-center gap-2 text-green-700">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <Badge variant="success">Done</Badge>
                                  <span>{task.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {todoTasks.length === 0 && inProgressTasks.length === 0 && completedTasks.length === 0 && <div className="text-xs text-gray-400">No tasks in this sprint.</div>}
                      </div>
                    </div>
                  </div>
                  {/* Sprint Insights */}
                  <div className="mt-6 bg-slate-50 rounded p-4 border">
                    <h4 className="font-semibold text-sm mb-2">Sprint Insights</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="font-bold">{sprint.tasks?.length || 0}</span>
                        <span className="ml-1 text-gray-500">Total Tasks</span>
                      </div>
                      <div>
                        <span className="font-bold">{completedTasks.length}</span>
                        <span className="ml-1 text-green-600">Completed</span>
                      </div>
                      <div>
                        <span className="font-bold">{backlogTasks.length}</span>
                        <span className="ml-1 text-red-600">Backlog/Overdue</span>
                      </div>
                      <div>
                        <span className="font-bold">{sprint.completionRate || 0}%</span>
                        <span className="ml-1 text-blue-600">Completion Rate</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SprintProjectsReport;
