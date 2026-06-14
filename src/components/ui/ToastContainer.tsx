import { useUIGlobalStore } from '@/store/useUIGlobalStore';
import { Toast } from './Toast';

interface ToastContainerProps {
  toasts?: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
}

export function ToastContainer({ toasts: externalToasts }: ToastContainerProps) {
  const storeToasts = useUIGlobalStore((s) => s.toastMessages);
  const removeToast = useUIGlobalStore((s) => s.removeToast);

  const toasts = externalToasts ?? storeToasts;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
