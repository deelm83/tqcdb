# Three Kingdoms Tactics Wiki

A comprehensive, searchable wiki for the SEA version of Three Kingdoms Tactics (三国志战略版).

## Quick Start

```bash
# Install dependencies
npm install

# Start PostgreSQL
cd packages/backend && docker-compose up -d

# Start backend (port 3001)
npm run dev:backend

# Start frontend (port 3000)
npm run dev:frontend
```

## Project Structure

```
tqc-wiki/
├── packages/
│   ├── backend/      # Express.js API + Prisma + PostgreSQL
│   ├── frontend/     # Next.js 16 + React 19 + Tailwind
│   └── scripts/      # Python scrapers + data tools
├── data/             # JSON data (generals, skills)
├── docs/             # Documentation
└── database/         # SQL backups
```

## Packages

| Package | Description | Port |
|---------|-------------|------|
| `packages/backend` | REST API with PostgreSQL | 3001 |
| `packages/frontend` | Next.js web application | 3000 |
| `packages/scripts` | Data collection & processing | - |

## Documentation

- [Project Plan](docs/PROJECT_PLAN.md) - Development roadmap
- [Scraper Implementation](docs/SCRAPER_IMPLEMENTATION.md) - Web scraping details
- [Generals Data](docs/DATA_GENERALS.md) - General data structure
- [Skills Data](docs/DATA_SKILLS.md) - Skills data structure

## Development

Each package has a `CLAUDE.md` file with package-specific context for AI-assisted development.

```bash
# Work on backend
cd packages/backend
claude "Add new API endpoint"

# Work on frontend
cd packages/frontend
claude "Create new component"

# Work on scrapers
cd packages/scripts/scrapers
claude "Update scraper for new data"
```

## Tech Stack

- **Backend**: Express.js, Prisma, PostgreSQL, JWT
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Scrapers**: Python, Selenium, BeautifulSoup

## License

Fan project. Game content belongs to Lingxi Interactive Entertainment and Koei Tecmo.
