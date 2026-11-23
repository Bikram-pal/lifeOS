import React from 'react';
import { cn } from '../../utils/formatters';
import { Button } from './Button';

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-[#233054] bg-[#111726]/40',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#161F36] border border-[#233054] flex items-center justify-center text-indigo-400 mb-4 shadow-sm">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-slate-400 max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
