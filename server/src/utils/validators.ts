import { z } from 'zod';

// Password criteria: 8-16 characters, at least 1 uppercase letter, at least 1 special character
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Name criteria: Min 20 characters, Max 60 characters
export const nameSchema = z
  .string()
  .trim()
  .min(20, 'Name must be at least 20 characters long')
  .max(60, 'Name cannot exceed 60 characters');

// Store Name criteria: Min 3 characters, Max 60 characters
export const storeNameSchema = z
  .string()
  .trim()
  .min(3, 'Store name must be at least 3 characters long')
  .max(60, 'Store name cannot exceed 60 characters');

// Address criteria: Max 400 characters
export const addressSchema = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address cannot exceed 400 characters');

// Email criteria
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address');

// User Registration Schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

// User Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// Admin Create User Schema
export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']).default('USER'),
  storeId: z.string().optional(),
});

// Admin Update User Schema
export const adminUpdateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']).optional(),
  password: passwordSchema.optional(),
  storeId: z.string().nullable().optional(),
});

// Create Store Schema
export const createStoreSchema = z.object({
  name: storeNameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().optional(),
});

// Update Store Schema
export const updateStoreSchema = z.object({
  name: storeNameSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  ownerId: z.string().nullable().optional(),
});

// Submit Rating Schema: 1 to 5 with optional review comment
export const submitRatingSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

// Store Owner Reply Schema
export const ownerReplySchema = z.object({
  reply: z.string().trim().min(1, 'Reply message is required').max(500, 'Reply cannot exceed 500 characters'),
});
