import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    schoolId?: string;
    familyId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        schoolId: true,
        familyId: true,
        active: true
      }
    });

    if (!user || !user.active) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized', 403));
    }

    next();
  };
};

// Check if user belongs to the school
export const checkSchoolAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const schoolId = req.params.schoolId || req.body.schoolId;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Super admins have access to all schools
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // School admins can only access their school
    if (req.user.role === 'SCHOOL_ADMIN' && req.user.schoolId !== schoolId) {
      throw new AppError('Not authorized to access this school', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user can access family data
export const checkFamilyAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const familyId = req.params.familyId || req.body.familyId;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Super admins have access to all families
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Parents can only access their own family
    if (req.user.role === 'PARENT' && req.user.familyId !== familyId) {
      throw new AppError('Not authorized to access this family', 403);
    }

    // School admins can access families in their school
    if (req.user.role === 'SCHOOL_ADMIN') {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
        select: { schoolId: true }
      });

      if (!family || family.schoolId !== req.user.schoolId) {
        throw new AppError('Not authorized to access this family', 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
