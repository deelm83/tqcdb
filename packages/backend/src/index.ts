import 'dotenv/config';
import './types/express';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import generalsRoutes from './routes/generals';
import skillsRoutes from './routes/skills';
import authRoutes from './routes/auth';
import adminGeneralsRoutes from './routes/admin/generals';
import adminSkillsRoutes from './routes/admin/skills';
import skillImageProcessorRoutes from './routes/admin/skillImageProcessor';

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
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Đã xảy ra lỗi!' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
