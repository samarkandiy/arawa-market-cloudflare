"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthService_1 = require("../services/AuthService");
const security_1 = require("../middleware/security");
const router = (0, express_1.Router)();
const authService = new AuthService_1.AuthService();
/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Requirements: 8.1
 */
router.post('/login', security_1.loginRateLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Username and password are required',
                    details: {
                        username: !username ? 'Username is required' : undefined,
                        password: !password ? 'Password is required' : undefined
                    }
                }
            });
            return;
        }
        const authToken = await authService.login(username, password);
        res.json(authToken);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        const statusCode = message.includes('Invalid') || message.includes('not found') ? 401 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 401 ? 'UNAUTHORIZED' : 'LOGIN_ERROR',
                message
            }
        });
    }
});
/**
 * POST /api/auth/logout
 * Logout user (invalidate token)
 * Requirements: 8.1
 */
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Token is required for logout'
                }
            });
            return;
        }
        await authService.logout(token);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Logout failed';
        res.status(500).json({
            error: {
                code: 'LOGOUT_ERROR',
                message
            }
        });
    }
});
exports.default = router;
