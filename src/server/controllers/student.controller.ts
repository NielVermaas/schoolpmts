import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class StudentController {
  getFamilyStudents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const students = await prisma.student.findMany({
        where: { familyId: req.params.familyId }
      });

      res.json({
        status: 'success',
        data: { students }
      });
    } catch (error) {
      next(error);
    }
  };

  createStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.create({
        data: req.body
      });

      res.status(201).json({
        status: 'success',
        data: { student }
      });
    } catch (error) {
      next(error);
    }
  };

  updateStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.update({
        where: { id: req.params.id },
        data: req.body
      });

      res.json({
        status: 'success',
        data: { student }
      });
    } catch (error) {
      next(error);
    }
  };
}
