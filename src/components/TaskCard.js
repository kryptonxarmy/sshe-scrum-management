import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EditTaskModal from "./EditTaskModal";

const TaskCard = ({ task, onTaskUpdated }) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Null check untuk task object
  if (!task) {
    return null;
  }

  // Check if user can edit task (Scrum Master or Project Owner)
  const canEditTask = () => {
    if (!user) return false;
    return user.role === "SCRUM_MASTER" || user.role === "PROJECT_OWNER";
  };

  const handleTaskUpdated = (updatedTask) => {
    if (onTaskUpdated) {
      onTaskUpdated(updatedTask);
    }
    setIsEditModalOpen(false);
  };

  const getTypeBadgeVariant = (type) => {
    const variants = {
      spike: "default",
      story: "secondary",
      sprint: "default",
      qa: "destructive",
    };
    return variants[type] || "outline";
  };

  const getPriorityBadgeVariant = (priority) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return variants[priority] || "outline";
  };

  // Function to get assignees display
  const getAssigneesDisplay = () => {
    // Handle both old single assignee format and new multiple assignees format
    if (task.assignees && task.assignees.length > 0) {
      // New format: multiple assignees
      const names = task.assignees.map(assignee => {
        // Handle nested user structure
        return assignee.user ? assignee.user.name : assignee.name;
      }).filter(Boolean);
      
      if (names.length === 0) return "-";
      if (names.length === 1) return names[0];
      if (names.length <= 2) return names.join(', ');
      return `${names[0]}, ${names[1]} +${names.length - 2} more`;
    } else if (task.assignee) {
      // Old format: single assignee
      return task.assignee.name || "-";
    }
    return "-";
  };

  // Safe accessor functions dengan default values
  const getDisplayType = () => {
    return task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : "Task";
  };

  const getDisplayPriority = () => {
    return task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium";
  };

  return (
    <>
      <Card className="cursor-grab transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group min-h-[120px]">
        {/* Task Type Badge */}
        <Badge variant={getTypeBadgeVariant(task.type)} className="absolute top-2 right-2 text-xs">
          {getDisplayType()}
        </Badge>

        {/* Edit Button - Only visible to Scrum Master and Project Owner */}
        {canEditTask() && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}

        <CardContent className="p-4">
          {/* Task Title */}
          <div className="font-semibold text-slate-800 mb-3 mr-16 leading-tight text-sm">{task.title || "Untitled Task"}</div>

          {/* Task Meta */}
          <div className="flex flex-col gap-1 text-xs text-slate-600">
            <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs mb-1">
              {getDisplayPriority()}
            </Badge>
            <span className="text-xs text-slate-500">
              Assignees: {getAssigneesDisplay()}
            </span>
            {task.sprint && (
              <span className="text-xs text-slate-500">
                Sprint: {task.sprint.name}
              </span>
            )}
            <span className="text-xs text-slate-500">
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : "No due date"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  );
};

export default TaskCard;
