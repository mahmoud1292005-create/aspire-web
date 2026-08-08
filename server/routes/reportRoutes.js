import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, requireRole('Supervisor', 'Admin'));

router.get('/participants', reportController.participantsReport);
router.get('/events', reportController.eventsReport);
router.get('/schedules', reportController.schedulesReport);
router.get('/feedback', reportController.feedbackReport);

export default router;
