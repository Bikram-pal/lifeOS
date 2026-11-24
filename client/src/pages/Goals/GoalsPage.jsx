import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Trophy,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { goalService } from '../../services/goal.service';
import { projectService } from '../../services/project.service';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/dateUtils';

const UNIT_PRESETS = ['%', 'features', 'books', 'hours', 'pages', 'sessions'];

export const GoalsPage = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: 100,
    currentValue: 0,
    unit: '%',
    deadline: '',
    connectedProjects: [],
  });

  // Queries
  const { data: goalsData, isLoading: isGoalsLoading } = useQuery({
    queryKey: ['goals', { status: selectedStatus }],
    queryFn: () => goalService.getGoals({ status: selectedStatus || undefined }),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const goals = goalsData?.data || [];
  const projects = projectsData?.data || [];

  // Mutations
  const saveGoalMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        targetValue: Number(data.targetValue),
        currentValue: Number(data.currentValue || 0),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      };
      if (editingGoal) {
        return goalService.updateGoal(editingGoal._id, payload);
      }
      return goalService.createGoal(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(editingGoal ? 'Goal updated' : 'Strategic Goal created');
      setIsModalOpen(false);
      setEditingGoal(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save goal');
    },
  });

  const quickProgressMutation = useMutation({
    mutationFn: ({ id, currentValue }) =>
      goalService.updateGoalProgress(id, currentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: () => toast.error('Failed to update progress'),
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal removed');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      targetValue: 100,
      currentValue: 0,
      unit: '%',
      deadline: '',
      connectedProjects: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit || '%',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      connectedProjects: (goal.connectedProjects || []).map((p) => p._id || p),
    });
    setIsModalOpen(true);
  };

  const handleStepProgress = (goal, delta) => {
    const nextVal = Math.max(0, Math.min(goal.targetValue, goal.currentValue + delta));
    quickProgressMutation.mutate({ id: goal._id, currentValue: nextVal });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Goal title is required');
      return;
    }
    if (!formData.targetValue || Number(formData.targetValue) <= 0) {
      toast.error('Target value must be greater than 0');
      return;
    }
    saveGoalMutation.mutate(formData);
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) =>
    !search.trim() || g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-rose-400" />
            Strategic Goals & OKRs
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Establish measurable key results and track target milestones connected to your projects.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          New Goal
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: '', label: 'All Goals' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'ACHIEVED', label: 'Achieved' },
              { id: 'OVERDUE', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-[#111726] text-slate-300 hover:bg-[#1D2847] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search goals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Goal Cards Grid */}
      {isGoalsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-rose-400" />}
          title="No strategic goals yet"
          description="Define measurable key results (OKRs) to track progress across your projects and initiatives."
          actionLabel="Create Goal"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const isAchieved = goal.status === 'ACHIEVED';
            const isOverdue = goal.status === 'OVERDUE';
            const progress = goal.progress || 0;

            return (
              <Card
                key={goal._id}
                className={`flex flex-col justify-between group transition-all border ${
                  isAchieved
                    ? 'border-emerald-700/60 bg-emerald-950/20'
                    : isOverdue
                    ? 'border-rose-700/60 bg-rose-950/20'
                    : 'border-[#233054] hover:border-slate-500'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            isAchieved
                              ? 'success'
                              : isOverdue
                              ? 'danger'
                              : 'primary'
                          }
                          className="text-[10px]"
                        >
                          {goal.status}
                        </Badge>
                        {goal.deadline && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatDate(goal.deadline)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-100 truncate" title={goal.title}>
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(goal)}
                        className="p-1 rounded hover:bg-[#233054] text-slate-400 hover:text-white"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteGoalMutation.mutate(goal._id)}
                        className="p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {goal.description}
                    </p>
                  )}

                  {/* Connected Projects */}
                  {goal.connectedProjects && goal.connectedProjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {goal.connectedProjects.map((p) => (
                        <span
                          key={p._id}
                          className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                          style={{
                            backgroundColor: `${p.color || '#6366F1'}20`,
                            color: p.color || '#6366F1',
                          }}
                        >
                          {p.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress Metric & Steppers */}
                <div className="pt-3 border-t border-[#233054] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-slate-100 font-bold">{progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#111726] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAchieved
                          ? 'bg-emerald-500'
                          : isOverdue
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-rose-500 to-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStepProgress(goal, -1)}
                        className="px-2 py-0.5 text-xs rounded bg-[#111726] hover:bg-[#1E294B] text-slate-300 hover:text-white border border-[#233054]"
                        title="Decrement -1"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleStepProgress(goal, 1)}
                        className="px-2 py-0.5 text-xs rounded bg-[#111726] hover:bg-[#1E294B] text-slate-300 hover:text-white border border-[#233054]"
                        title="Increment +1"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleStepProgress(goal, 5)}
                        className="px-2 py-0.5 text-xs rounded bg-[#111726] hover:bg-[#1E294B] text-slate-300 hover:text-white border border-[#233054]"
                        title="Increment +5"
                      >
                        +5
                      </button>
                    </div>

                    {isAchieved && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Achieved!
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Strategic Goal' : 'Create Strategic Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Title *"
            placeholder="e.g., Read 12 AI & Engineering Books"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 min-h-[70px]"
              placeholder="Rationale and key results..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Goal *"
              type="number"
              min="1"
              value={formData.targetValue}
              onChange={(e) =>
                setFormData({ ...formData, targetValue: e.target.value })
              }
            />

            <Input
              label="Current Progress"
              type="number"
              min="0"
              value={formData.currentValue}
              onChange={(e) =>
                setFormData({ ...formData, currentValue: e.target.value })
              }
            />
          </div>

          {/* Unit selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Unit of Measurement</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {UNIT_PRESETS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setFormData({ ...formData, unit: u })}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    formData.unit === u
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-[#111726] text-slate-300 border-[#233054] hover:bg-[#1E294B]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or custom unit (e.g., chapters, miles, PRs)"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          {/* Connected Projects & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Link to Project</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={formData.connectedProjects[0] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connectedProjects: e.target.value ? [e.target.value] : [],
                  })
                }
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Target Deadline</label>
              <input
                type="date"
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={saveGoalMutation.isPending}
            >
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
