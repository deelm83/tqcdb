const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

/**
 * Middleware to verify JWT token from cookie or Authorization header
 */
function requireAuth(req, res, next) {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies?.adminToken;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

/**
 * Generate JWT token for admin
 */
function generateToken() {
  return jwt.sign(
    { role: 'admin', iat: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { requireAuth, generateToken, JWT_SECRET };
