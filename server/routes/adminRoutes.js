import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, requireRole('Admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/supervisors', adminController.getSupervisors);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSystemSettings);

export default router;
