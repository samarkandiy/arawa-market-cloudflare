"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.seedDatabase = seedDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DB_PATH = process.env.DATABASE_PATH || './data/marketplace.db';
// Ensure data directory exists
const dataDir = path_1.default.dirname(DB_PATH);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Initialize database connection
exports.db = new better_sqlite3_1.default(DB_PATH);
// Enable foreign keys
exports.db.pragma('foreign_keys = ON');
// Initialize database schema
function initializeDatabase() {
    // Users table for CMS authentication
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Vehicle categories
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ja TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    )
  `);
    // Vehicles table
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      price INTEGER NOT NULL,
      engine_type TEXT,
      length REAL,
      width REAL,
      height REAL,
      condition TEXT,
      features TEXT,
      description_ja TEXT,
      description_en TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);
    // Vehicle images
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS vehicle_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    )
  `);
    // Customer inquiries
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      message TEXT NOT NULL,
      inquiry_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
  `);
    // Create indexes for performance
    exports.db.exec(`
    CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category_id);
    CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
    CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_vehicle ON inquiries(vehicle_id);
  `);
    console.log('Database schema initialized successfully');
}
// Seed initial data
function seedDatabase() {
    // Check if categories already exist
    const categoryCount = exports.db.prepare('SELECT COUNT(*) as count FROM categories').get();
    if (categoryCount.count === 0) {
        const categories = [
            { nameJa: '平ボディ', nameEn: 'Flatbed', slug: 'flatbed' },
            { nameJa: 'ダンプ', nameEn: 'Dump', slug: 'dump' },
            { nameJa: 'クレーン', nameEn: 'Crane', slug: 'crane' },
            { nameJa: 'バン・ウィング', nameEn: 'Van/Wing', slug: 'van-wing' },
            { nameJa: '冷凍車', nameEn: 'Refrigerated', slug: 'refrigerated' },
            { nameJa: 'アームロール・フックロール', nameEn: 'Arm Roll/Hook Roll', slug: 'arm-roll' },
            { nameJa: 'キャリアカー・ローダー', nameEn: 'Carrier/Loader', slug: 'carrier' },
            { nameJa: 'パッカー車', nameEn: 'Garbage Truck', slug: 'garbage' },
            { nameJa: 'ミキサー車', nameEn: 'Mixer', slug: 'mixer' },
            { nameJa: 'タンク車', nameEn: 'Tank', slug: 'tank' },
            { nameJa: '高所作業車', nameEn: 'Aerial Work Platform', slug: 'aerial' },
            { nameJa: '特殊車両', nameEn: 'Special Vehicles', slug: 'special' },
            { nameJa: 'バス', nameEn: 'Bus', slug: 'bus' },
            { nameJa: 'ベース車輛・その他', nameEn: 'Base Vehicle/Other', slug: 'other' }
        ];
        const insertCategory = exports.db.prepare('INSERT INTO categories (name_ja, name_en, slug) VALUES (?, ?, ?)');
        const insertMany = exports.db.transaction((categories) => {
            for (const category of categories) {
                insertCategory.run(category.nameJa, category.nameEn, category.slug);
            }
        });
        insertMany(categories);
        console.log('Categories seeded successfully');
    }
    // Seed admin user using dedicated function
    const { seedAdminUser } = require('./seedAdminUser');
    seedAdminUser();
}
// Close database connection
function closeDatabase() {
    exports.db.close();
}
