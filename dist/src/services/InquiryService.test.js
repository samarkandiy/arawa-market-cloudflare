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
const InquiryService_1 = require("./InquiryService");
const VehicleService_1 = require("./VehicleService");
const database_1 = require("../db/database");
// Initialize database before tests
beforeAll(() => {
    (0, database_1.initializeDatabase)();
    (0, database_1.seedDatabase)();
});
// Clean up after each test
afterEach(() => {
    database_1.db.prepare('DELETE FROM inquiries').run();
    database_1.db.prepare('DELETE FROM vehicles').run();
});
// Arbitraries for property-based testing
const inquiryTypeArbitrary = fc.constantFrom('phone', 'email', 'line');
const emailArbitrary = fc.emailAddress();
const phoneArbitrary = fc.string({ minLength: 10, maxLength: 15 })
    .map(s => s.replace(/[^0-9]/g, ''))
    .filter(s => s.length >= 10);
const inquiryInputArbitrary = fc
    .tuple(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // customerName
fc.oneof(fc.record({ email: emailArbitrary, phone: fc.constant('') }), fc.record({ email: fc.constant(''), phone: phoneArbitrary }), fc.record({ email: emailArbitrary, phone: phoneArbitrary })), // contact info
fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0), // message
inquiryTypeArbitrary)
    .map(([customerName, contact, message, inquiryType]) => ({
    vehicleId: 0, // Will be replaced with actual vehicle ID
    customerName,
    customerEmail: contact.email,
    customerPhone: contact.phone,
    message,
    inquiryType
}));
// Helper to create a test vehicle
const vehicleCategoryArbitrary = fc.constantFrom('flatbed', 'dump', 'crane', 'van-wing', 'refrigerated', 'arm-roll', 'carrier', 'garbage', 'mixer', 'tank', 'aerial', 'special', 'bus', 'other');
const dimensionsArbitrary = fc.record({
    length: fc.double({ min: 1, max: 20, noNaN: true }),
    width: fc.double({ min: 1, max: 5, noNaN: true }),
    height: fc.double({ min: 1, max: 5, noNaN: true })
});
const currentYear = new Date().getFullYear();
const vehicleInputArbitrary = fc.record({
    category: vehicleCategoryArbitrary,
    make: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    model: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    year: fc.integer({ min: 1990, max: currentYear + 1 }),
    mileage: fc.integer({ min: 0, max: 1000000 }),
    price: fc.integer({ min: 1, max: 100000000 }),
    engineType: fc.string({ maxLength: 50 }),
    dimensions: dimensionsArbitrary,
    condition: fc.string({ maxLength: 100 }),
    features: fc.array(fc.string({ maxLength: 50 }), { maxLength: 10 }),
    descriptionJa: fc.string({ maxLength: 2000 }),
    descriptionEn: fc.string({ maxLength: 2000 })
});
describe('InquiryService', () => {
    let inquiryService;
    let vehicleService;
    beforeEach(() => {
        inquiryService = new InquiryService_1.InquiryService();
        vehicleService = new VehicleService_1.VehicleService();
    });
    // Feature: used-trucks-marketplace, Property 8: Inquiry Data Capture
    // Validates: Requirements 4.2, 4.3
    describe('Property 8: Inquiry Data Capture', () => {
        test('inquiry submission stores all provided customer details and vehicle ID', () => {
            fc.assert(fc.property(vehicleInputArbitrary, inquiryInputArbitrary, (vehicleData, inquiryData) => {
                // Create a vehicle first
                const vehicle = vehicleService.createVehicle(vehicleData);
                // Create inquiry with the vehicle ID
                const inquiryWithVehicleId = {
                    ...inquiryData,
                    vehicleId: vehicle.id
                };
                const created = inquiryService.createInquiry(inquiryWithVehicleId);
                // Retrieve the inquiry
                const retrieved = inquiryService.getInquiry(created.id);
                // Verify inquiry was retrieved
                expect(retrieved).not.toBeNull();
                if (retrieved) {
                    // Verify all customer details are preserved
                    expect(retrieved.customerName).toBe(inquiryWithVehicleId.customerName);
                    expect(retrieved.customerEmail).toBe(inquiryWithVehicleId.customerEmail || '');
                    expect(retrieved.customerPhone).toBe(inquiryWithVehicleId.customerPhone || '');
                    expect(retrieved.message).toBe(inquiryWithVehicleId.message);
                    expect(retrieved.inquiryType).toBe(inquiryWithVehicleId.inquiryType);
                    // Verify vehicle ID is preserved
                    expect(retrieved.vehicleId).toBe(vehicle.id);
                    // Verify inquiry has correct initial status
                    expect(retrieved.status).toBe('new');
                    // Verify inquiry has a creation timestamp
                    expect(retrieved.createdAt).toBeInstanceOf(Date);
                    expect(retrieved.id).toBe(created.id);
                }
            }), { numRuns: 20 });
        });
    });
    // Unit tests for validation edge cases
    // Validates: Requirements 4.2
    describe('Validation Edge Cases', () => {
        const validVehicleData = {
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
        let testVehicleId;
        beforeEach(() => {
            // Create a test vehicle for inquiries
            const vehicle = vehicleService.createVehicle(validVehicleData);
            testVehicleId = vehicle.id;
        });
        test('should reject inquiry with missing customer name', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: '',
                customerEmail: 'test@example.com',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with whitespace-only customer name', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: '   ',
                customerEmail: 'test@example.com',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with neither email nor phone', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: '',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with invalid email format', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'invalid-email',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with invalid email format (missing @)', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'testexample.com',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with invalid email format (missing domain)', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'test@',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should accept inquiry with valid email only', () => {
            const validInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            const created = inquiryService.createInquiry(validInquiry);
            expect(created.customerEmail).toBe('john@example.com');
            expect(created.customerPhone).toBe('');
        });
        test('should accept inquiry with valid phone only', () => {
            const validInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: '',
                customerPhone: '090-1234-5678',
                message: 'I am interested in this vehicle',
                inquiryType: 'phone'
            };
            const created = inquiryService.createInquiry(validInquiry);
            expect(created.customerPhone).toBe('090-1234-5678');
            expect(created.customerEmail).toBe('');
        });
        test('should accept inquiry with both email and phone', () => {
            const validInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '090-1234-5678',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            const created = inquiryService.createInquiry(validInquiry);
            expect(created.customerEmail).toBe('john@example.com');
            expect(created.customerPhone).toBe('090-1234-5678');
        });
        test('should reject inquiry with missing message', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '',
                message: '',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with whitespace-only message', () => {
            const invalidInquiry = {
                vehicleId: testVehicleId,
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '',
                message: '   ',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
        test('should reject inquiry with non-existent vehicle ID', () => {
            const invalidInquiry = {
                vehicleId: 99999,
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '',
                message: 'I am interested in this vehicle',
                inquiryType: 'email'
            };
            expect(() => inquiryService.createInquiry(invalidInquiry)).toThrow();
        });
    });
});
