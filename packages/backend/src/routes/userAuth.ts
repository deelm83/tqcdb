import express, { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV !== 'production';

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google` }),
  (_req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}?login=success`);
  }
);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${FRONTEND_URL}/login?error=facebook` }),
  (_req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}?login=success`);
  }
);

// Discord OAuth routes
router.get('/discord', passport.authenticate('discord'));

router.get(
  '/discord/callback',
  passport.authenticate('discord', { failureRedirect: `${FRONTEND_URL}/login?error=discord` }),
  (_req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}?login=success`);
  }
);

// Get current user
router.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }
  res.json({ user: req.user });
});

// Dev login (development only)
router.post('/dev-login', async (req: Request, res: Response, next: NextFunction) => {
  if (!isDev) {
    res.status(403).json({ error: 'Dev login only available in development mode' });
    return;
  }

  try {
    const { name } = req.body;
    const displayName = name || 'Dev User';

    // Find or create dev user
    let user = await prisma.user.findFirst({
      where: { email: 'dev@localhost' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          displayName,
          email: 'dev@localhost',
          avatarUrl: null,
          role: 'USER'
        }
      });
    } else if (name && user.displayName !== displayName) {
      // Update name if provided
      user = await prisma.user.update({
        where: { id: user.id },
        data: { displayName }
      });
    }

    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ success: true, user });
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ error: 'Đăng nhập thất bại' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ success: true, message: 'Đã đăng xuất' });
  });
});

export default router;
