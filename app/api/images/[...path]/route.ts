import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathArray = resolvedParams.path || [];
    const relativePath = filePathArray.join("/");

    // If request path is a base64 string or data URL
    if (relativePath.startsWith("data:") || relativePath.length > 500) {
      return NextResponse.redirect(relativePath);
    }

    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
      return NextResponse.json(
        { message: "Foto selfie tidak tersedia di lingkungan serverless Vercel." },
        { status: 404 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    const absolutePath = path.join(uploadsDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json(
        { message: "File foto selfie tidak ditemukan" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    if (ext === ".webp") contentType = "image/webp";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengambil foto: " + error.message },
      { status: 500 }
    );
  }
}
