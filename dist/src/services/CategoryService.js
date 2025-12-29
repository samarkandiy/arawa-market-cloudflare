"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const database_1 = require("../db/database");
class CategoryService {
    /**
     * List all categories
     * @returns Array of all categories with Japanese and English names
     */
    listCategories() {
        const stmt = database_1.db.prepare(`
      SELECT id, name_ja as nameJa, name_en as nameEn, slug, icon
      FROM categories
      ORDER BY id
    `);
        return stmt.all();
    }
    /**
     * Get a single category by ID
     * @param id - Category ID
     * @returns Category object or null if not found
     */
    getCategory(id) {
        const stmt = database_1.db.prepare(`
      SELECT id, name_ja as nameJa, name_en as nameEn, slug, icon
      FROM categories
      WHERE id = ?
    `);
        const result = stmt.get(id);
        return result || null;
    }
    /**
     * Get a category by slug
     * @param slug - Category slug
     * @returns Category object or null if not found
     */
    getCategoryBySlug(slug) {
        const stmt = database_1.db.prepare(`
      SELECT id, name_ja as nameJa, name_en as nameEn, slug, icon
      FROM categories
      WHERE slug = ?
    `);
        const result = stmt.get(slug);
        return result || null;
    }
    /**
     * Create a new category
     * @param data - Category data
     * @returns Created category
     */
    createCategory(data) {
        // Check if slug already exists
        const existing = this.getCategoryBySlug(data.slug);
        if (existing) {
            throw new Error(`Category with slug "${data.slug}" already exists`);
        }
        const stmt = database_1.db.prepare(`
      INSERT INTO categories (name_ja, name_en, slug)
      VALUES (?, ?, ?)
    `);
        const result = stmt.run(data.nameJa, data.nameEn, data.slug);
        const id = result.lastInsertRowid;
        const category = this.getCategory(id);
        if (!category) {
            throw new Error('Failed to retrieve created category');
        }
        return category;
    }
    /**
     * Update a category
     * @param id - Category ID
     * @param data - Updated category data
     * @returns Updated category or null if not found
     */
    updateCategory(id, data) {
        // Check if category exists
        const existing = this.getCategory(id);
        if (!existing) {
            return null;
        }
        // Check if slug is taken by another category
        const slugCheck = this.getCategoryBySlug(data.slug);
        if (slugCheck && slugCheck.id !== id) {
            throw new Error(`Category with slug "${data.slug}" already exists`);
        }
        const stmt = database_1.db.prepare(`
      UPDATE categories
      SET name_ja = ?, name_en = ?, slug = ?
      WHERE id = ?
    `);
        stmt.run(data.nameJa, data.nameEn, data.slug, id);
        return this.getCategory(id);
    }
    /**
     * Delete a category
     * @param id - Category ID
     */
    deleteCategory(id) {
        // Check if category exists
        const existing = this.getCategory(id);
        if (!existing) {
            throw new Error('Category not found');
        }
        // Check if any vehicles use this category
        const vehicleCount = database_1.db.prepare(`
      SELECT COUNT(*) as count FROM vehicles WHERE category_id = ?
    `).get(id);
        if (vehicleCount.count > 0) {
            throw new Error(`Cannot delete category: ${vehicleCount.count} vehicle(s) are using this category`);
        }
        const stmt = database_1.db.prepare('DELETE FROM categories WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Update category icon
     * @param id - Category ID
     * @param iconSvg - SVG content as string
     * @returns Updated category or null if not found
     */
    updateCategoryIcon(id, iconSvg) {
        // Check if category exists
        const existing = this.getCategory(id);
        if (!existing) {
            return null;
        }
        const stmt = database_1.db.prepare(`
      UPDATE categories
      SET icon = ?
      WHERE id = ?
    `);
        stmt.run(iconSvg, id);
        return this.getCategory(id);
    }
    /**
     * Delete category icon
     * @param id - Category ID
     * @returns Updated category or null if not found
     */
    deleteCategoryIcon(id) {
        // Check if category exists
        const existing = this.getCategory(id);
        if (!existing) {
            return null;
        }
        const stmt = database_1.db.prepare(`
      UPDATE categories
      SET icon = NULL
      WHERE id = ?
    `);
        stmt.run(id);
        return this.getCategory(id);
    }
}
exports.CategoryService = CategoryService;
