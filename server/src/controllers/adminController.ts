import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';

// Get Admin Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalStores, totalRatings, roleCounts, recentUsers, recentRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.rating.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Average store rating
    const allRatings = await prisma.rating.findMany({
      select: { rating: true },
    });
    const avgRating =
      allRatings.length > 0
        ? Number((allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        avgRating,
        roleBreakdown: roleCounts.reduce((acc: any, curr) => {
          acc[curr.role] = curr._count.role;
          return acc;
        }, {}),
        recentUsers,
        recentRatings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard statistics',
      error: error.message,
    });
  }
};

// Get Users with filtering, search, sorting, and pagination
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = String(role);
    }

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { name: { contains: s } },
        { email: { contains: s } },
        { address: { contains: s } },
      ];
    } else {
      if (name) where.name = { contains: String(name).trim() };
      if (email) where.email = { contains: String(email).trim() };
      if (address) where.address = { contains: String(address).trim() };
    }

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    const orderDirection = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: orderDirection },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Format users and compute Store Owner ratings
    const formattedUsers = users.map((u) => {
      let storeRating: number | null = null;
      let totalStoreRatings = 0;
      let storeDetails: any = null;

      if (u.role === 'STORE_OWNER' && u.stores.length > 0) {
        const store = u.stores[0];
        storeDetails = {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
        };
        totalStoreRatings = store.ratings.length;
        if (store.ratings.length > 0) {
          const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
          storeRating = Number((sum / store.ratings.length).toFixed(2));
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        storeRating,
        totalStoreRatings,
        storeDetails,
        createdAt: u.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
};

// Get User by ID (with full details and rating if store owner)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stores: {
          include: {
            ratings: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        ratings: {
          include: {
            store: { select: { id: true, name: true, address: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let storeRating: number | null = null;
    let totalStoreRatings = 0;
    if (user.role === 'STORE_OWNER' && user.stores.length > 0) {
      const allRatings = user.stores.flatMap((s) => s.ratings);
      totalStoreRatings = allRatings.length;
      if (allRatings.length > 0) {
        storeRating = Number((allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length).toFixed(2));
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        storeRating,
        totalStoreRatings,
        stores: user.stores,
        submittedRatings: user.ratings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details',
      error: error.message,
    });
  }
};

// Admin Create User (Admin, Normal, or Store Owner)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address, role = 'USER', storeId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    // If Store Owner and storeId provided, assign store ownership
    if (role === 'STORE_OWNER' && storeId) {
      await prisma.store.update({
        where: { id: storeId },
        data: { ownerId: user.id },
      });
    }

    res.status(201).json({
      success: true,
      message: `User created successfully as ${role}`,
      user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

// Admin Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, address, role, password, storeId } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check email collision
    if (email && email.toLowerCase() !== existing.email) {
      const collision = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (collision) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (address) updateData.address = address;
    if (role) updateData.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        updatedAt: true,
      },
    });

    if (storeId !== undefined) {
      if (storeId === null) {
        await prisma.store.updateMany({
          where: { ownerId: id },
          data: { ownerId: null },
        });
      } else {
        await prisma.store.update({
          where: { id: storeId },
          data: { ownerId: id },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Admin Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own administrator account',
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Unlink any stores owned by this user
    await prisma.store.updateMany({
      where: { ownerId: id },
      data: { ownerId: null },
    });

    // Delete user (cascade will remove their submitted ratings)
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} was successfully deleted`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// Admin Get Stores with overall rating, search, sorting
export const getStores = async (req: Request, res: Response) => {
  try {
    const { search, name, email, address, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { name: { contains: s } },
        { email: { contains: s } },
        { address: { contains: s } },
      ];
    } else {
      if (name) where.name = { contains: String(name).trim() };
      if (email) where.email = { contains: String(email).trim() };
      if (address) where.address = { contains: String(address).trim() };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { rating: true } },
      },
    });

    // Calculate rating metrics
    let formattedStores = stores.map((s) => {
      const totalRatings = s.ratings.length;
      const averageRating =
        totalRatings > 0
          ? Number((s.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2))
          : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner: s.owner,
        rating: averageRating,
        totalRatings,
        createdAt: s.createdAt,
      };
    });

    // Handle in-memory sorting for computed rating or standard fields
    const orderDirection = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
    const sortField = String(sortBy);

    formattedStores.sort((a: any, b: any) => {
      if (sortField === 'rating') {
        return (a.rating - b.rating) * orderDirection;
      }
      if (sortField === 'name') {
        return a.name.localeCompare(b.name) * orderDirection;
      }
      if (sortField === 'email') {
        return a.email.localeCompare(b.email) * orderDirection;
      }
      if (sortField === 'address') {
        return a.address.localeCompare(b.address) * orderDirection;
      }
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderDirection;
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

// Admin Create Store
export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingStore = await prisma.store.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'A store with this email address already exists',
      });
    }

    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) {
        return res.status(400).json({ success: false, message: 'Specified store owner does not exist' });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email: email.toLowerCase(),
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      store: {
        ...store,
        rating: 0,
        totalRatings: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create store',
      error: error.message,
    });
  }
};

// Admin Update Store
export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (email && email.toLowerCase() !== existing.email) {
      const collision = await prisma.store.findUnique({ where: { email: email.toLowerCase() } });
      if (collision) {
        return res.status(400).json({ success: false, message: 'Email address already in use by another store' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (address) updateData.address = address;
    if (ownerId !== undefined) updateData.ownerId = ownerId;

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { rating: true } },
      },
    });

    const totalRatings = updatedStore.ratings.length;
    const avg =
      totalRatings > 0
        ? Number((updatedStore.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        email: updatedStore.email,
        address: updatedStore.address,
        owner: updatedStore.owner,
        rating: avg,
        totalRatings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update store',
      error: error.message,
    });
  }
};

// Admin Delete Store
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Cascade delete store and associated ratings
    await prisma.store.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: `Store ${store.name} was successfully deleted`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete store',
      error: error.message,
    });
  }
};
