"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download
} from "lucide-react";

const AdminUsersPage = () => {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEAM_MEMBER',
    department: '',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?currentUserId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        // Ensure all users have _count property
        const usersWithCount = data.users.map(user => ({
          ...user,
          _count: user._count || {
            ownedProjects: 0,
            taskAssignees: 0,
            projectMemberships: 0
          }
        }));
        setUsers(usersWithCount);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check if user is superadmin
  useEffect(() => {
    if (!user) return;
    
    const isSuperadmin = user.role === 'SUPERADMIN' || user.role === 'superadmin';
    if (!isSuperadmin) {
      router.push('/unauthorized');
      return;
    }
    
    fetchUsers();
  }, [user, router, fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          currentUserId: user.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Ensure the new user has _count property
        const newUser = {
          ...result.user,
          _count: result.user._count || {
            ownedProjects: 0,
            taskAssignees: 0,
            projectMemberships: 0
          }
        };
        setUsers(prev => [newUser, ...prev]);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'TEAM_MEMBER',
          department: '',
          isActive: true
        });
        setIsCreateDialogOpen(false);
        alert('User berhasil dibuat!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Gagal membuat user. Silakan coba lagi.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          currentUserId: user.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Ensure the updated user has _count property
        const updatedUser = {
          ...result.user,
          _count: result.user._count || {
            ownedProjects: 0,
            taskAssignees: 0,
            projectMemberships: 0
          }
        };
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        alert('User berhasil diupdate!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Gagal mengupdate user. Silakan coba lagi.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}?currentUserId=${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert('User berhasil dihapus!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user. Silakan coba lagi.');
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Keep empty for security
      role: user.role,
      department: user.department || '',
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const variants = {
      SUPERADMIN: "default",
      PROJECT_OWNER: "secondary",
      SCRUM_MASTER: "default", 
      TEAM_MEMBER: "outline",
    };
    const labels = {
      SUPERADMIN: "Super Admin",
      PROJECT_OWNER: "Project Owner",
      SCRUM_MASTER: "Scrum Master",
      TEAM_MEMBER: "Team Member",
    };
    return (
      <Badge variant={variants[role] || "outline"}>
        {labels[role] || role}
      </Badge>
    );
  };

  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                Admin Panel - User Management
              </h1>
              <p className="text-gray-600 mt-2">Kelola semua user dan role dalam sistem</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Buat User Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      placeholder="Masukkan email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      placeholder="Masukkan password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({...prev, role: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                        <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                        <SelectItem value="PROJECT_OWNER">Project Owner</SelectItem>
                        <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                      placeholder="Masukkan department (opsional)"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading ? 'Menyimpan...' : 'Buat User'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  <SelectItem value="PROJECT_OWNER">Project Owner</SelectItem>
                  <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                  <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar User ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Projects/Tasks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.department || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <>
                              <UserCheck className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 text-red-600" />
                              <span className="text-red-600 text-sm">Inactive</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('id-ID') : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{(user._count?.ownedProjects) || 0} projects</div>
                          <div className="text-gray-500">{(user._count?.taskAssignees) || 0} tasks</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            {user.id !== user.id && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Password Baru (kosongkan jika tidak diubah)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  placeholder="Masukkan password baru atau kosongkan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({...prev, role: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                    <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                    <SelectItem value="PROJECT_OWNER">Project Owner</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                />
                <Label htmlFor="edit-isActive">User Active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detail User</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nama</Label>
                    <p className="text-sm font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Role</Label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Department</Label>
                    <p className="text-sm">{selectedUser.department || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedUser.isActive ? (
                        <>
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 text-sm">Active</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 text-sm">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                    <p className="text-sm">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString('id-ID') : 'Never'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-500">Statistics</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedUser._count?.ownedProjects || 0}</p>
                      <p className="text-xs text-gray-500">Owned Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedUser._count?.taskAssignees || 0}</p>
                      <p className="text-xs text-gray-500">Assigned Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedUser._count?.projectMemberships || 0}</p>
                      <p className="text-xs text-gray-500">Project Memberships</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-500">Account Info</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span> {new Date(selectedUser.createdAt).toLocaleDateString('id-ID')}
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span> {new Date(selectedUser.updatedAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsersPage;
