require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const generalsRoutes = require('./routes/generals');
const skillsRoutes = require('./routes/skills');
const authRoutes = require('./routes/auth');
const adminGeneralsRoutes = require('./routes/admin/generals');
const adminSkillsRoutes = require('./routes/admin/skills');
const skillImageProcessorRoutes = require('./routes/admin/skillImageProcessor');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/generals', generalsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/generals', adminGeneralsRoutes);
app.use('/api/admin/skills', adminSkillsRoutes);
app.use('/api/admin/skills/process-image', skillImageProcessorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Đã xảy ra lỗi!' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
