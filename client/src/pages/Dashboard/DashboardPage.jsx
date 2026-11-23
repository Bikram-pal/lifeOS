import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  StickyNote,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import { useAuthStore } from '../../store/authStore';
import { StatCard } from '../../components/dashboard/StatCard';
import { ProductivityChart } from '../../components/dashboard/ProductivityChart';
import { AiInsightCard } from '../../components/dashboard/AiInsightCard';
import { UpcomingDeadlines } from '../../components/dashboard/UpcomingDeadlines';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { Skeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
    refetchInterval: 30000,
  });

  const summary = data?.data;

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-1/3">
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

  if (error) {
    return (
      <div className="p-8 rounded-xl bg-rose-950/20 border border-rose-800/40 text-center">
        <p className="text-sm text-rose-300 font-medium mb-3">
          Failed to load dashboard metrics: {error.message || 'Server unreachable'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Retry Loading
        </Button>
      </div>
    );
  }

  const stats = summary?.stats || {
    totalDocuments: 0,
    totalNotes: 0,
    activeProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#12192D] via-[#161F36] to-[#12192D] border border-[#233054] shadow-card">
        <div>
          <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider font-mono">
            {todayFormatted}
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Welcome back, <span className="text-gradient">{user?.name || 'Explorer'}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            LifeOS is monitoring your knowledge base, projects, and active tasks. You have{' '}
            <span className="text-amber-400 font-semibold">{stats.pendingTasks} pending tasks</span> and{' '}
            <span className="text-emerald-400 font-semibold">{stats.activeProjects} active projects</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="accent"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => navigate('/ai')}
          >
            Context to Action
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="DOCUMENTS INDEXED"
          value={stats.totalDocuments}
          subtitle="RAG Knowledge Vault"
          icon={FileText}
          color="primary"
          onClick={() => navigate('/vault')}
        />
        <StatCard
          title="NOTES & INSIGHTS"
          value={stats.totalNotes}
          subtitle="Captured Thoughts"
          icon={StickyNote}
          color="violet"
          onClick={() => navigate('/vault')}
        />
        <StatCard
          title="ACTIVE PROJECTS"
          value={stats.activeProjects}
          subtitle="In Flight Work"
          icon={FolderKanban}
          color="emerald"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="PENDING TASKS"
          value={stats.pendingTasks}
          subtitle={`${stats.completedTasks} Completed`}
          icon={CheckCircle2}
          color="amber"
          onClick={() => navigate('/tasks')}
        />
      </div>

      {/* Charts & AI Insights Grid */}
      <div className="grid grid-cols-12 gap-6">
        <ProductivityChart data={summary?.productivityChart || []} />
        <AiInsightCard insights={summary?.insights || []} />
      </div>

      {/* Deadlines and Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <UpcomingDeadlines deadlines={summary?.upcomingDeadlines || []} />
        <RecentActivity activities={summary?.recentActivity || []} />
      </div>
    </div>
  );
};
