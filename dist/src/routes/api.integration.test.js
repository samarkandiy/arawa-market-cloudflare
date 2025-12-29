"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../db");
const AuthService_1 = require("../services/AuthService");
const VehicleService_1 = require("../services/VehicleService");
const InquiryService_1 = require("../services/InquiryService");
describe('API Routes Integration Tests', () => {
    let authToken;
    let vehicleId;
    beforeAll(() => {
        // Initialize database for testing
        (0, db_1.initializeDatabase)();
        (0, db_1.seedDatabase)();
    });
    beforeEach(async () => {
        // Get auth token for protected routes
        const authService = new AuthService_1.AuthService();
        const token = await authService.login('admin', 'admin123');
        authToken = token.token;
        // Create a test vehicle
        const vehicleService = new VehicleService_1.VehicleService();
        const vehicleData = {
            category: 'flatbed',
            make: 'Isuzu',
            model: 'Forward',
            year: 2020,
            mileage: 50000,
            price: 5000000,
            engineType: 'Diesel',
            dimensions: { length: 7.5, width: 2.3, height: 2.8 },
            condition: 'Good',
            features: ['Power steering', 'Air conditioning'],
            descriptionJa: 'テスト車両',
            descriptionEn: 'Test vehicle'
        };
        const vehicle = await vehicleService.createVehicle(vehicleData);
        vehicleId = vehicle.id;
    });
    describe('Authentication Flow', () => {
        /**
         * Test complete authentication flow
         * Requirements: 8.1, 8.2
         */
        test('should login with valid credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: 'admin',
                password: 'admin123'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('expiresAt');
        });
        test('should reject invalid credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: 'admin',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
        test('should reject login without credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
        test('should logout successfully', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(204);
        });
    });
    describe('Vehicle Routes', () => {
        /**
         * Test vehicle listing and retrieval
         * Requirements: 1.2, 6.1
         */
        test('should list vehicles', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/vehicles');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('vehicles');
            expect(response.body).toHaveProperty('totalCount');
            expect(response.body).toHaveProperty('page');
            expect(Array.isArray(response.body.vehicles)).toBe(true);
        });
        test('should get vehicle by id', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/vehicles/${vehicleId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', vehicleId);
            expect(response.body).toHaveProperty('make', 'Isuzu');
        });
        test('should return 404 for non-existent vehicle', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/vehicles/99999');
            expect(response.status).toBe(404);
            expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
        });
        test('should search vehicles', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/vehicles/search?q=Isuzu');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
        test('should filter vehicles by category', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/vehicles?category=flatbed');
            expect(response.status).toBe(200);
            expect(response.body.vehicles.every((v) => v.category === 'flatbed')).toBe(true);
        });
    });
    describe('Protected Vehicle Routes', () => {
        /**
         * Test protected vehicle management
         * Requirements: 1.2, 1.3, 1.4, 8.1
         */
        test('should create vehicle with authentication', async () => {
            const vehicleData = {
                category: 'dump',
                make: 'Hino',
                model: 'Ranger',
                year: 2021,
                mileage: 30000,
                price: 6000000,
                engineType: 'Diesel',
                dimensions: { length: 8.0, width: 2.4, height: 3.0 },
                condition: 'Excellent',
                features: ['Hydraulic dump'],
                descriptionJa: '新しいダンプトラック',
                descriptionEn: 'New dump truck'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${authToken}`)
                .send(vehicleData);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.make).toBe('Hino');
        });
        test('should reject vehicle creation without authentication', async () => {
            const vehicleData = {
                category: 'dump',
                make: 'Hino',
                model: 'Ranger',
                year: 2021,
                mileage: 30000,
                price: 6000000,
                engineType: 'Diesel',
                dimensions: { length: 8.0, width: 2.4, height: 3.0 },
                condition: 'Excellent',
                features: [],
                descriptionJa: 'テスト',
                descriptionEn: 'Test'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/vehicles')
                .send(vehicleData);
            expect(response.status).toBe(401);
            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
        test('should update vehicle with authentication', async () => {
            // Get the existing vehicle first
            const getResponse = await (0, supertest_1.default)(app_1.default)
                .get(`/api/vehicles/${vehicleId}`);
            const existingVehicle = getResponse.body;
            // Update with full data
            const updateData = {
                ...existingVehicle,
                price: 4500000,
                mileage: 55000
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/vehicles/${vehicleId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.price).toBe(4500000);
            expect(response.body.mileage).toBe(55000);
        });
        test('should delete vehicle with authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/vehicles/${vehicleId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(204);
            // Verify deletion
            const getResponse = await (0, supertest_1.default)(app_1.default)
                .get(`/api/vehicles/${vehicleId}`);
            expect(getResponse.status).toBe(404);
        });
    });
    describe('Category Routes', () => {
        /**
         * Test category listing
         * Requirements: 2.1
         */
        test('should list all categories', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/categories');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('nameJa');
            expect(response.body[0]).toHaveProperty('nameEn');
        });
        test('should get category by id', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/categories/1');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('nameJa');
            expect(response.body).toHaveProperty('nameEn');
        });
    });
    describe('Inquiry Routes', () => {
        /**
         * Test inquiry submission and management
         * Requirements: 4.2, 4.3, 8.1
         */
        test('should submit inquiry without authentication', async () => {
            const inquiryData = {
                vehicleId: vehicleId,
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '090-1234-5678',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/inquiries')
                .send(inquiryData);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.customerName).toBe('Test Customer');
        });
        test('should reject inquiry with missing required fields', async () => {
            const inquiryData = {
                vehicleId: vehicleId,
                message: 'Test message'
                // Missing customerName and contact info
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/inquiries')
                .send(inquiryData);
            expect(response.status).toBe(400);
            expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
        test('should list inquiries with authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/inquiries')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('inquiries');
            expect(Array.isArray(response.body.inquiries)).toBe(true);
        });
        test('should reject inquiry listing without authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/inquiries');
            expect(response.status).toBe(401);
            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
        test('should update inquiry status with authentication', async () => {
            // First create an inquiry
            const inquiryService = new InquiryService_1.InquiryService();
            const inquiry = await inquiryService.createInquiry({
                vehicleId: vehicleId,
                customerName: 'Test',
                customerEmail: 'test@test.com',
                customerPhone: '090-1234-5678',
                message: 'Test',
                inquiryType: 'email'
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/inquiries/${inquiry.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'contacted' });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('contacted');
        });
    });
    describe('Error Responses', () => {
        /**
         * Test error handling
         * Requirements: 8.1, 8.2
         */
        test('should return 400 for invalid vehicle ID format', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/vehicles/invalid');
            expect(response.status).toBe(400);
            expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
        test('should return 400 for missing search query', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/vehicles/search');
            expect(response.status).toBe(400);
            expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
        test('should return 401 for expired token', async () => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDk0NTkyMDAsImV4cCI6MTYwOTQ1OTIwMH0.invalid';
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({});
            expect(response.status).toBe(401);
            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
    });
});
