
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, AlertTriangle, TrendingUp, User, Calendar } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
  { value: "OVERDUE", label: "Overdue" },
];

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
}

const TaskAnalysisEnhanced = ({ distribution = [], priorities = [], trends = [] }) => {
  // Get all tasks from window.reportData.tasks
  const allTasks = typeof window !== "undefined" && window.reportData && window.reportData.tasks ? window.reportData.tasks : [];
  const [filter, setFilter] = useState("all");

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (filter === "all") return allTasks;
    if (filter === "OVERDUE") return allTasks.filter(isOverdue);
    return allTasks.filter(t => t.status === filter);
  }, [filter, allTasks]);

  // Status cards
  const statusCards = [
    {
      name: "To Do",
      value: allTasks.filter(t => t.status === "TODO").length,
      color: "#ef4444",
      filter: "TODO",
    },
    {
      name: "In Progress",
      value: allTasks.filter(t => t.status === "IN_PROGRESS").length,
      color: "#f59e0b",
      filter: "IN_PROGRESS",
    },
    {
      name: "Done",
      value: allTasks.filter(t => t.status === "DONE").length,
      color: "#10b981",
      filter: "DONE",
    },
    {
      name: "Overdue",
      value: allTasks.filter(isOverdue).length,
      color: "#dc2626",
      filter: "OVERDUE",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Filter Cards */}
      <div className="flex gap-2 mb-4">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all ${filter === opt.value ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status Distribution Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusCards.map(item => (
          <Card key={item.name} className="p-4 flex flex-col items-center">
            <BarChart3 className="h-5 w-5 mb-2" style={{ color: item.color }} />
            <span className="text-xl font-bold" style={{ color: item.color }}>{item.value}</span>
            <span className="text-sm text-gray-700">{item.name}</span>
          </Card>
        ))}
      </div>

      {/* Filtered Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tasks ({statusOptions.find(opt => opt.value === filter)?.label})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-gray-500 text-sm">No tasks found for this filter.</div>
          ) : (
            <ul className="space-y-2">
              {filteredTasks.map(task => {
                const overdue = isOverdue(task);
                // Get assignee name (support both assignee and assignees array)
                let assigneeName = "-";
                if (task.assignee && task.assignee.name) assigneeName = task.assignee.name;
                else if (Array.isArray(task.assignees) && task.assignees.length > 0 && task.assignees[0].user && task.assignees[0].user.name) assigneeName = task.assignees[0].user.name;
                // Format due date
                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-";
                // Get project name
                const projectName = task.project && task.project.name ? task.project.name : "-";
                return (
                  <li key={task.id} className={`border rounded p-2 flex justify-between items-center ${overdue ? 'bg-red-50' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{task.title}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3 inline-block mr-1" /> Assignee: {assigneeName}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        🗂️ Project: {projectName}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-700 font-bold' : 'text-gray-500'}`}>
                        <Calendar className="h-3 w-3 inline-block mr-1" /> Due: {dueDate}
                      </span>
                    </div>
                    <span className={`px-4 py-2 text-base font-bold rounded-full shadow ${overdue ? 'bg-red-100 text-red-700 border-red-300' : ''}`}>
                      {overdue ? "Overdue" : task.status.replace("_", " ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAnalysisEnhanced;
