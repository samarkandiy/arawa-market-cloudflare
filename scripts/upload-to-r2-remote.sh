#!/bin/bash

# Upload images to R2 (remote/production)
BUCKET="arawa-marketplace-images"
UPLOADS_DIR="./uploads"

echo "🚀 Uploading images to R2 bucket (REMOTE): $BUCKET"
echo ""

# Upload images
if [ -d "$UPLOADS_DIR/images" ]; then
  echo "📤 Uploading full-size images..."
  count=0
  for file in "$UPLOADS_DIR/images"/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      echo "  [$((++count))] Uploading: $filename"
      wrangler r2 object put "$BUCKET/images/$filename" --file="$file" --remote > /dev/null 2>&1
    fi
  done
  echo "✅ Uploaded $count images"
fi

echo ""

# Upload thumbnails
if [ -d "$UPLOADS_DIR/thumbnails" ]; then
  echo "📤 Uploading thumbnails..."
  count=0
  for file in "$UPLOADS_DIR/thumbnails"/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      echo "  [$((++count))] Uploading: $filename"
      wrangler r2 object put "$BUCKET/thumbnails/$filename" --file="$file" --remote > /dev/null 2>&1
    fi
  done
  echo "✅ Uploaded $count thumbnails"
fi

echo ""
echo "🎉 Upload complete!"
