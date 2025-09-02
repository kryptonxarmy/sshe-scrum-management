"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ArchiveProjects from "@/components/project/ArchiveProjects";
import ReleaseReports from "@/components/reports/ReleaseReports";
import { Button } from "@/components/ui/button";
import { TrendingUp, Archive } from "lucide-react";
import { useState } from "react";

const ArchivePage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("projects");

  // Add loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["SUPERADMIN", "PROJECT_OWNER"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar active="archive" />

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            <Button
              variant={activeView === "projects" ? "default" : "ghost"}
              onClick={() => setActiveView("projects")}
              className="flex items-center gap-2 py-3"
            >
              <Archive size={16} />
              Released Projects
            </Button>
            <Button
              variant={activeView === "reports" ? "default" : "ghost"}
              onClick={() => setActiveView("reports")}
              className="flex items-center gap-2 py-3"
            >
              <TrendingUp size={16} />
              Release Reports
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="p-6">
          {activeView === "projects" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Released Projects</h2>
              <ArchiveProjects />
            </div>
          )}
          
          {activeView === "reports" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Release Reports</h2>
              <ReleaseReports userId={user?.id} />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ArchivePage;
