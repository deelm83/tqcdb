# Three Kingdoms Tactics Wiki

A comprehensive, searchable wiki for the SEA version of Three Kingdoms Tactics (三国志战略版), with data sourced from Chinese databases and translated to English.

## Project Status

Currently in **Phase 1: Data Collection & Structure**

- [x] Project structure set up
- [x] OfficialDBScraper implementation
- [ ] Data extraction from official database
- [ ] Translation pipeline
- [ ] Database schema design

## Project Structure

```
tqc/
├── data/                        # Scraped and processed data
│   ├── generals/                # General data by faction
│   ├── skills/                  # Skill data by type
│   └── equipment.json           # Equipment data
├── scripts/                     # Data collection and processing
│   ├── scraper/                 # Web scraping modules
│   │   ├── __init__.py
│   │   ├── official_db.py       # Official database scraper
│   │   └── utils.py             # Utility functions
│   ├── translate/               # Translation pipeline
│   └── test_scraper.py          # Scraper test suite
├── public/                      # Static assets
│   └── images/                  # Game images
├── docs/                        # Documentation
└── requirements.txt             # Python dependencies
```

## Setup

### Prerequisites

- Python 3.8+
- Chrome/Chromium browser (for Selenium)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tqc
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install ChromeDriver (for Selenium):
```bash
# On macOS with Homebrew
brew install chromedriver

# On Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# Or download manually from:
# https://chromedriver.chromium.org/downloads
```

## Usage

### Testing the Scraper

Run the test suite to verify the scraper is working:

```bash
python scripts/test_scraper.py
```

### Scraping Data

Use the OfficialDBScraper to fetch data from the official database:

```python
from scraper import OfficialDBScraper

# Create scraper instance
with OfficialDBScraper(headless=True) as scraper:
    # Fetch all generals
    generals = scraper.get_all_generals()

    # Fetch all skills
    skills = scraper.get_all_skills()

    # Fetch all equipment
    equipment = scraper.get_all_equipment()

    # Or scrape everything at once
    all_data = scraper.scrape_all(output_dir='./data')
```

## Data Sources

- **Official Database**: https://sgzzlb.lingxigames.com/station/
- **Bilibili Wiki**: https://wiki.biligame.com/sgzzlb/
- **Gamersky**: https://www.gamersky.com/handbooksy/sgzzlb/

## Development Roadmap

See [THREE_KINGDOMS_WIKI_PROJECT_PLAN.md](THREE_KINGDOMS_WIKI_PROJECT_PLAN.md) for the complete project plan.

### Phase 1: Data Collection (Current)
- [x] Set up project structure
- [x] Implement web scraper
- [ ] Extract general data
- [ ] Extract skill data
- [ ] Extract equipment data
- [ ] Build translation pipeline

### Phase 2: Backend & Database
- [ ] Design Prisma schema
- [ ] Import data to database
- [ ] Build REST API
- [ ] Implement search

### Phase 3: Frontend Development
- [ ] Design UI/UX
- [ ] Build general pages
- [ ] Build skill pages
- [ ] Build team composition pages

### Phase 4: Content & Launch
- [ ] Write English guides
- [ ] Add tier lists
- [ ] Performance optimization
- [ ] Launch

## OfficialDBScraper Features

The `OfficialDBScraper` class provides:

- **Multi-strategy scraping**: Attempts API calls first, falls back to Selenium
- **Generals extraction**: Fetches all general data including stats, skills, and affinities
- **Skills extraction**: Retrieves skill information with types, effects, and scaling
- **Equipment extraction**: Gets equipment data with stats and restrictions
- **Context manager support**: Automatic resource cleanup
- **Configurable**: Headless mode, custom timeouts, user agent configuration

### Methods

- `get_all_generals()`: Fetch all generals from the database
- `get_general_details(general_id)`: Get detailed info for a specific general
- `get_all_skills()`: Fetch all skills
- `get_all_equipment()`: Fetch all equipment
- `scrape_all(output_dir)`: Scrape all data and save to files

## Contributing

This is currently a personal project, but contributions are welcome once the initial data collection phase is complete.

## License

This wiki is a fan project. All game content belongs to Lingxi Interactive Entertainment and Koei Tecmo.

## Acknowledgments

- Game Developer: 灵犀互娱 (Lingxi Interactive Entertainment)
- SEA Publisher: Qooka Games
- Data Sources: Official database, Bilibili Wiki, community contributors

---

*Last Updated: January 2025*
