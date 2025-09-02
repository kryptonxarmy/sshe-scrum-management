"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, FolderOpen, Users, BarChart3, Plus, Eye, Edit, Trash2, Calendar, Archive } from "lucide-react";
import TaskBoard from "@/components/TaskBoard";
import ProjectManagement from "@/components/project/ProjectManagement";
import CalendarDashboardData from "@/components/dashboard/CalendarDashboardData";
// import ReportsPageFixed from "@/components/reports/ReportsPageFixed";
import ProjectOwnerReports from "@/components/reports/ProjectOwnerReports";

const Dashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const [activeView, setActiveView] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  // Redirect superadmin to admin panel
  useEffect(() => {
    if (user && user.role === 'SUPERADMIN') {
      router.push("/admin");
    }
  }, [user, router]);

  const getRoleBadgeVariant = (role) => {
    const variants = {
      superadmin: "default",
      project_owner: "secondary",
      team_member: "outline",
    };
    return variants[role] || "outline";
  };

  const getRoleLabel = (role) => {
    const labels = {
      superadmin: "Super Admin",
      project_owner: "Project Owner",
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
            <h1 className="text-2xl font-bold text-slate-800">ExxonMobil SSHE</h1>
            <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Button variant={activeView === "projects" ? "default" : "ghost"} onClick={() => setActiveView("projects")} className="flex items-center gap-2">
                <FolderOpen size={16} />
                Projects
              </Button>

              <Button variant={activeView === "tasks" ? "default" : "ghost"} onClick={() => setActiveView("tasks")} className="flex items-center gap-2">
                <Calendar size={16} />
                Calendar
              </Button>

              {hasPermission("canManageUsers") && (
                <Button variant={activeView === "users" ? "default" : "ghost"} onClick={() => setActiveView("users")} className="flex items-center gap-2">
                  <Users size={16} />
                  Users
                </Button>
              )}

              {user?.role === 'SUPERADMIN' && (
               
                <Button variant="ghost" onClick={() => router.push("/admin")} className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Settings size={16} />
                  Admin Panel
                </Button>
              )}

              <Button variant={activeView === "reports" ? "default" : "ghost"} onClick={() => setActiveView("reports")} className="flex items-center gap-2">
                <BarChart3 size={16} />
                Reports
              </Button>

              {(user?.role === 'SUPERADMIN' || user?.role === 'PROJECT_OWNER') && (
                <Button variant="ghost" onClick={() => router.push("/archive")} className="flex items-center gap-2">
                  <Archive size={16} />
                  Released Projects
                </Button>
              )}
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
                <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2">
                  <User size={16} />
                  Profile
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
        {activeView === "tasks" && <TasksView />}
        {activeView === "users" && <UsersView />}
        {activeView === "reports" && <ReportsView />}
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
const TasksView = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Calendar</h2>
      </div>
      <CalendarDashboardData />
    </div>
  );
};

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

// Reports View Component
const ReportsView = () => {
  const { user } = useAuth();

  // Determine which report component to show based on user role
  if (user?.role === 'PROJECT_OWNER') {
    return <ProjectOwnerReports />;
  }
  if (user?.role === 'TEAM_MEMBER') {
    const TeamMemberReports = require('@/components/reports/TeamMemberReports').default;
    return <TeamMemberReports />;
  }
  // For other roles, show the general reports page
  // return <ReportsPageFixed />;
};

export default Dashboard;
