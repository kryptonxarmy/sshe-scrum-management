"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
                <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6 md:p-8">
          <ReportsSection />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ReportsPage;
