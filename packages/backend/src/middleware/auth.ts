import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

interface AdminPayload {
  role: string;
  iat: number;
}

/**
 * Middleware to verify JWT token from cookie or Authorization header
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies?.adminToken;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

/**
 * Generate JWT token for admin
 */
export function generateToken(): string {
  return jwt.sign(
    { role: 'admin', iat: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export { JWT_SECRET };
