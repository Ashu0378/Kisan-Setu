import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  children, 
  disabled,
  ...props 
}, ref) => {
  
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow active:scale-[0.98]',
    secondary: 'bg-white text-surface-800 border border-surface-200 hover:bg-surface-50 shadow-sm active:scale-[0.98]',
    outline: 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 active:scale-[0.98]',
    ghost: 'text-surface-600 hover:text-surface-900 hover:bg-surface-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow active:scale-[0.98]'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg rounded-xl',
    icon: 'h-10 w-10 p-2 justify-center'
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
