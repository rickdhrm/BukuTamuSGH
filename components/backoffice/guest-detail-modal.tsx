import React from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface GuestDetailModalData {
  id: string;
  namaLengkap: string;
  nomorTelepon: string;
  asalPerusahaan: string;
  alamatPerusahaan: string;
  tujuanBerkunjung: string;
  perusahaanTujuan: string;
  departemenTujuan: string;
  namaOrangDituju: string;
  keperluan: string;
  selfiePath: string | null;
  nomorKartuAkses: string | null;
  statusKtp: string | null;
  waktuMasuk: string;
  waktuKeluar: string | null;
}

interface GuestDetailModalProps {
  guest: GuestDetailModalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GuestDetailModal: React.FC<GuestDetailModalProps> = ({
  guest,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !guest) return null;

  const isInBuilding = !guest.waktuKeluar;
  const selfieUrl = guest.selfiePath
    ? guest.selfiePath.startsWith("data:")
      ? guest.selfiePath
      : `/api/images/${guest.selfiePath}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 border border-slate-200 dark:border-slate-700/80 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{guest.namaLengkap}</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  isInBuilding
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                }`}
              >
                {isInBuilding ? "🟢 Di Dalam Gedung" : "⬜ Sudah Check-Out"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {guest.asalPerusahaan} • Telp: {guest.nomorTelepon}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl p-1 leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selfie Photo */}
          <div className="md:col-span-1 flex flex-col items-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Foto Selfie
            </span>
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 flex items-center justify-center relative shadow-md">
              {selfieUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selfieUrl}
                  alt={`Selfie ${guest.namaLengkap}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="text-center p-4 text-slate-500 space-y-1">
                  <span className="text-3xl">📷</span>
                  <p className="text-[11px]">Foto tidak tersedia</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Info */}
          <div className="md:col-span-2 space-y-4 text-xs">
            {/* Group 1: Identity & Instansi */}
            <div className="glass-card-elevated p-3 space-y-2">
              <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px]">
                1. Data Diri &amp; Instansi
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Nama Lengkap</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guest.namaLengkap}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Nomor Telepon</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guest.nomorTelepon}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Asal Perusahaan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guest.asalPerusahaan}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Alamat Perusahaan</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{guest.alamatPerusahaan}</span>
                </div>
              </div>
            </div>

            {/* Group 2: Visit Details */}
            <div className="glass-card-elevated p-3 space-y-2">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px]">
                2. Detail Kunjungan
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Tujuan Berkunjung</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">{guest.tujuanBerkunjung}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Perusahaan Tujuan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guest.perusahaanTujuan}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Departemen Tujuan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guest.departemenTujuan}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Orang yang Dituju</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guest.namaOrangDituju}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200 dark:border-slate-700/60 pt-2 mt-1">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Keperluan</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap font-medium">{guest.keperluan}</p>
                </div>
              </div>
            </div>

            {/* Group 3: Security & Timestamps */}
            <div className="glass-card-elevated p-3 space-y-2">
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px]">
                3. Verifikasi &amp; Waktu
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Nomor Kartu Akses</span>
                  <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                    {guest.nomorKartuAkses || "Belum Diberikan"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Status KTP</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {guest.statusKtp || "Belum Diverifikasi"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Waktu Check-In</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatDateTime(guest.waktuMasuk)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Waktu Check-Out</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {guest.waktuKeluar ? formatDateTime(guest.waktuKeluar) : "Belum Check-Out"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
