import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../index';

const inquiries = new Hono<{ Bindings: Env }>();

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

// Create inquiry (public)
inquiries.post('/', async (c) => {
  try {
    const data = await c.req.json();
    
    // Honeypot check
    if (data.website) {
      return c.json({ message: 'Inquiry submitted' }, 200);
    }
    
    // Validate required fields
    const vehicleId = data.vehicleId !== undefined ? data.vehicleId : data.vehicle_id;
    const customerName = data.customerName || data.customer_name;
    const customerEmail = data.customerEmail || data.customer_email;
    const customerPhone = data.customerPhone || data.customer_phone;
    const message = data.message;
    const inquiryType = data.inquiryType || data.inquiry_type;
    
    if (vehicleId === undefined || vehicleId === null || !customerName || !message || !inquiryType) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Require at least one contact method
    if (!customerEmail && !customerPhone) {
      return c.json({ error: 'Email or phone required' }, 400);
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO inquiries (
        vehicle_id, customer_name, customer_email, customer_phone,
        message, inquiry_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'new')
    `).bind(
      vehicleId === 0 ? null : vehicleId,
      customerName,
      customerEmail || null,
      customerPhone || null,
      message,
      inquiryType
    ).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Inquiry submitted' }, 201);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return c.json({ error: 'Failed to submit inquiry' }, 500);
  }
});

// Get all inquiries (protected)
inquiries.get('/', jwtMiddleware, async (c) => {
  try {
    const { status } = c.req.query();
    
    let query = `
      SELECT i.*, v.make, v.model, v.year
      FROM inquiries i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE i.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const stmt = c.env.DB.prepare(query);
    const { results } = await stmt.bind(...params).all();
    
    return c.json(toCamelCase(results));
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return c.json({ error: 'Failed to fetch inquiries' }, 500);
  }
});

// Update inquiry status (protected)
inquiries.put('/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    await c.env.DB.prepare(
      'UPDATE inquiries SET status = ? WHERE id = ?'
    ).bind(status, id).run();
    
    return c.json({ message: 'Inquiry updated' });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return c.json({ error: 'Failed to update inquiry' }, 500);
  }
});

export { inquiries as inquiryRoutes };
