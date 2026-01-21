import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require user authentication (via passport session)
 */
export function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: 'Vui lòng đăng nhập' });
    return;
  }
  next();
}

/**
 * Middleware to optionally attach user if authenticated
 */
export function optionalUser(req: Request, res: Response, next: NextFunction): void {
  // User is already attached by passport if session exists
  next();
}
