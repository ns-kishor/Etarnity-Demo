import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  // If an explicitly valid path is provided that isn't the stale Linux container path
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("/home/z/")) {
    return process.env.DATABASE_URL;
  }

  // Resolve db/custom.db relative to process.cwd()
  const dbFile = path.resolve(process.cwd(), "db", "custom.db");
  return `file:${dbFile}`;
}

const resolvedUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = resolvedUrl;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;