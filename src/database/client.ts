import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/config/env";

declare global {
  var prisma: PrismaClient | undefined;
}

// In Phase 1, Prisma is prepared architecturally.
// The client will only initialize if DATABASE_URL is configured.
export const isDatabaseConfigured = Boolean(env.DATABASE_URL && env.DATABASE_URL.length > 0);

function getPrismaClient(): PrismaClient | null {
  if (!isDatabaseConfigured || !env.DATABASE_URL) {
    return null;
  }

  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({ adapter });
  }

  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  }

  return global.prisma;
}

export const db = getPrismaClient();

export async function checkDatabaseHealth(): Promise<{ connected: boolean; message: string }> {
  if (!isDatabaseConfigured || !db) {
    return {
      connected: false,
      message: "Database URL not configured (Phase 1 prepared)",
    };
  }

  try {
    // Perform light heartbeat query
    await db.$queryRaw`SELECT 1`;
    return { connected: true, message: "Connected to PostgreSQL" };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}
