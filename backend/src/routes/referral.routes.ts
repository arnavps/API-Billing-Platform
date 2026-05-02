import { Router } from 'express';
import { getReferralStats, inviteByEmail } from '../controllers/referral.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/stats', getReferralStats);
router.post('/invite', inviteByEmail);

export default router;
