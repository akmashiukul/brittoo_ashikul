import prisma from "../config/prisma.js";

export const getUsersAvailableRcc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const availableRcc = await prisma.redCacheCredit.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully fetched accumulated Red Cache Credits",
      data: availableRcc
    });
  } catch (error) {
    console.error("Error in geUsersAvailableRcc controller: ", error);
    next(error);
  }
}