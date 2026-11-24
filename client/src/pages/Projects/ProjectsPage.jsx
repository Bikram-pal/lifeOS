import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  KanbanSquare,
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectService } from '../../services/project.service';
import { taskService } from '../../services/task.service';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/dateUtils';

const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'To Do', badgeVariant: 'default' },
  { id: 'IN_PROGRESS', title: 'In Progress', badgeVariant: 'primary' },
  { id: 'REVIEW', title: 'Review', badgeVariant: 'warning' },
  { id: 'COMPLETED', title: 'Completed', badgeVariant: 'success' },
];

const COLOR_PALETTE = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Rose
  '#06B6D4', // Cyan
];

const PRIORITY_BADGES = {
  LOW: { variant: 'default', text: 'Low' },
  MEDIUM: { variant: 'primary', text: 'Med' },
  HIGH: { variant: 'warning', text: 'High' },
  URGENT: { variant: 'danger', text: 'Urgent' },
};

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'projects'
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'ACTIVE',
    color: '#6366F1',
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    project: '',
  });

  // Queries
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', { project: selectedProjectId }],
    queryFn: () => taskService.getTasks({ project: selectedProjectId || undefined }),
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  // Project Mutations
  const saveProjectMutation = useMutation({
    mutationFn: (data) => {
      if (editingProject) {
        return projectService.updateProject(editingProject._id, data);
      }
      return projectService.createProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success(editingProject ? 'Project updated' : 'Project created');
      setIsProjectModalOpen(false);
      setEditingProject(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save project');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Project deleted');
    },
  });

  // Task Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Task created');
      setIsTaskModalOpen(false);
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: () => toast.error('Failed to change status'),
  });

  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      description: '',
      status: 'ACTIVE',
      color: '#6366F1',
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      description: proj.description || '',
      status: proj.status,
      color: proj.color || '#6366F1',
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenCreateTask = (defaultStatus = 'TODO') => {
    setTaskForm({
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'MEDIUM',
      project: selectedProjectId || '',
    });
    setIsTaskModalOpen(true);
  };

  const moveTask = (task, direction) => {
    const colOrder = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    const currentIndex = colOrder.indexOf(task.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < colOrder.length) {
      updateTaskStatusMutation.mutate({ id: task._id, status: colOrder[newIndex] });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-emerald-400" />
            Projects & Kanban
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Visual workflow boards and initiative tracking for your deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-[#111726] border border-[#233054] rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'projects'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Projects
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateProject}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="space-y-4">
          {/* Project Filter Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Filter Board by:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#111726] border border-[#233054] text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map((column, colIdx) => {
              const colTasks = tasks.filter((t) => t.status === column.id);

              return (
                <div
                  key={column.id}
                  className="flex flex-col bg-[#0F162A]/90 border border-[#233054] rounded-xl p-3.5 min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#233054]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">{column.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#161F36] border border-[#233054] text-slate-400 font-mono">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenCreateTask(column.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E294B] transition-colors"
                      title={`Add task to ${column.title}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Task Cards in Column */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-xs text-slate-500 border border-dashed border-[#1E294B] rounded-lg">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const priorityInfo =
                          PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;

                        return (
                          <div
                            key={task._id}
                            className="p-3.5 bg-[#161F36] border border-[#233054] hover:border-slate-500 rounded-lg transition-all shadow-sm group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-xs font-semibold text-slate-100 line-clamp-2">
                                {task.title}
                              </h4>
                              <Badge variant={priorityInfo.variant} className="text-[10px] px-1.5 py-0 shrink-0">
                                {priorityInfo.text}
                              </Badge>
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-slate-400 mb-2.5 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Tags / Project */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1E294B] text-[10px]">
                              {task.project ? (
                                <span
                                  className="px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]"
                                  style={{
                                    backgroundColor: `${task.project.color || '#6366F1'}20`,
                                    color: task.project.color || '#6366F1',
                                  }}
                                >
                                  {task.project.title}
                                </span>
                              ) : (
                                <span className="text-slate-500">Unassigned</span>
                              )}

                              {/* Movement Buttons */}
                              <div className="flex items-center gap-1">
                                {colIdx > 0 && (
                                  <button
                                    onClick={() => moveTask(task, 'prev')}
                                    className="p-1 rounded hover:bg-[#233054] text-slate-400 hover:text-white transition-colors"
                                    title="Move left"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {colIdx < KANBAN_COLUMNS.length - 1 && (
                                  <button
                                    onClick={() => moveTask(task, 'next')}
                                    className="p-1 rounded hover:bg-[#233054] text-slate-400 hover:text-white transition-colors"
                                    title="Move right"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects Overview List View */}
      {viewMode === 'projects' && (
        <div>
          {isProjectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-6 h-6 text-emerald-400" />}
              title="No projects created yet"
              description="Group your tasks and milestones into high-level projects."
              actionLabel="Create Project"
              onAction={handleOpenCreateProject}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const stats = proj.taskStats || { total: 0, completed: 0, progress: 0 };

                return (
                  <Card key={proj._id} className="relative overflow-hidden group">
                    {/* Color stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: proj.color || '#6366F1' }}
                    />

                    <div className="flex items-start justify-between gap-3 mb-2 pt-1">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-100 truncate">
                          {proj.title}
                        </h3>
                        <Badge variant="default" className="text-[10px] mt-1">
                          {proj.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditProject(proj)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#233054]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProjectMutation.mutate(proj._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                        {proj.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-3 border-t border-[#233054]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-200 font-medium">
                          {stats.completed} / {stats.total} tasks ({stats.progress}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#111726] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${stats.progress}%`,
                            backgroundColor: proj.color || '#6366F1',
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!projectForm.title.trim()) {
              toast.error('Project title is required');
              return;
            }
            saveProjectMutation.mutate(projectForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Project Title *"
            placeholder="e.g. LifeOS Platform Architecture"
            value={projectForm.title}
            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              className="w-full bg-[#111726] border border-[#233054] rounded-lg p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 min-h-[80px]"
              placeholder="Objectives and scope..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Status</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Brand Color</label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProjectForm({ ...projectForm, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      projectForm.color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={saveProjectMutation.isPending}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Task to Board"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!taskForm.title.trim()) {
              toast.error('Task title is required');
              return;
            }
            createTaskMutation.mutate(taskForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Task Title *"
            placeholder="What needs to be done?"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 min-h-[60px]"
              placeholder="Optional notes or details..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Priority</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Project</label>
              <select
                className="w-full bg-[#111726] border border-[#233054] rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                value={taskForm.project}
                onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={createTaskMutation.isPending}
            >
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
