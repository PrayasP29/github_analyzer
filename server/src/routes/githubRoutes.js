import { Router } from 'express';
import { getGithubProfile, getContributions } from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Registered before the profile route: `/:username` only matches a single path
// segment, but the specific route reads first either way.
router.get('/:username/contributions', protect, getContributions);
router.get('/:username', protect, getGithubProfile);

export default router;
