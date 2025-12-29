import Database from 'better-sqlite3';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/marketplace.db';

async function updateCategoryIcons() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Database file not found:', DB_PATH);
    return;
  }

  const db = new Database(DB_PATH);
  
  // Get categories with icons
  const categories = db.prepare('SELECT id, name_ja, icon FROM categories WHERE icon IS NOT NULL').all();
  
  console.log(`Found ${categories.length} categories with icons`);
  console.log('');
  
  for (const cat of categories as any[]) {
    const iconLength = cat.icon ? cat.icon.length : 0;
    console.log(`Category ${cat.id} (${cat.name_ja}): ${iconLength} bytes`);
    
    // Create individual SQL file for this category
    const filename = `migration-icon-${cat.id}.sql`;
    const escapedIcon = cat.icon.replace(/'/g, "''");
    const sql = `UPDATE categories SET icon = '${escapedIcon}' WHERE id = ${cat.id};`;
    
    fs.writeFileSync(filename, sql);
    console.log(`  Created: ${filename}`);
  }
  
  db.close();
  
  console.log('');
  console.log('✅ Icon SQL files created!');
  console.log('');
  console.log('To upload to D1, run:');
  console.log('for i in {1..14}; do wrangler d1 execute arawa-marketplace-db --remote --file=migration-icon-$i.sql 2>&1 | grep -E "Executed|ERROR"; done');
}

updateCategoryIcons();
