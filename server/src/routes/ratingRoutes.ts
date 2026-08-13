import { Router } from 'express';
import { submitRating, getMyRatings } from '../controllers/ratingController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitRatingSchema } from '../utils/validators.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(submitRatingSchema), submitRating);
router.get('/my', getMyRatings);

export default router;
