import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiSelectDropdown from "@/components/ui/multi-select";
import { useAuth } from "@/contexts/AuthContext";

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sprint: "Sprint 1",
    priority: "medium",
    assignees: [], // Changed from assignee to assignees array
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
        
        // Combine owner and members, then deduplicate by id
        const allMembers = [
          ...(data.owner ? [{ value: data.owner.id, label: data.owner.name }] : []),
          ...(data.members ? data.members.map(member => ({
            // Handle both nested user structure and direct member structure
            value: member.user ? member.user.id : member.id,
            label: member.user ? member.user.name : member.name
          })) : [])
        ];
        
        // Remove duplicates based on value and filter out any entries with missing value
        const uniqueMembers = allMembers
          .filter(member => member.value) // Remove entries without value
          .reduce((acc, current) => {
            const exists = acc.find(item => item.value === current.value);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);
        
        setProjectMembers(uniqueMembers);
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
        assignees: formData.assignees, // Send array of assignee IDs
        assigneeIds: formData.assignees, // Also support assigneeIds field
        projectId: projectId,
        createdById: user?.id,
        status: 'TODO',
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
        console.error('API Error:', errorData);
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('Task created successfully:', result);

      // Reset form
      setFormData({
        title: "",
        description: "",
        sprint: "Sprint 1",
        priority: "medium",
        assignees: [],
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

  const handleAssigneesChange = (selectedAssignees) => {
    setFormData({
      ...formData,
      assignees: selectedAssignees,
    });
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

          {/* Assignees and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignees">Assignees</Label>
              <MultiSelectDropdown
                options={projectMembers}
                value={formData.assignees}
                onChange={handleAssigneesChange}
                placeholder="Select team members..."
                maxDisplay={2}
              />
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
