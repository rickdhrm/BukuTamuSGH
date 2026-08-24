import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockGuestsStore } from "@/app/api/guests/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const intervalStr = searchParams.get("interval") || "60"; // "30" or "60"
    const is30Min = intervalStr === "30";

    // Build time slots strictly from 06:00 to 18:00
    const timeSlots: string[] = [];
    const hourlyMap: Record<string, number> = {};

    for (let h = 6; h <= 18; h++) {
      const hourStr = String(h).padStart(2, "0");
      const slot60 = `${hourStr}:00`;
      
      if (is30Min) {
        const slot30_00 = `${hourStr}:00`;
        timeSlots.push(slot30_00);
        hourlyMap[slot30_00] = 0;

        if (h < 18) {
          const slot30_30 = `${hourStr}:30`;
          timeSlots.push(slot30_30);
          hourlyMap[slot30_30] = 0;
        }
      } else {
        timeSlots.push(slot60);
        hourlyMap[slot60] = 0;
      }
    }

    let guestRecords: any[] = [];

    try {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      guestRecords = await prisma.guest.findMany({
        where: {
          waktuMasuk: { gte: startOfDay, lte: endOfDay },
        },
      });
    } catch (dbErr) {
      // Fallback to mock store
      guestRecords = mockGuestsStore.filter(
        (g) => g.waktuMasuk && g.waktuMasuk.startsWith(dateStr)
      );
    }

    // Populate counts based on interval
    guestRecords.forEach((guest) => {
      const dateObj = new Date(guest.waktuMasuk);
      const hour = dateObj.getHours();
      const minutes = dateObj.getMinutes();

      if (hour >= 6 && hour <= 18) {
        let slotKey = "";
        const hourStr = String(hour).padStart(2, "0");

        if (is30Min) {
          const minStr = minutes >= 30 ? "30" : "00";
          slotKey = `${hourStr}:${minStr}`;
        } else {
          slotKey = `${hourStr}:00`;
        }

        if (hourlyMap[slotKey] !== undefined) {
          hourlyMap[slotKey] += 1;
        }
      }
    });

    const chartData = timeSlots.map((slot) => ({
      hour: slot,
      tamu: hourlyMap[slot] || 0,
    }));

    return NextResponse.json({ date: dateStr, interval: intervalStr, data: chartData });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengambil data analitik: " + error.message },
      { status: 500 }
    );
  }
}
