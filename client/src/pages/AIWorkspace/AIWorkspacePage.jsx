import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { BotMessageSquare, Sparkles } from 'lucide-react';

export const AIWorkspacePage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">AI Command Center</h2>
        <p className="text-sm text-slate-400 mt-1">
          Chat with your documents via Groq RAG and execute contextual commands.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4 text-violet-400" />
            <CardTitle>Groq AI Chat & RAG Engine</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          AI Command Center module provides conversation history, streaming answers, and source citations.
        </p>
      </Card>
    </div>
  );
};
