"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, FolderOpen, Users, BarChart3, Archive, ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import ArchiveProjects from "@/components/project/ArchiveProjects";
import ReleaseReports from "@/components/reports/ReleaseReports";
import { useState } from "react";

const ArchivePage = () => {
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState("projects");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleBadgeVariant = (role) => {
    if (!role) return "outline";
    const variants = {
      SUPERADMIN: "default",
      PROJECT_OWNER: "secondary", 
      SCRUM_MASTER: "default",
      TEAM_MEMBER: "outline",
    };
    return variants[role] || "outline";
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    const labels = {
      SUPERADMIN: "Super Admin",
      PROJECT_OWNER: "Project Owner", 
      SCRUM_MASTER: "Scrum Master",
      TEAM_MEMBER: "Team Member",
    };
    return labels[role] || role;
  };

  // Add loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["SUPERADMIN", "PROJECT_OWNER"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Same as Dashboard */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-800">ExxonMobil SSHE</h1>
              <Badge variant={getRoleBadgeVariant(user?.role)}>{getRoleLabel(user?.role)}</Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <nav className="hidden md:flex space-x-4">
                <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </Button>

                <Button variant={activeView === "projects" ? "default" : "ghost"} onClick={() => setActiveView("projects")} className="flex items-center gap-2">
                  <Archive size={16} />
                  Released Projects
                </Button>

                <Button variant={activeView === "reports" ? "default" : "ghost"} onClick={() => setActiveView("reports")} className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  Release Reports
                </Button>
              </nav>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {user?.avatar || user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="hidden md:inline">{user?.name || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500">{user?.email || "No email"}</p>
                    <Badge variant={getRoleBadgeVariant(user?.role)} className="mt-1 text-xs">
                      {getRoleLabel(user?.role)}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeView === "projects" && <ArchiveProjects />}
          {activeView === "reports" && <ReleaseReports />}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ArchivePage;
