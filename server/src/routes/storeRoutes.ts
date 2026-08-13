import { Router } from 'express';
import { getAllStores, getStoreById } from '../controllers/storeController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// Stores can be browsed with optional authentication (to include user's submitted rating)
router.get('/', optionalAuthenticate, getAllStores);
router.get('/:id', optionalAuthenticate, getStoreById);

export default router;
