import React from 'react';
import { Card, CardHeader, CardTitle } from '../common/Card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const AiInsightCard = ({ insights = [] }) => {
  const navigate = useNavigate();

  return (
    <Card className="col-span-full lg:col-span-4 bg-gradient-to-b from-[#161F36] to-[#12192D] border-primary-900/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
            AI Engine Insights
          </CardTitle>
        </div>
      </CardHeader>

      <div className="space-y-3 mt-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-3 rounded-lg bg-[#111726]/80 border border-[#233054] hover:border-slate-700 transition-colors"
          >
            <h5 className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              {insight.title}
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#233054]/80">
        <Button
          variant="accent"
          size="sm"
          className="w-full text-xs"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate('/ai')}
        >
          Open AI Command Center
        </Button>
      </div>
    </Card>
  );
};
