const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Dummy data converted from the existing dummyData.js
const usersData = [
  // Superadmin
  {
    id: "user-1",
    email: "superadmin@exxonmobil.com",
    name: "Super Admin",
    role: "SUPERADMIN",
    department: "IT",
    avatar: "SA",
  },

  // Project Owners
  {
    id: "user-2",
    email: "john.doe@exxonmobil.com",
    name: "John Doe",
    role: "PROJECT_OWNER",
    department: "Process Safety",
    avatar: "JD",
  },
  {
    id: "user-3",
    email: "sarah.miller@exxonmobil.com",
    name: "Sarah Miller",
    role: "PROJECT_OWNER",
    department: "Personnel Safety",
    avatar: "SM",
  },

  // Scrum Masters
  {
    id: "user-4",
    email: "alice.brown@exxonmobil.com",
    name: "Alice Brown",
    role: "SCRUM_MASTER",
    department: "Process Safety",
    avatar: "AB",
  },
  {
    id: "user-5",
    email: "mike.wilson@exxonmobil.com",
    name: "Mike Wilson",
    role: "SCRUM_MASTER",
    department: "Emergency Preparedness",
    avatar: "MW",
  },

  // Team Members
  {
    id: "user-6",
    email: "david.johnson@exxonmobil.com",
    name: "David Johnson",
    role: "TEAM_MEMBER",
    department: "Process Safety",
    avatar: "DJ",
  },
  {
    id: "user-7",
    email: "lisa.garcia@exxonmobil.com",
    name: "Lisa Garcia",
    role: "TEAM_MEMBER",
    department: "Personnel Safety",
    avatar: "LG",
  },
  {
    id: "user-8",
    email: "robert.taylor@exxonmobil.com",
    name: "Robert Taylor",
    role: "TEAM_MEMBER",
    department: "Emergency Preparedness",
    avatar: "RT",
  },
  {
    id: "user-9",
    email: "emily.davis@exxonmobil.com",
    name: "Emily Davis",
    role: "TEAM_MEMBER",
    department: "Planning",
    avatar: "ED",
  },
];

const projectsData = [
  {
    id: "project-1",
    name: "HAZOP Implementation Project",
    description: "Implementation of HAZOP studies across all production facilities",
    department: "Process Safety",
    ownerId: "user-2",
    status: "ACTIVE",
    priority: "HIGH",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-06-30"),
    progress: 65,
  },
  {
    id: "project-2",
    name: "Emergency Response Training",
    description: "Comprehensive emergency response training program for all staff",
    department: "Emergency Preparedness",
    ownerId: "user-3",
    status: "ACTIVE",
    priority: "MEDIUM",
    startDate: new Date("2024-03-15"),
    endDate: new Date("2024-07-15"),
    progress: 40,
  },
  {
    id: "project-3",
    name: "Safety Culture Assessment",
    description: "Annual safety culture assessment and improvement planning",
    department: "Personnel Safety",
    ownerId: "user-2",
    status: "PLANNING",
    priority: "LOW",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-08-31"),
    progress: 15,
  },
  {
    id: "project-4",
    name: "Tier 3 Classification",
    description: "Tier 3 process safety classification and compliance project",
    department: "Process Safety",
    ownerId: "user-2",
    status: "ACTIVE",
    priority: "HIGH",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    progress: 0,
  },
];

const projectMembersData = [
  // Project 1 members
  { projectId: "project-1", userId: "user-4" }, // Alice Brown
  { projectId: "project-1", userId: "user-6" }, // David Johnson
  { projectId: "project-1", userId: "user-7" }, // Lisa Garcia

  // Project 2 members
  { projectId: "project-2", userId: "user-5" }, // Mike Wilson
  { projectId: "project-2", userId: "user-8" }, // Robert Taylor
  { projectId: "project-2", userId: "user-9" }, // Emily Davis

  // Project 3 members
  { projectId: "project-3", userId: "user-4" }, // Alice Brown
  { projectId: "project-3", userId: "user-7" }, // Lisa Garcia

  // Project 4 members
  { projectId: "project-4", userId: "user-2" }, // John Doe (owner)
  { projectId: "project-4", userId: "user-4" }, // Alice Brown
  { projectId: "project-4", userId: "user-6" }, // David Johnson
];

const projectSettingsData = [
  {
    projectId: "project-1",
    allowMemberEdit: true,
    requireApproval: false,
    notificationEnabled: true,
  },
  {
    projectId: "project-2",
    allowMemberEdit: true,
    requireApproval: true,
    notificationEnabled: true,
  },
  {
    projectId: "project-3",
    allowMemberEdit: false,
    requireApproval: true,
    notificationEnabled: false,
  },
];

const tasksData = [
  // Project 1 Tasks
  {
    id: "task-1",
    projectId: "project-1",
    title: "HAZOP Study Implementation",
    description: "Conduct HAZOP study for Unit A production facility",
    type: "STORY",
    priority: "HIGH",
    status: "DONE",
    assigneeId: "user-6",
    createdById: "user-2",
    dueDate: new Date("2024-04-15"),
    progress: 100,
    timeSpent: 40,
    estimatedTime: 35,
    completedAt: new Date("2024-04-10"),
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Risk Assessment Framework",
    description: "Develop comprehensive risk assessment framework",
    type: "STORY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigneeId: "user-7",
    createdById: "user-2",
    dueDate: new Date("2024-05-01"),
    progress: 65,
    timeSpent: 28,
    estimatedTime: 45,
  },
  {
    id: "task-3",
    projectId: "project-1",
    title: "Safety Documentation Update",
    description: "Update all safety documentation based on HAZOP findings",
    type: "STORY",
    priority: "MEDIUM",
    status: "TODO",
    assigneeId: "user-4",
    createdById: "user-2",
    dueDate: new Date("2024-05-15"),
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
    type: "STORY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigneeId: "user-8",
    createdById: "user-3",
    dueDate: new Date("2024-04-30"),
    progress: 70,
    timeSpent: 35,
    estimatedTime: 50,
  },
  {
    id: "task-5",
    projectId: "project-2",
    title: "Drill Scenario Planning",
    description: "Plan emergency drill scenarios for different departments",
    type: "STORY",
    priority: "MEDIUM",
    status: "TODO",
    assigneeId: "user-9",
    createdById: "user-3",
    dueDate: new Date("2024-05-10"),
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
    type: "STORY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigneeId: "user-7",
    createdById: "user-2",
    dueDate: new Date("2024-04-20"),
    progress: 80,
    timeSpent: 20,
    estimatedTime: 25,
  },

  // Project 4 Tasks
  {
    id: "task-10",
    projectId: "project-4",
    title: "Initial Risk Assessment",
    description: "Perform initial risk assessment for Tier 3 units.",
    type: "STORY",
    priority: "HIGH",
    status: "TODO",
    assigneeId: "user-4",
    createdById: "user-2",
    dueDate: new Date("2025-02-15"),
    progress: 0,
    timeSpent: 0,
    estimatedTime: 20,
  },
  {
    id: "task-11",
    projectId: "project-4",
    title: "Documentation Review",
    description: "Review all Tier 3 documentation for compliance.",
    type: "TASK",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    assigneeId: "user-6",
    createdById: "user-2",
    dueDate: new Date("2025-03-10"),
    progress: 40,
    timeSpent: 8,
    estimatedTime: 20,
  },
  {
    id: "task-12",
    projectId: "project-4",
    title: "Training Session",
    description: "Conduct Tier 3 safety training for all team members.",
    type: "STORY",
    priority: "LOW",
    status: "TODO",
    assigneeId: "user-4",
    createdById: "user-2",
    dueDate: new Date("2025-04-01"),
    progress: 0,
    timeSpent: 0,
    estimatedTime: 10,
  },
];

const functionsData = [
  // Project 1 Functions
  {
    id: "func-1",
    name: "Sprint Planning",
    description: "Plan sprint goals and tasks",
    projectId: "project-1",
    order: 1,
  },
  {
    id: "func-2",
    name: "Daily Standups",
    description: "Daily team synchronization meetings",
    projectId: "project-1",
    order: 2,
  },
  {
    id: "func-3",
    name: "Sprint Review",
    description: "Review sprint outcomes and deliverables",
    projectId: "project-1",
    order: 3,
  },
  {
    id: "func-4",
    name: "Sprint Retrospective",
    description: "Reflect on sprint process and improvements",
    projectId: "project-1",
    order: 4,
  },

  // Project 2 Functions
  {
    id: "func-5",
    name: "Sprint Planning",
    description: "Plan sprint goals and tasks",
    projectId: "project-2",
    order: 1,
  },
  {
    id: "func-6",
    name: "Daily Standups",
    description: "Daily team synchronization meetings",
    projectId: "project-2",
    order: 2,
  },

  // Project 3 Functions
  {
    id: "func-7",
    name: "Sprint Planning",
    description: "Plan sprint goals and tasks",
    projectId: "project-3",
    order: 1,
  },
];

const systemSettingsData = {
  id: "default-settings",
  siteName: "SSHE Scrum",
  siteDescription: "Safety, Security, Health & Environment Scrum Management",
  primaryColor: "#3B82F6",
  secondaryColor: "#10B981",
  allowUserRegistration: false,
  maxProjectsPerUser: 10,
  maxTasksPerProject: 1000,
  sessionTimeout: 24,
  passwordMinLength: 8,
  enableAuditLog: true,
};

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.taskAttachment.deleteMany();
    await prisma.taskDependency.deleteMany();
    await prisma.task.deleteMany();
    await prisma.function.deleteMany();
    await prisma.sprint.deleteMany();
    await prisma.projectSettings.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemSettings.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.report.deleteMany();

    // Create system settings
    console.log('⚙️ Creating system settings...');
    await prisma.systemSettings.create({
      data: systemSettingsData,
    });

    // Create users
    console.log('👥 Creating users...');
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    for (const userData of usersData) {
      await prisma.user.create({
        data: {
          ...userData,
          password: defaultPassword,
          createdAt: new Date('2024-01-01'),
        },
      });
    }

    // Create projects
    console.log('📁 Creating projects...');
    for (const projectData of projectsData) {
      await prisma.project.create({
        data: {
          ...projectData,
          createdAt: new Date('2024-02-28'),
        },
      });
    }

    // Create project members
    console.log('👨‍💼 Creating project members...');
    for (const memberData of projectMembersData) {
      await prisma.projectMember.create({
        data: {
          ...memberData,
          joinedAt: new Date('2024-03-01'),
        },
      });
    }

    // Create project settings
    console.log('⚙️ Creating project settings...');
    for (const settingsData of projectSettingsData) {
      await prisma.projectSettings.create({
        data: settingsData,
      });
    }

    // Create functions
    console.log('🔧 Creating functions...');
    for (const functionData of functionsData) {
      await prisma.function.create({
        data: {
          ...functionData,
          createdAt: new Date('2024-03-01'),
        },
      });
    }

    // Create tasks
    console.log('📋 Creating tasks...');
    for (const taskData of tasksData) {
      await prisma.task.create({
        data: {
          ...taskData,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-04-01'),
        },
      });
    }

    // Create some sample activity logs
    console.log('📊 Creating activity logs...');
    await prisma.activityLog.createMany({
      data: [
        {
          type: 'PROJECT_CREATED',
          description: 'Project "HAZOP Implementation Project" was created',
          userId: 'user-2',
          projectId: 'project-1',
          createdAt: new Date('2024-02-28'),
        },
        {
          type: 'TASK_CREATED',
          description: 'Task "HAZOP Study Implementation" was created',
          userId: 'user-2',
          projectId: 'project-1',
          taskId: 'task-1',
          createdAt: new Date('2024-03-01'),
        },
        {
          type: 'TASK_ASSIGNED',
          description: 'Task "HAZOP Study Implementation" was assigned to David Johnson',
          userId: 'user-2',
          projectId: 'project-1',
          taskId: 'task-1',
          createdAt: new Date('2024-03-01'),
        },
        {
          type: 'TASK_STATUS_CHANGED',
          description: 'Task "HAZOP Study Implementation" status changed to DONE',
          userId: 'user-6',
          projectId: 'project-1',
          taskId: 'task-1',
          createdAt: new Date('2024-04-10'),
        },
      ],
    });

    // Create some sample notifications
    console.log('🔔 Creating notifications...');
    await prisma.notification.createMany({
      data: [
        {
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: 'You have been assigned to task "Risk Assessment Framework"',
          userId: 'user-7',
          taskId: 'task-2',
          actionUrl: '/tasks/task-2',
          createdAt: new Date('2024-03-05'),
        },
        {
          type: 'TASK_DUE_SOON',
          title: 'Task Due Soon',
          message: 'Task "Training Material Development" is due in 2 days',
          userId: 'user-8',
          taskId: 'task-4',
          actionUrl: '/tasks/task-4',
          createdAt: new Date('2024-04-28'),
        },
        {
          type: 'PROJECT_UPDATE',
          title: 'Project Update',
          message: 'HAZOP Implementation Project has been updated',
          userId: 'user-6',
          projectId: 'project-1',
          actionUrl: '/projects/project-1',
          createdAt: new Date('2024-04-01'),
        },
      ],
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Data created:');
    console.log(`  - ${usersData.length} users`);
    console.log(`  - ${projectsData.length} projects`);
    console.log(`  - ${projectMembersData.length} project memberships`);
    console.log(`  - ${tasksData.length} tasks`);
    console.log(`  - ${functionsData.length} functions`);
    console.log('  - 4 activity logs');
    console.log('  - 3 notifications');
    console.log('  - 1 system settings record');
    
    console.log('\n🔐 Default login credentials:');
    console.log('  Superadmin: superadmin@exxonmobil.com / password123');
    console.log('  Project Owner: john.doe@exxonmobil.com / password123');
    console.log('  Scrum Master: alice.brown@exxonmobil.com / password123');
    console.log('  Team Member: david.johnson@exxonmobil.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
