"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrate_inquiries_1 = require("../db/migrate-inquiries");
const database_1 = require("../db/database");
console.log('Running inquiries table migration...');
try {
    (0, migrate_inquiries_1.migrateInquiriesTable)();
    console.log('Migration completed successfully!');
}
catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
finally {
    (0, database_1.closeDatabase)();
}
