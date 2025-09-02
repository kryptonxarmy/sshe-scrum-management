"use client";

import { useState } from "react";
import MainContent from "./MainContent";
import CreateTaskModal from "./CreateTaskModal";

export default function TaskBoard() {
  const [currentFunction, setCurrentFunction] = useState("process-safety");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCreateTaskModal = (functionName) => {
    setCurrentFunction(functionName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <MainContent currentFunction={currentFunction} openCreateTaskModal={openCreateTaskModal} />

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
