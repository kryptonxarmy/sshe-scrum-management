"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

// Gantt Chart Component
const GanttChart = ({ tasks = [], timeframe = "month" }) => {
  // Calculate the date range for the chart
  const today = dayjs();
  const startDate = dayjs().subtract(2, 'weeks');
  const endDate = dayjs().add(4, 'weeks');
  
  // Generate date columns for the header
  const generateDateColumns = () => {
    const columns = [];
    let currentDate = startDate;
    
    while (currentDate.isSameOrBefore(endDate)) {
      columns.push({
        date: currentDate.format('YYYY-MM-DD'),
        display: currentDate.format('MM/DD'),
        isToday: currentDate.isSame(today, 'day'),
        isWeekend: currentDate.day() === 0 || currentDate.day() === 6
      });
      currentDate = currentDate.add(1, 'day');
    }
    
    return columns;
  };

  const dateColumns = generateDateColumns();
  const totalDays = dateColumns.length;

  // Calculate task bar position and width
  const getTaskBarStyle = (task) => {
    const taskStart = dayjs(task.start);
    const taskEnd = dayjs(task.end);
    
    // Calculate position from start of chart
    const startPosition = taskStart.diff(startDate, 'days');
    const duration = taskEnd.diff(taskStart, 'days') + 1;
    
    // Convert to percentage
    const left = Math.max(0, (startPosition / totalDays) * 100);
    const width = Math.min(100 - left, (duration / totalDays) * 100);
    
    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      'TODO': 'bg-gray-400',
      'IN_PROGRESS': 'bg-blue-500',
      'COMPLETED': 'bg-green-500',
      'OVERDUE': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': 'border-l-green-400',
      'MEDIUM': 'border-l-yellow-400',
      'HIGH': 'border-l-orange-400',
      'CRITICAL': 'border-l-red-500',
    };
    return colors[priority] || 'border-l-gray-400';
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Task Timeline</h3>
          <div className="text-sm text-slate-600">
            {startDate.format('MMM DD')} - {endDate.format('MMM DD, YYYY')}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Date Header */}
          <div className="flex border-b bg-slate-50">
            <div className="w-64 p-2 border-r bg-white font-medium text-sm">Task Name</div>
            <div className="flex-1 flex">
              {dateColumns.map((col, index) => (
                <div
                  key={index}
                  className={`flex-1 p-1 text-xs text-center border-r last:border-r-0 ${
                    col.isToday ? 'bg-blue-100 text-blue-800 font-medium' : ''
                  } ${col.isWeekend ? 'bg-gray-100' : ''}`}
                  style={{ minWidth: '30px' }}
                >
                  {col.display}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y">
            {tasks.map((task, taskIndex) => (
              <div key={task.id} className="flex hover:bg-slate-50">
                {/* Task Info */}
                <div className={`w-64 p-3 border-r border-l-4 ${getPriorityColor(task.priority)}`}>
                  <div className="text-sm font-medium text-slate-800 mb-1">{task.task}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Badge variant={
                      task.status === "COMPLETED" ? "secondary" :
                      task.status === "IN_PROGRESS" ? "default" :
                      task.status === "OVERDUE" ? "destructive" : "outline"
                    } className="text-xs px-1 py-0">
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <span>{task.progress}%</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 relative p-2" style={{ minHeight: '60px' }}>
                  {/* Background grid */}
                  <div className="absolute inset-0 flex">
                    {dateColumns.map((col, index) => (
                      <div
                        key={index}
                        className={`flex-1 border-r last:border-r-0 ${
                          col.isToday ? 'bg-blue-50' : ''
                        } ${col.isWeekend ? 'bg-gray-50' : ''}`}
                      />
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded ${getStatusColor(task.status)} 
                      opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={getTaskBarStyle(task)}
                    title={`${task.task}: ${dayjs(task.start).format('MMM DD')} - ${dayjs(task.end).format('MMM DD')}`}
                  >
                    {/* Progress overlay */}
                    <div
                      className="h-full bg-white bg-opacity-30 rounded"
                      style={{ width: `${task.progress}%` }}
                    />
                    
                    {/* Task label */}
                    <div className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate">
                      {task.progress}%
                    </div>
                  </div>

                  {/* Today indicator */}
                  {dateColumns.some(col => col.isToday) && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{
                        left: `${(today.diff(startDate, 'days') / totalDays) * 100}%`
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-3 bg-red-500"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          overdue: 1,
          todo: 1
        },
        myAssignedTasks: [
          { id: 1, title: "Update Safety Protocol Document", project: "Fire Safety Improvement", priority: "HIGH", status: "IN_PROGRESS", dueDate: dayjs().add(2, 'days').format('YYYY-MM-DD'), estimatedHours: 8, completedHours: 4 },
          { id: 2, title: "Conduct Safety Training Session", project: "Emergency Response Training", priority: "MEDIUM", status: "TODO", dueDate: dayjs().add(7, 'days').format('YYYY-MM-DD'), estimatedHours: 6, completedHours: 0 },
          { id: 3, title: "Review Chemical Handling Guidelines", project: "Chemical Handling Protocol", priority: "LOW", status: "IN_PROGRESS", dueDate: dayjs().add(15, 'days').format('YYYY-MM-DD'), estimatedHours: 4, completedHours: 2 },
          { id: 4, title: "Equipment Inspection Report", project: "Equipment Maintenance", priority: "HIGH", status: "TODO", dueDate: dayjs().add(4, 'days').format('YYYY-MM-DD'), estimatedHours: 5, completedHours: 0 },
          { id: 5, title: "Safety Incident Analysis", project: "Fire Safety Improvement", priority: "CRITICAL", status: "OVERDUE", dueDate: dayjs().subtract(2, 'days').format('YYYY-MM-DD'), estimatedHours: 10, completedHours: 3 }
        ],
        myProjects: [
          { 
            id: 1, 
            name: "Fire Safety Improvement", 
            status: "ACTIVE", 
            progress: 75, 
            members: 5,
            startDate: dayjs().subtract(3, 'weeks').format('YYYY-MM-DD'),
            endDate: dayjs().add(8, 'weeks').format('YYYY-MM-DD'),
            myTasks: 3,
            completedTasks: 1
          },
          { 
            id: 2, 
            name: "Emergency Response Training", 
            status: "ACTIVE", 
            progress: 60, 
            members: 8,
            startDate: dayjs().subtract(2, 'weeks').format('YYYY-MM-DD'),
            endDate: dayjs().add(10, 'weeks').format('YYYY-MM-DD'),
            myTasks: 2,
            completedTasks: 1
          },
          { 
            id: 3, 
            name: "Chemical Handling Protocol", 
            status: "PLANNING", 
            progress: 25, 
            members: 3,
            startDate: "2024-02-01",
            endDate: dayjs().add(16, 'weeks').format('YYYY-MM-DD'),
            myTasks: 2,
            completedTasks: 0
          }
        ],
        workload: {
          thisWeek: 32,
          nextWeek: 28,
          capacity: 40,
          weeklyBreakdown: [
            { week: "Week 1", planned: 35, actual: 32 },
            { week: "Week 2", planned: 40, actual: 38 },
            { week: "Week 3", planned: 30, actual: 35 },
            { week: "Week 4", planned: 38, actual: 40 }
          ]
        },
        timeline: [
          { 
            id: 1,
            task: "Safety Protocol Document", 
            start: dayjs().subtract(5, 'days').format('YYYY-MM-DD'), 
            end: dayjs().add(2, 'days').format('YYYY-MM-DD'), 
            progress: 50, 
            status: "IN_PROGRESS",
            priority: "HIGH",
            assignee: "You"
          },
          { 
            id: 2,
            task: "Safety Training Session", 
            start: dayjs().add(3, 'days').format('YYYY-MM-DD'), 
            end: dayjs().add(7, 'days').format('YYYY-MM-DD'), 
            progress: 0, 
            status: "TODO",
            priority: "MEDIUM",
            assignee: "You"
          },
          { 
            id: 3,
            task: "Chemical Guidelines Review", 
            start: dayjs().add(8, 'days').format('YYYY-MM-DD'), 
            end: dayjs().add(15, 'days').format('YYYY-MM-DD'), 
            progress: 25, 
            status: "IN_PROGRESS",
            priority: "LOW",
            assignee: "You"
          },
          { 
            id: 4,
            task: "Equipment Inspection", 
            start: dayjs().add(1, 'days').format('YYYY-MM-DD'), 
            end: dayjs().add(4, 'days').format('YYYY-MM-DD'), 
            progress: 0, 
            status: "TODO",
            priority: "HIGH",
            assignee: "You"
          },
          { 
            id: 5,
            task: "Safety Incident Analysis", 
            start: dayjs().subtract(10, 'days').format('YYYY-MM-DD'), 
            end: dayjs().subtract(2, 'days').format('YYYY-MM-DD'), 
            progress: 75, 
            status: "OVERDUE",
            priority: "CRITICAL",
            assignee: "You"
          }
        ],
        achievements: [
          { title: "Safety Champion", date: dayjs().subtract(1, 'week').format('YYYY-MM-DD'), type: "award", description: "Completed 5 safety training modules" },
          { title: "Perfect Attendance", date: dayjs().subtract(2, 'weeks').format('YYYY-MM-DD'), type: "milestone", description: "100% attendance for Q1" },
          { title: "Code Quality", date: dayjs().subtract(3, 'weeks').format('YYYY-MM-DD'), type: "achievement", description: "Zero defects in last 3 submissions" }
        ],
        productivity: {
          completionRate: 85,
          averageTaskTime: 6.5,
          onTimeDelivery: 92,
          qualityScore: 94
        }
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
      {/* Personal Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">My Personal Dashboard</h2>
        <p className="text-blue-100">Welcome back, {user?.name}! Here&apos;s your current work summary.</p>
      </div>

      {/* Task Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.personalTasks?.assigned}</p>
              <p className="text-sm text-slate-600">Total Assigned</p>
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
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.personalTasks?.todo}</p>
              <p className="text-sm text-slate-600">To Do</p>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* My Assigned Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                My Assigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.myAssignedTasks?.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant={
                        task.status === "COMPLETED" ? "secondary" :
                        task.status === "IN_PROGRESS" ? "default" :
                        task.status === "OVERDUE" ? "destructive" : "outline"
                      }>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p><strong>Project:</strong> {task.project}</p>
                      <p><strong>Due:</strong> {dayjs(task.dueDate).format('MMM DD, YYYY')}</p>
                      <p><strong>Progress:</strong> {task.completedHours}h / {task.estimatedHours}h</p>
                    </div>
                    <div className="mt-2">
                      <Progress value={(task.completedHours / task.estimatedHours) * 100} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workload Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workload Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">This Week</span>
                  <span className="text-sm text-slate-600">{data.workload?.thisWeek}h / {data.workload?.capacity}h</span>
                </div>
                <Progress value={(data.workload?.thisWeek / data.workload?.capacity) * 100} className="h-3" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Week</span>
                  <span className="text-sm text-slate-600">{data.workload?.nextWeek}h / {data.workload?.capacity}h</span>
                </div>
                <Progress value={(data.workload?.nextWeek / data.workload?.capacity) * 100} className="h-3" />

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-3">Weekly Breakdown</h4>
                  <div className="space-y-2">
                    {data.workload?.weeklyBreakdown?.map((week, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>{week.week}</span>
                        <span className="text-slate-600">Planned: {week.planned}h | Actual: {week.actual}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Task Timeline (Gantt Chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Task Timeline (Gantt Chart)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <GanttChart tasks={data.timeline} timeframe="month" />
            </CardContent>
          </Card>

          {/* My Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.myProjects?.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={project.status === "COMPLETED" ? "secondary" : "default"}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>My Tasks: {project.completedTasks}/{project.myTasks}</span>
                        <span>{project.progress}% Complete</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="text-xs text-slate-600">
                        {dayjs(project.startDate).format('MMM DD')} - {dayjs(project.endDate).format('MMM DD, YYYY')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{data.productivity?.completionRate}%</p>
                <p className="text-sm text-slate-600">Completion Rate</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{data.productivity?.onTimeDelivery}%</p>
                <p className="text-sm text-slate-600">On-time Delivery</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{data.productivity?.averageTaskTime}h</p>
                <p className="text-sm text-slate-600">Avg Task Time</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{data.productivity?.qualityScore}%</p>
                <p className="text-sm text-slate-600">Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.achievements?.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {achievement.type === "award" && <Award className="h-5 w-5 text-yellow-500" />}
                    {achievement.type === "milestone" && <Target className="h-5 w-5 text-blue-500" />}
                    {achievement.type === "achievement" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-slate-600 mb-1">{achievement.description}</p>
                    <p className="text-xs text-slate-500">{dayjs(achievement.date).format('MMM DD, YYYY')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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
