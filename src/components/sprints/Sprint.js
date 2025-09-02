"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Sprint() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all sprints (could be filtered by project if needed)
    fetch("/api/sprints")
      .then((res) => res.json())
      .then((data) => {
        setSprints(data.sprints || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Gagal mengambil data sprint");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Sprint Schedule</h1>
      {loading ? (
        <div className="text-center text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : sprints.length === 0 ? (
        <div className="text-center text-slate-400">No sprints found.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="p-5 flex flex-col gap-2 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-blue-700">{sprint.name}</span>
                {sprint.isActive && (
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                )}
                {sprint.isCompleted && (
                  <Badge variant="destructive" className="bg-red-100 text-red-700">
                    Completed
                  </Badge>
                )}
              </div>
              <div className="text-slate-600 text-sm mb-1">{sprint.goal || "No goal set."}</div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Start: {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "-"}</span>
                <span>End: {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs text-slate-500">Project:</span>
                <span className="font-medium text-slate-700">{sprint.project?.name || sprint.projectId}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs text-slate-500">Tasks:</span>
                <span className="font-medium text-slate-700">{sprint.tasks?.length ?? 0}</span>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
