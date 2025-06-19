import {Router} from 'express';
import { search } from '../controllers/searchController';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, search);

export default router;