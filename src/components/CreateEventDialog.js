import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
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
  // Error popup state
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
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
    recurringDayOfWeek: new Date().getDay(),
    recurringEndDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + (60 * 60 * 1000));
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
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
        if (onEventCreated) onEventCreated(result.event);
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      setErrorPopup({ open: true, message: 'Failed to create event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Only one top-level return below
  return (
    <>
      {/* Error Popup */}
      <Dialog open={errorPopup.open} onOpenChange={(open) => setErrorPopup((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-red-600">{errorPopup.message}</div>
          <DialogFooter>
            <Button onClick={() => setErrorPopup((prev) => ({ ...prev, open: false }))}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                  {/* ...rest of the form fields... */}
                </div>
              </CardContent>
            </Card>
            {/* ...rest of the form and dialogs... */}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateEventDialog;
