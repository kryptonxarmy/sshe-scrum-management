import { Settings, HardHat, AlertTriangle, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KanbanBoard from "./KanbanBoard";
import TeamPerformance from "./TeamPerformance";

const FunctionSection = ({ functionId, activeTab, openCreateTaskModal }) => {
  const functionIcons = {
    "process-safety": Settings,
    "personnel-safety": HardHat,
    epr: AlertTriangle,
    planning: Calendar,
  };

  const functionTitles = {
    "process-safety": "Process Safety",
    "personnel-safety": "Personnel Safety & Human Performance",
    epr: "Emergency Preparedness & Response",
    planning: "Planning",
  };

  const IconComponent = functionIcons[functionId];

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <IconComponent size={24} />
          <span className="hidden sm:inline">{functionTitles[functionId]}</span>
          <span className="sm:hidden">
            {functionTitles[functionId].split(" ")[0]} {functionTitles[functionId].split(" ")[1]}
          </span>
        </h2>
        <Button onClick={() => openCreateTaskModal(functionId)} className="w-full sm:w-auto justify-center">
          <Plus size={20} />
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <KanbanBoard functionId={functionId} activeTab={activeTab} />

      {/* Team Performance */}
      <TeamPerformance />
    </div>
  );
};

export default FunctionSection;
