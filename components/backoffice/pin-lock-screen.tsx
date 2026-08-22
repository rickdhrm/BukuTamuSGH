"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MasterPinModal } from "./master-pin-modal";

interface PinLockScreenProps {
  onSuccess: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const handleNumberClick = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  // Keyboard navigation support for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isResetModalOpen) return;
      if (e.key >= "0" && e.key <= "9") {
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      } else if (e.key === "Enter" && pin.length >= 4) {
        handleSubmitPin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, isResetModalOpen]);

  const handleSubmitPin = async () => {
    if (pin.length < 4) {
      setError("PIN minimal 4 digit");
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "PIN Access tidak valid");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Access PIN Salah");
      triggerShake();
      setPin("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm glass-card p-6 sm:p-8 space-y-6 text-center shadow-2xl transition-transform ${
          isShaking ? "animate-bounce" : ""
        }`}
      >
        {/* Header Icon & Title */}
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600/20 border border-blue-500/40 rounded-2xl flex items-center justify-center text-blue-400 text-2xl shadow-lg shadow-blue-500/10">
            🔒
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            SGH Backoffice
          </h1>
          <p className="text-xs text-slate-400">
            Masukkan Access PIN untuk mengakses Dashboard Resepsionis
          </p>
        </div>

        {resetSuccessMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs animate-fade-in">
            {resetSuccessMessage}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs animate-fade-in">
            {error}
          </div>
        )}

        {/* PIN Indicator Dots */}
        <div className="flex justify-center items-center gap-3 py-2">
          {Array.from({ length: Math.max(4, pin.length) }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                i < pin.length
                  ? "bg-blue-500 border-blue-400 shadow-md shadow-blue-500/40 scale-110"
                  : "bg-slate-900 border-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Keypad Grid (0-9) */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              className="w-full h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="w-full h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 text-slate-400 font-medium text-xs flex items-center justify-center transition-all active:scale-95"
          >
            HAPUS
          </button>
          <button
            type="button"
            onClick={() => handleNumberClick("0")}
            className="w-full h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="w-full h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-medium text-lg flex items-center justify-center transition-all active:scale-95"
          >
            ⌫
          </button>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitPin}
          isLoading={isSubmitting}
          disabled={pin.length < 4}
          size="lg"
          className="w-full mt-2"
        >
          Unlock Backoffice →
        </Button>

        {/* Footer Link — Forgot PIN */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
          >
            Lupa Access PIN? (Reset dengan Master PIN)
          </button>
        </div>

        {/* Dev Mode Helper Badge */}
        <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/80">
          <span>Default Test Access PIN: </span>
          <span className="font-mono text-slate-300">1234</span>
          <span> | Master PIN: </span>
          <span className="font-mono text-slate-300">master1234</span>
        </div>
      </div>

      <MasterPinModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => {
          setResetSuccessMessage("Access PIN berhasil diperbarui! Silakan masuk dengan PIN baru.");
          setPin("");
        }}
      />
    </div>
  );
};
