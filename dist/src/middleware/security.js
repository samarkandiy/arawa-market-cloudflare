"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimiter = loginRateLimiter;
exports.securityHeaders = securityHeaders;
/**
 * Rate limiting store for login attempts
 */
const loginAttempts = new Map();
/**
 * Rate limiter for login endpoint
 * Prevents brute force attacks
 */
function loginRateLimiter(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    // Clean up old entries
    for (const [key, value] of loginAttempts.entries()) {
        if (now > value.resetTime) {
            loginAttempts.delete(key);
        }
    }
    // Get or create attempt record
    let attempts = loginAttempts.get(ip);
    if (!attempts || now > attempts.resetTime) {
        attempts = { count: 0, resetTime: now + windowMs };
        loginAttempts.set(ip, attempts);
    }
    // Check if limit exceeded
    if (attempts.count >= maxAttempts) {
        const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60);
        res.status(429).json({
            error: {
                code: 'TOO_MANY_REQUESTS',
                message: `Too many login attempts. Please try again in ${remainingTime} minutes.`
            }
        });
        return;
    }
    // Increment attempt count
    attempts.count++;
    next();
}
/**
 * Security headers middleware
 */
function securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
}
