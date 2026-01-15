require('dotenv').config();
const express = require('express');
const cors = require('cors');
const generalsRoutes = require('./routes/generals');
const skillsRoutes = require('./routes/skills');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/generals', generalsRoutes);
app.use('/api/skills', skillsRoutes);

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
