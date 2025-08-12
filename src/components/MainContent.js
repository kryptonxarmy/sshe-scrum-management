"use client";

import { useState } from "react";
import Header from "./Header";
import TabNavigation from "./TabNavigation";
import FunctionSection from "./FunctionSection";
import ReportsSection from "./ReportsSection";

const MainContent = ({ currentFunction, openCreateTaskModal }) => {
  const [activeTab, setActiveTab] = useState("all");

  const functionTitles = {
    "process-safety": "Process Safety",
    "personnel-safety": "Personnel Safety & Human Performance",
    epr: "Emergency Preparedness & Response",
    planning: "Planning",
    reports: "Reports & Analytics",
  };

  return (
    <div className="flex-1 md:ml-64 min-h-screen bg-slate-50">
      <Header title={functionTitles[currentFunction]} />

      {currentFunction !== "reports" && <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}

      <div className="max-w-7xl mx-auto p-6 md:p-8">{currentFunction === "reports" ? <ReportsSection /> : <FunctionSection functionId={currentFunction} activeTab={activeTab} openCreateTaskModal={openCreateTaskModal} />}</div>
    </div>
  );
};

export default MainContent;
