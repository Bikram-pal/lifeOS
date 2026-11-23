import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Reports</h2>
        <p className="text-sm text-slate-400 mt-1">
          Weekly productivity trends, completion velocities, and AI recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <CardTitle>Productivity Intelligence</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          Analytics module calculates weekly reports, goal trajectories, and actionable insights.
        </p>
      </Card>
    </div>
  );
};
