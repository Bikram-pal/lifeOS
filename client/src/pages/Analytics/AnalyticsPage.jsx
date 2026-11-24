import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Target,
  FileText,
  AlertCircle,
  Database,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { formatBytes } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111726] border border-[#233054] p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-200">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ color: p.color || p.fill }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics-reports'],
    queryFn: analyticsService.getReports,
  });

  const reports = analyticsData?.data;
  const summary = reports?.summary || {};
  const velocityChart = reports?.velocityChart || [];
  const priorityChart = reports?.priorityChart || [];
  const statusChart = reports?.statusChart || [];
  const projectPerformance = reports?.projectPerformance || [];
  const recommendations = reports?.recommendations || [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="h-14 w-1/3">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-12 lg:col-span-8 h-80 rounded-xl" />
          <Skeleton className="col-span-12 lg:col-span-4 h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Intelligence Reports & Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Productivity velocity, task burn-down, and knowledge base density.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#161F36] border border-[#233054] px-4 py-2 rounded-xl">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">LifeOS Productivity Index:</span>
          <span className="text-sm font-bold text-white font-mono">
            {summary.productivityScore || 50}/100
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary-500">
          <span className="text-xs text-slate-400 font-medium">TASK COMPLETION RATE</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              {summary.completionRate || 0}%
            </span>
            <Badge variant="primary">
              {summary.completedTasks} / {summary.totalTasks} Done
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {summary.pendingTasks} tasks remaining in workflow
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs text-slate-400 font-medium">ACTIVE PROJECTS</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              {summary.totalProjects || 0}
            </span>
            <Badge variant="success">In Progress</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Mapped into visual Kanban boards
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-violet-500">
          <span className="text-xs text-slate-400 font-medium">VAULT RAG DENSITY</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              {summary.totalChunks || 0}
            </span>
            <Badge variant="accent">{summary.totalDocuments} Docs</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {formatBytes(summary.storageBytes || 0)} indexed text
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-xs text-slate-400 font-medium">STRATEGIC GOALS</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              {summary.totalGoals || 0}
            </span>
            <Badge variant="warning">Tracking</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Target key results and milestones
          </p>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* 14-Day Velocity Area Chart */}
        <Card className="col-span-12 lg:col-span-8 p-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <CardTitle>14-Day Velocity & Cadence</CardTitle>
            </div>
            <span className="text-xs text-slate-400">Tasks Completed vs Created</span>
          </CardHeader>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233054" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown Bar Chart */}
        <Card className="col-span-12 lg:col-span-4 p-5 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <CardTitle>Tasks by Priority</CardTitle>
              </div>
            </CardHeader>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#233054" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                    {priorityChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Row: Project Performance & Recommendations */}
      <div className="grid grid-cols-12 gap-6">
        {/* Project Performance List */}
        <Card className="col-span-12 lg:col-span-6 p-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-400" />
              <CardTitle>Project Deliverables Progress</CardTitle>
            </div>
          </CardHeader>

          <div className="space-y-4 pt-2">
            {projectPerformance.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No active projects created yet.
              </p>
            ) : (
              projectPerformance.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{p.title}</span>
                    <span className="text-slate-400">
                      {p.completedTasks} / {p.totalTasks} tasks ({p.progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#111726] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* AI Recommendations & Insights */}
        <Card className="col-span-12 lg:col-span-6 p-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <CardTitle>Productivity Insights</CardTitle>
            </div>
          </CardHeader>

          <div className="space-y-3 pt-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-[#111726] border border-[#233054] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200">{rec.title}</h4>
                  <Badge variant="primary" className="text-[10px]">
                    Auto-Insight
                  </Badge>
                </div>
                <p className="text-slate-400 leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
