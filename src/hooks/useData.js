"use client";

import { useState, useEffect } from "react";
import { projects as initialProjects, tasks as initialTasks, users as initialUsers, getProjectsByOwnerId, getProjectsByMemberId, getTasksByProjectId, getTasksByAssigneeId } from "@/data/dummyData";

export const useData = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [users, setUsers] = useState(initialUsers);

  // Project operations
  const addProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      progress: 0,
      status: "planning",
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId, updatedData) => {
    setProjects((prev) => prev.map((project) => (project.id === projectId ? { ...project, ...updatedData } : project)));
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    // Also delete related tasks
    setTasks((prev) => prev.filter((task) => task.projectId !== projectId));
  };

  // Task operations
  const addTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      timeSpent: 0,
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId, updatedData) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updatedData, updatedAt: new Date().toISOString() } : task)));
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  // User operations
  const updateUserRole = (userId, newRole) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
  };

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  // Get functions
  const getProjectsForUser = (user) => {
    if (!user) return [];

    if (user.role === "superadmin") {
      return projects;
    } else if (user.role === "project_owner") {
      return getProjectsByOwnerId(user.id);
    } else {
      return getProjectsByMemberId(user.id);
    }
  };

  const getTasksForUser = (user) => {
    if (!user) return [];

    if (user.role === "superadmin" || user.role === "project_owner") {
      const userProjects = getProjectsForUser(user);
      return tasks.filter((task) => userProjects.some((project) => project.id === task.projectId));
    } else {
      return getTasksByAssigneeId(user.id);
    }
  };

  const getProjectById = (projectId) => {
    return projects.find((project) => project.id === projectId);
  };

  const getTaskById = (taskId) => {
    return tasks.find((task) => task.id === taskId);
  };

  const getUserById = (userId) => {
    return users.find((user) => user.id === userId);
  };

  return {
    // Data
    projects,
    tasks,
    users,

    // Project operations
    addProject,
    updateProject,
    deleteProject,

    // Task operations
    addTask,
    updateTask,
    deleteTask,

    // User operations
    updateUserRole,
    addUser,

    // Get functions
    getProjectsForUser,
    getTasksForUser,
    getProjectById,
    getTaskById,
    getUserById,
    getTasksByProjectId: (projectId) => tasks.filter((task) => task.projectId === projectId),
  };
};
