import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertTriangle, 
  ListChecks, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Send,
  RefreshCw,
  Calendar,
  FileText,
  Activity
} from "lucide-react";

const UniversalSprintReport = ({ userId, userRole }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingReport, setSendingReport] = useState("");
  const [error, setError] = useState(null);

  // Check if all tasks in sprint are DONE
  const isSprintCompleted = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return false;
    return sprint.tasks.every(task => task.status === "DONE");
  };

  // Check if next sprint exists for this project
  const hasNextSprint = (currentSprint) => {
    if (!currentSprint || !sprints) return false;
    
    // Extract sprint number from name (e.g., "Sprint 1" -> 1)
    const currentSprintNumber = parseInt(currentSprint.name.replace(/\D/g, '')) || 0;
    
    // Check if there's a sprint with a higher number in the same project
    return sprints.some(sprint => {
      const sprintNumber = parseInt(sprint.name.replace(/\D/g, '')) || 0;
      return sprint.projectId === currentSprint.projectId && sprintNumber > currentSprintNumber;
    });
  };

  // Get overdue tasks
  const getOverdueTasks = (sprint) => {
    if (!sprint.tasks) return [];
    const now = new Date();
    return sprint.tasks.filter(task => {
      if (!task.dueDate || task.status === "DONE") return false;
      return new Date(task.dueDate) < now;
    });
  };

  // Get sprint statistics
  const getSprintStats = (sprint) => {
    const tasks = sprint.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === "DONE").length;
    const inProgress = tasks.filter(task => task.status === "IN_PROGRESS").length;
    const todo = tasks.filter(task => task.status === "TODO").length;
    const overdueTasks = getOverdueTasks(sprint);
    const overdueCount = overdueTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, overdueCount, overdueTasks, completionRate };
  };

  // Send sprint report to project owner (only for scrum masters)
  const sendSprintReport = async (sprint) => {
    setSendingReport(sprint.id);
    
    try {
      const projectOwnerId = sprint.project?.owner?.id || sprint.project?.ownerId;
      
      if (!projectOwnerId) {
        throw new Error("Project owner not found");
      }

      const stats = getSprintStats(sprint);
      
      const response = await fetch(`/api/reports/sprint-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sprintId: sprint.id,
          projectId: sprint.projectId,
          scrumMasterId: user.id,
          projectOwnerId: projectOwnerId,
          summary: {
            sprintName: sprint.name,
            projectName: sprint.project?.name,
            stats,
            tasks: sprint.tasks,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            goal: sprint.goal,
          }
        }),
      });

      if (response.ok) {
        toast({
          title: "Report Sent",
          description: `Sprint report has been sent to project owner successfully.`,
          variant: "success",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send report");
      }
    } catch (error) {
      console.error("Error sending sprint report:", error);
      toast({
        title: "Error",
        description: "Failed to send sprint report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReport("");
    }
  };

  // Fetch projects based on user role
  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    // For PROJECT_OWNER and SUPERADMIN: get owned projects
    // For TEAM_MEMBER: get projects where they are scrum master or member
    let apiUrl;
    if (userRole === 'TEAM_MEMBER') {
      // Get projects where user is scrum master or member
      apiUrl = `/api/projects?scrumMasterId=${userId}&includeMemberProjects=true`;
    } else {
      // For PROJECT_OWNER and SUPERADMIN
      apiUrl = `/api/projects?userId=${userId}`;
    }
    
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        const userProjects = Array.isArray(data.projects) ? data.projects : [];
        setProjects(userProjects);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setError("Failed to fetch projects");
      })
      .finally(() => setLoading(false));
  }, [userId, userRole]);

  // Set default project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstProject = projects[0];
      setSelectedProjectId(firstProject.id);
    }
  }, [projects, selectedProjectId]);

  // Fetch sprints for selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    
    setLoading(true);
    setError(null);
    
    // Different API calls based on role
    let sprintApiUrl = `/api/sprints?projectId=${selectedProjectId}&includeTasks=true`;
    
    fetch(sprintApiUrl)
      .then((res) => res.json())
      .then((data) => {
        const sprintData = Array.isArray(data.sprints) ? data.sprints : [];
        setSprints(sprintData);
      })
      .catch((error) => {
        console.error("Error fetching sprints:", error);
        setError("Failed to fetch sprints");
      })
      .finally(() => setLoading(false));
  }, [selectedProjectId, userRole, userId]);

  // Check if user is scrum master of the selected project
  const isUserScrumMaster = () => {
    if (!selectedProjectId) return false;
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    return selectedProject?.scrumMasterId === userId;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading sprint data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Error Loading Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No Projects Found</h3>
        <p className="text-gray-600">
          {userRole === 'TEAM_MEMBER' 
            ? "You are not assigned as scrum master or member of any projects."
            : "You don't own any projects yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selection */}
      <div className="flex items-center gap-4">
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
                {userRole === 'TEAM_MEMBER' && project.scrumMasterId === userId && (
                  <span className="ml-2 text-xs text-blue-600">(Scrum Master)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sprint List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sprint Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sprints.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No Sprints Found</h3>
              <p className="text-gray-600">No sprints found for the selected project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sprints.map((sprint) => {
                const stats = getSprintStats(sprint);
                const isCompleted = isSprintCompleted(sprint);
                const nextSprintExists = hasNextSprint(sprint);
                const canSendReport = isUserScrumMaster() && (isCompleted || nextSprintExists);
                
                return (
                  <Card key={sprint.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{sprint.name}</h3>
                            {isCompleted ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            <p><strong>Duration:</strong> {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</p>
                            {/* {sprint.goal && <p><strong>Goal:</strong> {sprint.goal}</p>} */}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                              <div className="text-xs text-gray-500">Total Tasks</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                              <div className="text-xs text-gray-500">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">{stats.inProgress}</div>
                              <div className="text-xs text-gray-500">In Progress</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600">{stats.overdueCount}</div>
                              <div className="text-xs text-gray-500">Overdue</div>
                            </div>
                          </div>

                          {/* Overdue Tasks Detail */}
                          {stats.overdueCount > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">
                                  Overdue Tasks ({stats.overdueCount})
                                </span>
                              </div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {stats.overdueTasks.map((task) => (
                                  <div key={task.id} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="flex-1 truncate text-red-700">{task.title}</span>
                                    <span className="text-xs text-red-600">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Completion Rate</span>
                              <span className="font-semibold">{stats.completionRate}%</span>
                            </div>
                            <Progress value={stats.completionRate} className="w-full" />
                          </div>
                        </div>

                        <div className="ml-4">
                          {canSendReport && (
                            <Button
                              onClick={() => sendSprintReport(sprint)}
                              disabled={sendingReport === sprint.id}
                              className="flex items-center gap-2"
                              size="sm"
                            >
                              {sendingReport === sprint.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              {sendingReport === sprint.id ? "Sending..." : "Send Report To Project Owner"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Task Details */}
                      {sprint.tasks && sprint.tasks.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Tasks:</h4>
                          <div className="space-y-1">
                            {sprint.tasks.slice(0, 5).map((task) => (
                              <div key={task.id} className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${
                                  task.status === 'DONE' ? 'bg-green-500' :
                                  task.status === 'IN_PROGRESS' ? 'bg-orange-500' : 'bg-gray-400'
                                }`} />
                                <span className="flex-1 truncate">{task.title}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.status === 'DONE' ? 'border-green-200 text-green-700' :
                                    task.status === 'IN_PROGRESS' ? 'border-orange-200 text-orange-700' : 
                                    'border-gray-200 text-gray-700'
                                  }`}
                                >
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            ))}
                            {sprint.tasks.length > 5 && (
                              <div className="text-xs text-gray-500 pl-4">
                                +{sprint.tasks.length - 5} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalSprintReport;
