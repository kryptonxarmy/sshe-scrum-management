import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ProfileEditSection = ({ user }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Auto fill from database
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?id=${user.id}`, { method: "GET" });
        const result = await res.json();
        if (result.user) {
          setFormData((prev) => ({
            ...prev,
            name: result.user.name || "",
            email: result.user.email || "",
          }));
        }
      } catch (err) {
        // fallback to props if error
        setFormData((prev) => ({
          ...prev,
          name: user?.name || "",
          email: user?.email || "",
        }));
      }
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi password baru dan konfirmasi
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.oldPassword) {
        toast({
          title: "Old Password Required",
          description: "Please enter your current password to change to a new one.",
          variant: "warning",
          icon: <XCircle className="text-yellow-600" size={22} />,
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New password and confirmation do not match.",
          variant: "destructive",
          icon: <XCircle className="text-red-600" size={22} />,
        });
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id, // ambil dari useAuth
          name: formData.name,
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
          variant: "success",
          icon: <CheckCircle className="text-green-600" size={22} />,
        });
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
        icon: <XCircle className="text-red-600" size={22} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Label htmlFor="name">Name</Label>
      <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={loading} required />

      <Label htmlFor="email">Email</Label>
      <Input id="email" name="email" value={formData.email} onChange={handleChange} disabled={loading} required />

      <Label htmlFor="oldPassword">Current Password</Label>
      <div className="flex items-center gap-2">
        <Input
          id="oldPassword"
          name="oldPassword"
          type={showOldPassword ? "text" : "password"}
          value={formData.oldPassword}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter your current password to change password"
        />
        <Button type="button" variant="ghost" onClick={() => setShowOldPassword((v) => !v)}>
          {showOldPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>

      <Label htmlFor="newPassword">New Password</Label>
      <div className="flex items-center gap-2">
        <Input
          id="newPassword"
          name="newPassword"
          type={showNewPassword ? "text" : "password"}
          value={formData.newPassword}
          onChange={handleChange}
          disabled={loading}
          placeholder="Leave blank to keep current password"
        />
        <Button type="button" variant="ghost" onClick={() => setShowNewPassword((v) => !v)}>
          {showNewPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>

      <Label htmlFor="confirmPassword">Confirm New Password</Label>
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        placeholder="Repeat new password"
      />

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        {loading ? "Saving..." : "Update Profile"}
      </Button>
    </form>
  );
};

export default ProfileEditSection;
