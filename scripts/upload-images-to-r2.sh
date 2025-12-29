#!/bin/bash

# Script to upload existing images to R2 bucket
# Usage: ./scripts/upload-images-to-r2.sh [bucket-name]

BUCKET_NAME=${1:-arawa-marketplace-images}
UPLOADS_DIR="./uploads"

echo "🚀 Uploading images to R2 bucket: $BUCKET_NAME"
echo ""

if [ ! -d "$UPLOADS_DIR" ]; then
  echo "❌ Uploads directory not found: $UPLOADS_DIR"
  exit 1
fi

# Upload images
if [ -d "$UPLOADS_DIR/images" ]; then
  echo "📤 Uploading full-size images..."
  for file in "$UPLOADS_DIR/images"/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      echo "  Uploading: $filename"
      wrangler r2 object put "$BUCKET_NAME/images/$filename" --file="$file"
    fi
  done
fi

# Upload thumbnails
if [ -d "$UPLOADS_DIR/thumbnails" ]; then
  echo "📤 Uploading thumbnails..."
  for file in "$UPLOADS_DIR/thumbnails"/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      echo "  Uploading: $filename"
      wrangler r2 object put "$BUCKET_NAME/thumbnails/$filename" --file="$file"
    fi
  done
fi

echo ""
echo "✅ Image upload complete!"
echo ""
echo "Next steps:"
echo "1. Verify images: wrangler r2 object list $BUCKET_NAME"
echo "2. Deploy workers: npm run deploy:workers"
echo "3. Deploy frontend: npm run deploy:pages"
