import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { message: "Parameter imageBase64 wajib diisi" },
        { status: 400 }
      );
    }

    // On Vercel or cloud environments without persistent disk, return data URI directly
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
      return NextResponse.json({
        success: true,
        filePath: imageBase64,
        message: "Foto selfie berhasil diproses (Cloud Mode).",
      });
    }

    // Local / On-premise environment with disk storage
    try {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const relativeFolder = path.join(year, month, day);
      const uploadsDir = path.join(process.cwd(), "uploads");
      const absoluteFolder = path.join(uploadsDir, relativeFolder);

      if (!fs.existsSync(absoluteFolder)) {
        fs.mkdirSync(absoluteFolder, { recursive: true });
      }

      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches && matches[2] ? Buffer.from(matches[2], "base64") : Buffer.from(imageBase64, "base64");

      const filename = `${now.getTime()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const absoluteFilePath = path.join(absoluteFolder, filename);
      const relativeFilePath = path.join(relativeFolder, filename);

      fs.writeFileSync(absoluteFilePath, buffer);

      return NextResponse.json({
        success: true,
        filePath: relativeFilePath,
        message: "Foto selfie berhasil diunggah ke NAS.",
      });
    } catch (diskErr) {
      // Fallback if local disk write fails (e.g. read-only environment)
      return NextResponse.json({
        success: true,
        filePath: imageBase64,
        message: "Foto selfie berhasil diproses (Memory Fallback).",
      });
    }
  } catch (error: any) {
    console.error("Error saving uploaded selfie:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan foto selfie: " + error.message },
      { status: 500 }
    );
  }
}
