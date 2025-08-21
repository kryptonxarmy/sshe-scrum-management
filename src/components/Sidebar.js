"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, HardHat, AlertTriangle, Calendar, BarChart3, Users, CalendarDays, User, Cog } from "lucide-react";

const Sidebar = ({ currentFunction, setCurrentFunction, isSidebarOpen, setIsSidebarOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  const functions = [
    { id: "process-safety", name: "Process Safety", icon: Settings, count: 8 },
    { id: "personnel-safety", name: "Personnel Safety", icon: HardHat, count: 6 },
    { id: "epr", name: "EP&R", icon: AlertTriangle, count: 4 },
    { id: "planning", name: "Planning", icon: Calendar, count: 5 },
  ];

  const handleFunctionClick = (functionId) => {
    setCurrentFunction(functionId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const showReports = () => {
    router.push("/reports");
  };

  const showTeam = () => {
    alert("Team management feature coming soon!");
  };

  const showCalendar = () => {
    alert("Calendar feature coming soon!");
  };

  const showSettings = () => {
    alert("Settings feature coming soon!");
  };

  const showProfile = () => {
    alert("Profile feature coming soon!");
  };

  return (
    <aside
      className={`
      w-64 bg-white shadow-xl fixed h-full left-0 top-0 z-40 overflow-y-auto
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
    `}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 text-center">
        <h1 className="text-xl font-bold mb-1">TaskBoard</h1>
        <div className="text-sm opacity-90 mb-1">HSE Department</div>
        <div className="text-xs opacity-80">Pertamina</div>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        {/* Functions Section */}
        <div className="mb-6">
          <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Functions</div>
          {functions.map((func) => {
            const IconComponent = func.icon;
            return (
              <div
                key={func.id}
                onClick={() => handleFunctionClick(func.id)}
                className={`
                  flex items-center px-6 py-3 text-gray-700 cursor-pointer border-l-3 transition-all duration-200
                  hover:bg-slate-50 hover:text-blue-600
                  ${currentFunction === func.id ? "bg-blue-50 text-blue-600 border-l-blue-600 font-medium" : "border-l-transparent"}
                `}
              >
                <IconComponent size={18} className="mr-3 flex-shrink-0" />
                <span className="flex-1">{func.name}</span>
                <span
                  className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${currentFunction === func.id ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"}
                `}
                >
                  {func.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="mb-6">
          <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Management</div>
          <div 
            onClick={showReports} 
            className={`
              flex items-center px-6 py-3 cursor-pointer border-l-3 transition-all duration-200
              hover:bg-slate-50 hover:text-blue-600
              ${pathname === "/reports" || currentFunction === "reports" ? "bg-blue-50 text-blue-600 border-l-blue-600 font-medium" : "text-gray-700 border-l-transparent"}
            `}
          >
            <BarChart3 size={18} className="mr-3" />
            Reports
          </div>
          <div onClick={showTeam} className="flex items-center px-6 py-3 text-gray-700 cursor-pointer border-l-3 border-l-transparent transition-all duration-200 hover:bg-slate-50 hover:text-blue-600">
            <Users size={18} className="mr-3" />
            Team Members
          </div>
          <div onClick={showCalendar} className="flex items-center px-6 py-3 text-gray-700 cursor-pointer border-l-3 border-l-transparent transition-all duration-200 hover:bg-slate-50 hover:text-blue-600">
            <CalendarDays size={18} className="mr-3" />
            Calendar
          </div>
        </div>

        {/* Settings Section */}
        <div className="mb-6">
          <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</div>
          <div onClick={showSettings} className="flex items-center px-6 py-3 text-gray-700 cursor-pointer border-l-3 border-l-transparent transition-all duration-200 hover:bg-slate-50 hover:text-blue-600">
            <Cog size={18} className="mr-3" />
            Settings
          </div>
          <div onClick={showProfile} className="flex items-center px-6 py-3 text-gray-700 cursor-pointer border-l-3 border-l-transparent transition-all duration-200 hover:bg-slate-50 hover:text-blue-600">
            <User size={18} className="mr-3" />
            Profile
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
