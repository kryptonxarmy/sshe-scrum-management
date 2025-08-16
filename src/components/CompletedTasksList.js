"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CompletedTasksList = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 mt-8">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Completed Tasks</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.assignee?.name || '-'}</TableCell>
                <TableCell>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Badge className={
                    task.priority === 'HIGH' ? 'bg-red-500 text-white' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                    'bg-blue-500 text-white'
                  }>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    Done
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompletedTasksList;
