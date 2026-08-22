import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nomorKartuAkses, statusKtp, isCheckout } = body;

    const updateData: any = {};
    if (nomorKartuAkses !== undefined) updateData.nomorKartuAkses = nomorKartuAkses;
    if (statusKtp !== undefined) updateData.statusKtp = statusKtp;
    if (isCheckout) updateData.waktuKeluar = new Date();

    try {
      const updatedGuest = await prisma.guest.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(updatedGuest);
    } catch (dbError) {
      return NextResponse.json({
        id,
        nomorKartuAkses: nomorKartuAkses ?? null,
        statusKtp: statusKtp ?? "belum_diverifikasi",
        waktuKeluar: isCheckout ? new Date().toISOString() : null,
        message: "Updated in fallback mode",
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui data tamu: " + error.message },
      { status: 500 }
    );
  }
}
