/**
 * Migration script to export existing SQLite data to SQL format for D1
 * Run this before deploying to Cloudflare to migrate your existing data
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || './data/marketplace.db';
const OUTPUT_FILE = './migration-data.sql';

function escapeString(str: string | null): string {
  if (str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function exportData() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Database file not found:', DB_PATH);
    console.log('No existing data to migrate.');
    return;
  }

  const db = new Database(DB_PATH);
  const output: string[] = [];

  output.push('-- Migration data from existing SQLite database');
  output.push(`-- Generated: ${new Date().toISOString()}`);
  output.push('');

  // Export users (excluding passwords for security - you'll need to recreate admin)
  console.log('Exporting users...');
  const users = db.prepare('SELECT * FROM users').all();
  if (users.length > 0) {
    output.push('-- Users (passwords need to be reset)');
    for (const user of users as any[]) {
      output.push(`-- User: ${user.username} (role: ${user.role})`);
      output.push(`-- Use: npm run create-admin to create admin user`);
    }
    output.push('');
  }

  // Export categories
  console.log('Exporting categories...');
  const categories = db.prepare('SELECT * FROM categories').all();
  if (categories.length > 0) {
    output.push('-- Categories');
    for (const cat of categories as any[]) {
      output.push(
        `INSERT OR IGNORE INTO categories (id, name_ja, name_en, slug, icon) VALUES (${cat.id}, ${escapeString(cat.name_ja)}, ${escapeString(cat.name_en)}, ${escapeString(cat.slug)}, ${escapeString(cat.icon)});`
      );
    }
    output.push('');
  }

  // Export vehicles
  console.log('Exporting vehicles...');
  const vehicles = db.prepare('SELECT * FROM vehicles').all();
  if (vehicles.length > 0) {
    output.push('-- Vehicles');
    for (const v of vehicles as any[]) {
      output.push(
        `INSERT INTO vehicles (id, category_id, make, model, year, mileage, price, engine_type, length, width, height, condition, features, description_ja, description_en, status, created_at, updated_at) VALUES (${v.id}, ${v.category_id}, ${escapeString(v.make)}, ${escapeString(v.model)}, ${v.year}, ${v.mileage}, ${v.price}, ${escapeString(v.engine_type)}, ${v.length || 'NULL'}, ${v.width || 'NULL'}, ${v.height || 'NULL'}, ${escapeString(v.condition)}, ${escapeString(v.features)}, ${escapeString(v.description_ja)}, ${escapeString(v.description_en)}, ${escapeString(v.status)}, ${escapeString(v.created_at)}, ${escapeString(v.updated_at)});`
      );
    }
    output.push('');
  }

  // Export vehicle images (note: actual image files need to be uploaded to R2 separately)
  console.log('Exporting vehicle images metadata...');
  const images = db.prepare('SELECT * FROM vehicle_images').all();
  if (images.length > 0) {
    output.push('-- Vehicle Images (upload actual files to R2 separately)');
    for (const img of images as any[]) {
      output.push(
        `INSERT INTO vehicle_images (id, vehicle_id, filename, url, thumbnail_url, display_order, uploaded_at) VALUES (${img.id}, ${img.vehicle_id}, ${escapeString(img.filename)}, ${escapeString(img.url)}, ${escapeString(img.thumbnail_url)}, ${img.display_order}, ${escapeString(img.uploaded_at)});`
      );
    }
    output.push('');
  }

  // Export inquiries
  console.log('Exporting inquiries...');
  const inquiries = db.prepare('SELECT * FROM inquiries').all();
  if (inquiries.length > 0) {
    output.push('-- Inquiries');
    for (const inq of inquiries as any[]) {
      output.push(
        `INSERT INTO inquiries (id, vehicle_id, customer_name, customer_email, customer_phone, message, inquiry_type, status, created_at) VALUES (${inq.id}, ${inq.vehicle_id}, ${escapeString(inq.customer_name)}, ${escapeString(inq.customer_email)}, ${escapeString(inq.customer_phone)}, ${escapeString(inq.message)}, ${escapeString(inq.inquiry_type)}, ${escapeString(inq.status)}, ${escapeString(inq.created_at)});`
      );
    }
    output.push('');
  }

  // Export pages
  console.log('Exporting pages...');
  const pages = db.prepare('SELECT * FROM pages').all();
  if (pages.length > 0) {
    output.push('-- Pages');
    for (const page of pages as any[]) {
      output.push(
        `INSERT INTO pages (id, slug, title_ja, title_en, content_ja, content_en, meta_description_ja, meta_description_en, featured_image, is_published, show_in_nav, created_at, updated_at) VALUES (${page.id}, ${escapeString(page.slug)}, ${escapeString(page.title_ja)}, ${escapeString(page.title_en)}, ${escapeString(page.content_ja)}, ${escapeString(page.content_en)}, ${escapeString(page.meta_description_ja)}, ${escapeString(page.meta_description_en)}, ${escapeString(page.featured_image)}, ${page.is_published}, ${page.show_in_nav}, ${escapeString(page.created_at)}, ${escapeString(page.updated_at)});`
      );
    }
    output.push('');
  }

  db.close();

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
  console.log('\n✅ Migration data exported to:', OUTPUT_FILE);
  console.log('\nNext steps:');
  console.log('1. Upload images from ./uploads to R2 bucket');
  console.log('2. Run: wrangler d1 execute arawa-marketplace-db --file=./migration-data.sql');
  console.log('3. Create admin user: npm run create-admin');
  console.log('4. Deploy: npm run deploy');
}

exportData();
