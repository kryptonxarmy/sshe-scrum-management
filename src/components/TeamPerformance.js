import { TrendingUp, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeamPerformance = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={20} />
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-slate-600 py-8">
          <div className="text-5xl mb-4 opacity-30">
            <BarChart size={48} className="mx-auto" />
          </div>
          <p className="mb-2">No team members assigned yet</p>
          <p>Add some tasks to see performance metrics</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPerformance;
