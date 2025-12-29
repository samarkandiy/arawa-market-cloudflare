"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InquiryService_1 = require("../services/InquiryService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const inquiryService = new InquiryService_1.InquiryService();
/**
 * POST /api/inquiries
 * Submit a new inquiry (public)
 * Requirements: 4.2
 */
router.post('/', async (req, res) => {
    try {
        const inquiry = await inquiryService.createInquiry(req.body);
        res.status(201).json(inquiry);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create inquiry';
        // Check if it's a validation error
        const isValidationError = error.errors ||
            message.includes('validation') ||
            message.includes('invalid') ||
            message.includes('required');
        const statusCode = isValidationError ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'CREATE_INQUIRY_ERROR',
                message,
                details: error.errors || {}
            }
        });
    }
});
/**
 * GET /api/inquiries
 * List inquiries with filters (protected)
 * Requirements: 4.3, 8.1
 */
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            vehicleId: req.query.vehicleId ? Number(req.query.vehicleId) : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20
        };
        const result = await inquiryService.listInquiries(filters);
        res.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list inquiries';
        res.status(500).json({
            error: {
                code: 'LIST_INQUIRIES_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/inquiries/:id
 * Get a specific inquiry by ID (protected)
 * Requirements: 4.3, 8.1
 */
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid inquiry ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        const inquiry = await inquiryService.getInquiry(id);
        if (!inquiry) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Inquiry not found'
                }
            });
            return;
        }
        res.json(inquiry);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get inquiry';
        res.status(500).json({
            error: {
                code: 'GET_INQUIRY_ERROR',
                message
            }
        });
    }
});
/**
 * PUT /api/inquiries/:id
 * Update inquiry status (protected)
 * Requirements: 4.3, 8.1
 */
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid inquiry ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        const { status } = req.body;
        if (!status) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Status is required',
                    details: { field: 'status', reason: 'Status field is required' }
                }
            });
            return;
        }
        const inquiry = await inquiryService.updateInquiryStatus(id, status);
        if (!inquiry) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Inquiry not found'
                }
            });
            return;
        }
        res.json(inquiry);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update inquiry';
        const statusCode = message.includes('validation') || message.includes('invalid') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'UPDATE_INQUIRY_ERROR',
                message
            }
        });
    }
});
exports.default = router;
