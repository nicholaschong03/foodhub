import { Router } from 'express';
import userRoutes from './user.routes';
import postRoutes from './post.routes';

const apiRouter = Router();

// Mount all API routes
apiRouter.use('/users', userRoutes);

// Add more route categories here
apiRouter.use('/posts', postRoutes);
// apiRouter.use('/comments', commentRoutes);

export default apiRouter;