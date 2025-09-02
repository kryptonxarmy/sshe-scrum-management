"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Users, Calendar, Archive, MessageCircleMore } from "lucide-react";

const ProjectCard = ({
  project,
  stats,
  canManageProjectActions,
  canManageMembers,
  getProjectOwnerName,
  getScrumMasterName,
  getStatusBadgeVariant,
  getStatusDisplay,
  handleEditProject,
  handleManageMembers,
  handleCommentsProject,
  handleReleaseProject,
  handleDeleteProject,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow min-w-[320px] max-w-[320px] flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>

          {(canManageProjectActions || canManageMembers) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canManageProjectActions && (
                  <DropdownMenuItem onClick={() => handleEditProject(project)} className="flex items-center gap-2">
                    <Edit size={14} />
                    Edit Project
                  </DropdownMenuItem>
                )}
                {canManageMembers && (
                  <>
                    <DropdownMenuItem onClick={() => handleManageMembers(project)} className="flex items-center gap-2">
                      <Users size={14} />
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCommentsProject(project)} className="flex items-center gap-2">
                      <MessageCircleMore size={14} />
                      Comments Project
                    </DropdownMenuItem>
                  </>
                )}
                {canManageProjectActions && project.status !== "RELEASED" && (
                  <DropdownMenuItem onClick={() => handleReleaseProject(project)} className="flex items-center gap-2 text-blue-600">
                    <Archive size={14} />
                    Release Project
                  </DropdownMenuItem>
                )}
                {canManageProjectActions && (
                  <>
                    <DropdownMenuItem onClick={() => handleDeleteProject(project)} className="flex items-center gap-2 text-red-600">
                      <Trash2 size={14} />
                      Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>

        {/* Owner and Scrum Master Info */}
        <div className="space-y-1">
          <p className="text-sm text-slate-600">
            <span className="font-medium">Owner:</span> {getProjectOwnerName(project.owner)}
          </p>
          {getScrumMasterName(project.scrumMaster) && (
            <p className="text-sm text-slate-600">
              <span className="font-medium">Scrum Master:</span> {getScrumMasterName(project.scrumMaster)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Badge variant={getStatusBadgeVariant(project.status)}>{getStatusDisplay(project.status, project.department)}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
          </div>

          {/* Enhanced Task Statistics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold text-gray-600">{stats.todo}</div>
              <div className="text-gray-500">To Do</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-600">{stats.inProgress}</div>
              <div className="text-gray-500">In Progress</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-600">{stats.completed}</div>
              <div className="text-gray-500">Done</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total: {stats.total} tasks</span>
            {stats.total > 0 && (
              <span>
                {stats.completed}/{stats.total} completed
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date"}</span>
            {/* Tambahkan keterangan short/long period di samping tanggal */}
            <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">{project.duration === "LONG_TERM" ? "Long Period" : "Short Period"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{project._count?.members || 0} members</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = `/tasks?projectId=${project.id}`)}>
            View Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
