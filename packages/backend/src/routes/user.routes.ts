import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadPostImage, uploadProfileImage } from '../utils/multerCloudinary';

const router = Router();

// Register new user
router.post('/register', UserController.register);

// Username availability check
router.get('/check-username', UserController.checkUsername);

// Email availability check
router.get('/check-email', UserController.checkEmail);

// Get custom plan for user
router.get('/:id/custom-plan', UserController.getCustomPlan);

// Update user profile
router.put('/:id', authenticateToken, uploadProfileImage.single('profilePicture'), UserController.updateProfile);

// Get user profile by id
router.get('/:id', authenticateToken, UserController.getUserById);

export default router;