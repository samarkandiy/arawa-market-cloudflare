# Arawa Marketplace - Cloudflare Edition

A full-stack used trucks marketplace deployed on Cloudflare's edge infrastructure.

## 🌐 Architecture

- **Frontend**: React 19 + TypeScript → Cloudflare Pages
- **Backend**: Hono (lightweight Express alternative) → Cloudflare Workers
- **Database**: SQLite → Cloudflare D1
- **Images**: File system → Cloudflare R2
- **CDN**: Cloudflare's global network (automatic)

## 🚀 Quick Deploy

```bash
# Install dependencies
npm install

# Run automated setup
npm run cf:setup

# Or deploy manually
npm run deploy
```

See [CLOUDFLARE_QUICKSTART.md](./CLOUDFLARE_QUICKSTART.md) for detailed instructions.

## 📁 Project Structure

```
├── client/                 # React frontend (deployed to Pages)
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── index.html
├── workers/               # Cloudflare Workers backend
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── vehicles.ts
│   │   ├── categories.ts
│   │   ├── inquiries.ts
│   │   ├── images.ts
│   │   └── pages.ts
│   └── index.ts          # Worker entry point
├── scripts/              # Deployment scripts
│   ├── cloudflare-setup.sh
│   ├── create-admin.ts
│   ├── migrate-to-cloudflare.ts
│   └── upload-images-to-r2.sh
├── schema.sql            # D1 database schema
├── seed.sql              # Initial data
├── wrangler.toml         # Cloudflare configuration
└── package.json
```

## 🔧 Configuration

### wrangler.toml

Main configuration file for Cloudflare Workers:

```toml
name = "arawa-marketplace"
main = "workers/index.ts"

[[d1_databases]]
binding = "DB"
database_name = "arawa-marketplace-db"
database_id = "your-database-id"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "arawa-marketplace-images"
```

### Environment Variables

**Workers (Secrets):**
- `JWT_SECRET`: JWT signing secret

**Pages:**
- `VITE_API_URL`: Workers API URL

## 🛠 Development

```bash
# Frontend (localhost:3001)
npm run dev:client

# Workers (localhost:8787)
npm run dev:workers

# Original Node.js backend (localhost:3000)
npm run dev
```

## 📦 Deployment

### Deploy Everything

```bash
npm run deploy
```

### Deploy Individually

```bash
# Workers only
npm run deploy:workers

# Pages only
npm run deploy:pages
```

## 🗄 Database Management

```bash
# Initialize schema
npm run cf:db:init

# Seed data
npm run cf:db:seed

# Query database
wrangler d1 execute arawa-marketplace-db --command "SELECT * FROM vehicles"

# Backup
wrangler d1 export arawa-marketplace-db --output backup.sql

# Restore
wrangler d1 execute arawa-marketplace-db --file=backup.sql
```

## 🖼 Image Management

Images are stored in R2 and served via Workers:

```bash
# Upload existing images
bash scripts/upload-images-to-r2.sh

# List images
wrangler r2 object list arawa-marketplace-images

# Delete image
wrangler r2 object delete arawa-marketplace-images/images/filename.jpg
```

## 🔐 Security

- JWT authentication for admin routes
- Bcrypt password hashing
- CORS configuration
- Security headers (CSP, X-Frame-Options, etc.)
- Honeypot spam protection
- Input sanitization

## 📊 Monitoring

```bash
# View worker logs in real-time
wrangler tail arawa-marketplace

# View analytics
# Go to Cloudflare Dashboard > Workers/Pages > Analytics
```

## 💰 Cost Breakdown

### Free Tier (Sufficient for most use cases)

- **Workers**: 100,000 requests/day
- **Pages**: Unlimited requests, 500 builds/month
- **D1**: 5GB storage, 5M reads/day, 100K writes/day
- **R2**: 10GB storage, 1M Class A ops/month, 10M Class B ops/month

### Paid (If you exceed free tier)

- **Workers Paid**: $5/month + $0.50/million requests
- **D1**: $5/month for 25GB storage
- **R2**: $0.015/GB/month storage

## 🌍 Global Performance

Your site is automatically deployed to Cloudflare's global network:
- 300+ cities worldwide
- Sub-50ms latency globally
- Automatic DDoS protection
- Free SSL/TLS

## 🔄 Migration from Node.js

If you have an existing Node.js deployment:

```bash
# 1. Export data
npm run migrate:cloudflare

# 2. Import to D1
wrangler d1 execute arawa-marketplace-db --file=./migration-data.sql

# 3. Upload images
bash scripts/upload-images-to-r2.sh

# 4. Deploy
npm run deploy
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test API endpoint
curl https://arawa-marketplace.your-subdomain.workers.dev/health

# Test frontend
open https://arawa-marketplace.pages.dev
```

## 📝 API Endpoints

All endpoints are prefixed with `/api`:

### Public
- `GET /api/vehicles` - List vehicles
- `GET /api/vehicles/:id` - Get vehicle
- `GET /api/categories` - List categories
- `GET /api/pages` - List pages
- `GET /api/pages/slug/:slug` - Get page by slug
- `POST /api/inquiries` - Submit inquiry
- `GET /api/images/:type/:filename` - Get image

### Protected (Require JWT)
- `POST /api/auth/login` - Login
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `POST /api/vehicles/:id/images` - Upload images
- `DELETE /api/images/:id` - Delete image
- `GET /api/inquiries` - List inquiries
- `PUT /api/inquiries/:id` - Update inquiry
- `POST /api/pages` - Create page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

## 🎨 Features

### Customer-Facing
- Vehicle browsing with filters
- Category navigation
- Search functionality
- Vehicle detail pages with galleries
- Inquiry forms
- Responsive design
- Japanese language interface

### Admin CMS
- Vehicle management (CRUD)
- Image upload and management
- Category management
- Page management with WYSIWYG editor
- Inquiry management
- Dashboard with statistics

## 🔧 Troubleshooting

See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed troubleshooting guide.

## 📚 Documentation

- [Quick Start Guide](./CLOUDFLARE_QUICKSTART.md)
- [Detailed Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md)
- [Original README](./README.md)

## 🤝 Support

For Cloudflare-specific issues:
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)

## 📄 License

ISC

---

Built with ❤️ for Arawa Inc. | Powered by Cloudflare
