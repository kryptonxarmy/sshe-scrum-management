import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sprint: "Sprint 1",
    priority: "medium",
    assignee: "",
    dueDate: "",
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [availableSprints, setAvailableSprints] = useState([
    "Sprint 1",
    "Sprint 2", 
    "Sprint 3",
    "Sprint 4",
    "Sprint 5"
  ]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (!response.ok) throw new Error('Failed to fetch project members');
        const data = await response.json();
        setProjectMembers(data.members || []);
      } catch (error) {
        console.error('Error fetching project members:', error);
      }
    };

    if (isOpen) {
      fetchProjectMembers();
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = {
        ...formData,
        sprintName: formData.sprint,
        assigneeId: formData.assignee || null,
        projectId: projectId,
        createdById: user?.id,
        status: 'TODO',
        type: 'TASK', // Default task type
      };
      console.log('Submitting task:', requestBody);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to create task';
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        sprint: "Sprint 1",
        priority: "medium",
        assignee: "",
        dueDate: "",
      });
      // Notify parent component about the new task
      if (onTaskCreated) {
        onTaskCreated();
      }
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
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
      
      // If user selects Sprint n-1 or Sprint n (last 2 sprints), add 2 more sprints
      if (currentSprintNumber >= maxSprintNumber - 1) {
        const newSprints = [];
        for (let i = maxSprintNumber + 1; i <= maxSprintNumber + 2; i++) {
          newSprints.push(`Sprint ${i}`);
        }
        setAvailableSprints(prev => [...prev, ...newSprints]);
      }
    }
  };

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

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={formData.assignee} onValueChange={(value) => handleSelectChange("assignee", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
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

          {/* Form Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
