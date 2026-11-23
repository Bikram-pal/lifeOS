import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  BotMessageSquare,
  Network,
  KanbanSquare,
  CheckSquare,
  Target,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { cn } from '../../utils/formatters';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Knowledge Vault', path: '/vault', icon: FolderGit2 },
  { name: 'AI Command Center', path: '/ai', icon: BotMessageSquare, highlight: true },
  { name: 'Knowledge Graph', path: '/graph', icon: Network },
  { name: 'Projects & Kanban', path: '/projects', icon: KanbanSquare },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Intelligence Reports', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue client logout
    }
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-[#0E1424] border-r border-[#233054] transition-all duration-300 z-30 select-none',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#233054]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-glow-primary shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-wide text-white">
                Life<span className="text-primary-400">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Personal OS
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1D2847] transition-colors"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F36]',
                  !isSidebarOpen && 'justify-center px-0'
                )
              }
              title={!isSidebarOpen ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform group-hover:scale-105',
                  item.highlight && 'text-violet-400'
                )}
              />
              {isSidebarOpen && (
                <span className="truncate">{item.name}</span>
              )}
              {isSidebarOpen && item.highlight && (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#233054]">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-[#111726]/80 border border-[#233054]',
            !isSidebarOpen && 'justify-center p-2'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Explorer'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@lifeos.local'}</p>
            </div>
          )}
          {isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
