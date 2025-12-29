"use strict";
/**
 * Data Persistence Tests
 *
 * Tests that data persists across system restarts
 * Validates: Requirements 9.3
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
describe('Data Persistence After Restart', () => {
    const TEST_DB_PATH = './data/test-persistence-restart.db';
    beforeEach(() => {
        // Clean up test database before each test
        if (fs_1.default.existsSync(TEST_DB_PATH)) {
            fs_1.default.unlinkSync(TEST_DB_PATH);
        }
    });
    afterAll(() => {
        // Clean up test database
        if (fs_1.default.existsSync(TEST_DB_PATH)) {
            fs_1.default.unlinkSync(TEST_DB_PATH);
        }
    });
    function initializeTestDatabase(db) {
        db.pragma('foreign_keys = ON');
        // Create schema
        db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ja TEXT NOT NULL,
        name_en TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL
      )
    `);
        db.exec(`
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
        db.exec(`
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
        db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Seed categories
        const insertCategory = db.prepare('INSERT INTO categories (name_ja, name_en, slug) VALUES (?, ?, ?)');
        insertCategory.run('平ボディ', 'Flatbed', 'flatbed');
        insertCategory.run('ダンプ', 'Dump', 'dump');
        insertCategory.run('クレーン', 'Crane', 'crane');
    }
    test('vehicle data persists across system restart', () => {
        // Phase 1: Create data and close connection
        let db = new better_sqlite3_1.default(TEST_DB_PATH);
        initializeTestDatabase(db);
        const insertVehicle = db.prepare(`
      INSERT INTO vehicles (
        category_id, make, model, year, mileage, price,
        engine_type, length, width, height, condition, features,
        description_ja, description_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = insertVehicle.run(1, // flatbed category
        'Isuzu', 'Forward', 2018, 75000, 3500000, 'Diesel 6HK1', 7.2, 2.3, 2.6, 'Excellent', JSON.stringify(['Power steering', 'Air conditioning', 'ABS']), 'テスト用トラック', 'Test truck');
        const vehicleId = result.lastInsertRowid;
        // Close database (simulate system shutdown)
        db.close();
        // Phase 2: Reopen database (simulate system restart)
        db = new better_sqlite3_1.default(TEST_DB_PATH);
        db.pragma('foreign_keys = ON');
        // Verify data persists
        const stmt = db.prepare(`
      SELECT 
        v.id,
        v.make,
        v.model,
        v.price,
        c.slug as category
      FROM vehicles v
      JOIN categories c ON v.category_id = c.id
      WHERE v.id = ?
    `);
        const row = stmt.get(vehicleId);
        expect(row).toBeDefined();
        expect(row.id).toBe(vehicleId);
        expect(row.make).toBe('Isuzu');
        expect(row.model).toBe('Forward');
        expect(row.price).toBe(3500000);
        expect(row.category).toBe('flatbed');
        db.close();
    });
    test('inquiry data persists across system restart', () => {
        // Phase 1: Create data and close connection
        let db = new better_sqlite3_1.default(TEST_DB_PATH);
        initializeTestDatabase(db);
        // Create vehicle first
        const insertVehicle = db.prepare(`
      INSERT INTO vehicles (
        category_id, make, model, year, mileage, price,
        engine_type, condition, features, description_ja, description_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const vehicleResult = insertVehicle.run(2, // dump category
        'Hino', 'Ranger', 2019, 50000, 4000000, 'Diesel', 'Good', JSON.stringify(['Hydraulic dump']), 'ダンプトラック', 'Dump truck');
        const vehicleId = vehicleResult.lastInsertRowid;
        // Create inquiry
        const insertInquiry = db.prepare(`
      INSERT INTO inquiries (
        vehicle_id, customer_name, customer_email, customer_phone,
        message, inquiry_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const inquiryResult = insertInquiry.run(vehicleId, '田中太郎', 'tanaka@example.com', '090-1234-5678', 'この車両について詳しく教えてください', 'email', 'new');
        const inquiryId = inquiryResult.lastInsertRowid;
        // Close database (simulate system shutdown)
        db.close();
        // Phase 2: Reopen database (simulate system restart)
        db = new better_sqlite3_1.default(TEST_DB_PATH);
        db.pragma('foreign_keys = ON');
        // Verify inquiry data persists
        const stmt = db.prepare(`
      SELECT 
        id,
        vehicle_id as vehicleId,
        customer_name as customerName,
        customer_email as customerEmail,
        message,
        status
      FROM inquiries
      WHERE id = ?
    `);
        const row = stmt.get(inquiryId);
        expect(row).toBeDefined();
        expect(row.id).toBe(inquiryId);
        expect(row.vehicleId).toBe(vehicleId);
        expect(row.customerName).toBe('田中太郎');
        expect(row.customerEmail).toBe('tanaka@example.com');
        expect(row.status).toBe('new');
        db.close();
    });
    test('updated vehicle data persists across system restart', () => {
        // Phase 1: Create and update data
        let db = new better_sqlite3_1.default(TEST_DB_PATH);
        initializeTestDatabase(db);
        const insertVehicle = db.prepare(`
      INSERT INTO vehicles (
        category_id, make, model, year, mileage, price,
        engine_type, condition, features, description_ja, description_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = insertVehicle.run(3, // crane category
        'Mitsubishi', 'Canter', 2017, 60000, 5000000, 'Diesel', 'Good', JSON.stringify(['Crane', 'Stabilizers']), 'クレーン付きトラック', 'Truck with crane');
        const vehicleId = result.lastInsertRowid;
        // Update the vehicle
        const updateVehicle = db.prepare('UPDATE vehicles SET price = ? WHERE id = ?');
        updateVehicle.run(4500000, vehicleId);
        // Close database (simulate system shutdown)
        db.close();
        // Phase 2: Reopen database (simulate system restart)
        db = new better_sqlite3_1.default(TEST_DB_PATH);
        db.pragma('foreign_keys = ON');
        // Verify updated data persists
        const stmt = db.prepare('SELECT price FROM vehicles WHERE id = ?');
        const row = stmt.get(vehicleId);
        expect(row).toBeDefined();
        expect(row.price).toBe(4500000);
        db.close();
    });
    test('category data persists across system restart', () => {
        // Phase 1: Initialize database with categories
        let db = new better_sqlite3_1.default(TEST_DB_PATH);
        initializeTestDatabase(db);
        // Close database (simulate system shutdown)
        db.close();
        // Phase 2: Reopen database (simulate system restart)
        db = new better_sqlite3_1.default(TEST_DB_PATH);
        db.pragma('foreign_keys = ON');
        // Verify categories persist
        const stmt = db.prepare('SELECT COUNT(*) as count FROM categories');
        const row = stmt.get();
        expect(row.count).toBe(3); // We seeded 3 categories in test
        // Verify specific category data
        const categoryStmt = db.prepare(`
      SELECT name_ja, name_en, slug 
      FROM categories 
      WHERE slug = ?
    `);
        const flatbed = categoryStmt.get('flatbed');
        expect(flatbed).toBeDefined();
        expect(flatbed.name_ja).toBe('平ボディ');
        expect(flatbed.name_en).toBe('Flatbed');
        db.close();
    });
    test('user authentication data persists across system restart', () => {
        // Phase 1: Create user data
        let db = new better_sqlite3_1.default(TEST_DB_PATH);
        initializeTestDatabase(db);
        const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, ?)
    `);
        insertUser.run('admin', 'hashed_password_123', 'admin');
        // Close database (simulate system shutdown)
        db.close();
        // Phase 2: Reopen database (simulate system restart)
        db = new better_sqlite3_1.default(TEST_DB_PATH);
        db.pragma('foreign_keys = ON');
        // Verify user data persists
        const stmt = db.prepare(`
      SELECT username, role 
      FROM users 
      WHERE username = ?
    `);
        const admin = stmt.get('admin');
        expect(admin).toBeDefined();
        expect(admin.username).toBe('admin');
        expect(admin.role).toBe('admin');
        db.close();
    });
});
