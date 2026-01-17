#!/usr/bin/env python3
"""
Rename image files to remove Vietnamese diacritics and Chinese characters.
"""

import os
import re
import json
import unicodedata

# Paths
DATA_FILE = '../data/generals/all_generals.json'
IMAGE_DIRS = [
    '../web/public/images/generals',
    '../web/public/images/generals/full',
]

# Vietnamese to ASCII mapping
VIETNAMESE_MAP = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    # Uppercase
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Đ': 'D',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
}


def to_ascii(text):
    """Convert Vietnamese text to ASCII."""
    result = []
    for char in text:
        if char in VIETNAMESE_MAP:
            result.append(VIETNAMESE_MAP[char])
        elif ord(char) < 128:  # ASCII
            result.append(char)
        # Skip non-ASCII characters (including Chinese)
    return ''.join(result)


def clean_filename(filename):
    """Clean filename: remove diacritics, Chinese chars, normalize."""
    # Get name and extension
    name, ext = os.path.splitext(filename)

    # Convert to ASCII (removes Vietnamese diacritics and Chinese)
    clean = to_ascii(name)

    # Remove multiple underscores
    clean = re.sub(r'_+', '_', clean)

    # Remove leading/trailing underscores
    clean = clean.strip('_')

    # Lowercase
    clean = clean.lower()

    return clean + ext


def main():
    # Process each image directory
    for image_dir in IMAGE_DIRS:
        if not os.path.exists(image_dir):
            continue

        print(f"\nProcessing {image_dir}...")

        rename_map = {}  # old_name -> new_name

        for filename in os.listdir(image_dir):
            if not filename.endswith(('.jpg', '.bmp', '.png')):
                continue

            new_filename = clean_filename(filename)

            if new_filename != filename:
                old_path = os.path.join(image_dir, filename)
                new_path = os.path.join(image_dir, new_filename)

                # Handle duplicates
                if os.path.exists(new_path) and old_path != new_path:
                    # Keep the larger file
                    if os.path.getsize(old_path) > os.path.getsize(new_path):
                        os.remove(new_path)
                    else:
                        os.remove(old_path)
                        print(f"  Removed duplicate: {filename}")
                        continue

                os.rename(old_path, new_path)
                rename_map[filename] = new_filename
                print(f"  {filename} -> {new_filename}")

        print(f"  Renamed {len(rename_map)} files")

    # Update generals data
    print("\nUpdating generals data...")
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    updated = 0
    for general in generals:
        # Update image path
        if general.get('image'):
            old_name = os.path.basename(general['image'])
            new_name = clean_filename(old_name)
            if new_name != old_name:
                general['image'] = general['image'].replace(old_name, new_name)
                updated += 1

        # Update image_full path
        if general.get('image_full'):
            old_name = os.path.basename(general['image_full'])
            new_name = clean_filename(old_name)
            if new_name != old_name:
                general['image_full'] = general['image_full'].replace(old_name, new_name)

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"Updated {updated} image references in generals data")


if __name__ == '__main__':
    main()
