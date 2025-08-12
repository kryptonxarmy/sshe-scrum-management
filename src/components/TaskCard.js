const TaskCard = ({ task }) => {
  const getTypeBadgeStyle = (type) => {
    const styles = {
      spike: "bg-amber-100 text-amber-700",
      story: "bg-blue-100 text-blue-800",
      sprint: "bg-green-100 text-green-700",
      qa: "bg-red-100 text-red-700",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      high: "bg-red-100 text-red-700",
      medium: "bg-amber-100 text-amber-700",
      low: "bg-green-100 text-green-700",
    };
    return styles[priority] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-slate-50 border border-gray-200 rounded-lg p-4 cursor-grab transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 relative group min-h-[120px]">
      {/* Task Type Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeStyle(task.type)}`}>{task.type.charAt(0).toUpperCase() + task.type.slice(1)}</div>

      {/* Task Title */}
      <div className="font-semibold text-slate-800 mb-3 mr-16 leading-tight text-sm">{task.title}</div>

      {/* Task Meta */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-600">
        <span className={`px-2 py-1 rounded-full font-medium ${getPriorityStyle(task.priority)}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <span className="text-xs text-slate-500">{task.status === "done" ? "Completed" : `Due: ${task.dueDate}`}</span>
      </div>
    </div>
  );
};

export default TaskCard;
