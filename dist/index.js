"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
const fs_1 = __importDefault(require("fs"));
const PORT = process.env.PORT || 3000;
// Ensure required directories exist
const directories = ['./data', './uploads', './public'];
directories.forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
// Initialize database
try {
    (0, db_1.initializeDatabase)();
    (0, db_1.seedDatabase)();
    console.log('Database initialized and seeded');
}
catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}
// Start server
const server = app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
exports.default = server;
