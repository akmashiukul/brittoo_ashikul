import prisma from "../config/prisma.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'ALL',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      AND: [
        { deletedAt: null },
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { roll: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        
        status === 'VERIFIED' ? { isVerified: 'VERIFIED' } :
        status === 'PENDING' ? { isVerified: 'PENDING' } :
        status === 'UNVERIFIED' ? { isVerified: 'UNVERIFIED' } :
        status === 'SUSPENDED' ? { isSuspended: true } : {}
      ]
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          roll: true,
          role: true,
          selfie: true,
          idCardFront: true,
          idCardBack: true,
          ipAddress: true,
          latitude: true,
          longitude: true,
          emailVerified: true,
          isVerified: true,
          brittooVerified: true,
          securityScore: true,
          isSuspended: true,
          suspensionCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              rentedProducts: true,
              borrowedProducts: true,
              cacheCredits: true,
              rentalRequestsMade: true,
              rentalRequestsReceived: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const stats = await prisma.user.groupBy({
      by: ['isVerified', 'brittooVerified', 'isSuspended'],
      _count: true,
      where: { deletedAt: null }
    });

    const summary = {
      totalUsers,
      verified: stats.filter(s => s.isVerified === 'VERIFIED').reduce((acc, s) => acc + s._count, 0),
      pending: stats.filter(s => s.isVerified === 'PENDING').reduce((acc, s) => acc + s._count, 0),
      unverified: stats.filter(s => s.isVerified === 'UNVERIFIED').reduce((acc, s) => acc + s._count, 0),
      brittooVerified: stats.filter(s => s.brittooVerified === true).reduce((acc, s) => acc + s._count, 0),
      suspended: stats.filter(s => s.isSuspended === true).reduce((acc, s) => acc + s._count, 0)
    };

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit)
        },
        summary
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};