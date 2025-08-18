import { useEffect, useState } from "react";
import CalendarDashboard from "./CalendarDashboardNew";

const CalendarDashboardData = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks/all`);
        const data = await res.json();
        if (data.error) {
          console.error("API Error:", data.error);
        }
        setTasks(data.tasks || []);
        console.log("Tasks fetched for calendar:", data.tasks);
      } catch (e) {
        setTasks([]);
        console.error("Fetch tasks error:", e);
      }
    };
    fetchTasks();
  }, []);

  return <CalendarDashboard tasks={tasks} />;
};

export default CalendarDashboardData;
