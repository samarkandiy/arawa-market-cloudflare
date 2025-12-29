#!/bin/bash

# Complete Cloudflare setup script
# This script guides you through the entire deployment process

set -e

echo "🚀 Arawa Marketplace - Cloudflare Deployment Setup"
echo "=================================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in
echo "🔐 Checking Wrangler authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please login to Cloudflare:"
    wrangler login
fi

echo ""
echo "Step 1: Creating D1 Databases"
echo "=============================="
read -p "Create production database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating production database..."
    wrangler d1 create arawa-marketplace-db
    echo ""
    echo "⚠️  Copy the database_id from above and update wrangler.toml"
    read -p "Press enter when done..."
fi

read -p "Create development database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating development database..."
    wrangler d1 create arawa-marketplace-db-dev
    echo ""
    echo "⚠️  Copy the database_id from above and update wrangler.toml (env.development section)"
    read -p "Press enter when done..."
fi

echo ""
echo "Step 2: Creating R2 Buckets"
echo "============================"
read -p "Create production R2 bucket? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler r2 bucket create arawa-marketplace-images
fi

read -p "Create development R2 bucket? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler r2 bucket create arawa-marketplace-images-dev
fi

echo ""
echo "Step 3: Initialize Database Schema"
echo "==================================="
read -p "Initialize production database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run cf:db:init
    npm run cf:db:seed
fi

read -p "Initialize development database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run cf:db:init:dev
    npm run cf:db:seed:dev
fi

echo ""
echo "Step 4: Migrate Existing Data (Optional)"
echo "========================================="
read -p "Do you have existing data to migrate? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Exporting existing data..."
    ts-node scripts/migrate-to-cloudflare.ts
    echo ""
    read -p "Import to production database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        wrangler d1 execute arawa-marketplace-db --file=./migration-data.sql
    fi
    
    echo ""
    read -p "Upload images to R2? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash scripts/upload-images-to-r2.sh
    fi
fi

echo ""
echo "Step 5: Create Admin User"
echo "========================="
read -p "Enter admin password (or press enter for 'admin123'): " admin_password
admin_password=${admin_password:-admin123}
echo "Generating password hash..."
npm run create-admin "$admin_password"
echo ""
echo "⚠️  Run the wrangler command shown above to create the admin user"
read -p "Press enter when done..."

echo ""
echo "Step 6: Set Secrets"
echo "==================="
echo "Setting JWT_SECRET..."
read -p "Enter JWT secret (or press enter to generate random): " jwt_secret
if [ -z "$jwt_secret" ]; then
    jwt_secret=$(openssl rand -base64 32)
    echo "Generated: $jwt_secret"
fi
echo "$jwt_secret" | wrangler secret put JWT_SECRET

echo ""
echo "Step 7: Deploy Workers"
echo "======================"
read -p "Deploy workers to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run deploy:workers
    echo ""
    echo "✅ Workers deployed!"
    echo "⚠️  Copy the workers URL and update .env.cloudflare VITE_API_URL"
    read -p "Press enter when done..."
fi

echo ""
echo "Step 8: Deploy Frontend"
echo "======================="
echo "Choose deployment method:"
echo "1. Deploy via Wrangler (one-time)"
echo "2. Setup Git integration (recommended)"
read -p "Enter choice (1 or 2): " deploy_choice

if [ "$deploy_choice" = "1" ]; then
    npm run deploy:pages
elif [ "$deploy_choice" = "2" ]; then
    echo ""
    echo "To setup Git integration:"
    echo "1. Go to Cloudflare Dashboard > Pages"
    echo "2. Click 'Create a project'"
    echo "3. Connect your Git repository"
    echo "4. Set build command: npm run build:client"
    echo "5. Set build output: dist/client"
    echo "6. Add environment variable: VITE_API_URL (your workers URL)"
    echo "7. Click 'Save and Deploy'"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your application should now be deployed to:"
echo "- Workers API: https://arawa-marketplace.your-subdomain.workers.dev"
echo "- Frontend: https://arawa-marketplace.pages.dev"
echo ""
echo "Next steps:"
echo "1. Test the API: curl https://your-workers-url/health"
echo "2. Visit your frontend URL"
echo "3. Login to CMS at /cms/login"
echo "4. Configure custom domains (optional)"
echo ""
echo "For more information, see CLOUDFLARE_DEPLOYMENT.md"
