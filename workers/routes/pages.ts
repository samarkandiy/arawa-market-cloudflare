import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../index';

const pages = new Hono<{ Bindings: Env }>();

const jwtMiddleware = (c: any, next: any) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET });
  return jwtMiddleware(c, next);
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// Get all pages (public - only published)
pages.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM pages WHERE is_published = 1 ORDER BY title_ja'
    ).all();
    
    return c.json(toCamelCase(results));
  } catch (error) {
    console.error('Error fetching pages:', error);
    return c.json({ error: 'Failed to fetch pages' }, 500);
  }
});

// Get all pages for admin (protected)
pages.get('/admin', jwtMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM pages ORDER BY created_at DESC'
    ).all();
    
    return c.json(toCamelCase(results));
  } catch (error) {
    console.error('Error fetching pages:', error);
    return c.json({ error: 'Failed to fetch pages' }, 500);
  }
});

// Get page by slug
pages.get('/slug/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    const page = await c.env.DB.prepare(
      'SELECT * FROM pages WHERE slug = ? AND is_published = 1'
    ).bind(slug).first();
    
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    return c.json(toCamelCase(page));
  } catch (error) {
    console.error('Error fetching page:', error);
    return c.json({ error: 'Failed to fetch page' }, 500);
  }
});

// Get page by ID (protected)
pages.get('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    const page = await c.env.DB.prepare(
      'SELECT * FROM pages WHERE id = ?'
    ).bind(id).first();
    
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    return c.json(toCamelCase(page));
  } catch (error) {
    console.error('Error fetching page:', error);
    return c.json({ error: 'Failed to fetch page' }, 500);
  }
});

// Create page (protected)
pages.post('/', jwtMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    
    const result = await c.env.DB.prepare(`
      INSERT INTO pages (
        slug, title_ja, title_en, content_ja, content_en,
        meta_description_ja, meta_description_en,
        is_published, show_in_nav
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.slug,
      data.titleJa || data.title_ja,
      data.titleEn || data.title_en || null,
      data.contentJa || data.content_ja,
      data.contentEn || data.content_en || null,
      data.metaDescriptionJa || data.meta_description_ja || null,
      data.metaDescriptionEn || data.meta_description_en || null,
      data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : (data.is_published ? 1 : 0),
      data.showInNav !== undefined ? (data.showInNav ? 1 : 0) : (data.show_in_nav ? 1 : 0)
    ).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Page created' }, 201);
  } catch (error) {
    console.error('Error creating page:', error);
    return c.json({ error: 'Failed to create page' }, 500);
  }
});

// Update page (protected)
pages.put('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    await c.env.DB.prepare(`
      UPDATE pages SET
        slug = ?, title_ja = ?, title_en = ?, content_ja = ?, content_en = ?,
        meta_description_ja = ?, meta_description_en = ?,
        is_published = ?, show_in_nav = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.slug,
      data.titleJa || data.title_ja,
      data.titleEn || data.title_en || null,
      data.contentJa || data.content_ja,
      data.contentEn || data.content_en || null,
      data.metaDescriptionJa || data.meta_description_ja || null,
      data.metaDescriptionEn || data.meta_description_en || null,
      data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : (data.is_published ? 1 : 0),
      data.showInNav !== undefined ? (data.showInNav ? 1 : 0) : (data.show_in_nav ? 1 : 0),
      id
    ).run();
    
    return c.json({ message: 'Page updated' });
  } catch (error) {
    console.error('Error updating page:', error);
    return c.json({ error: 'Failed to update page' }, 500);
  }
});

// Delete page (protected)
pages.delete('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Delete featured image from R2 if exists
    const page = await c.env.DB.prepare(
      'SELECT featured_image FROM pages WHERE id = ?'
    ).bind(id).first();
    
    if (page && (page as any).featured_image) {
      await c.env.IMAGES.delete(`pages/${(page as any).featured_image}`);
    }
    
    await c.env.DB.prepare('DELETE FROM pages WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Page deleted' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return c.json({ error: 'Failed to delete page' }, 500);
  }
});

// Upload featured image (protected)
pages.post('/:id/featured-image', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if page exists
    const page = await c.env.DB.prepare(
      'SELECT id, featured_image FROM pages WHERE id = ?'
    ).bind(id).first();
    
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    // Get the uploaded file
    const formData = await c.req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'Image size must be less than 10MB' }, 400);
    }
    
    // Delete old featured image if exists
    if ((page as any).featured_image) {
      try {
        const oldImageUrl = (page as any).featured_image;
        let filename = '';
        
        // Extract filename from various URL formats
        if (oldImageUrl.includes('/api/images/pages/')) {
          // Handle both relative and absolute URLs with /api/images/pages/
          filename = oldImageUrl.split('/api/images/pages/')[1];
        } else if (oldImageUrl.includes('/pages/')) {
          // Handle old R2 direct URLs
          filename = oldImageUrl.split('/pages/')[1];
        } else {
          // Handle direct filename
          filename = oldImageUrl;
        }
        
        if (filename) {
          await c.env.IMAGES.delete(`pages/${filename}`);
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `page_${id}_${timestamp}_${randomStr}.${ext}`;
    
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.IMAGES.put(`pages/${filename}`, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Generate full Workers API URL
    const baseUrl = new URL(c.req.url).origin;
    const imageUrl = `${baseUrl}/api/images/pages/${filename}`;
    
    // Update database
    await c.env.DB.prepare(
      'UPDATE pages SET featured_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(imageUrl, id).run();
    
    return c.json({ imageUrl, message: 'Featured image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading featured image:', error);
    return c.json({ error: 'Failed to upload featured image' }, 500);
  }
});

// Delete featured image (protected)
pages.delete('/:id/featured-image', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get page with featured image
    const page = await c.env.DB.prepare(
      'SELECT featured_image FROM pages WHERE id = ?'
    ).bind(id).first();
    
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    if (!(page as any).featured_image) {
      return c.json({ error: 'No featured image to delete' }, 404);
    }
    
    // Delete from R2
    try {
      const imageUrl = (page as any).featured_image;
      let filename = '';
      
      // Extract filename from various URL formats
      if (imageUrl.includes('/api/images/pages/')) {
        // Handle both relative and absolute URLs with /api/images/pages/
        filename = imageUrl.split('/api/images/pages/')[1];
      } else if (imageUrl.includes('/pages/')) {
        // Handle old R2 direct URLs
        filename = imageUrl.split('/pages/')[1];
      } else {
        // Handle direct filename
        filename = imageUrl;
      }
      
      if (filename) {
        await c.env.IMAGES.delete(`pages/${filename}`);
      }
    } catch (error) {
      console.error('Error deleting image from R2:', error);
    }
    
    // Update database
    await c.env.DB.prepare(
      'UPDATE pages SET featured_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run();
    
    return c.json({ message: 'Featured image deleted successfully' });
  } catch (error) {
    console.error('Error deleting featured image:', error);
    return c.json({ error: 'Failed to delete featured image' }, 500);
  }
});

export { pages as pageRoutes };
