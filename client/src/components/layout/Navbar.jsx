import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';

const TITLE_MAP = {
  '/dashboard': 'Smart Dashboard',
  '/vault': 'Knowledge Vault',
  '/ai': 'AI Command Center & RAG',
  '/graph': 'Knowledge Graph',
  '/projects': 'Projects & Kanban',
  '/tasks': 'Actionable Tasks',
  '/goals': 'Strategic Goals',
  '/analytics': 'Intelligence & Analytics',
  '/settings': 'System Settings',
};

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const title = TITLE_MAP[location.pathname] || 'Workspace';

  return (
    <header className="h-16 border-b border-[#233054] bg-[#0E1424]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
          <ShieldCheck className="w-3 h-3" />
          RAG-Ready
        </span>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Context to Action Button */}
        <Button
          variant="accent"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => navigate('/ai')}
        >
          <span className="hidden sm:inline">Ask</span> LifeAI
        </Button>

        {/* Upload or Create shortcut */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => navigate('/vault')}
        >
          <span className="hidden sm:inline">Add</span> Resource
        </Button>

        <div className="h-5 w-[1px] bg-[#233054] mx-1" />

        {/* Notifications badge */}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1D2847] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        </button>
      </div>
    </header>
  );
};
