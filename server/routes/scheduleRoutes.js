import { Router } from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', scheduleController.getSchedules);
router.post('/', requireRole('Supervisor', 'Admin'), scheduleController.createSchedule);
router.put('/:id', requireRole('Supervisor', 'Admin'), scheduleController.updateSchedule);
router.delete('/:id', requireRole('Supervisor', 'Admin'), scheduleController.deleteSchedule);
router.post('/request', requireRole('Participant'), scheduleController.requestSchedule);
router.put('/approve/:requestId', requireRole('Supervisor', 'Admin'), scheduleController.approveRequest);
router.put('/reject/:requestId', requireRole('Supervisor', 'Admin'), scheduleController.rejectRequest);

export default router;
