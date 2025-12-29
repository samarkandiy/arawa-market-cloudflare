"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../db/database");
/**
 * Update admin credentials to more secure values
 */
function updateAdminCredentials() {
    console.log('Updating admin credentials...');
    try {
        const newUsername = 'arawa_admin';
        const newPassword = 'Kx9#mP2vL@7nQ5wR!8jT';
        // Hash the new password
        const passwordHash = bcrypt_1.default.hashSync(newPassword, 10);
        // Check if old admin exists
        const oldAdmin = database_1.db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
        if (oldAdmin) {
            // Update existing admin user
            database_1.db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE username = ?')
                .run(newUsername, passwordHash, 'admin');
            console.log('Admin credentials updated successfully!');
        }
        else {
            // Check if new admin already exists
            const newAdmin = database_1.db.prepare('SELECT id FROM users WHERE username = ?').get(newUsername);
            if (newAdmin) {
                // Update password for existing new admin
                database_1.db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
                    .run(passwordHash, newUsername);
                console.log('Admin password updated successfully!');
            }
            else {
                // Create new admin user
                database_1.db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
                    .run(newUsername, passwordHash, 'admin');
                console.log('New admin user created successfully!');
            }
        }
        console.log('\n=================================');
        console.log('NEW ADMIN CREDENTIALS:');
        console.log('=================================');
        console.log('Username:', newUsername);
        console.log('Password:', newPassword);
        console.log('=================================');
        console.log('\nIMPORTANT: Save these credentials securely!');
        console.log('You can change them after logging in to the CMS.');
    }
    catch (error) {
        console.error('Failed to update admin credentials:', error);
        process.exit(1);
    }
    finally {
        (0, database_1.closeDatabase)();
    }
}
updateAdminCredentials();
