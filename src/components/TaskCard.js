import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";

const TaskCard = ({ task }) => {
  // Null check untuk task object
  if (!task) {
    return null;
  }

  const getTypeBadgeVariant = (type) => {
    const variants = {
      SPIKE: "default",
      STORY: "secondary", 
      TASK: "outline",
      BUG: "destructive",
    };
    return variants[type] || "outline";
  };

  const getPriorityBadgeVariant = (priority) => {
    const variants = {
      HIGH: "destructive",
      CRITICAL: "destructive",
      MEDIUM: "default",
      LOW: "secondary",
    };
    return variants[priority] || "outline";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: "border-l-red-500",
      CRITICAL: "border-l-red-600", 
      MEDIUM: "border-l-yellow-500",
      LOW: "border-l-green-500",
    };
    return colors[priority] || "border-l-gray-500";
  };

  // Safe accessor functions dengan default values
  const getDisplayType = () => {
    return task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1).toLowerCase() : "Task";
  };

  const getDisplayPriority = () => {
    return task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : "Medium";
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'DONE';
  };

  return (
    <Card className={`cursor-grab transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group min-h-[120px] border-l-4 ${getPriorityColor(task.priority)}`}>
      {/* Task Type Badge */}
      <Badge variant={getTypeBadgeVariant(task.type)} className="absolute top-2 right-2 text-xs">
        {getDisplayType()}
      </Badge>

      <CardContent className="p-4">
        {/* Task Title */}
        <div className="font-semibold text-slate-800 mb-3 mr-16 leading-tight text-sm line-clamp-2">
          {task.title || "Untitled Task"}
        </div>

        {/* Task Description */}
        {task.description && (
          <div className="text-xs text-slate-600 mb-3 line-clamp-2">
            {task.description}
          </div>
        )}

        {/* Task Meta */}
        <div className="flex flex-col gap-2 text-xs">
          {/* Priority and Due Date Row */}
          <div className="flex justify-between items-center">
            <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
              {getDisplayPriority()}
            </Badge>
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${
                isOverdue(task.dueDate) ? 'text-red-600' : 'text-slate-500'
              }`}>
                <Calendar size={12} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>

          {/* Assignee Row */}
          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs bg-slate-200">
                  {task.assignee.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-slate-600 truncate">
                {task.assignee.name || 'Unassigned'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
