"use client";

import React, { useState, useEffect } from "react";
import { PinLockScreen } from "./pin-lock-screen";

interface BackofficeAuthGuardProps {
  children: React.ReactNode;
}

export const BackofficeAuthGuard: React.FC<BackofficeAuthGuardProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsAuthenticated(!!data.authenticated);
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    // Initial loading state
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Memeriksa Sesi Backoffice...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PinLockScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header Navigation Bar with Logout */}
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
              <span className="hidden sm:inline">Sesi Aktif</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              title="Kunci / Keluar Sesi"
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
