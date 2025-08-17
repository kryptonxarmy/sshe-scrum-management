"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { user, canCreateTask } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "TASK",
    priority: "MEDIUM",
    assigneeId: "unassigned",
    dueDate: "",
    estimatedTime: "",
  });

  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch project members when modal opens
  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (response.ok) {
          const data = await response.json();
          setProjectMembers(data.members || []);
        }
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && projectId) {
      fetchProjectMembers();
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canCreateTask()) {
      alert("You don't have permission to create tasks");
      return;
    }

    if (!projectId) {
      alert("Project ID is required");
      return;
    }

    try {
      setSubmitting(true);
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        assigneeId: (formData.assigneeId && formData.assigneeId !== "unassigned") ? formData.assigneeId : null,
        dueDate: formData.dueDate || null,
        estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) : null,
        projectId,
        createdById: user.id,
        status: 'TODO'
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          type: "TASK",
          priority: "MEDIUM",
          assigneeId: "unassigned",
          dueDate: "",
          estimatedTime: "",
        });
        
        // Close modal and trigger refresh
        onClose();
        if (onTaskCreated) {
          onTaskCreated(data.task);
        }
      } else {
        alert(data.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
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
  };

  if (!canCreateTask()) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter task description" rows={3} />
          </div>

          {/* Task Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Task Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="STORY">Story</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="SPIKE">Spike</SelectItem>
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
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Assignee</Label>
              <Select value={formData.assigneeId} onValueChange={(value) => handleSelectChange("assigneeId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.user?.id || member.id} value={member.user?.id || member.id}>
                      {member.user?.name || member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
            </div>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
            <Input 
              id="estimatedTime" 
              name="estimatedTime" 
              type="number" 
              step="0.5" 
              min="0"
              value={formData.estimatedTime} 
              onChange={handleChange} 
              placeholder="e.g., 2.5" 
            />
          </div>

          {/* Form Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
