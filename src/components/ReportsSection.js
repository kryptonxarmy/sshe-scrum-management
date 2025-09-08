"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProjectOwnerReports from "@/components/reports/ProjectOwnerReports";
import TeamMemberReports from "@/components/reports/TeamMemberReports";
import ScrumMasterReports from "@/components/reports/ScrumMasterReports";

const ReportsSection = () => {
  const { user } = useAuth();

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Render appropriate report based on user role
  switch (user.role) {
    case 'SUPERADMIN':
      // Super admin gets the same view as project owner but with more data access
      return <ProjectOwnerReports />;
      
    case 'PROJECT_OWNER':
      return <ProjectOwnerReports />;
      
    case 'TEAM_MEMBER':
      // Team member gets their own reports with Sprint tab added
      return <TeamMemberReports />;
      
    default:
      // Fallback to team member reports for unknown roles
      return <TeamMemberReports />;
  }
};

export default ReportsSection;
