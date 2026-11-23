import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Target } from 'lucide-react';

export const GoalsPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Strategic Goals</h2>
        <p className="text-sm text-slate-400 mt-1">
          Set measurable targets and track progress connected to projects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" />
            <CardTitle>Goals & Key Results</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          Goals module tracks quantitative milestones and links high-level goals with daily work.
        </p>
      </Card>
    </div>
  );
};
