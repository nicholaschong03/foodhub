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

// Follow/unfollow/isFollowing/followers/following
router.post('/:userId/follow', authenticateToken, UserController.follow);
router.delete('/:userId/follow', authenticateToken, UserController.unfollow);
router.get('/:userId/is-following', authenticateToken, UserController.isFollowing);
router.get('/:userId/followers', UserController.getFollowers);
router.get('/:userId/following', UserController.getFollowing);

// Update user profile
router.put('/:id', authenticateToken, uploadProfileImage.single('profilePicture'), UserController.updateProfile);

// Get user profile by id
router.get('/:id', authenticateToken, UserController.getUserById);

// Get user profile by username
router.get('/username/:username', UserController.getUserByUsername);



export default router;