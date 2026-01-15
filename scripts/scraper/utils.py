"""
Utility functions for web scraping
"""

import json
import os
from typing import Any, Dict


def save_json(data: Any, filepath: str) -> None:
    """
    Save data to a JSON file with proper formatting

    Args:
        data: Data to save (dict or list)
        filepath: Path to the output file
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved data to {filepath}")


def load_json(filepath: str) -> Any:
    """
    Load data from a JSON file

    Args:
        filepath: Path to the JSON file

    Returns:
        Loaded data
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def clean_text(text: str) -> str:
    """
    Clean and normalize text content

    Args:
        text: Input text

    Returns:
        Cleaned text
    """
    if not text:
        return ""
    return text.strip().replace('\n', ' ').replace('\r', '')
