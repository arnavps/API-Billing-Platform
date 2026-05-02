import { Router } from 'express';
import BillingController from '../controllers/billing.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Protected routes
router.get('/plans', protect, BillingController.getPlans);
router.post('/checkout', protect, BillingController.createCheckout);
router.post('/portal', protect, BillingController.createPortal);
router.get('/subscription', protect, BillingController.getSubscription);
router.get('/invoices', protect, BillingController.getInvoices);

export default router;
