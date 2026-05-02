import express from 'express';
import { protect } from '../middleware/auth';
import * as notificationController from '../controllers/notification.controller';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
