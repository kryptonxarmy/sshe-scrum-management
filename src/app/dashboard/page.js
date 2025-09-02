"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProjectManagement from "@/components/project/ProjectManagement";
import CalendarDashboardData from "@/components/dashboard/CalendarDashboardData";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect superadmin to admin panel
  useEffect(() => {
    if (user && user.role === 'SUPERADMIN') {
      router.push("/admin");
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar active="dashboard" />
        
        <main className="p-6">
          <div className="space-y-6">
            {/* Projects Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Projects Overview</h2>
              <ProjectManagement />
            </div>

            {/* Calendar Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Calendar</h2>
              <CalendarDashboardData />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
