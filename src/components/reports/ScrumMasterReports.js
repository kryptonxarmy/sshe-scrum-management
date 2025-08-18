import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle, 
  AlertCircle,
  Target,
  Activity,
  BarChart3,
  Award,
  UserCheck,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

const ScrumMasterReports = () => {
  const { user } = useAuth();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const projectParam = selectedProject !== 'all' ? `&projectId=${selectedProject}` : '';
      const response = await fetch(`/api/reports/scrum-master?userId=${user.id}${projectParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedProject]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (!user || user.role !== 'SCRUM_MASTER') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only Scrum Masters can access this report.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (!reportsData || reportsData.teamPerformance.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Data Available</h2>
          <p className="text-gray-600">No team performance data found for your projects.</p>
        </div>
      </div>
    );
  }

  const getPerformanceBadge = (completionRate) => {
    if (completionRate >= 80) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">High Performance</Badge>;
    } else if (completionRate >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average Performance</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>;
    }
  };

  const getProductivityIcon = (score) => {
    if (score >= 10) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 5) return <Activity className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Scrum Master Reports
          </h1>
          <p className="text-gray-600 mt-2">Team performance and project insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {reportsData.projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchReports} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.projectsSummary.avgCompletionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              High Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {reportsData.teamStats.highPerformers}
            </div>
            <p className="text-sm text-gray-600">Members with ≥80% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-yellow-600" />
              Average Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {reportsData.teamStats.averagePerformers}
            </div>
            <p className="text-sm text-gray-600">Members with 50-79% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {reportsData.teamStats.needsAttention}
            </div>
            <p className="text-sm text-gray-600">Members with &lt;50% completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Most Productive Member */}
      {reportsData.teamStats.mostProductiveMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              Top Performer This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {reportsData.teamStats.mostProductiveMember.user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{reportsData.teamStats.mostProductiveMember.user.name}</h3>
                <p className="text-gray-600">{reportsData.teamStats.mostProductiveMember.projectName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {reportsData.teamStats.mostProductiveMember.metrics.productivityScore}
                </p>
                <p className="text-sm text-gray-600">Story Points/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Avg Completion Time</TableHead>
                <TableHead>Productivity</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsData.teamPerformance.map((member, index) => (
                <TableRow key={`${member.user.id}-${member.projectId}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-gray-500">{member.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{member.projectName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{member.metrics.totalTasks} total</div>
                      <div className="text-green-600">{member.metrics.completedTasks} completed</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={member.metrics.completionRate} className="w-16" />
                      <span className="text-sm font-medium">{member.metrics.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{member.metrics.avgCompletionTime} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getProductivityIcon(member.metrics.productivityScore)}
                      <span className="text-sm font-medium">{member.metrics.productivityScore} pts/week</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPerformanceBadge(member.metrics.completionRate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Project Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Project Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportsData.projectPerformance.map((project) => (
              <Card key={project.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-600">Owner: {project.owner.name}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-semibold">{project.completionRate}%</span>
                    </div>
                    
                    <Progress value={project.completionRate} className="w-full" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Tasks: {project.totalTasks}</span>
                      <span className="text-gray-600">Members: {project.memberCount}</span>
                    </div>
                    
                    <div className="flex justify-center">
                      {project.performance === 'high' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">High Performance</Badge>
                      )}
                      {project.performance === 'medium' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average Performance</Badge>
                      )}
                      {project.performance === 'low' && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrumMasterReports;
