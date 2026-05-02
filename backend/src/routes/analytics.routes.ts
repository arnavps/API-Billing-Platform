import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/overview', AnalyticsController.getOverview);
router.get('/series', AnalyticsController.getTimeSeries);
router.get('/endpoints', AnalyticsController.getTopEndpoints);
router.get('/errors', AnalyticsController.getErrors);

export default router;
