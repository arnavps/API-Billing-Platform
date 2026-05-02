import express from 'express';
import { getActivityLogs, getTeamActivityLogs } from '../controllers/activityLog.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getActivityLogs);
router.get('/team', getTeamActivityLogs);

export default router;
