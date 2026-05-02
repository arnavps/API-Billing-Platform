import { Router } from 'express';
import { DomainController } from '../controllers/domain.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', DomainController.addDomain);
router.get('/', DomainController.listDomains);
router.post('/:domainId/verify', DomainController.verifyDomain);
router.delete('/:domainId', DomainController.deleteDomain);

export default router;
