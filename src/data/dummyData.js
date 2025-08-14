// Dummy data for the application

export const users = [
  // Superadmin
  {
    id: "user-1",
    email: "superadmin@exxonmobil.com",
    password: "admin123", // In real app, this should be hashed
    name: "Super Admin",
    avatar: "SA",
    role: "superadmin",
    department: "IT",
    createdAt: "2024-01-01",
  },

  // Project Owners
  {
    id: "user-2",
    email: "john.doe@exxonmobil.com",
    password: "john123",
    name: "John Doe",
    avatar: "JD",
    role: "project_owner",
    department: "Process Safety",
    createdAt: "2024-01-15",
  },
  {
    id: "user-3",
    email: "sarah.miller@exxonmobil.com",
    password: "sarah123",
    name: "Sarah Miller",
    avatar: "SM",
    role: "project_owner",
    department: "Personnel Safety",
    createdAt: "2024-01-20",
  },

  // Scrum Masters
  {
    id: "user-4",
    email: "alice.brown@exxonmobil.com",
    password: "alice123",
    name: "Alice Brown",
    avatar: "AB",
    role: "scrum_master",
    department: "Process Safety",
    createdAt: "2024-02-01",
  },
  {
    id: "user-5",
    email: "mike.wilson@exxonmobil.com",
    password: "mike123",
    name: "Mike Wilson",
    avatar: "MW",
    role: "scrum_master",
    department: "Emergency Preparedness",
    createdAt: "2024-02-05",
  },

  // Team Members
  {
    id: "user-6",
    email: "david.johnson@exxonmobil.com",
    password: "david123",
    name: "David Johnson",
    avatar: "DJ",
    role: "team_member",
    department: "Process Safety",
    createdAt: "2024-02-10",
  },
  {
    id: "user-7",
    email: "lisa.garcia@exxonmobil.com",
    password: "lisa123",
    name: "Lisa Garcia",
    avatar: "LG",
    role: "team_member",
    department: "Personnel Safety",
    createdAt: "2024-02-15",
  },
  {
    id: "user-8",
    email: "robert.taylor@exxonmobil.com",
    password: "robert123",
    name: "Robert Taylor",
    avatar: "RT",
    role: "team_member",
    department: "Emergency Preparedness",
    createdAt: "2024-02-20",
  },
  {
    id: "user-9",
    email: "emily.davis@exxonmobil.com",
    password: "emily123",
    name: "Emily Davis",
    avatar: "ED",
    role: "team_member",
    department: "Planning",
    createdAt: "2024-02-25",
  },
];

export const projects = [
  {
    id: "project-1",
    name: "HAZOP Implementation Project",
    description: "Implementation of HAZOP studies across all production facilities",
    department: "Process Safety",
    ownerId: "user-2", // John Doe
    members: ["user-4", "user-6", "user-7"], // Alice Brown, David Johnson, Lisa Garcia
    status: "active",
    priority: "high",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    progress: 65,
    createdAt: "2024-02-28",
    settings: {
      allowMemberEdit: true,
      requireApproval: false,
      notificationEnabled: true,
    },
  },
  {
    id: "project-2",
    name: "Emergency Response Training",
    description: "Comprehensive emergency response training program for all staff",
    department: "Emergency Preparedness",
    ownerId: "user-3", // Sarah Miller
    members: ["user-5", "user-8", "user-9"], // Mike Wilson, Robert Taylor, Emily Davis
    status: "active",
    priority: "medium",
    startDate: "2024-03-15",
    endDate: "2024-07-15",
    progress: 40,
    createdAt: "2024-03-10",
    settings: {
      allowMemberEdit: true,
      requireApproval: true,
      notificationEnabled: true,
    },
  },
  {
    id: "project-3",
    name: "Safety Culture Assessment",
    description: "Annual safety culture assessment and improvement planning",
    department: "Personnel Safety",
    ownerId: "user-2", // John Doe
    members: ["user-4", "user-7"], // Alice Brown, Lisa Garcia
    status: "planning",
    priority: "low",
    startDate: "2024-04-01",
    endDate: "2024-08-31",
    progress: 15,
    createdAt: "2024-03-25",
    settings: {
      allowMemberEdit: false,
      requireApproval: true,
      notificationEnabled: false,
    },
  },
];

export const tasks = [
  // Project 1 Tasks
  {
    id: "task-1",
    projectId: "project-1",
    title: "HAZOP Study Implementation",
    description: "Conduct HAZOP study for Unit A production facility",
    type: "story",
    priority: "high",
    status: "done",
    assigneeId: "user-6", // David Johnson
    createdBy: "user-2", // John Doe
    dueDate: "2024-04-15",
    createdAt: "2024-03-01",
    updatedAt: "2024-04-10",
    progress: 100,
    timeSpent: 40, // hours
    estimatedTime: 35, // hours
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Risk Assessment Framework",
    description: "Develop comprehensive risk assessment framework",
    type: "story",
    priority: "high",
    status: "in-progress",
    assigneeId: "user-7", // Lisa Garcia
    createdBy: "user-2", // John Doe
    dueDate: "2024-05-01",
    createdAt: "2024-03-05",
    updatedAt: "2024-04-20",
    progress: 65,
    timeSpent: 28, // hours
    estimatedTime: 45, // hours
  },
  {
    id: "task-3",
    projectId: "project-1",
    title: "Safety Documentation Update",
    description: "Update all safety documentation based on HAZOP findings",
    type: "story",
    priority: "medium",
    status: "todo",
    assigneeId: "user-4", // Alice Brown
    createdBy: "user-2", // John Doe
    dueDate: "2024-05-15",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-10",
    progress: 0,
    timeSpent: 0,
    estimatedTime: 30,
  },

  // Project 2 Tasks
  {
    id: "task-4",
    projectId: "project-2",
    title: "Training Material Development",
    description: "Create comprehensive training materials for emergency response",
    type: "story",
    priority: "high",
    status: "in-progress",
    assigneeId: "user-8", // Robert Taylor
    createdBy: "user-3", // Sarah Miller
    dueDate: "2024-04-30",
    createdAt: "2024-03-15",
    updatedAt: "2024-04-15",
    progress: 70,
    timeSpent: 35,
    estimatedTime: 50,
  },
  {
    id: "task-5",
    projectId: "project-2",
    title: "Drill Scenario Planning",
    description: "Plan emergency drill scenarios for different departments",
    type: "story",
    priority: "medium",
    status: "todo",
    assigneeId: "user-9", // Emily Davis
    createdBy: "user-3", // Sarah Miller
    dueDate: "2024-05-10",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-20",
    progress: 0,
    timeSpent: 0,
    estimatedTime: 25,
  },

  // Project 3 Tasks
  {
    id: "task-6",
    projectId: "project-3",
    title: "Survey Design",
    description: "Design safety culture assessment survey",
    type: "story",
    priority: "high",
    status: "in-progress",
    assigneeId: "user-7", // Lisa Garcia
    createdBy: "user-2", // John Doe
    dueDate: "2024-04-20",
    createdAt: "2024-03-25",
    updatedAt: "2024-04-10",
    progress: 80,
    timeSpent: 20,
    estimatedTime: 25,
  },
];

export const departments = ["Process Safety", "Personnel Safety", "Emergency Preparedness", "Planning", "IT", "Operations", "Maintenance", "Engineering"];

export const roles = [
  { id: "superadmin", name: "Super Admin", description: "Full system access and user management" },
  { id: "project_owner", name: "Project Owner", description: "Can create and manage projects" },
  { id: "scrum_master", name: "Scrum Master", description: "Can facilitate and manage sprints" },
  { id: "team_member", name: "Team Member", description: "Can work on assigned tasks" },
];

// Helper functions
export const getUserById = (id) => users.find((user) => user.id === id);
export const getProjectById = (id) => projects.find((project) => project.id === id);
export const getTaskById = (id) => tasks.find((task) => task.id === id);
export const getTasksByProjectId = (projectId) => tasks.filter((task) => task.projectId === projectId);
export const getProjectsByOwnerId = (ownerId) => projects.filter((project) => project.ownerId === ownerId);
export const getProjectsByMemberId = (memberId) => projects.filter((project) => project.members.includes(memberId) || project.ownerId === memberId);
export const getTasksByAssigneeId = (assigneeId) => tasks.filter((task) => task.assigneeId === assigneeId);
