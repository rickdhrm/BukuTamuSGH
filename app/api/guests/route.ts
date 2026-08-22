import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface GuestMockRecord {
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
  selfiePath: string;
  nomorKartuAkses: string | null;
  statusKtp: string | null;
  waktuMasuk: string;
  waktuKeluar: string | null;
  createdAt: string;
}

export const mockGuestsStore: GuestMockRecord[] = [
  {
    id: "mock-1",
    namaLengkap: "Budi Santoso",
    nomorTelepon: "081234567890",
    asalPerusahaan: "PT Teknologi Utama",
    alamatPerusahaan: "Jl. Sudirman No. 12, Jakarta",
    tujuanBerkunjung: "Rapat",
    perusahaanTujuan: "PT SGH Indonesia",
    departemenTujuan: "IT",
    namaOrangDituju: "Bapak Ahmad",
    keperluan: "Diskusi proyek integrasi sistem",
    selfiePath: "",
    nomorKartuAkses: "CARD-001",
    statusKtp: "ditahan",
    waktuMasuk: new Date(Date.now() - 3600000 * 2).toISOString(),
    waktuKeluar: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "mock-2",
    namaLengkap: "Siti Rahma",
    nomorTelepon: "085678901234",
    asalPerusahaan: "CV Logistics Jaya",
    alamatPerusahaan: "Jl. Gatot Subroto No. 45, Jakarta",
    tujuanBerkunjung: "Kirim Barang",
    perusahaanTujuan: "PT Media Nusantara",
    departemenTujuan: "General Affairs",
    namaOrangDituju: "Ibu Rina",
    keperluan: "Pengiriman berkas dokumen kontrak",
    selfiePath: "",
    nomorKartuAkses: "CARD-002",
    statusKtp: "diverifikasi",
    waktuMasuk: new Date(Date.now() - 3600000 * 4).toISOString(),
    waktuKeluar: new Date(Date.now() - 3600000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";
    const dateStr = searchParams.get("date");

    try {
      const whereClause: any = {};
      if (name) {
        whereClause.namaLengkap = { contains: name, mode: "insensitive" };
      }
      if (dateStr) {
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
        whereClause.waktuMasuk = { gte: startOfDay, lte: endOfDay };
      }

      const guests = await prisma.guest.findMany({
        where: whereClause,
        orderBy: { waktuMasuk: "desc" },
      });

      return NextResponse.json({ guests, total: guests.length, isMock: false });
    } catch (dbError) {
      let filtered = [...mockGuestsStore];

      if (name) {
        filtered = filtered.filter((g) =>
          g.namaLengkap.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (dateStr) {
        filtered = filtered.filter((g) => g.waktuMasuk.startsWith(dateStr));
      }

      return NextResponse.json({
        guests: filtered,
        total: filtered.length,
        isMock: true,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengambil data tamu: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      namaLengkap,
      nomorTelepon,
      asalPerusahaan,
      alamatPerusahaan,
      tujuanBerkunjung,
      perusahaanTujuan,
      departemenTujuan,
      namaOrangDituju,
      keperluan,
      selfiePath,
    } = body;

    const waktuMasuk = new Date();

    try {
      const newGuest = await prisma.guest.create({
        data: {
          namaLengkap,
          nomorTelepon,
          asalPerusahaan,
          alamatPerusahaan,
          tujuanBerkunjung,
          perusahaanTujuan,
          departemenTujuan,
          namaOrangDituju,
          keperluan,
          selfiePath: selfiePath || null,
          waktuMasuk,
        },
      });
      return NextResponse.json(newGuest, { status: 201 });
    } catch (dbError) {
      console.error("DB Create Error:", dbError);
      const mockRecord: GuestMockRecord = {
        id: `mock-${Date.now()}`,
        namaLengkap,
        nomorTelepon,
        asalPerusahaan,
        alamatPerusahaan,
        tujuanBerkunjung,
        perusahaanTujuan,
        departemenTujuan,
        namaOrangDituju,
        keperluan,
        selfiePath: selfiePath || "",
        nomorKartuAkses: null,
        statusKtp: "belum_diverifikasi",
        waktuMasuk: waktuMasuk.toISOString(),
        waktuKeluar: null,
        createdAt: waktuMasuk.toISOString(),
      };
      mockGuestsStore.unshift(mockRecord);

      return NextResponse.json(mockRecord, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menyimpan data tamu: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, nomorKartuAkses, statusKtp, isCheckout } = body;

    const updateData: any = {};
    if (nomorKartuAkses !== undefined) updateData.nomorKartuAkses = nomorKartuAkses;
    if (statusKtp !== undefined) updateData.statusKtp = statusKtp;
    if (isCheckout) updateData.waktuKeluar = new Date();

    try {
      if (!id.startsWith("mock-")) {
        const updated = await prisma.guest.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json(updated);
      }
    } catch (dbErr) {
      // Fallback
    }

    const idx = mockGuestsStore.findIndex((g) => g.id === id);
    if (idx !== -1) {
      if (nomorKartuAkses !== undefined) mockGuestsStore[idx].nomorKartuAkses = nomorKartuAkses;
      if (statusKtp !== undefined) mockGuestsStore[idx].statusKtp = statusKtp;
      if (isCheckout) mockGuestsStore[idx].waktuKeluar = new Date().toISOString();
      return NextResponse.json(mockGuestsStore[idx]);
    }

    return NextResponse.json({ message: "Guest updated" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
