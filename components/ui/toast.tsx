"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((t) => {
          const bgColors = {
            success: "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/20",
            error: "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/20",
            info: "bg-blue-950/90 border-blue-500/40 text-blue-200 shadow-blue-900/20",
            warning: "bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-900/20",
          };

          const icons = {
            success: "✓",
            error: "✕",
            info: "ℹ",
            warning: "⚠",
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md text-xs font-medium shadow-lg animate-slide-in-right ${bgColors[t.type]}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-sm">{icons[t.type]}</span>
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white text-sm ml-3"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
