import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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
      include: {
        userSettings: true,
        ownedProjects: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
            tasks: true,
            _count: {
              select: {
                tasks: true,
                members: true,
              },
            },
          },
        },
        projectMemberships: {
          include: {
            project: {
              include: {
                owner: true,
                _count: {
                  select: {
                    tasks: true,
                    members: true,
                  },
                },
              },
            },
          },
        },
        taskAssignees: {
          include: {
            task: {
              include: {
                project: true,
              },
            },
          },
        },
        notifications: {
          where: {
            isRead: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
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
    return prisma.user.create({
      data: {
        ...data,
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
      include: {
        _count: {
          select: {
            ownedProjects: true,
            projectMemberships: true,
            taskAssignees: true,
          },
        },
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
          taskAssignees: {
            include: {
              user: true,
            },
          },
          createdBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      functions: {
        orderBy: {
          order: 'asc',
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
    } : {
      owner: true,
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
      },
      include: {
        owner: true,
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
        _count: {
          select: {
            tasks: true,
            members: true,
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
          },
        },
        taskAssignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        function: true,
        sprint: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
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
      },
    });
  },

  async getByProjectId(projectId, filters = {}) {
    try {
      const where = { projectId };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.assigneeId) {
        where.taskAssignees = {
          some: {
            userId: filters.assigneeId,
          },
        };
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          taskAssignees: {
            include: {
              user: true,
            },
          },
          createdBy: true,
          function: true,
          _count: {
            select: {
              comments: true,
              taskAttachments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // For backward compatibility, check if tasks have old assigneeId and convert
      const tasksWithCompatibleAssignees = await Promise.all(
        tasks.map(async (task) => {
          // If task has no taskAssignees but has assigneeId (old structure)
          if ((!task.taskAssignees || task.taskAssignees.length === 0) && task.assigneeId) {
            try {
              // Try to fetch user for old assigneeId
              const assigneeUser = await prisma.user.findUnique({
                where: { id: task.assigneeId },
                select: { id: true, name: true, email: true }
              });
              
              if (assigneeUser) {
                // Create a mock taskAssignees structure for frontend compatibility
                return {
                  ...task,
                  taskAssignees: [{
                    user: assigneeUser,
                    userId: assigneeUser.id,
                    taskId: task.id
                  }]
                };
              }
            } catch (err) {
              console.log('Could not fetch assignee for task:', task.id);
            }
          }
          return task;
        })
      );

      return tasksWithCompatibleAssignees;
    } catch (error) {
      console.error('Error in getByProjectId:', error);
      // Fallback: try to get tasks without taskAssignees relation
      try {
        const fallbackTasks = await prisma.task.findMany({
          where: { projectId },
          include: {
            createdBy: true,
            function: true,
            _count: {
              select: {
                comments: true,
                taskAttachments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        // Add empty taskAssignees array for compatibility
        return fallbackTasks.map(task => ({
          ...task,
          taskAssignees: []
        }));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw error;
      }
    }
  },

  async getByProjectIds(projectIds) {
    return prisma.task.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
        isArchived: false,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        taskAssignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
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
        { 
          taskAssignees: {
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
          },
        },
        taskAssignees: {
          include: {
            user: true,
          },
        },
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
        taskAssignees: {
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
        completedAt: status === 'DONE' ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        project: true,
        taskAssignees: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async getAll() {
    return prisma.task.findMany({
      include: {
        taskAssignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        function: true,
        _count: {
          select: {
            comments: true,
            taskAttachments: true,
          },
        },
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
