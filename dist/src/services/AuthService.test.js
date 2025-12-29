"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fc = __importStar(require("fast-check"));
const AuthService_1 = require("./AuthService");
const database_1 = require("../db/database");
const seedAdminUser_1 = require("../db/seedAdminUser");
describe('AuthService', () => {
    let authService;
    beforeAll(() => {
        // Use in-memory database for testing
        process.env.DATABASE_PATH = ':memory:';
        (0, database_1.initializeDatabase)();
        (0, seedAdminUser_1.seedAdminUser)();
    });
    beforeEach(() => {
        authService = new AuthService_1.AuthService();
    });
    afterAll(() => {
        database_1.db.close();
    });
    // Feature: used-trucks-marketplace, Property 13: Authentication Required for CMS
    // Validates: Requirements 8.1
    describe('Property 13: Authentication Required for CMS', () => {
        test('verifyToken should reject invalid tokens', () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 200 }), (invalidToken) => {
                // For any random string that is not a valid JWT token
                // verifyToken should throw an error
                expect(() => {
                    authService.verifyToken(invalidToken);
                }).toThrow();
            }), { numRuns: 100 });
        });
        test('verifyToken should reject empty or malformed tokens', () => {
            const invalidTokens = ['', 'invalid', 'Bearer token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'];
            invalidTokens.forEach(token => {
                expect(() => {
                    authService.verifyToken(token);
                }).toThrow();
            });
        });
        test('valid token should be accepted', () => {
            // Login to get a valid token
            const authToken = authService.login('admin', 'admin123');
            // Verify the token should succeed
            const user = authService.verifyToken(authToken.token);
            expect(user).toBeDefined();
            expect(user.username).toBe('admin');
            expect(user.role).toBe('admin');
        });
    });
    // Feature: used-trucks-marketplace, Property 14: Invalid Credentials Rejection
    // Validates: Requirements 8.2
    describe('Property 14: Invalid Credentials Rejection', () => {
        test('login should reject any invalid username', () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s !== 'admin'), fc.string({ minLength: 1, maxLength: 50 }), (username, password) => {
                // For any username that is not 'admin', login should fail
                expect(() => {
                    authService.login(username, password);
                }).toThrow('Invalid credentials');
            }), { numRuns: 100 });
        });
        test('login should reject any invalid password for valid username', () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s !== 'admin123'), (password) => {
                // For any password that is not 'admin123', login should fail
                expect(() => {
                    authService.login('admin', password);
                }).toThrow('Invalid credentials');
            }), { numRuns: 20 } // Reduced from 100 due to bcrypt being slow
            );
        });
        test('login should succeed with valid credentials', () => {
            // Valid credentials should work
            const authToken = authService.login('admin', 'admin123');
            expect(authToken).toBeDefined();
            expect(authToken.token).toBeDefined();
            expect(authToken.userId).toBeDefined();
            expect(authToken.expiresAt).toBeInstanceOf(Date);
        });
    });
    // Feature: used-trucks-marketplace, Property 15: Session Expiration Enforcement
    // Validates: Requirements 8.3
    describe('Property 15: Session Expiration Enforcement', () => {
        test('verifyToken should reject expired tokens', () => {
            // Create a token with very short expiration (1 second)
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            const payload = {
                userId: 1,
                username: 'admin',
                role: 'admin'
            };
            // Create token that expires in 1 second
            const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1s' });
            // Wait for token to expire
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Token should now be expired
                    expect(() => {
                        authService.verifyToken(expiredToken);
                    }).toThrow('Token has expired');
                    resolve();
                }, 1100); // Wait 1.1 seconds
            });
        }, 10000); // Increase test timeout to 10 seconds
        test('verifyToken should accept non-expired tokens', () => {
            // Login to get a fresh token
            const authToken = authService.login('admin', 'admin123');
            // Token should be valid immediately after creation
            const user = authService.verifyToken(authToken.token);
            expect(user).toBeDefined();
            expect(user.username).toBe('admin');
        });
        test('token expiration time should be in the future', () => {
            const authToken = authService.login('admin', 'admin123');
            const now = new Date();
            // expiresAt should be in the future
            expect(authToken.expiresAt.getTime()).toBeGreaterThan(now.getTime());
            // Should be approximately 24 hours in the future (with some tolerance)
            const hoursDiff = (authToken.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
            expect(hoursDiff).toBeGreaterThan(23);
            expect(hoursDiff).toBeLessThan(25);
        });
    });
});
