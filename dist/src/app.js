"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const security_1 = require("./middleware/security");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security headers
app.use(security_1.securityHeaders);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files (logo and uploaded images)
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Import routes
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const categories_1 = __importDefault(require("./routes/categories"));
const inquiries_1 = __importDefault(require("./routes/inquiries"));
const images_1 = __importDefault(require("./routes/images"));
const auth_1 = __importDefault(require("./routes/auth"));
const pages_1 = __importDefault(require("./routes/pages"));
// API routes
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/inquiries', inquiries_1.default);
app.use('/api/images', images_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/pages', pages_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: message,
            details: err.details || {}
        }
    });
});
exports.default = app;
