"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImageService_1 = require("../services/ImageService");
const auth_1 = require("../middleware/auth");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const imageService = new ImageService_1.ImageService();
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
exports.default = router;
