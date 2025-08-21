"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    status: "PLANNING",
    startDate: "",
    endDate: "",
    scrumMasterId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrumMasters, setScrumMasters] = useState([]);

  // Initialize form data when project changes
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        department: project.department || "",
        status: project.status || "PLANNING",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        scrumMasterId: project.scrumMasterId || "NONE",
      });
    }
  }, [project, isOpen]);

  // Fetch Team Members that can be assigned as Scrum Master
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // Fetch all active users that can be assigned as Scrum Master
        const response = await fetch('/api/users?isActive=true');
        if (response.ok) {
          const data = await response.json();
          setScrumMasters(data.users || []);
        } else {
          console.error('Failed to fetch users:', response.status);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !project) {
      setError("Authentication or project data missing");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData = {
        ...formData,
        userId: user.id,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        scrumMasterId: formData.scrumMasterId === "NONE" ? null : formData.scrumMasterId,
      };

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update project");
      }

      onProjectUpdated(data.project);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      setError(error.message);
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

  const handleSelectChange = (field, value) => {
    // Handle "NONE" value for scrumMasterId
    const processedValue = field === 'scrumMasterId' && value === 'NONE' ? '' : value;
    
    setFormData({
      ...formData,
      [field]: processedValue,
    });
  };

  if (!project) return null;

  const departments = ["Process Safety", "Personnel Safety", "Emergency Preparedness", "Planning", "Environmental"];
  const statuses = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Functions</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select function" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scrum Master</Label>
              <Select
                value={formData.scrumMasterId}
                onValueChange={(value) => handleSelectChange("scrumMasterId", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Scrum Master" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No Scrum Master</SelectItem>
                  {scrumMasters
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((sm) => (
                      <SelectItem key={sm.id} value={sm.id}>
                        {sm.name} ({sm.email})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
