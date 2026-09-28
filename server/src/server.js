import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

// Render injects PORT; Number() guards against the string that would otherwise
// reach listen() and keep the 5000 fallback alive on the free plan.
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from .env');
}

// 0.0.0.0 is required on Render - the default localhost bind is unreachable
// from outside the container. Listening before the DB connect keeps /health
// answering during a slow/unavailable Mongo, which is the whole point of the
// endpoint. A failed connect still exits via db.js, so Render restarts us.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

await connectDB();
