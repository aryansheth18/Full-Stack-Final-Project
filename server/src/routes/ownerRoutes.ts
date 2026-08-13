import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/ownerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Restricted to STORE_OWNER (or ADMIN)
router.use(authenticate, authorize(['STORE_OWNER', 'ADMIN']));

router.get('/dashboard', getOwnerDashboard);

export default router;
