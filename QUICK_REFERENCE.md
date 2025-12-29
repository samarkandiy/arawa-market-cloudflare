# Quick Reference - Arawa Marketplace on Cloudflare

## 🌐 Your URLs

### Frontend
```
https://18c37c57.arawa-marketplace.pages.dev
```

### API
```
https://arawa-marketplace.avazbokiev14.workers.dev
```

### CMS Login
```
https://18c37c57.arawa-marketplace.pages.dev/cms/login
Username: admin
Password: admin123
```

## 🚀 Quick Commands

### Deploy
```bash
npm run deploy              # Deploy everything
npm run deploy:workers      # Workers only
npm run deploy:pages        # Pages only
```

### Database
```bash
# Query
wrangler d1 execute arawa-marketplace-db --remote --command "SELECT * FROM categories"

# Backup
wrangler d1 export arawa-marketplace-db --remote --output backup.sql
```

### Logs
```bash
wrangler tail arawa-marketplace
```

### R2
```bash
wrangler r2 object list arawa-marketplace-images
```

## 📊 Resource IDs

```
Account ID:  abd9f2578e189e81d8444917e929bc9b
Database ID: 74f0f7bd-a3c0-4d47-af92-d85d730f1a86
R2 Bucket:   arawa-marketplace-images
Worker:      arawa-marketplace
Pages:       arawa-marketplace
```

## 🔑 Secrets

```bash
# View secrets
wrangler secret list

# Update JWT secret
wrangler secret put JWT_SECRET
```

## 📝 Common Tasks

### Add Vehicle
1. Login to CMS
2. Vehicles > Add New
3. Fill details & upload images
4. Publish

### Change Admin Password
```bash
npm run create-admin NewPassword
wrangler d1 execute arawa-marketplace-db --remote --command "UPDATE users SET password_hash = 'HASH' WHERE username = 'admin'"
```

### Update Frontend
```bash
# Make changes in client/
npm run build:client
wrangler pages deploy dist/client --project-name arawa-marketplace
```

### Update API
```bash
# Make changes in workers/
npm run deploy:workers
```

## 🐛 Quick Fixes

### API not responding
```bash
wrangler tail arawa-marketplace
npm run deploy:workers
```

### Frontend not loading
```bash
npm run build:client
wrangler pages deploy dist/client --project-name arawa-marketplace
```

### Database issues
```bash
wrangler d1 execute arawa-marketplace-db --remote --command "SELECT * FROM users"
```

## 📚 Documentation

- `DEPLOYMENT_SUCCESS.md` - Full deployment details
- `GETTING_STARTED.md` - Quick start guide
- `CLOUDFLARE_DEPLOYMENT.md` - Detailed guide

---

**Need help?** Check DEPLOYMENT_SUCCESS.md for detailed information.
