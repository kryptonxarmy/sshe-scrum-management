"use client";

import { useRef, useEffect, useMemo, useState } from "react";

const GanttChart = ({ projects = [], timeFilter = "3months" }) => {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const monthScrollRef = useRef(null);

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const today = new Date();
    let startDate, endDate;
    switch (timeFilter) {
      case "3months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        break;
      case "6months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 4, 0);
        break;
      case "1year":
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 7, 0);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
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

  // Auto-scroll ke current month saat render
  useEffect(() => {
    if (!monthScrollRef.current) return;
    const today = new Date();
    const currentMonthIndex = monthLabels.findIndex(m => m.date.getMonth() === today.getMonth() && m.date.getFullYear() === today.getFullYear());
    if (currentMonthIndex !== -1) {
      const monthNode = monthScrollRef.current.querySelectorAll('.gantt-month-label')[currentMonthIndex];
      if (monthNode) {
        monthNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [monthLabels]);

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

    // Clamp project start/end ke range yang tampil
    const visibleStart = projectStart < dateRange.startDate ? dateRange.startDate : projectStart;
    const visibleEnd = projectEnd > dateRange.endDate ? dateRange.endDate : projectEnd;

    // Total hari dalam range
    const totalDays = Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24));
    // Offset dari kiri (hari dari start range)
    const startOffset = Math.max(0, Math.ceil((visibleStart - dateRange.startDate) / (1000 * 60 * 60 * 24)));
    // Durasi hari (clamped)
    const duration = Math.max(0, Math.ceil((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) + 1);

    // Persentase untuk left dan width
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: duration > 0 ? `${widthPercent}%` : '0%',
      duration: duration
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
        MEDIUM: 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-700',
        LOW: 'bg-gradient-to-r from-orange-400 to orange-600 border-orange-700',
        CRITICAL: 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-700'
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
        <div ref={monthScrollRef} className="min-w-[600px] overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex border-b border-slate-200 pb-2 min-w-max">
            <div className="w-80 flex-shrink-0"></div> {/* Space for project labels */}
            {monthLabels.map((month, index) => (
              <div key={index} className={`gantt-month-label flex-1 text-center text-sm font-medium text-slate-600 border-r border-slate-100 last:border-none px-2 min-w-[100px] ${month.date.getMonth() === (new Date()).getMonth() && month.date.getFullYear() === (new Date()).getFullYear() ? 'bg-blue-50 border-blue-300' : ''}`}>
                {month.label}
                <div className="flex justify-between mt-1 gap-1 text-[10px] text-slate-400">
                  <span className="px-1">W1</span>
                  <span className="px-1">W2</span>
                  <span className="px-1">W3</span>
                  <span className="px-1">W4</span>
                </div>
              </div>
            ))}
          </div>
          {/* Project Rows */}
          <div className="space-y-3">
            {filteredProjects.map((project, index) => {
              const barStyle = calculateBarStyle(project);
              return (
                <div key={project.id} className="flex items-center">
                  {/* Project Label */}
                  <div className="w-44 flex-shrink-0 pr-1">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <h4 className="font-medium text-slate-800 text-sm mb-1">{project.name}</h4>
                      {/* Duration di bawah judul project dikembalikan */}
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
                      className={`absolute top-1 bottom-1 rounded shadow-sm border-2 flex items-center justify-start text-white text-xs font-medium ${getDurationStyle(project.duration, project.priority)}`}
                      style={{
                        left: barStyle.left,
                        width: barStyle.width,
                        minWidth: barStyle.duration === 1 ? '40px' : 'auto',
                        maxWidth: '100%'
                      }}
                    >
                      {/* Show completion progress percent */}
                      <span className="px-2">
                        {project.tasks && project.tasks.length > 0
                          ? `${Math.round((project.tasks.filter(t => t.status === 'DONE').length / project.tasks.length) * 100)}% Progress`
                          : '0% Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Navigasi scroll bulan di bawah */}
        <div className="flex items-center mt-2 justify-center">
          <button
            className="mr-2 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
            onClick={() => {
              if (monthScrollRef.current) {
                monthScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
              }
            }}
            aria-label="Scroll left"
          >
            &#8592;
          </button>
          <button
            className="ml-2 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
            onClick={() => {
              if (monthScrollRef.current) {
                monthScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
              }
            }}
            aria-label="Scroll right"
          >
            &#8594;
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <span className="text-sm font-medium text-slate-700">Priority:</span> */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {/* <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-slate-600">High</span> */}
                </div>
                <div className="flex items-center gap-1">
                  {/* <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-slate-600">Medium</span> */}
                </div>
                <div className="flex items-center gap-1">
                  {/* <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-slate-600">Low</span> */}
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
                <span className="text-xs text-slate-600">Short Period</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded border border-orange-700"></div>
                <span className="text-xs text-slate-600">Long Period</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;




