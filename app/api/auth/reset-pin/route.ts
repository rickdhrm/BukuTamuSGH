import { NextResponse } from "next/server";
import { verifyMasterPin, updateAccessPin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPin, newAccessPin } = body;

    if (!masterPin || !newAccessPin) {
      return NextResponse.json(
        { message: "Master PIN dan Access PIN baru wajib diisi" },
        { status: 400 }
      );
    }

    if (newAccessPin.length < 4) {
      return NextResponse.json(
        { message: "Access PIN baru minimal 4 digit" },
        { status: 400 }
      );
    }

    const isMasterValid = await verifyMasterPin(masterPin);

    if (!isMasterValid) {
      return NextResponse.json(
        { message: "Master PIN salah. Gagal mereset Access PIN." },
        { status: 401 }
      );
    }

    await updateAccessPin(newAccessPin);

    return NextResponse.json({
      success: true,
      message: "Access PIN berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Error resetting PIN:", error);
    return NextResponse.json(
      { message: "Gagal mereset PIN: " + error.message },
      { status: 500 }
    );
  }
}
