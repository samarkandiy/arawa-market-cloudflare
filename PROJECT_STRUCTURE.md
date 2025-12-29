# Arawa Marketplace - Project Structure

## Current Active Files

```
arawa-marketplace/
├── 📁 client/                    # React Frontend (Cloudflare Pages)
│   ├── src/
│   │   ├── api/                 # API client and types
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom hooks
│   │   ├── context/             # React context
│   │   └── utils/               # Utility functions
│   ├── public/                  # Static assets
│   └── index.html
│
├── 📁 workers/                   # Cloudflare Workers Backend
│   ├── routes/                  # API route handlers
│   │   ├── auth.ts             # Authentication
│   │   ├── categories.ts       # Categories API
│   │   ├── vehicles.ts         # Vehicles API
│   │   ├── images.ts           # Image serving
│   │   ├── documents.ts        # Document handling
│   │   ├── inquiries.ts        # Contact forms
│   │   └── pages.ts            # CMS pages
│   └── index.ts                # Worker entry point
│
├── 📁 scripts/                   # Utility Scripts
│   ├── create-admin.ts         # Admin user creation
│   ├── cloudflare-setup.sh     # Setup script
│   └── upload-to-r2-remote.sh  # R2 upload utility
│
├── 📁 dist/                      # Build Output
│   └── client/                 # Built frontend
│
├── 📁 archive/                   # Archived Files (not used)
│   ├── documentation/          # Migration docs
│   ├── old-nodejs/             # Old Express backend
│   ├── old-data/               # Old database & uploads
│   └── sql-migrations/         # Migration scripts
│
├── 📄 Configuration Files
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── vite.config.ts          # Vite build config
│   ├── wrangler.toml           # Cloudflare config
│   ├── .env.cloudflare         # Environment variables
│   └── .gitignore              # Git ignore rules
│
├── 📄 Database
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Initial data
│
└── 📄 Documentation
    ├── README.md               # Main documentation
    ├── README_CLOUDFLARE.md    # Cloudflare guide
    ├── QUICK_REFERENCE.md      # Quick reference
    ├── ADMIN_CREDENTIALS.txt   # Admin credentials
    ├── CLEANUP_SUMMARY.md      # Cleanup notes
    └── PROJECT_STRUCTURE.md    # This file
```

## Cloudflare Resources

### Pages (Frontend)
- **Project**: arawa-marketplace
- **URL**: https://arawa-marketplace.pages.dev
- **Build**: `npm run build:client`
- **Deploy**: `npx wrangler pages deploy dist/client`

### Workers (Backend)
- **Name**: arawa-marketplace
- **URL**: https://arawa-marketplace.arawa.workers.dev
- **Deploy**: `npx wrangler deploy`

### D1 Database
- **Name**: arawa-marketplace-db
- **Tables**: users, categories, vehicles, vehicle_images, inquiries, pages

### R2 Storage
- **Bucket**: arawa-marketplace-images
- **Folders**: images/, thumbnails/, pages/, documents/

## Key Directories

### `/client` - Frontend Application
React application built with Vite, deployed to Cloudflare Pages.

**Key Features:**
- Vehicle browsing and search
- Category pages
- CMS admin panel
- Contact forms
- SEO optimization

### `/workers` - Backend API
Hono-based API running on Cloudflare Workers.

**Key Features:**
- RESTful API endpoints
- JWT authentication
- Image serving from R2
- Database queries to D1
- CORS handling

### `/scripts` - Utility Scripts
Helper scripts for deployment and maintenance.

### `/archive` - Archived Files
Old files kept for reference but not used in production.

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev:workers  # Start Workers dev server
   npm run dev:client   # Start frontend dev server
   ```

2. **Build**
   ```bash
   npm run build:client
   ```

3. **Deploy**
   ```bash
   npx wrangler deploy                    # Deploy Workers
   npx wrangler pages deploy dist/client  # Deploy Pages
   ```

## Environment Variables

### Required for Build
- `VITE_API_URL` - Workers API URL

### Required for Workers
- `JWT_SECRET` - JWT signing secret
- `ENVIRONMENT` - Environment name

## Database Management

```bash
# Execute SQL
npx wrangler d1 execute arawa-marketplace-db --remote --file=schema.sql

# Query database
npx wrangler d1 execute arawa-marketplace-db --remote --command "SELECT * FROM users"
```

## R2 Storage Management

```bash
# Upload file
npx wrangler r2 object put arawa-marketplace-images/path/file.jpg --file=local-file.jpg

# List objects
npx wrangler r2 object list arawa-marketplace-images
```

## Notes

- All old Node.js/Express code is archived
- Project runs entirely on Cloudflare
- No local database or file storage needed
- All assets served from R2 via Workers
