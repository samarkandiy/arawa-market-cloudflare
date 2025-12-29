-- Seed data for Arawa Marketplace

-- Insert categories
INSERT OR IGNORE INTO categories (name_ja, name_en, slug) VALUES
  ('平ボディ', 'Flatbed', 'flatbed'),
  ('ダンプ', 'Dump', 'dump'),
  ('クレーン', 'Crane', 'crane'),
  ('バン・ウィング', 'Van/Wing', 'van-wing'),
  ('冷凍車', 'Refrigerated', 'refrigerated'),
  ('アームロール・フックロール', 'Arm Roll/Hook Roll', 'arm-roll'),
  ('キャリアカー・ローダー', 'Carrier/Loader', 'carrier'),
  ('パッカー車', 'Garbage Truck', 'garbage'),
  ('ミキサー車', 'Mixer', 'mixer'),
  ('タンク車', 'Tank', 'tank'),
  ('高所作業車', 'Aerial Work Platform', 'aerial'),
  ('特殊車両', 'Special Vehicles', 'special'),
  ('バス', 'Bus', 'bus'),
  ('ベース車輛・その他', 'Base Vehicle/Other', 'other');

-- Note: Admin user should be created via script with proper password hashing
-- Use: wrangler d1 execute arawa-marketplace-db --command "INSERT INTO users (username, password_hash, role) VALUES ('admin', 'YOUR_BCRYPT_HASH', 'admin')"
