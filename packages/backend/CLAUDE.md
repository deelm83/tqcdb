# Backend Package

Express.js API server for Three Kingdoms Tactics Wiki.

## Tech Stack
- **Framework**: Express.js 4.21
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma 5.22
- **Auth**: JWT (cookies)

## Key Paths
- Entry point: `src/index.js`
- Routes: `src/routes/`
- Prisma schema: `prisma/schema.prisma`
- Data source: `../../../data/` (from prisma dir)

## API Endpoints
- `GET /api/generals` - List/search generals
- `GET /api/generals/:id` - Get general details
- `GET /api/skills` - List/search skills
- `GET /api/skills/:id` - Get skill details
- `POST /api/auth/login` - Admin login
- `/api/admin/*` - Admin CRUD (requires auth)

## Commands
```bash
npm run dev          # Start dev server (port 3001)
npx prisma db push   # Push schema changes
npx prisma db seed   # Seed database from JSON
npx prisma studio    # Open database GUI
```

## Docker
```bash
docker-compose up -d  # Start PostgreSQL
```
