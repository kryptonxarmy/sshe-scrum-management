-- Drop table if exists (backup data first if needed)
DROP TABLE IF EXISTS "task_assignees";

-- Create task_assignees table with correct schema
CREATE TABLE "task_assignees" (
    "id" SERIAL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "task_assignees_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_assignees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint
CREATE UNIQUE INDEX "task_assignees_taskId_userId_key" ON "task_assignees"("taskId", "userId");

-- Create index for better performance
CREATE INDEX "task_assignees_taskId_idx" ON "task_assignees"("taskId");
CREATE INDEX "task_assignees_userId_idx" ON "task_assignees"("userId");
