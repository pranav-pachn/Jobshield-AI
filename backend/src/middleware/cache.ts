import crypto from "crypto";
import { RequestHandler } from "express";
import NodeCache from "node-cache";

export const statsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
export const reportsCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
export const domainCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });
export const emailCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

const allCaches = [statsCache, reportsCache, domainCache, emailCache];

type CachedResponse<T = unknown> = {
  data: T;
  timestamp: number;
};

export function generateCacheKey(prefix: string, params: Record<string, unknown> = {}): string {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}:${String(params[key])}`)
    .join("|");

  return crypto.createHash("md5").update(`${prefix}:${paramString}`).digest("hex");
}

export function cacheMiddleware(cache: NodeCache, ttl = 300): RequestHandler {
  return (req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const cacheKey = generateCacheKey(req.route?.path || req.originalUrl, req.query as Record<string, unknown>);
    const cachedResponse = cache.get<CachedResponse>(cacheKey);

    if (cachedResponse) {
      console.log(`[CACHE] Cache hit for ${req.originalUrl}`);
      res.set("X-Cache", "HIT");
      res.set("X-Cache-Age", String(Math.floor((Date.now() - cachedResponse.timestamp) / 1000)));
      res.json(cachedResponse.data);
      return;
    }

    console.log(`[CACHE] Cache miss for ${req.originalUrl}`);

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      const responseData: CachedResponse = {
        data: body,
        timestamp: Date.now(),
      };

      cache.set(cacheKey, responseData, ttl);
      res.set("X-Cache", "MISS");
      return originalJson(body);
    }) as typeof res.json;

    next();
  };
}

export function invalidateCache(pattern: string): void {
  let invalidatedCount = 0;

  for (const cache of allCaches) {
    const keys = cache.keys().filter((key) => key.includes(pattern));
    for (const key of keys) {
      cache.del(key);
      invalidatedCount += 1;
    }
  }

  console.log(`[CACHE] Invalidated ${invalidatedCount} cache entries matching pattern: ${pattern}`);
}

export function getCacheStats() {
  return {
    stats: statsCache.getStats(),
    reports: reportsCache.getStats(),
    domain: domainCache.getStats(),
    email: emailCache.getStats(),
  };
}
