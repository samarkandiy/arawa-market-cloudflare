"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fc = __importStar(require("fast-check"));
const CategoryService_1 = require("./CategoryService");
const database_1 = require("../db/database");
describe('CategoryService', () => {
    let categoryService;
    beforeAll(() => {
        // Initialize database schema and seed categories
        (0, database_1.initializeDatabase)();
        (0, database_1.seedDatabase)();
    });
    beforeEach(() => {
        categoryService = new CategoryService_1.CategoryService();
    });
    afterAll(() => {
        // Clean up database connection
        database_1.db.close();
    });
    describe('listCategories', () => {
        it('should return all 14 categories', () => {
            const categories = categoryService.listCategories();
            expect(categories).toHaveLength(14);
        });
        it('should return categories with all required fields', () => {
            const categories = categoryService.listCategories();
            categories.forEach(category => {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('nameJa');
                expect(category).toHaveProperty('nameEn');
                expect(category).toHaveProperty('slug');
                expect(typeof category.id).toBe('number');
                expect(typeof category.nameJa).toBe('string');
                expect(typeof category.nameEn).toBe('string');
                expect(typeof category.slug).toBe('string');
            });
        });
    });
    describe('getCategory', () => {
        it('should return a category by valid ID', () => {
            const category = categoryService.getCategory(1);
            expect(category).not.toBeNull();
            expect(category?.id).toBe(1);
        });
        it('should return null for non-existent ID', () => {
            const category = categoryService.getCategory(9999);
            expect(category).toBeNull();
        });
    });
    describe('getCategoryBySlug', () => {
        it('should return a category by valid slug', () => {
            const category = categoryService.getCategoryBySlug('flatbed');
            expect(category).not.toBeNull();
            expect(category?.slug).toBe('flatbed');
        });
        it('should return null for non-existent slug', () => {
            const category = categoryService.getCategoryBySlug('non-existent');
            expect(category).toBeNull();
        });
    });
    // Feature: used-trucks-marketplace, Property 6: Bilingual Category Display
    // Validates: Requirements 2.3, 2.4
    describe('Property 6: Bilingual Category Display', () => {
        it('should display Japanese names for frontend and English names for CMS', () => {
            fc.assert(fc.property(fc.integer({ min: 1, max: 14 }), (categoryId) => {
                const category = categoryService.getCategory(categoryId);
                // Category should exist
                if (category === null) {
                    return true; // Skip if category doesn't exist
                }
                // Both Japanese and English names must be present and non-empty
                expect(category.nameJa).toBeTruthy();
                expect(category.nameEn).toBeTruthy();
                expect(category.nameJa.length).toBeGreaterThan(0);
                expect(category.nameEn.length).toBeGreaterThan(0);
                // Japanese name should contain Japanese characters (Hiragana, Katakana, or Kanji)
                const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(category.nameJa);
                expect(hasJapaneseChars).toBe(true);
                // English name should contain only ASCII characters (letters, spaces, slashes)
                const isEnglishOnly = /^[A-Za-z\s\/\-]+$/.test(category.nameEn);
                expect(isEnglishOnly).toBe(true);
                // Both names should refer to the same category (same ID and slug)
                expect(category.id).toBe(categoryId);
                expect(category.slug).toBeTruthy();
            }), { numRuns: 100 });
        });
        it('should maintain bilingual consistency across all categories', () => {
            fc.assert(fc.property(fc.constantFrom(...categoryService.listCategories().map(c => c.id)), (categoryId) => {
                const category = categoryService.getCategory(categoryId);
                if (category === null) {
                    return true;
                }
                // Verify the category can be retrieved and has both language versions
                const allCategories = categoryService.listCategories();
                const foundCategory = allCategories.find(c => c.id === categoryId);
                expect(foundCategory).toBeDefined();
                expect(foundCategory?.nameJa).toBe(category.nameJa);
                expect(foundCategory?.nameEn).toBe(category.nameEn);
                expect(foundCategory?.slug).toBe(category.slug);
            }), { numRuns: 100 });
        });
        it('should ensure all categories have unique slugs for both languages', () => {
            const categories = categoryService.listCategories();
            const slugs = categories.map(c => c.slug);
            const uniqueSlugs = new Set(slugs);
            // All slugs should be unique
            expect(uniqueSlugs.size).toBe(categories.length);
            // Each category should be retrievable by its slug
            categories.forEach(category => {
                const retrieved = categoryService.getCategoryBySlug(category.slug);
                expect(retrieved).not.toBeNull();
                expect(retrieved?.id).toBe(category.id);
                expect(retrieved?.nameJa).toBe(category.nameJa);
                expect(retrieved?.nameEn).toBe(category.nameEn);
            });
        });
    });
});
