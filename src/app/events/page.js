"use client"

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, User, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        // Only fetch events created by this user (calendar events)
        if (!user?.id) return;
        const res = await fetch(`/api/events?userId=${user.id}&includeMembers=true`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [user?.id]);

  const getCompactMemberList = (members) => {
    if (!members || members.length === 0) return "-";
    if (members.length <= 3) return members.map(m => m.name).join(", ");
    const firstTwo = members.slice(0, 2).map(m => m.name);
    const othersCount = members.length - 2;
    return `${firstTwo.join(", ")}, ${othersCount}+ Others`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar active="events" />
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Daftar Event</h2>
          {loading ? (
            <div className="text-slate-600">Memuat event...</div>
          ) : (
            <div className="space-y-6">
              {events.length === 0 ? (
                <div className="text-gray-500">Tidak ada event ditemukan.</div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-5 bg-white shadow-sm">
                    {/* Card Content Wrapper */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-lg text-slate-800">{event.title}</span>
                        {event.project?.name && <Badge variant="outline">{event.project.name}</Badge>}
                      </div>
                      {event.description && <div className="text-sm text-gray-700 mb-2">{event.description}</div>}
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Project:</span>
                          <span className="text-xs font-medium text-gray-800">{event.project?.name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Created by:</span>
                          <span className="text-xs font-medium text-gray-800">{event.createdBy?.name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Waktu:</span>
                          <span className="text-xs font-medium text-gray-800">
                            {new Date(event.startDate).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            {" - "}
                            {new Date(event.endDate).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs text-gray-600">Peserta:</span>
                        <span className="text-xs font-medium text-gray-800">{getCompactMemberList(event.members)}</span>
                        {/* Full member list on hover */}
                        <div className="group relative inline-block ml-2">
                          <span className="text-xs text-blue-600 underline decoration-dotted cursor-pointer">Lihat semua peserta</span>
                          <div className="absolute left-0 top-6 z-10 hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg p-2 min-w-[180px]">
                            <div className="font-semibold text-xs text-gray-700 mb-1">Daftar Peserta Lengkap:</div>
                            <ul className="text-xs text-gray-800 space-y-1">
                              {event.members?.map((m) => (
                                <li key={m.id}>{m.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
