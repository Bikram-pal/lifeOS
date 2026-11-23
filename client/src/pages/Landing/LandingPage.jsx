import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GitFork,
  CheckCircle,
  FileText,
  Workflow,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-primary-500/30 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#233054] px-6 lg:px-16 flex items-center justify-between sticky top-0 bg-[#0B0F19]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-glow-primary">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Life<span className="text-primary-400">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-20 pb-28 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/70 border border-primary-800/50 text-xs font-semibold text-primary-300 mb-6 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          Context-to-Action Engine Active
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Your Knowledge. Your Work.{' '}
          <span className="text-gradient">Your Intelligence.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          LifeOS isn't a simple chatbot. It’s a personal operating system that ingests your PDFs & notes, connects ideas in a Knowledge Graph, and automatically turns information into actionable projects & tasks.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto shadow-glow-accent px-8"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Launch Your LifeOS
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
              Open Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#161F36]/60 border border-[#233054] backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-950 border border-primary-800/50 flex items-center justify-center text-primary-400 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Knowledge Vault & RAG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload documents, auto-chunk text, and retrieve grounded answers with full source references.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F36]/60 border border-[#233054] backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-800/50 flex items-center justify-center text-violet-400 mb-4">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Context-to-Action</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convert reading material into structured tasks, projects, and goals with one click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F36]/60 border border-[#233054] backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Knowledge Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive React Flow visual graph linking documents, notes, projects, and tasks dynamically.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
