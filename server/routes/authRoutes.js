import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/signup',
  [
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('college').trim().notEmpty(),
    body('department').trim().notEmpty(),
    body('registration_number').trim().notEmpty(),
  ],
  authController.signup
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  authController.login
);

router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/forgot-password', [body('email').isEmail()], authController.forgotPassword);
router.post('/reset-password', [body('password').isLength({ min: 8 })], authController.resetPassword);

export default router;
