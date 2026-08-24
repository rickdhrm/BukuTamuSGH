"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PinLockScreen } from "./pin-lock-screen";
import { useTheme } from "@/components/theme-provider";

interface BackofficeAuthGuardProps {
  children: React.ReactNode;
}

// 5 minutes inactivity timeout in milliseconds (5 * 60 * 1000)
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export const BackofficeAuthGuard: React.FC<BackofficeAuthGuardProps> = ({
  children,
}) => {
  // Always start locked on fresh page load or browser refresh
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleLock = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsUnlocked(false);
    }
  }, []);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      handleLock();
    }, INACTIVITY_TIMEOUT_MS);
  }, [handleLock]);

  // Setup activity listeners when unlocked
  useEffect(() => {
    if (!isUnlocked) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Start 5-minute inactivity timer
    resetInactivityTimer();

    // User interaction events to reset timer
    const activityEvents = [
      "mousemove",
      "keydown",
      "touchstart",
      "click",
      "scroll",
    ];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isUnlocked, resetInactivityTimer]);

  // If locked, show PIN Lock Screen
  if (!isUnlocked) {
    return <PinLockScreen onSuccess={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header Navigation Bar */}
      <header className="bg-white/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 py-3 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
              🏢
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                SGH Tower Backoffice
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dashboard Resepsionis &amp; Keamanan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Active Badge */}
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Sesi Aktif (Auto-Lock 5m)</span>
            </span>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-medium"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              <span>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</span>
            </button>

            {/* Lock Button */}
            <button
              onClick={handleLock}
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-medium"
              title="Kunci Sesi Backoffice"
            >
              <span>🔒 Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Backoffice Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};
