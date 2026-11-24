import { Router } from 'express';
import { getAnalyticsReports } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getAnalyticsReports);

export default router;
