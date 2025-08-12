import { BarChart3, Download, RefreshCw, CheckCircle2, Clock, AlertTriangle, Calendar, PieChart, Users, TableIcon, Search, Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReportsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [functionFilter, setFunctionFilter] = useState("All Functions");
  const [periodFilter, setPeriodFilter] = useState("This Month");
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
          <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
            <Download size={20} />
            Export Report
          </Button>
          <Button onClick={refreshData}>
            <RefreshCw size={20} />
            Refresh
          </Button>
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
            <Select value={functionFilter} onValueChange={setFunctionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Functions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Functions">All Functions</SelectItem>
                <SelectItem value="Process Safety">Process Safety</SelectItem>
                <SelectItem value="Personnel Safety">Personnel Safety</SelectItem>
                <SelectItem value="EP&R">EP&R</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="This Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="This Quarter">This Quarter</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
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
            <TableIcon size={20} />
            Main Report - Task Details
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={addNewRow} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Plus size={16} />
                Add
              </Button>
              <Button onClick={editSelectedRows} variant="outline">
                <Edit size={16} />
                Edit
              </Button>
              <Button onClick={deleteSelectedRows} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">
                  <input type="checkbox" onChange={toggleSelectAll} className="cursor-pointer" />
                </TableHead>
                <TableHead>Epic</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow onClick={() => toggleEpic("epic1")} className="bg-slate-50 cursor-pointer transition-all duration-200 hover:bg-slate-100">
                <TableCell className="text-center">
                  <input type="checkbox" onClick={(e) => e.stopPropagation()} className="cursor-pointer" />
                </TableCell>
                <TableCell colSpan={9}>
                  <div className="flex items-center">
                    <ChevronRight size={16} className={`mr-2 transition-transform duration-200 ${expandedEpics.epic1 ? "rotate-90" : ""}`} />
                    <Badge variant="secondary" className="mr-2">Process Safety</Badge>
                    <span className="font-semibold text-slate-800">Epic 1: Pengembangan Tempat Warga Darurat Geometrik</span>
                  </div>
                </TableCell>
              </TableRow>
              {expandedEpics.epic1 && (
                <>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="pl-8">HAZOP Study Implementation</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">JD</div>
                        <span>John Doe</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">High</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">DONE</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">Dec 10, 2024</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">SM</div>
                        <span>Sarah Miller</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">Dec 15, 2024</TableCell>
                    <TableCell>
                      <div className="relative w-20 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: "100%" }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">100%</div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="pl-8">Risk Assessment Framework</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-medium">AB</div>
                        <span>Alice Brown</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">High</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">IN PROGRESS</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">Dec 11, 2024</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">SM</div>
                        <span>Sarah Miller</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">Dec 18, 2024</TableCell>
                    <TableCell>
                      <div className="relative w-20 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: "65%" }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">65%</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
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
