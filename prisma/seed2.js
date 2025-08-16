const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Additional seed data for testing Scrum Master project member permissions
const additionalUsersData = [
  // Additional Scrum Masters for testing
  {
    id: "user-10",
    email: "james.wilson@pertamina.com",
    name: "James Wilson",
    role: "SCRUM_MASTER",
    department: "Process Safety",
    avatar: "JW",
  },
  {
    id: "user-11",
    email: "anna.martinez@pertamina.com",
    name: "Anna Martinez",
    role: "SCRUM_MASTER",
    department: "Personnel Safety",
    avatar: "AM",
  },
  // Additional Team Members
  {
    id: "user-12",
    email: "carlos.rodriguez@pertamina.com",
    name: "Carlos Rodriguez",
    role: "TEAM_MEMBER",
    department: "Process Safety",
    avatar: "CR",
  },
  {
    id: "user-13",
    email: "maria.gonzalez@pertamina.com",
    name: "Maria Gonzalez",
    role: "TEAM_MEMBER",
    department: "Personnel Safety",
    avatar: "MG",
  },
];

const additionalProjectsData = [
  {
    id: "project-4",
    name: "Process Optimization Initiative",
    description: "Optimize production processes to improve efficiency and reduce environmental impact",
    department: "Process Safety",
    ownerId: "user-2", // John Doe
    status: "ACTIVE",
    priority: "HIGH",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-09-30"),
    progress: 30,
  },
  {
    id: "project-5",
    name: "Employee Wellness Program",
    description: "Comprehensive employee wellness and mental health support program",
    department: "Personnel Safety",
    ownerId: "user-3", // Sarah Miller
    status: "PLANNING",
    priority: "MEDIUM",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-10-31"),
    progress: 10,
  },
];

const additionalProjectMembersData = [
  // Project 4 members - James Wilson (Scrum Master) as member
  { projectId: "project-4", userId: "user-10" }, // James Wilson (Scrum Master)
  { projectId: "project-4", userId: "user-6" },  // David Johnson
  { projectId: "project-4", userId: "user-12" }, // Carlos Rodriguez

  // Project 5 members - Anna Martinez (Scrum Master) as member
  { projectId: "project-5", userId: "user-11" }, // Anna Martinez (Scrum Master)
  { projectId: "project-5", userId: "user-7" },  // Lisa Garcia
  { projectId: "project-5", userId: "user-13" }, // Maria Gonzalez

  // Add Scrum Masters to existing projects
  { projectId: "project-1", userId: "user-10" }, // Add James Wilson to project 1
  { projectId: "project-2", userId: "user-11" }, // Add Anna Martinez to project 2
];

const additionalProjectSettingsData = [
  {
    projectId: "project-4",
    allowMemberEdit: true,
    requireApproval: false,
    notificationEnabled: true,
  },
  {
    projectId: "project-5",
    allowMemberEdit: true,
    requireApproval: true,
    notificationEnabled: true,
  },
];

const additionalTasksData = [
  // Project 4 Tasks
  {
    id: "task-7",
    projectId: "project-4",
    title: "Process Analysis Report",
    description: "Analyze current process efficiency and identify improvement opportunities",
    type: "STORY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigneeId: "user-12", // Carlos Rodriguez
    createdById: "user-10", // James Wilson (Scrum Master)
    dueDate: new Date("2024-05-15"),
    progress: 40,
    timeSpent: 15,
    estimatedTime: 30,
  },
  {
    id: "task-8",
    projectId: "project-4",
    title: "Equipment Optimization Study",
    description: "Study equipment performance and recommend optimization strategies",
    type: "STORY",
    priority: "MEDIUM",
    status: "TODO",
    assigneeId: "user-6", // David Johnson
    createdById: "user-2", // John Doe (Project Owner)
    dueDate: new Date("2024-06-01"),
    progress: 0,
    timeSpent: 0,
    estimatedTime: 40,
  },

  // Project 5 Tasks
  {
    id: "task-9",
    projectId: "project-5",
    title: "Wellness Program Survey",
    description: "Design and conduct employee wellness needs assessment survey",
    type: "STORY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigneeId: "user-13", // Maria Gonzalez
    createdById: "user-11", // Anna Martinez (Scrum Master)
    dueDate: new Date("2024-05-20"),
    progress: 60,
    timeSpent: 12,
    estimatedTime: 20,
  },
  {
    id: "task-10",
    projectId: "project-5",
    title: "Mental Health Resources Guide",
    description: "Create comprehensive guide for mental health resources and support",
    type: "STORY",
    priority: "MEDIUM",
    status: "TODO",
    assigneeId: "user-7", // Lisa Garcia
    createdById: "user-3", // Sarah Miller (Project Owner)
    dueDate: new Date("2024-06-15"),
    progress: 0,
    timeSpent: 0,
    estimatedTime: 25,
  },
];

const additionalFunctionsData = [
  // Project 4 Functions
  {
    id: "func-8",
    name: "Sprint Planning",
    description: "Plan sprint goals and tasks",
    projectId: "project-4",
    order: 1,
  },
  {
    id: "func-9",
    name: "Daily Standups",
    description: "Daily team synchronization meetings",
    projectId: "project-4",
    order: 2,
  },

  // Project 5 Functions
  {
    id: "func-10",
    name: "Sprint Planning",
    description: "Plan sprint goals and tasks",
    projectId: "project-5",
    order: 1,
  },
  {
    id: "func-11",
    name: "Daily Standups",
    description: "Daily team synchronization meetings",
    projectId: "project-5",
    order: 2,
  },
];

async function main() {
  console.log('🌱 Starting additional database seeding for Scrum Master permissions...');

  try {
    // Create additional users
    console.log('👥 Creating additional users...');
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    for (const userData of additionalUsersData) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userData.id }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            ...userData,
            password: defaultPassword,
            createdAt: new Date('2024-01-01'),
          },
        });
      }
    }

    // Create additional projects
    console.log('📁 Creating additional projects...');
    for (const projectData of additionalProjectsData) {
      // Check if project already exists
      const existingProject = await prisma.project.findUnique({
        where: { id: projectData.id }
      });
      
      if (!existingProject) {
        await prisma.project.create({
          data: {
            ...projectData,
            createdAt: new Date('2024-03-01'),
          },
        });
      }
    }

    // Create additional project members
    console.log('👨‍💼 Creating additional project members...');
    for (const memberData of additionalProjectMembersData) {
      // Check if membership already exists
      const existingMembership = await prisma.projectMember.findFirst({
        where: {
          projectId: memberData.projectId,
          userId: memberData.userId,
        }
      });
      
      if (!existingMembership) {
        await prisma.projectMember.create({
          data: {
            ...memberData,
            joinedAt: new Date('2024-03-01'),
          },
        });
      }
    }

    // Create additional project settings
    console.log('⚙️ Creating additional project settings...');
    for (const settingsData of additionalProjectSettingsData) {
      // Check if settings already exist
      const existingSettings = await prisma.projectSettings.findUnique({
        where: { projectId: settingsData.projectId }
      });
      
      if (!existingSettings) {
        await prisma.projectSettings.create({
          data: settingsData,
        });
      }
    }

    // Create additional functions
    console.log('🔧 Creating additional functions...');
    for (const functionData of additionalFunctionsData) {
      // Check if function already exists
      const existingFunction = await prisma.function.findUnique({
        where: { id: functionData.id }
      });
      
      if (!existingFunction) {
        await prisma.function.create({
          data: {
            ...functionData,
            createdAt: new Date('2024-03-01'),
          },
        });
      }
    }

    // Create additional tasks
    console.log('📋 Creating additional tasks...');
    for (const taskData of additionalTasksData) {
      // Check if task already exists
      const existingTask = await prisma.task.findUnique({
        where: { id: taskData.id }
      });
      
      if (!existingTask) {
        await prisma.task.create({
          data: {
            ...taskData,
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-04-01'),
          },
        });
      }
    }

    // Create additional activity logs
    console.log('📊 Creating additional activity logs...');
    const additionalActivityLogs = [
      {
        type: 'PROJECT_CREATED',
        description: 'Project "Process Optimization Initiative" was created',
        userId: 'user-2',
        projectId: 'project-4',
        createdAt: new Date('2024-03-01'),
      },
      {
        type: 'TASK_ASSIGNED',
        description: 'Task "Process Analysis Report" was assigned to Carlos Rodriguez',
        userId: 'user-10', // James Wilson (Scrum Master)
        projectId: 'project-4',
        taskId: 'task-7',
        createdAt: new Date('2024-03-05'),
      },
      {
        type: 'MEMBER_ADDED',
        description: 'James Wilson was added as Scrum Master to the project',
        userId: 'user-2',
        projectId: 'project-4',
        createdAt: new Date('2024-03-01'),
      },
    ];

    await prisma.activityLog.createMany({
      data: additionalActivityLogs,
    });

    // Create additional notifications
    console.log('🔔 Creating additional notifications...');
    const additionalNotifications = [
      {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to task "Process Analysis Report"',
        userId: 'user-12', // Carlos Rodriguez
        taskId: 'task-7',
        actionUrl: '/tasks/task-7',
        createdAt: new Date('2024-03-05'),
      },
      {
        type: 'PROJECT_MEMBER_ADDED',
        title: 'Added to Project',
        message: 'You have been added as Scrum Master to "Process Optimization Initiative"',
        userId: 'user-10', // James Wilson
        projectId: 'project-4',
        actionUrl: '/projects/project-4',
        createdAt: new Date('2024-03-01'),
      },
    ];

    await prisma.notification.createMany({
      data: additionalNotifications,
    });

    console.log('✅ Additional database seeding completed successfully!');
    console.log('📊 Additional data created:');
    console.log(`  - ${additionalUsersData.length} additional users`);
    console.log(`  - ${additionalProjectsData.length} additional projects`);
    console.log(`  - ${additionalProjectMembersData.length} additional project memberships`);
    console.log(`  - ${additionalTasksData.length} additional tasks`);
    console.log(`  - ${additionalFunctionsData.length} additional functions`);
    console.log('  - 3 additional activity logs');
    console.log('  - 2 additional notifications');
    
    console.log('\n🔐 Additional login credentials for testing Scrum Master permissions:');
    console.log('  Scrum Master (with project access): james.wilson@pertamina.com / password123');
    console.log('  Scrum Master (with project access): anna.martinez@pertamina.com / password123');
    console.log('  Team Member: carlos.rodriguez@pertamina.com / password123');
    console.log('  Team Member: maria.gonzalez@pertamina.com / password123');

    console.log('\n📋 Testing Scenarios:');
    console.log('  1. Login as james.wilson@pertamina.com - Can manage members in Project 1 & 4');
    console.log('  2. Login as anna.martinez@pertamina.com - Can manage members in Project 2 & 5');
    console.log('  3. Scrum Masters can add/remove project members but cannot delete projects');

  } catch (error) {
    console.error('❌ Error seeding additional database:', error);
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
