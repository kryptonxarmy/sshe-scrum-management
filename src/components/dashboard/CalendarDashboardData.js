import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import CalendarDashboard from "./CalendarDashboardNew";

const CalendarDashboardData = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("ALL_TASKS");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;

      try {
        let url;

        // For team members, use the new calendar API with filters
        if (user.role === "TEAM_MEMBER") {
          url = `/api/calendar/tasks?userId=${user.id}&filter=${filter}`;
        } else {
          // For other roles, use the existing all tasks API
          url = `/api/tasks/all`;
        }

        console.log("Fetching calendar tasks from:", url);

        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          console.error("API Error:", data.error);
          setTasks([]);
          return;
        }

        const fetchedTasks = data.tasks || [];
        setTasks(fetchedTasks);
        console.log(`Calendar tasks fetched: ${fetchedTasks.length} tasks with filter: ${filter}`);
      } catch (e) {
        setTasks([]);
        console.error("Fetch calendar tasks error:", e);
      }
    };

    fetchTasks();
  }, [user?.id, user?.role, filter]);

  // Show filter only for team members
  const showFilter = user?.role === "TEAM_MEMBER";

  return (
    <div className="space-y-4">
      {showFilter && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Task Filter:</span>
            <Select value={filter} onValueChange={(value) => setFilter(value)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TASKS">All Tasks (from my projects)</SelectItem>
                <SelectItem value="MY_TASKS">Only My Assigned Tasks</SelectItem>
                <SelectItem value="PROJECT_TASKS">All Project Tasks</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-500">Showing {tasks.length} task(s)</span>
          </div>
        </div>
      )}
      <CalendarDashboard tasks={tasks} />
    </div>
  );
};

export default CalendarDashboardData;
