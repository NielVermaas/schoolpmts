import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    schoolId?: string;
    familyId?: string;
  };
}

// AUTHENTICATION DISABLED FOR TESTING
// All users are automatically authenticated as mock users

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  // Bypass auth - set a mock parent user
  req.user = {
    id: 'mock-parent-id',
    email: 'parent@example.com',
    role: 'PARENT',
    familyId: 'mock-family-id',
  };
  next();
};

export const authorize = (..._roles: string[]) => {
  return (_req: AuthRequest, _res: Response, next: NextFunction) => {
    // Bypass authorization - allow all
    next();
  };
};

export const checkSchoolAccess = async (
  _req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  // Bypass school access check
  next();
};

export const checkFamilyAccess = async (
  _req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  // Bypass family access check
  next();
};
