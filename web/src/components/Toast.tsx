'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-900/95 to-emerald-800/95',
      border: 'border-emerald-500/50',
      icon: 'text-emerald-400',
      progress: 'bg-emerald-400',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-900/95 to-red-800/95',
      border: 'border-red-500/50',
      icon: 'text-red-400',
      progress: 'bg-red-400',
    },
    info: {
      bg: 'bg-gradient-to-r from-amber-900/95 to-amber-800/95',
      border: 'border-amber-500/50',
      icon: 'text-amber-400',
      progress: 'bg-amber-400',
    },
  }[type];

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`
        relative overflow-hidden
        flex items-center gap-3 px-4 py-3
        rounded-lg border backdrop-blur-sm
        shadow-xl shadow-black/20
        text-white
        transition-all duration-300 ease-out
        ${styles.bg} ${styles.border}
        ${isVisible && !isExiting
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-8 scale-95'
        }
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {icon}
      </div>

      {/* Message */}
      <span className="font-medium text-sm text-white/90 pr-2">{message}</span>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
      >
        <svg className="w-4 h-4 text-white/60 hover:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className={`h-full ${styles.progress} transition-all ease-linear`}
          style={{
            width: isVisible ? '0%' : '100%',
            transitionDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: ToastType) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
