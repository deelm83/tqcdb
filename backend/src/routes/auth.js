const express = require('express');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mật khẩu không đúng' });
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
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Đã đăng xuất' });
});

// GET /api/auth/check
router.get('/check', requireAuth, (req, res) => {
  res.json({ authenticated: true, admin: req.admin });
});

module.exports = router;
