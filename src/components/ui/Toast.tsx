import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { ToastType } from '@/store/useUIGlobalStore';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const typeStyles: Record<ToastType, { border: string; bg: string; text: string; Icon: typeof Info }> = {
  info: {
    border: 'border-energy-cyan/50',
    bg: 'bg-energy-cyan/10',
    text: 'text-energy-cyan',
    Icon: Info,
  },
  success: {
    border: 'border-life-green/50',
    bg: 'bg-life-green/10',
    text: 'text-life-green',
    Icon: CheckCircle,
  },
  warning: {
    border: 'border-danger-yellow/50',
    bg: 'bg-danger-yellow/10',
    text: 'text-danger-yellow',
    Icon: AlertTriangle,
  },
  error: {
    border: 'border-danger-red/50',
    bg: 'bg-danger-red/10',
    text: 'text-danger-red',
    Icon: XCircle,
  },
};

export function Toast({ id, message, type, onClose }: ToastProps) {
  const { border, bg, text, Icon } = typeStyles[type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 min-w-[280px] max-w-md px-4 py-3 rounded-lg border backdrop-blur-md animate-slide-up shadow-card',
        border,
        bg
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0', text)} />
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded text-ship-silver hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;
