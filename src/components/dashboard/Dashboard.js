"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, FolderOpen, Users, BarChart3, Plus, Eye, Edit, Trash2 } from "lucide-react";
import ProjectManagement from "@/components/project/ProjectManagement";

const Dashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const [activeView, setActiveView] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      superadmin: "default",
      project_owner: "secondary",
      scrum_master: "default",
      team_member: "outline",
    };
    return variants[role] || "outline";
  };

  const getRoleLabel = (role) => {
    const labels = {
      superadmin: "Super Admin",
      project_owner: "Project Owner",
      scrum_master: "Scrum Master",
      team_member: "Team Member",
    };
    return labels[role] || role;
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">Pertamina HSE</h1>
            <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Button variant={activeView === "projects" ? "default" : "ghost"} onClick={() => setActiveView("projects")} className="flex items-center gap-2">
                <FolderOpen size={16} />
                Projects
              </Button>

              {hasPermission("canManageUsers") && (
                <Button variant={activeView === "users" ? "default" : "ghost"} onClick={() => setActiveView("users")} className="flex items-center gap-2">
                  <Users size={16} />
                  Users
                </Button>
              )}

              <Button variant="ghost" onClick={() => router.push("/reports")} className="flex items-center gap-2">
                <BarChart3 size={16} />
                Reports
              </Button>
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">{user.avatar || user.name?.charAt(0) || "U"}</div>
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User size={16} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                  <LogOut size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeView === "projects" && <ProjectsView />}
        {activeView === "users" && <UsersView />}
      </main>
    </div>
  );
};

// Projects View Component
const ProjectsView = () => {
  const { user, hasPermission } = useAuth();

  return (
    <div>
      <ProjectManagement />
    </div>
  );
};

// Tasks View Component
// Users Management View
const UsersView = () => {
  const { hasPermission } = useAuth();

  if (!hasPermission("canManageUsers")) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-center text-slate-600 py-8">User management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
