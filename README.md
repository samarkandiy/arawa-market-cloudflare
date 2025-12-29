# Arawa Marketplace - Used Truck Sales Platform

A modern used truck marketplace built entirely on Cloudflare's edge platform.

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite (Cloudflare Pages)
- **Backend**: Hono + TypeScript (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **CDN**: Cloudflare

## 📁 Project Structure

```
.
├── client/              # React frontend application
│   ├── src/
│   │   ├── api/        # API client and types
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── workers/            # Cloudflare Workers backend
│   ├── routes/         # API route handlers
│   └── index.ts        # Worker entry point
├── scripts/            # Deployment and setup scripts
├── dist/               # Build output
└── wrangler.toml       # Cloudflare configuration

```

## 🔧 Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- Wrangler CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arawa-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.cloudflare
   # Edit .env.cloudflare with your settings
   ```

4. **Setup Cloudflare resources**
   ```bash
   # Create D1 database
   npx wrangler d1 create arawa-marketplace-db
   
   # Create R2 bucket
   npx wrangler r2 bucket create arawa-marketplace-images
   
   # Run database migrations
   npx wrangler d1 execute arawa-marketplace-db --remote --file=schema.sql
   npx wrangler d1 execute arawa-marketplace-db --remote --file=seed.sql
   ```

5. **Create admin user**
   ```bash
   npx ts-node scripts/create-admin.ts "your-password"
   # Use the generated hash to create admin user in D1
   ```

## 🚀 Deployment

### Deploy Workers (Backend)
```bash
npx wrangler deploy
```

### Deploy Pages (Frontend)
```bash
# Build
VITE_API_URL=https://arawa-marketplace.arawa.workers.dev/api npm run build:client

# Deploy
npx wrangler pages deploy dist/client --project-name arawa-marketplace
```

## 🌐 Live URLs

- **Frontend**: https://arawa-marketplace.pages.dev
- **API**: https://arawa-marketplace.arawa.workers.dev/api
- **CMS**: https://arawa-marketplace.pages.dev/cms/login

## 🔐 Admin Access

See `ADMIN_CREDENTIALS.txt` for CMS login credentials.

## 📊 Database Schema

The database includes:
- `users` - Admin users
- `categories` - Vehicle categories
- `vehicles` - Vehicle listings
- `vehicle_images` - Vehicle photos
- `inquiries` - Customer inquiries
- `pages` - CMS pages

## 🛠️ Development

### Run locally
```bash
# Start Workers dev server
npm run dev:workers

# Start frontend dev server (in another terminal)
npm run dev:client
```

### Build
```bash
# Build frontend
npm run build:client

# Build workers
npm run build:workers
```

## 📝 Key Features

- ✅ Vehicle listing and search
- ✅ Category browsing
- ✅ Image gallery with R2 storage
- ✅ Contact forms and inquiries
- ✅ CMS for content management
- ✅ SEO optimization
- ✅ Responsive design
- ✅ Japanese language support

## 🔒 Security

- Bcrypt password hashing
- JWT authentication
- CORS configuration
- Input validation
- SQL injection prevention

## 📚 Documentation

Additional documentation can be found in the `/archive/documentation` folder.

## 🤝 Support

For issues or questions, please contact the development team.

## 📄 License

Proprietary - All rights reserved
