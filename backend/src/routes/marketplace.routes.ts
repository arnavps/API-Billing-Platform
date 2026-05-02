import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller';
import { protect, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', MarketplaceController.listAPIs);
router.get('/featured', MarketplaceController.getFeatured);
router.get('/:slug', MarketplaceController.getAPIDetails);

// Authenticated search (Global search)
router.get('/search', protect, MarketplaceController.globalSearch);

export default router;
