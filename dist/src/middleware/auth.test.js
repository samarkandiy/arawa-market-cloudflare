"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./auth");
const AuthService_1 = require("../services/AuthService");
const database_1 = require("../db/database");
const seedAdminUser_1 = require("../db/seedAdminUser");
describe('Authentication Middleware', () => {
    let authService;
    let validToken;
    beforeAll(() => {
        // Use in-memory database for testing
        process.env.DATABASE_PATH = ':memory:';
        (0, database_1.initializeDatabase)();
        (0, seedAdminUser_1.seedAdminUser)();
        // Get a valid token
        authService = new AuthService_1.AuthService();
        const authToken = authService.login('admin', 'admin123');
        validToken = authToken.token;
    });
    afterAll(() => {
        database_1.db.close();
    });
    describe('authenticateToken', () => {
        test('should reject request without token', () => {
            const req = {
                headers: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            (0, auth_1.authenticateToken)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication token is required'
                }
            });
            expect(next).not.toHaveBeenCalled();
        });
        test('should reject request with invalid token', () => {
            const req = {
                headers: {
                    authorization: 'Bearer invalid-token'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            (0, auth_1.authenticateToken)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
        test('should accept request with valid token', () => {
            const req = {
                headers: {
                    authorization: `Bearer ${validToken}`
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            (0, auth_1.authenticateToken)(req, res, next);
            expect(req.user).toBeDefined();
            expect(req.user?.username).toBe('admin');
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
    describe('optionalAuth', () => {
        test('should continue without user when no token provided', () => {
            const req = {
                headers: {}
            };
            const res = {};
            const next = jest.fn();
            (0, auth_1.optionalAuth)(req, res, next);
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });
        test('should attach user when valid token provided', () => {
            const req = {
                headers: {
                    authorization: `Bearer ${validToken}`
                }
            };
            const res = {};
            const next = jest.fn();
            (0, auth_1.optionalAuth)(req, res, next);
            expect(req.user).toBeDefined();
            expect(req.user?.username).toBe('admin');
            expect(next).toHaveBeenCalled();
        });
        test('should continue without user when invalid token provided', () => {
            const req = {
                headers: {
                    authorization: 'Bearer invalid-token'
                }
            };
            const res = {};
            const next = jest.fn();
            (0, auth_1.optionalAuth)(req, res, next);
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });
    });
});
