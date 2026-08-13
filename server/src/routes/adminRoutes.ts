import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  createStoreSchema,
  updateStoreSchema,
} from '../utils/validators.js';

const router = Router();

// Protect all admin routes with authentication & ADMIN role check
router.use(authenticate, authorize(['ADMIN']));

// Dashboard Stats
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', validate(adminCreateUserSchema), createUser);
router.put('/users/:id', validate(adminUpdateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);

// Store Management
router.get('/stores', getStores);
router.post('/stores', validate(createStoreSchema), createStore);
router.put('/stores/:id', validate(updateStoreSchema), updateStore);
router.delete('/stores/:id', deleteStore);

export default router;
