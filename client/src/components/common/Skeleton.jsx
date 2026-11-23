import React from 'react';
import { cn } from '../../utils/formatters';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#233054]/50', className)}
      {...props}
    />
  );
};
