import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // max requests per window
  windowMs?: number; // window duration in ms
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60 * 1000;
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count < limit) {
    record.count += 1;
    return {
      allowed: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }

  return {
    allowed: false,
    limit,
    remaining: 0,
    reset: record.resetAt,
  };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
