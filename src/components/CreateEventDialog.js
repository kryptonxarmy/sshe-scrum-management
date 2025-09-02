import UserAssigneeSelector from "@/components/UserAssigneeSelector";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarPlus, Clock, Repeat, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MultiSelect from "./ui/multi-select";

const CreateEventDialog = ({ projects = [], onEventCreated, event = null, onClose }) => {
  // Error popup state
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    startDate: event?.startDate ? event.startDate.slice(0, 10) : "",
    startTime: event?.startDate ? new Date(event.startDate).toISOString().slice(11, 16) : "",
    endDate: event?.endDate ? event.endDate.slice(0, 10) : "",
    endTime: event?.endDate ? new Date(event.endDate).toISOString().slice(11, 16) : "",
    projectId: event?.projectId || "no-project",
    isRecurring: event?.isRecurring || false,
    recurringType: event?.recurringType || "weekly",
    recurringDayOfWeek: event?.recurringDayOfWeek ?? new Date().getDay(),
    recurringEndDate: event?.recurringEndDate ? event.recurringEndDate.slice(0, 10) : "",
    selectedUserIds: event?.selectedUserIds || [],
  });

  // Fetch projects created by the logged-in project owner
  const [ownerProjects, setOwnerProjects] = useState([]);
  React.useEffect(() => {
    async function fetchOwnerProjects() {
      if (user?.id) {
        try {
          // Use /api/projects?userId=... to get projects created/owned by this user
          const res = await fetch(`/api/projects?userId=${user.id}`);
          const data = await res.json();
          if (Array.isArray(data.projects)) {
            setOwnerProjects(data.projects);
          } else {
            setOwnerProjects([]);
          }
        } catch (err) {
          setOwnerProjects([]);
        }
      } else {
        setOwnerProjects([]);
      }
    }
    fetchOwnerProjects();
  }, [user?.id]);

  const days = [
    { value: 0, label: "Minggu" },
    { value: 1, label: "Senin" },
    { value: 2, label: "Selasa" },
    { value: 3, label: "Rabu" },
    { value: 4, label: "Kamis" },
    { value: 5, label: "Jumat" },
    { value: 6, label: "Sabtu" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Wrap onChange in useCallback to prevent unnecessary re-renders
  const handleUserSelection = React.useCallback((selectedIds) => {
    handleInputChange("selectedUserIds", selectedIds);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
      const endDateTime = formData.endDate && formData.endTime ? new Date(`${formData.endDate}T${formData.endTime}`) : new Date(startDateTime.getTime() + 60 * 60 * 1000);
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        projectId: formData.projectId === "no-project" ? null : formData.projectId || null,
        isRecurring: formData.isRecurring,
        recurringType: formData.isRecurring ? formData.recurringType : null,
        recurringDayOfWeek: formData.isRecurring ? parseInt(formData.recurringDayOfWeek) : null,
        recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate).toISOString() : null,
        createdById: user.id,
        selectedUserIds: formData.selectedUserIds || [],
      };
      let response, result;
      if (event?.id) {
        response = await fetch(`/api/events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      result = await response.json();
      if (result.success) {
        setFormData({
          title: "",
          description: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          projectId: "no-project",
          isRecurring: false,
          recurringType: "weekly",
          recurringDayOfWeek: new Date().getDay(),
          recurringEndDate: "",
          selectedUserIds: [],
        });
        setOpen(false);
        if (onEventCreated) onEventCreated(result.event);
        if (onClose) onClose();
      } else {
        throw new Error(result.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      setErrorPopup({ open: true, message: "Gagal menyimpan event. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to create events
  const canCreateEvent = user?.role === "PROJECT_OWNER" || user?.role === "SCRUM_MASTER" || user?.role === "SUPERADMIN" || user?.role === "superadmin" || user?.role === "project_owner" || user?.role === "scrum_master";

  console.log("User role:", user?.role); // Debug log
  console.log("Can create event:", canCreateEvent); // Debug log

  if (!canCreateEvent) {
    return null;
  }

  return (
    <Dialog
      open={event ? true : open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val && onClose) onClose();
      }}
    >
      {!event && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900">
            <CalendarPlus className="w-4 h-4" />
            Tambah Event Meeting
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className={`flex items-center gap-2 ${event ? "text-black" : "text-purple-700"}`}>
              {event ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17a2 2 0 002 2h4" />
                </svg>
              ) : (
                <CalendarPlus className="w-5 h-5" />
              )}
              {event ? "Edit Event Meeting" : "Buat Event Meeting Baru"}
            </DialogTitle>
            {/* <button type="button" aria-label="Close" className="ml-2 p-2 rounded hover:bg-gray-200" onClick={() => { setOpen(false); if (onClose) onClose(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button> */}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Event *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Misal: Sprint Planning Meeting" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Jelaskan agenda atau tujuan meeting..." rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId">Project yang Dibahas *</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => {
                        console.log("Project changed to:", value); // Debug log
                        handleInputChange("projectId", value);
                        // Clear selected users when project changes
                        if (value !== formData.projectId) {
                          handleInputChange("selectedUserIds", []);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih project yang akan dibahas" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerProjects.length === 0 ? (
                          <SelectItem value="no-project" disabled>
                            Tidak ada project yang Anda buat
                          </SelectItem>
                        ) : (
                          <>
                            <SelectItem value="no-project">Tidak terkait project</SelectItem>
                            {ownerProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {/* MultiSelect user dropdown beside project dropdown */}
                    {/* User assignee selector below project dropdown for better layout */}
                  </div>
                  <div className="mt-2">
                    <UserAssigneeSelector projectId={formData.projectId} selectedUserIds={formData.selectedUserIds || []} onChange={handleUserSelection} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Waktu Pelaksanaan</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Tanggal Mulai *</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Jam Mulai *</Label>
                    <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => handleInputChange("startTime", e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Jam Selesai</Label>
                    <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => handleInputChange("endTime", e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Options */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Repeat className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium text-gray-900">Pengulangan</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="isRecurring" checked={formData.isRecurring} onCheckedChange={(checked) => handleInputChange("isRecurring", checked)} />
                  <Label htmlFor="isRecurring" className="text-sm font-medium">
                    Jadikan meeting rutin
                  </Label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-4 pl-6 border-l-2 border-green-200">
                    <div className="space-y-2">
                      <Label htmlFor="recurringType">Frekuensi</Label>
                      <Select value={formData.recurringType} onValueChange={(value) => handleInputChange("recurringType", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Setiap minggu</SelectItem>
                          <SelectItem value="biweekly">Setiap 2 minggu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recurringDayOfWeek">Hari</Label>
                      <Select value={formData.recurringDayOfWeek.toString()} onValueChange={(value) => handleInputChange("recurringDayOfWeek", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recurringEndDate">Berakhir pada</Label>
                      <Input id="recurringEndDate" type="date" value={formData.recurringEndDate} onChange={(e) => handleInputChange("recurringEndDate", e.target.value)} placeholder="Opsional - biarkan kosong untuk tidak ada batas" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Menyimpan..." : event ? "Update Event" : "Buat Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
