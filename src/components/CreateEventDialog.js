import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarPlus, Clock, Repeat, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CreateEventDialog = ({ projects = [], onEventCreated }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    projectId: 'no-project',
    isRecurring: false,
    recurringType: 'weekly',
    recurringDayOfWeek: new Date().getDay(), // Default to today's day
    recurringEndDate: ''
  });

  const days = [
    { value: 0, label: 'Minggu' },
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + (60 * 60 * 1000)); // Default 1 hour duration

      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        projectId: formData.projectId === 'no-project' ? null : formData.projectId || null,
        isRecurring: formData.isRecurring,
        recurringType: formData.isRecurring ? formData.recurringType : null,
        recurringDayOfWeek: formData.isRecurring ? parseInt(formData.recurringDayOfWeek) : null,
        recurringEndDate: formData.isRecurring && formData.recurringEndDate 
          ? new Date(formData.recurringEndDate).toISOString() 
          : null,
        createdById: user.id
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          projectId: 'no-project',
          isRecurring: false,
          recurringType: 'weekly',
          recurringDayOfWeek: new Date().getDay(),
          recurringEndDate: ''
        });

        setOpen(false);
        if (onEventCreated) {
          onEventCreated(result.event);
        }
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Gagal membuat event. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to create events
  const canCreateEvent = user?.role === 'PROJECT_OWNER' || 
                        user?.role === 'SCRUM_MASTER' || 
                        user?.role === 'SUPERADMIN' ||
                        user?.role === 'superadmin' ||
                        user?.role === 'project_owner' ||
                        user?.role === 'scrum_master';

  console.log('User role:', user?.role); // Debug log
  console.log('Can create event:', canCreateEvent); // Debug log

  if (!canCreateEvent) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
          <CalendarPlus className="w-4 h-4" />
          Tambah Event Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-700">
            <CalendarPlus className="w-5 h-5" />
            Buat Event Meeting Baru
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Event *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Misal: Sprint Planning Meeting"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Jelaskan agenda atau tujuan meeting..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId">Project (Opsional)</Label>
                  <Select value={formData.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih project terkait" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-project">Tidak terkait project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Jam Mulai *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Jam Selesai</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                    />
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
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                  />
                  <Label htmlFor="isRecurring" className="text-sm font-medium">
                    Jadikan meeting rutin
                  </Label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-4 pl-6 border-l-2 border-green-200">
                    <div className="space-y-2">
                      <Label htmlFor="recurringType">Frekuensi</Label>
                      <Select value={formData.recurringType} onValueChange={(value) => handleInputChange('recurringType', value)}>
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
                      <Select 
                        value={formData.recurringDayOfWeek.toString()} 
                        onValueChange={(value) => handleInputChange('recurringDayOfWeek', parseInt(value))}
                      >
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
                      <Input
                        id="recurringEndDate"
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                        placeholder="Opsional - biarkan kosong untuk tidak ada batas"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Menyimpan...' : 'Buat Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
