import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  id: string;
  text: string;
  variant: ToastVariant;
}

interface PolicyToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function PolicyToast({ toasts, onDismiss }: PolicyToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.variant === 'success';

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[260px] max-w-sm animate-slideUp"
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${isSuccess ? '#a5d6a7' : '#fecaca'}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#2e7d32' }} />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" style={{ color: '#d4183d' }} />
      )}
      <p className="text-sm flex-1" style={{ color: '#4a5568' }}>
        {toast.text}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded hover:bg-gray-100"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" style={{ color: '#717182' }} />
      </button>
    </div>
  );
}

export function usePolicyToast() {
  const showToast = (
    setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>,
    text: string,
    variant: ToastVariant = 'success'
  ) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, variant }]);
  };

  const dismissToast = (
    setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>,
    id: string
  ) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { showToast, dismissToast };
}
