import React from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConfirmationScreenProps {
  guestName: string;
  waktuMasuk: string;
  onReset: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  guestName,
  waktuMasuk,
  onReset,
}) => {
  return (
    <div className="text-center py-6 space-y-6 animate-scale-in">
      {/* Success Badge */}
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-3xl shadow-xl shadow-emerald-500/10">
        ✓
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pendaftaran Berhasil!
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
          Selamat datang di gedung <span className="font-bold text-blue-600 dark:text-blue-400">SGH Tower</span>,{" "}
          <strong className="text-slate-900 dark:text-white font-extrabold">{guestName}</strong>.
        </p>
      </div>

      {/* Check-In Details Card */}
      <div className="glass-card-elevated max-w-sm mx-auto p-4 space-y-2 text-xs text-left">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/80 pb-2">
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Waktu Check-In Auto:</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            {formatDateTime(waktuMasuk)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Status Kunjungan:</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-bold text-[10px]">
            🟢 Terdaftar di Sistem
          </span>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 rounded-2xl max-w-sm mx-auto text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <p className="font-extrabold">📋 Petunjuk Resepsionis:</p>
        <p className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
          Silakan tunjukkan nama Anda ke petugas Resepsionis untuk menukarkan kartu akses gedung dan verifikasi KTP.
        </p>
      </div>

      <div className="pt-2">
        <Button onClick={onReset} size="lg" className="w-full max-w-xs font-bold">
          ✨ Daftar Tamu Baru
        </Button>
      </div>
    </div>
  );
};
