import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper functions for common database operations

// User operations
export const userOperations = {
  async updateProfile({ id, name, email, newPassword }) {
    const updateData = { name, email };
    if (newPassword) {
      // Hash password baru sebelum simpan
      const hashed = await bcrypt.hash(newPassword, 10);
      updateData.password = hashed;
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return updatedUser;
  },

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userSettings: true,
      },
    });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        userSettings: true,
      },
    });
  },

  async create(data) {
    // Hash password before saving
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        userSettings: {
          create: {}, // Create default settings
        },
      },
      include: {
        userSettings: true,
      },
    });
  },

  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  },

  async getAll(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
};

// Project operations
export const projectOperations = {
  async findById(id, includeDetails = false) {
    const include = includeDetails
      ? {
          owner: true,
          scrumMaster: true,
          members: {
            include: {
              user: true,
            },
          },
          tasks: {
            include: {
              assignees: {
                include: {
                  user: true,
                },
              },
              createdBy: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          functions: {
            orderBy: {
              order: "asc",
            },
          },
          settings: true,
          _count: {
            select: {
              tasks: true,
              members: true,
              comments: true,
            },
          },
        }
      : {
          owner: true,
          scrumMaster: true,
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        };

    return prisma.project.findUnique({
      where: { id },
      include,
    });
  },

  async getByOwnerId(ownerId) {
    return prisma.project.findMany({
      where: {
        ownerId: ownerId,
        isArchived: false,
        deletedAt: null, // Exclude soft deleted projects
      },
      include: {
        owner: true,
        scrumMaster: true,
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getByUserId(userId, filters = {}) {
    const where = {
      deletedAt: null, // Exclude soft deleted projects
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
      ],
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    return prisma.project.findMany({
      where,
      include: {
        owner: true,
        scrumMaster: true,
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async getByScrumMasterId(scrumMasterId, filters = {}, includeMemberProjects = false) {
    const whereConditions = {
      deletedAt: null, // Exclude soft deleted projects
    };

    if (includeMemberProjects) {
      // Include projects where user is scrum master OR member
      whereConditions.OR = [
        { scrumMasterId: scrumMasterId },
        {
          members: {
            some: {
              userId: scrumMasterId,
              isActive: true,
            },
          },
        },
      ];
    } else {
      // Only projects where user is scrum master
      whereConditions.scrumMasterId = scrumMasterId;
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    if (filters.department) {
      whereConditions.department = filters.department;
    }

    return prisma.project.findMany({
      where: whereConditions,
      include: {
        owner: true,
        scrumMaster: true,
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async create(data, ownerId) {
    return prisma.project.create({
      data: {
        ...data,
        ownerId,
        settings: {
          create: {
            allowMemberEdit: true,
            requireApproval: false,
            notificationEnabled: true,
          },
        },
      },
      include: {
        owner: true,
        settings: true,
      },
    });
  },

  async addMember(projectId, userId) {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
      include: {
        user: true,
        project: true,
      },
    });
  },

  async removeMember(projectId, userId) {
    return prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  },

  async getUserProjects(userId) {
    // Get projects where user is owner, scrum master, or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { scrumMasterId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
        isArchived: false,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scrumMaster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return projects;
  },
};

// Task operations
export const taskOperations = {
  async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            owner: true,
            scrumMaster: true,
          },
        },
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        function: true,
        sprint: true,
        comments: {
          // include: {
          //   author: true,
          // },
          orderBy: {
            createdAt: "desc",
          },
        },
        taskAttachments: true,
        dependencies: {
          include: {
            dependsOnTask: true,
          },
        },
        dependents: {
          include: {
            dependentTask: true,
          },
        },
        activityLogs: true,
      },
    });
  },

  async getByProjectId(projectId, filters = {}) {
    const where = { projectId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assigneeId) {
      where.assignees = {
        some: {
          userId: filters.assigneeId,
        },
      };
    }

    if (filters.sprintId) {
      where.sprintId = filters.sprintId;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    return prisma.task.findMany({
      where,
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        function: true,
        sprint: true, // Include sprint data
        project: {
          include: {
            owner: true,
            scrumMaster: true,
          },
        },
        _count: {
          select: {
            comments: true,
            taskAttachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getByProjectIds(projectIds, filters = {}) {
    const where = {
      projectId: {
        in: projectIds,
      },
      isArchived: false,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assigneeId) {
      where.assignees = {
        some: {
          userId: filters.assigneeId,
        },
      };
    }

    if (filters.sprintId) {
      where.sprintId = filters.sprintId;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    return prisma.task.findMany({
      where,
      include: {
        project: {
          include: {
            owner: true,
            scrumMaster: true,
          },
        },
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        function: true,
        sprint: true,
        _count: {
          select: {
            comments: true,
            taskAttachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getByUserId(userId, filters = {}) {
    const where = {
      OR: [
        {
          assignees: {
            some: {
              userId: userId,
            },
          },
        },
        { createdById: userId },
      ],
    };

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.task.findMany({
      where,
      include: {
        project: {
          include: {
            owner: true,
            scrumMaster: true,
          },
        },
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async create(data) {
    return prisma.task.create({
      data,
      include: {
        project: {
          include: {
            owner: true,
            scrumMaster: true,
          },
        },
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    });
  },

  async updateStatus(id, status, userId) {
    return prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === "DONE" ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        project: {
          include: {
            owner: true,
            scrumMaster: true,
          },
        },
        assignees: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async getAll(filters = {}) {
    return prisma.task.findMany({
      where: filters.where || {},
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        function: true,
        sprint: true,
        _count: {
          select: {
            comments: true,
            taskAttachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};

// Activity log operations
export const activityOperations = {
  async create(data) {
    return prisma.activityLog.create({
      data,
      include: {
        user: true,
        project: true,
        task: true,
      },
    });
  },

  async getByProjectId(projectId, limit = 50) {
    return prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: true,
        task: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  },

  async getByUserId(userId, limit = 50) {
    return prisma.activityLog.findMany({
      where: { userId },
      include: {
        project: true,
        task: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  },
};

// Notification operations
export const notificationOperations = {
  async create(data) {
    return prisma.notification.create({
      data,
    });
  },

  async getByUserId(userId, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  },

  async findById(id) {
    return prisma.notification.findUnique({
      where: { id },
    });
  },
};

// System settings operations
export const systemOperations = {
  async getSettings() {
    return prisma.systemSettings.findFirst();
  },

  async updateSettings(data) {
    const existing = await prisma.systemSettings.findFirst();
    if (existing) {
      return prisma.systemSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return prisma.systemSettings.create({
        data,
      });
    }
  },
};

export default prisma;
