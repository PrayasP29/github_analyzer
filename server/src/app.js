import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import githubRoutes from './routes/githubRoutes.js';

const app = express();

app.use(cors());
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
