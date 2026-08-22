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
      // DB Update
      const updatedGuest = await prisma.guest.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(updatedGuest);
    } catch (dbError) {
      // Mock store fallback update
      // We will also support updating mock records in GET/POST API route state
      return NextResponse.json({
        id,
        nomorKartuAkses: nomorKartuAkses ?? "CARD-MOCK",
        statusKtp: statusKtp ?? "KTP Ditahan",
        waktuKeluar: isCheckout ? new Date().toISOString() : null,
        message: "Updated in mock mode",
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui data tamu: " + error.message },
      { status: 500 }
    );
  }
}
