import express, { Request, Response } from 'express';
import { generateToken, requireAuth } from '../middleware/auth';

const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

interface LoginBody {
  password?: string;
}

// POST /api/auth/login
router.post('/login', (req: Request<object, object, LoginBody>, res: Response) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: 'Vui lòng nhập mật khẩu' });
    return;
  }

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Mật khẩu không đúng' });
    return;
  }

  const token = generateToken();

  // Set httpOnly cookie
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ success: true, message: 'Đăng nhập thành công' });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Đã đăng xuất' });
});

// GET /api/auth/check
router.get('/check', requireAuth, (req: Request, res: Response) => {
  res.json({ authenticated: true, admin: req.admin });
});

export default router;
