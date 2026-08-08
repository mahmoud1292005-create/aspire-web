import { Router } from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRole('Participant'), feedbackController.submitFeedback);
router.get('/', requireRole('Supervisor', 'Admin'), feedbackController.getFeedback);
router.get('/:eventId', requireRole('Supervisor', 'Admin'), feedbackController.getFeedbackByEvent);

export default router;
