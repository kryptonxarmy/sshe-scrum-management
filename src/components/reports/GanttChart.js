"use client";

import { useState, useEffect, useMemo } from "react";

const GanttChart = ({ projects = [], timeFilter = "3months" }) => {
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const today = new Date();
    let startDate, endDate;
    
    switch (timeFilter) {
      case "3months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "6months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "1year":
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    return { startDate, endDate };
  }, [timeFilter]);

  // Generate month labels for horizontal axis
  const monthLabels = useMemo(() => {
    const months = [];
    const current = new Date(dateRange.startDate);
    
    while (current <= dateRange.endDate) {
      months.push({
        label: current.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        date: new Date(current)
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }, [dateRange]);

  // Filter projects based on date range
  useEffect(() => {
    const filtered = projects.filter(project => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate || project.startDate);
      
      return (
        (projectStart >= dateRange.startDate && projectStart <= dateRange.endDate) ||
        (projectEnd >= dateRange.startDate && projectEnd <= dateRange.endDate) ||
        (projectStart <= dateRange.startDate && projectEnd >= dateRange.endDate)
      );
    });
    
    setFilteredProjects(filtered);
  }, [projects, dateRange]);

  // Calculate project bar position and width
  const calculateBarStyle = (project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate || project.startDate);
    
    // Ensure dates are within visible range
    const visibleStart = new Date(Math.max(projectStart.getTime(), dateRange.startDate.getTime()));
    const visibleEnd = new Date(Math.min(projectEnd.getTime(), dateRange.endDate.getTime()));
    
    const totalDays = Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24));
    const startOffset = Math.ceil((visibleStart - dateRange.startDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) + 1;
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 1)}%`, // Minimum 1% width
      duration: Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24)) + 1
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDurationStyle = (duration, priority) => {
    // Base colors for different durations
    const baseColors = {
      SHORT_TERM: {
        HIGH: 'bg-gradient-to-r from-red-400 to-red-600 border-red-700',
        MEDIUM: 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-700',
        LOW: 'bg-gradient-to-r from-green-400 to-green-600 border-green-700',
        CRITICAL: 'bg-gradient-to-r from-red-600 to-red-800 border-red-900'
      },
      LONG_TERM: {
        HIGH: 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-700',
        MEDIUM: 'bg-gradient-to-r from-purple-400 to-purple-600 border-purple-700',
        LOW: 'bg-gradient-to-r from-indigo-400 to-indigo-600 border-indigo-700',
        CRITICAL: 'bg-gradient-to-r from-red-500 to-red-700 border-red-800'
      }
    };

    const durationKey = duration || 'SHORT_TERM';
    const priorityKey = priority || 'MEDIUM';
    
    return baseColors[durationKey]?.[priorityKey] || 'bg-gradient-to-r from-gray-400 to-gray-600 border-gray-700';
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-700';
      case 'MEDIUM':
        return 'text-yellow-700';
      case 'LOW':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center text-slate-500">
          <p className="text-lg font-medium mb-2">No Projects Found</p>
          <p>No active projects found in the selected time period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Timeline Project (Gantt Chart)</h3>
        <p className="text-sm text-slate-600 mt-1">
          Showing {filteredProjects.length} active project(s) for the selected period
        </p>
      </div>

      {/* Gantt Chart */}
      <div className="p-4">
        {/* Month Headers */}
        <div className="flex mb-4">
          <div className="w-80 flex-shrink-0"></div> {/* Space for project labels */}
          <div className="flex-1 relative">
            <div className="flex border-b border-slate-200 pb-2">
              {monthLabels.map((month, index) => (
                <div key={index} className="flex-1 text-center text-sm font-medium text-slate-600">
                  {month.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Rows */}
        <div className="space-y-3">
          {filteredProjects.map((project, index) => {
            const barStyle = calculateBarStyle(project);
            return (
              <div key={project.id} className="flex items-center">
                {/* Project Label */}
                <div className="w-80 flex-shrink-0 pr-4">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <h4 className="font-medium text-slate-800 text-sm mb-1">{project.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        project.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {project.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.duration === 'LONG_TERM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {project.duration === 'LONG_TERM' ? 'Long Term' : 'Short Term'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(project.startDate).toLocaleDateString('id-ID')} - {' '}
                      {new Date(project.endDate || project.startDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Gantt Bar */}
                <div className="flex-1 relative h-12">
                  <div className="absolute inset-0 bg-slate-100 rounded"></div>
                  <div 
                    className={`absolute top-1 bottom-1 rounded shadow-sm border-2 flex items-center justify-center text-white text-xs font-medium ${getDurationStyle(project.duration, project.priority)}`}
                    style={{
                      left: barStyle.left,
                      width: barStyle.width,
                      minWidth: barStyle.duration === 1 ? '40px' : 'auto'
                    }}
                  >
                    {barStyle.duration === 1 ? (
                      <span className="px-1">1d</span>
                    ) : barStyle.duration <= 7 ? (
                      <span className="px-2">{barStyle.duration}d</span>
                    ) : (
                      <span className="px-2">{barStyle.duration} days</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Priority:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-slate-600">High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-slate-600">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-slate-600">Low</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Duration shown in days (d)
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Duration Type:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded border border-blue-700"></div>
                <span className="text-xs text-slate-600">Short Term</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded border border-orange-700"></div>
                <span className="text-xs text-slate-600">Long Term</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
