import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { KanbanSquare } from 'lucide-react';

export const ProjectsPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Projects & Kanban</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage milestones, active initiatives, and visual workflow boards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KanbanSquare className="w-4 h-4 text-emerald-400" />
            <CardTitle>Kanban Workflow</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          Projects module enables drag-and-drop Kanban, milestone management, and task grouping.
        </p>
      </Card>
    </div>
  );
};
