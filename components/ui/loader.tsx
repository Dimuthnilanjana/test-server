import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loader({ size = 'md', text, className }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div 
        className={cn(
          'rounded-full border-transparent border-t-primary animate-spin',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-muted-foreground animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );
}