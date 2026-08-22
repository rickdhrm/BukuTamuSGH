import { PrismaClient } from "@/app/generated/prisma";

// Safe wrapper for PrismaClient in Prisma 7 when DB adapter isn't configured
let prismaClientInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (prismaClientInstance) return prismaClientInstance;
  try {
    // Attempt standard instantiation if adapter/driver configured
    prismaClientInstance = new PrismaClient();
    return prismaClientInstance;
  } catch (err) {
    return null;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      throw new Error("Prisma client not initialized (database not connected).");
    }
    return (client as any)[prop];
  },
});
