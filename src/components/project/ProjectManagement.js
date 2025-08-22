"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MoreVertical, Edit, Trash2, Users, Calendar, AlertTriangle, Archive } from "lucide-react";
import ModalManageMember from "@/components/project/_partials/ModalManageMember";
import ArchiveReports from "@/components/project/ArchiveReports";
import EditProjectModal from "@/components/project/EditProjectModal";

const ProjectManagement = () => {
  const { user, canCreateProject, canManageProject, canManageProjectMembers, canViewProject } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [deletedProjects, setDeletedProjects] = useState([]);

  // Permission Rules:
  // - SUPERADMIN: Can manage all projects and members
  // - PROJECT_OWNER: Can edit/delete their own projects and manage members
  // - SCRUM_MASTER: Can only manage members if they are a member of the project
  // - TEAM_MEMBER: Can only view projects they are assigned to

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

  // Fetch deleted projects
  

  const fetchDeletedProjects = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/projects/deleted?userId=${user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch deleted projects");
      }

      const data = await response.json();
      setDeletedProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching deleted projects:", error);
    }
  }, [user]);

  // Fetch deleted projects when switching to trash tab
  useEffect(() => {
    if (activeTab === "trash") {
      fetchDeletedProjects();
    }
  }, [activeTab, user, fetchDeletedProjects]);

  const handleManageMembers = (project) => {
    setSelectedProject(project);
    setIsManageMembersOpen(true);
  };

  const handleCloseMembersModal = () => {
    setIsManageMembersOpen(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjectList(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleDeleteProject = async (project) => {
    const confirmMessage = `Are you sure you want to move project "${project.name}" to trash? You can restore it later from the trash.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      // Remove project from active list
      setProjectList(prev => prev.filter(p => p.id !== project.id));
      alert(`Project "${project.name}" has been moved to trash successfully!`);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(`Failed to delete project: ${error.message}`);
    }
  };

  const handleRestoreProject = async (project) => {
    const confirmMessage = `Are you sure you want to restore project "${project.name}"?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore project');
      }

      const data = await response.json();
      
      // Remove from deleted list and add to active list
      setDeletedProjects(prev => prev.filter(p => p.id !== project.id));
      setProjectList(prev => [...prev, data.project]);
      
      alert(`Project "${project.name}" has been restored successfully!`);
    } catch (error) {
      console.error('Error restoring project:', error);
      alert(`Failed to restore project: ${error.message}`);
    }
  };

  const handlePermanentDeleteProject = async (project) => {
    const confirmMessage = `Are you sure you want to PERMANENTLY delete project "${project.name}"? This action cannot be undone and will delete all associated tasks.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}?userId=${user.id}&force=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to permanently delete project');
      }

      // Remove from deleted list
      setDeletedProjects(prev => prev.filter(p => p.id !== project.id));
      alert(`Project "${project.name}" has been permanently deleted!`);
    } catch (error) {
      console.error('Error permanently deleting project:', error);
      alert(`Failed to permanently delete project: ${error.message}`);
    }
  };

  const handleReleaseProject = async (project) => {
    if (!confirm(`Are you sure you want to release project "${project.name}"? This will move it to the archive.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}/release`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'release' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to release project');
      }

      // Refresh projects list
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

      await fetchProjects();
      alert(`Project "${project.name}" has been released successfully!`);
    } catch (error) {
      console.error('Error releasing project:', error);
      alert(`Failed to release project: ${error.message}`);
    }
  };

  // Filter projects based on user role and permissions
  const getVisibleProjects = () => {
    return projectList.filter((project) => 
      canViewProject(project) && project.status !== 'RELEASED'
    );
  };

  const getProjectStats = (project) => {
    const tasks = project.tasks || [];
    const total = tasks.length;

    if (total === 0) {
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        completed: 0,
        completionRate: 0,
      };
    }

    const completed = tasks.filter((task) => task.status === "DONE").length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const todo = tasks.filter((task) => task.status === "TODO").length;
    const completionRate = Math.round((completed / total) * 100);

    return {
      total,
      todo,
      inProgress,
      completed,
      completionRate,
    };
  };

  const getProjectOwnerName = (owner) => {
    return owner ? owner.name : "Unknown";
  };

  const getScrumMasterName = (scrumMaster) => {
    return scrumMaster ? scrumMaster.name : null;
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

  const getStatusDisplay = (status, department) => {
    if (status === "PLANNING" || status === "ACTIVE") {
      return department;
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Projects</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Project</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getVisibleProjects().map((project) => {
          const stats = getProjectStats(project);
          const canManageProjectActions = canManageProject(project.ownerId);
          const canManageMembers = canManageProjectMembers(project.ownerId, project);
          
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>

                  {(canManageProjectActions || canManageMembers) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManageProjectActions && (
                          <DropdownMenuItem onClick={() => handleEditProject(project)} className="flex items-center gap-2">
                            <Edit size={14} />
                            Edit Project
                          </DropdownMenuItem>
                        )}
                        {canManageMembers && (
                          <DropdownMenuItem onClick={() => handleManageMembers(project)} className="flex items-center gap-2">
                            <Users size={14} />
                            Manage Members
                          </DropdownMenuItem>
                        )}
                        {canManageProjectActions && project.status !== 'RELEASED' && (
                          <DropdownMenuItem onClick={() => handleReleaseProject(project)} className="flex items-center gap-2 text-blue-600">
                            <Archive size={14} />
                            Release Project
                          </DropdownMenuItem>
                        )}
                        {canManageProjectActions && (
                          <DropdownMenuItem onClick={() => handleDeleteProject(project)} className="flex items-center gap-2 text-red-600">
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

                    {/* Owner and Scrum Master Info */}
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Owner:</span> {getProjectOwnerName(project.owner)}
                      </p>
                      {getScrumMasterName(project.scrumMaster) && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Scrum Master:</span> {getScrumMasterName(project.scrumMaster)}
                        </p>
                      )}
                    </div>

                <div className="flex items-center justify-end">
                  <Badge variant={getStatusBadgeVariant(project.status)}>{getStatusDisplay(project.status, project.department)}</Badge>
                </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
                      </div>

                      {/* Enhanced Task Statistics */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold text-gray-600">{stats.todo}</div>
                          <div className="text-gray-500">To Do</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-600">{stats.inProgress}</div>
                          <div className="text-gray-500">In Progress</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">{stats.completed}</div>
                          <div className="text-gray-500">Done</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Total: {stats.total} tasks</span>
                        {stats.total > 0 && (
                          <span>
                            {stats.completed}/{stats.total} completed
                          </span>
                        )}
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
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <ArchiveReports />
        </TabsContent>

        <TabsContent value="trash" className="space-y-6">
          {/* Deleted Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedProjects.map((project) => {
              const stats = getProjectStats(project);
              const canManageProjectActions = canManageProject(project.ownerId);
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-red-800">{project.name}</CardTitle>
                        <p className="text-xs text-red-600">
                          Deleted: {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>

                      {canManageProjectActions && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRestoreProject(project)} className="flex items-center gap-2 text-green-600">
                              <Archive size={14} />
                              Restore Project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePermanentDeleteProject(project)} className="flex items-center gap-2 text-red-600">
                              <Trash2 size={14} />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-red-700 line-clamp-2">{project.description}</p>

                    {/* Owner and Scrum Master Info */}
                    <div className="space-y-1">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Owner:</span> {getProjectOwnerName(project.owner)}
                      </p>
                      {getScrumMasterName(project.scrumMaster) && (
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Scrum Master:</span> {getScrumMasterName(project.scrumMaster)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <Badge variant="destructive">DELETED</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-700">Progress</span>
                        <span className="font-medium text-red-800">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
                      </div>

                      {/* Enhanced Task Statistics */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-red-100 rounded">
                          <div className="font-semibold text-red-700">{stats.todo}</div>
                          <div className="text-red-600">To Do</div>
                        </div>
                        <div className="text-center p-2 bg-red-100 rounded">
                          <div className="font-semibold text-red-700">{stats.inProgress}</div>
                          <div className="text-red-600">In Progress</div>
                        </div>
                        <div className="text-center p-2 bg-red-100 rounded">
                          <div className="font-semibold text-red-700">{stats.completed}</div>
                          <div className="text-red-600">Done</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-red-600">
                        <span>Total: {stats.total} tasks</span>
                        {stats.total > 0 && (
                          <span>
                            {stats.completed}/{stats.total} completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-red-700">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{project._count?.members || 0} members</span>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreProject(project)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDeleteProject(project)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Delete Permanently
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {deletedProjects.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trash2 size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">Trash is Empty</h3>
                <p className="text-slate-500 text-center">Deleted projects will appear here. You can restore them or delete them permanently.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal for Manage Members */}
      <ModalManageMember isOpen={isManageMembersOpen} onClose={handleCloseMembersModal} project={selectedProject} />
      
      {/* Modal for Edit Project */}
      <EditProjectModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
      />
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
    scrumMasterId: "",
    duration: "SHORT_TERM",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);

  // Fetch members for dropdown (team members only)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/users?role=TEAM_MEMBER`);
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json();
        setMembers(data.users || []);
      } catch (err) {
        setMembers([]);
      }
    };
    fetchMembers();
  }, [user]);

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
          <Label>Functions</Label>
          <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select function" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scrumMasterId">Scrum Master</Label>
          <Select value={formData.scrumMasterId} onValueChange={(value) => handleSelectChange("scrumMasterId", value)} disabled={loading} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Scrum Master" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Project Duration</Label>
          <Select value={formData.duration} onValueChange={(value) => handleSelectChange("duration", value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHORT_TERM">Short Term Project</SelectItem>
              <SelectItem value="LONG_TERM">Long Term Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
