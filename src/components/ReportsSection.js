"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  PieChart,
  Activity,
  Award,
  FileText
} from "lucide-react";

const ReportsSection = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedProject, setSelectedProject] = useState("all");

  // Dummy data berdasarkan role
  const getDummyData = () => {
    const baseData = {
      projects: [
        { id: 1, name: "Fire Safety Improvement", status: "ACTIVE", progress: 75, members: 5 },
        { id: 2, name: "Emergency Response Training", status: "COMPLETED", progress: 100, members: 8 },
        { id: 3, name: "Chemical Handling Protocol", status: "PLANNING", progress: 25, members: 3 },
        { id: 4, name: "Equipment Maintenance", status: "ON_HOLD", progress: 60, members: 4 },
      ],
      tasks: {
        total: 48,
        completed: 32,
        inProgress: 12,
        overdue: 4,
        critical: 2
      },
      performance: {
        velocity: 12.5,
        burndownRate: 85,
        teamEfficiency: 92,
        qualityScore: 88
      },
      timeline: [
        { period: "Week 1", planned: 10, completed: 12 },
        { period: "Week 2", planned: 12, completed: 8 },
        { period: "Week 3", planned: 8, completed: 10 },
        { period: "Week 4", planned: 15, completed: 13 },
      ]
    };

    // Data spesifik berdasarkan role
    const roleSpecificData = {
      SUPERADMIN: {
        ...baseData,
        systemMetrics: {
          totalUsers: 45,
          activeProjects: 12,
          completionRate: 78,
          riskProjects: 3
        },
        departmentPerformance: [
          { department: "Process Safety", score: 92, projects: 4 },
          { department: "Personnel Safety", score: 87, projects: 3 },
          { department: "Emergency Preparedness", score: 95, projects: 2 },
          { department: "Environmental", score: 83, projects: 3 },
        ]
      },
      PROJECT_OWNER: {
        ...baseData,
        teamPerformance: [
          { member: "Alice Brown", tasksCompleted: 15, efficiency: 95, role: "SCRUM_MASTER" },
          { member: "Bob Wilson", tasksCompleted: 12, efficiency: 88, role: "TEAM_MEMBER" },
          { member: "Carol Davis", tasksCompleted: 18, efficiency: 92, role: "TEAM_MEMBER" },
          { member: "David Lee", tasksCompleted: 10, efficiency: 85, role: "TEAM_MEMBER" },
        ],
        projectHealth: {
          onTrack: 3,
          atRisk: 1,
          delayed: 0,
          budget: 95,
          quality: 89
        }
      },
      SCRUM_MASTER: {
        ...baseData,
        sprintMetrics: {
          currentSprint: 5,
          sprintGoalAchievement: 87,
          velocityTrend: "increasing",
          impediments: 2
        },
        teamCapacity: [
          { member: "Bob Wilson", allocated: 80, utilized: 75, availability: "Available" },
          { member: "Carol Davis", allocated: 100, utilized: 95, availability: "Busy" },
          { member: "David Lee", allocated: 60, utilized: 55, availability: "Available" },
        ],
        ceremonies: {
          dailyStandups: { completed: 20, total: 20, rate: 100 },
          sprintReviews: { completed: 4, total: 5, rate: 80 },
          retrospectives: { completed: 5, total: 5, rate: 100 }
        }
      },
      TEAM_MEMBER: {
        personalTasks: {
          assigned: 8,
          completed: 5,
          inProgress: 2,
          overdue: 1
        },
        myProjects: baseData.projects.filter(p => p.id <= 2),
        workload: {
          thisWeek: 32,
          nextWeek: 28,
          capacity: 40
        },
        achievements: [
          { title: "Safety Champion", date: "2024-01-15", type: "award" },
          { title: "Perfect Attendance", date: "2024-01-10", type: "milestone" },
          { title: "Code Quality", date: "2024-01-05", type: "achievement" }
        ]
      }
    };

    return roleSpecificData[user?.role] || roleSpecificData.TEAM_MEMBER;
  };

  const data = getDummyData();

  const renderSuperAdminReports = () => (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold">{data.systemMetrics?.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Projects</p>
                <p className="text-2xl font-bold">{data.systemMetrics?.activeProjects}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold">{data.systemMetrics?.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Risk Projects</p>
                <p className="text-2xl font-bold">{data.systemMetrics?.riskProjects}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.departmentPerformance?.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{dept.department}</span>
                    <span className="text-sm text-slate-600">{dept.score}%</span>
                  </div>
                  <Progress value={dept.score} className="h-2" />
                </div>
                <Badge variant="outline" className="ml-4">
                  {dept.projects} projects
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectOwnerReports = () => (
    <div className="space-y-6">
      {/* Project Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.projectHealth?.onTrack}</p>
              <p className="text-sm text-slate-600">On Track</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.projectHealth?.atRisk}</p>
              <p className="text-sm text-slate-600">At Risk</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.projectHealth?.delayed}</p>
              <p className="text-sm text-slate-600">Delayed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.projectHealth?.budget}%</p>
              <p className="text-sm text-slate-600">Budget</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.projectHealth?.quality}%</p>
              <p className="text-sm text-slate-600">Quality</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.teamPerformance?.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {member.member.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.member}</p>
                    <p className="text-sm text-slate-600">{member.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{member.tasksCompleted} tasks</p>
                  <p className="text-sm text-slate-600">{member.efficiency}% efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScrumMasterReports = () => (
    <div className="space-y-6">
      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">Sprint {data.sprintMetrics?.currentSprint}</p>
              <p className="text-sm text-slate-600">Current Sprint</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.sprintMetrics?.sprintGoalAchievement}%</p>
              <p className="text-sm text-slate-600">Goal Achievement</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-600 uppercase">{data.sprintMetrics?.velocityTrend}</p>
              <p className="text-sm text-slate-600">Velocity Trend</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.sprintMetrics?.impediments}</p>
              <p className="text-sm text-slate-600">Impediments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>Team Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.teamCapacity?.map((member, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{member.member}</span>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={member.availability === "Available" ? "secondary" : "destructive"}
                    >
                      {member.availability}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {member.utilized}h / {member.allocated}h
                    </span>
                  </div>
                </div>
                <Progress value={(member.utilized / member.allocated) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scrum Ceremonies */}
      <Card>
        <CardHeader>
          <CardTitle>Scrum Ceremonies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-lg font-bold">{data.ceremonies?.dailyStandups.rate}%</p>
              <p className="text-sm text-slate-600">Daily Standups</p>
              <p className="text-xs text-slate-500">
                {data.ceremonies?.dailyStandups.completed}/{data.ceremonies?.dailyStandups.total}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-lg font-bold">{data.ceremonies?.sprintReviews.rate}%</p>
              <p className="text-sm text-slate-600">Sprint Reviews</p>
              <p className="text-xs text-slate-500">
                {data.ceremonies?.sprintReviews.completed}/{data.ceremonies?.sprintReviews.total}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-lg font-bold">{data.ceremonies?.retrospectives.rate}%</p>
              <p className="text-sm text-slate-600">Retrospectives</p>
              <p className="text-xs text-slate-500">
                {data.ceremonies?.retrospectives.completed}/{data.ceremonies?.retrospectives.total}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeamMemberReports = () => (
    <div className="space-y-6">
      {/* Personal Task Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.personalTasks?.assigned}</p>
              <p className="text-sm text-slate-600">Assigned</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.personalTasks?.completed}</p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Activity className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.personalTasks?.inProgress}</p>
              <p className="text-sm text-slate-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.personalTasks?.overdue}</p>
              <p className="text-sm text-slate-600">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload */}
      <Card>
        <CardHeader>
          <CardTitle>Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">This Week</span>
              <span className="text-sm text-slate-600">{data.workload?.thisWeek}h / {data.workload?.capacity}h</span>
            </div>
            <Progress value={(data.workload?.thisWeek / data.workload?.capacity) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Week</span>
              <span className="text-sm text-slate-600">{data.workload?.nextWeek}h / {data.workload?.capacity}h</span>
            </div>
            <Progress value={(data.workload?.nextWeek / data.workload?.capacity) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* My Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.myProjects?.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-slate-600">{project.members} members</p>
                </div>
                <div className="text-right">
                  <Badge variant={project.status === "COMPLETED" ? "secondary" : "default"}>
                    {project.status}
                  </Badge>
                  <p className="text-sm text-slate-600 mt-1">{project.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.achievements?.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-slate-600">{achievement.date}</p>
                </div>
                <Badge variant="outline">{achievement.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportContent = () => {
    switch (user?.role) {
      case "SUPERADMIN":
        return renderSuperAdminReports();
      case "PROJECT_OWNER":
        return renderProjectOwnerReports();
      case "SCRUM_MASTER":
        return renderScrumMasterReports();
      case "TEAM_MEMBER":
        return renderTeamMemberReports();
      default:
        return renderTeamMemberReports();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Please log in to view reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-600">
            {user.role === "SUPERADMIN" && "System-wide analytics and performance metrics"}
            {user.role === "PROJECT_OWNER" && "Project performance and team insights"}
            {user.role === "SCRUM_MASTER" && "Sprint metrics and team capacity"}
            {user.role === "TEAM_MEMBER" && "Personal performance and project progress"}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          {(user.role === "PROJECT_OWNER" || user.role === "SCRUM_MASTER") && (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="1">Fire Safety Improvement</SelectItem>
                <SelectItem value="2">Emergency Response Training</SelectItem>
                <SelectItem value="3">Chemical Handling Protocol</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Reports Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {user.role === "SUPERADMIN" && <TabsTrigger value="system">System</TabsTrigger>}
          {(user.role === "PROJECT_OWNER" || user.role === "SCRUM_MASTER") && (
            <TabsTrigger value="performance">Performance</TabsTrigger>
          )}
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderReportContent()}
        </TabsContent>

        {user.role === "SUPERADMIN" && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Advanced system metrics and health indicators would be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Detailed performance charts and analytics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.timeline?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{item.period}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-slate-600">Planned: {item.planned}</span>
                      <span className="text-sm text-slate-600">Completed: {item.completed}</span>
                      <Badge variant={item.completed >= item.planned ? "secondary" : "destructive"}>
                        {item.completed >= item.planned ? "On Track" : "Behind"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsSection;
