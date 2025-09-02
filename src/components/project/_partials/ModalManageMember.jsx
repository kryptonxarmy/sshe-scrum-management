"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Trash2, Search, UserCheck, UserPlus, AlertTriangle, Loader2 } from "lucide-react";

const ModalManageMember = ({ isOpen, onClose, project }) => {
  const { user } = useAuth();
  const [currentMembers, setCurrentMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch project members and available users
  useEffect(() => {
    if (isOpen && project) {
      fetchProjectData();
    }
  }, [isOpen, project]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = availableUsers
      .filter((user) => user.role !== 'SUPERADMIN')
      .filter((user) => !currentMembers.some((member) => member.user.id === user.id));

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [availableUsers, currentMembers, searchTerm, roleFilter]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current project members from the members endpoint
      const membersResponse = await fetch(`/api/projects/${project.id}/members`);
      if (!membersResponse.ok) {
        throw new Error("Failed to fetch project members");
      }
      const membersData = await membersResponse.json();
      
      // Combine owner and members into a single list
      const allMembers = [];
      
      // Add owner to members list
      if (membersData.owner) {
        allMembers.push({
          user: membersData.owner,
          joinedAt: new Date().toISOString(), // Owner is always the first member
          isActive: true,
        });
      }
      
      // Add regular members
      if (membersData.members) {
        allMembers.push(...membersData.members.map(member => ({
          user: {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            department: member.department,
            avatar: member.avatar,
          },
          joinedAt: member.joinedAt,
          isActive: member.isActive,
        })));
      }
      
      setCurrentMembers(allMembers);

      // Fetch all available users
      const usersResponse = await fetch("/api/users?isActive=true");
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }
      const usersData = await usersResponse.json();
      setAvailableUsers(usersData.users || []);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      setActionLoading(`add-${userId}`);
      
      const response = await fetch(`/api/projects/${project.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          addedBy: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add member");
      }

      // Update current members list
      setCurrentMembers((prev) => [...prev, data.membership]);
      
      // Show success message (you can replace with a toast notification)
      console.log("Member added successfully");
    } catch (error) {
      console.error("Error adding member:", error);
      setError(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setActionLoading(`remove-${userId}`);
      
      const response = await fetch(
        `/api/projects/${project.id}/members?userId=${userId}&removedBy=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      // Update current members list
      setCurrentMembers((prev) => prev.filter((member) => member.user.id !== userId));
      
      // Show success message (you can replace with a toast notification)
      console.log("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      setError(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      SUPERADMIN: "destructive",
      PROJECT_OWNER: "default",
      SCRUM_MASTER: "secondary",
      TEAM_MEMBER: "outline",
    };
    return variants[role] || "outline";
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      SUPERADMIN: "Super Admin",
      PROJECT_OWNER: "Project Owner",
      SCRUM_MASTER: "Scrum Master",
      TEAM_MEMBER: "Team Member",
    };
    return roleMap[role] || role;
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Manage Project Members - {project.name}
          </DialogTitle>
          {user.role === "SCRUM_MASTER" && (
            <p className="text-sm text-blue-600 mt-1">
              As a Scrum Master and project member, you can add and remove team members.
            </p>
          )}
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin" />
            <span className="ml-2">Loading project data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Current Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Members ({currentMembers.length})</h3>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {currentMembers.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Users size={32} className="text-gray-400 mb-2" />
                        <p className="text-gray-500 text-center">No members assigned to this project yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    currentMembers.map((member) => (
                      <Card key={member.user.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user.name}</p>
                              <p className="text-sm text-gray-500">{member.user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {member.user.id === project.scrumMasterId ? (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    Scrum Master
                                  </Badge>
                                ) : (
                                  <Badge variant={getRoleBadgeVariant(member.user.role)} className="text-xs">
                                    {getRoleDisplay(member.user.role)}
                                  </Badge>
                                )}
                                {member.user.department && (
                                  <Badge variant="outline" className="text-xs">
                                    {member.user.department}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Don't allow removing project owner */}
                          {member.user.id !== project.ownerId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.user.id)}
                              disabled={actionLoading === `remove-${member.user.id}`}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {actionLoading === `remove-${member.user.id}` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Add Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Members</h3>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Filter by Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="PROJECT_OWNER">Project Owner</SelectItem>
                      <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                      <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <UserPlus size={32} className="text-gray-400 mb-2" />
                        <p className="text-gray-500 text-center">
                          {searchTerm || roleFilter !== "all" 
                            ? "No users found matching your search criteria." 
                            : "All available users are already members of this project."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredUsers.map((availableUser) => (
                      <Card key={availableUser.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(availableUser.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{availableUser.name}</p>
                              <p className="text-sm text-gray-500">{availableUser.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getRoleBadgeVariant(availableUser.role)} className="text-xs">
                                  {getRoleDisplay(availableUser.role)}
                                </Badge>
                                {availableUser.department && (
                                  <Badge variant="outline" className="text-xs">
                                    {availableUser.department}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddMember(availableUser.id)}
                            disabled={actionLoading === `add-${availableUser.id}`}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {actionLoading === `add-${availableUser.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Plus size={14} />
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalManageMember;