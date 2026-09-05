import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

export const isDatabaseConfigured = Boolean(env.DATABASE_URL && env.DATABASE_URL.length > 0);

function getPrismaClient() {
  if (!isDatabaseConfigured) {
    return null;
  }

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }

  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }

  return global.prisma;
}

export const db = getPrismaClient();

export async function checkDatabaseHealth() {
  if (!isDatabaseConfigured || !db) {
    return {
      connected: false,
      message: "Database URL not configured (Phase 1 prepared)",
    };
  }

  try {
    await db.$queryRaw`SELECT 1`;
    return { connected: true, message: "Connected to PostgreSQL" };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}
