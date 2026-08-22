import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockGuestsStore } from "@/app/api/guests/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Prepare hourly distribution template (08:00 to 18:00)
    const hourlyMap: Record<string, number> = {
      "08:00": 0,
      "09:00": 0,
      "10:00": 0,
      "11:00": 0,
      "12:00": 0,
      "13:00": 0,
      "14:00": 0,
      "15:00": 0,
      "16:00": 0,
      "17:00": 0,
      "18:00": 0,
    };

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

    // Populate hourly counts
    guestRecords.forEach((guest) => {
      const dateObj = new Date(guest.waktuMasuk);
      const hour = dateObj.getHours();
      const formattedHour = `${String(hour).padStart(2, "0")}:00`;
      if (hourlyMap[formattedHour] !== undefined) {
        hourlyMap[formattedHour] += 1;
      }
    });

    const chartData = Object.entries(hourlyMap).map(([hour, count]) => ({
      hour,
      tamu: count,
    }));

    return NextResponse.json({ date: dateStr, data: chartData });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengambil data analitik: " + error.message },
      { status: 500 }
    );
  }
}
