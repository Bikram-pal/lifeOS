import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../utils/formatters';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  onClick,
}) => {
  const colorStyles = {
    primary: 'text-primary-400 bg-primary-950/60 border-primary-800/40',
    violet: 'text-violet-400 bg-violet-950/60 border-violet-800/40',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    rose: 'text-rose-400 bg-rose-950/60 border-rose-800/40',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-sm',
              colorStyles[color] || colorStyles.primary
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-semibold',
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-slate-400">{trend.label || 'vs last week'}</span>
        </div>
      )}
    </Card>
  );
};
