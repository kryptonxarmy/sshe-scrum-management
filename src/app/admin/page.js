"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="SUPERADMIN">
      <div className="min-h-screen bg-gray-50">
        <Navbar active="admin" />
        <main className="p-6">
          <AdminDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}
