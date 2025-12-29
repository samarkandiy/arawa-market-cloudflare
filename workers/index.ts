import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { vehicleRoutes } from './routes/vehicles';
import { categoryRoutes } from './routes/categories';
import { inquiryRoutes } from './routes/inquiries';
import { imageRoutes } from './routes/images';
import { authRoutes } from './routes/auth';
import { pageRoutes } from './routes/pages';
import { documentRoutes } from './routes/documents';

export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  JWT_SECRET: string;
  ADMIN_PASSWORD_HASH: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware - allow all Pages deployments
app.use('/*', cors({
  origin: (origin) => {
    // Allow localhost for development
    if (origin?.includes('localhost')) return origin;
    // Allow all Cloudflare Pages deployments
    if (origin?.includes('.arawa-marketplace.pages.dev')) return origin;
    if (origin === 'https://arawa-marketplace.pages.dev') return origin;
    return 'https://arawa-marketplace.pages.dev';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers
app.use('/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/vehicles', vehicleRoutes);
app.route('/api/categories', categoryRoutes);
app.route('/api/inquiries', inquiryRoutes);
app.route('/api/images', imageRoutes);
app.route('/api/pages', pageRoutes);
app.route('/api/documents', documentRoutes);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal Server Error',
    }
  }, 500);
});

export default app;
