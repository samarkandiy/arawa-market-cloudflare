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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ImageService_1 = require("./ImageService");
const VehicleService_1 = require("./VehicleService");
const database_1 = require("../db/database");
const fc = __importStar(require("fast-check"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
// Test setup
beforeAll(() => {
    // Use in-memory database for tests
    process.env.DATABASE_PATH = ':memory:';
    (0, database_1.initializeDatabase)();
    (0, database_1.seedDatabase)();
});
beforeEach(() => {
    // Clean up test data before each test
    database_1.db.exec('DELETE FROM vehicle_images');
    database_1.db.exec('DELETE FROM vehicles');
});
afterAll(() => {
    // Clean up test uploads
    const uploadDir = process.env.UPLOAD_DIR || './uploads/images';
    const thumbnailDir = process.env.THUMBNAIL_DIR || './uploads/thumbnails';
    if (fs_1.default.existsSync(uploadDir)) {
        const files = fs_1.default.readdirSync(uploadDir);
        files.forEach(file => {
            fs_1.default.unlinkSync(path_1.default.join(uploadDir, file));
        });
    }
    if (fs_1.default.existsSync(thumbnailDir)) {
        const files = fs_1.default.readdirSync(thumbnailDir);
        files.forEach(file => {
            fs_1.default.unlinkSync(path_1.default.join(thumbnailDir, file));
        });
    }
});
// Helper function to create a test image buffer
async function createTestImageBuffer(width = 800, height = 600) {
    return await (0, sharp_1.default)({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
        }
    })
        .jpeg()
        .toBuffer();
}
// Helper function to create a test vehicle
function createTestVehicle(vehicleService) {
    return vehicleService.createVehicle({
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
    });
}
// Arbitrary for generating test image files
const testImageArbitrary = fc.record({
    width: fc.integer({ min: 100, max: 2000 }),
    height: fc.integer({ min: 100, max: 2000 }),
    filename: fc.string({ minLength: 5, maxLength: 20 }).map(s => `${s}.jpg`)
});
describe('ImageService', () => {
    let imageService;
    let vehicleService;
    beforeEach(() => {
        imageService = new ImageService_1.ImageService();
        vehicleService = new VehicleService_1.VehicleService();
    });
    // Feature: used-trucks-marketplace, Property 4: Image Association Integrity
    // Validates: Requirements 1.5, 9.4
    describe('Property 4: Image Association Integrity', () => {
        test('uploaded image should be correctly associated with vehicle and retrievable', async () => {
            await fc.assert(fc.asyncProperty(testImageArbitrary, async (imageSpec) => {
                // Create a test vehicle
                const vehicle = createTestVehicle(vehicleService);
                // Create test image buffer
                const buffer = await createTestImageBuffer(imageSpec.width, imageSpec.height);
                // Create uploaded file object
                const file = {
                    buffer,
                    originalname: imageSpec.filename,
                    mimetype: 'image/jpeg',
                    size: buffer.length
                };
                // Upload image
                const uploadedImage = await imageService.uploadImage(vehicle.id, file);
                // Verify image is associated with correct vehicle
                expect(uploadedImage.vehicleId).toBe(vehicle.id);
                // Retrieve image by ID
                const retrievedImage = imageService.getImage(uploadedImage.id);
                expect(retrievedImage).not.toBeNull();
                expect(retrievedImage.id).toBe(uploadedImage.id);
                expect(retrievedImage.vehicleId).toBe(vehicle.id);
                // Retrieve images through vehicle's image list
                const vehicleImages = imageService.listVehicleImages(vehicle.id);
                expect(vehicleImages.length).toBe(1);
                expect(vehicleImages[0].id).toBe(uploadedImage.id);
                expect(vehicleImages[0].vehicleId).toBe(vehicle.id);
                // Verify files exist on filesystem
                const uploadDir = process.env.UPLOAD_DIR || './uploads/images';
                const thumbnailDir = process.env.THUMBNAIL_DIR || './uploads/thumbnails';
                const imagePath = path_1.default.join(uploadDir, uploadedImage.filename);
                const thumbnailPath = path_1.default.join(thumbnailDir, `thumb_${uploadedImage.filename}`);
                expect(fs_1.default.existsSync(imagePath)).toBe(true);
                expect(fs_1.default.existsSync(thumbnailPath)).toBe(true);
                // Clean up
                imageService.deleteImage(uploadedImage.id);
            }), { numRuns: 100 });
        }, 60000); // Increase timeout for property test
    });
    // Feature: used-trucks-marketplace, Property 17: Image Optimization
    // Validates: Requirements 11.3
    describe('Property 17: Image Optimization', () => {
        test('uploaded image should generate both full-size and thumbnail with optimized file sizes', async () => {
            await fc.assert(fc.asyncProperty(fc.record({
                width: fc.integer({ min: 400, max: 2000 }), // Use larger images to avoid compression edge cases
                height: fc.integer({ min: 400, max: 2000 }),
                filename: fc.string({ minLength: 5, maxLength: 20 }).map(s => `${s}.jpg`)
            }), async (imageSpec) => {
                // Create a test vehicle
                const vehicle = createTestVehicle(vehicleService);
                // Create test image buffer
                const buffer = await createTestImageBuffer(imageSpec.width, imageSpec.height);
                const originalSize = buffer.length;
                // Create uploaded file object
                const file = {
                    buffer,
                    originalname: imageSpec.filename,
                    mimetype: 'image/jpeg',
                    size: buffer.length
                };
                // Upload image
                const uploadedImage = await imageService.uploadImage(vehicle.id, file);
                // Verify both full-size and thumbnail exist
                const uploadDir = process.env.UPLOAD_DIR || './uploads/images';
                const thumbnailDir = process.env.THUMBNAIL_DIR || './uploads/thumbnails';
                const imagePath = path_1.default.join(uploadDir, uploadedImage.filename);
                const thumbnailPath = path_1.default.join(thumbnailDir, `thumb_${uploadedImage.filename}`);
                expect(fs_1.default.existsSync(imagePath)).toBe(true);
                expect(fs_1.default.existsSync(thumbnailPath)).toBe(true);
                // Verify full-size image is optimized (JPEG format)
                const fullImageMetadata = await (0, sharp_1.default)(imagePath).metadata();
                expect(fullImageMetadata.format).toBe('jpeg');
                // Verify thumbnail is properly sized and optimized
                const thumbnailMetadata = await (0, sharp_1.default)(thumbnailPath).metadata();
                expect(thumbnailMetadata.format).toBe('jpeg');
                expect(thumbnailMetadata.width).toBeLessThanOrEqual(300);
                expect(thumbnailMetadata.height).toBeLessThanOrEqual(200);
                // Verify thumbnail is smaller than full-size image
                // (This holds true for images larger than the thumbnail dimensions)
                const fullImageSize = fs_1.default.statSync(imagePath).size;
                const thumbnailSize = fs_1.default.statSync(thumbnailPath).size;
                expect(thumbnailSize).toBeLessThan(fullImageSize);
                // Clean up
                imageService.deleteImage(uploadedImage.id);
            }), { numRuns: 100 });
        }, 60000); // Increase timeout for property test
    });
    // Feature: used-trucks-marketplace, Property 16: Referential Integrity on Deletion
    // Validates: Requirements 9.4
    describe('Property 16: Referential Integrity on Deletion', () => {
        test('deleting a vehicle should cascade delete all associated images', async () => {
            await fc.assert(fc.asyncProperty(fc.integer({ min: 1, max: 5 }), // Number of images to upload
            async (numImages) => {
                // Create a test vehicle
                const vehicle = createTestVehicle(vehicleService);
                // Upload multiple images
                const uploadedImages = [];
                for (let i = 0; i < numImages; i++) {
                    const buffer = await createTestImageBuffer(800, 600);
                    const file = {
                        buffer,
                        originalname: `test_${i}.jpg`,
                        mimetype: 'image/jpeg',
                        size: buffer.length
                    };
                    const image = await imageService.uploadImage(vehicle.id, file);
                    uploadedImages.push(image);
                }
                // Verify images exist
                const imagesBefore = imageService.listVehicleImages(vehicle.id);
                expect(imagesBefore.length).toBe(numImages);
                // Delete the vehicle
                vehicleService.deleteVehicle(vehicle.id);
                // Verify all images are cascade deleted from database
                for (const image of uploadedImages) {
                    const retrievedImage = imageService.getImage(image.id);
                    expect(retrievedImage).toBeNull();
                }
                // Verify vehicle images list is empty
                const imagesAfter = imageService.listVehicleImages(vehicle.id);
                expect(imagesAfter.length).toBe(0);
            }), { numRuns: 100 });
        }, 60000); // Increase timeout for property test
    });
    // Unit tests for edge cases
    describe('Edge Cases', () => {
        test('should reject invalid file format', async () => {
            const vehicle = createTestVehicle(vehicleService);
            const buffer = Buffer.from('not an image');
            const file = {
                buffer,
                originalname: 'test.txt',
                mimetype: 'text/plain',
                size: buffer.length
            };
            await expect(imageService.uploadImage(vehicle.id, file))
                .rejects.toThrow('Invalid file format');
        });
        test('should reject file exceeding size limit', async () => {
            const vehicle = createTestVehicle(vehicleService);
            // Create a buffer larger than 10MB
            const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
            const file = {
                buffer: largeBuffer,
                originalname: 'large.jpg',
                mimetype: 'image/jpeg',
                size: largeBuffer.length
            };
            await expect(imageService.uploadImage(vehicle.id, file))
                .rejects.toThrow('File size exceeds maximum allowed size');
        });
        test('should reject upload when maximum images per vehicle exceeded', async () => {
            const vehicle = createTestVehicle(vehicleService);
            // Upload 20 images (the maximum)
            for (let i = 0; i < 20; i++) {
                const buffer = await createTestImageBuffer(400, 300);
                const file = {
                    buffer,
                    originalname: `test_${i}.jpg`,
                    mimetype: 'image/jpeg',
                    size: buffer.length
                };
                await imageService.uploadImage(vehicle.id, file);
            }
            // Try to upload one more
            const buffer = await createTestImageBuffer(400, 300);
            const file = {
                buffer,
                originalname: 'test_21.jpg',
                mimetype: 'image/jpeg',
                size: buffer.length
            };
            await expect(imageService.uploadImage(vehicle.id, file))
                .rejects.toThrow('Maximum 20 images per vehicle exceeded');
            // Clean up
            const images = imageService.listVehicleImages(vehicle.id);
            images.forEach(img => imageService.deleteImage(img.id));
        }, 30000);
        test('should reject upload for non-existent vehicle', async () => {
            const buffer = await createTestImageBuffer(400, 300);
            const file = {
                buffer,
                originalname: 'test.jpg',
                mimetype: 'image/jpeg',
                size: buffer.length
            };
            await expect(imageService.uploadImage(99999, file))
                .rejects.toThrow('Vehicle with ID 99999 not found');
        });
    });
});
