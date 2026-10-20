'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'ai' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (
    title: string,
    description?: string,
    type?: ToastType,
    durationMs?: number
  ) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      title: string,
      description?: string,
      type: ToastType = 'success',
      durationMs: number = 3500
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, title, description, type };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none select-none"
        dir="rtl"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-2xl border text-xs font-sans transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/40'
                : toast.type === 'ai'
                ? 'bg-slate-900/95 border-purple-500/40 text-purple-100 shadow-purple-950/40'
                : toast.type === 'loading'
                ? 'bg-slate-900/95 border-indigo-500/50 text-indigo-100 shadow-indigo-950/50'
                : 'bg-slate-900/95 border-sky-500/40 text-sky-100 shadow-sky-950/40'
            }`}
          >
            <div className="shrink-0">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              {toast.type === 'ai' && (
                <Sparkles className="w-4 h-4 text-purple-400" />
              )}
              {toast.type === 'loading' && (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              )}
              {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            </div>

            <div>
              <div className="font-semibold text-slate-100">{toast.title}</div>
              {toast.description && (
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {toast.description}
                </div>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition mr-1"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
