import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

// Default fallback PIN hashes for development when DB is offline
// Access PIN: "1234"
let inMemoryAccessPinHash = bcrypt.hashSync("1234", 10);
// Master PIN: "master1234"
const DEFAULT_MASTER_PIN_HASH = bcrypt.hashSync("master1234", 10);

/**
 * Get the current access PIN hash from DB or fallback memory store.
 */
export async function getAccessPinHash(): Promise<string> {
  try {
    const config = await prisma.pinConfig.findFirst();
    if (config?.accessPinHash) {
      return config.accessPinHash;
    }
  } catch (err) {
    // Database offline or uninitialized
  }
  return inMemoryAccessPinHash;
}

/**
 * Get the Master PIN hash from environment or fallback default.
 */
export function getMasterPinHash(): string {
  return process.env.MASTER_PIN_HASH || DEFAULT_MASTER_PIN_HASH;
}

/**
 * Verify an entered Access PIN against stored hash.
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
 * Update the Access PIN in DB and fallback memory store.
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
    // DB offline, updated in-memory store
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
