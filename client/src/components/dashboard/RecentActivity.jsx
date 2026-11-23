import React from 'react';
import { Card, CardHeader, CardTitle } from '../common/Card';
import { Activity, Clock } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

export const RecentActivity = ({ activities = [] }) => {
  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <CardTitle>Recent Workspace Activity</CardTitle>
        </div>
        <span className="text-xs text-slate-400">Live Updates</span>
      </CardHeader>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No recent actions recorded yet. Create notes, tasks, or documents to see activity stream.
        </div>
      ) : (
        <div className="space-y-2.5 mt-2">
          {activities.map((act) => (
            <div
              key={act._id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#111726]/60 border border-[#233054]"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-medium text-slate-200 truncate">{act.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(act.updatedAt)}
                  </span>
                </div>
              </div>
              <Badge variant={act.status === 'COMPLETED' ? 'success' : 'primary'}>
                {act.status || 'UPDATED'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
