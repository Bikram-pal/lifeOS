import React from 'react';
import { cn } from '../../utils/formatters';

export const Card = ({ className, children, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[#161F36]/80 border border-[#233054] rounded-xl p-5 shadow-card backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:border-slate-600 hover:bg-[#1D2847]/90',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex items-center justify-between pb-3 mb-3 border-b border-[#233054]', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 className={cn('text-base font-semibold text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
};
