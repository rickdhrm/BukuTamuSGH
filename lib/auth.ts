import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

// Default fallback PIN hashes for initial setup
// Default Access PIN: "1234"
const DEFAULT_ACCESS_PIN_HASH = bcrypt.hashSync("1234", 10);
// Default Master PIN: "master1234"
const DEFAULT_MASTER_PIN_HASH = bcrypt.hashSync("master1234", 10);

let inMemoryAccessPinHash = DEFAULT_ACCESS_PIN_HASH;

/**
 * Get the current access PIN hash from PostgreSQL DB, creating default if empty.
 */
export async function getAccessPinHash(): Promise<string> {
  try {
    const config = await prisma.pinConfig.findFirst();
    if (config?.accessPinHash) {
      return config.accessPinHash;
    }

    // Seed default PIN 1234 in DB if table is empty
    try {
      const seeded = await prisma.pinConfig.create({
        data: { accessPinHash: DEFAULT_ACCESS_PIN_HASH },
      });
      return seeded.accessPinHash;
    } catch (seedErr) {
      return DEFAULT_ACCESS_PIN_HASH;
    }
  } catch (err) {
    // DB error / fallback
    return inMemoryAccessPinHash;
  }
}

/**
 * Get the Master PIN hash from environment variable or fallback default hash.
 */
export function getMasterPinHash(): string {
  return process.env.MASTER_PIN_HASH || DEFAULT_MASTER_PIN_HASH;
}

/**
 * Verify an entered Access PIN against stored hash in PostgreSQL DB.
 */
export async function verifyAccessPin(enteredPin: string): Promise<boolean> {
  const hash = await getAccessPinHash();
  return bcrypt.compare(enteredPin, hash);
}

/**
 * Verify an entered Master PIN against stored Master PIN hash.
 */
export async function verifyMasterPin(enteredMasterPin: string): Promise<boolean> {
  const masterHash = getMasterPinHash();
  return bcrypt.compare(enteredMasterPin, masterHash);
}

/**
 * Update the Access PIN in PostgreSQL DB and fallback memory store.
 */
export async function updateAccessPin(newPin: string): Promise<void> {
  const newHash = await bcrypt.hash(newPin, 10);
  inMemoryAccessPinHash = newHash;

  try {
    const existing = await prisma.pinConfig.findFirst();
    if (existing) {
      await prisma.pinConfig.update({
        where: { id: existing.id },
        data: { accessPinHash: newHash },
      });
    } else {
      await prisma.pinConfig.create({
        data: { accessPinHash: newHash },
      });
    }
  } catch (err) {
    console.error("DB PIN update error:", err);
  }
}

/**
 * Create a session cookie upon valid PIN entry.
 */
export async function createAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionSecret = process.env.SESSION_SECRET || "default_session_token_sgh_tower";
  const sessionToken = bcrypt.hashSync(sessionSecret + Date.now(), 8);

  const durationHours = parseInt(process.env.SESSION_DURATION_HOURS || "8", 10);
  const maxAge = durationHours * 3600;

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAge,
    path: "/",
  });
}

/**
 * Clear the authentication session cookie.
 */
export async function destroyAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if the incoming request has a valid active auth session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return !!sessionCookie?.value;
}
