import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ReportsPageSimple = () => {
  // Dummy data task
  const tasks = [
    { id: 1, name: "Design UI", status: "TODO" },
    { id: 2, name: "Setup Database", status: "IN_PROGRESS" },
    { id: 3, name: "API Integration", status: "DONE" },
    { id: 4, name: "Testing", status: "OVERDUE" },
    { id: 5, name: "Deploy", status: "TODO" },
    { id: 6, name: "Documentation", status: "IN_PROGRESS" },
    { id: 7, name: "Bug Fix", status: "DONE" },
    { id: 8, name: "Review", status: "OVERDUE" },
  ];

  const [taskStatusFilter, setTaskStatusFilter] = React.useState("ALL");

  const filteredTasks = tasks.filter(task => {
    if (taskStatusFilter === "ALL") return true;
    return task.status === taskStatusFilter;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dropdown filter status task */}
        <div className="mb-8 flex gap-2 items-center">
          <label className="text-sm font-medium">Filter Task Status:</label>
          <select
            value={taskStatusFilter}
            onChange={e => setTaskStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="ALL">All</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
        <div className="mb-12 text-left">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Project Reports
          </h1>
          <p className="text-slate-600 text-xl max-w-3xl leading-relaxed">
            Comprehensive insights into project performance, team productivity, and delivery metrics across all functions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-2xl border-0">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-2">124</h3>
              <p className="text-indigo-100">Total Tasks</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-2xl border-0">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-2">89</h3>
              <p className="text-emerald-100">Completed</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-slate-600 py-8">Charts will be loaded here...</p>
        {/* List task sesuai filter */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Task List ({taskStatusFilter === "ALL" ? "All" : taskStatusFilter})</h2>
          {filteredTasks.length === 0 ? (
            <div className="text-slate-500">No tasks found.</div>
          ) : (
            <ul className="space-y-2">
              {filteredTasks.map(task => (
                <li key={task.id} className={`p-3 rounded border flex items-center gap-3 ${task.status === "OVERDUE" ? "bg-red-100 border-red-400 text-red-700" : "bg-white border-slate-200"}`}>
                  <span className="font-medium">{task.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${task.status === "TODO" ? "bg-gray-200 text-gray-700" : task.status === "IN_PROGRESS" ? "bg-blue-200 text-blue-700" : task.status === "DONE" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPageSimple;
