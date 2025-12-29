import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../index';

const images = new Hono<{ Bindings: Env }>();

const jwtMiddleware = (c: any, next: any) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET });
  return jwtMiddleware(c, next);
};

// Upload vehicle images (protected)
images.post('/vehicles/:vehicleId', jwtMiddleware, async (c) => {
  try {
    const vehicleId = c.req.param('vehicleId');
    const formData = await c.req.formData();
    const files = formData.getAll('images');
    
    if (!files || files.length === 0) {
      return c.json({ error: 'No images provided' }, 400);
    }
    
    const uploadedImages = [];
    
    for (const file of files) {
      if (!(file instanceof File)) continue;
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = file.name.split('.').pop();
      const filename = `${timestamp}-${randomStr}.${ext}`;
      
      // Upload original to R2
      const arrayBuffer = await file.arrayBuffer();
      await c.env.IMAGES.put(`images/${filename}`, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });
      
      // Create thumbnail (simplified - in production use image processing)
      await c.env.IMAGES.put(`thumbnails/${filename}`, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });
      
      // Save to database
      const url = `/api/images/images/${filename}`;
      const thumbnailUrl = `/api/images/thumbnails/${filename}`;
      
      const result = await c.env.DB.prepare(`
        INSERT INTO vehicle_images (vehicle_id, filename, url, thumbnail_url, display_order)
        VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM vehicle_images WHERE vehicle_id = ?))
      `).bind(vehicleId, filename, url, thumbnailUrl, vehicleId).run();
      
      uploadedImages.push({
        id: result.meta.last_row_id,
        filename,
        url,
        thumbnail_url: thumbnailUrl,
      });
    }
    
    return c.json({ images: uploadedImages }, 201);
  } catch (error) {
    console.error('Error uploading images:', error);
    return c.json({ error: 'Failed to upload images' }, 500);
  }
});

// Get image from R2
images.get('/:type/:filename', async (c) => {
  try {
    const type = c.req.param('type'); // 'images', 'thumbnails', or 'pages'
    const filename = c.req.param('filename');
    
    const object = await c.env.IMAGES.get(`${type}/${filename}`);
    
    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error fetching image:', error);
    return c.json({ error: 'Failed to fetch image' }, 500);
  }
});

// Delete image (protected)
images.delete('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get image info
    const image = await c.env.DB.prepare(
      'SELECT * FROM vehicle_images WHERE id = ?'
    ).bind(id).first();
    
    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    // Delete from R2
    await c.env.IMAGES.delete(`images/${image.filename}`);
    await c.env.IMAGES.delete(`thumbnails/${image.filename}`);
    
    // Delete from database
    await c.env.DB.prepare('DELETE FROM vehicle_images WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return c.json({ error: 'Failed to delete image' }, 500);
  }
});

// Update image order (protected)
images.put('/:id/order', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { display_order } = await c.req.json();
    
    await c.env.DB.prepare(
      'UPDATE vehicle_images SET display_order = ? WHERE id = ?'
    ).bind(display_order, id).run();
    
    return c.json({ message: 'Image order updated' });
  } catch (error) {
    console.error('Error updating image order:', error);
    return c.json({ error: 'Failed to update image order' }, 500);
  }
});

export { images as imageRoutes };
