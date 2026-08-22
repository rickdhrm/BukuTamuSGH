import { NextResponse } from "next/server";
import { destroyAuthSession } from "@/lib/auth";

export async function POST() {
  try {
    await destroyAuthSession();
    return NextResponse.json({ success: true, message: "Sesi berhasil ditutup." });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menutup sesi: " + error.message },
      { status: 500 }
    );
  }
}
