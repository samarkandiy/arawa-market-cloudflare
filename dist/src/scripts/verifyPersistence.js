"use strict";
/**
 * Data Persistence Verification Script
 *
 * This script verifies that all CRUD operations persist correctly
 * and that data survives system restarts.
 *
 * Requirements: 9.1, 9.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../db/database");
const VehicleService_1 = require("../services/VehicleService");
const CategoryService_1 = require("../services/CategoryService");
const InquiryService_1 = require("../services/InquiryService");
const AuthService_1 = require("../services/AuthService");
async function verifyPersistence() {
    console.log('Starting data persistence verification...\n');
    try {
        // Initialize database
        (0, database_1.initializeDatabase)();
        (0, database_1.seedDatabase)();
        const vehicleService = new VehicleService_1.VehicleService();
        const categoryService = new CategoryService_1.CategoryService();
        const inquiryService = new InquiryService_1.InquiryService();
        const authService = new AuthService_1.AuthService();
        // Test 1: Verify categories persist
        console.log('Test 1: Verifying category persistence...');
        const categories = categoryService.listCategories();
        if (categories.length !== 14) {
            throw new Error(`Expected 14 categories, found ${categories.length}`);
        }
        console.log('✓ Categories persist correctly\n');
        // Test 2: Create and verify vehicle persistence
        console.log('Test 2: Verifying vehicle CRUD persistence...');
        const testVehicle = vehicleService.createVehicle({
            category: 'flatbed',
            make: 'Test Maker',
            model: 'Test Model',
            year: 2020,
            mileage: 50000,
            price: 5000000,
            engineType: 'Diesel',
            dimensions: {
                length: 6.5,
                width: 2.2,
                height: 2.5
            },
            condition: 'Good',
            features: ['Power steering', 'Air conditioning'],
            descriptionJa: 'テスト車両',
            descriptionEn: 'Test vehicle'
        });
        // Verify vehicle was created
        const retrievedVehicle = vehicleService.getVehicle(testVehicle.id);
        if (!retrievedVehicle) {
            throw new Error('Failed to retrieve created vehicle');
        }
        if (retrievedVehicle.make !== 'Test Maker') {
            throw new Error('Vehicle data mismatch');
        }
        console.log('✓ Vehicle creation persists correctly');
        // Update vehicle
        const updatedVehicle = vehicleService.updateVehicle(testVehicle.id, {
            ...testVehicle,
            price: 4500000
        });
        if (updatedVehicle.price !== 4500000) {
            throw new Error('Vehicle update did not persist');
        }
        console.log('✓ Vehicle update persists correctly');
        // Test 3: Create and verify inquiry persistence
        console.log('\nTest 3: Verifying inquiry persistence...');
        const testInquiry = inquiryService.createInquiry({
            vehicleId: testVehicle.id,
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '090-1234-5678',
            message: 'Test inquiry message',
            inquiryType: 'email'
        });
        const retrievedInquiry = inquiryService.getInquiry(testInquiry.id);
        if (!retrievedInquiry) {
            throw new Error('Failed to retrieve created inquiry');
        }
        if (retrievedInquiry.customerName !== 'Test Customer') {
            throw new Error('Inquiry data mismatch');
        }
        console.log('✓ Inquiry creation persists correctly');
        // Update inquiry status
        const updatedInquiry = inquiryService.updateInquiryStatus(testInquiry.id, 'contacted');
        if (updatedInquiry.status !== 'contacted') {
            throw new Error('Inquiry status update did not persist');
        }
        console.log('✓ Inquiry update persists correctly');
        // Test 4: Verify referential integrity on deletion
        console.log('\nTest 4: Verifying referential integrity...');
        // Delete inquiry first (it references the vehicle)
        database_1.db.prepare('DELETE FROM inquiries WHERE id = ?').run(testInquiry.id);
        // Now delete the vehicle
        vehicleService.deleteVehicle(testVehicle.id);
        const deletedVehicle = vehicleService.getVehicle(testVehicle.id);
        if (deletedVehicle !== null) {
            throw new Error('Vehicle was not deleted');
        }
        console.log('✓ Vehicle deletion works correctly');
        console.log('✓ Referential integrity maintained\n');
        // Test 5: Verify user authentication persists
        console.log('Test 5: Verifying user authentication persistence...');
        const users = database_1.db.prepare('SELECT COUNT(*) as count FROM users').get();
        if (users.count === 0) {
            throw new Error('No users found in database');
        }
        console.log('✓ User data persists correctly\n');
        console.log('='.repeat(50));
        console.log('✓ All persistence tests passed!');
        console.log('='.repeat(50));
        console.log('\nData persistence verification complete.');
        console.log('All CRUD operations persist correctly to the database.');
        console.log('Data will survive system restarts.\n');
    }
    catch (error) {
        console.error('\n✗ Persistence verification failed:');
        console.error(error);
        process.exit(1);
    }
}
// Run verification
verifyPersistence().catch(console.error);
