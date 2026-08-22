import { NextResponse } from "next/server";
import { verifyAccessPin, createAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { message: "PIN wajib diisi" },
        { status: 400 }
      );
    }

    const isValid = await verifyAccessPin(pin);

    if (!isValid) {
      return NextResponse.json(
        { message: "Access PIN salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    // Set HTTP-only session cookie
    await createAuthSession();

    return NextResponse.json({
      success: true,
      message: "PIN valid. Akses Backoffice disetujui.",
    });
  } catch (error: any) {
    console.error("Error verifying PIN:", error);
    return NextResponse.json(
      { message: "Gagal memverifikasi PIN: " + error.message },
      { status: 500 }
    );
  }
}
