# OfficialDBScraper Implementation Guide

## Overview

The `OfficialDBScraper` class extracts data from the official Three Kingdoms Tactics database at https://sgzzlb.lingxigames.com/station/

## Architecture

The scraper uses a **dual-strategy approach**:

1. **Primary: API Calls** - Attempts to fetch data directly from backend APIs
2. **Fallback: Selenium** - Uses headless browser to scrape dynamically-loaded content

This ensures maximum reliability while maintaining efficiency.

## Key Features

### 1. Multi-Strategy Data Fetching

```python
def get_all_generals(self):
    # Try API first (fast)
    api_data = self.get_api_data('/api/generals')
    if api_data:
        return api_data.get('data', [])

    # Fallback to Selenium (reliable)
    html = self.scrape_with_selenium(...)
    # Parse HTML and extract data
```

### 2. Resource Management

The scraper implements Python's context manager protocol:

```python
with OfficialDBScraper(headless=True) as scraper:
    generals = scraper.get_all_generals()
    # Automatic cleanup on exit
```

### 3. Configurable Options

- **Headless mode**: Run browser invisibly for production
- **Timeout settings**: Configurable page load timeouts
- **User agent**: Customizable to avoid blocking

### 4. Data Extraction Methods

The scraper provides specialized methods for each data type:

- `get_all_generals()` - Extract all generals with stats
- `get_general_details(id)` - Get detailed info for one general
- `get_all_skills()` - Extract all combat skills
- `get_all_equipment()` - Extract all equipment items
- `scrape_all()` - Comprehensive scraping with automatic file saving

## Implementation Details

### HTML Parsing

The scraper uses BeautifulSoup4 for HTML parsing with flexible selectors:

```python
def _parse_general_card(self, card):
    # Multiple selector patterns for robustness
    name = card.select_one('.name, .general-name')
    faction = card.select_one('.faction, .camp')
    rarity = card.select_one('.rarity, .star-level')
```

### JavaScript Data Extraction

For data embedded in JavaScript variables:

```python
def extract_data_from_js(self, html, variable_name):
    # Finds and parses JavaScript variables
    # Example: var generals = [{...}]
```

### Error Handling

The scraper includes comprehensive error handling:

- Network request failures
- Timeout errors
- Parsing errors
- Missing elements

All errors are logged without crashing the scraper.

## Data Output Format

The scraper saves data in JSON format with UTF-8 encoding:

```json
{
  "name_cn": "关羽",
  "faction": "蜀",
  "rarity": 5,
  "cost": 7,
  "base_stats": {
    "strength": 98,
    "intelligence": 75,
    "command": 96,
    "speed": 85
  }
}
```

## Usage Examples

### Basic Usage

```python
from scraper import OfficialDBScraper

with OfficialDBScraper() as scraper:
    generals = scraper.get_all_generals()
    print(f"Found {len(generals)} generals")
```

### Scrape Specific Data Type

```python
with OfficialDBScraper(headless=True) as scraper:
    skills = scraper.get_all_skills()

    from scraper.utils import save_json
    save_json(skills, './data/skills/all_skills.json')
```

### Scrape Everything

```python
with OfficialDBScraper() as scraper:
    all_data = scraper.scrape_all(output_dir='./data')
```

### Command Line Usage

```bash
# Scrape all data
python scripts/run_scraper.py --data-type all

# Scrape only generals
python scripts/run_scraper.py --data-type generals

# Scrape with visible browser
python scripts/run_scraper.py --no-headless

# Custom output directory
python scripts/run_scraper.py --output-dir ./my_data
```

## Testing

Run the test suite to verify functionality:

```bash
python scripts/test_scraper.py
```

The test suite includes:
- Connection test
- Generals fetch test
- Skills fetch test
- Equipment fetch test

## Customization Guide

### Adding New Data Types

1. Create a new extraction method:
```python
def get_all_troops(self) -> List[Dict]:
    # Implementation
    pass
```

2. Add parser method:
```python
def _parse_troop_card(self, card) -> Optional[Dict]:
    # Parse HTML card element
    pass
```

3. Update `scrape_all()` to include new data type

### Updating Selectors

The HTML structure may change over time. Update selectors in parser methods:

```python
# Old
name = card.select_one('.name')

# New (if class changes)
name = card.select_one('.hero-name, .character-name')
```

### Adding API Endpoints

If new API endpoints are discovered:

```python
def get_formations(self):
    api_data = self.get_api_data('/api/formations')
    if api_data:
        return api_data.get('data', [])
    # ... fallback logic
```

## Known Limitations

1. **Dynamic Content**: The official site loads data dynamically, requiring Selenium
2. **API Discovery**: API endpoints may not be publicly documented
3. **Rate Limiting**: Excessive requests may be blocked
4. **Data Completeness**: Some fields may not be available on listing pages

## Troubleshooting

### ChromeDriver Issues

```bash
# Install ChromeDriver
brew install chromedriver

# If permission denied on macOS
xattr -d com.apple.quarantine /path/to/chromedriver
```

### Timeout Errors

Increase timeout in scraper initialization:

```python
scraper = OfficialDBScraper(timeout=60)  # 60 seconds
```

### Empty Results

1. Check if website structure changed
2. Run with `headless=False` to see what's happening
3. Check network tab in browser for API calls

## Future Enhancements

- [ ] API endpoint discovery automation
- [ ] Incremental updates (only fetch new/changed data)
- [ ] Proxy support for rate limiting
- [ ] Parallel scraping for better performance
- [ ] Data validation against schema
- [ ] Image downloading for generals/skills
- [ ] Retry logic with exponential backoff

## Performance Considerations

- **API calls**: ~1-2 seconds per request
- **Selenium scraping**: ~5-10 seconds per page
- **Full scrape**: Estimated 10-30 minutes depending on data volume

Use `headless=True` for production to reduce overhead.

---

*Last Updated: January 2025*
