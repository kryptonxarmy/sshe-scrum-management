import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle, 
  AlertCircle,
  Target,
  Activity,
  BarChart3,
  Award,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Send,
  Calendar,
  FileText
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const ScrumMasterReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [activeTab, setActiveTab] = useState('team');
  const [sprints, setSprints] = useState([]);
  const [sendingReport, setSendingReport] = useState("");

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const projectParam = selectedProject !== 'all' ? `&projectId=${selectedProject}` : '';
      const response = await fetch(`/api/reports/scrum-master?userId=${user.id}${projectParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedProject]);

  const fetchSprints = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const projectParam = selectedProject !== 'all' ? `&projectId=${selectedProject}` : '';
      const response = await fetch(`/api/sprints?scrumMasterId=${user.id}${projectParam}&includeTasks=true`);
      
      if (response.ok) {
        const data = await response.json();
        setSprints(data.sprints || []);
      } else {
        console.error('Failed to fetch sprints');
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  }, [user?.id, selectedProject]);

  // Check if all tasks in sprint are DONE
  const isSprintCompleted = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return false;
    return sprint.tasks.every(task => task.status === "DONE");
  };

  // Get sprint statistics
  const getSprintStats = (sprint) => {
    const tasks = sprint.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === "DONE").length;
    const inProgress = tasks.filter(task => task.status === "IN_PROGRESS").length;
    const todo = tasks.filter(task => task.status === "TODO").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, completionRate };
  };

  // Send sprint report to project owner
  const sendSprintReport = async (sprint) => {
    setSendingReport(sprint.id);
    
    try {
      // Get project owner from the sprint's project data
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

  useEffect(() => {
    fetchReports();
    if (activeTab === 'sprint-reports') {
      fetchSprints();
    }
  }, [fetchReports, fetchSprints, activeTab]);

  if (!user || user.role !== 'SCRUM_MASTER') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only Scrum Masters can access this report.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (!reportsData || reportsData.teamPerformance.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Data Available</h2>
          <p className="text-gray-600">No team performance data found for your projects.</p>
        </div>
      </div>
    );
  }

  const getPerformanceBadge = (completionRate) => {
    if (completionRate >= 80) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">High Performance</Badge>;
    } else if (completionRate >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average Performance</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>;
    }
  };

  const getProductivityIcon = (score) => {
    if (score >= 10) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 5) return <Activity className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Scrum Master Reports
          </h1>
          <p className="text-gray-600 mt-2">Team performance and project insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {reportsData.projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => {
              fetchReports();
              if (activeTab === 'sprint-reports') {
                fetchSprints();
              }
            }} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team-performance" value={activeTab} onValueChange={setActiveTab} className="border-b">
        <TabsList>
          <TabsTrigger value="team-performance">Team Performance</TabsTrigger>
          <TabsTrigger value="sprint-reports">Sprint Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team-performance">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.totalProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.totalTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.totalMembers}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.avgCompletionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  High Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportsData.teamStats.highPerformers}
                </div>
                <p className="text-sm text-gray-600">Members with ≥80% completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-yellow-600" />
                  Average Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {reportsData.teamStats.averagePerformers}
                </div>
                <p className="text-sm text-gray-600">Members with 50-79% completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {reportsData.teamStats.needsAttention}
                </div>
                <p className="text-sm text-gray-600">Members with &lt;50% completion rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Most Productive Member */}
          {reportsData.teamStats.mostProductiveMember && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-500" />
                  Top Performer This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {reportsData.teamStats.mostProductiveMember.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{reportsData.teamStats.mostProductiveMember.user.name}</h3>
                    <p className="text-gray-600">{reportsData.teamStats.mostProductiveMember.projectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {reportsData.teamStats.mostProductiveMember.metrics.productivityScore}
                    </p>
                    <p className="text-sm text-gray-600">Story Points/Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Avg Completion Time</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.teamPerformance.map((member, index) => (
                    <TableRow key={`${member.user.id}-${member.projectId}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{member.user.name}</div>
                            <div className="text-sm text-gray-500">{member.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{member.projectName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{member.metrics.totalTasks} total</div>
                          <div className="text-green-600">{member.metrics.completedTasks} completed</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={member.metrics.completionRate} className="w-16" />
                          <span className="text-sm font-medium">{member.metrics.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{member.metrics.avgCompletionTime} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getProductivityIcon(member.metrics.productivityScore)}
                          <span className="text-sm font-medium">{member.metrics.productivityScore} pts/week</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(member.metrics.completionRate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Project Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportsData.projectPerformance.map((project) => (
                  <Card key={project.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <p className="text-sm text-gray-600">Owner: {project.owner.name}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="font-semibold">{project.completionRate}%</span>
                        </div>
                        
                        <Progress value={project.completionRate} className="w-full" />
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Tasks: {project.totalTasks}</span>
                          <span className="text-gray-600">Members: {project.memberCount}</span>
                        </div>
                        
                        <div className="flex justify-center">
                          {project.performance === 'high' && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">High Performance</Badge>
                          )}
                          {project.performance === 'medium' && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average Performance</Badge>
                          )}
                          {project.performance === 'low' && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sprint-reports">
          <div className="space-y-6">
            {/* Sprint Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sprints</p>
                      <p className="text-2xl font-bold text-gray-900">{sprints.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Sprints</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sprints.filter(sprint => isSprintCompleted(sprint)).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sprints.filter(sprint => !isSprintCompleted(sprint) && sprint.tasks && sprint.tasks.length > 0).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sprints.length > 0 
                          ? Math.round(sprints.reduce((sum, sprint) => sum + getSprintStats(sprint).completionRate, 0) / sprints.length)
                          : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sprint List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sprint Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sprints.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Sprints Found</h3>
                    <p className="text-gray-600">No sprints found for your projects.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sprints.map((sprint) => {
                      const stats = getSprintStats(sprint);
                      const isCompleted = isSprintCompleted(sprint);
                      
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
                                  <p><strong>Project:</strong> {sprint.project?.name}</p>
                                  <p><strong>Duration:</strong> {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</p>
                                  {sprint.goal && <p><strong>Goal:</strong> {sprint.goal}</p>}
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
                                    <div className="text-lg font-bold text-gray-600">{stats.todo}</div>
                                    <div className="text-xs text-gray-500">To Do</div>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <div className="flex items-center justify-between text-sm mb-2">
                                    <span>Completion Rate</span>
                                    <span className="font-semibold">{stats.completionRate}%</span>
                                  </div>
                                  <Progress value={stats.completionRate} className="w-full" />
                                </div>
                              </div>

                              <div className="ml-4">
                                {isCompleted && (
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
                                    {sendingReport === sprint.id ? "Sending..." : "Report to Owner"}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrumMasterReports;
