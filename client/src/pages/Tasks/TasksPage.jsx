import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { CheckSquare } from 'lucide-react';

export const TasksPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Actionable Tasks</h2>
        <p className="text-sm text-slate-400 mt-1">
          Review, approve, and complete tasks generated from documents and projects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <CardTitle>Task Management</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          Tasks module tracks priorities, due dates, project links, and completion statuses.
        </p>
      </Card>
    </div>
  );
};
