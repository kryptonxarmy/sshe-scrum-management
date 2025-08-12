import { TrendingUp, BarChart } from "lucide-react";

const TeamPerformance = () => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <TrendingUp size={20} />
        Team Performance
      </h3>
      <div className="text-center text-slate-600 py-8">
        <div className="text-5xl mb-4 opacity-30">
          <BarChart size={48} className="mx-auto" />
        </div>
        <p className="mb-2">No team members assigned yet</p>
        <p>Add some tasks to see performance metrics</p>
      </div>
    </div>
  );
};

export default TeamPerformance;
