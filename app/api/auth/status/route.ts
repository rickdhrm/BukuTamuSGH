import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    return NextResponse.json({ authenticated });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false });
  }
}
