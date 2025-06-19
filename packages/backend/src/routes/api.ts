import { Router } from 'express';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import searchRoutes from './search.routes';
import authRoutes from './auth.routes';

const apiRouter = Router();

// Mount all API routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/posts', postRoutes);
apiRouter.use('/search', searchRoutes);

// Add more route categories here
// apiRouter.use('/comments', commentRoutes);

export default apiRouter;