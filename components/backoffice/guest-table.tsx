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
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
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
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="space-y-1">
                    <span className="text-2xl">📋</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-400">Tidak ada data tamu</p>
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
                    className={`transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/50 ${
                      isInBuilding
                        ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-l-4 border-l-emerald-500"
                        : "bg-slate-50/40 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 opacity-90 border-l-4 border-l-slate-400 dark:border-l-slate-700"
                    }`}
                  >
                    {/* Status Indicator */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isInBuilding
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isInBuilding ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-slate-400 dark:bg-slate-500"
                          }`}
                        />
                        <span>{isInBuilding ? "Di Dalam" : "Check-Out"}</span>
                      </span>
                    </td>

                    {/* Guest Name & Contact */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedGuest(guest)}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-left"
                      >
                        {guest.namaLengkap}
                      </button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{guest.nomorTelepon}</p>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{guest.asalPerusahaan}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        {guest.alamatPerusahaan}
                      </p>
                    </td>

                    {/* Purpose & Target Person */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {guest.tujuanBerkunjung}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Bertemu: <strong className="text-slate-900 dark:text-white">{guest.namaOrangDituju}</strong> ({guest.perusahaanTujuan})
                      </p>
                    </td>

                    {/* Timestamps */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        In: {formatTime(guest.waktuMasuk)}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Out: {guest.waktuKeluar ? formatTime(guest.waktuKeluar) : "-"}
                      </div>
                    </td>

                    {/* Access Card Number Input */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="No. Kartu"
                        value={
                          editingCardId === guest.id
                            ? tempCardVal
                            : guest.nomorKartuAkses || ""
                        }
                        onFocus={() => {
                          setEditingCardId(guest.id);
                          setTempCardVal(guest.nomorKartuAkses || "");
                        }}
                        onChange={(e) => setTempCardVal(e.target.value)}
                        onBlur={() => handleCardBlur(guest.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCardBlur(guest.id);
                        }}
                        className="w-24 px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </td>

                    {/* KTP Status Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={guest.statusKtp || "belum_diverifikasi"}
                        onChange={(e) =>
                          onUpdateGuest(guest.id, { statusKtp: e.target.value })
                        }
                        className="px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                      >
                        {KTP_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedGuest(guest)}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-semibold transition-all"
                        title="Lihat Detail"
                      >
                        Detail
                      </button>

                      {isInBuilding && (
                        <button
                          onClick={() =>
                            onUpdateGuest(guest.id, { isCheckout: true })
                          }
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE CARD VIEW (Stack view for screens < 768px) */}
      <div className="block md:hidden p-4 space-y-3">
        {guests.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <span className="text-2xl block mb-1">📋</span>
            <p className="font-semibold text-slate-700 dark:text-slate-400 text-xs">Tidak ada data tamu</p>
            <p className="text-[10px]">Belum ada tamu terdaftar untuk filter ini.</p>
          </div>
        ) : (
          guests.map((guest) => {
            const isInBuilding = !guest.waktuKeluar;

            return (
              <div
                key={guest.id}
                className={`p-4 rounded-xl border space-y-3 transition-colors ${
                  isInBuilding
                    ? "bg-white dark:bg-slate-900/90 border-emerald-300 dark:border-emerald-500/40 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-90"
                }`}
              >
                {/* Top Row: Name & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setSelectedGuest(guest)}
                      className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline text-left block"
                    >
                      {guest.namaLengkap}
                    </button>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {guest.asalPerusahaan}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isInBuilding
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span>{isInBuilding ? "🟢 Di Dalam" : "⬜ Out"}</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-200 dark:border-slate-800 py-2">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Tujuan</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {guest.tujuanBerkunjung}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Orang Dituju</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {guest.namaOrangDituju}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Check-In</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      {formatTime(guest.waktuMasuk)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Check-Out</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {guest.waktuKeluar ? formatTime(guest.waktuKeluar) : "-"}
                    </span>
                  </div>
                </div>

                {/* Inputs & Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="No. Kartu"
                      value={
                        editingCardId === guest.id
                          ? tempCardVal
                          : guest.nomorKartuAkses || ""
                      }
                      onFocus={() => {
                        setEditingCardId(guest.id);
                        setTempCardVal(guest.nomorKartuAkses || "");
                      }}
                      onChange={(e) => setTempCardVal(e.target.value)}
                      onBlur={() => handleCardBlur(guest.id)}
                      className="w-24 px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />

                    <select
                      value={guest.statusKtp || "belum_diverifikasi"}
                      onChange={(e) =>
                        onUpdateGuest(guest.id, { statusKtp: e.target.value })
                      }
                      className="px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                    >
                      {KTP_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedGuest(guest)}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-semibold"
                    >
                      Detail
                    </button>

                    {isInBuilding && (
                      <button
                        onClick={() =>
                          onUpdateGuest(guest.id, { isCheckout: true })
                        }
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Guest Detail Popup Modal */}
      <GuestDetailModal
        guest={selectedGuest}
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
};
