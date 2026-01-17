# Scripts Package

Data collection and processing tools for Three Kingdoms Tactics Wiki.

## Directory Structure
```
scripts/
├── scrapers/           # Python web scrapers
├── data-import/        # Database import scripts
├── image-processing/   # Image tools
└── requirements.txt    # Python dependencies
```

## Scrapers (`scrapers/`)
Python scripts that collect data from game wikis.

- `run_scraper.py` - Main entry point
- `scraper/official_db.py` - Core scraper class
- `scrape_bilibili_generals.py` - Bilibili wiki scraper
- `scrape_skills.py` - Skills scraper
- `scrape_*_images.py` - Image downloaders

**Usage:**
```bash
cd scrapers
pip install -r ../requirements.txt
python run_scraper.py
```

**Output:** JSON files to `../../data/`

## Data Import (`data-import/`)
Scripts to import JSON data into database.

- `import-skills.js` - Node.js skill importer
- `import_skills_json.py` - Python skill importer
- `merge_skills.py` - Merge skill JSON files
- `translate_skills.py` - Translation pipeline

## Image Processing (`image-processing/`)
- `process_general_images.py` - General portrait processing
- `process_skill_images.py` - Skill icon processing
- `rename_images.py` - Batch image renaming

## Dependencies
```bash
pip install -r requirements.txt
```
- requests
- beautifulsoup4
- selenium
- lxml
