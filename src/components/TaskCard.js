import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TaskCard = ({ task }) => {
  // Null check untuk task object
  if (!task) {
    return null;
  }

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

  // Safe accessor functions dengan default values
  const getDisplayType = () => {
    return task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : "Task";
  };

  const getDisplayPriority = () => {
    return task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium";
  };

  return (
    <Card className="cursor-grab transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group min-h-[120px]">
      {/* Task Type Badge */}
      <Badge variant={getTypeBadgeVariant(task.type)} className="absolute top-2 right-2 text-xs">
        {getDisplayType()}
      </Badge>

      <CardContent className="p-4">
        {/* Task Title */}
        <div className="font-semibold text-slate-800 mb-3 mr-16 leading-tight text-sm">{task.title || "Untitled Task"}</div>

        {/* Task Meta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-600">
          <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
            {getDisplayPriority()}
          </Badge>
          <span className="text-xs text-slate-500">{task.status === "done" ? "Completed" : `Due: ${task.dueDate || "No due date"}`}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
