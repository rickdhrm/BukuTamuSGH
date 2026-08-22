import React from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

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
      <div className="mx-auto w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 text-3xl shadow-xl shadow-emerald-500/10">
        ✓
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Check-In Berhasil!</h2>
        <p className="text-slate-300 text-sm">
          Terima kasih <span className="font-semibold text-blue-400">{guestName}</span>, data pendaftaran kunjungan Anda telah tercatat secara otomatis.
        </p>
      </div>

      <div className="glass-card-elevated p-4 max-w-sm mx-auto space-y-2 text-left text-xs text-slate-300">
        <div className="flex justify-between border-b border-slate-700/60 pb-2">
          <span className="text-slate-400">Waktu Masuk (Check-In):</span>
          <span className="font-medium text-emerald-400">{formatDateTime(waktuMasuk)}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-slate-400">Status:</span>
          <span className="font-semibold text-emerald-400">Di Dalam Gedung</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 text-center space-y-1">
        <p className="font-medium">Langkah Selanjutnya:</p>
        <p className="text-slate-400">
          Silakan menuju meja resepsionis untuk mengambil kartu akses gedung dan menyerahkan KTP/ID untuk verifikasi.
        </p>
      </div>

      <div className="pt-2">
        <Button onClick={onReset} variant="outline" size="lg" className="w-full sm:w-auto">
          + Daftar Tamu Baru
        </Button>
      </div>
    </div>
  );
};
