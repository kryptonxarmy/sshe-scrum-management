"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Star, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from 'next/dynamic';

// Dynamic import for recharts to avoid SSR issues
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

// Assignee Performance Component
const AssigneePerformance = () => {
  const { user } = useAuth();
  const [assigneeData, setAssigneeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssigneePerformance = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/reports/project-owner?userId=${user.id}`);
      const data = await response.json();
      
      if (data.data?.assigneePerformance) {
        setAssigneeData(data.data.assigneePerformance);
      }
    } catch (error) {
      console.error('Error fetching assignee performance:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAssigneePerformance();
  }, [fetchAssigneePerformance]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-green-500';
      case 'Good':
        return 'bg-blue-500';
      case 'Average':
        return 'bg-yellow-500';
      case 'Below Average':
        return 'bg-orange-500';
      default:
        return 'bg-red-500';
    }
  };

  const getPerformanceBadgeColor = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      case 'Below Average':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4">WKWKWKWKWK</div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (assigneeData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">📊</div>
        <p>No assignee performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Team Performance Overview</h3>
        <Badge variant="outline" className="text-sm">
          {assigneeData.length} Team Members
        </Badge>
      </div>

      <div className="grid gap-4">
        {assigneeData.map((member, index) => (
          <Card key={member.assignee.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {member.assignee.name.charAt(0)}
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">{member.assignee.name}</h4>
                  <p className="text-sm text-gray-600">{member.assignee.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getPerformanceBadgeColor(member.performance.rating)}`}>
                      {member.performance.rating}
                    </Badge>
                    {getTrendIcon(member.performance.trend)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {member.metrics.productivityScore}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-900">Completed</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {member.metrics.completedTasks}
                </div>
                <div className="text-xs text-blue-700">
                  {member.metrics.completionRate}% rate
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-900">Avg Time</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {member.metrics.avgCompletionDays}
                </div>
                <div className="text-xs text-green-700">days</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-sm font-medium text-purple-900">Story Points</span>
                </div>
                <div className="text-xl font-bold text-purple-600">
                  {member.metrics.completedStoryPoints}
                </div>
                <div className="text-xs text-purple-700">
                  of {member.metrics.totalStoryPoints}
                </div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mr-1" />
                  <span className="text-sm font-medium text-orange-900">Overdue</span>
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {member.metrics.overdueTasks}
                </div>
                <div className="text-xs text-orange-700">tasks</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Task Completion Progress</span>
                <span>{member.metrics.completionRate}%</span>
              </div>
              <Progress 
                value={member.metrics.completionRate} 
                className="h-2"
              />
            </div>

            {/* Strengths and Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Strengths
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {member.performance.strengths.slice(0, 2).map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-blue-700 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Focus Areas
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {member.performance.improvements.slice(0, 2).map((improvement, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <h4 className="font-semibold text-gray-800 mb-4">Team Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {assigneeData.reduce((sum, member) => sum + member.metrics.totalTasks, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {assigneeData.reduce((sum, member) => sum + member.metrics.completedTasks, 0)}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(assigneeData.reduce((sum, member) => sum + member.metrics.productivityScore, 0) / assigneeData.length)}
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {assigneeData.reduce((sum, member) => sum + member.metrics.overdueTasks, 0)}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ReportsPageFixed = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    projectProgress: [],
    sprintBurndown: [],
    velocity: [],
    releaseTracking: [],
    memberContribution: [],
    performanceMetrics: {},
    projectOverview: [],
    taskDistribution: [],
    teamProductivity: [],
    priorityBreakdown: [],
    completionTrends: []
  });
  const [loading, setLoading] = useState(true);

  const fetchReportData = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/reports/project-owner?userId=${user.id}`);
      const data = await response.json();
      
      if (data.data) {
        // Use real API data directly
        const transformedData = {
          // Task distribution for pie chart
          projectProgress: data.data.taskDistribution || [],
          
          // Real sprint burndown data
          sprintBurndown: data.data.sprintBurndown || [],
          
          // Team productivity as velocity (transform to sprint format)
          velocity: (data.data.teamProductivity || []).map((team, index) => ({
            sprint: team.projectName || `Sprint ${index + 1}`,
            completed: team.completedTasks,
            productivity: team.productivity
          })),
          
          // Real release tracking data
          releaseTracking: data.data.releaseTracking || [],
          
          // Team member contribution from assignee performance
          memberContribution: (data.data.assigneePerformance || []).map(assignee => ({
            member: assignee.assignee?.name || 'Unknown',
            completed: assignee.metrics?.completedTasks || 0,
            productivityScore: assignee.metrics?.productivityScore || 0
          })),
          
          // Store all original data for other components
          performanceMetrics: data.data.performanceMetrics || {},
          projectOverview: data.data.projectOverview || [],
          taskDistribution: data.data.taskDistribution || [],
          teamProductivity: data.data.teamProductivity || [],
          priorityBreakdown: data.data.priorityBreakdown || [],
          completionTrends: data.data.completionTrends || [],
          assigneePerformance: data.data.assigneePerformance || []
        };
        
        setReportData(transformedData);
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

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-16 text-left relative">
          <div className="inline-flex items-center justify-center p-2 bg-white/50 backdrop-blur-md rounded-full mb-6 border border-slate-200">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full">
              ✨ Analytics Dashboard
            </span>
          </div>
          <h1 className="text-7xl font-black bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 tracking-tight text-left">
            Project Insights
          </h1>
          <p className="text-slate-600 text-xl max-w-3xl leading-relaxed font-light text-left">
            Real-time analytics and performance metrics with modern visualizations
          </p>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg"></div>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                  {loading ? '...' : (reportData.performanceMetrics.totalTasks || 0)}
                </h3>
                <p className="text-purple-600 font-medium">Total Tasks</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">↗</span> 
                  {loading ? 'Loading...' : `${reportData.performanceMetrics.totalProjects || 0} projects`}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg"></div>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                  {loading ? '...' : (reportData.performanceMetrics.completedTasks || 0)}
                </h3>
                <p className="text-emerald-600 font-medium">Completed</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">↗</span> 
                  {loading ? 'Loading...' : `${reportData.performanceMetrics.completionRate || 0}% efficiency`}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-300 to-red-300 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <div className="w-6 h-6 bg-orange-500 rounded-lg"></div>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                  {loading ? '...' : `${reportData.performanceMetrics.completionRate || 0}%`}
                </h3>
                <p className="text-orange-600 font-medium">Completion Rate</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">↗</span> 
                  {loading ? 'Loading...' : (reportData.performanceMetrics.completionRate >= 70 ? 'Above target' : 'Below target')}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-100 rounded-xl">
                    <div className="w-6 h-6 bg-cyan-500 rounded-lg"></div>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                  {loading ? '...' : (reportData.performanceMetrics.activeProjects || 0)}
                </h3>
                <p className="text-cyan-600 font-medium">Active Projects</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">→</span> 
                  {loading ? 'Loading...' : 'On schedule'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Progress - Pie Chart */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      Progress Distribution
                    </CardTitle>
                    <p className="text-slate-600 mt-2 font-light">Task status breakdown</p>
                  </div>
                  <div className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-xs font-medium">
                    Live
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.projectProgress}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {reportData.projectProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid rgb(203 213 225)',
                          borderRadius: '12px',
                          color: 'rgb(51 65 85)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px', color: 'rgb(51 65 85)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sprint Burndown - Line Chart */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                      Sprint Burndown
                    </CardTitle>
                    <p className="text-slate-600 mt-2 font-light">Timeline: Sprint dates | Tasks remaining</p>
                  </div>
                  <div className="px-3 py-1 bg-cyan-100 rounded-full text-cyan-700 text-xs font-medium">
                    Trending
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.sprintBurndown}>
                      <defs>
                        <linearGradient id="burndownGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(203 213 225)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgb(100 116 139)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgb(100 116 139)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid rgb(203 213 225)',
                          borderRadius: '12px',
                          color: 'rgb(51 65 85)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="remaining" 
                        stroke="#ef4444" 
                        fill="url(#burndownGradient)"
                        strokeWidth={3}
                        name="Remaining Tasks"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ideal" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Ideal"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="remaining" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                        name="Actual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Velocity Chart - Bar Chart */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      Team Velocity
                    </CardTitle>
                    <p className="text-slate-600 mt-2 font-light">Sprints | Completed tasks</p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 rounded-full text-green-700 text-xs font-medium">
                    Performance
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.velocity}>
                      <defs>
                        <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(203 213 225)" />
                      <XAxis 
                        dataKey="sprint" 
                        stroke="rgb(100 116 139)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgb(100 116 139)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid rgb(203 213 225)',
                          borderRadius: '12px',
                          color: 'rgb(51 65 85)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="completed" 
                        fill="url(#velocityGradient)" 
                        radius={[8, 8, 0, 0]}
                        stroke="#10b981"
                        strokeWidth={1}
                        name="Completed Tasks"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Release Tracking - Area Chart */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      Release Tracking
                    </CardTitle>
                    <p className="text-slate-600 mt-2 font-light">Timeline | Progress percentage</p>
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 rounded-full text-yellow-700 text-xs font-medium">
                    Progress
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.releaseTracking}>
                      <defs>
                        <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(203 213 225)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgb(100 116 139)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgb(100 116 139)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid rgb(203 213 225)',
                          borderRadius: '12px',
                          color: 'rgb(51 65 85)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: 'rgb(51 65 85)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="planned" 
                        stackId="1"
                        stroke="#8b5cf6" 
                        fill="url(#colorPlanned)"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stackId="2"
                        stroke="#10b981" 
                        fill="url(#colorActual)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Member Contribution - Full Width Bar Chart */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                    Team Member Contributions
                  </CardTitle>
                  <p className="text-slate-600 mt-2 font-light">Team members | Completed tasks</p>
                </div>
                <div className="px-3 py-1 bg-indigo-100 rounded-full text-indigo-700 text-xs font-medium">
                  Team Stats
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.memberContribution}>
                    <defs>
                      <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(203 213 225)" />
                    <XAxis 
                      dataKey="member" 
                      stroke="rgb(100 116 139)"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="rgb(100 116 139)"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid rgb(203 213 225)',
                        borderRadius: '12px',
                        color: 'rgb(51 65 85)',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="url(#memberGradient)" 
                      radius={[12, 12, 0, 0]}
                      stroke="#f59e0b"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignee Performance Section */}
        <div className="mb-8">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-3xl">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    👤
                  </div>
                  Team Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AssigneePerformance />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Overview and Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Overview */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                      Projects Overview
                    </CardTitle>
                    <p className="text-slate-600 mt-2 font-light">Project status and completion</p>
                  </div>
                  <div className="px-3 py-1 bg-teal-100 rounded-full text-teal-700 text-xs font-medium">
                    {loading ? '...' : reportData.projectOverview.length} Projects
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : reportData.projectOverview.length > 0 ? (
                    reportData.projectOverview.map((project, index) => (
                      <div key={project.id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-800">{project.name}</h4>
                          <Badge 
                            variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                          <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                          <span className="font-medium">{project.completionRate}%</span>
                        </div>
                        <Progress value={project.completionRate} className="h-2" />
                        <div className="mt-2 text-xs text-slate-500">
                          {project.department && (
                            <span className="inline-block bg-slate-200 px-2 py-1 rounded mr-2">
                              {project.department}
                            </span>
                          )}
                          Priority: {project.priority || 'Medium'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <div className="text-4xl mb-4">📁</div>
                      <p>No projects data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Breakdown */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                      Priority Distribution
                    </CardTitle>
                    <p className="text-slate-600 mt-2 font-light">Task priority breakdown</p>
                  </div>
                  <div className="px-3 py-1 bg-rose-100 rounded-full text-rose-700 text-xs font-medium">
                    Priority
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-80">
                  {loading ? (
                    <div className="animate-pulse flex space-x-4 justify-center items-center h-full">
                      <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                    </div>
                  ) : reportData.priorityBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.priorityBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                        >
                          {reportData.priorityBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid rgb(203 213 225)',
                            borderRadius: '12px',
                            color: 'rgb(51 65 85)',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px', color: 'rgb(51 65 85)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-slate-500 h-full flex flex-col justify-center">
                      <div className="text-4xl mb-4">⚡</div>
                      <p>No priority data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPageFixed;
