"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PinLockScreen } from "./pin-lock-screen";

interface BackofficeAuthGuardProps {
  children: React.ReactNode;
}

// 5 minutes inactivity timeout in milliseconds (5 * 60 * 1000)
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export const BackofficeAuthGuard: React.FC<BackofficeAuthGuardProps> = ({
  children,
}) => {
  // Always start locked on fresh page load or browser refresh (Condition 1)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLock = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsUnlocked(false);
    }
  }, []);

  // Reset inactivity timer on user interaction (Condition 2)
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

  // If locked (initial page load/refresh OR 5-min inactivity), show PIN Lock Screen
  if (!isUnlocked) {
    return <PinLockScreen onSuccess={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header Navigation Bar with Lock Button */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
              🏢
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">
                SGH Tower Backoffice
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Dashboard Resepsionis &amp; Keamanan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Sesi Aktif (Auto-Lock 5 Menit)</span>
            </span>
            <button
              onClick={handleLock}
              className="text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
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
