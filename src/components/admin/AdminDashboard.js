"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Users } from "lucide-react";
import AdminUsersPage from "@/app/admin/users/page";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState("users");
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

  // Only allow superadmin access
  if (user.role !== 'SUPERADMIN') {
    router.push("/unauthorized");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">Admin Panel - ExxonMobil SSHE</h1>
            <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation - Only Users Management */}
            <nav className="hidden md:flex space-x-4">
              <Button variant={activeView === "users" ? "default" : "ghost"} onClick={() => setActiveView("users")} className="flex items-center gap-2">
                <Users size={16} />
                User Management
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
        {activeView === "users" && <AdminUsersPage />}
      </main>
    </div>
  );
};

export default AdminDashboard;
