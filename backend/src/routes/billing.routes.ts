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
router.get('/current-cycle', protect, BillingController.getCurrentCycle);
router.get('/payment-methods', protect, BillingController.getPaymentMethods);
router.post('/payment-methods', protect, BillingController.addPaymentMethod);
router.post('/invoices/:invoiceId/pay', protect, BillingController.payInvoice);

export default router;
