import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import supervisorRoutes from './routes/supervisorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config({ path: '../.env' });
dotenv.config();

// Cloudflare Workers' bundler currently has an unresolved bug with
// iconv-lite (pulled in transitively by express.json() -> body-parser ->
// raw-body -> iconv-lite) that crashes the Worker at startup with
// "require_streams(...) is not a function". Our API only ever needs UTF-8
// JSON, so we use a tiny hand-rolled parser instead of express.json() to
// avoid that whole dependency chain — this works identically in plain Node
// (local dev, Render) and in Workers.
function jsonBodyParser(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) return next();

  let raw = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    raw += chunk;
  });
  req.on('end', () => {
    if (!raw) {
      req.body = {};
      return next();
    }
    try {
      req.body = JSON.parse(raw);
      next();
    } catch (err) {
      res.status(400).json({ message: 'Invalid JSON body' });
    }
  });
  req.on('error', next);
}

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(jsonBodyParser);
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
