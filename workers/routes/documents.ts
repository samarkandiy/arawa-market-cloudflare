import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../index';

const documents = new Hono<{ Bindings: Env }>();

const jwtMiddleware = (c: any, next: any) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET });
  return jwtMiddleware(c, next);
};

// Upload document (protected)
documents.post('/upload', jwtMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('document');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No document provided' }, 400);
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return c.json({ error: 'Only PDF files are allowed' }, 400);
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 10MB' }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `document_${timestamp}_${randomStr}.pdf`;
    
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.IMAGES.put(`documents/${filename}`, arrayBuffer, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
    });
    
    // Return URL
    const url = `/api/documents/${filename}`;
    
    return c.json({ 
      url: `https://arawa-marketplace.arawa.workers.dev${url}`,
      filename 
    }, 201);
  } catch (error) {
    console.error('Error uploading document:', error);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

// Get document from R2
documents.get('/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    
    const object = await c.env.IMAGES.get(`documents/${filename}`);
    
    if (!object) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
    
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error fetching document:', error);
    return c.json({ error: 'Failed to fetch document' }, 500);
  }
});

// Delete document (protected)
documents.delete('/:filename', jwtMiddleware, async (c) => {
  try {
    const filename = c.req.param('filename');
    
    // Delete from R2
    await c.env.IMAGES.delete(`documents/${filename}`);
    
    return c.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

export { documents as documentRoutes };
