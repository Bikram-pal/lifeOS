import React from 'react';
import { cn } from '../../utils/formatters';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-primary focus:ring-primary-500 active:scale-[0.98]',
      secondary:
        'bg-background-card hover:bg-background-hover text-slate-200 border border-background-border focus:ring-slate-500 active:scale-[0.98]',
      accent:
        'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-glow-accent focus:ring-violet-500 active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-background-subtle text-slate-300 hover:text-white focus:ring-slate-500',
      danger:
        'bg-rose-600/90 hover:bg-rose-600 text-white focus:ring-rose-500 active:scale-[0.98]',
      outline:
        'border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white bg-transparent',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
