"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const database_1 = require("../db/database");
const validation_1 = require("../models/validation");
const CategoryService_1 = require("./CategoryService");
class VehicleService {
    constructor() {
        this.categoryService = new CategoryService_1.CategoryService();
    }
    /**
     * Create a new vehicle
     * Requirements: 1.2, 9.1
     * @param data - Vehicle input data
     * @returns Created vehicle with ID
     */
    createVehicle(data) {
        // Validate input
        (0, validation_1.validateVehicleInputOrThrow)(data);
        // Get category ID from slug
        const category = this.categoryService.getCategoryBySlug(data.category);
        if (!category) {
            throw new Error(`Invalid category: ${data.category}`);
        }
        // Insert vehicle into database
        const stmt = database_1.db.prepare(`
      INSERT INTO vehicles (
        category_id, make, model, year, mileage, price,
        engine_type, length, width, height, condition,
        features, description_ja, description_en, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
        const result = stmt.run(category.id, data.make, data.model, data.year, data.mileage, data.price, data.engineType, data.dimensions.length, data.dimensions.width, data.dimensions.height, data.condition, JSON.stringify(data.features), data.descriptionJa, data.descriptionEn, data.status || 'available');
        const vehicleId = result.lastInsertRowid;
        // Retrieve and return the created vehicle
        const vehicle = this.getVehicle(vehicleId);
        if (!vehicle) {
            throw new Error('Failed to retrieve created vehicle');
        }
        return vehicle;
    }
    /**
     * Get a vehicle by ID
     * Requirements: 1.2, 9.1
     * @param id - Vehicle ID
     * @returns Vehicle object or null if not found
     */
    getVehicle(id) {
        const stmt = database_1.db.prepare(`
      SELECT 
        v.id,
        c.slug as category,
        v.make,
        v.model,
        v.year,
        v.mileage,
        v.price,
        v.engine_type as engineType,
        v.length,
        v.width,
        v.height,
        v.condition,
        v.features,
        v.description_ja as descriptionJa,
        v.description_en as descriptionEn,
        v.status,
        v.created_at as createdAt,
        v.updated_at as updatedAt
      FROM vehicles v
      JOIN categories c ON v.category_id = c.id
      WHERE v.id = ?
    `);
        const row = stmt.get(id);
        if (!row) {
            return null;
        }
        // Get vehicle images
        const imagesStmt = database_1.db.prepare(`
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
        const images = imagesStmt.all(id);
        // Parse features from JSON with error handling
        let features = [];
        try {
            features = row.features ? JSON.parse(row.features) : [];
        }
        catch (error) {
            console.error(`Failed to parse features for vehicle ${id}:`, error);
            features = [];
        }
        return {
            id: row.id,
            category: row.category,
            make: row.make,
            model: row.model,
            year: row.year,
            mileage: row.mileage,
            price: row.price,
            engineType: row.engineType,
            dimensions: {
                length: row.length,
                width: row.width,
                height: row.height
            },
            condition: row.condition,
            features,
            descriptionJa: row.descriptionJa,
            descriptionEn: row.descriptionEn,
            status: row.status || 'available',
            images: images.map(img => ({
                ...img,
                uploadedAt: new Date(img.uploadedAt)
            })),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
    /**
     * Update an existing vehicle
     * Requirements: 1.3, 9.1
     * @param id - Vehicle ID
     * @param data - Updated vehicle data
     * @returns Updated vehicle
     */
    updateVehicle(id, data) {
        // Validate input
        (0, validation_1.validateVehicleInputOrThrow)(data);
        // Check if vehicle exists
        const existing = this.getVehicle(id);
        if (!existing) {
            throw new Error(`Vehicle with ID ${id} not found`);
        }
        // Get category ID from slug
        const category = this.categoryService.getCategoryBySlug(data.category);
        if (!category) {
            throw new Error(`Invalid category: ${data.category}`);
        }
        // Update vehicle in database
        const stmt = database_1.db.prepare(`
      UPDATE vehicles SET
        category_id = ?,
        make = ?,
        model = ?,
        year = ?,
        mileage = ?,
        price = ?,
        engine_type = ?,
        length = ?,
        width = ?,
        height = ?,
        condition = ?,
        features = ?,
        description_ja = ?,
        description_en = ?,
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);
        stmt.run(category.id, data.make, data.model, data.year, data.mileage, data.price, data.engineType, data.dimensions.length, data.dimensions.width, data.dimensions.height, data.condition, JSON.stringify(data.features), data.descriptionJa, data.descriptionEn, data.status || 'available', id);
        // Retrieve and return the updated vehicle
        const vehicle = this.getVehicle(id);
        if (!vehicle) {
            throw new Error('Failed to retrieve updated vehicle');
        }
        return vehicle;
    }
    /**
     * Delete a vehicle
     * Requirements: 1.4
     * @param id - Vehicle ID
     */
    deleteVehicle(id) {
        // Check if vehicle exists
        const existing = this.getVehicle(id);
        if (!existing) {
            throw new Error(`Vehicle with ID ${id} not found`);
        }
        // Delete vehicle from database
        // Images will be cascade deleted due to foreign key constraint
        const stmt = database_1.db.prepare('DELETE FROM vehicles WHERE id = ?');
        stmt.run(id);
    }
    /**
     * List vehicles with optional filters and pagination
     * Requirements: 5.2, 11.2
     * @param filters - Filter and pagination options
     * @returns Paginated list of vehicles
     */
    listVehicles(filters) {
        const { category, minPrice, maxPrice, minYear, maxYear, page, pageSize } = filters;
        // Build WHERE clause
        const conditions = [];
        const params = [];
        if (category) {
            conditions.push('c.slug = ?');
            params.push(category);
        }
        if (minPrice !== undefined) {
            conditions.push('v.price >= ?');
            params.push(minPrice);
        }
        if (maxPrice !== undefined) {
            conditions.push('v.price <= ?');
            params.push(maxPrice);
        }
        if (minYear !== undefined) {
            conditions.push('v.year >= ?');
            params.push(minYear);
        }
        if (maxYear !== undefined) {
            conditions.push('v.year <= ?');
            params.push(maxYear);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Get total count
        const countStmt = database_1.db.prepare(`
      SELECT COUNT(*) as count
      FROM vehicles v
      JOIN categories c ON v.category_id = c.id
      ${whereClause}
    `);
        const { count } = countStmt.get(...params);
        // Get paginated results
        const offset = (page - 1) * pageSize;
        const listStmt = database_1.db.prepare(`
      SELECT v.id
      FROM vehicles v
      JOIN categories c ON v.category_id = c.id
      ${whereClause}
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `);
        const rows = listStmt.all(...params, pageSize, offset);
        // Get full vehicle details for each ID
        const vehicles = rows
            .map(row => this.getVehicle(row.id))
            .filter((v) => v !== null);
        return {
            vehicles,
            totalCount: count,
            page,
            pageSize
        };
    }
    /**
     * Search vehicles by text query
     * Requirements: 5.1
     * @param query - Search query string
     * @returns Array of matching vehicles
     */
    searchVehicles(query) {
        if (!query || query.trim().length === 0) {
            return [];
        }
        const searchTerm = `%${query.toLowerCase()}%`;
        // Search across make, model, category names, and descriptions
        const stmt = database_1.db.prepare(`
      SELECT DISTINCT v.id
      FROM vehicles v
      JOIN categories c ON v.category_id = c.id
      WHERE 
        LOWER(v.make) LIKE ? OR
        LOWER(v.model) LIKE ? OR
        LOWER(c.name_ja) LIKE ? OR
        LOWER(c.name_en) LIKE ? OR
        LOWER(v.description_ja) LIKE ? OR
        LOWER(v.description_en) LIKE ?
      ORDER BY v.created_at DESC
    `);
        const rows = stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        // Get full vehicle details for each ID
        const vehicles = rows
            .map(row => this.getVehicle(row.id))
            .filter((v) => v !== null);
        return vehicles;
    }
    /**
     * Get related vehicles based on category and price range
     * Requirements: Related vehicles suggestions
     * @param vehicleId - Current vehicle ID to exclude
     * @param category - Vehicle category
     * @param price - Vehicle price for range calculation
     * @param limit - Maximum number of related vehicles to return
     * @returns Array of related vehicles
     */
    getRelatedVehicles(vehicleId, category, price, limit = 4) {
        // Calculate price range (±30%)
        const minPrice = Math.floor(price * 0.7);
        const maxPrice = Math.ceil(price * 1.3);
        // Get vehicles in same category and similar price range
        const stmt = database_1.db.prepare(`
      SELECT DISTINCT v.id
      FROM vehicles v
      JOIN categories c ON v.category_id = c.id
      WHERE 
        v.id != ? AND
        c.slug = ? AND
        v.price BETWEEN ? AND ? AND
        v.status = 'available'
      ORDER BY ABS(v.price - ?) ASC
      LIMIT ?
    `);
        const rows = stmt.all(vehicleId, category, minPrice, maxPrice, price, limit);
        // If not enough vehicles in same category, get from other categories
        if (rows.length < limit) {
            const additionalStmt = database_1.db.prepare(`
        SELECT DISTINCT v.id
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        WHERE 
          v.id != ? AND
          c.slug != ? AND
          v.price BETWEEN ? AND ? AND
          v.status = 'available'
        ORDER BY ABS(v.price - ?) ASC
        LIMIT ?
      `);
            const additionalRows = additionalStmt.all(vehicleId, category, minPrice, maxPrice, price, limit - rows.length);
            rows.push(...additionalRows);
        }
        // Get full vehicle details for each ID
        const vehicles = rows
            .map(row => this.getVehicle(row.id))
            .filter((v) => v !== null);
        return vehicles;
    }
}
exports.VehicleService = VehicleService;
