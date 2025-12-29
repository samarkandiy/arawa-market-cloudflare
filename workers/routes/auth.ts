import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../index';

const auth = new Hono<{ Bindings: Env }>();

// Login
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password required' }, 400);
    }

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password using bcrypt (you'll need to implement this)
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password_hash as string);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = await sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Verify token
auth.get('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, c.env.JWT_SECRET);

    return c.json({ valid: true, user: payload });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Logout (client-side token removal)
auth.post('/logout', (c) => {
  return c.json({ message: 'Logged out successfully' });
});

export { auth as authRoutes };
