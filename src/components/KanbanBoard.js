import TaskCard from "./TaskCard";

const KanbanBoard = ({ functionId, activeTab }) => {
  // Sample data - in real app this would come from state/API
  const taskData = {
    "process-safety": {
      todo: [
        {
          id: "1",
          title: "HAZOP Study for New Process Unit",
          type: "story",
          priority: "high",
          dueDate: "Dec 15",
          status: "todo",
        },
        {
          id: "2",
          title: "Risk Assessment Documentation",
          type: "spike",
          priority: "medium",
          dueDate: "Dec 20",
          status: "todo",
        },
      ],
      progress: [
        {
          id: "3",
          title: "Process Safety Management System Update",
          type: "sprint",
          priority: "high",
          dueDate: "Dec 18",
          status: "progress",
        },
      ],
      done: [
        {
          id: "4",
          title: "Safety Instrumented System Review",
          type: "qa",
          priority: "medium",
          dueDate: "Completed",
          status: "done",
        },
      ],
    },
    "personnel-safety": {
      todo: [
        {
          id: "5",
          title: "Behavior Based Safety Audit",
          type: "story",
          priority: "high",
          dueDate: "Dec 16",
          status: "todo",
        },
        {
          id: "6",
          title: "Safety Training Program Update",
          type: "sprint",
          priority: "medium",
          dueDate: "Dec 22",
          status: "todo",
        },
      ],
      progress: [
        {
          id: "7",
          title: "Human Factors Analysis Study",
          type: "spike",
          priority: "high",
          dueDate: "Dec 19",
          status: "progress",
        },
      ],
      done: [
        {
          id: "8",
          title: "PPE Compliance Assessment",
          type: "qa",
          priority: "low",
          dueDate: "Completed",
          status: "done",
        },
      ],
    },
    epr: {
      todo: [
        {
          id: "9",
          title: "Emergency Response Plan Review",
          type: "story",
          priority: "high",
          dueDate: "Dec 17",
          status: "todo",
        },
      ],
      progress: [
        {
          id: "10",
          title: "Crisis Management Drill",
          type: "sprint",
          priority: "medium",
          dueDate: "Dec 21",
          status: "progress",
        },
      ],
      done: [
        {
          id: "11",
          title: "Emergency Equipment Check",
          type: "qa",
          priority: "low",
          dueDate: "Completed",
          status: "done",
        },
      ],
    },
    planning: {
      todo: [
        {
          id: "12",
          title: "Annual SHE Strategy Review",
          type: "spike",
          priority: "high",
          dueDate: "Dec 30",
          status: "todo",
        },
      ],
      progress: [
        {
          id: "13",
          title: "Resource Allocation Planning",
          type: "story",
          priority: "medium",
          dueDate: "Dec 25",
          status: "progress",
        },
      ],
      done: [
        {
          id: "14",
          title: "Q4 Performance Metrics",
          type: "qa",
          priority: "low",
          dueDate: "Completed",
          status: "done",
        },
      ],
    },
  };

  const currentTasks = taskData[functionId] || { todo: [], progress: [], done: [] };

  const filterTasks = (tasks, status) => {
    if (activeTab === "all") return tasks;
    if (activeTab === status) return tasks;
    return [];
  };

  const columns = [
    { id: "todo", title: "Todo", tasks: currentTasks.todo, borderColor: "border-red-500" },
    { id: "progress", title: "In Progress", tasks: currentTasks.progress, borderColor: "border-amber-500" },
    { id: "done", title: "Done", tasks: currentTasks.done, borderColor: "border-green-500" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {columns.map((column) => (
        <div key={column.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 min-h-[400px]">
          <div className={`font-semibold text-gray-700 mb-4 pb-2 border-b-2 ${column.borderColor} uppercase text-sm tracking-wide`}>{column.title}</div>
          <div className="space-y-4">
            {filterTasks(column.tasks, column.id).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {filterTasks(column.tasks, column.id).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📋</div>
                <p>No tasks</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
