#!/usr/bin/env python3
"""
Test script for the OfficialDBScraper
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper import OfficialDBScraper


def test_basic_connection():
    """Test basic connection to the official database"""
    print("Testing basic connection...")
    with OfficialDBScraper(headless=True) as scraper:
        print(f"Base URL: {scraper.BASE_URL}")
        print(f"Station URL: {scraper.STATION_URL}")
        print("Connection test passed!")


def test_fetch_generals():
    """Test fetching generals data"""
    print("\nTesting generals fetch...")
    with OfficialDBScraper(headless=False) as scraper:
        generals = scraper.get_all_generals()
        print(f"Fetched {len(generals)} generals")

        if generals:
            print("\nSample general data:")
            print(generals[0])
        else:
            print("No generals data retrieved")


def test_fetch_skills():
    """Test fetching skills data"""
    print("\nTesting skills fetch...")
    with OfficialDBScraper(headless=False) as scraper:
        skills = scraper.get_all_skills()
        print(f"Fetched {len(skills)} skills")

        if skills:
            print("\nSample skill data:")
            print(skills[0])
        else:
            print("No skills data retrieved")


def test_fetch_equipment():
    """Test fetching equipment data"""
    print("\nTesting equipment fetch...")
    with OfficialDBScraper(headless=False) as scraper:
        equipment = scraper.get_all_equipment()
        print(f"Fetched {len(equipment)} equipment items")

        if equipment:
            print("\nSample equipment data:")
            print(equipment[0])
        else:
            print("No equipment data retrieved")


def main():
    """Run all tests"""
    print("=" * 60)
    print("Official Database Scraper Test Suite")
    print("=" * 60)

    try:
        test_basic_connection()
        test_fetch_generals()
        # Uncomment to test other data types
        # test_fetch_skills()
        # test_fetch_equipment()

        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
    except Exception as e:
        print(f"\nTest failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
