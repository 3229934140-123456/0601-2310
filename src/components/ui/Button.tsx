import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  danger: 'btn-danger',
  success: 'btn-success',
  ghost: 'btn-ghost',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: '!px-3 !py-1.5 !text-xs',
  md: '',
  lg: '!px-7 !py-3.5 !text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
