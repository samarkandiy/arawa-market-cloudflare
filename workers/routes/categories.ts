import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../index';

const categories = new Hono<{ Bindings: Env }>();

const jwtMiddleware = (c: any, next: any) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET });
  return jwtMiddleware(c, next);
};

// Get all categories
categories.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY id ASC'
    ).all();
    
    // Transform snake_case to camelCase for frontend
    const transformed = results.map((cat: any) => ({
      id: cat.id,
      nameJa: cat.name_ja,
      nameEn: cat.name_en,
      slug: cat.slug,
      icon: cat.icon
    }));
    
    return c.json(transformed);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Get single category
categories.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const category = await c.env.DB.prepare(
      'SELECT * FROM categories WHERE id = ?'
    ).bind(id).first();
    
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    // Transform snake_case to camelCase
    const transformed = {
      id: (category as any).id,
      nameJa: (category as any).name_ja,
      nameEn: (category as any).name_en,
      slug: (category as any).slug,
      icon: (category as any).icon
    };
    
    return c.json(transformed);
  } catch (error) {
    console.error('Error fetching category:', error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

// Create category (protected)
categories.post('/', jwtMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    
    const result = await c.env.DB.prepare(
      'INSERT INTO categories (name_ja, name_en, slug, icon) VALUES (?, ?, ?, ?)'
    ).bind(data.nameJa, data.nameEn, data.slug, data.icon || null).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Category created' }, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category (protected)
categories.put('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    await c.env.DB.prepare(
      'UPDATE categories SET name_ja = ?, name_en = ?, slug = ?, icon = ? WHERE id = ?'
    ).bind(data.nameJa, data.nameEn, data.slug, data.icon || null, id).run();
    
    return c.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Error updating category:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete category (protected)
categories.delete('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if category has vehicles
    const vehicleCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM vehicles WHERE category_id = ?'
    ).bind(id).first();
    
    if ((vehicleCount as any)?.count > 0) {
      return c.json({ error: 'Cannot delete category with vehicles' }, 400);
    }
    
    await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

export { categories as categoryRoutes };
