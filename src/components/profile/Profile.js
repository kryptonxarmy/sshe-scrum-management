"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, FolderOpen, Users, BarChart3, Calendar, Archive, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProfileEditSection from "./ProfileEditSection";

function ProfilePage() {
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();

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
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">ExxonMobil SSHE</h1>
            <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
          </div>

          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>
      </header>
      <div>INI UNTUK HALAMAN PROFIL</div>
      <ProfileEditSection user={user} />
    </>
  );
}

export default ProfilePage;
