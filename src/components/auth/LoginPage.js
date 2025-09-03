"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [open, setOpen] = useState(false);
  // Cek localStorage saat komponen mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    const savedPassword = localStorage.getItem("rememberMePassword");
    const savedRemember = localStorage.getItem("rememberMeChecked");
    if (savedEmail && savedPassword && savedRemember === "true") {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch all user emails for select
    async function fetchUsers() {
      try {
        console.log("Fetching users for login dropdown...");
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          console.log("Users fetched:", data.users);
          setUserOptions(data.users.map((u) => ({ email: u.email, name: u.name, role: u.role })));
        } else {
          console.error("Failed to fetch users:", res.status);
          setUserOptions([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setUserOptions([]);
      }
    }
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simpan ke localStorage jika rememberMe dicentang
    if (rememberMe) {
      localStorage.setItem("rememberMeEmail", email);
      localStorage.setItem("rememberMePassword", password);
      localStorage.setItem("rememberMeChecked", "true");
    } else {
      localStorage.removeItem("rememberMeEmail");
      localStorage.removeItem("rememberMePassword");
      localStorage.setItem("rememberMeChecked", "false");
    }

    const result = await login(email, password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const demoUsers = [
    { email: "superadmin@exxonmobil.com", password: "password123", role: "Super Admin" },
    { email: "john.doe@exxonmobil.com", password: "password123", role: "Project Owner" },
    { email: "david.johnson@exxonmobil.com", password: "password123", role: "Team Member" },
  ];

  const fillDemoCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">ExxonMobil SSHE</h1>
          <p className="text-slate-600">Safety, Security, Health & Environment Portal</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                      {email ? userOptions.find((user) => user.email === email)?.email : "Pilih email user..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Cari email atau nama..." />
                      <CommandEmpty>Email tidak ditemukan.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {userOptions.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">Memuat data user...</div>
                        ) : (
                          userOptions.map((user) => (
                            <CommandItem
                              key={user.email}
                              onSelect={() => {
                                setEmail(user.email);
                                setOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={`mr-2 h-4 w-4 ${email === user.email ? "opacity-100" : "opacity-0"}`} />
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{user.email}</span>
                                <span className="text-xs text-gray-500">{user.name} • {user.role}</span>
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input id="rememberMe" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-indigo-600" />
                <Label htmlFor="rememberMe" className="cursor-pointer">
                  Remember Me
                </Label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
