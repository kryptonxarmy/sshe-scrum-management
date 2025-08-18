import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CreateEventDialog from "@/components/CreateEventDialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  User, 
  FolderOpen, 
  Clock, 
  Target, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  CalendarPlus,
  Users,
  Repeat
} from "lucide-react";

function getMonthDays(year, month) {
  // month: 0-based
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  // month: 0-based
  return new Date(year, month, 1).getDay();
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Task Hover Card Component
const TaskHoverCard = ({ task, children }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'MEDIUM': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'LOW': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default: return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO': return <Circle className="w-4 h-4 text-gray-600" />;
      case 'IN_PROGRESS': return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'DONE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-700 bg-red-50 border border-red-200';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-50 border border-yellow-200';
      case 'LOW': return 'text-green-700 bg-green-50 border border-green-200';
      default: return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'text-gray-700 bg-gray-50 border border-gray-200';
      case 'IN_PROGRESS': return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'DONE': return 'text-green-700 bg-green-50 border border-green-200';
      default: return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="space-y-3">
          {/* Task Title & Description */}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-gray-600 text-xs leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* Project Info */}
          {task.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600 font-medium">Project:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                {task.project.name}
              </span>
            </div>
          )}

          {/* Assignee Info */}
          {task.assignee && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600 font-medium">Assignee:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                  {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-gray-800">{task.assignee.name}</span>
              </div>
            </div>
          )}

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {getStatusIcon(task.status)}
                <span className="text-xs text-gray-600 font-medium">Status</span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status?.replace('_', ' ') || 'TODO'}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {getPriorityIcon(task.priority)}
                <span className="text-xs text-gray-600 font-medium">Priority</span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority || 'MEDIUM'}
              </span>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600 font-medium">Due Date:</span>
            <span className="text-xs font-medium text-gray-800">
              {new Date(task.dueDate).toLocaleDateString("id-ID", { 
                weekday: 'long',
                day: "2-digit", 
                month: "long", 
                year: "numeric" 
              })}
            </span>
          </div>

          {/* Story Points */}
          {task.storyPoints && (
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-gray-600 font-medium">Story Points:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                {task.storyPoints} pts
              </span>
            </div>
          )}

          {/* Created By */}
          {task.createdBy && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <User className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Created by {task.createdBy.name}</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const CalendarDashboard = ({ tasks }) => {
  const { hasPermission, user } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurrenceType: '',
    recurrenceDay: '',
    projectId: ''
  });
  const [projects, setProjects] = useState([]);

  // Fetch user's projects when dialog opens
  const fetchUserProjects = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserProjects();
    }
  }, [isOpen, user, fetchUserProjects]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdById: user.id,
          startDateTime: `${formData.startDate}T${formData.startTime}`,
          endDateTime: `${formData.startDate}T${formData.endTime}`,
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setIsOpen(false);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          startTime: '',
          endTime: '',
          isRecurring: false,
          recurrenceType: '',
          recurrenceDay: '',
          projectId: ''
        });
        onEventCreated?.(newEvent);
      } else {
        console.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has permission to create events
  if (!hasPermission("canManageProjects") && user.role !== "scrum_master") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <CalendarPlus className="w-4 h-4" />
          Add Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Schedule Meeting
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Sprint Planning, Daily Standup"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* Event Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda and details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={formData.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Recurring Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
              />
              <Label htmlFor="isRecurring" className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Recurring Meeting
              </Label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-2 gap-2 ml-6">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.recurrenceType} onValueChange={(value) => handleInputChange('recurrenceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select value={formData.recurrenceDay} onValueChange={(value) => handleInputChange('recurrenceDay', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CalendarDashboard = ({ tasks }) => {
  const { hasPermission, user } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getMonthDays(year, month);
  const firstDay = getFirstDay(year, month);

  // Fetch events when component mounts or date changes
  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      const response = await fetch(`/api/events?userId=${user.id}&startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        console.error('Failed to fetch events');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  }, [user?.id, year, month]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  // Map tasks and events by date
  const tasksByDate = {};
  const eventsByDate = {};
  
  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const key = formatDate(d);
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(task);
    }
  });

  events.forEach((event) => {
    if (event.startDateTime) {
      const d = new Date(event.startDateTime);
      const key = formatDate(d);
      if (!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push(event);
    }
  });

  // Build calendar grid
  const calendar = [];
  let dayNum = 1;
  for (let week = 0; week < 6; week++) {
    const weekRow = [];
    for (let day = 0; day < 7; day++) {
      if ((week === 0 && day < firstDay) || dayNum > daysInMonth) {
        weekRow.push(null);
      } else {
        weekRow.push(dayNum);
        dayNum++;
      }
    }
    calendar.push(weekRow);
  }

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'HIGH': return <AlertCircle className="w-3 h-3 text-red-600" />;
      case 'MEDIUM': return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'LOW': return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      default: return <Circle className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'TODO': return <Circle className="w-3 h-3 text-gray-600" />;
      case 'IN_PROGRESS': return <PlayCircle className="w-3 h-3 text-blue-600" />;
      case 'DONE': return <CheckCircle className="w-3 h-3 text-green-600" />;
      default: return <Circle className="w-3 h-3 text-gray-600" />;
    }
  };

  return (
  <div className="bg-white text-slate-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs mr-2 border border-purple-200 hover:bg-purple-200 transition"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          >
            &lt; Prev
          </button>
          <h2 className="text-xl font-bold text-purple-700">{viewDate.toLocaleString("default", { month: "long" })} {year}</h2>
          <button
            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs ml-2 border border-purple-200 hover:bg-purple-200 transition"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          >
            Next &gt;
          </button>
        </div>
        
        {/* Add Event Button - Only for Project Owner and Scrum Master */}
        {(hasPermission("canManageProjects") || user?.role === "scrum_master") && (
          <CreateEventDialog onEventCreated={handleEventCreated} />
        )}
      </div>
      <div className="grid grid-cols-7 gap-1 border border-purple-200 rounded-lg overflow-hidden">
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
          <div key={d} className="py-2 px-1 text-center font-semibold text-xs border-b border-purple-200 bg-purple-50 text-purple-700">{d}</div>
        ))}
        {calendar.map((week, i) =>
          week.map((day, j) => (
            <div key={i + "-" + j} className="h-24 border-r border-b border-purple-100 bg-white relative">
              {day && (
                <>
                  <div className="absolute top-1 left-1 text-xs text-slate-400">{day}</div>
                  <div className="mt-4 space-y-1 px-1">
                    {/* Tasks */}
                    {tasksByDate[`${year}-${(month+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`]?.map((task) => (
                      <TaskHoverCard key={`task-${task.id}`} task={task}>
                        <div 
                          className="bg-purple-100 text-purple-800 rounded px-2 py-1 text-xs truncate border border-purple-300 shadow-sm hover:bg-purple-200 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>{getStatusIndicator(task.status)}</span>
                            <span>{getPriorityIndicator(task.priority)}</span>
                            <span className="truncate">{task.title}</span>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{task.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </TaskHoverCard>
                    ))}
                    
                    {/* Events */}
                    {eventsByDate[`${year}-${(month+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`]?.map((event) => (
                      <HoverCard key={`event-${event.id}`}>
                        <HoverCardTrigger asChild>
                          <div className="bg-green-100 text-green-800 rounded px-2 py-1 text-xs truncate border border-green-300 shadow-sm hover:bg-green-200 cursor-pointer transition-colors">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="truncate">{event.title}</span>
                              {event.isRecurring && <Repeat className="w-3 h-3" />}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {new Date(event.startDateTime).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-600" />
                                {event.title}
                              </h4>
                              {event.description && (
                                <p className="text-gray-600 text-xs leading-relaxed">{event.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-600 font-medium">Time:</span>
                              <span className="text-xs font-medium text-gray-800">
                                {new Date(event.startDateTime).toLocaleTimeString('id-ID', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(event.endDateTime).toLocaleTimeString('id-ID', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>

                            {event.project && (
                              <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-gray-600 font-medium">Project:</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                  {event.project.name}
                                </span>
                              </div>
                            )}

                            {event.isRecurring && (
                              <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-600 font-medium">Recurring:</span>
                                <span className="text-xs font-medium text-gray-800">
                                  {event.recurrenceType === 'weekly' ? 'Weekly' : 'Bi-weekly'}
                                </span>
                              </div>
                            )}

                            {event.createdBy && (
                              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <User className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-500">Created by {event.createdBy.name}</span>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarDashboard;
