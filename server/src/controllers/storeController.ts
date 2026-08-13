import { Request, Response } from 'express';
import prisma from '../prisma.js';

// Get All Stores (For Normal Users & Visitors)
export const getAllStores = async (req: Request, res: Response) => {
  try {
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const currentUserId = req.user?.id;

    const where: any = {};

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { name: { contains: s } },
        { address: { contains: s } },
      ];
    } else {
      if (name) where.name = { contains: String(name).trim() };
      if (address) where.address = { contains: String(address).trim() };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    let formattedStores = stores.map((s) => {
      const totalRatings = s.ratings.length;
      const avgRating =
        totalRatings > 0
          ? Number((s.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2))
          : 0;

      // Find current user's submitted rating if authenticated
      let userRating: number | null = null;
      let userRatingId: string | null = null;

      if (currentUserId) {
        const found = s.ratings.find((r) => r.userId === currentUserId);
        if (found) {
          userRating = found.rating;
          userRatingId = found.id;
        }
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating: avgRating,
        totalRatings,
        userRating,
        userRatingId,
        createdAt: s.createdAt,
      };
    });

    // Sorting
    const orderDirection = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;
    const sortField = String(sortBy);

    formattedStores.sort((a: any, b: any) => {
      if (sortField === 'overallRating' || sortField === 'rating') {
        return (a.overallRating - b.overallRating) * orderDirection;
      }
      if (sortField === 'address') {
        return a.address.localeCompare(b.address) * orderDirection;
      }
      return a.name.localeCompare(b.name) * orderDirection;
    });

    res.status(200).json({
      success: true,
      count: formattedStores.length,
      stores: formattedStores,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores',
      error: error.message,
    });
  }
};

// Get Single Store By ID
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const totalRatings = store.ratings.length;
    const avgRating =
      totalRatings > 0
        ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2))
        : 0;

    let userRating: number | null = null;
    if (currentUserId) {
      const found = store.ratings.find((r) => r.userId === currentUserId);
      if (found) {
        userRating = found.rating;
      }
    }

    res.status(200).json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        overallRating: avgRating,
        totalRatings,
        userRating,
        ratings: store.ratings.map((r) => ({
          id: r.id,
          rating: r.rating,
          userName: r.user.name,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve store details',
      error: error.message,
    });
  }
};
