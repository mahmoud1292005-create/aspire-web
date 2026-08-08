import { Router } from 'express';
import * as supervisorController from '../controllers/supervisorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, requireRole('Supervisor', 'Admin'));

router.get('/dashboard', supervisorController.getDashboard);
router.get('/participants', supervisorController.getSupervisorParticipants);

export default router;
