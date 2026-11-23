import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Network } from 'lucide-react';

export const KnowledgeGraphPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Graph</h2>
        <p className="text-sm text-slate-400 mt-1">
          Interactive React Flow visualization linking documents, notes, projects, and tasks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <CardTitle>Interactive Graph Canvas</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          Knowledge Graph module connects nodes and visualizes cross-domain relationships.
        </p>
      </Card>
    </div>
  );
};
