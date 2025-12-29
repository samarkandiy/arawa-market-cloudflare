import bcrypt from 'bcryptjs';

async function createAdminHash() {
  const password = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== Admin User Setup ===\n');
  console.log('Password:', password);
  console.log('\nBcrypt Hash:', hash);
  console.log('\n=== Wrangler Command ===\n');
  console.log(`wrangler d1 execute arawa-marketplace-db --command "INSERT INTO users (username, password_hash, role) VALUES ('admin', '${hash}', 'admin')"`);
  console.log('\n=== Or set as secret ===\n');
  console.log(`wrangler secret put ADMIN_PASSWORD_HASH`);
  console.log('Then paste the hash above when prompted');
  console.log('\n');
}

createAdminHash();
