"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Users, FolderOpen, 
  CheckCircle, Clock, AlertTriangle, BarChart3,
  Calendar, Target, Activity, Award,
  RefreshCw, Download, Filter
} from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamic chart imports to avoid SSR issues
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const ProjectOwnerReports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/project-owner?userId=${user.id}`);
      const result = await response.json();
      
      if (response.ok) {
        setReportData(result.data);
      } else {
        console.error('Failed to fetch report data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">Unable to load report data.</p>
        <Button onClick={fetchReportData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Owner Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your projects and team performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={reportData.performanceMetrics.totalProjects}
          subtitle={`${reportData.performanceMetrics.activeProjects} active`}
          icon={FolderOpen}
          color="blue"
          trend={null}
        />
        <MetricCard
          title="Total Tasks"
          value={reportData.performanceMetrics.totalTasks}
          subtitle={`${reportData.performanceMetrics.completedTasks} completed`}
          icon={CheckCircle}
          color="green"
          trend={reportData.performanceMetrics.completionRate}
        />
        <MetricCard
          title="Completion Rate"
          value={`${reportData.performanceMetrics.completionRate}%`}
          subtitle="Overall progress"
          icon={Target}
          color="purple"
          trend={reportData.performanceMetrics.completionRate > 70 ? "up" : "down"}
        />
        <MetricCard
          title="Overdue Tasks"
          value={reportData.performanceMetrics.overdueTasks}
          subtitle={reportData.performanceMetrics.overdueTasks > 0 ? "Need attention" : "All on track"}
          icon={AlertTriangle}
          color={reportData.performanceMetrics.overdueTasks > 0 ? "red" : "green"}
          trend={null}
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.taskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {reportData.taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Priority Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Task Priority Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.priorityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {reportData.priorityBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completion Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Task Completion Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.completionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsOverview projects={reportData.projectOverview} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TasksAnalysis 
            distribution={reportData.taskDistribution}
            priorities={reportData.priorityBreakdown}
            trends={reportData.completionTrends}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <TeamPerformanceAnalysis 
            productivity={reportData.teamProductivity}
            metrics={reportData.performanceMetrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {typeof trend === 'number' ? `${trend}%` : 'Trending'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Projects Overview Component
const ProjectsOverview = ({ projects }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
    <div className="grid gap-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityVariant(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{project.department}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{project.totalTasks} tasks</span>
                  <span>•</span>
                  <span>{project.completedTasks} completed</span>
                  <span>•</span>
                  <span>{project.inProgressTasks} in progress</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {project.completionRate}%
                </div>
                <Progress value={project.completionRate} className="w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Tasks Analysis Component
const TasksAnalysis = ({ distribution, priorities, trends }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Task Analysis</h3>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorities.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Team Performance Analysis Component
const TeamPerformanceAnalysis = ({ productivity, metrics }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{metrics.completedStoryPoints}</p>
          <p className="text-sm text-gray-600">Story Points Completed</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{metrics.avgCompletionTime}</p>
          <p className="text-sm text-gray-600">Avg. Days to Complete</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{metrics.totalStoryPoints}</p>
          <p className="text-sm text-gray-600">Total Story Points</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Project Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productivity.map((project, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{project.projectName}</h4>
                <p className="text-sm text-gray-600">{project.totalTasks} total tasks</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{project.completionRate}%</div>
                <Progress value={project.completionRate} className="w-24 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Helper functions
const getStatusVariant = (status) => {
  const variants = {
    PLANNING: 'secondary',
    ACTIVE: 'default',
    ON_HOLD: 'destructive',
    COMPLETED: 'default',
    CANCELLED: 'outline'
  };
  return variants[status] || 'outline';
};

const getPriorityVariant = (priority) => {
  const variants = {
    LOW: 'outline',
    MEDIUM: 'secondary',
    HIGH: 'destructive',
    CRITICAL: 'destructive'
  };
  return variants[priority] || 'outline';
};

export default ProjectOwnerReports;
