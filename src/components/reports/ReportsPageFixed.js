"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const ReportsPageFixed = () => {
  const [reportData, setReportData] = useState({
    projectProgress: [],
    sprintBurndown: [],
    velocity: [],
    releaseTracking: [],
    memberContribution: []
  });

  useEffect(() => {
    // Fetch report data from API
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const mockData = {
        projectProgress: [
          { name: 'To Do', value: 35, color: '#ef4444' },
          { name: 'In Progress', value: 45, color: '#3b82f6' },
          { name: 'Done', value: 89, color: '#10b981' }
        ],
        sprintBurndown: [
          { date: '2024-01-01', remainingTasks: 100 },
          { date: '2024-01-08', remainingTasks: 85 },
          { date: '2024-01-15', remainingTasks: 70 },
          { date: '2024-01-22', remainingTasks: 45 },
          { date: '2024-01-29', remainingTasks: 20 },
          { date: '2024-02-05', remainingTasks: 5 },
          { date: '2024-02-12', remainingTasks: 0 }
        ],
        velocity: [
          { sprint: 'Sprint 1', completed: 23 },
          { sprint: 'Sprint 2', completed: 34 },
          { sprint: 'Sprint 3', completed: 28 },
          { sprint: 'Sprint 4', completed: 41 },
          { sprint: 'Sprint 5', completed: 37 }
        ],
        releaseTracking: [
          { date: '2024-01-01', planned: 0, actual: 0 },
          { date: '2024-01-15', planned: 25, actual: 20 },
          { date: '2024-02-01', planned: 50, actual: 45 },
          { date: '2024-02-15', planned: 75, actual: 65 },
          { date: '2024-03-01', planned: 100, actual: 85 }
        ],
        memberContribution: [
          { member: 'John Doe', completed: 28 },
          { member: 'Jane Smith', completed: 32 },
          { member: 'Mike Johnson', completed: 21 },
          { member: 'Sarah Wilson', completed: 35 },
          { member: 'David Brown', completed: 29 }
        ]
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

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
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">124</h3>
                <p className="text-purple-600 font-medium">Total Tasks</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">↗</span> +12% from last month
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
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">89</h3>
                <p className="text-emerald-600 font-medium">Completed</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">↗</span> +8% efficiency
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
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">72%</h3>
                <p className="text-orange-600 font-medium">Completion Rate</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">↗</span> Above target
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
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">15</h3>
                <p className="text-cyan-600 font-medium">Active Projects</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <span className="mr-1">→</span> On schedule
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
                        dataKey="remainingTasks" 
                        stroke="#ef4444" 
                        fill="url(#burndownGradient)"
                        strokeWidth={3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="remainingTasks" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
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
                        radius={[12, 12, 0, 0]}
                        stroke="#10b981"
                        strokeWidth={1}
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
      </div>
    </div>
  );
};

export default ReportsPageFixed;
