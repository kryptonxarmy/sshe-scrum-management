import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X, Search, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Custom MultiSelect Component
const MultiSelectDropdown = ({ options, value, onChange, placeholder = "Select options..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get selected option labels
  const selectedLabels = options.filter((option) => value.includes(option.value)).map((option) => option.label);

  const removeOption = (optionValue, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedLabels.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedLabels.map((label, index) => {
              const option = options.find((opt) => opt.label === label);
              return (
                <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                  {label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(option.value);
                    }}
                  />
                </span>
              );
            })
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">No members found</div>
            ) : (
              filteredOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                  <Checkbox
                    checked={value.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newValue = checked ? [...value, option.value] : value.filter((v) => v !== option.value);
                      onChange(newValue);
                    }}
                  />
                  <span
                    className="text-sm cursor-pointer flex-1"
                    onClick={() => {
                      const isCurrentlySelected = value.includes(option.value);
                      const newValue = isCurrentlySelected ? value.filter((v) => v !== option.value) : [...value, option.value];
                      onChange(newValue);
                    }}
                  >
                    {option.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sprint: "Sprint 1",
    priority: "medium",
    assignees: [], // Changed from assignee to assignees array
    dueDate: "",
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [availableSprints, setAvailableSprints] = useState(["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (!response.ok) throw new Error("Failed to fetch project members");
        const data = await response.json();

        // Combine owner and members, then deduplicate by id
        const allMembers = [
          ...(data.owner ? [{ value: data.owner.id, label: data.owner.name }] : []),
          ...(data.members
            ? data.members.map((member) => ({
                // Handle both nested user structure and direct member structure
                value: member.user ? member.user.id : member.id,
                label: member.user ? member.user.name : member.name,
              }))
            : []),
        ];

        // Remove duplicates based on value and filter out any entries with missing value
        const uniqueMembers = allMembers
          .filter((member) => member.value) // Remove entries without value
          .reduce((acc, current) => {
            const exists = acc.find((item) => item.value === current.value);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);

        setProjectMembers(uniqueMembers);
      } catch (error) {
        console.error("Error fetching project members:", error);
      }
    };

    if (isOpen) {
      fetchProjectMembers();
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        ...formData,
        sprintName: formData.sprint,
        assignees: formData.assignees, // Send array of assignee IDs
        assigneeIds: formData.assignees, // Also support assigneeIds field
        projectId: projectId,
        createdById: user?.id,
        status: "TODO",
      };
      console.log("Submitting task:", requestBody);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || "Failed to create task";
        console.error("API Error:", errorData);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
          icon: <XCircle className="text-red-600" size={22} />,
        });
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("Task created successfully:", result);
      toast({
        title: "Task Created",
        description: "Task has been created successfully.",
        variant: "success",
        icon: <CheckCircle className="text-green-600" size={22} />,
      });

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
      toast({
        title: "Create Failed",
        description: error.message || "Failed to create task.",
        variant: "destructive",
        icon: <XCircle className="text-red-600" size={22} />,
      });
      console.error("Error creating task:", error);
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
      const maxSprintNumber = Math.max(...availableSprints.map((s) => parseInt(s.split(" ")[1])));

      // If user selects Sprint n-1 or Sprint n (last 2 sprints), add 2 more sprints
      if (currentSprintNumber >= maxSprintNumber - 1) {
        const newSprints = [];
        for (let i = maxSprintNumber + 1; i <= maxSprintNumber + 2; i++) {
          newSprints.push(`Sprint ${i}`);
        }
        setAvailableSprints((prev) => [...prev, ...newSprints]);
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
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
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
              <Label>Assignees</Label>
              <MultiSelectDropdown options={projectMembers} value={formData.assignees} onChange={handleAssigneesChange} placeholder="Select team members..." />
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
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
