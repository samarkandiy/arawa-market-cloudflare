"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const CategoryService_1 = require("../services/CategoryService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const categoryService = new CategoryService_1.CategoryService();
// Configure multer for SVG uploads (memory storage)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024, // 1MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/svg+xml') {
            cb(null, true);
        }
        else {
            cb(new Error('Only SVG files are allowed'));
        }
    },
});
/**
 * GET /api/categories
 * List all vehicle categories
 * Requirements: 2.1
 */
router.get('/', async (req, res) => {
    try {
        const categories = await categoryService.listCategories();
        res.json(categories);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list categories';
        res.status(500).json({
            error: {
                code: 'LIST_CATEGORIES_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/categories/:id
 * Get a specific category by ID
 * Requirements: 2.1
 */
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        const category = await categoryService.getCategory(id);
        if (!category) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found'
                }
            });
            return;
        }
        res.json(category);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get category';
        res.status(500).json({
            error: {
                code: 'GET_CATEGORY_ERROR',
                message
            }
        });
    }
});
/**
 * POST /api/categories
 * Create a new category (protected)
 */
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { nameJa, nameEn, slug, icon } = req.body;
        if (!nameJa || !nameEn || !slug) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields: nameJa, nameEn, slug'
                }
            });
            return;
        }
        const category = await categoryService.createCategory({ nameJa, nameEn, slug });
        // If icon is provided, update it
        if (icon && typeof icon === 'string' && icon.trim().startsWith('<svg')) {
            await categoryService.updateCategoryIcon(category.id, icon);
            const updatedCategory = await categoryService.getCategory(category.id);
            res.status(201).json(updatedCategory);
            return;
        }
        res.status(201).json(category);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create category';
        const statusCode = message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'CREATE_CATEGORY_ERROR',
                message
            }
        });
    }
});
/**
 * PUT /api/categories/:id
 * Update a category (protected)
 */
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID'
                }
            });
            return;
        }
        const { nameJa, nameEn, slug } = req.body;
        if (!nameJa || !nameEn || !slug) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields: nameJa, nameEn, slug'
                }
            });
            return;
        }
        const category = await categoryService.updateCategory(id, { nameJa, nameEn, slug });
        if (!category) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found'
                }
            });
            return;
        }
        res.json(category);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update category';
        const statusCode = message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'UPDATE_CATEGORY_ERROR',
                message
            }
        });
    }
});
/**
 * DELETE /api/categories/:id
 * Delete a category (protected)
 */
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID'
                }
            });
            return;
        }
        await categoryService.deleteCategory(id);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete category';
        const statusCode = message.includes('Cannot delete') || message.includes('not found') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'DELETE_CATEGORY_ERROR',
                message
            }
        });
    }
});
/**
 * POST /api/categories/:id/icon
 * Upload icon for a category (protected)
 */
router.post('/:id/icon', auth_1.authenticateToken, upload.single('icon'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID'
                }
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No icon file provided'
                }
            });
            return;
        }
        // Convert buffer to string (SVG is text-based)
        const iconSvg = req.file.buffer.toString('utf-8');
        // Basic SVG validation
        if (!iconSvg.trim().startsWith('<svg')) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid SVG file format'
                }
            });
            return;
        }
        const category = await categoryService.updateCategoryIcon(id, iconSvg);
        if (!category) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found'
                }
            });
            return;
        }
        res.json({
            message: 'Icon uploaded successfully',
            iconUrl: category.icon,
            category
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload icon';
        res.status(500).json({
            error: {
                code: 'UPLOAD_ICON_ERROR',
                message
            }
        });
    }
});
/**
 * DELETE /api/categories/:id/icon
 * Delete icon for a category (protected)
 */
router.delete('/:id/icon', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID'
                }
            });
            return;
        }
        const category = await categoryService.deleteCategoryIcon(id);
        if (!category) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found'
                }
            });
            return;
        }
        res.json({
            message: 'Icon deleted successfully',
            category
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete icon';
        res.status(500).json({
            error: {
                code: 'DELETE_ICON_ERROR',
                message
            }
        });
    }
});
exports.default = router;
