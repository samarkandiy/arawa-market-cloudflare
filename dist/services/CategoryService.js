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
      SELECT id, name_ja as nameJa, name_en as nameEn, slug
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
      SELECT id, name_ja as nameJa, name_en as nameEn, slug
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
      SELECT id, name_ja as nameJa, name_en as nameEn, slug
      FROM categories
      WHERE slug = ?
    `);
        const result = stmt.get(slug);
        return result || null;
    }
}
exports.CategoryService = CategoryService;
