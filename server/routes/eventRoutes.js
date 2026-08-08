import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', eventController.getEvents);
router.post('/', requireRole('Supervisor', 'Admin'), eventController.createEvent);
router.put('/:id', requireRole('Supervisor', 'Admin'), eventController.updateEvent);
router.delete('/:id', requireRole('Supervisor', 'Admin'), eventController.deleteEvent);
router.post('/request', requireRole('Participant'), eventController.requestEvent);
router.put('/approve/:registrationId', requireRole('Supervisor', 'Admin'), eventController.approveRegistration);
router.put('/reject/:registrationId', requireRole('Supervisor', 'Admin'), eventController.rejectRegistration);

export default router;
