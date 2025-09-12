import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Users, Clock, Target, FileText, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TaskCommentsSheet from "./TaskCommentsSheet";

const TaskDetailModal = ({ isOpen, onClose, task }) => {
  const { user } = useAuth();
  const [isCommentsSheetOpen, setIsCommentsSheetOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!task?.id) return;
    
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/comments?taskId=${task.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [task?.id]);

  useEffect(() => {
    if (isOpen && task?.id) {
      fetchComments();
    }
  }, [isOpen, task?.id, fetchComments]);

  // Check if user can view comments
  const canViewComments = () => {
    if (!user) return false;
    // Project Owner (any user with PROJECT_OWNER role)
    if (user.role === "PROJECT_OWNER") return true;
    // User appointed as Scrum Master for this specific project
    if (task.project && task.project.scrumMasterId === user.id) return true;
    // Team member assigned to this task
    if (task.assignees && Array.isArray(task.assignees)) {
      const isAssigned = task.assignees.some((assignee) => {
        const userId = assignee.user ? assignee.user.id : assignee.userId;
        return userId === user.id;
      });
      if (isAssigned) return true;
    }
    if (task.assignee && task.assignee.id === user.id) return true;
    return false;
  };

  if (!task) return null;

  // Get task status color
  const getStatusColor = (status) => {
    switch (status) {
      case "TODO": return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "DONE": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "spike": return "bg-purple-100 text-purple-800";
      case "story": return "bg-blue-100 text-blue-800";
      case "qa": return "bg-orange-100 text-orange-800";
      case "sprint": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get assignees display
  const getAssigneesDisplay = () => {
    if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
      return task.assignees.map((assignee) => {
        if (assignee && assignee.user && assignee.user.name) {
          return assignee.user.name;
        }
        if (assignee && assignee.name) {
          return assignee.name;
        }
        return "Unknown User";
      }).filter(name => name !== "Unknown User");
    } else if (task.assignee && task.assignee.name) {
      return [task.assignee.name];
    }
    return [];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === "DONE") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
              Task Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Task Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {task.title || "Untitled Task"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getStatusColor(task.status)} px-3 py-1`}>
                    {task.status || "TODO"}
                  </Badge>
                  {isOverdue() && (
                    <Badge className="bg-red-500 text-white px-3 py-1">
                      OVERDUE
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Task Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Priority */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Target className="h-4 w-4" />
                  Priority
                </div>
                <Badge className={`${getPriorityColor(task.priority)} w-fit`}>
                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : "Medium"}
                </Badge>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Type
                </div>
                <Badge className={`${getTypeColor(task.type)} w-fit`}>
                  {task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1).toLowerCase() : "Task"}
                </Badge>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                <p className={`text-sm ${isOverdue() ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>

              {/* Sprint */}
              {task.sprint && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4" />
                    Sprint
                  </div>
                  <p className="text-sm text-gray-600">{task.sprint.name || "No Sprint"}</p>
                </div>
              )}

              {/* Project */}
              {task.project && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Target className="h-4 w-4" />
                    Project
                  </div>
                  <p className="text-sm text-gray-600">{task.project.name || "No Project"}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="text-sm text-gray-600">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Assignees
              </div>
              <div className="flex flex-wrap gap-2">
                {getAssigneesDisplay().length > 0 ? (
                  getAssigneesDisplay().map((name, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg"
                    >
                      <User className="h-4 w-4" />
                      {name}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No assignees</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {task.description ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {canViewComments() && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageCircle className="h-4 w-4" />
                    Comments ({comments.length})
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCommentsSheetOpen(true)}
                  >
                    View All Comments
                  </Button>
                </div>
                
                {/* Recent Comments Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  {loadingComments ? (
                    <p className="text-gray-500">Loading comments...</p>
                  ) : comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">{comment.user?.name || "Unknown User"}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                        </div>
                      ))}
                      {comments.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          And {comments.length - 3} more comments...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No comments yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {canViewComments() && (
                <Button onClick={() => setIsCommentsSheetOpen(true)}>
                  Add Comment
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Sheet */}
      {isCommentsSheetOpen && (
        <TaskCommentsSheet
          open={isCommentsSheetOpen}
          onOpenChange={setIsCommentsSheetOpen}
          user={user}
          taskId={task.id}
          taskName={task.title || "Untitled Task"}
          onCommentsUpdated={fetchComments}
        />
      )}
    </>
  );
};

export default TaskDetailModal;
