import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import eventsRoutes from './routes/events';
import campaignsRoutes from './routes/campaigns';
import mediaRoutes from './routes/media';
import documentsRoutes from './routes/documents';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';
import leadershipRoutes from './routes/leadership';
import contactRoutes from './routes/contact';
import publicRoutes from './routes/public';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security ────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CLIENT_URL may be a comma-separated list of allowed origins
// (e.g. "https://saus-admin.vercel.app,http://localhost:3100").
// PUBLIC_SITE_URL adds the static SAUS website origin(s) so the public
// contact form (POST /api/contact) is permitted by CORS.
const allowedOrigins = [
  ...(process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3100').split(','),
  ...(process.env.PUBLIC_SITE_URL || 'http://localhost:8080').split(','),
].map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);            // curl, health checks, server-to-server
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
}));
// Public contact form — tighter cap to deter spam (per IP).
app.use('/api/contact', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please try again later or email Secretariat@saus.org.za.' },
}));
app.use('/api', rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
}));

// ─── Body Parsing ─────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Static Uploads ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/news',       newsRoutes);
app.use('/api/events',     eventsRoutes);
app.use('/api/campaigns',  campaignsRoutes);
app.use('/api/media',      mediaRoutes);
app.use('/api/documents',  documentsRoutes);
app.use('/api/users',      usersRoutes);
app.use('/api/settings',   settingsRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/contact',    contactRoutes);
app.use('/api/public',     publicRoutes);

// ─── Health ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀  SAUS CMS API running on http://localhost:${PORT}`);
  console.log(`📊  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
