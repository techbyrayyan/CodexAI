import { NextResponse } from "next/server";
import { SystemStatusService } from "@/services/system-status";
import { isDatabaseConfigured } from "@/database/client";

export async function GET() {
  const health = SystemStatusService.getSystemHealth();

  return NextResponse.json(
    {
      status: health.overall,
      phase: "Phase 1: Project Foundation & Architecture",
      version: "1.0.0",
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
