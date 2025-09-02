"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, FolderOpen, Users, BarChart3, Calendar, Archive, Shield } from "lucide-react";

export default function Navbar({ active = "dashboard" }) {
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      SUPERADMIN: "default",
      PROJECT_OWNER: "secondary", 
      SCRUM_MASTER: "default",
      TEAM_MEMBER: "outline",
    };
    return variants[role] || "outline";
  };

  const getRoleLabel = (role) => {
    const labels = {
      SUPERADMIN: "Super Admin",
      PROJECT_OWNER: "Project Owner",
      SCRUM_MASTER: "Scrum Master", 
      TEAM_MEMBER: "Team Member",
    };
    return labels[role] || role;
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        key: "dashboard",
        label: "Dashboard", 
        icon: FolderOpen,
        href: "/dashboard"
      }
    ];

    // Add role-specific items
    const roleSpecificItems = [];

    if (user?.role === 'SUPERADMIN') {
      roleSpecificItems.push(
        {
          key: "admin",
          label: "Admin Panel",
          icon: Shield,
          href: "/admin",
          variant: "destructive"
        },
        {
          key: "users",
          label: "Users",
          icon: Users,
          href: "/admin/users"
        }
      );
    }

    if (user?.role === 'PROJECT_OWNER' || user?.role === 'SCRUM_MASTER') {
      roleSpecificItems.push({
        key: "archive", 
        label: "Archive",
        icon: Archive,
        href: "/archive"
      });
    }

    // Common items for all roles
    const commonItems = [
      {
        key: "reports",
        label: "Reports",
        icon: BarChart3, 
        href: "/reports"
      }
    ];

    return [...baseItems, ...roleSpecificItems, ...commonItems];
  };

  if (!user) return null;

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-800 cursor-pointer" onClick={() => router.push("/dashboard")}>
            ExxonMobil SSHE
          </h1>
          <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-4">
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                variant={active === item.key ? "default" : item.variant || "ghost"}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 ${
                  item.variant === "destructive" 
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                    : ""
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Button>
            ))}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {user.avatar || user.name?.charAt(0) || "U"}
                </div>
                <span className="hidden md:inline">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2">
                <User size={16} /> Profile
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
