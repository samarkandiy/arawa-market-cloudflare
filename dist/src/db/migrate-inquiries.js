"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateInquiriesTable = migrateInquiriesTable;
const database_1 = require("./database");
/**
 * Migration script to remove foreign key constraint from inquiries table
 * This allows vehicleId = 0 for general contact forms
 */
function migrateInquiriesTable() {
    console.log('Starting inquiries table migration...');
    try {
        // Start transaction
        database_1.db.exec('BEGIN TRANSACTION');
        // Create new table without foreign key constraint
        database_1.db.exec(`
      CREATE TABLE IF NOT EXISTS inquiries_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        message TEXT NOT NULL,
        inquiry_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Copy data from old table to new table
        database_1.db.exec(`
      INSERT INTO inquiries_new (id, vehicle_id, customer_name, customer_email, customer_phone, message, inquiry_type, status, created_at)
      SELECT id, vehicle_id, customer_name, customer_email, customer_phone, message, inquiry_type, status, created_at
      FROM inquiries
    `);
        // Drop old table
        database_1.db.exec('DROP TABLE inquiries');
        // Rename new table to original name
        database_1.db.exec('ALTER TABLE inquiries_new RENAME TO inquiries');
        // Recreate indexes
        database_1.db.exec('CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status)');
        database_1.db.exec('CREATE INDEX IF NOT EXISTS idx_inquiries_vehicle ON inquiries(vehicle_id)');
        // Commit transaction
        database_1.db.exec('COMMIT');
        console.log('Inquiries table migration completed successfully');
    }
    catch (error) {
        // Rollback on error
        database_1.db.exec('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    }
}
