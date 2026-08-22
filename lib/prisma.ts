import { PrismaClient } from "@prisma/client";

// Safe wrapper for PrismaClient when DB isn't connected or configured
let prismaClientInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (prismaClientInstance) return prismaClientInstance;
  try {
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
