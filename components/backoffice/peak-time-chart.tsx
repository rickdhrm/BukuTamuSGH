"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "@/components/theme-provider";

interface PeakTimeChartProps {
  selectedDate: string;
}

export const PeakTimeChart: React.FC<PeakTimeChartProps> = ({ selectedDate }) => {
  const [chartData, setChartData] = useState<{ hour: string; tamu: number }[]>([]);
  const [interval, setInterval] = useState<"60" | "30">("60");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/analytics/peak-time?date=${selectedDate}&interval=${interval}`
        );
        if (res.ok) {
          const json = await res.json();
          setChartData(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedDate, interval]);

  const maxVal = Math.max(...chartData.map((d) => d.tamu), 1);
  const is30Min = interval === "30";
  const isDark = theme === "dark";

  // Theme adaptive colors
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const textColor = isDark ? "#cbd5e1" : "#334155";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#cbd5e1";
  const tooltipText = isDark ? "#ffffff" : "#0f172a";

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📈 Grafik Peak Time Kunjungan</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-200 font-semibold mt-0.5">
            Distribusi kedatangan tamu (06:00 – 18:00) pada tanggal{" "}
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{selectedDate}</span>
          </p>
        </div>

        {/* Interval Dropdown Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="interval-select" className="text-xs text-slate-700 dark:text-slate-200 font-bold whitespace-nowrap">
            Interval:
          </label>
          <select
            id="interval-select"
            value={interval}
            onChange={(e) => setInterval(e.target.value as "60" | "30")}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-all font-bold cursor-pointer"
          >
            <option value="60">60 Menit (Per Jam)</option>
            <option value="30">30 Menit</option>
          </select>
        </div>
      </div>

      {/* Chart Body Container with Explicit Min-Height */}
      {isLoading || !isMounted ? (
        <div className="h-64 min-h-[250px] w-full flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 font-semibold gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat data analitik...</span>
        </div>
      ) : (
        <div className="h-64 min-h-[250px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: is30Min ? 25 : 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="hour"
                stroke={textColor}
                fontSize={is30Min ? 9 : 11}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={is30Min ? -45 : 0}
                textAnchor={is30Min ? "end" : "middle"}
                height={is30Min ? 45 : 30}
              />
              <YAxis
                stroke={textColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: tooltipText,
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                formatter={(value: any) => [`${value ?? 0} Tamu`, "Jumlah Kedatangan"]}
                labelFormatter={(label: any) => `Jam ${label}`}
              />
              <Bar dataKey="tamu" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.tamu === maxVal && entry.tamu > 0
                        ? "#3b82f6" // Primary blue for peak
                        : "#6366f1"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
