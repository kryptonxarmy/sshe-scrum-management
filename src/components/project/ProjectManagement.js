"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Eye, Edit, Trash2, Users, Calendar, AlertTriangle } from "lucide-react";
import ModalManageMember from "@/components/project/_partials/ModalManageMember";

const ProjectManagement = () => {
  const { user, canCreateProject, canManageProject, canManageProjectMembers, canViewProject } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/projects?userId=${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjectList(data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleManageMembers = (project) => {
    setSelectedProject(project);
    setIsManageMembersOpen(true);
  };

  const handleCloseMembersModal = () => {
    setIsManageMembersOpen(false);
    setSelectedProject(null);
  };

  // Filter projects based on user role and permissions
  const getVisibleProjects = () => {
    return projectList.filter((project) => canViewProject(project));
  };

  const getProjectStats = (projectId) => {
    // This will be replaced with API call later
    // For now, return mock data
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      completionRate: 0,
    };
  };

  const getProjectOwnerName = (owner) => {
    return owner ? owner.name : "Unknown";
  };

  const getPriorityBadgeVariant = (priority) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return variants[priority] || "outline";
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      ACTIVE: "default",
      COMPLETED: "secondary",
      ON_HOLD: "outline",
      CANCELLED: "destructive",
      PLANNING: "outline",
    };
    return variants[status] || "outline";
  };

  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical",
    };
    return priorityMap[priority] || "Medium";
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      PLANNING: "Planning",
      ACTIVE: "Active",
      ON_HOLD: "On Hold",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return statusMap[status] || "Active";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
            <p className="text-slate-600">Loading projects...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Error Loading Projects</h3>
            <p className="text-slate-500 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
          <p className="text-slate-600">Manage your SSHE projects and track progress</p>
        </div>

        {canCreateProject() && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <CreateProjectForm
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={(newProject) => {
                  setProjectList((prev) => [...prev, newProject]);
                  setIsCreateModalOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getVisibleProjects().map((project) => {
          const stats = getProjectStats(project.id);
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-slate-600">Owner: {getProjectOwnerName(project.owner)}</p>
                  </div>

                  {(canManageProject(project.ownerId) || canManageProjectMembers(project.ownerId)) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Eye size={14} />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit size={14} />
                          Edit Project
                        </DropdownMenuItem>
                        {canManageProjectMembers(project.ownerId) && (
                          <DropdownMenuItem onClick={() => handleManageMembers(project)} className="flex items-center gap-2">
                            <Users size={14} />
                            Manage Members
                          </DropdownMenuItem>
                        )}
                        {canManageProject(project.ownerId) && (
                          <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                            <Trash2 size={14} />
                            Delete Project
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>

                <div className="flex items-center justify-between">
                  <Badge variant={getPriorityBadgeVariant(project.priority)}>{getPriorityDisplay(project.priority)}</Badge>
                  <Badge variant={getStatusBadgeVariant(project.status)}>{getStatusDisplay(project.status)}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {stats.completed}/{stats.total} tasks completed
                    </span>
                    <span>{stats.inProgress} in progress</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{project._count?.members || 0} members</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/tasks?projectId=${project.id}`}
                  >
                    View Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for Manage Members */}
      <ModalManageMember isOpen={isManageMembersOpen} onClose={handleCloseMembersModal} project={selectedProject} />

      {getVisibleProjects().length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle size={48} className="text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Projects Found</h3>
            <p className="text-slate-500 text-center mb-4">{canCreateProject() ? "Get started by creating your first project." : "You haven't been assigned to any projects yet."}</p>
            {canCreateProject() && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Create Project Form Component
const CreateProjectForm = ({ onClose, onProjectCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ownerId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      onProjectCreated(data.project);
    } catch (error) {
      console.error("Error creating project:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const departments = ["Process Safety", "Personnel Safety", "Emergency Preparedness", "Planning", "Environmental"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={loading} required />
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} disabled={loading} rows={3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} disabled={loading} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} disabled={loading} required />
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectManagement;
