import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ReportsPageSimple = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-left">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Project Reports
          </h1>
          <p className="text-slate-600 text-xl max-w-3xl leading-relaxed">
            Comprehensive insights into project performance, team productivity, and delivery metrics across all functions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-2xl border-0">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-2">124</h3>
              <p className="text-indigo-100">Total Tasks</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-2xl border-0">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-2">89</h3>
              <p className="text-emerald-100">Completed</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-slate-600 py-8">Charts will be loaded here...</p>
      </div>
    </div>
  );
};

export default ReportsPageSimple;
