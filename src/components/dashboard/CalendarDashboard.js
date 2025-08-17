import React, { useEffect, useState } from "react";

function getMonthDays(year, month) {
  // month: 0-based
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  // month: 0-based
  return new Date(year, month, 1).getDay();
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

const CalendarDashboard = ({ tasks }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getMonthDays(year, month);
  const firstDay = getFirstDay(year, month);

  // Map tasks by date
  const tasksByDate = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const key = formatDate(d);
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(task);
    }
  });

  // Build calendar grid
  const calendar = [];
  let dayNum = 1;
  for (let week = 0; week < 6; week++) {
    const weekRow = [];
    for (let day = 0; day < 7; day++) {
      if ((week === 0 && day < firstDay) || dayNum > daysInMonth) {
        weekRow.push(null);
      } else {
        weekRow.push(dayNum);
        dayNum++;
      }
    }
    calendar.push(weekRow);
  }

  return (
  <div className="bg-white text-slate-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <button
          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs mr-2 border border-purple-200 hover:bg-purple-200 transition"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          &lt; Prev
        </button>
  <h2 className="text-xl font-bold text-purple-700">{viewDate.toLocaleString("default", { month: "long" })} {year}</h2>
        <button
          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs ml-2 border border-purple-200 hover:bg-purple-200 transition"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
        >
          Next &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 border border-purple-200 rounded-lg overflow-hidden">
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
          <div key={d} className="py-2 px-1 text-center font-semibold text-xs border-b border-purple-200 bg-purple-50 text-purple-700">{d}</div>
        ))}
        {calendar.map((week, i) =>
          week.map((day, j) => (
            <div key={i + "-" + j} className="h-20 border-r border-b border-purple-100 bg-white relative">
              {day && (
                <>
                  <div className="absolute top-1 left-1 text-xs text-slate-400">{day}</div>
                  {tasksByDate[`${year}-${(month+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`]?.map((task) => (
                    <div key={task.id} className="mt-5 bg-purple-100 text-purple-800 rounded px-2 py-1 text-xs truncate border border-purple-300 shadow-sm">
                      {task.title} <span className="text-purple-500">({new Date(task.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })})</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarDashboard;
