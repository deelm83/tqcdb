# Frontend Package

Next.js 16 web application for Three Kingdoms Tactics Wiki.

## Tech Stack
- **Framework**: Next.js 16.1 (App Router)
- **UI**: React 19.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4

## Key Paths
- Pages: `src/app/`
- Components: `src/components/`
- API clients: `src/lib/api.ts`, `src/lib/adminApi.ts`
- Types: `src/types/`
- Images: `public/images/`

## Pages
- `/` - Home with search
- `/generals` - Generals list
- `/generals/[id]` - General detail
- `/skills` - Skills list
- `/skills/[slug]` - Skill detail
- `/admin` - Admin dashboard
- `/admin/generals` - Manage generals
- `/admin/skills` - Manage skills

## Commands
```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build
npm run start  # Start production server
```

## API Connection
Backend API at `http://localhost:3001` (configurable via env).
