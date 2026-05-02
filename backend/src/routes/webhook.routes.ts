import express from 'express';
import { protect } from '../middleware/auth';
import * as webhookController from '../controllers/webhook.controller';

const router = express.Router();

router.use(protect);

router.post('/', webhookController.createWebhook);
router.get('/', webhookController.getWebhooks);
router.delete('/:id', webhookController.deleteWebhook);
router.get('/:id/events', webhookController.getWebhookEvents);

export default router;
