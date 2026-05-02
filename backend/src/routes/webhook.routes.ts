import express from 'express';
import { protect } from '../middleware/auth';
import {
  createWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveries
} from '../controllers/webhook.controller';

const router = express.Router();

router.use(protect);

router.post('/', createWebhook);
router.get('/', getWebhooks);
router.patch('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);
router.post('/:id/test', testWebhook);
router.get('/:id/deliveries', getWebhookDeliveries);

export default router;
