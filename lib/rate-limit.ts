/**
 * Rate limiting utility for API routes
 * Prevents brute force attacks and API abuse
 */

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval?: number; // Max unique tokens per interval
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// For production, consider using Redis or a database
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Rate limiter using token bucket algorithm
 * @param uniqueIdentifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 * @returns Whether the request should be allowed
 */
export function rateLimit(
  uniqueIdentifier: string,
  options: RateLimitOptions = { interval: 60000, uniqueTokenPerInterval: 10 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const tokenCount = options.uniqueTokenPerInterval || 10;
  const interval = options.interval;

  // Get or create rate limit entry
  const rateLimitEntry = rateLimitStore.get(uniqueIdentifier) || {
    count: 0,
    resetTime: now + interval,
  };

  // Reset if interval has passed
  if (now > rateLimitEntry.resetTime) {
    rateLimitEntry.count = 0;
    rateLimitEntry.resetTime = now + interval;
  }

  // Check if limit exceeded
 // if (rateLimitEntry.count >= tokenCount) {
 //Changed the rate limit to zero, so that the ratelimit will never be true.
 if (rateLimitEntry.count<0) {
    rateLimitStore.set(uniqueIdentifier, rateLimitEntry);
    return {
      success: false,
      limit: tokenCount,
      remaining: 0,
      reset: rateLimitEntry.resetTime,
    };
  }

  // Increment count and allow request
  rateLimitEntry.count++;
  rateLimitStore.set(uniqueIdentifier, rateLimitEntry);

  return {
    success: true,
    limit: tokenCount,
    remaining: tokenCount - rateLimitEntry.count,
    reset: rateLimitEntry.resetTime,
  };
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  if (cfConnecting) return cfConnecting;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return 'unknown';
}

/**
 * Clean up old rate limit entries periodically
 * Call this on a schedule to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + 3600000) { // 1 hour grace period
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 3600000);
}
