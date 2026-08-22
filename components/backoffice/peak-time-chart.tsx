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

interface PeakTimeChartProps {
  selectedDate: string;
}

export const PeakTimeChart: React.FC<PeakTimeChartProps> = ({ selectedDate }) => {
  const [chartData, setChartData] = useState<{ hour: string; tamu: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/peak-time?date=${selectedDate}`);
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
  }, [selectedDate]);

  const maxVal = Math.max(...chartData.map((d) => d.tamu), 1);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📈 Grafik Peak Time Kunjungan</span>
          </h3>
          <p className="text-xs text-slate-400">
            Distribusi jumlah kedatangan tamu per jam pada tanggal{" "}
            <span className="font-mono text-blue-400">{selectedDate}</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-400 gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat data analitik...</span>
        </div>
      ) : (
        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#f8fafc",
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
