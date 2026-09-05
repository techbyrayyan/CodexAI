import { NextResponse } from "next/server";
import { SystemStatusService } from "@/services/system-status";
import { isDatabaseConfigured } from "@/database/client";

export async function GET() {
  const health = SystemStatusService.getSystemHealth();

  return NextResponse.json(
    {
      status: health.overall,
      phase: "Phase 2: Real AI Brain & OpenAI Agent Integration",
      version: "1.1.0",
      timestamp: health.timestamp,
      subsystems: health.subsystems,
      database: {
        configured: isDatabaseConfigured,
        provider: "PostgreSQL (Prisma)",
      },
    },
    { status: 200 }
  );
}
