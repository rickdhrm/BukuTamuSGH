"use client";

import React, { useState } from "react";
import { formatTime } from "@/lib/utils";
import { KTP_STATUS_OPTIONS } from "@/lib/constants";
import { GuestDetailModal, GuestDetailModalData } from "./guest-detail-modal";
import { TableSkeleton } from "@/components/ui/skeleton";

export interface GuestRecord extends GuestDetailModalData {}

interface GuestTableProps {
  guests: GuestRecord[];
  onUpdateGuest: (
    id: string,
    updates: { nomorKartuAkses?: string; statusKtp?: string; isCheckout?: boolean }
  ) => void;
  isLoading: boolean;
}

export const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  onUpdateGuest,
  isLoading,
}) => {
  const [selectedGuest, setSelectedGuest] = useState<GuestRecord | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [tempCardVal, setTempCardVal] = useState("");

  const handleCardBlur = (id: string) => {
    if (editingCardId === id) {
      onUpdateGuest(id, { nomorKartuAkses: tempCardVal });
      setEditingCardId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card overflow-hidden">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* 1. DESKTOP VIEW (Table for md: screens and wider) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Nama &amp; Kontak</th>
              <th className="px-4 py-3">Perusahaan / Instansi</th>
              <th className="px-4 py-3">Tujuan &amp; Orang Dituju</th>
              <th className="px-4 py-3">Waktu Check-In / Out</th>
              <th className="px-4 py-3">No. Kartu Akses</th>
              <th className="px-4 py-3">Status KTP</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="space-y-1">
                    <span className="text-2xl">📋</span>
                    <p className="font-medium text-slate-400">Tidak ada data tamu</p>
                    <p className="text-[11px]">
                      Halaman kosong harian (blank page). Belum ada tamu terdaftar untuk parameter filter ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              guests.map((guest) => {
                const isInBuilding = !guest.waktuKeluar;

                return (
                  <tr
                    key={guest.id}
                    className={`transition-colors hover:bg-slate-800/50 ${
                      isInBuilding
                        ? "bg-emerald-950/10 border-l-4 border-l-emerald-500"
                        : "bg-slate-950/40 text-slate-400 opacity-80 border-l-4 border-l-slate-700"
                    }`}
                  >
                    {/* Status Indicator */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isInBuilding
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isInBuilding ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                          }`}
                        />
                        {isInBuilding ? "Di Gedung" : "Checked-Out"}
                      </span>
                    </td>

                    {/* Name & Phone (Clickable to open Detail Modal) */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedGuest(guest)}
                        className="text-left font-semibold text-white hover:text-blue-400 hover:underline block"
                      >
                        {guest.namaLengkap}
                      </button>
                      <span className="text-[10px] text-slate-400 block">{guest.nomorTelepon}</span>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-200 block">{guest.asalPerusahaan}</span>
                    </td>

                    {/* Purpose & Target Person */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-200 block">{guest.perusahaanTujuan}</span>
                      <span className="text-[10px] text-slate-400 block">
                        u/p {guest.namaOrangDituju} ({guest.tujuanBerkunjung})
                      </span>
                    </td>

                    {/* Timestamps */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-[11px]">
                        <span className="text-emerald-400 font-mono">In: {formatTime(guest.waktuMasuk)}</span>
                        {guest.waktuKeluar && (
                          <span className="text-slate-400 font-mono block">Out: {formatTime(guest.waktuKeluar)}</span>
                        )}
                      </div>
                    </td>

                    {/* Access Card Input (Editable) */}
                    <td className="px-4 py-3">
                      {editingCardId === guest.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={tempCardVal}
                          onChange={(e) => setTempCardVal(e.target.value)}
                          onBlur={() => handleCardBlur(guest.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCardBlur(guest.id);
                          }}
                          className="w-24 px-2 py-1 bg-slate-900 border border-blue-500 rounded text-xs text-amber-300 font-mono focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCardId(guest.id);
                            setTempCardVal(guest.nomorKartuAkses || "");
                          }}
                          className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-700 hover:border-blue-500/50 text-amber-300 font-mono text-xs font-medium"
                          title="Klik untuk mengubah No. Kartu Akses"
                        >
                          {guest.nomorKartuAkses || "+ Input Kartu"}
                        </button>
                      )}
                    </td>

                    {/* KTP Status Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={guest.statusKtp || "belum_diverifikasi"}
                        onChange={(e) =>
                          onUpdateGuest(guest.id, { statusKtp: e.target.value })
                        }
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                      >
                        {KTP_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions — One-Click Check-Out */}
                    <td className="px-4 py-3 text-right">
                      {isInBuilding ? (
                        <button
                          onClick={() => onUpdateGuest(guest.id, { isCheckout: true })}
                          className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg font-medium text-xs transition-all shadow-sm active:scale-95"
                        >
                          Check-Out
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE CARD VIEW (For phone screens < 768px) */}
      <div className="block md:hidden p-4 space-y-3">
        {guests.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-1">
            <span className="text-2xl">📋</span>
            <p className="font-medium text-slate-400">Tidak ada data tamu</p>
          </div>
        ) : (
          guests.map((guest) => {
            const isInBuilding = !guest.waktuKeluar;

            return (
              <div
                key={guest.id}
                className={`p-4 rounded-xl border space-y-3 ${
                  isInBuilding
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-slate-900/60 border-slate-800 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setSelectedGuest(guest)}
                      className="font-bold text-white text-sm hover:text-blue-400 hover:underline text-left"
                    >
                      {guest.namaLengkap}
                    </button>
                    <p className="text-xs text-slate-400">{guest.asalPerusahaan}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      isInBuilding
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {isInBuilding ? "🟢 Di Gedung" : "⬜ Checked-Out"}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500">Tujuan: </span>
                    <span>{guest.perusahaanTujuan} ({guest.namaOrangDituju})</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Check-In: </span>
                    <span className="text-emerald-400 font-mono">{formatTime(guest.waktuMasuk)}</span>
                    {guest.waktuKeluar && (
                      <span className="text-slate-400 font-mono"> • Out: {formatTime(guest.waktuKeluar)}</span>
                    )}
                  </div>
                </div>

                {/* Mobile Controls Grid */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {/* Access Card */}
                    <button
                      onClick={() => {
                        const val = prompt("Masukkan No. Kartu Akses:", guest.nomorKartuAkses || "");
                        if (val !== null) {
                          onUpdateGuest(guest.id, { nomorKartuAkses: val });
                        }
                      }}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs"
                    >
                      {guest.nomorKartuAkses || "+ Kartu"}
                    </button>

                    {/* KTP Dropdown */}
                    <select
                      value={guest.statusKtp || "belum_diverifikasi"}
                      onChange={(e) => onUpdateGuest(guest.id, { statusKtp: e.target.value })}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
                    >
                      {KTP_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isInBuilding && (
                    <button
                      onClick={() => onUpdateGuest(guest.id, { isCheckout: true })}
                      className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-semibold"
                    >
                      Check-Out
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <GuestDetailModal
        guest={selectedGuest}
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
};
