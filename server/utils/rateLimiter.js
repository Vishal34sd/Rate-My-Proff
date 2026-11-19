// In-memory sliding-window IP rate limiter for OTP endpoints
const ipRequestMap = new Map();

// Periodic cleanup of stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestMap.entries()) {
    if (now - data.windowStart > 10 * 60 * 1000) {
      ipRequestMap.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Middleware or helper to enforce IP-based rate limits for OTP actions.
 * Limits to 15 requests per rolling 10-minute window per IP.
 */
export const checkIpRateLimit = (ip, maxRequests = 15, windowMs = 10 * 60 * 1000) => {
  const normalizedIp = ip || "unknown_ip";
  const now = Date.now();
  const record = ipRequestMap.get(normalizedIp);

  if (!record || now - record.windowStart > windowMs) {
    ipRequestMap.set(normalizedIp, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds,
      message: `Too many requests from this IP. Please try again in ${retryAfterSeconds} seconds.`,
    };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
};
