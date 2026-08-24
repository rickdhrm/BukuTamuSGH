"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GuestTable, GuestRecord } from "./guest-table";
import { PeakTimeChart } from "./peak-time-chart";
import { useToast } from "@/components/ui/toast";

export const BackofficeDashboard: React.FC = () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchName, setSearchName] = useState<string>("");
  const [debouncedName, setDebouncedName] = useState<string>("");

  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const { toast } = useToast();

  // Debounce search name
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(searchName);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchName]);

  const fetchGuests = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedDate) queryParams.set("date", selectedDate);
      if (debouncedName) queryParams.set("name", debouncedName);

      const res = await fetch(`/api/guests?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGuests(data.guests || []);
        setIsMockMode(!!data.isMock);
      }
    } catch (err) {
      console.error("Error fetching guests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, debouncedName]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleUpdateGuest = async (
    id: string,
    updates: { nomorKartuAkses?: string; statusKtp?: string; isCheckout?: boolean }
  ) => {
    const targetGuest = guests.find((g) => g.id === id);
    const guestName = targetGuest ? targetGuest.namaLengkap : "Tamu";

    // Optimistic UI update
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            nomorKartuAkses:
              updates.nomorKartuAkses !== undefined
                ? updates.nomorKartuAkses
                : g.nomorKartuAkses,
            statusKtp:
              updates.statusKtp !== undefined ? updates.statusKtp : g.statusKtp,
            waktuKeluar: updates.isCheckout ? new Date().toISOString() : g.waktuKeluar,
          };
        }
        return g;
      })
    );

    if (updates.isCheckout) {
      toast(`Tamu ${guestName} berhasil Check-Out.`, "success");
    } else if (updates.nomorKartuAkses !== undefined) {
      toast(`No. Kartu Akses ${updates.nomorKartuAkses || "-"} tersimpan untuk ${guestName}.`, "info");
    } else if (updates.statusKtp !== undefined) {
      toast(`Status KTP ${guestName} diperbarui.`, "info");
    }

    try {
      await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      await fetch(`/api/guests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (err) {
      console.error("Error updating guest:", err);
      toast("Gagal memperbarui data tamu", "error");
      fetchGuests();
    }
  };

  const handleExport = (format: "xlsx" | "pdf") => {
    const queryParams = new URLSearchParams();
    queryParams.set("format", format);
    if (selectedDate) queryParams.set("date", selectedDate);
    if (debouncedName) queryParams.set("name", debouncedName);

    toast(`Mengunduh Laporan Tamu (${format.toUpperCase()})...`, "info");
    window.open(`/api/export?${queryParams.toString()}`, "_blank");
  };

  // KPI calculations
  const totalGuests = guests.length;
  const inBuildingCount = guests.filter((g) => !g.waktuKeluar).length;
  const checkedOutCount = guests.filter((g) => !!g.waktuKeluar).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Dasbor Manajemen Tamu
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Daftar kedatangan harian, kontrol verifikasi kartu &amp; KTP, serta analitik peak-time SGH Tower.
          </p>
        </div>

        {isMockMode && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span>⚡ Mode Demo (In-Memory Mock Active)</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Total Tamu (Filter)</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalGuests}</p>
          </div>
          <span className="text-3xl">👥</span>
        </div>

        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Di Dalam Gedung</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{inBuildingCount}</p>
          </div>
          <span className="text-3xl">🟢</span>
        </div>

        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-slate-400 dark:border-l-slate-600">
          <div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Sudah Check-Out</span>
            <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">{checkedOutCount}</p>
          </div>
          <span className="text-3xl">⬜</span>
        </div>
      </div>

      {/* Analytics Peak Time Chart */}
      <PeakTimeChart selectedDate={selectedDate} />

      {/* Filter Bar & Data Table */}
      <div className="space-y-4">
        {/* Controls / Filter Bar */}
        <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <Input
                placeholder="🔍 Cari nama tamu..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input text-xs py-2 px-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-xl transition-colors font-medium"
              />
            </div>

            {/* Reset Today Button */}
            {selectedDate !== todayStr && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(todayStr)}
              >
                📅 Hari Ini
              </Button>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("xlsx")}
              className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
            >
              📄 Ekspor Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 font-semibold"
            >
              📕 Ekspor PDF
            </Button>
          </div>
        </div>

        {/* Guest Data Table */}
        <GuestTable
          guests={guests}
          onUpdateGuest={handleUpdateGuest}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
