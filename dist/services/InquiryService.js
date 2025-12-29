"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryService = void 0;
const database_1 = require("../db/database");
const validation_1 = require("../models/validation");
class InquiryService {
    /**
     * Create a new inquiry
     * Requirements: 4.2, 4.3
     * @param data - Inquiry input data
     * @returns Created inquiry with ID
     */
    createInquiry(data) {
        // Validate input
        (0, validation_1.validateInquiryInputOrThrow)(data);
        // Verify vehicle exists
        const vehicleExists = database_1.db.prepare('SELECT id FROM vehicles WHERE id = ?').get(data.vehicleId);
        if (!vehicleExists) {
            throw new Error(`Vehicle with ID ${data.vehicleId} not found`);
        }
        // Insert inquiry into database
        const stmt = database_1.db.prepare(`
      INSERT INTO inquiries (
        vehicle_id, customer_name, customer_email, customer_phone,
        message, inquiry_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'new', datetime('now'))
    `);
        const result = stmt.run(data.vehicleId, data.customerName, data.customerEmail || null, data.customerPhone || null, data.message, data.inquiryType);
        const inquiryId = result.lastInsertRowid;
        // Retrieve and return the created inquiry
        const inquiry = this.getInquiry(inquiryId);
        if (!inquiry) {
            throw new Error('Failed to retrieve created inquiry');
        }
        return inquiry;
    }
    /**
     * Get an inquiry by ID
     * Requirements: 4.3
     * @param id - Inquiry ID
     * @returns Inquiry object or null if not found
     */
    getInquiry(id) {
        const stmt = database_1.db.prepare(`
      SELECT 
        id,
        vehicle_id as vehicleId,
        customer_name as customerName,
        customer_email as customerEmail,
        customer_phone as customerPhone,
        message,
        inquiry_type as inquiryType,
        status,
        created_at as createdAt
      FROM inquiries
      WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row) {
            return null;
        }
        return {
            id: row.id,
            vehicleId: row.vehicleId,
            customerName: row.customerName,
            customerEmail: row.customerEmail || '',
            customerPhone: row.customerPhone || '',
            message: row.message,
            inquiryType: row.inquiryType,
            status: row.status,
            createdAt: new Date(row.createdAt)
        };
    }
    /**
     * List inquiries with optional filters and pagination
     * Requirements: 4.3
     * @param filters - Filter and pagination options
     * @returns Paginated list of inquiries
     */
    listInquiries(filters) {
        const { status, vehicleId, page, pageSize } = filters;
        // Build WHERE clause
        const conditions = [];
        const params = [];
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        if (vehicleId !== undefined) {
            conditions.push('vehicle_id = ?');
            params.push(vehicleId);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Get total count
        const countStmt = database_1.db.prepare(`
      SELECT COUNT(*) as count
      FROM inquiries
      ${whereClause}
    `);
        const { count } = countStmt.get(...params);
        // Get paginated results
        const offset = (page - 1) * pageSize;
        const listStmt = database_1.db.prepare(`
      SELECT id
      FROM inquiries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
        const rows = listStmt.all(...params, pageSize, offset);
        // Get full inquiry details for each ID
        const inquiries = rows
            .map(row => this.getInquiry(row.id))
            .filter((i) => i !== null);
        return {
            inquiries,
            totalCount: count,
            page,
            pageSize
        };
    }
    /**
     * Update inquiry status
     * Requirements: 4.3
     * @param id - Inquiry ID
     * @param status - New status
     * @returns Updated inquiry
     */
    updateInquiryStatus(id, status) {
        // Check if inquiry exists
        const existing = this.getInquiry(id);
        if (!existing) {
            throw new Error(`Inquiry with ID ${id} not found`);
        }
        // Validate status
        const validStatuses = ['new', 'contacted', 'closed'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
        // Update inquiry status in database
        const stmt = database_1.db.prepare(`
      UPDATE inquiries SET
        status = ?
      WHERE id = ?
    `);
        stmt.run(status, id);
        // Retrieve and return the updated inquiry
        const inquiry = this.getInquiry(id);
        if (!inquiry) {
            throw new Error('Failed to retrieve updated inquiry');
        }
        return inquiry;
    }
}
exports.InquiryService = InquiryService;
