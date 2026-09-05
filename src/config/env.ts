import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  
  // Future AI Integration (Optional in Phase 1)
  OPENAI_API_KEY: z.string().optional(),
  
  // Future PostgreSQL Integration (Optional in Phase 1)
  DATABASE_URL: z.string().optional(),
  
  // Future Redis Integration (Optional in Phase 1)
  REDIS_URL: z.string().optional(),
  
  // Future Python Local Windows Agent (Optional in Phase 1)
  LOCAL_AGENT_URL: z.string().url().default("http://127.0.0.1:8765"),
  LOCAL_AGENT_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    LOCAL_AGENT_URL: process.env.LOCAL_AGENT_URL || "http://127.0.0.1:8765",
    LOCAL_AGENT_SECRET: process.env.LOCAL_AGENT_SECRET,
  });

  if (!parsed.success) {
    console.error("❌ Environment configuration validation failed:", parsed.error.format());
    // Fall back to defaults to avoid breaking build in non-configured environments
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV || "development",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      LOCAL_AGENT_URL: "http://127.0.0.1:8765",
    });
  }

  return parsed.data;
}

export const env = validateEnv();
