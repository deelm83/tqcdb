# Three Kingdoms Tactics Wiki - Project Plan

## Project Overview

**Project Name:** Three Kingdoms Tactics Wiki (三国志战略版 Wiki)  
**Goal:** Build a comprehensive, searchable wiki for the SEA version of Three Kingdoms Tactics (released by Qooka Games), with data sourced from Chinese databases  
**Target Audience:** English-speaking SEA players who need translated game data

---

## Game Information

| Field | Value |
|-------|-------|
| SEA Name | Three Kingdoms Tactics |
| Chinese Name | 三国志·战略版 (Sānguó Zhì: Zhànlüè Bǎn) |
| Developer | 灵犀互娱 (Lingxi Interactive Entertainment) |
| Publisher (SEA) | Qooka Games |
| Publisher (CN) | Alibaba Group |
| Platform | iOS, Android |
| Release | September 2019 (CN), Later for SEA |

---

## Data Sources

### Primary Sources (Chinese)

| Source | URL | Data Available |
|--------|-----|----------------|
| **Official Database** | `https://sgzzlb.lingxigames.com/station/` | Generals, Skills, Equipment, Troops |
| **Bilibili Wiki** | `https://wiki.biligame.com/sgzzlb/` | Community guides, detailed analysis |
| **Gamersky** | `https://www.gamersky.com/handbooksy/sgzzlb/` | Tier lists, skill analysis |
| **游侠网 Wiki** | `https://m.ali213.net/wiki/sgzzlb/` | Skills database, formations |
| **知乎 (Zhihu)** | `https://zhuanlan.zhihu.com/` | In-depth mechanics, formulas |

### Secondary Sources (English)
- QooApp game pages
- SEA community Discord/Facebook groups
- English YouTube content creators

---

## Data Schema

### 1. Generals (武将)

```typescript
interface General {
  // Identity
  id: string;                    // Unique identifier
  name_cn: string;               // Chinese name (e.g., "关羽")
  name_en: string;               // English name (e.g., "Guan Yu")
  name_pinyin: string;           // Pinyin (e.g., "Guān Yǔ")
  
  // Classification
  faction: "魏" | "蜀" | "吴" | "群";  // Wei, Shu, Wu, Qun
  faction_en: "Wei" | "Shu" | "Wu" | "Qun";
  rarity: 1 | 2 | 3 | 4 | 5;     // Star rating
  cost: 3 | 4 | 5 | 6 | 7;       // Command cost (统御)
  
  // Base Stats (Level 1)
  base_stats: {
    strength: number;            // 武力
    intelligence: number;        // 智力
    command: number;             // 统率
    speed: number;               // 速度
    politics: number;            // 政治
    charm: number;               // 魅力
  };
  
  // Growth Rates
  growth_rates: {
    strength: number;
    intelligence: number;
    command: number;
    speed: number;
  };
  
  // Troop Affinity
  troop_affinity: {
    cavalry: "S" | "A" | "B" | "C";    // 骑兵
    shield: "S" | "A" | "B" | "C";     // 盾兵
    archer: "S" | "A" | "B" | "C";     // 弓兵
    spear: "S" | "A" | "B" | "C";      // 枪兵
    siege: "S" | "A" | "B" | "C";      // 器械
  };
  
  // Skills
  innate_skill_id: string;       // Reference to Skill
  inherited_skill_id: string;    // Skill obtained when dismantled
  
  // Tags
  tags: string[];                // e.g., ["武", "骑", "控"]
  
  // Meta
  image_url: string;
  obtain_method: string[];       // How to obtain
  recommended_builds: string[];  // Reference to Build documents
}
```

### 2. Skills (战法)

```typescript
interface Skill {
  // Identity
  id: string;
  name_cn: string;               // e.g., "横扫千军"
  name_en: string;               // e.g., "Sweeping Thousands"
  name_pinyin: string;
  
  // Classification
  type: "指挥" | "主动" | "突击" | "被动" | "阵法" | "兵种" | "内政" | "战前" | "普攻";
  type_en: "Command" | "Active" | "Assault" | "Passive" | "Formation" | "Troop" | "Domestic" | "Pre-battle" | "Normal Attack";
  quality: "S" | "A" | "B";
  
  // Mechanics
  trigger_rate: number;          // 0-100, null if always active
  trigger_condition?: string;    // Special conditions
  cooldown?: number;             // Preparation rounds
  duration?: number;             // Effect duration
  
  // Effects
  effect_description_cn: string;
  effect_description_en: string;
  
  // Scaling
  effects_by_level: {
    level: number;               // 1-10
    values: Record<string, number>;  // Damage %, heal %, etc.
  }[];
  
  scaling_stat?: "武力" | "智力" | "统率" | "速度";
  damage_type?: "兵刃" | "谋略";  // Physical or Strategy
  
  // Source
  source_type: "自带" | "传承" | "事件";  // Innate, Inherited, Event
  source_generals?: string[];    // General IDs that provide this skill
  
  // Synergies & Conflicts
  synergies: string[];           // Skill IDs that combo well
  conflicts: string[];           // Skill IDs that don't stack
  
  // Status Effects Applied
  debuffs_applied?: string[];    // e.g., ["震慑", "缴械", "计穷"]
  buffs_applied?: string[];
  
  // Meta
  tier_rating?: "T0" | "T1" | "T2" | "T3";
  usage_notes_en?: string;
}
```

### 3. Equipment (装备)

```typescript
interface Equipment {
  id: string;
  name_cn: string;
  name_en: string;
  
  type: "武器" | "防具" | "坐骑" | "宝物";
  type_en: "Weapon" | "Armor" | "Mount" | "Treasure";
  
  quality: "凡品" | "精良" | "上品" | "珍品";
  quality_en: "Common" | "Fine" | "Superior" | "Precious";
  
  stats_bonus: {
    strength?: number;
    intelligence?: number;
    command?: number;
    speed?: number;
  };
  
  special_effect_cn?: string;
  special_effect_en?: string;
  
  troop_restriction?: string[];  // If only usable by certain troops
  obtain_method: string[];
}
```

### 4. Team Compositions (阵容)

```typescript
interface TeamComposition {
  id: string;
  name_cn: string;
  name_en: string;
  
  generals: {
    position: "主将" | "副将1" | "副将2";
    general_id: string;
    skills: string[];            // Skill IDs
    equipment?: string[];        // Equipment IDs
    troop_type: string;
  }[];
  
  tier_rating: "T0" | "T1" | "T2" | "T3";
  playstyle: "爆发" | "持久" | "控制" | "平衡";
  playstyle_en: "Burst" | "Sustain" | "Control" | "Balanced";
  
  strengths: string[];
  weaknesses: string[];
  counters: string[];            // Team IDs this beats
  countered_by: string[];        // Team IDs this loses to
  
  guide_en: string;              // Strategy guide
  season_viability: string[];    // Which seasons this works in
}
```

### 5. Status Effects (状态效果)

```typescript
interface StatusEffect {
  id: string;
  name_cn: string;
  name_en: string;
  
  type: "debuff" | "buff" | "control";
  
  effect_cn: string;
  effect_en: string;
  
  can_stack: boolean;
  can_cleanse: boolean;
  
  related_skills: string[];      // Skills that apply this
}
```

---

## Technical Architecture

### Recommended Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend** | Next.js 14 + React | SEO-friendly, fast, great DX |
| **Styling** | Tailwind CSS | Rapid development |
| **Database** | PostgreSQL | Relational data fits well |
| **ORM** | Prisma | Type-safe, great migrations |
| **Search** | Meilisearch or Algolia | Fast full-text search |
| **Hosting** | Vercel + Supabase | Free tier, easy deployment |
| **CMS** | Optional: Payload CMS | For non-dev content updates |

### Alternative: Static Site

| Layer | Technology |
|-------|------------|
| **Generator** | Astro or Hugo |
| **Data** | JSON/YAML files |
| **Search** | Pagefind (static search) |
| **Hosting** | GitHub Pages / Netlify |

---

## Project Phases

### Phase 1: Data Collection & Structure (Week 1-2)

**Goals:**
- [ ] Finalize data schema
- [ ] Build web scraper for official Chinese database
- [ ] Extract 50+ generals with full data
- [ ] Extract 100+ skills with full data
- [ ] Create translation pipeline (CN → EN)

**Deliverables:**
- `data/generals.json`
- `data/skills.json`
- `data/equipment.json`
- `scripts/scraper.py`
- `scripts/translate.py`

### Phase 2: Backend & Database (Week 2-3)

**Goals:**
- [ ] Set up database with Prisma schema
- [ ] Import all scraped data
- [ ] Build REST API endpoints
- [ ] Implement search functionality

**Deliverables:**
- `prisma/schema.prisma`
- `src/api/` endpoints
- Database seed scripts

### Phase 3: Frontend Development (Week 3-5)

**Goals:**
- [ ] Design wiki UI/UX
- [ ] Build general list/detail pages
- [ ] Build skill list/detail pages
- [ ] Build team composition pages
- [ ] Implement search UI
- [ ] Add filtering and sorting

**Deliverables:**
- Full Next.js application
- Responsive design
- SEO optimization

### Phase 4: Content & Polish (Week 5-6)

**Goals:**
- [ ] Write English guides
- [ ] Add tier lists
- [ ] Community feedback integration
- [ ] Performance optimization
- [ ] Launch preparation

**Deliverables:**
- Complete wiki ready for launch
- Documentation for contributors

---

## File Structure

```
three-kingdoms-wiki/
├── README.md
├── package.json
├── .env.example
│
├── data/                        # Raw data files
│   ├── generals/
│   │   ├── wei.json
│   │   ├── shu.json
│   │   ├── wu.json
│   │   └── qun.json
│   ├── skills/
│   │   ├── command.json
│   │   ├── active.json
│   │   ├── passive.json
│   │   └── formation.json
│   ├── equipment.json
│   ├── teams.json
│   └── status_effects.json
│
├── scripts/                     # Data collection scripts
│   ├── scraper/
│   │   ├── __init__.py
│   │   ├── official_db.py       # Scrape official database
│   │   ├── bilibili_wiki.py     # Scrape Bilibili wiki
│   │   └── utils.py
│   ├── translate/
│   │   ├── __init__.py
│   │   ├── names.py             # Name translations
│   │   └── descriptions.py      # Skill descriptions
│   └── import_to_db.py
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Home
│   │   ├── generals/
│   │   │   ├── page.tsx         # General list
│   │   │   └── [id]/page.tsx    # General detail
│   │   ├── skills/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── teams/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── api/
│   │       ├── generals/
│   │       ├── skills/
│   │       └── search/
│   │
│   ├── components/
│   │   ├── GeneralCard.tsx
│   │   ├── SkillCard.tsx
│   │   ├── StatBar.tsx
│   │   ├── AffinityBadge.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                # Prisma client
│   │   ├── search.ts            # Search utilities
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts             # TypeScript interfaces
│
├── public/
│   ├── images/
│   │   ├── generals/
│   │   ├── skills/
│   │   └── equipment/
│   └── favicon.ico
│
└── docs/
    ├── CONTRIBUTING.md
    ├── DATA_FORMAT.md
    └── API.md
```

---

## Scraping Strategy

### Official Database (`sgzzlb.lingxigames.com/station/`)

The official database is a Vue.js SPA that loads data via API calls. Strategy:

1. **Inspect Network Tab** - Find API endpoints for generals/skills
2. **Direct API Calls** - Likely endpoints:
   - `/api/generals`
   - `/api/skills`
   - `/api/equipment`
3. **Fallback: Puppeteer/Playwright** - If API is protected, use headless browser

```python
# Example scraper structure
import requests
from bs4 import BeautifulSoup
import json

class OfficialDBScraper:
    BASE_URL = "https://sgzzlb.lingxigames.com"
    
    def get_all_generals(self) -> list:
        """Fetch all generals from official database"""
        pass
    
    def get_general_details(self, general_id: str) -> dict:
        """Fetch detailed info for a specific general"""
        pass
    
    def get_all_skills(self) -> list:
        """Fetch all skills"""
        pass
```

### Bilibili Wiki

MediaWiki-based, can use standard scraping or their API:

```python
# MediaWiki API example
import requests

def get_wiki_page(title: str) -> str:
    url = "https://wiki.biligame.com/sgzzlb/api.php"
    params = {
        "action": "parse",
        "page": title,
        "format": "json"
    }
    response = requests.get(url, params=params)
    return response.json()
```

---

## Translation Pipeline

### Automated Translation

1. **Names** - Use a curated dictionary (most Three Kingdoms names have standard translations)
2. **Skill Effects** - Use Claude API for context-aware translation
3. **Manual Review** - Flag uncertain translations for human review

```python
# Translation dictionary example
GENERAL_NAMES = {
    "关羽": "Guan Yu",
    "张飞": "Zhang Fei",
    "刘备": "Liu Bei",
    "曹操": "Cao Cao",
    "孙权": "Sun Quan",
    # ... 200+ names
}

SKILL_NAMES = {
    "横扫千军": "Sweeping Thousands",
    "八门金锁阵": "Eight Gates Golden Lock Formation",
    "暂避其锋": "Temporarily Avoid the Edge",
    # ...
}

STATUS_EFFECTS = {
    "震慑": "Stun",
    "缴械": "Disarm",
    "计穷": "Silence",
    "混乱": "Confusion",
    "虚弱": "Weaken",
    "嘲讽": "Taunt",
    "禁疗": "Heal Block",
}
```

---

## API Design

### REST Endpoints

```
GET /api/generals              # List all generals
GET /api/generals/:id          # Get general by ID
GET /api/generals/faction/:f   # Filter by faction

GET /api/skills                # List all skills
GET /api/skills/:id            # Get skill by ID
GET /api/skills/type/:type     # Filter by type
GET /api/skills/quality/:q     # Filter by quality

GET /api/equipment             # List all equipment
GET /api/teams                 # List team compositions
GET /api/search?q=             # Full-text search
```

### Query Parameters

```
?faction=wei,shu               # Multiple factions
?rarity=5                      # Filter by star rating
?type=active,passive           # Multiple skill types
?quality=S,A                   # Quality filter
?sort=name,-rarity             # Sort (- for desc)
?limit=20&offset=0             # Pagination
```

---

## Claude Code Workflow

When using Claude Code for this project, use these prompts:

### Initial Setup
```
Initialize a Next.js 14 project with TypeScript, Tailwind CSS, and Prisma. 
Set up the folder structure as defined in the project plan.
```

### Data Scraping
```
Create a Python scraper to extract general data from 
https://sgzzlb.lingxigames.com/station/
Save the data as JSON following the General interface schema.
```

### Database Setup
```
Create a Prisma schema based on the data models defined in 
THREE_KINGDOMS_WIKI_PROJECT_PLAN.md. Include all relationships.
```

### Frontend Components
```
Build a GeneralCard component that displays:
- Portrait image
- Name (EN/CN)
- Faction badge
- Star rating
- Base stats as bars
- Troop affinity badges
```

---

## Success Metrics

- [ ] 200+ generals with complete data
- [ ] 300+ skills with translations
- [ ] 50+ team compositions with guides
- [ ] Search returns results in <100ms
- [ ] Mobile-responsive design
- [ ] SEO score >90 on Lighthouse
- [ ] Community contributions enabled

---

## Resources & References

- [Official Game Site](https://sgzzlb.lingxigames.com/)
- [Bilibili Wiki](https://wiki.biligame.com/sgzzlb/)
- [QooApp Game Page](https://apps.qoo-app.com/en/app/16437)
- [Gamersky Guides](https://www.gamersky.com/handbooksy/sgzzlb/)

---

## License

This wiki is a fan project. All game content belongs to Lingxi Interactive Entertainment and Koei Tecmo.

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Created for use with Claude Code*
