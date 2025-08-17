"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem("sshe-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Logging in user:", email);

      // Call login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userWithoutPassword = data.user;

      setUser(userWithoutPassword);
      localStorage.setItem("sshe-user", JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sshe-user");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("sshe-user", JSON.stringify(updatedUser));
  };

  // Permission checking functions
  const hasPermission = (permission) => {
    if (!user) return false;

    const permissions = {
      SUPERADMIN: ["manage_users", "manage_projects", "manage_tasks", "view_all", "create_projects", "delete_projects"],
      PROJECT_OWNER: ["create_projects", "manage_own_projects", "manage_tasks", "view_projects", "manage_project_members"],
      SCRUM_MASTER: ["manage_tasks", "view_projects", "facilitate_sprints", "manage_project_members"],
      TEAM_MEMBER: ["view_tasks", "update_own_tasks", "view_assigned_projects"],
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  const canManageProject = (projectOwnerId) => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER" && user.id === projectOwnerId) return true;
    return false;
  };

  const canCreateProject = () => {
    if (!user) return false;
    return user.role === "SUPERADMIN" || user.role === "PROJECT_OWNER";
  };

  const canManageProjectMembers = (projectOwnerId, project = null) => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER" && user.id === projectOwnerId) return true;
    
    // Allow Scrum Master if they are a member of the project
    if (user.role === "SCRUM_MASTER" && project) {
      // Check if user is the project owner
      if (project.ownerId === user.id) return true;
      
      // Check if user is a member of the project
      if (Array.isArray(project.members)) {
        // If array of userId (simple array)
        if (project.members.length > 0 && typeof project.members[0] === "string") {
          return project.members.includes(user.id);
        } else {
          // If array of member objects (from backend API)
          // Check for member objects with user property (from API response)
          if (project.members.some(m => m.user && m.user.id === user.id)) return true;
          // Check for direct user objects (from some API responses)
          if (project.members.some(m => m.id === user.id)) return true;
          // Check for membership objects with userId property
          if (project.members.some(m => m.userId === user.id)) return true;
        }
      }
    }
    
    return false;
  };

  const canViewProject = (project) => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (project.ownerId === user.id) return true;
    
    // Check if user is a member of the project
    if (Array.isArray(project.members)) {
      // If array of userId (simple array)
      if (project.members.length > 0 && typeof project.members[0] === "string") {
        return project.members.includes(user.id);
      } else {
        // If array of member objects (from backend API)
        // Check for member objects with user property (from API response)
        if (project.members.some(m => m.user && m.user.id === user.id)) return true;
        // Check for direct user objects (from some API responses)
        if (project.members.some(m => m.id === user.id)) return true;
        // Check for membership objects with userId property
        if (project.members.some(m => m.userId === user.id)) return true;
      }
    }
    return false;
  };

  const canEditTask = (task) => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER") return true;
    if (user.role === "SCRUM_MASTER") return true;
    if (user.role === "TEAM_MEMBER" && task.assigneeId === user.id) return true;
    return false;
  };

  const canCreateTask = () => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER") return true;
    if (user.role === "SCRUM_MASTER") return true;
    return false;
  };

  const canUpdateTaskProgress = (task) => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER") return true;
    if (user.role === "SCRUM_MASTER") return true;
    if (user.role === "TEAM_MEMBER" && task.assigneeId === user.id) return true;
    return false;
  };

  const canDeleteTask = (task) => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER") return true;
    if (user.role === "SCRUM_MASTER") return true;
    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    canManageProject,
    canCreateProject,
    canManageProjectMembers,
    canViewProject,
    canEditTask,
    canCreateTask,
    canUpdateTaskProgress,
    canDeleteTask,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
