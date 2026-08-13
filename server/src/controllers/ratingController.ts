import { Request, Response } from 'express';
import prisma from '../prisma.js';

// Submit or Update a Rating (1 to 5)
export const submitRating = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { storeId, rating, comment } = req.body;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Upsert rating (create if new, update if already exists)
    const result = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
      update: {
        rating: Number(rating),
        comment: comment !== undefined ? comment : undefined,
      },
      create: {
        userId: req.user.id,
        storeId,
        rating: Number(rating),
        comment: comment || null,
      },
      include: {
        store: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    // Compute new store average
    const storeRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });
    const avg = Number(
      (storeRatings.reduce((acc, r) => acc + r.rating, 0) / storeRatings.length).toFixed(2)
    );

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: result.rating,
        comment: result.comment,
        storeId: result.storeId,
        storeName: result.store.name,
        newOverallRating: avg,
        totalRatings: storeRatings.length,
      },
    });
  } catch (error: any) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message,
    });
  }
};

// Get current user's submitted ratings
export const getMyRatings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const ratings = await prisma.rating.findMany({
      where: { userId: req.user.id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ratings',
      error: error.message,
    });
  }
};
