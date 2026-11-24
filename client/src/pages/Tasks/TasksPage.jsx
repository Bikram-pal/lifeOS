import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { taskService } from '../../services/task.service';
import { projectService } from '../../services/project.service';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/dateUtils';

const STATUS_FILTERS = [
  { label: 'All Tasks', value: '' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Review', value: 'REVIEW' },
  { label: 'Completed', value: 'COMPLETED' },
];

const PRIORITY_BADGES = {
  LOW: { variant: 'default', text: 'Low' },
  MEDIUM: { variant: 'primary', text: 'Medium' },
  HIGH: { variant: 'warning', text: 'High' },
  URGENT: { variant: 'danger', text: 'Urgent' },
};

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    project: '',
  });

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { status: selectedStatus, priority: selectedPriority, search }],
    queryFn: () =>
      taskService.getTasks({
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
        search: search || undefined,
      }),
  });

  // Fetch projects for assignment dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const tasks = tasksData?.data || [];
  const projects = projectsData?.data || [];

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        project: data.project || null,
      };
      if (editingTask) {
        return taskService.updateTask(editingTask._id, payload);
      }
      return taskService.createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success(editingTask ? 'Task updated' : 'Task created successfully');
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save task');
    },
  });

  // Status toggle mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: () => toast.error('Failed to update task status'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Task removed');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      project: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      project: task.project?._id || task.project || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary-400" />
            Actionable Tasks
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize, prioritize, and track your action items and project deliverables.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          New Task
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSelectedStatus(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === f.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-[#111726] text-slate-300 hover:bg-[#1D2847] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search & Priority Controls */}
          <div className="flex items-center gap-3">
            <div className="w-56">
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[#111726] border border-[#233054] text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6 text-primary-400" />}
          title="No tasks found"
          description="You haven't created any tasks matching your filters yet."
          actionLabel="Create a Task"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;

            return (
              <div
                key={task._id}
                className={`group flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-[#111726]/40 border-[#1B253D] opacity-75'
                    : 'bg-[#161F36]/80 border-[#233054] hover:border-slate-600 hover:bg-[#1D2847]/70'
                }`}
              >
                {/* Left check & info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() =>
                      statusMutation.mutate({
                        id: task._id,
                        status: isCompleted ? 'TODO' : 'COMPLETED',
                      })
                    }
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-primary-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.project && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${task.project.color || '#6366F1'}20`,
                            color: task.project.color || '#6366F1',
                            border: `1px solid ${task.project.color || '#6366F1'}40`,
                          }}
                        >
                          {task.project.title}
                        </span>
                      )}
                      {task.aiGenerated && (
                        <span className="flex items-center gap-1 text-[10px] text-violet-300 bg-violet-950/60 border border-violet-800/60 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3 text-violet-400" /> AI
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right metadata & actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={priorityInfo.variant}>{priorityInfo.text}</Badge>

                  {task.dueDate && (
                    <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#233054] transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(task._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g., Draft system architecture notes"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              className="w-full bg-[#111726] border border-[#233054] rounded-lg p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 min-h-[80px]"
              placeholder="Add details, checklists, or context..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Priority</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Status</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Assign to Project</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
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
              <label className="block text-xs font-medium text-slate-300">Due Date</label>
              <input
                type="date"
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
            <Button variant="secondary" size="md" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={saveMutation.isPending}>
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
