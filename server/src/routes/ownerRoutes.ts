import { Router } from 'express';
import { getOwnerDashboard, replyToRating } from '../controllers/ownerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ownerReplySchema } from '../utils/validators.js';

const router = Router();

router.use(authenticate, authorize(['STORE_OWNER', 'ADMIN']));

router.get('/dashboard', getOwnerDashboard);
router.post('/ratings/:ratingId/reply', validate(ownerReplySchema), replyToRating);

export default router;
