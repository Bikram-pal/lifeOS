import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '../common/Card';
import { BarChart2 } from 'lucide-react';

export const ProductivityChart = ({ data = [] }) => {
  return (
    <Card className="col-span-full lg:col-span-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary-400" />
          <CardTitle>Productivity Velocity (7 Days)</CardTitle>
        </div>
        <span className="text-xs text-slate-400">Completed Actions</span>
      </CardHeader>

      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#233054" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#233054' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#111726] border border-[#233054] p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-semibold text-white">{payload[0].payload.date}</p>
                      <p className="text-primary-300 mt-1">
                        Completed: <span className="font-bold">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#6366F1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#productivityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
