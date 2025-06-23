import prisma from "../config/prisma";
import { CustomError } from "../lib/customError";

export const createGccRequest = async (req, res, next) => {
  try {
    const { 
      phoneNumber, 
      productName, 
      depositMethod, 
      address, 
      city, 
      estimatedDepositDateTime,
      pickupPointId 
    } = req.body;
    
    const userId = req.user.id;
    if (!phoneNumber || !depositMethod || !estimatedDepositDateTime) {
      throw new CustomError('Missing required fields', 400);
    }

    if (depositMethod === 'DEPOSIT_FROM_HOME' && (!address || !city)) {
      throw new CustomError('Address and city are required for home pickup', 400);
    }

    if (depositMethod === 'DROP_AT_PUP' && !pickupPointId) {
      throw new CustomError('Pickup point is required for drop-off', 400)
    }

    await prisma.gccRequest.create({
      data: {
        userId,
        phoneNumber,
        productName,
        depositMethod,
        address,
        city,
        estimatedDepositDateTime: new Date(estimatedDepositDateTime),
        pickupPointId,
      }
    });

    res.status(201).json({
      success: true,
      message: 'GCC request created successfully',
    });
  } catch (error) {
    console.error('Error creating GCC request:', error);
    next(error);
  }
};


export const acceptGccRequest = async (req, res, next) => {

}