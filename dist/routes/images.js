"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImageService_1 = require("../services/ImageService");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const imageService = new ImageService_1.ImageService();
// Configure multer for image uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    }
});
/**
 * POST /api/vehicles/:id/images
 * Upload an image for a vehicle (protected)
 * Requirements: 1.5, 8.1
 */
router.post('/vehicles/:id/images', auth_1.authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const vehicleId = Number(req.params.id);
        if (isNaN(vehicleId)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid vehicle ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No image file provided',
                    details: { field: 'image', reason: 'Image file is required' }
                }
            });
            return;
        }
        const image = await imageService.uploadImage(vehicleId, req.file);
        res.status(201).json(image);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload image';
        const statusCode = message.includes('validation') || message.includes('invalid') || message.includes('maximum') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'UPLOAD_IMAGE_ERROR',
                message
            }
        });
    }
});
/**
 * DELETE /api/images/:id
 * Delete an image (protected)
 * Requirements: 1.5, 8.1
 */
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid image ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        await imageService.deleteImage(id);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete image';
        res.status(500).json({
            error: {
                code: 'DELETE_IMAGE_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/images/:filename
 * Serve an image file (public)
 * Requirements: 1.5
 */
router.get('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path_1.default.join(process.cwd(), 'uploads', 'images', filename);
        res.sendFile(imagePath, (err) => {
            if (err) {
                res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Image not found'
                    }
                });
            }
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to serve image';
        res.status(500).json({
            error: {
                code: 'SERVE_IMAGE_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/vehicles/:id/images
 * List all images for a vehicle (public)
 * Requirements: 1.5
 */
router.get('/vehicles/:id/images', async (req, res) => {
    try {
        const vehicleId = Number(req.params.id);
        if (isNaN(vehicleId)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid vehicle ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        const images = await imageService.listVehicleImages(vehicleId);
        res.json(images);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list images';
        res.status(500).json({
            error: {
                code: 'LIST_IMAGES_ERROR',
                message
            }
        });
    }
});
exports.default = router;
