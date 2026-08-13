import { Request, Response } from 'express';
import prisma from '../prisma.js';

// Get Store Owner Dashboard
export const getOwnerDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Find the store(s) owned by this user
    const stores = await prisma.store.findMany({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store currently associated with this store owner account. Please contact an administrator.',
        store: null,
        ratings: [],
        stats: {
          averageRating: 0,
          totalRatings: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });
    }

    const primaryStore = stores[0];
    const totalRatings = primaryStore.ratings.length;
    const avgRating =
      totalRatings > 0
        ? Number((primaryStore.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2))
        : 0;

    // Rating distribution
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    primaryStore.ratings.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    const reviews = primaryStore.ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      ownerReply: r.ownerReply,
      ownerRepliedAt: r.ownerRepliedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    res.status(200).json({
      success: true,
      hasStore: true,
      store: {
        id: primaryStore.id,
        name: primaryStore.name,
        email: primaryStore.email,
        address: primaryStore.address,
        createdAt: primaryStore.createdAt,
      },
      stats: {
        averageRating: avgRating,
        totalRatings,
        distribution,
      },
      ratings: reviews,
    });
  } catch (error: any) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve owner dashboard data',
      error: error.message,
    });
  }
};

// Store Owner Reply to Customer Review
export const replyToRating = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { ratingId } = req.params;
    const { reply } = req.body;

    const rating = await prisma.rating.findUnique({
      where: { id: ratingId },
      include: {
        store: true,
      },
    });

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating review not found' });
    }

    // Verify this user owns this store (or is Admin)
    if (req.user.role !== 'ADMIN' && rating.store.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only reply to reviews for your own store',
      });
    }

    const updated = await prisma.rating.update({
      where: { id: ratingId },
      data: {
        ownerReply: reply.trim(),
        ownerRepliedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Reply posted successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to post reply',
      error: error.message,
    });
  }
};
