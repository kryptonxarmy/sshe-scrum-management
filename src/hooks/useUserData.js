"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useUserData = () => {
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's accessible projects
  const fetchUserProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user.id}/projects`);
      if (!response.ok) {
        throw new Error("Failed to fetch user projects");
      }
      const data = await response.json();
      setUserProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch user's accessible tasks
  const fetchUserTasks = useCallback(async (filters = {}) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });

      const response = await fetch(`/api/users/${user.id}/tasks?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user tasks");
      }
      const data = await response.json();
      setUserTasks(data.tasks || []);
      return data.tasks || [];
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Get tasks by function and status
  const getTasksByFunctionAndStatus = (functionId, status = null) => {
    return userTasks.filter(task => {
      // Map task attributes to function categories
      const taskFunctionId = getTaskFunctionCategory(task);
      const matchesFunction = taskFunctionId === functionId;
      const matchesStatus = status ? task.status === status.toUpperCase() : true;
      return matchesFunction && matchesStatus;
    });
  };

  // Get task function category based on task or project department
  const getTaskFunctionCategory = (task) => {
    // If task has a specific functionId, use it
    if (task.functionId) {
      return task.functionId;
    }
    
    // Otherwise, map based on project department or task properties
    if (task.project?.department) {
      const departmentMapping = {
        "Process Safety": "process-safety",
        "Personnel Safety": "personnel-safety", 
        "Emergency Preparedness": "epr",
        "Planning": "planning",
      };
      return departmentMapping[task.project.department] || "process-safety";
    }
    
    // Default fallback
    return "process-safety";
  };

  // Get task counts for a function
  const getFunctionTaskCounts = (functionId) => {
    const functionTasks = userTasks.filter(task => getTaskFunctionCategory(task) === functionId);
    return {
      total: functionTasks.length,
      todo: functionTasks.filter(task => task.status === 'TODO').length,
      inProgress: functionTasks.filter(task => task.status === 'IN_PROGRESS').length,
      done: functionTasks.filter(task => task.status === 'DONE').length,
    };
  };

  // Get all available functions from user's tasks
  const getAvailableFunctions = () => {
    // Get unique function categories from all user tasks
    const functionCounts = {};
    
    userTasks.forEach(task => {
      const functionId = getTaskFunctionCategory(task);
      if (!functionCounts[functionId]) {
        functionCounts[functionId] = 0;
      }
      functionCounts[functionId]++;
    });

    return Object.entries(functionCounts).map(([functionId, count]) => ({
      id: functionId,
      name: getFunctionDisplayName(functionId),
      count: count,
    }));
  };

  // Helper to get function display names
  const getFunctionDisplayName = (functionId) => {
    const functionNames = {
      "process-safety": "Process Safety",
      "personnel-safety": "Personnel Safety",
      "epr": "EP&R",
      "planning": "Planning",
    };
    return functionNames[functionId] || functionId;
  };

  // Initialize data when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserProjects();
      fetchUserTasks();
    } else {
      setUserProjects([]);
      setUserTasks([]);
    }
  }, [user?.id, fetchUserProjects, fetchUserTasks]);

  const refreshData = useCallback(() => {
    fetchUserProjects();
    fetchUserTasks();
  }, [fetchUserProjects, fetchUserTasks]);

  return {
    userProjects,
    userTasks,
    loading,
    error,
    fetchUserProjects,
    fetchUserTasks,
    getTasksByFunctionAndStatus,
    getFunctionTaskCounts,
    getAvailableFunctions,
    refreshData,
  };
};
