"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../db/database");
// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '24h'; // Token expires in 24 hours
class AuthService {
    /**
     * Authenticate user and generate JWT token
     * Requirements: 8.1, 8.4
     * @param username - User's username
     * @param password - User's password
     * @returns AuthToken with JWT and expiration
     * @throws Error if credentials are invalid
     */
    login(username, password) {
        // Retrieve user from database
        const stmt = database_1.db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?');
        const user = stmt.get(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        const isPasswordValid = bcrypt_1.default.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        // Generate JWT token
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        // Decode token to get expiration time
        const decoded = jsonwebtoken_1.default.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);
        return {
            token,
            expiresAt,
            userId: user.id
        };
    }
    /**
     * Verify JWT token and return user information
     * Requirements: 8.1, 8.3
     * @param token - JWT token string
     * @returns User object if token is valid
     * @throws Error if token is invalid or expired
     */
    verifyToken(token) {
        try {
            // Verify and decode token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Return user information
            return {
                id: decoded.userId,
                username: decoded.username,
                role: decoded.role
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Token has expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            else {
                throw new Error('Token verification failed');
            }
        }
    }
    /**
     * Logout user (invalidate token)
     * Requirements: 8.1
     * Note: With JWT, logout is typically handled client-side by removing the token.
     * For server-side logout, we would need a token blacklist, which is not implemented here.
     * @param token - JWT token string
     */
    logout(token) {
        // Verify token is valid before "logging out"
        this.verifyToken(token);
        // In a production system, you might want to:
        // 1. Add token to a blacklist/revocation list
        // 2. Store blacklist in database or Redis
        // 3. Check blacklist in verifyToken method
        // For now, logout is handled client-side by removing the token
        console.log('User logged out successfully');
    }
    /**
     * Get user by ID
     * @param userId - User ID
     * @returns User object or null if not found
     */
    getUserById(userId) {
        const stmt = database_1.db.prepare('SELECT id, username, role FROM users WHERE id = ?');
        const user = stmt.get(userId);
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            username: user.username,
            role: user.role
        };
    }
}
exports.AuthService = AuthService;
