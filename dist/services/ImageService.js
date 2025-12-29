"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const database_1 = require("../db/database");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/images';
const THUMBNAIL_DIR = process.env.THUMBNAIL_DIR || './uploads/thumbnails';
const MAX_IMAGES_PER_VEHICLE = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 200;
// Ensure upload directories exist
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs_1.default.existsSync(THUMBNAIL_DIR)) {
    fs_1.default.mkdirSync(THUMBNAIL_DIR, { recursive: true });
}
class ImageService {
    /**
     * Upload and optimize an image for a vehicle
     * Requirements: 1.5, 11.3
     * @param vehicleId - ID of the vehicle
     * @param file - Uploaded file object
     * @returns Created VehicleImage record
     */
    async uploadImage(vehicleId, file) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        // Validate file format
        const fileExt = path_1.default.extname(file.originalname).toLowerCase().slice(1);
        if (!ALLOWED_FORMATS.includes(fileExt) && !ALLOWED_FORMATS.includes(file.mimetype.split('/')[1])) {
            throw new Error(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
        }
        // Check if vehicle exists
        const vehicleExists = database_1.db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
        if (!vehicleExists) {
            throw new Error(`Vehicle with ID ${vehicleId} not found`);
        }
        // Check maximum images per vehicle
        const imageCount = database_1.db.prepare('SELECT COUNT(*) as count FROM vehicle_images WHERE vehicle_id = ?').get(vehicleId);
        if (imageCount.count >= MAX_IMAGES_PER_VEHICLE) {
            throw new Error(`Maximum ${MAX_IMAGES_PER_VEHICLE} images per vehicle exceeded`);
        }
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filename = `vehicle_${vehicleId}_${timestamp}_${randomStr}.jpg`;
        const thumbnailFilename = `thumb_${filename}`;
        const imagePath = path_1.default.join(UPLOAD_DIR, filename);
        const thumbnailPath = path_1.default.join(THUMBNAIL_DIR, thumbnailFilename);
        try {
            // Optimize and save full-size image
            await (0, sharp_1.default)(file.buffer)
                .jpeg({ quality: 85, progressive: true })
                .toFile(imagePath);
            // Generate and save thumbnail
            await (0, sharp_1.default)(file.buffer)
                .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
                fit: 'cover',
                position: 'center'
            })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
            // Get next display order
            const maxOrderResult = database_1.db.prepare('SELECT COALESCE(MAX(display_order), -1) as maxOrder FROM vehicle_images WHERE vehicle_id = ?').get(vehicleId);
            const nextOrder = maxOrderResult.maxOrder + 1;
            // Insert image record into database
            const stmt = database_1.db.prepare(`
        INSERT INTO vehicle_images (
          vehicle_id, filename, url, thumbnail_url, display_order, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
            const result = stmt.run(vehicleId, filename, `/images/${filename}`, `/thumbnails/${thumbnailFilename}`, nextOrder);
            const imageId = result.lastInsertRowid;
            // Retrieve and return the created image record
            const image = this.getImage(imageId);
            if (!image) {
                throw new Error('Failed to retrieve created image');
            }
            return image;
        }
        catch (error) {
            // Clean up files if database insert fails
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
            if (fs_1.default.existsSync(thumbnailPath)) {
                fs_1.default.unlinkSync(thumbnailPath);
            }
            throw error;
        }
    }
    /**
     * Get an image by ID
     * @param id - Image ID
     * @returns VehicleImage or null if not found
     */
    getImage(id) {
        const stmt = database_1.db.prepare(`
      SELECT 
        id,
        vehicle_id as vehicleId,
        filename,
        url,
        thumbnail_url as thumbnailUrl,
        display_order as "order",
        uploaded_at as uploadedAt
      FROM vehicle_images
      WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row) {
            return null;
        }
        return {
            id: row.id,
            vehicleId: row.vehicleId,
            filename: row.filename,
            url: row.url,
            thumbnailUrl: row.thumbnailUrl,
            order: row.order,
            uploadedAt: new Date(row.uploadedAt)
        };
    }
    /**
     * Delete an image
     * Requirements: 1.5
     * @param id - Image ID
     */
    deleteImage(id) {
        // Get image details
        const image = this.getImage(id);
        if (!image) {
            throw new Error(`Image with ID ${id} not found`);
        }
        // Delete files from filesystem
        const imagePath = path_1.default.join(UPLOAD_DIR, image.filename);
        const thumbnailFilename = `thumb_${image.filename}`;
        const thumbnailPath = path_1.default.join(THUMBNAIL_DIR, thumbnailFilename);
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlinkSync(imagePath);
        }
        if (fs_1.default.existsSync(thumbnailPath)) {
            fs_1.default.unlinkSync(thumbnailPath);
        }
        // Delete from database
        const stmt = database_1.db.prepare('DELETE FROM vehicle_images WHERE id = ?');
        stmt.run(id);
    }
    /**
     * List all images for a vehicle
     * Requirements: 1.5
     * @param vehicleId - Vehicle ID
     * @returns Array of VehicleImage objects
     */
    listVehicleImages(vehicleId) {
        const stmt = database_1.db.prepare(`
      SELECT 
        id,
        vehicle_id as vehicleId,
        filename,
        url,
        thumbnail_url as thumbnailUrl,
        display_order as "order",
        uploaded_at as uploadedAt
      FROM vehicle_images
      WHERE vehicle_id = ?
      ORDER BY display_order
    `);
        const rows = stmt.all(vehicleId);
        return rows.map(row => ({
            id: row.id,
            vehicleId: row.vehicleId,
            filename: row.filename,
            url: row.url,
            thumbnailUrl: row.thumbnailUrl,
            order: row.order,
            uploadedAt: new Date(row.uploadedAt)
        }));
    }
}
exports.ImageService = ImageService;
