import TaskAnalysisEnhanced from "./TaskAnalysisEnhanced";
// Tasks Analysis Component
const TasksAnalysis = ({ distribution, priorities, trends }) => (
  <TaskAnalysisEnhanced distribution={distribution} priorities={priorities} trends={trends} />
);
// HealthIndicators Component
const HealthIndicators = ({ velocityData, completionRate, totalTasks, completedTasks, overdueTasks }) => {
  // Velocity Trend: average velocity of last sprints
  let avgVelocity = 0;
  if (Array.isArray(velocityData) && velocityData.length > 0) {
    const lastSprints = velocityData.slice(-3); // last 3 sprints
    avgVelocity = Math.round(lastSprints.reduce((sum, d) => sum + (d.completed || 0), 0) / lastSprints.length);
  }

  // Risk Level
  let riskLabel = "Healthy";
  let riskColor = "bg-green-100 text-green-700";
  let riskIcon = "🟢";
  if (completionRate >= 80 && overdueTasks <= 2) {
    riskLabel = "Healthy";
    riskColor = "bg-green-100 text-green-700";
    riskIcon = "🟢";
  } else if ((completionRate >= 50 && completionRate < 80) || (overdueTasks > 2 && overdueTasks <= 5)) {
    riskLabel = "Caution";
    riskColor = "bg-yellow-100 text-yellow-700";
    riskIcon = "🟡";
  } else if (completionRate < 50 || overdueTasks > 5) {
    riskLabel = "At Risk";
    riskColor = "bg-red-100 text-red-700";
    riskIcon = "🔴";
  }

  // Progress bar for completion rate
  const ProgressBar = ({ value }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="h-4 rounded-full"
          style={{
            width: `${value}%`,
            background: value >= 80 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444',
            transition: 'width 0.3s',
          }}
        ></div>
      </div>
    );
  };

  // Simple line chart for velocity trend
  const SimpleLineChart = () => {
    if (!Array.isArray(velocityData) || velocityData.length === 0) return <div className="text-gray-400 text-sm">No velocity data</div>;
    const data = velocityData.slice(-5).map((d, i) => ({ name: `Sprint ${velocityData.length - 4 + i}`, value: d.completed || 0 }));
    return (
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold mb-1">Health Indicators</CardTitle>
        <div className="text-sm text-gray-500">Project Summary</div>
      </CardHeader>
      <CardContent>
        {/* Velocity Trend */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">Velocity Trend</span>
          </div>
          <div className="mb-1 text-sm text-gray-500">Average of last sprints: <span className="font-bold text-blue-600">{avgVelocity}</span></div>
          <SimpleLineChart />
        </div>
        {/* Completion Rate */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Completion Rate</span>
          </div>
          <div className="mb-1 text-sm text-gray-500">{completedTasks} / {totalTasks} tasks completed</div>
          <ProgressBar value={completionRate} />
          <div className="mt-1 text-sm font-bold text-gray-700">{completionRate}%</div>
        </div>
        {/* Risk Level */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Risk Level</span>
          </div>
          <span className={`px-6 py-2 rounded-full font-semibold text-lg flex items-center gap-2 ${riskColor}`}
            title={riskLabel}
          >
            <span className="text-2xl">{riskIcon}</span>
            {riskLabel}
          </span>
          <div className="mt-1 text-sm text-gray-500">
            Completion Rate: <span className="font-bold">{completionRate}%</span> &nbsp;|&nbsp; Overdue Tasks: <span className="font-bold">{overdueTasks}</span>
          </div>
        </div>
      </CardContent>
    </Card>
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
// TeamMemberReports.js
// Halaman report untuk Team Member, mirip ProjectOwnerReports tapi tab Performance diganti
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

const TeamMemberReports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/team-member?userId=${user.id}`);
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

  // Defensive fallback for missing/incorrect reportData fields
  const safe = (obj, key, def) => (obj && obj[key] !== undefined ? obj[key] : def);
  const metrics = safe(reportData, 'performanceMetrics', {});
  const projects = safe(reportData, 'projectOverview', []);
  const taskDistribution = Array.isArray(reportData?.taskDistribution) ? reportData.taskDistribution : [];
  const priorityBreakdown = Array.isArray(reportData?.priorityBreakdown) ? reportData.priorityBreakdown : [];
  let completionTrends = Array.isArray(reportData?.completionTrends) ? reportData.completionTrends : [];

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
          <h1 className="text-2xl font-bold text-gray-900">Team Member Dashboard</h1>
          <p className="text-gray-600">Your assigned tasks and projects overview</p>
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
          value={safe(metrics, 'totalProjects', 0)}
          subtitle={`${safe(metrics, 'activeProjects', 0)} active`}
          icon={FolderOpen}
          color="blue"
          trend={null}
        />
        <MetricCard
          title="Total Tasks"
          value={safe(metrics, 'totalTasks', 0)}
          subtitle={`${safe(metrics, 'completedTasks', 0)} completed`}
          icon={CheckCircle}
          color="green"
          trend={safe(metrics, 'completionRate', null)}
        />
        <MetricCard
          title="Completion Rate"
          value={`${safe(metrics, 'completionRate', 0)}%`}
          subtitle="Overall progress"
          icon={Target}
          color="purple"
          trend={safe(metrics, 'completionRate', 0) > 70 ? "up" : "down"}
        />
        <MetricCard
          title={<span style={{ color: safe(metrics, 'overdueTasks', 0) > 0 ? '#dc2626' : undefined }}>Overdue Tasks</span>}
          value={safe(metrics, 'overdueTasks', 0)}
          subtitle={safe(metrics, 'overdueTasks', 0) > 0 ? "Need attention" : "All on track"}
          icon={AlertTriangle}
          color={safe(metrics, 'overdueTasks', 0) > 0 ? "red" : "green"}
          trend={null}
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="tasks">My Assigned Tasks</TabsTrigger>
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
                        data={taskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage ?? 0}%`}
                      >
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color ?? '#8884d8'} />
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
                    <BarChart data={priorityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {priorityBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color ?? '#8884d8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="text-gray-500 text-center col-span-3">No projects found.</div>
            ) : (
              projects.map((project, idx) => {
                const riskLevel = "safe";
                const velocityData = Array.isArray(project.velocityData) && project.velocityData.length > 0
                  ? project.velocityData
                  : [
                      { completed: project.completedTasks },
                      { completed: Math.max(0, project.completedTasks - 1) },
                      { completed: Math.max(0, project.completedTasks - 2) }
                    ];
                return (
                  <Card key={project.id || idx}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                      <div className="text-sm text-gray-500">Scrum Master: <span className="font-semibold">{project.scrumMasterName}</span></div>
                    </CardHeader>
                    <CardContent>
                      <HealthIndicators
                        velocityData={velocityData}
                        completionRate={project.completionRate}
                        totalTasks={project.totalTasks}
                        completedTasks={project.completedTasks}
                        overdueTasks={project.overdueTasks}
                        riskLevel={riskLevel}
                      />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TasksAnalysis 
            distribution={taskDistribution}
            priorities={priorityBreakdown}
            trends={completionTrends}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// MetricCard, HealthIndicators, etc. can be copied from ProjectOwnerReports.js
// ...existing code...

export default TeamMemberReports;
