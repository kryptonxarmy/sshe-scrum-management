"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/profile/Profile";

export default function ProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar active="profile" />
        <main className="p-6">
          <ProfilePage />
        </main>
      </div>
    </ProtectedRoute>
  );
}
