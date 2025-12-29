"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.optionalAuth = optionalAuth;
const AuthService_1 = require("../services/AuthService");
/**
 * Authentication middleware for protected routes
 * Requirements: 8.1, 8.3
 *
 * Verifies JWT token from Authorization header and attaches user to request
 */
function authenticateToken(req, res, next) {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    if (!token) {
        res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication token is required'
            }
        });
        return;
    }
    try {
        // Verify token using AuthService
        const authService = new AuthService_1.AuthService();
        const user = authService.verifyToken(token);
        // Attach user to request object
        req.user = user;
        // Continue to next middleware/route handler
        next();
    }
    catch (error) {
        // Token is invalid or expired
        const errorMessage = error instanceof Error ? error.message : 'Invalid token';
        res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: errorMessage
            }
        });
    }
}
/**
 * Optional authentication middleware
 * Attaches user to request if valid token is provided, but doesn't require it
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const authService = new AuthService_1.AuthService();
            const user = authService.verifyToken(token);
            req.user = user;
        }
        catch (error) {
            // Token is invalid, but we don't fail the request
            // Just continue without user
        }
    }
    next();
}
