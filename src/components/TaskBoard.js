"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import CreateTaskModal from "./CreateTaskModal";
import { Menu } from "lucide-react";

export default function TaskBoard() {
  const [currentFunction, setCurrentFunction] = useState("process-safety");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openCreateTaskModal = (functionName) => {
    setCurrentFunction(functionName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Toggle */}
      <button onClick={toggleSidebar} className="fixed top-4 left-4 z-50 bg-blue-600 text-white border-none p-2 rounded-md cursor-pointer md:hidden">
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <Sidebar currentFunction={currentFunction} setCurrentFunction={setCurrentFunction} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <MainContent currentFunction={currentFunction} openCreateTaskModal={openCreateTaskModal} />

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
