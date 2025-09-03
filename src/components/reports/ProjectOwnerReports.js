"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import SprintProjectsReport from "@/components/reports/SprintProjectsReport";
import { TrendingUp, TrendingDown, Users, FolderOpen, CheckCircle, Clock, AlertTriangle, BarChart3, Calendar, Target, Activity, Award, RefreshCw, Download, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import TaskAnalysisEnhanced from "./TaskAnalysisEnhanced";
import Image from "next/image";

// Dynamic chart imports to avoid SSR issues
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });

const ProjectOwnerReports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSprintProjectId, setSelectedSprintProjectId] = useState("");

  const getTopCompleters = (tasks = []) => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assignee) return;
      const id = t.assignee.id;
      if (!map[id]) map[id] = { id, name: t.assignee.name || t.assignee.email, avatarUrl: t.assignee.avatarUrl, doneCount: 0 };
      if (t.status === "DONE") map[id].doneCount++;
    });
    return Object.values(map)
      .sort((a, b) => b.doneCount - a.doneCount)
      .slice(0, 3);
  };

  const getTopAssigned = (tasks = []) => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assignee) return;
      const id = t.assignee.id;
      if (!map[id]) map[id] = { id, name: t.assignee.name || t.assignee.email, avatarUrl: t.assignee.avatarUrl, assignedCount: 0 };
      map[id].assignedCount++;
    });
    return Object.values(map)
      .sort((a, b) => b.assignedCount - a.assignedCount)
      .slice(0, 3);
  };

  const getTopFastFinishers = (tasks = []) => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assignee || t.status !== "DONE" || !t.completedAt) return;
      const id = t.assignee.id;
      if (!map[id]) map[id] = { id, name: t.assignee.name || t.assignee.email, avatarUrl: t.assignee.avatarUrl, totalDays: 0, count: 0 };
      // Use createdAt if available, else fallback to dueDate or skip
      let start = t.createdAt ? new Date(t.createdAt) : t.dueDate ? new Date(t.dueDate) : null;
      let end = new Date(t.completedAt);
      if (!start) return;
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      map[id].totalDays += days;
      map[id].count++;
    });
    return Object.values(map)
      .filter((m) => m.count > 0)
      .map((m) => ({ ...m, avgDays: Math.round(m.totalDays / m.count) }))
      .sort((a, b) => a.avgDays - b.avgDays)
      .slice(0, 3);
  };

  const getTopCollaborators = (tasks = []) => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assignee || !Array.isArray(t.activityLog)) return;
      const id = t.assignee.id;
      if (!map[id]) map[id] = { id, name: t.assignee.name || t.assignee.email, avatarUrl: t.assignee.avatarUrl, activityCount: 0 };
      map[id].activityCount += t.activityLog.length;
    });
    return Object.values(map)
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 3);
  };

  const getTopConsistency = (tasks = []) => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assignee || t.status !== "DONE" || !t.completedAt) return;
      const id = t.assignee.id;
      if (!map[id]) map[id] = { id, name: t.assignee.name || t.assignee.email, avatarUrl: t.assignee.avatarUrl, weeks: {} };
      const week = getWeekOfYear(new Date(t.completedAt));
      map[id].weeks[week] = true;
    });
    return Object.values(map)
      .map((m) => ({ ...m, weeksActive: Object.keys(m.weeks).length }))
      .sort((a, b) => b.weeksActive - a.weeksActive)
      .slice(0, 3);
  };

  const getWeekOfYear = (date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  };

  const getTopHardWorkers = (tasks = []) => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assignee) return;
      const id = t.assignee.id;
      if (!map[id]) map[id] = { id, name: t.assignee.name || t.assignee.email, avatarUrl: t.assignee.avatarUrl, inProgressCount: 0, doneCount: 0 };
      if (t.status === "IN_PROGRESS") map[id].inProgressCount++;
      if (t.status === "DONE") map[id].doneCount++;
    });
    return Object.values(map)
      .filter((m) => m.inProgressCount > 0 || m.doneCount > 0)
      .sort((a, b) => b.inProgressCount + b.doneCount - (a.inProgressCount + a.doneCount))
      .slice(0, 3);
  };

  function getRiskLevel(completionRate, deadline) {
    let daysLeft = null;
    if (deadline) {
      const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;
      const now = new Date();
      daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    }
    if (completionRate >= 90 && daysLeft !== null && daysLeft > 7) {
      return "safe";
    }
    if ((completionRate >= 70 && completionRate < 90) || (daysLeft !== null && daysLeft <= 7)) {
      return "caution";
    }
    if (completionRate >= 50 && completionRate < 70 && daysLeft !== null && daysLeft <= 7) {
      return "warning";
    }
    if (completionRate < 50 && daysLeft !== null && (daysLeft <= 3 || daysLeft < 0)) {
      return "critical";
    }
    return "safe";
  }

  const fetchReportData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/reports/project-owner?userId=${user.id}`);
      const result = await response.json();

      if (response.ok) {
        setReportData(result.data);
      } else {
        console.error("Failed to fetch report data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  // ...existing code...

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
  const metrics = safe(reportData, "performanceMetrics", {});
  const projects = safe(reportData, "projectOverview", []);
  const taskDistribution = Array.isArray(reportData?.taskDistribution) ? reportData.taskDistribution : [];
  const priorityBreakdown = Array.isArray(reportData?.priorityBreakdown) ? reportData.priorityBreakdown : [];
  // Integrasi data trend of work done (DONE only)
  let completionTrends = Array.isArray(reportData?.completionTrends) ? reportData.completionTrends : [];
  // Filter hanya yang status DONE jika data berupa array task
  if (Array.isArray(reportData?.tasks)) {
    // Asumsikan setiap task punya field 'completedAt' (tanggal selesai)
    // Kelompokkan jumlah task DONE per hari
    const doneTasks = reportData.tasks.filter((t) => t.status === "DONE" && t.completedAt);
    const trendMap = {};
    doneTasks.forEach((task) => {
      const dateStr = new Date(task.completedAt).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });
    // Ambil 7 hari terakhir
    const today = new Date();
    completionTrends = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
      return {
        day: dateStr,
        done: trendMap[dateStr] || 0,
      };
    });
  } else if (!completionTrends || completionTrends.length === 0) {
    // Fallback dummy data jika tidak ada data
    const today = new Date();
    completionTrends = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
        done: Math.floor(Math.random() * 10) + 1,
      };
    });
  }

  // Patch window.reportData for TaskAnalysisEnhanced
  if (typeof window !== "undefined") {
    window.reportData = window.reportData || {};
    // Fallback dummy tasks if allTasks is empty for demo/testing
    if (Array.isArray(reportData?.allTasks) && reportData.allTasks.length > 0) {
      window.reportData.tasks = reportData.allTasks;
    } else {
      window.reportData.tasks = [
        {
          id: "1",
          title: "Demo Task 1",
          status: "DONE",
          assignee: { id: "a1", name: "Alice", avatarUrl: "" },
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          project: { name: "Demo Project" },
        },
        {
          id: "2",
          title: "Demo Task 2",
          status: "IN_PROGRESS",
          assignee: { id: "a2", name: "Bob", avatarUrl: "" },
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          project: { name: "Demo Project" },
        },
        {
          id: "3",
          title: "Demo Task 3",
          status: "TODO",
          assignee: { id: "a3", name: "Charlie", avatarUrl: "" },
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          project: { name: "Demo Project" },
        },
        {
          id: "4",
          title: "Demo Task 4",
          status: "OVERDUE",
          assignee: { id: "a4", name: "Diana", avatarUrl: "" },
          dueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
          project: { name: "Demo Project" },
        },
      ];
    }
  }

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
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Owner Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your projects and team performance</p>
        </div> */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
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
        <MetricCard title="Total Projects" value={safe(metrics, "totalProjects", 0)} subtitle={`${safe(metrics, "activeProjects", 0)} active`} icon={FolderOpen} color="blue" trend={null} />
        <MetricCard title="Total Tasks" value={safe(metrics, "totalTasks", 0)} subtitle={`${safe(metrics, "completedTasks", 0)} completed`} icon={CheckCircle} color="green" trend={safe(metrics, "completionRate", null)} />
        <MetricCard title="Completion Rate" value={`${safe(metrics, "completionRate", 0)}%`} subtitle="Overall progress" icon={Target} color="purple" trend={safe(metrics, "completionRate", 0) > 70 ? "up" : "down"} />
        <MetricCard
          title={<span style={{ color: safe(metrics, "overdueTasks", 0) > 0 ? "#dc2626" : undefined }}>Overdue Tasks</span>}
          value={safe(metrics, "overdueTasks", 0)}
          subtitle={safe(metrics, "overdueTasks", 0) > 0 ? "Need attention" : "All on track"}
          icon={AlertTriangle}
          color={safe(metrics, "overdueTasks", 0) > 0 ? "red" : "green"}
          trend={null}
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
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
                      <Pie data={taskDistribution} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percentage }) => `${name}: ${percentage ?? 0}%`}>
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color ?? "#8884d8"} />
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
                          <Cell key={`cell-${index}`} fill={entry.color ?? "#8884d8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Velocity Chart with Average Line */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Velocity Chart (Active vs Release)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                {(() => {
                  // Generate 5 tahun ke depan, per quarter
                  const currentYear = new Date().getFullYear();
                  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
                  const quarters = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"];

                  // Ambil data project dari reportData.projectOverview
                  const projects = Array.isArray(reportData?.projectOverview) ? reportData.projectOverview : [];

                  // Buat data chart: untuk setiap tahun dan quarter, hitung jumlah project Active dan Release
                  const chartData = [];
                  years.forEach((year) => {
                    quarters.forEach((quarter, qIdx) => {
                      // Tentukan range bulan untuk quarter
                      const startMonth = qIdx * 3;
                      const endMonth = startMonth + 2;
                      // Filter project yang aktif pada quarter ini
                      const activeCount = projects.filter((p) => {
                        if (!p.startDate) return false;
                        const start = new Date(p.startDate);
                        return start.getFullYear() === year && start.getMonth() >= startMonth && start.getMonth() <= endMonth && p.status === "ACTIVE";
                      }).length;
                      // Filter project yang release pada quarter ini
                      const releaseCount = projects.filter((p) => {
                        if (!p.releaseDate) return false;
                        const release = new Date(p.releaseDate);
                        return release.getFullYear() === year && release.getMonth() >= startMonth && release.getMonth() <= endMonth && (p.status === "COMPLETED" || p.status === "RELEASE");
                      }).length;
                      chartData.push({
                        year,
                        quarter,
                        label: `${quarter} ${year}`,
                        active: activeCount,
                        release: releaseCount,
                      });
                    });
                  });

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" angle={-30} interval={0} height={80} tick={{ fontSize: 14 }} />
                        <YAxis label={{ value: "Jumlah Project", angle: -90, position: "insideLeft" }} allowDecimals={false} tick={{ fontSize: 14 }} domain={[1, 25]} ticks={[1, 5, 10, 15, 20, 25]} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 16 }} />
                        <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} name="Active" />
                        <Line type="monotone" dataKey="release" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} name="Release" />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="text-gray-500 text-center col-span-3">No projects found.</div>
            ) : (
              projects.map((project, idx) => {
                // Ambil semua data langsung dari project hasil API/database
                const riskLevel = getRiskLevel(project.completionRate, project.deadline);
                // Dummy velocityData if not present
                const velocityData =
                  Array.isArray(project.velocityData) && project.velocityData.length > 0
                    ? project.velocityData
                    : [{ completed: project.completedTasks }, { completed: Math.max(0, project.completedTasks - 1) }, { completed: Math.max(0, project.completedTasks - 2) }];
                return (
                  <Card key={project.id || idx}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                      <div className="text-sm text-gray-500">
                        Scrum Master: <span className="font-semibold">{project.scrumMasterName}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <HealthIndicators velocityData={velocityData} completionRate={project.completionRate} totalTasks={project.totalTasks} completedTasks={project.completedTasks} overdueTasks={project.overdueTasks} riskLevel={riskLevel} />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TasksAnalysis distribution={taskDistribution} priorities={priorityBreakdown} trends={completionTrends} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Top 3 Completers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Top 3 Completers</span>
                </CardTitle>
                <div className="text-sm text-gray-500">Members who completed the most tasks (Done)</div>
              </CardHeader>
              <CardContent>
                {getTopCompleters(reportData?.allTasks).length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">No data available.</div>
                ) : (
                  <div className="space-y-2">
                    {getTopCompleters(reportData?.allTasks).map((m, idx) => (
                      <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${idx === 0 ? "bg-green-50 border-green-300" : idx === 1 ? "bg-green-100 border-green-200" : "bg-white border-gray-200"}`}>
                        <span className="text-2xl font-bold">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                        {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border" />}
                        <span className="font-semibold text-lg">{m.name}</span>
                        <span className="ml-auto text-green-700 font-semibold">{m.doneCount} Done</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Top 3 Most Assigned */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Top 3 Most Assigned</span>
                </CardTitle>
                <div className="text-sm text-gray-500">Members who were assigned the most tasks</div>
              </CardHeader>
              <CardContent>
                {getTopAssigned(reportData?.allTasks).length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">No data available.</div>
                ) : (
                  <div className="space-y-2">
                    {getTopAssigned(reportData?.allTasks).map((m, idx) => (
                      <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${idx === 0 ? "bg-blue-50 border-blue-300" : idx === 1 ? "bg-blue-100 border-blue-200" : "bg-white border-gray-200"}`}>
                        <span className="text-2xl font-bold">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                        {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border" />}
                        <span className="font-semibold text-lg">{m.name}</span>
                        <span className="ml-auto text-blue-700 font-semibold">{m.assignedCount} Assigned</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Top 3 Fast Finishers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Top 3 Fast Finishers</span>
                </CardTitle>
                <div className="text-sm text-gray-500">Members with the fastest average completion time</div>
              </CardHeader>
              <CardContent>
                {getTopFastFinishers(reportData?.allTasks).length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">No data available.</div>
                ) : (
                  <div className="space-y-2">
                    {getTopFastFinishers(reportData?.allTasks).map((m, idx) => (
                      <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${idx === 0 ? "bg-purple-50 border-purple-300" : idx === 1 ? "bg-purple-100 border-purple-200" : "bg-white border-gray-200"}`}>
                        <span className="text-2xl font-bold">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                        {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border" />}
                        <span className="font-semibold text-lg">{m.name}</span>
                        <span className="ml-auto text-purple-700 font-semibold">{m.avgDays} days</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Top 3 Active Collaborators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Top 3 Active Collaborators</span>
                </CardTitle>
                <div className="text-sm text-gray-500">Members with the most comments or updates on tasks</div>
              </CardHeader>
              <CardContent>
                {getTopCollaborators(reportData?.allTasks).length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">No data available.</div>
                ) : (
                  <div className="space-y-2">
                    {getTopCollaborators(reportData?.allTasks).map((m, idx) => (
                      <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${idx === 0 ? "bg-pink-50 border-pink-300" : idx === 1 ? "bg-pink-100 border-pink-200" : "bg-white border-gray-200"}`}>
                        <span className="text-2xl font-bold">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                        {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border" />}
                        <span className="font-semibold text-lg">{m.name}</span>
                        <span className="ml-auto text-pink-700 font-semibold">{m.activityCount} activities</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Top 3 Consistency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Top 3 Consistency</span>
                </CardTitle>
                <div className="text-sm text-gray-500">Members who consistently completed tasks every week</div>
              </CardHeader>
              <CardContent>
                {getTopConsistency(reportData?.allTasks).length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">No data available.</div>
                ) : (
                  <div className="space-y-2">
                    {getTopConsistency(reportData?.allTasks).map((m, idx) => (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${idx === 0 ? "bg-yellow-50 border-yellow-300" : idx === 1 ? "bg-yellow-100 border-yellow-200" : "bg-white border-gray-200"}`}
                        style={{ minHeight: "56px" }}
                      >
                        <span className="text-2xl font-bold flex items-center justify-center" style={{ width: "2.5rem", height: "2.5rem" }}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                        </span>
                        {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border" />}
                        <span className="font-semibold text-lg">{m.name}</span>
                        <span className="ml-auto text-yellow-700 font-semibold">{m.weeksActive} active weeks</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Top 3 Hard Workers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Top 3 Hard Workers</span>
                </CardTitle>
                <div className="text-sm text-gray-500">Members with the most &quot;In Progress&quot; tasks and still completed them</div>
              </CardHeader>
              <CardContent>
                {getTopHardWorkers(reportData?.allTasks).length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">No data available.</div>
                ) : (
                  <div className="space-y-2">
                    {getTopHardWorkers(reportData?.allTasks).map((m, idx) => (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${idx === 0 ? "bg-orange-50 border-orange-300" : idx === 1 ? "bg-orange-100 border-orange-200" : "bg-white border-gray-200"}`}
                        style={{ minHeight: "56px" }}
                      >
                        <span className="text-2xl font-bold flex items-center justify-center" style={{ width: "2.5rem", height: "2.5rem" }}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                        </span>
                        {m.avatarUrl && <Image src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border" />}
                        <span className="font-semibold text-lg">{m.name}</span>
                        <span className="ml-auto text-orange-700 font-semibold">
                          {m.inProgressCount} In Progress, {m.doneCount} Done
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-6">
          <SprintProjectsReport projectOwnerId={user.id}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
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
            {trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            <span className={`text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>{typeof trend === "number" ? `${trend}%` : "Trending"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Projects Overview Component
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
            background: value >= 80 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444",
            transition: "width 0.3s",
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
          <div className="mb-1 text-sm text-gray-500">
            Average of last sprints: <span className="font-bold text-blue-600">{avgVelocity}</span>
          </div>
          <SimpleLineChart />
        </div>
        {/* Completion Rate */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Completion Rate</span>
          </div>
          <div className="mb-1 text-sm text-gray-500">
            {completedTasks} / {totalTasks} tasks completed
          </div>
          <ProgressBar value={completionRate} />
          <div className="mt-1 text-sm font-bold text-gray-700">{completionRate}%</div>
        </div>
        {/* Risk Level */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Risk Level</span>
          </div>
          <span className={`px-6 py-2 rounded-full font-semibold text-lg flex items-center gap-2 ${riskColor}`} title={riskLabel}>
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

// Tasks Analysis Component
const TasksAnalysis = ({ distribution, priorities, trends }) => <TaskAnalysisEnhanced distribution={distribution} priorities={priorities} trends={trends} />;

// Komponen untuk menampilkan task hasil filter
const FilteredTaskList = () => {
  const [tasks, setTasks] = React.useState([]);
  const [filter, setFilter] = React.useState(window.taskStatusFilter || "all");

  React.useEffect(() => {
    const updateFilter = () => setFilter(window.taskStatusFilter || "all");
    window.addEventListener("taskStatusFilterChange", updateFilter);
    return () => window.removeEventListener("taskStatusFilterChange", updateFilter);
  }, []);

  React.useEffect(() => {
    // Ambil data task dari window.reportData jika tersedia
    if (window.reportData && window.reportData.tasks) {
      let filtered = window.reportData.tasks;
      if (filter === "TODO") filtered = filtered.filter((t) => t.status === "TODO");
      else if (filter === "IN_PROGRESS") filtered = filtered.filter((t) => t.status === "IN_PROGRESS");
      else if (filter === "DONE") filtered = filtered.filter((t) => t.status === "DONE");
      else if (filter === "OVERDUE") filtered = filtered.filter((t) => t.isOverdue);
      setTasks(filtered);
    }
  }, [filter]);

  if (!tasks.length) return <div className="text-gray-500 text-sm">No tasks found for this filter.</div>;

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="border rounded p-2 flex justify-between items-center">
          <span>{task.title}</span>
          <Badge variant={task.status === "DONE" ? "success" : task.status === "IN_PROGRESS" ? "default" : task.status === "TODO" ? "outline" : "destructive"}>{task.status === "OVERDUE" ? "Overdue" : task.status.replace("_", " ")}</Badge>
        </li>
      ))}
    </ul>
  );
};

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
    PLANNING: "secondary",
    ACTIVE: "default",
    ON_HOLD: "destructive",
    COMPLETED: "default",
    CANCELLED: "outline",
  };
  return variants[status] || "outline";
};

const getPriorityVariant = (priority) => {
  const variants = {
    LOW: "outline",
    MEDIUM: "secondary",
    HIGH: "destructive",
    CRITICAL: "destructive",
  };
  return variants[priority] || "outline";
};

export default ProjectOwnerReports;
