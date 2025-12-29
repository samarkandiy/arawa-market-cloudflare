"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageService = void 0;
const database_1 = require("../db/database");
class PageService {
    /**
     * List all pages
     * @returns Array of all pages
     */
    listPages() {
        const stmt = database_1.db.prepare(`
      SELECT 
        id,
        slug,
        title_ja as titleJa,
        title_en as titleEn,
        content_ja as contentJa,
        content_en as contentEn,
        meta_description_ja as metaDescriptionJa,
        meta_description_en as metaDescriptionEn,
        featured_image as featuredImage,
        is_published as isPublished,
        show_in_nav as showInNav,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pages
      ORDER BY slug
    `);
        const rows = stmt.all();
        return rows.map(row => ({
            ...row,
            isPublished: Boolean(row.isPublished),
            showInNav: Boolean(row.showInNav),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        }));
    }
    /**
     * Get a single page by ID
     * @param id - Page ID
     * @returns Page object or null if not found
     */
    getPage(id) {
        const stmt = database_1.db.prepare(`
      SELECT 
        id,
        slug,
        title_ja as titleJa,
        title_en as titleEn,
        content_ja as contentJa,
        content_en as contentEn,
        meta_description_ja as metaDescriptionJa,
        meta_description_en as metaDescriptionEn,
        featured_image as featuredImage,
        is_published as isPublished,
        show_in_nav as showInNav,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pages
      WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row) {
            return null;
        }
        return {
            ...row,
            isPublished: Boolean(row.isPublished),
            showInNav: Boolean(row.showInNav),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
    /**
     * Get a page by slug
     * @param slug - Page slug
     * @returns Page object or null if not found
     */
    getPageBySlug(slug) {
        const stmt = database_1.db.prepare(`
      SELECT 
        id,
        slug,
        title_ja as titleJa,
        title_en as titleEn,
        content_ja as contentJa,
        content_en as contentEn,
        meta_description_ja as metaDescriptionJa,
        meta_description_en as metaDescriptionEn,
        featured_image as featuredImage,
        is_published as isPublished,
        show_in_nav as showInNav,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pages
      WHERE slug = ?
    `);
        const row = stmt.get(slug);
        if (!row) {
            return null;
        }
        return {
            ...row,
            isPublished: Boolean(row.isPublished),
            showInNav: Boolean(row.showInNav),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
    /**
     * Create a new page
     * @param data - Page data
     * @returns Created page
     */
    createPage(data) {
        // Check if slug already exists
        const existing = this.getPageBySlug(data.slug);
        if (existing) {
            throw new Error(`Page with slug "${data.slug}" already exists`);
        }
        const stmt = database_1.db.prepare(`
      INSERT INTO pages (
        slug, title_ja, title_en, content_ja, content_en,
        meta_description_ja, meta_description_en, featured_image, is_published, show_in_nav
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.slug, data.titleJa, data.titleEn || null, data.contentJa, data.contentEn || null, data.metaDescriptionJa || null, data.metaDescriptionEn || null, data.featuredImage || null, data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : 1, data.showInNav !== undefined ? (data.showInNav ? 1 : 0) : 0);
        const id = result.lastInsertRowid;
        const page = this.getPage(id);
        if (!page) {
            throw new Error('Failed to retrieve created page');
        }
        return page;
    }
    /**
     * Update a page
     * @param id - Page ID
     * @param data - Updated page data
     * @returns Updated page or null if not found
     */
    updatePage(id, data) {
        // Check if page exists
        const existing = this.getPage(id);
        if (!existing) {
            return null;
        }
        // Check if slug is taken by another page
        const slugCheck = this.getPageBySlug(data.slug);
        if (slugCheck && slugCheck.id !== id) {
            throw new Error(`Page with slug "${data.slug}" already exists`);
        }
        // Preserve existing featured image if not provided in update
        const featuredImage = data.featuredImage !== undefined ? data.featuredImage : existing.featuredImage;
        const stmt = database_1.db.prepare(`
      UPDATE pages
      SET slug = ?, title_ja = ?, title_en = ?, content_ja = ?, content_en = ?,
          meta_description_ja = ?, meta_description_en = ?, featured_image = ?, is_published = ?,
          show_in_nav = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
        stmt.run(data.slug, data.titleJa, data.titleEn || null, data.contentJa, data.contentEn || null, data.metaDescriptionJa || null, data.metaDescriptionEn || null, featuredImage || null, data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : 1, data.showInNav !== undefined ? (data.showInNav ? 1 : 0) : 0, id);
        return this.getPage(id);
    }
    /**
     * Delete a page
     * @param id - Page ID
     */
    deletePage(id) {
        const existing = this.getPage(id);
        if (!existing) {
            throw new Error('Page not found');
        }
        const stmt = database_1.db.prepare('DELETE FROM pages WHERE id = ?');
        stmt.run(id);
    }
}
exports.PageService = PageService;
