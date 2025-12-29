"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VehicleService_1 = require("../services/VehicleService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const vehicleService = new VehicleService_1.VehicleService();
/**
 * GET /api/vehicles
 * List vehicles with filters and pagination
 * Requirements: 1.2, 2.2, 5.2, 6.1
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            minYear: req.query.minYear ? Number(req.query.minYear) : undefined,
            maxYear: req.query.maxYear ? Number(req.query.maxYear) : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20
        };
        const result = await vehicleService.listVehicles(filters);
        res.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list vehicles';
        res.status(500).json({
            error: {
                code: 'LIST_VEHICLES_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/vehicles/search
 * Search vehicles by query string
 * Requirements: 5.1
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Search query is required',
                    details: { field: 'q', reason: 'Query parameter "q" is required' }
                }
            });
            return;
        }
        const results = await vehicleService.searchVehicles(query);
        res.json(results);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to search vehicles';
        res.status(500).json({
            error: {
                code: 'SEARCH_VEHICLES_ERROR',
                message
            }
        });
    }
});
/**
 * GET /api/vehicles/:id
 * Get vehicle details by ID
 * Requirements: 6.1
 */
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid vehicle ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        const vehicle = await vehicleService.getVehicle(id);
        if (!vehicle) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Vehicle not found'
                }
            });
            return;
        }
        res.json(vehicle);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get vehicle';
        res.status(500).json({
            error: {
                code: 'GET_VEHICLE_ERROR',
                message
            }
        });
    }
});
/**
 * POST /api/vehicles
 * Create a new vehicle (protected)
 * Requirements: 1.2, 8.1
 */
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const vehicle = await vehicleService.createVehicle(req.body);
        res.status(201).json(vehicle);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create vehicle';
        const statusCode = message.includes('validation') || message.includes('invalid') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'CREATE_VEHICLE_ERROR',
                message
            }
        });
    }
});
/**
 * PUT /api/vehicles/:id
 * Update a vehicle (protected)
 * Requirements: 1.3, 8.1
 */
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid vehicle ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        const vehicle = await vehicleService.updateVehicle(id, req.body);
        if (!vehicle) {
            res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Vehicle not found'
                }
            });
            return;
        }
        res.json(vehicle);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update vehicle';
        const statusCode = message.includes('validation') || message.includes('invalid') ? 400 : 500;
        res.status(statusCode).json({
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'UPDATE_VEHICLE_ERROR',
                message
            }
        });
    }
});
/**
 * DELETE /api/vehicles/:id
 * Delete a vehicle (protected)
 * Requirements: 1.4, 8.1
 */
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid vehicle ID',
                    details: { field: 'id', reason: 'ID must be a number' }
                }
            });
            return;
        }
        await vehicleService.deleteVehicle(id);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete vehicle';
        res.status(500).json({
            error: {
                code: 'DELETE_VEHICLE_ERROR',
                message
            }
        });
    }
});
exports.default = router;
