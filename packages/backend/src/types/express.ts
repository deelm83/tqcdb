import { User } from '@prisma/client';

// Extend Express Request interface to include admin and user properties
declare global {
  namespace Express {
    interface Request {
      admin?: {
        role: string;
        iat: number;
      };
    }
    interface User extends Omit<import('@prisma/client').User, 'createdAt' | 'updatedAt'> {
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

export {};
