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
      

      {/* Main Content */}
      <main className="p-6">
        {activeView === "users" && <AdminUsersPage />}
      </main>
    </div>
  );
};

export default AdminDashboard;
