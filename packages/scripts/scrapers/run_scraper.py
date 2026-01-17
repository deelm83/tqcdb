#!/usr/bin/env python3
"""
Main script to run the official database scraper
"""

import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper import OfficialDBScraper


def main():
    parser = argparse.ArgumentParser(
        description='Scrape data from Three Kingdoms Tactics official database'
    )
    parser.add_argument(
        '--data-type',
        choices=['generals', 'skills', 'equipment', 'all'],
        default='all',
        help='Type of data to scrape (default: all)'
    )
    parser.add_argument(
        '--output-dir',
        default='./data',
        help='Output directory for scraped data (default: ./data)'
    )
    parser.add_argument(
        '--headless',
        action='store_true',
        default=True,
        help='Run browser in headless mode (default: True)'
    )
    parser.add_argument(
        '--no-headless',
        dest='headless',
        action='store_false',
        help='Run browser with visible UI'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=30,
        help='Page load timeout in seconds (default: 30)'
    )

    args = parser.parse_args()

    print("=" * 60)
    print("Three Kingdoms Tactics - Official Database Scraper")
    print("=" * 60)
    print(f"Data type: {args.data_type}")
    print(f"Output directory: {args.output_dir}")
    print(f"Headless mode: {args.headless}")
    print(f"Timeout: {args.timeout}s")
    print("=" * 60)

    try:
        with OfficialDBScraper(headless=args.headless, timeout=args.timeout) as scraper:
            if args.data_type == 'all':
                data = scraper.scrape_all(output_dir=args.output_dir)
                print(f"\n✓ Successfully scraped all data!")
                print(f"  - Generals: {len(data['generals'])}")
                print(f"  - Skills: {len(data['skills'])}")
                print(f"  - Equipment: {len(data['equipment'])}")

            elif args.data_type == 'generals':
                generals = scraper.get_all_generals()
                from scraper.utils import save_json
                save_json(generals, f'{args.output_dir}/generals/all_generals.json')
                print(f"\n✓ Successfully scraped {len(generals)} generals!")

            elif args.data_type == 'skills':
                skills = scraper.get_all_skills()
                from scraper.utils import save_json
                save_json(skills, f'{args.output_dir}/skills/all_skills.json')
                print(f"\n✓ Successfully scraped {len(skills)} skills!")

            elif args.data_type == 'equipment':
                equipment = scraper.get_all_equipment()
                from scraper.utils import save_json
                save_json(equipment, f'{args.output_dir}/equipment.json')
                print(f"\n✓ Successfully scraped {len(equipment)} equipment items!")

        print("\nScraping completed successfully!")

    except KeyboardInterrupt:
        print("\n\nScraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error during scraping: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
