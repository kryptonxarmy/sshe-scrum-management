import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sprint: "",
    priority: "medium",
    assignee: "unassigned",
    dueDate: "",
    status: "TODO",
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [availableSprints, setAvailableSprints] = useState([
    "Sprint 1",
    "Sprint 2", 
    "Sprint 3",
    "Sprint 4",
    "Sprint 5"
  ]);
  const [loading, setLoading] = useState(false);

  const fetchProjectMembers = useCallback(async () => {
    if (!task?.projectId) return;
    try {
      const response = await fetch(`/api/projects/${task.projectId}/members`);
      if (!response.ok) throw new Error('Failed to fetch project members');
      const data = await response.json();
      
      // Combine owner and members, then deduplicate by id
      const allMembers = [
        ...(data.owner ? [{ id: data.owner.id, name: data.owner.name }] : []),
        ...(data.members ? data.members.map(member => ({
          // Member sudah berupa object langsung dengan id, name, etc (tidak ada nested user)
          id: member.id,
          name: member.name
        })) : [])
      ];
      
      // Remove duplicates based on id and filter out any entries with missing id
      const uniqueMembers = allMembers
        .filter(member => member.id) // Remove entries without id
        .reduce((acc, current) => {
          const exists = acc.find(item => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
      
      setProjectMembers(uniqueMembers);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  }, [task?.projectId]);

  useEffect(() => {
    if (task && isOpen) {
      // Populate form with task data
      setFormData({
        title: task.title || "",
        description: task.description || "",
        sprint: task.sprint?.name || "Sprint 1", // Use sprint relation
        priority: task.priority?.toLowerCase() || "medium",
        assignee: task.assigneeId || "unassigned",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        status: task.status || "TODO",
      });

      // Fetch project members
      fetchProjectMembers();
    }
  }, [task, isOpen, fetchProjectMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestBody = {
        title: formData.title,
        description: formData.description,
        sprintName: formData.sprint,
        priority: formData.priority.toUpperCase(),
        assigneeId: formData.assignee === "unassigned" ? null : formData.assignee,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        status: formData.status,
        updatedById: user?.id,
      };

      console.log('Updating task:', requestBody);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to update task';
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      
      // Notify parent component about the updated task
      if (onTaskUpdated) {
        onTaskUpdated(result.task);
      }
      
      // Close modal
      onClose();
      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-expand sprints if user selects the last 2 sprints
    if (name === "sprint") {
      const currentSprintNumber = parseInt(value.split(" ")[1]);
      const maxSprintNumber = Math.max(...availableSprints.map(s => parseInt(s.split(" ")[1])));
      
      if (currentSprintNumber >= maxSprintNumber - 1) {
        const newSprints = [];
        for (let i = maxSprintNumber + 1; i <= maxSprintNumber + 2; i++) {
          newSprints.push(`Sprint ${i}`);
        }
        setAvailableSprints(prev => [...prev, ...newSprints]);
      }
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Enter task title" 
              required 
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Enter task description" 
              rows={3} 
            />
          </div>

          {/* Sprint and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint</Label>
              <Select value={formData.sprint} onValueChange={(value) => handleSelectChange("sprint", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sprint" />
                </SelectTrigger>
                <SelectContent>
                  {availableSprints.map((sprint) => (
                    <SelectItem key={sprint} value={sprint}>
                      {sprint}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={formData.assignee} onValueChange={(value) => handleSelectChange("assignee", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="unassigned" value="unassigned">Unassigned</SelectItem>
                  {projectMembers.map((member, index) => (
                    <SelectItem key={member.id || `member-${index}`} value={member.id || `member-${index}`}>
                      {member.name || 'Unknown Member'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input 
              id="dueDate" 
              name="dueDate" 
              type="date" 
              value={formData.dueDate} 
              onChange={handleChange} 
            />
          </div>

          {/* Form Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
