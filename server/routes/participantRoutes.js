import { Router } from 'express';
import * as participantController from '../controllers/participantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('Supervisor', 'Admin'), participantController.getParticipants);
router.get('/:id', participantController.getParticipant);
router.put('/:id', participantController.updateParticipant);

export default router;
