import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import githubRoutes from './routes/githubRoutes.js';

const app = express();

// Origins allowed to call the API, comma-separated so staging/prod can be added
// without code changes. Unset falls back to the Vite dev origin, so local dev
// needs no config - but Render MUST set CLIENT_URL to the real deployed frontend
// origin, otherwise every browser call is blocked. No credentials: auth is a
// Bearer header from localStorage, not a cookie, so credentials:true would only
// add cookie handling we don't use.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);

// Registered before /api/health so the monitoring URL is a stable public path.
// No DB, auth, or GitHub call - it only proves the Express process is alive.
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GitHub Profile Analyzer API is healthy',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GitHub Profile Analyzer API is running',
  });
});

export default app;
