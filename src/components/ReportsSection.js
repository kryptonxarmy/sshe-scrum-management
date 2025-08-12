import { BarChart3, Download, RefreshCw, CheckCircle2, Clock, AlertTriangle, Calendar, PieChart, Users, Table, Search, Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

const ReportsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedEpics, setExpandedEpics] = useState({});

  const exportReport = () => {
    alert("Export functionality coming soon!");
  };

  const refreshData = () => {
    alert("Data refreshed!");
  };

  const toggleEpic = (epicId) => {
    setExpandedEpics((prev) => ({
      ...prev,
      [epicId]: !prev[epicId],
    }));
  };

  const toggleSelectAll = () => {
    // Toggle select all functionality
  };

  const addNewRow = () => {
    alert("Add new row functionality coming soon!");
  };

  const editSelectedRows = () => {
    alert("Edit functionality coming soon!");
  };

  const deleteSelectedRows = () => {
    alert("Delete functionality coming soon!");
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 size={24} />
          Reports & Analytics
        </h2>
        <div className="flex gap-4">
          <button onClick={exportReport} className="bg-green-600 text-white border-none px-6 py-3 rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-green-700">
            <Download size={20} />
            Export Report
          </button>
          <button onClick={refreshData} className="bg-blue-600 text-white border-none px-6 py-3 rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-blue-700">
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-600 mb-1">Total Tasks</h3>
            <p className="text-3xl font-bold text-slate-800 mb-1">48</p>
            <span className="text-sm font-medium text-green-600">+12% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-600 mb-1">Completed</h3>
            <p className="text-3xl font-bold text-slate-800 mb-1">32</p>
            <span className="text-sm font-medium text-green-600">+8% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-600 mb-1">In Progress</h3>
            <p className="text-3xl font-bold text-slate-800 mb-1">12</p>
            <span className="text-sm font-medium text-slate-600">Same as last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-pink-400 to-yellow-400 flex items-center justify-center text-white">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-600 mb-1">Overdue</h3>
            <p className="text-3xl font-bold text-slate-800 mb-1">4</p>
            <span className="text-sm font-medium text-red-600">+2 from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gantt Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar size={20} />
              Project Timeline - Gantt Chart
            </h3>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>All Functions</option>
              <option>Process Safety</option>
              <option>Personnel Safety</option>
              <option>EP&R</option>
              <option>Planning</option>
            </select>
          </div>
          <div className="p-6 h-80 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p>Gantt Chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Progress Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <PieChart size={20} />
              Progress by Function
            </h3>
          </div>
          <div className="p-6 h-80 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <PieChart size={48} className="mx-auto mb-4 opacity-30" />
              <p>Pie Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Bar Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} />
              Performance by Assignee
            </h3>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="p-6 h-80 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
              <p>Bar Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Table size={20} />
            Main Report - Task Details
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>All Status</option>
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Overdue</option>
            </select>
            <div className="flex gap-2">
              <button onClick={addNewRow} className="px-3 py-2 border border-green-600 bg-white text-green-600 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-green-50">
                <Plus size={16} />
                Add
              </button>
              <button onClick={editSelectedRows} className="px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-gray-50">
                <Edit size={16} />
                Edit
              </button>
              <button onClick={deleteSelectedRows} className="px-3 py-2 border border-red-600 bg-white text-red-600 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-red-50">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="w-10 p-4 text-center">
                  <input type="checkbox" onChange={toggleSelectAll} className="cursor-pointer" />
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Epic</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Task Name</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Assignee</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Last Updated</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Created By</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Due Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => toggleEpic("epic1")} className="bg-slate-50 cursor-pointer transition-all duration-200 hover:bg-slate-100 border-b border-gray-200">
                <td className="p-4 text-center">
                  <input type="checkbox" onClick={(e) => e.stopPropagation()} className="cursor-pointer" />
                </td>
                <td colSpan="9" className="p-4">
                  <div className="flex items-center">
                    <ChevronRight size={16} className={`mr-2 transition-transform duration-200 ${expandedEpics.epic1 ? "rotate-90" : ""}`} />
                    <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium mr-2">Process Safety</span>
                    <span className="font-semibold text-slate-800">Epic 1: Pengembangan Tempat Warga Darurat Geometrik</span>
                  </div>
                </td>
              </tr>
              {expandedEpics.epic1 && (
                <>
                  <tr className="bg-white border-b border-gray-200">
                    <td className="p-4"></td>
                    <td className="p-4"></td>
                    <td className="p-4 pl-8">HAZOP Study Implementation</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">JD</div>
                        <span>John Doe</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">High</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">DONE</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">Dec 10, 2024</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">SM</div>
                        <span>Sarah Miller</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">Dec 15, 2024</td>
                    <td className="p-4">
                      <div className="relative w-20 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: "100%" }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">100%</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-white border-b border-gray-200">
                    <td className="p-4"></td>
                    <td className="p-4"></td>
                    <td className="p-4 pl-8">Risk Assessment Framework</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-medium">AB</div>
                        <span>Alice Brown</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">High</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">IN PROGRESS</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">Dec 11, 2024</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">SM</div>
                        <span>Sarah Miller</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">Dec 18, 2024</td>
                    <td className="p-4">
                      <div className="relative w-20 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: "65%" }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">65%</div>
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sprint Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users size={20} />
            Current Sprint Details
          </h3>
        </div>
        <div className="p-6">
          <h4 className="text-xl font-semibold text-slate-800 mb-4">Sprint 4: SHE System Integration & API Development</h4>
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600">
            <span>
              <strong>Type:</strong>
              <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Sprint</span>
            </span>
          </div>
          <div className="text-slate-600">
            <p className="mb-4">This sprint focuses on integrating safety management systems and developing comprehensive API endpoints for data exchange between different safety modules.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-slate-800 mb-2">Sprint Goals</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Complete API integration for process safety module</li>
                  <li>Implement real-time data synchronization</li>
                  <li>Enhance user authentication system</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 mb-2">Key Deliverables</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Updated system architecture documentation</li>
                  <li>Performance optimization reports</li>
                  <li>Integration test results</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
