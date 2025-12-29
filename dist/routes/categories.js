"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryService_1 = require("../services/CategoryService");
const router = (0, express_1.Router)();
const categoryService = new CategoryService_1.CategoryService();
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
exports.default = router;
