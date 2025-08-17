"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, FolderOpen, Users, BarChart3, Calendar } from "lucide-react";

export default function Navbar({ active = "tasks", showTasks = false }) {
  const { user, logout, hasPermission } = useAuth();
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

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-800">ExxonMobil SSHE</h1>
          <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-4">
            <Button variant={active === "projects" ? "default" : "ghost"} onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
              <FolderOpen size={16} /> Projects
            </Button>
            <Button variant={active === "tasks" ? "default" : "ghost"} onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
              <Calendar size={16} /> Calendar
            </Button>
            {showTasks && (
              <Button variant={active === "kanban" ? "default" : "ghost"} onClick={() => router.push("/tasks?projectId=" + (user?.ownedProjects?.[0]?.id || ""))} className="flex items-center gap-2">
                <BarChart3 size={16} /> Tasks
              </Button>
            )}
            {hasPermission && hasPermission("canManageUsers") && (
              <Button variant={active === "users" ? "default" : "ghost"} onClick={() => router.push("/users")} className="flex items-center gap-2">
                <Users size={16} /> Users
              </Button>
            )}
            <Button variant={active === "reports" ? "default" : "ghost"} onClick={() => router.push("/reports")} className="flex items-center gap-2">
              <BarChart3 size={16} /> Reports
            </Button>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">{user.avatar || user.name?.charAt(0) || "U"}</div>
                <span className="hidden md:inline">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2">
                <User size={16} /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings size={16} /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                <LogOut size={16} /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
