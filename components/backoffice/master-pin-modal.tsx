import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MasterPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MasterPinModal: React.FC<MasterPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [masterPin, setMasterPin] = useState("");
  const [newAccessPin, setNewAccessPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!masterPin.trim()) {
      setError("Masukkan Master PIN");
      return;
    }
    if (!newAccessPin.trim() || newAccessPin.length < 4) {
      setError("Access PIN baru minimal 4 digit angka");
      return;
    }
    if (newAccessPin !== confirmPin) {
      setError("Konfirmasi PIN baru tidak cocok");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterPin, newAccessPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mereset Access PIN");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mereset PIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 space-y-4 border border-slate-700/80 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔑 Reset Access PIN</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gunakan Master PIN untuk mengatur ulang Access PIN Backoffice.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Master PIN"
            type="password"
            placeholder="Masukkan Master PIN"
            value={masterPin}
            onChange={(e) => setMasterPin(e.target.value)}
            required
          />

          <Input
            label="Access PIN Baru (Min. 4 digit)"
            type="password"
            maxLength={8}
            placeholder="Contoh: 5678"
            value={newAccessPin}
            onChange={(e) => setNewAccessPin(e.target.value)}
            required
          />

          <Input
            label="Konfirmasi Access PIN Baru"
            type="password"
            maxLength={8}
            placeholder="Ketik ulang PIN baru"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            required
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan PIN Baru
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
