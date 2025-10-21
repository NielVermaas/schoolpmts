import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class FamilyController {
  getSchoolFamilies = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const families = await prisma.family.findMany({
        where: { schoolId: req.params.schoolId },
        include: {
          students: true,
          _count: {
            select: {
              invoices: true,
              payments: true
            }
          }
        }
      });

      res.json({
        status: 'success',
        data: { families }
      });
    } catch (error) {
      next(error);
    }
  };

  createFamily = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.family.create({
        data: req.body,
        include: {
          students: true
        }
      });

      res.status(201).json({
        status: 'success',
        data: { family }
      });
    } catch (error) {
      next(error);
    }
  };

  getFamilyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.family.findUnique({
        where: { id: req.params.id },
        include: {
          students: true,
          school: true
        }
      });

      if (!family) {
        throw new AppError('Family not found', 404);
      }

      res.json({
        status: 'success',
        data: { family }
      });
    } catch (error) {
      next(error);
    }
  };

  updateFamily = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.family.update({
        where: { id: req.params.id },
        data: req.body
      });

      res.json({
        status: 'success',
        data: { family }
      });
    } catch (error) {
      next(error);
    }
  };
}
