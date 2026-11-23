import React from 'react';
import { Card, CardHeader, CardTitle } from '../common/Card';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

export const UpcomingDeadlines = ({ deadlines = [] }) => {
  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <CardTitle>Upcoming Deadlines</CardTitle>
        </div>
        <span className="text-xs text-slate-400">{deadlines.length} Due Soon</span>
      </CardHeader>

      {deadlines.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
          No imminent deadlines pending. Great job staying ahead!
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {deadlines.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#111726]/60 border border-[#233054]"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-medium text-slate-200 truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <Badge
                variant={
                  task.priority === 'HIGH' || task.priority === 'URGENT'
                    ? 'danger'
                    : 'warning'
                }
              >
                {task.priority || 'NORMAL'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
