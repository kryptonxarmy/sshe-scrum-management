# Prisma Database Schema Documentation

## Overview

This Prisma schema defines a comprehensive role-based task management system for the SSHE (Safety, Security, Health & Environment) Scrum application. The schema supports authentication, project management, task tracking, activity logging, and notifications.

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure your database URL:

```env
# For PostgreSQL (recommended)
DATABASE_URL="postgresql://username:password@localhost:5432/sshe_scrum?schema=public"

# For MySQL
DATABASE_URL="mysql://username:password@localhost:3306/sshe_scrum"

# For SQLite (development only)
DATABASE_URL="file:./dev.db"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Seed database with dummy data
npm run db:seed
```

### 4. Alternative: Use Migrations (for production)

```bash
# Create and apply migration
npm run db:migrate

# Seed database
npm run db:seed
```

## Database Schema

### Core Models

#### Users & Authentication
- **User**: Core user model with role-based access
- **UserSettings**: User preferences and configuration
- **Roles**: SUPERADMIN, PROJECT_OWNER, SCRUM_MASTER, TEAM_MEMBER

#### Project Management
- **Project**: Main project entity
- **ProjectMember**: Many-to-many relationship for project membership
- **ProjectSettings**: Project-specific configuration

#### Task Management
- **Task**: Individual tasks with status, priority, and assignments
- **TaskDependency**: Task dependencies and relationships
- **TaskAttachment**: File attachments for tasks

#### Scrum Framework
- **Sprint**: Sprint management
- **Function**: Scrum functions (Planning, Standups, Review, Retrospective)

#### Communication
- **Comment**: Comments on tasks and projects
- **Notification**: User notifications
- **ActivityLog**: Audit trail and activity tracking

#### System
- **SystemSettings**: Global application settings
- **AuditLog**: System-level audit logging
- **Report**: Saved reports and queries

## Role-Based Permissions

### SUPERADMIN
- Full system access
- User management
- System settings
- All project and task operations

### PROJECT_OWNER
- Create and manage own projects
- Add/remove project members
- Full access to owned projects
- View assigned tasks

### SCRUM_MASTER
- Facilitate sprints in assigned projects
- Manage team tasks
- View project analytics
- Limited project management

### TEAM_MEMBER
- View assigned projects
- Manage assigned tasks
- Add comments and attachments
- View team performance

## Usage Examples

### Basic Operations

```javascript
import { prisma, userOperations, projectOperations, taskOperations } from '@/lib/prisma';

// Find user with full context
const user = await userOperations.findByEmail('john.doe@exxonmobil.com');

// Get user's projects
const projects = await projectOperations.getByUserId(user.id);

// Get project tasks
const tasks = await taskOperations.getByProjectId('project-1');

// Create new task
const newTask = await taskOperations.create({
  title: 'New Safety Review',
  description: 'Conduct safety review for new equipment',
  projectId: 'project-1',
  assigneeId: 'user-6',
  createdById: 'user-2',
  type: 'STORY',
  priority: 'HIGH',
  status: 'TODO',
});
```

### Advanced Queries

```javascript
// Get project with full details
const projectDetails = await projectOperations.findById('project-1', true);

// Get user's tasks with filters
const urgentTasks = await taskOperations.getByUserId('user-6', {
  status: 'IN_PROGRESS',
  priority: 'HIGH'
});

// Get project activity
const activities = await activityOperations.getByProjectId('project-1');

// Create activity log
await activityOperations.create({
  type: 'TASK_STATUS_CHANGED',
  description: 'Task status updated to IN_PROGRESS',
  userId: 'user-6',
  projectId: 'project-1',
  taskId: 'task-2',
});
```

## Database Scripts

### Available Scripts

```bash
# Development
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes to DB
npm run db:seed        # Seed with dummy data
npm run db:studio      # Open Prisma Studio
npm run db:setup       # Full setup (push + seed)

# Production
npm run db:migrate         # Create and apply migration
npm run db:migrate:deploy  # Deploy migrations to production
npm run db:reset          # Reset database (development only)
```

### Seeding Data

The seed script creates:
- 9 users with different roles
- 3 projects with realistic SSHE scenarios
- 6 tasks with various statuses
- Project memberships and settings
- Sample activity logs and notifications

Default login credentials:
- **Superadmin**: `superadmin@exxonmobil.com` / `password123`
- **Project Owner**: `john.doe@exxonmobil.com` / `password123`
- **Scrum Master**: `alice.brown@exxonmobil.com` / `password123`
- **Team Member**: `david.johnson@exxonmobil.com` / `password123`

## Data Model Relationships

```
User
├── UserSettings (1:1)
├── ownedProjects (1:many)
├── projectMemberships (many:many via ProjectMember)
├── assignedTasks (1:many)
├── createdTasks (1:many)
├── comments (1:many)
├── activityLogs (1:many)
└── notifications (1:many)

Project
├── owner (many:1 to User)
├── members (many:many via ProjectMember)
├── tasks (1:many)
├── sprints (1:many)
├── functions (1:many)
├── comments (1:many)
├── activityLogs (1:many)
└── settings (1:1)

Task
├── project (many:1)
├── assignee (many:1 to User)
├── createdBy (many:1 to User)
├── sprint (many:1)
├── function (many:1)
├── comments (1:many)
├── activityLogs (1:many)
├── taskAttachments (1:many)
├── dependencies (many:many via TaskDependency)
└── dependents (many:many via TaskDependency)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `SESSION_TIMEOUT` | Session timeout (hours) | 24 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 10485760 |

## Migration Strategy

### Development
Use `db:push` for rapid prototyping and schema changes.

### Production
1. Create migration: `npm run db:migrate`
2. Review generated migration
3. Deploy: `npm run db:migrate:deploy`
4. Seed if needed: `npm run db:seed`

## Performance Considerations

1. **Indexes**: Critical fields like email, projectId, userId are indexed
2. **Cascading**: Proper cascade deletes prevent orphaned records
3. **Pagination**: Use `take` and `skip` for large datasets
4. **Selective Includes**: Only include relations when needed

## Security Features

1. **Password Hashing**: bcrypt with configurable rounds
2. **Audit Logging**: Complete audit trail for all operations
3. **Role Validation**: Strict role-based access control
4. **Soft Deletes**: Archive instead of hard delete for critical data
5. **Input Validation**: Prisma schema validation

## Monitoring & Maintenance

1. **Activity Logs**: Track all user actions
2. **System Settings**: Configurable limits and features
3. **Backup Strategy**: Regular automated backups
4. **Performance Metrics**: Built-in query logging
5. **Health Checks**: Database connection monitoring

## Troubleshooting

### Common Issues

1. **Connection Error**: Check DATABASE_URL and database server
2. **Migration Failed**: Reset and recreate migrations
3. **Seeding Error**: Ensure clean database before seeding
4. **Permission Denied**: Check user roles and permissions

### Reset Database

```bash
npm run db:reset
npm run db:setup
```

This will completely reset and reseed the database with fresh dummy data.
