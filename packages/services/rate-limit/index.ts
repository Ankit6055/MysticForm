import { createHash } from "node:crypto";
import { env } from "../env";

type Bucket = {
  tokens: number;
  updatedAt: number;
};

const buckets = new Map<string, Bucket>();
const pruneAfterMs = 10 * 60 * 1000;

export function hashIp(ip: string) {
  return createHash("sha256").update(`${env.IP_HASH_SALT}:${ip}`).digest("hex");
}

export function consume(
  key: string,
  opts: { capacity: number; refillPerSec: number },
): { ok: boolean; remaining: number } {
  const now = Date.now();

  for (const [bucketKey, bucket] of buckets) {
    if (now - bucket.updatedAt > pruneAfterMs) buckets.delete(bucketKey);
  }

  const bucket = buckets.get(key) ?? { tokens: opts.capacity, updatedAt: now };
  const elapsedSeconds = (now - bucket.updatedAt) / 1000;
  const tokens = Math.min(opts.capacity, bucket.tokens + elapsedSeconds * opts.refillPerSec);

  if (tokens < 1) {
    buckets.set(key, { tokens, updatedAt: now });
    return { ok: false, remaining: Math.max(0, Math.floor(tokens)) };
  }

  const remaining = tokens - 1;
  buckets.set(key, { tokens: remaining, updatedAt: now });
  return { ok: true, remaining: Math.floor(remaining) };
}
