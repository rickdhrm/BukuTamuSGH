import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { crypto } from "next/dist/compiled/@edge-runtime/primitives";

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

    // Extract base64 payload
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(imageBase64, "base64");
    }

    // Create date-based directory structure (YYYY/MM/DD)
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const nasBasePath = process.env.NAS_MOUNT_PATH || "./uploads";
    const relativeFolder = path.join(year, month, day);
    const absoluteFolder = path.resolve(nasBasePath, relativeFolder);

    // Ensure directory exists
    if (!fs.existsSync(absoluteFolder)) {
      fs.mkdirSync(absoluteFolder, { recursive: true });
    }

    // Generate unique filename
    const filename = `${now.getTime()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
    const absoluteFilePath = path.join(absoluteFolder, filename);
    const relativeFilePath = path.join(relativeFolder, filename);

    // Write file to disk
    fs.writeFileSync(absoluteFilePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: relativeFilePath,
      message: "Foto selfie berhasil diunggah ke NAS.",
    });
  } catch (error: any) {
    console.error("Error saving uploaded selfie:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan foto selfie: " + error.message },
      { status: 500 }
    );
  }
}
