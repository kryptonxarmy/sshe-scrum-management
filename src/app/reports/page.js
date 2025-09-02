"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ReportsSection from "@/components/ReportsSection";

const ReportsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar active="reports" />

        {/* Main Content */}
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Reports & Analytics</h2>
            <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <ReportsSection />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ReportsPage;
