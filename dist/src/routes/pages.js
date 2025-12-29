"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PageService_1 = require("../services/PageService");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nanoid_1 = require("nanoid");
const router = (0, express_1.Router)();
const pageService = new PageService_1.PageService();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    },
});
/**
 * GET /api/pages
 * List all pages
 */
router.get('/', async (req, res) => {
    try {
        const pages = await pageService.listPages();
        res.json(pages);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list pages';
        res.status(500).json({
            error: {
                code: 'LIST_PAGES_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/pages/:id
 * Get a specific page by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid page ID'
                }
            });
            return;
        }
        const page = await pageService.getPage(id);
        if (!page) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Page not found'
                }
            });
            return;
        }
        res.json(page);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get page';
        res.status(500).json({
            error: {
                code: 'GET_PAGE_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/pages/slug/:slug
 * Get a page by slug
 */
router.get('/slug/:slug', async (req, res) => {
    try {
        const page = await pageService.getPageBySlug(req.params.slug);
        if (!page) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Page not found'
                }
            });
            return;
        }
        res.json(page);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get page';
        res.status(500).json({
            error: {
                code: 'GET_PAGE_ERROR',
                message
            }
        });
    }
});
/**
 * POST /api/pages
 * Create a new page (protected)
 */
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { slug, titleJa, titleEn, contentJa, contentEn, metaDescriptionJa, metaDescriptionEn, isPublished, showInNav } = req.body;
        if (!slug || !titleJa || !contentJa) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields: slug, titleJa, contentJa'
                }
            });
            return;
        }
        const page = await pageService.createPage({
            slug,
            titleJa,
            titleEn,
            contentJa,
            contentEn,
            metaDescriptionJa,
            metaDescriptionEn,
            isPublished,
            showInNav
        });
        res.status(201).json(page);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create page';
        const statusCode = message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'CREATE_PAGE_ERROR',
                message
            }
        });
    }
});
/**
 * PUT /api/pages/:id
 * Update a page (protected)
 */
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid page ID'
                }
            });
            return;
        }
        const { slug, titleJa, titleEn, contentJa, contentEn, metaDescriptionJa, metaDescriptionEn, isPublished, showInNav } = req.body;
        if (!slug || !titleJa || !contentJa) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields: slug, titleJa, contentJa'
                }
            });
            return;
        }
        const page = await pageService.updatePage(id, {
            slug,
            titleJa,
            titleEn,
            contentJa,
            contentEn,
            metaDescriptionJa,
            metaDescriptionEn,
            isPublished,
            showInNav
        });
        if (!page) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Page not found'
                }
            });
            return;
        }
        res.json(page);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update page';
        const statusCode = message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'UPDATE_PAGE_ERROR',
                message
            }
        });
    }
});
/**
 * DELETE /api/pages/:id
 * Delete a page (protected)
 */
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid page ID'
                }
            });
            return;
        }
        await pageService.deletePage(id);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete page';
        const statusCode = message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 404 ? 'NOT_FOUND' : 'DELETE_PAGE_ERROR',
                message
            }
        });
    }
});
/**
 * POST /api/pages/:id/featured-image
 * Upload featured image for a page (protected)
 */
router.post('/:id/featured-image', auth_1.authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid page ID'
                }
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No image file provided'
                }
            });
            return;
        }
        const page = await pageService.getPage(id);
        if (!page) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Page not found'
                }
            });
            return;
        }
        // Generate unique filename
        const uniqueId = (0, nanoid_1.nanoid)(6);
        const timestamp = Date.now();
        const ext = path_1.default.extname(req.file.originalname) || '.jpg';
        const filename = `page_${id}_${timestamp}_${uniqueId}${ext}`;
        // Ensure upload directories exist
        const uploadDir = path_1.default.join(__dirname, '../../uploads/images');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const imagePath = path_1.default.join(uploadDir, filename);
        // Process and save image
        await (0, sharp_1.default)(req.file.buffer)
            .resize(1200, 630, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 85 })
            .toFile(imagePath);
        // Delete old featured image if exists
        if (page.featuredImage) {
            const oldImagePath = path_1.default.join(__dirname, '../../uploads/images', path_1.default.basename(page.featuredImage));
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        // Update page with new featured image
        const imageUrl = `/uploads/images/${filename}`;
        const updatedPage = await pageService.updatePage(id, {
            ...page,
            featuredImage: imageUrl
        });
        res.json({
            message: 'Featured image uploaded successfully',
            imageUrl,
            page: updatedPage
        });
    }
    catch (error) {
        console.error('Featured image upload error:', error);
        const message = error instanceof Error ? error.message : 'Failed to upload featured image';
        res.status(500).json({
            error: {
                code: 'UPLOAD_ERROR',
                message
            }
        });
    }
});
/**
 * DELETE /api/pages/:id/featured-image
 * Delete featured image for a page (protected)
 */
router.delete('/:id/featured-image', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid page ID'
                }
            });
            return;
        }
        const page = await pageService.getPage(id);
        if (!page) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Page not found'
                }
            });
            return;
        }
        if (!page.featuredImage) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'No featured image to delete'
                }
            });
            return;
        }
        // Delete image file
        const imagePath = path_1.default.join(__dirname, '../../uploads/images', path_1.default.basename(page.featuredImage));
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlinkSync(imagePath);
        }
        // Update page to remove featured image
        const updatedPage = await pageService.updatePage(id, {
            ...page,
            featuredImage: undefined
        });
        res.json({
            message: 'Featured image deleted successfully',
            page: updatedPage
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete featured image';
        res.status(500).json({
            error: {
                code: 'DELETE_ERROR',
                message
            }
        });
    }
});
exports.default = router;
