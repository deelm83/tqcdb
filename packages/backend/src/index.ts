import 'dotenv/config';
import './types/express';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import passport from './config/passport';
import generalsRoutes from './routes/generals';
import skillsRoutes from './routes/skills';
import authRoutes from './routes/auth';
import userAuthRoutes from './routes/userAuth';
import suggestionsRoutes from './routes/suggestions';
import formationsRoutes from './routes/formations';
import lineupsRoutes from './routes/lineups';
import adminGeneralsRoutes from './routes/admin/generals';
import adminSkillsRoutes from './routes/admin/skills';
import adminSuggestionsRoutes from './routes/admin/suggestions';
import adminFormationsRoutes from './routes/admin/formations';
import skillImageProcessorRoutes from './routes/admin/skillImageProcessor';

const app = express();
const PORT = process.env.PORT || 3001;

// Session store configuration
const PgSession = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Session middleware (for OAuth)
app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'default-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/generals', generalsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/auth', authRoutes); // Admin auth (JWT)
app.use('/api/user-auth', userAuthRoutes); // User OAuth
app.use('/api/suggestions', suggestionsRoutes); // User suggestions
app.use('/api/formations', formationsRoutes); // Formations
app.use('/api/lineups', lineupsRoutes); // Line-ups
app.use('/api/admin/generals', adminGeneralsRoutes);
app.use('/api/admin/skills', adminSkillsRoutes);
app.use('/api/admin/suggestions', adminSuggestionsRoutes); // Admin suggestions
app.use('/api/admin/formations', adminFormationsRoutes); // Admin formations
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
