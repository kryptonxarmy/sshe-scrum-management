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
    <div className="max-w-2xl mx-auto my-auto h-full bg-white p-6 rounded-lg shadow-md">
      <ProfileEditSection user={user} />
    </div>
  );
}

export default ProfilePage;
