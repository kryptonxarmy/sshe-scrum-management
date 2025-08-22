import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfilePage from "@/components/profile/Profile";
import React from "react";

function page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

export default page;
