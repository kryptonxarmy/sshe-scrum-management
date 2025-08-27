import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EditTaskModal from "./EditTaskModal";
import TaskCommentsSheet from "./task/TaskCommentsSheet";

const TaskCard = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCommentsSheetOpen, setIsCommentsSheetOpen] = useState(false);
  const [hasUnreadComment, setHasUnreadComment] = useState(false);
  // Track last read comment per user per task in localStorage
  useEffect(() => {
    if (!task?.id || !user?.id) return;
    // Fetch comments for this task
    fetch(`/api/comments?taskId=${task.id}`)
      .then((res) => res.json())
      .then((data) => {
        const comments = data.comments || [];
        // Find latest comment not by current user
        const latestOtherComment = comments.filter((c) => c.userId !== user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        if (!latestOtherComment) {
          setHasUnreadComment(false);
          return;
        }
        // Get last read timestamp from localStorage
        const key = `task-${task.id}-user-${user.id}-lastReadComment`;
        const lastRead = localStorage.getItem(key);
        if (!lastRead || new Date(latestOtherComment.createdAt) > new Date(lastRead)) {
          setHasUnreadComment(true);
        } else {
          setHasUnreadComment(false);
        }
      });
  }, [task.id, user?.id, isCommentsSheetOpen]);

  // When comments sheet is opened, mark all as read
  useEffect(() => {
    if (isCommentsSheetOpen && task?.id && user?.id) {
      // Mark latest comment as read
      fetch(`/api/comments?taskId=${task.id}`)
        .then((res) => res.json())
        .then((data) => {
          const comments = data.comments || [];
          const latestOtherComment = comments.filter((c) => c.userId !== user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          if (latestOtherComment) {
            const key = `task-${task.id}-user-${user.id}-lastReadComment`;
            localStorage.setItem(key, latestOtherComment.createdAt);
            setHasUnreadComment(false);
          }
        });
    }
  }, [isCommentsSheetOpen, task.id, user?.id]);

  // Null check untuk task object
  if (!task) {
    return null;
  }

  // Check if user can edit/delete task
  const canEditTask = () => {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;
    if (user.role === "PROJECT_OWNER") return true;
    if (task.project && task.project.scrumMasterId === user.id) return true;
    if (
      task.assignees &&
      task.assignees.some((assignee) => {
        const userId = assignee.user ? assignee.user.id : assignee.userId;
        return userId === user.id;
      })
    )
      return true;
    if (task.assigneeId === user.id) return true;
    return false;
  };

  // Check if user can update status to DONE (strict: only project owner & scrum master)
  const canUpdateToDone = () => {
    if (!user) return false;
    // Only allow if user is project owner of this project
    if (task.project && task.project.ownerId === user.id) return true;
    // Or user is scrum master of this project
    if (task.project && task.project.scrumMasterId === user.id) return true;
    return false;
  };

  const handleTaskUpdated = (updatedTask) => {
    if (onTaskUpdated) {
      onTaskUpdated(updatedTask);
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteTask = async () => {
    if (!task?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}?userId=${user?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete task");
      }

      toast({
        title: "Task Deleted Successfully",
        description: `"${task.title}" has been permanently removed.`,
        variant: "success",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      });

      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }

      // Only close dialog after delete is done
      if (response.ok) {
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete task. Please try again.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      });
      // Keep dialog open if error
    } finally {
      setIsDeleting(false);
    }
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
      const names = task.assignees
        .map((assignee) => {
          // Handle nested user structure
          return assignee.user ? assignee.user.name : assignee.name;
        })
        .filter(Boolean);

      if (names.length === 0) return "-";
      if (names.length === 1) return names[0];
      if (names.length <= 2) return names.join(", ");
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

  // Check if user can view/comment
  const canComment = () => {
    console.log("Checking comment permissions");
    console.log("User:", user);
    console.log("Task:", task);
    if (!user) return false;
    // Project Owner
    if (user.role === "PROJECT_OWNER") return true;
    // Scrum Master
    if (user.role === "SCRUM_MASTER" && task.project && task.project.scrumMasterId === user.id) return true;
    // Team member assigned to this task (multiple assignees)
    if (user.role === "TEAM_MEMBER") {
      let assigned = false;
      if (task.assignees && Array.isArray(task.assignees)) {
        assigned = task.assignees.some((assignee) => {
          const userId = assignee.user ? assignee.user.id : assignee.userId;
          return userId === user.id;
        });
      }
      if (task.assignee && task.assignee.id === user.id) {
        assigned = true;
      }
      console.log("User assigned to this task:", assigned);
      if (assigned) return true;
    }
    return false;
  };

  return (
    <>
      <Card
        className={`cursor-grab transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group min-h-[120px] ${
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "border-2 border-red-600 bg-red-50" : ""
        } min-h-[120px]`}
      >
        {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
            <AlertCircle className="h-4 w-4 text-white" />
            Overdue!
          </div>
        )}
        {/* Task Type Badge */}
        <Badge variant={getTypeBadgeVariant(task.type)} className="absolute top-2 right-2 text-xs">
          {getDisplayType()}
        </Badge>
        {/* Edit Button - Only visible to Scrum Master and Project Owner */}
        {canEditTask() && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={(open) => {
                // Prevent closing while deleting
                if (!isDeleting) setShowDeleteDialog(open);
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-1 hover:bg-red-100 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Delete Task
                  </AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone and will permanently remove the task and all its associated data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTask} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                    {isDeleting ? <Loader2 className="animate-spin mr-2" /> : null}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <CardContent className="p-4">
          {/* Task Title */}
          <div className="font-semibold text-slate-800 mb-3 mr-16 leading-tight text-sm">{task.title || "Untitled Task"}</div>
          {/* Task Meta */}
          <div className="flex flex-col gap-1 text-xs text-slate-600">
            <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs mb-1">
              {getDisplayPriority()}
            </Badge>
            <span className="text-xs text-slate-500">Assignees: {getAssigneesDisplay()}</span>
            {task.sprint && <span className="text-xs text-slate-500">Sprint: {task.sprint.name}</span>}
            <span className="text-xs text-slate-500">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : "No due date"}</span>
          </div>
          {/* Tombol Komentar & Sheet Komentar */}
          {canComment() ? (
            <>
              <div className="mt-2 flex justify-end items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsCommentsSheetOpen(true)}>
                  Comment
                </Button>
                {hasUnreadComment && (
                  <span title="Komentar baru belum dibaca">
                    <AlertCircle className="h-5 w-5 text-orange-500 animate-bounce" />
                  </span>
                )}
              </div>
              <TaskCommentsSheet open={isCommentsSheetOpen} onOpenChange={setIsCommentsSheetOpen} user={user} taskId={task.id} taskName={task.title} />
            </>
          ) : null}
        </CardContent>
      </Card>
      {/* Edit Task Modal */}
      <EditTaskModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} task={task} onTaskUpdated={handleTaskUpdated} />
    </>
  );
};

export default TaskCard;
