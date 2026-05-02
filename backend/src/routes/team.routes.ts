import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', TeamController.createTeam);
router.get('/:teamId', TeamController.getTeamDetails);
router.post('/:teamId/invite', TeamController.inviteMember);
router.post('/join', TeamController.joinTeam);
router.delete('/:teamId/members/:targetUserId', TeamController.removeMember);

export default router;
