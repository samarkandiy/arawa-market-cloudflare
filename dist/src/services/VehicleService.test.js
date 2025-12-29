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
const VehicleService_1 = require("./VehicleService");
const database_1 = require("../db/database");
// Initialize database before tests
beforeAll(() => {
    (0, database_1.initializeDatabase)();
    (0, database_1.seedDatabase)();
});
// Clean up vehicles after each test
afterEach(() => {
    database_1.db.prepare('DELETE FROM vehicles').run();
});
// Arbitraries for property-based testing
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
describe('VehicleService', () => {
    let vehicleService;
    beforeEach(() => {
        vehicleService = new VehicleService_1.VehicleService();
    });
    // Feature: used-trucks-marketplace, Property 1: Vehicle CRUD Round Trip
    // Validates: Requirements 1.2, 9.1
    describe('Property 1: Vehicle CRUD Round Trip', () => {
        test('creating and retrieving vehicle preserves all data', () => {
            fc.assert(fc.property(vehicleInputArbitrary, (vehicleData) => {
                // Create vehicle
                const created = vehicleService.createVehicle(vehicleData);
                // Retrieve vehicle
                const retrieved = vehicleService.getVehicle(created.id);
                // Verify vehicle was retrieved
                expect(retrieved).not.toBeNull();
                if (retrieved) {
                    // Verify all fields are preserved
                    expect(retrieved.category).toBe(vehicleData.category);
                    expect(retrieved.make).toBe(vehicleData.make);
                    expect(retrieved.model).toBe(vehicleData.model);
                    expect(retrieved.year).toBe(vehicleData.year);
                    expect(retrieved.mileage).toBe(vehicleData.mileage);
                    expect(retrieved.price).toBe(vehicleData.price);
                    expect(retrieved.engineType).toBe(vehicleData.engineType);
                    expect(retrieved.dimensions.length).toBeCloseTo(vehicleData.dimensions.length, 5);
                    expect(retrieved.dimensions.width).toBeCloseTo(vehicleData.dimensions.width, 5);
                    expect(retrieved.dimensions.height).toBeCloseTo(vehicleData.dimensions.height, 5);
                    expect(retrieved.condition).toBe(vehicleData.condition);
                    expect(retrieved.features).toEqual(vehicleData.features);
                    expect(retrieved.descriptionJa).toBe(vehicleData.descriptionJa);
                    expect(retrieved.descriptionEn).toBe(vehicleData.descriptionEn);
                    expect(retrieved.id).toBe(created.id);
                    expect(retrieved.images).toEqual([]);
                    expect(retrieved.createdAt).toBeInstanceOf(Date);
                    expect(retrieved.updatedAt).toBeInstanceOf(Date);
                }
            }), { numRuns: 100 });
        });
    });
    // Feature: used-trucks-marketplace, Property 2: Vehicle Update Persistence
    // Validates: Requirements 1.3, 9.1
    describe('Property 2: Vehicle Update Persistence', () => {
        test('updating vehicle persists all changes', () => {
            fc.assert(fc.property(vehicleInputArbitrary, vehicleInputArbitrary, (initialData, updateData) => {
                // Create initial vehicle
                const created = vehicleService.createVehicle(initialData);
                // Update vehicle
                const updated = vehicleService.updateVehicle(created.id, updateData);
                // Retrieve vehicle again
                const retrieved = vehicleService.getVehicle(created.id);
                // Verify vehicle was retrieved
                expect(retrieved).not.toBeNull();
                if (retrieved) {
                    // Verify all updated fields are persisted
                    expect(retrieved.category).toBe(updateData.category);
                    expect(retrieved.make).toBe(updateData.make);
                    expect(retrieved.model).toBe(updateData.model);
                    expect(retrieved.year).toBe(updateData.year);
                    expect(retrieved.mileage).toBe(updateData.mileage);
                    expect(retrieved.price).toBe(updateData.price);
                    expect(retrieved.engineType).toBe(updateData.engineType);
                    expect(retrieved.dimensions.length).toBeCloseTo(updateData.dimensions.length, 5);
                    expect(retrieved.dimensions.width).toBeCloseTo(updateData.dimensions.width, 5);
                    expect(retrieved.dimensions.height).toBeCloseTo(updateData.dimensions.height, 5);
                    expect(retrieved.condition).toBe(updateData.condition);
                    expect(retrieved.features).toEqual(updateData.features);
                    expect(retrieved.descriptionJa).toBe(updateData.descriptionJa);
                    expect(retrieved.descriptionEn).toBe(updateData.descriptionEn);
                    expect(retrieved.id).toBe(created.id);
                    // Verify updated timestamp changed
                    expect(retrieved.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
                }
            }), { numRuns: 100 });
        });
    });
    // Feature: used-trucks-marketplace, Property 3: Vehicle Deletion Removes from Listings
    // Validates: Requirements 1.4
    describe('Property 3: Vehicle Deletion Removes from Listings', () => {
        test('deleted vehicle no longer appears in listings', () => {
            fc.assert(fc.property(vehicleInputArbitrary, (vehicleData) => {
                // Create vehicle
                const created = vehicleService.createVehicle(vehicleData);
                // Verify vehicle exists in listings
                const beforeDelete = vehicleService.listVehicles({ page: 1, pageSize: 100 });
                const foundBefore = beforeDelete.vehicles.some(v => v.id === created.id);
                expect(foundBefore).toBe(true);
                // Delete vehicle
                vehicleService.deleteVehicle(created.id);
                // Verify vehicle no longer exists in listings
                const afterDelete = vehicleService.listVehicles({ page: 1, pageSize: 100 });
                const foundAfter = afterDelete.vehicles.some(v => v.id === created.id);
                expect(foundAfter).toBe(false);
                // Verify vehicle cannot be retrieved directly
                const retrieved = vehicleService.getVehicle(created.id);
                expect(retrieved).toBeNull();
            }), { numRuns: 100 });
        });
    });
    // Feature: used-trucks-marketplace, Property 5: Category Filtering Accuracy
    // Validates: Requirements 2.2
    describe('Property 5: Category Filtering Accuracy', () => {
        test('category filter returns only vehicles in that category', () => {
            fc.assert(fc.property(vehicleCategoryArbitrary, vehicleInputArbitrary, (targetCategory, baseData) => {
                // Create a vehicle with the target category
                const vehicle1 = vehicleService.createVehicle({
                    ...baseData,
                    category: targetCategory
                });
                // Create a vehicle with a different category
                const differentCategory = (targetCategory === 'flatbed' ? 'dump' : 'flatbed');
                const vehicle2 = vehicleService.createVehicle({
                    ...baseData,
                    make: baseData.make + '_different',
                    model: baseData.model + '_different',
                    category: differentCategory
                });
                // Filter by target category
                const results = vehicleService.listVehicles({
                    category: targetCategory,
                    page: 1,
                    pageSize: 100
                });
                // Verify all returned vehicles belong to the target category
                results.vehicles.forEach(vehicle => {
                    expect(vehicle.category).toBe(targetCategory);
                });
                // Verify at least one vehicle was returned (the one we created)
                expect(results.vehicles.length).toBeGreaterThan(0);
                // Verify the target vehicle is in the results
                const foundTarget = results.vehicles.some(v => v.id === vehicle1.id);
                expect(foundTarget).toBe(true);
                // Verify the different category vehicle is NOT in the results
                const foundDifferent = results.vehicles.some(v => v.id === vehicle2.id);
                expect(foundDifferent).toBe(false);
            }), { numRuns: 100 });
        });
    });
    // Feature: used-trucks-marketplace, Property 10: Filter Combination Accuracy
    // Validates: Requirements 5.2
    describe('Property 10: Filter Combination Accuracy', () => {
        test('combined filters return only vehicles matching all criteria', () => {
            fc.assert(fc.property(vehicleCategoryArbitrary, fc.integer({ min: 1000000, max: 5000000 }), fc.integer({ min: 5000000, max: 10000000 }), fc.integer({ min: 1990, max: 2010 }), fc.integer({ min: 2010, max: currentYear + 1 }), vehicleInputArbitrary, (category, minPrice, maxPrice, minYear, maxYear, baseData) => {
                // Ensure minPrice <= maxPrice and minYear <= maxYear
                const actualMinPrice = Math.min(minPrice, maxPrice);
                const actualMaxPrice = Math.max(minPrice, maxPrice);
                const actualMinYear = Math.min(minYear, maxYear);
                const actualMaxYear = Math.max(minYear, maxYear);
                // Create a vehicle that matches all filter criteria
                const matchingVehicle = vehicleService.createVehicle({
                    ...baseData,
                    category,
                    price: Math.floor((actualMinPrice + actualMaxPrice) / 2),
                    year: Math.floor((actualMinYear + actualMaxYear) / 2)
                });
                // Create a vehicle that doesn't match category
                const nonMatchingCategory = vehicleService.createVehicle({
                    ...baseData,
                    make: baseData.make + '_cat',
                    model: baseData.model + '_cat',
                    category: (category === 'flatbed' ? 'dump' : 'flatbed'),
                    price: Math.floor((actualMinPrice + actualMaxPrice) / 2),
                    year: Math.floor((actualMinYear + actualMaxYear) / 2)
                });
                // Create a vehicle that doesn't match price range
                const nonMatchingPrice = vehicleService.createVehicle({
                    ...baseData,
                    make: baseData.make + '_price',
                    model: baseData.model + '_price',
                    category,
                    price: actualMaxPrice + 1000,
                    year: Math.floor((actualMinYear + actualMaxYear) / 2)
                });
                // Apply combined filters
                const results = vehicleService.listVehicles({
                    category,
                    minPrice: actualMinPrice,
                    maxPrice: actualMaxPrice,
                    minYear: actualMinYear,
                    maxYear: actualMaxYear,
                    page: 1,
                    pageSize: 100
                });
                // Verify all returned vehicles match all filter criteria
                results.vehicles.forEach(vehicle => {
                    expect(vehicle.category).toBe(category);
                    expect(vehicle.price).toBeGreaterThanOrEqual(actualMinPrice);
                    expect(vehicle.price).toBeLessThanOrEqual(actualMaxPrice);
                    expect(vehicle.year).toBeGreaterThanOrEqual(actualMinYear);
                    expect(vehicle.year).toBeLessThanOrEqual(actualMaxYear);
                });
                // Verify the matching vehicle is in the results
                const foundMatching = results.vehicles.some(v => v.id === matchingVehicle.id);
                expect(foundMatching).toBe(true);
                // Verify the non-matching vehicles are NOT in the results
                const foundNonMatchingCat = results.vehicles.some(v => v.id === nonMatchingCategory.id);
                expect(foundNonMatchingCat).toBe(false);
                const foundNonMatchingPrice = results.vehicles.some(v => v.id === nonMatchingPrice.id);
                expect(foundNonMatchingPrice).toBe(false);
            }), { numRuns: 100 });
        });
    });
    // Feature: used-trucks-marketplace, Property 9: Search Result Relevance
    // Validates: Requirements 5.1
    describe('Property 9: Search Result Relevance', () => {
        test('search results match query in make, model, category, or description', () => {
            fc.assert(fc.property(fc.string({ minLength: 3, maxLength: 20 })
                .filter(s => s.trim().length >= 3)
                .filter(s => /^[a-zA-Z0-9]+$/.test(s)), // Only alphanumeric characters
            vehicleInputArbitrary, (searchTerm, baseData) => {
                // Ensure unique identifiers that don't contain the search term
                const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
                // Create a vehicle with the search term in make
                const vehicleWithMake = vehicleService.createVehicle({
                    ...baseData,
                    make: `${searchTerm}Make`,
                    model: `UniqueModel${uniqueId}1`,
                    descriptionJa: `テスト${uniqueId}1`,
                    descriptionEn: `Test${uniqueId}1`
                });
                // Create a vehicle with the search term in model
                const vehicleWithModel = vehicleService.createVehicle({
                    ...baseData,
                    make: `UniqueMake${uniqueId}2`,
                    model: `${searchTerm}Model`,
                    descriptionJa: `テスト${uniqueId}2`,
                    descriptionEn: `Test${uniqueId}2`
                });
                // Create a vehicle with the search term in description
                const vehicleWithDesc = vehicleService.createVehicle({
                    ...baseData,
                    make: `UniqueMake${uniqueId}3`,
                    model: `UniqueModel${uniqueId}3`,
                    descriptionJa: `${searchTerm}テスト車両`,
                    descriptionEn: `Test${uniqueId}3`
                });
                // Create a vehicle without the search term (using a completely different string)
                const vehicleWithout = vehicleService.createVehicle({
                    ...baseData,
                    make: `XYZMake${uniqueId}`,
                    model: `XYZModel${uniqueId}`,
                    descriptionJa: `XYZ説明${uniqueId}`,
                    descriptionEn: `XYZDescription${uniqueId}`
                });
                // Search for the term
                const results = vehicleService.searchVehicles(searchTerm);
                // Get the IDs of vehicles we just created
                const createdIds = [vehicleWithMake.id, vehicleWithModel.id, vehicleWithDesc.id, vehicleWithout.id];
                // Filter results to only include vehicles we created in this test
                const ourResults = results.filter(v => createdIds.includes(v.id));
                // Verify all our returned vehicles contain the search term in at least one field
                ourResults.forEach(vehicle => {
                    const matchesMake = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesModel = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesDescJa = vehicle.descriptionJa.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesDescEn = vehicle.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase());
                    expect(matchesMake || matchesModel || matchesDescJa || matchesDescEn).toBe(true);
                });
                // Verify the vehicles with the search term are in the results
                const resultIds = results.map(v => v.id);
                expect(resultIds).toContain(vehicleWithMake.id);
                expect(resultIds).toContain(vehicleWithModel.id);
                expect(resultIds).toContain(vehicleWithDesc.id);
                // Verify the vehicle without the search term is NOT in the results
                expect(resultIds).not.toContain(vehicleWithout.id);
            }), { numRuns: 100 });
        });
    });
    // Unit tests for validation edge cases
    // Validates: Requirements 1.2
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
        test('should reject vehicle with year before 1990', () => {
            const invalidVehicle = { ...validVehicleData, year: 1989 };
            expect(() => vehicleService.createVehicle(invalidVehicle)).toThrow();
        });
        test('should reject vehicle with year after current year + 1', () => {
            const currentYear = new Date().getFullYear();
            const invalidVehicle = { ...validVehicleData, year: currentYear + 2 };
            expect(() => vehicleService.createVehicle(invalidVehicle)).toThrow();
        });
        test('should accept vehicle with year equal to 1990', () => {
            const validVehicle = { ...validVehicleData, year: 1990 };
            const created = vehicleService.createVehicle(validVehicle);
            expect(created.year).toBe(1990);
        });
        test('should accept vehicle with year equal to current year + 1', () => {
            const currentYear = new Date().getFullYear();
            const validVehicle = { ...validVehicleData, year: currentYear + 1 };
            const created = vehicleService.createVehicle(validVehicle);
            expect(created.year).toBe(currentYear + 1);
        });
        test('should reject vehicle with price equal to 0', () => {
            const invalidVehicle = { ...validVehicleData, price: 0 };
            expect(() => vehicleService.createVehicle(invalidVehicle)).toThrow();
        });
        test('should reject vehicle with negative price', () => {
            const invalidVehicle = { ...validVehicleData, price: -1000 };
            expect(() => vehicleService.createVehicle(invalidVehicle)).toThrow();
        });
        test('should accept vehicle with price equal to 1', () => {
            const validVehicle = { ...validVehicleData, price: 1 };
            const created = vehicleService.createVehicle(validVehicle);
            expect(created.price).toBe(1);
        });
        test('should reject vehicle with negative mileage', () => {
            const invalidVehicle = { ...validVehicleData, mileage: -1 };
            expect(() => vehicleService.createVehicle(invalidVehicle)).toThrow();
        });
        test('should accept vehicle with mileage equal to 0', () => {
            const validVehicle = { ...validVehicleData, mileage: 0 };
            const created = vehicleService.createVehicle(validVehicle);
            expect(created.mileage).toBe(0);
        });
    });
    // Unit tests for search functionality
    // Validates: Requirements 5.4
    describe('Search Functionality', () => {
        test('should return empty array for non-existent search term', () => {
            const results = vehicleService.searchVehicles('nonexistent-xyz-123-unique-term');
            expect(results).toEqual([]);
        });
        test('should return empty array for empty search query', () => {
            const results = vehicleService.searchVehicles('');
            expect(results).toEqual([]);
        });
        test('should return empty array for whitespace-only search query', () => {
            const results = vehicleService.searchVehicles('   ');
            expect(results).toEqual([]);
        });
    });
});
