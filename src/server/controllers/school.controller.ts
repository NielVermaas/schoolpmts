import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class SchoolController {
  getAllSchools = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schools = await prisma.school.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          logoUrl: true,
          active: true,
          createdAt: true
        }
      });

      res.json({
        status: 'success',
        data: { schools }
      });
    } catch (error) {
      next(error);
    }
  };

  createSchool = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const school = await prisma.school.create({
        data: req.body
      });

      res.status(201).json({
        status: 'success',
        data: { school }
      });
    } catch (error) {
      next(error);
    }
  };

  getSchoolById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const school = await prisma.school.findUnique({
        where: { id: req.params.id }
      });

      if (!school) {
        throw new AppError('School not found', 404);
      }

      res.json({
        status: 'success',
        data: { school }
      });
    } catch (error) {
      next(error);
    }
  };

  updateSchool = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const school = await prisma.school.update({
        where: { id: req.params.id },
        data: req.body
      });

      res.json({
        status: 'success',
        data: { school }
      });
    } catch (error) {
      next(error);
    }
  };
}
