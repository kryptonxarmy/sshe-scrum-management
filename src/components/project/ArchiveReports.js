"use client";

import { useState, useEffect } from "react";
import GanttChart from "@/components/reports/GanttChart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, BarChart3, Filter, Clock, Timer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ArchiveReports = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("3months");
  const [durationFilter, setDurationFilter] = useState("all");
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedOnTime: 0,
    averageDuration: 0,
    highPriorityCount: 0,
    shortTermCount: 0,
    longTermCount: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchReleasedProjects();
    }
  }, [user?.id, fetchReleasedProjects]);

  useEffect(() => {
    calculateStats();
  }, [projects, timeFilter, durationFilter, calculateStats]);

  const fetchReleasedProjects = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Menggunakan API projects biasa untuk mendapatkan project yang belum rilis
      const response = await fetch(`/api/projects?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Filter hanya project yang belum rilis (status !== 'RELEASED')
        const activeProjects = data.projects?.filter(project => project.status !== 'RELEASED') || [];
        setProjects(activeProjects);
      } else {
        console.error('Failed to fetch projects:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (projects.length === 0) {
      setStats({ 
        totalProjects: 0, 
        completedOnTime: 0, 
        averageDuration: 0, 
        highPriorityCount: 0,
        shortTermCount: 0,
        longTermCount: 0 
      });
      return;
    }

    // Filter projects based on time filter
    const now = new Date();
    const monthsToSubtract = timeFilter === "3months" ? 3 : timeFilter === "6months" ? 6 : 12;
    const filterDate = new Date(now.getFullYear(), now.getMonth() - monthsToSubtract, 1);
    
    let filteredProjects = projects.filter(project => {
      const projectDate = new Date(project.updatedAt);
      return projectDate >= filterDate;
    });

    // Filter by duration if selected
    if (durationFilter !== "all") {
      filteredProjects = filteredProjects.filter(project => 
        project.duration === durationFilter
      );
    }

    const totalProjects = filteredProjects.length;
  // Remove priority count, only count short/long term
  const shortTermCount = filteredProjects.filter(project => project.duration === 'SHORT_TERM').length;
  const longTermCount = filteredProjects.filter(project => project.duration === 'LONG_TERM').length;

    // Calculate average duration
    const durations = filteredProjects.map(project => {
      if (!project.startDate || !project.endDate) return 1;
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    
    const averageDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) 
      : 0;

    // Calculate completed on time
    const completedOnTime = filteredProjects.filter(project => {
      if (!project.endDate) return true;
      const endDate = new Date(project.endDate);
      const releaseDate = new Date(project.updatedAt);
      return releaseDate <= endDate;
    }).length;

    setStats({
      totalProjects,
      completedOnTime,
      averageDuration,
  // highPriorityCount removed
      shortTermCount,
      longTermCount
    });
  };

  const getFilteredProjects = () => {
    const now = new Date();
    const monthsToSubtract = timeFilter === "3months" ? 3 : timeFilter === "6months" ? 6 : 12;
    const filterDate = new Date(now.getFullYear(), now.getMonth() - monthsToSubtract, 1);
    
    let filteredProjects = projects.filter(project => {
      const projectDate = new Date(project.updatedAt);
      return projectDate >= filterDate;
    });

    if (durationFilter !== "all") {
      filteredProjects = filteredProjects.filter(project => 
        project.duration === durationFilter
      );
    }

    return filteredProjects;
  };

  const getTimeFilterLabel = (filter) => {
    switch (filter) {
      case "3months":
        return "Last 3 Months";
      case "6months":
        return "Last 6 Months";
      case "1year":
        return "Last 1 Year";
      default:
        return "Last 3 Months";
    }
  };

  const getDurationLabel = (duration) => {
    switch (duration) {
      case "SHORT_TERM":
        return "Short Term";
      case "LONG_TERM":
        return "Long Term";
      default:
        return "All Projects";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Timeline Project</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Timeline Project</h2>
          <p className="text-slate-600">Project timeline and statistics for active projects</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last 1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="SHORT_TERM">Short Term Projects</SelectItem>
              <SelectItem value="LONG_TERM">Long Term Projects</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">In {getTimeFilterLabel(timeFilter).toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed On Time</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOnTime}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {stats.totalProjects > 0 ? Math.round((stats.completedOnTime / stats.totalProjects) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Duration</p>
                <p className="text-2xl font-bold text-slate-900">{stats.averageDuration}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Days per project</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriorityCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Critical projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Short Term</p>
                <p className="text-2xl font-bold text-blue-600">{stats.shortTermCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Quick delivery projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Long Term</p>
                <p className="text-2xl font-bold text-orange-600">{stats.longTermCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Timer size={24} className="text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Extended timeline projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <GanttChart projects={getFilteredProjects()} timeFilter={timeFilter} />

      {/* No Data State */}
      {projects.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Active Projects</h3>
            <p className="text-slate-600">There are no active projects to display in the selected time period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArchiveReports;
