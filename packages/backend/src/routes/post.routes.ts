import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadPostImage } from '../utils/multerCloudinary';

const router = Router();

// Create post route
router.post('/create-post', authenticateToken, uploadPostImage.single('image'), PostController.create);

// List posts (paginated, public)
router.get('/recommended', authenticateToken, PostController.list);

// Get posts by the authenticated user (paginated)
router.get('/my-posts', authenticateToken, PostController.getPostsByUser);

// Get single post details (public)
router.get('/:id', authenticateToken, PostController.getOne);



export default router;
