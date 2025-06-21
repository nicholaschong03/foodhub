import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { likePost, unlikePost, getPostLikes, checkLikeStatus, getLikedPosts, getLikedPostsByUsername } from '../controllers/postLikesController';
import { savePost, unsavePost, checkSaveStatus, getSavedPosts, getSavedPostsByUsername } from '../controllers/postSavesController';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';
import { uploadPostImage } from '../utils/multerCloudinary';
import * as postLikeService from '../services/postLike.service';

const router = Router();

// Create post route
router.post('/create-post', authenticateToken, uploadPostImage.single('image'), PostController.create);

// List posts (paginated, public)
router.get('/recommended', authenticateToken, PostController.list);

// Get posts by the authenticated user (paginated)
router.get('/my-posts', authenticateToken, PostController.getPostsByUser);

// Get user's liked posts
router.get('/liked', authenticateToken, getLikedPosts);

// Get user's saved posts
router.get('/saved', authenticateToken, getSavedPosts);

// List posts with distance sorting
router.get('/nearby', authenticateToken, PostController.listWithDistance);

// Get single post details (public)
router.get('/:id', authenticateToken, PostController.getOne);

// Delete post by ID
router.delete('/:id', authenticateToken, PostController.delete);

// Like post
router.post('/:postId/like', authenticateToken, likePost);

// Unlike post
router.delete('/:postId/like', authenticateToken, unlikePost);

// Check if post is liked
router.get('/:postId/like', authenticateToken, checkLikeStatus);

// Save post
router.post('/:postId/save', authenticateToken, savePost);

// Unsave post
router.delete('/:postId/save', authenticateToken, unsavePost);

// Check if post is saved
router.get('/:postId/save', authenticateToken, checkSaveStatus);

// Get posts by username
router.get('/user/:username', authenticateToken, PostController.getPostsByUsername);

// Get liked posts by username
router.get('/liked/:username', authenticateToken, getLikedPostsByUsername);

// Get saved posts by username
router.get('/saved/:username', authenticateToken, getSavedPostsByUsername);

// Add comment routes
router.get('/:postId/comments', authenticateToken, PostController.getCommentsForPostController);
router.post('/:postId/comments', authenticateToken, PostController.addCommentToPostController);

export default router;
