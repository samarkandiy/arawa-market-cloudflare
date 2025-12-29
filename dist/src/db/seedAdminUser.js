"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = seedAdminUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("./database");
/**
 * Seed initial admin user
 * Requirements: 8.1
 */
function seedAdminUser() {
    // Check if admin user already exists
    const userCount = database_1.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count === 0) {
        // Secure default credentials
        const username = 'arawa_admin';
        const password = 'Kx9#mP2vL@7nQ5wR!8jT';
        // Hash the password
        const passwordHash = bcrypt_1.default.hashSync(password, 10);
        // Insert admin user
        database_1.db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
            .run(username, passwordHash, 'admin');
        console.log('Admin user created successfully');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('IMPORTANT: Please change these credentials after first login');
    }
    else {
        console.log('Admin user already exists');
    }
}
