import { Router } from 'express';
import { getGithubProfile } from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:username', protect, getGithubProfile);

export default router;
