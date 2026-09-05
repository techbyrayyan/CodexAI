import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0
)

function getPrismaClient() {
  if (!isDatabaseConfigured) {
    return null
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({ adapter })
  }

  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
      log: ["error", "warn"],
    })
  }

  return global.prisma
}

export const db = getPrismaClient()

export async function checkDatabaseHealth() {
  if (!isDatabaseConfigured || !db) {
    return {
      connected: false,
      message: "Database URL not configured (Phase 1 prepared)",
    }
  }

  try {
    await db.$queryRaw`SELECT 1`
    return { connected: true, message: "Connected to PostgreSQL" }
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Database connection failed",
    }
  }
}
