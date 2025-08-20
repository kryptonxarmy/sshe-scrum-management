import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'], // Reduced logging
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper functions for common database operations

// User operations
export const userOperations = {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(data) {
    return prisma.user.create({
      data,
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
        name: 'asc',
      },
    });
  },
};

// Project operations
export const projectOperations = {
  async findById(id, includeDetails = false) {
    const include = includeDetails ? {
      owner: true,
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: {
          createdBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    } : {
      owner: true,
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
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getByUserId(userId, filters = {}) {
    const where = {
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
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  },

  async create(data, ownerId) {
    return prisma.project.create({
      data: {
        ...data,
        ownerId,
      },
      include: {
        owner: true,
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
};

// Task operations (simplified)
export const taskOperations = {
  async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        createdBy: true,
      },
    });
  },

  async getByProjectId(projectId, filters = {}) {
    const where = { projectId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    return prisma.task.findMany({
      where,
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getByUserId(userId, filters = {}) {
    const where = {
      createdById: userId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.task.findMany({
      where,
      include: {
        project: true,
        createdBy: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  },

  async create(data) {
    return prisma.task.create({
      data,
      include: {
        project: true,
        createdBy: true,
      },
    });
  },

  async updateStatus(id, status, userId) {
    return prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'DONE' ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        project: true,
        createdBy: true,
      },
    });
  },

  async getAll() {
    return prisma.task.findMany({
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
};

// Activity log operations
export const activityOperations = {
  async create(data) {
    return prisma.activityLog.create({
      data,
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
        createdAt: 'desc',
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
        createdAt: 'desc',
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
        createdAt: 'desc',
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
