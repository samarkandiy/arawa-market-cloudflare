import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../index';

const vehicles = new Hono<{ Bindings: Env }>();

// JWT middleware for protected routes
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

// Get all vehicles with filters
vehicles.get('/', async (c) => {
  try {
    const { category, minPrice, maxPrice, minYear, maxYear, search, page = '1', limit = '12' } = c.req.query();
    
    let query = `
      SELECT v.*, c.name_ja as category_name, c.slug as category_slug,
             (SELECT url FROM vehicle_images WHERE vehicle_id = v.id ORDER BY display_order LIMIT 1) as thumbnail
      FROM vehicles v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE v.status = 'available'
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    
    if (minPrice) {
      query += ' AND v.price >= ?';
      params.push(parseInt(minPrice));
    }
    
    if (maxPrice) {
      query += ' AND v.price <= ?';
      params.push(parseInt(maxPrice));
    }
    
    if (minYear) {
      query += ' AND v.year >= ?';
      params.push(parseInt(minYear));
    }
    
    if (maxYear) {
      query += ' AND v.year <= ?';
      params.push(parseInt(maxYear));
    }
    
    if (search) {
      query += ' AND (v.make LIKE ? OR v.model LIKE ? OR v.description_ja LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY v.created_at DESC';
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
    
    const stmt = c.env.DB.prepare(query);
    const { results } = await stmt.bind(...params).all();
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM vehicles v LEFT JOIN categories c ON v.category_id = c.id WHERE v.status = "available"';
    const countParams: any[] = [];
    
    if (category) {
      countQuery += ' AND c.slug = ?';
      countParams.push(category);
    }
    
    const countStmt = c.env.DB.prepare(countQuery);
    const countResult = await countStmt.bind(...countParams).first();
    const total = (countResult as any)?.total || 0;
    
    // Get images for each vehicle
    const vehiclesWithImages = await Promise.all(
      results.map(async (v: any) => {
        const { results: images } = await c.env.DB.prepare(
          'SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY display_order'
        ).bind(v.id).all();
        
        // Parse features JSON string to array
        let features = [];
        try {
          if (v.features) {
            features = JSON.parse(v.features);
          }
        } catch (e) {
          features = [];
        }
        
        return {
          ...v,
          features,
          thumbnail: v.thumbnail ? `https://arawa-marketplace.arawa.workers.dev${v.thumbnail}` : null,
          images: images.map((img: any) => ({
            ...img,
            url: `https://arawa-marketplace.arawa.workers.dev${img.url}`,
            thumbnail_url: `https://arawa-marketplace.arawa.workers.dev${img.thumbnail_url}`,
          })),
        };
      })
    );
    
    // Convert to camelCase
    const vehiclesData = toCamelCase(vehiclesWithImages);
    
    // Add category field for backward compatibility
    vehiclesData.forEach((v: any) => {
      v.category = v.categorySlug;
    });
    
    return c.json({
      vehicles: vehiclesData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return c.json({ error: 'Failed to fetch vehicles' }, 500);
  }
});

// Get single vehicle
vehicles.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if this is the related vehicles endpoint
    if (id === 'related') {
      return c.next();
    }
    
    const vehicle = await c.env.DB.prepare(`
      SELECT v.*, c.name_ja as category_name, c.slug as category_slug
      FROM vehicles v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE v.id = ?
    `).bind(id).first();
    
    if (!vehicle) {
      return c.json({ error: 'Vehicle not found' }, 404);
    }
    
    // Get images
    const { results: images } = await c.env.DB.prepare(
      'SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY display_order'
    ).bind(id).all();
    
    // Parse features JSON string to array
    let features = [];
    try {
      if ((vehicle as any).features) {
        features = JSON.parse((vehicle as any).features);
      }
    } catch (e) {
      console.error('Failed to parse features:', e);
      features = [];
    }
    
    // Convert to camelCase and fix image URLs
    const vehicleData = toCamelCase({
      ...vehicle,
      features, // Use parsed features array
      images: images.map((img: any) => ({
        ...img,
        url: `https://arawa-marketplace.arawa.workers.dev${img.url}`,
        thumbnail_url: `https://arawa-marketplace.arawa.workers.dev${img.thumbnail_url}`,
      })),
    });
    
    // Add category field for backward compatibility with form
    vehicleData.category = vehicleData.categorySlug;
    
    return c.json(vehicleData);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return c.json({ error: 'Failed to fetch vehicle' }, 500);
  }
});

// Get related vehicles
vehicles.get('/:id/related', async (c) => {
  try {
    const id = c.req.param('id');
    const limit = c.req.query('limit') || '4';
    
    // Get the vehicle's category
    const vehicle = await c.env.DB.prepare(
      'SELECT category_id FROM vehicles WHERE id = ?'
    ).bind(id).first();
    
    if (!vehicle) {
      return c.json([]);
    }
    
    // Get related vehicles from same category
    const { results } = await c.env.DB.prepare(`
      SELECT v.*, c.name_ja as category_name, c.slug as category_slug,
             (SELECT url FROM vehicle_images WHERE vehicle_id = v.id ORDER BY display_order LIMIT 1) as thumbnail
      FROM vehicles v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE v.category_id = ? AND v.id != ? AND v.status = 'available'
      ORDER BY v.created_at DESC
      LIMIT ?
    `).bind((vehicle as any).category_id, id, parseInt(limit)).all();
    
    // Get images for each vehicle
    const vehiclesWithImages = await Promise.all(
      results.map(async (v: any) => {
        const { results: images } = await c.env.DB.prepare(
          'SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY display_order'
        ).bind(v.id).all();
        
        // Parse features
        let features = [];
        try {
          if (v.features) {
            features = JSON.parse(v.features);
          }
        } catch (e) {
          features = [];
        }
        
        return {
          ...v,
          features,
          thumbnail: v.thumbnail ? `https://arawa-marketplace.arawa.workers.dev${v.thumbnail}` : null,
          images: images.map((img: any) => ({
            ...img,
            url: `https://arawa-marketplace.arawa.workers.dev${img.url}`,
            thumbnail_url: `https://arawa-marketplace.arawa.workers.dev${img.thumbnail_url}`,
          })),
        };
      })
    );
    
    // Convert to camelCase
    const vehiclesData = toCamelCase(vehiclesWithImages);
    
    // Add category field
    vehiclesData.forEach((v: any) => {
      v.category = v.categorySlug;
    });
    
    return c.json(vehiclesData);
  } catch (error) {
    console.error('Error fetching related vehicles:', error);
    return c.json({ error: 'Failed to fetch related vehicles' }, 500);
  }
});

// Create vehicle (protected)
vehicles.post('/', jwtMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    
    // Get category_id from slug if category is provided
    let categoryId = data.categoryId || data.category_id;
    if (data.category && !categoryId) {
      const cat = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(data.category).first();
      categoryId = cat ? (cat as any).id : null;
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO vehicles (
        category_id, make, model, year, mileage, price,
        engine_type, length, width, height, condition,
        features, description_ja, description_en, status, registration_document
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      categoryId,
      data.make,
      data.model,
      data.year,
      data.mileage,
      data.price,
      data.engineType || data.engine_type,
      data.dimensions?.length || data.length || null,
      data.dimensions?.width || data.width || null,
      data.dimensions?.height || data.height || null,
      data.condition,
      JSON.stringify(data.features || []),
      data.descriptionJa || data.description_ja,
      data.descriptionEn || data.description_en || null,
      data.status || 'available',
      data.registrationDocument || data.registration_document || null
    ).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Vehicle created' }, 201);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return c.json({ error: 'Failed to create vehicle' }, 500);
  }
});

// Update vehicle (protected)
vehicles.put('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    // Get category_id from slug if category is provided
    let categoryId = data.categoryId || data.category_id;
    if (data.category && !categoryId) {
      const cat = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(data.category).first();
      categoryId = cat ? (cat as any).id : null;
    }
    
    await c.env.DB.prepare(`
      UPDATE vehicles SET
        category_id = ?, make = ?, model = ?, year = ?, mileage = ?, price = ?,
        engine_type = ?, length = ?, width = ?, height = ?, condition = ?,
        features = ?, description_ja = ?, description_en = ?, status = ?,
        registration_document = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      categoryId,
      data.make,
      data.model,
      data.year,
      data.mileage,
      data.price,
      data.engineType || data.engine_type,
      data.dimensions?.length || data.length || null,
      data.dimensions?.width || data.width || null,
      data.dimensions?.height || data.height || null,
      data.condition,
      JSON.stringify(data.features || []),
      data.descriptionJa || data.description_ja,
      data.descriptionEn || data.description_en || null,
      data.status,
      data.registrationDocument || data.registration_document || null,
      id
    ).run();
    
    return c.json({ message: 'Vehicle updated' });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return c.json({ error: 'Failed to update vehicle' }, 500);
  }
});

// Delete vehicle (protected)
vehicles.delete('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Delete images from R2
    const { results: images } = await c.env.DB.prepare(
      'SELECT filename FROM vehicle_images WHERE vehicle_id = ?'
    ).bind(id).all();
    
    for (const img of images as any[]) {
      await c.env.IMAGES.delete(`images/${img.filename}`);
      await c.env.IMAGES.delete(`thumbnails/${img.filename}`);
    }
    
    // Delete from database (cascade will handle images table)
    await c.env.DB.prepare('DELETE FROM vehicles WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Vehicle deleted' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return c.json({ error: 'Failed to delete vehicle' }, 500);
  }
});

// Upload vehicle images (protected)
vehicles.post('/:id/images', jwtMiddleware, async (c) => {
  try {
    const vehicleId = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('image'); // Single file upload
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No image provided' }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const filename = `vehicle_${vehicleId}_${timestamp}_${randomStr}.${ext}`;
    
    // Upload original to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.IMAGES.put(`images/${filename}`, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Create thumbnail (simplified - in production use image processing)
    await c.env.IMAGES.put(`thumbnails/thumb_${filename}`, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Save to database
    const url = `/api/images/images/${filename}`;
    const thumbnailUrl = `/api/images/thumbnails/thumb_${filename}`;
    
    const result = await c.env.DB.prepare(`
      INSERT INTO vehicle_images (vehicle_id, filename, url, thumbnail_url, display_order)
      VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM vehicle_images WHERE vehicle_id = ?))
    `).bind(vehicleId, filename, url, thumbnailUrl, vehicleId).run();
    
    const uploadedImage = {
      id: result.meta.last_row_id,
      filename,
      url: `https://arawa-marketplace.arawa.workers.dev${url}`,
      thumbnailUrl: `https://arawa-marketplace.arawa.workers.dev${thumbnailUrl}`,
    };
    
    return c.json(uploadedImage, 201);
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

export { vehicles as vehicleRoutes };
