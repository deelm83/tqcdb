#!/usr/bin/env python3
"""
Improve cropping of general profile images by removing dark ornate frame borders.
Each image is analyzed individually to detect its specific frame boundaries.
"""

import os
from pathlib import Path
from PIL import Image


def get_brightness(pixel):
    """Get average brightness of a pixel."""
    if len(pixel) >= 3:
        return (pixel[0] + pixel[1] + pixel[2]) / 3
    return pixel[0]


def detect_left_border(img, pixels, width, height):
    """Detect the left dark border width by finding brightness transition."""
    # Sample the middle third of the image height for consistency
    y_start = height // 3
    y_end = 2 * height // 3
    sample_height = y_end - y_start

    # Look for pattern: dark area -> very dark line -> bright content
    prev_brightness = 0
    dark_zone_end = 0

    for x in range(min(80, width // 3)):
        col_brightness = sum(get_brightness(pixels[x, y]) for y in range(y_start, y_end)) / sample_height

        # Found very dark separator line (brightness < 20)
        if col_brightness < 20 and prev_brightness > 30:
            dark_zone_end = x
        # Found bright content after dark zone
        elif col_brightness > 80 and dark_zone_end > 0:
            return x

        prev_brightness = col_brightness

    # Fallback: look for first column with decent brightness
    for x in range(min(60, width // 3)):
        col_brightness = sum(get_brightness(pixels[x, y]) for y in range(y_start, y_end)) / sample_height
        if col_brightness > 100:
            return max(0, x - 2)

    return 0


def detect_right_border(img, pixels, width, height):
    """Detect the right border width."""
    y_start = height // 3
    y_end = 2 * height // 3
    sample_height = y_end - y_start

    # Scan from right
    for x in range(width - 1, max(width - 60, 2 * width // 3), -1):
        col_brightness = sum(get_brightness(pixels[x, y]) for y in range(y_start, y_end)) / sample_height
        if col_brightness < 20:
            # Found dark border, return trim amount
            return width - x - 1

    return 4  # Default small trim


def detect_top_border(img, pixels, width, height):
    """Detect the top border height."""
    x_start = width // 3
    x_end = 2 * width // 3
    sample_width = x_end - x_start

    for y in range(min(40, height // 4)):
        row_brightness = sum(get_brightness(pixels[x, y]) for x in range(x_start, x_end)) / sample_width
        if row_brightness > 80:
            return max(0, y - 2)

    return 5  # Default


def detect_bottom_border(img, pixels, width, height):
    """Detect the bottom border height."""
    x_start = width // 3
    x_end = 2 * width // 3
    sample_width = x_end - x_start

    for y in range(height - 1, max(height - 40, 3 * height // 4), -1):
        row_brightness = sum(get_brightness(pixels[x, y]) for x in range(x_start, x_end)) / sample_width
        if row_brightness < 20:
            return height - y - 1

    return 8  # Default


def improve_crop(image_path, output_path=None, dry_run=False):
    """Improve the cropping of a single image."""
    img = Image.open(image_path)
    width, height = img.size
    pixels = img.load()

    # Detect borders for this specific image
    left_trim = detect_left_border(img, pixels, width, height)
    right_trim = detect_right_border(img, pixels, width, height)
    top_trim = detect_top_border(img, pixels, width, height)
    bottom_trim = detect_bottom_border(img, pixels, width, height)

    # Add small padding to ensure clean edges
    left_trim = max(left_trim, 2)
    right_trim = max(right_trim, 2)
    top_trim = max(top_trim, 2)
    bottom_trim = max(bottom_trim, 2)

    # Calculate new dimensions
    new_width = width - left_trim - right_trim
    new_height = height - top_trim - bottom_trim

    # Skip if no significant trimming needed
    if left_trim < 10 and right_trim < 10 and top_trim < 10 and bottom_trim < 10:
        return None, "No significant border detected"

    if dry_run:
        return {
            'original': (width, height),
            'trimmed': (new_width, new_height),
            'left': left_trim,
            'right': right_trim,
            'top': top_trim,
            'bottom': bottom_trim
        }, "Would crop"

    # Perform crop
    cropped = img.crop((left_trim, top_trim, width - right_trim, height - bottom_trim))

    # Save
    if output_path is None:
        output_path = image_path
    cropped.save(output_path)

    return {
        'original': (width, height),
        'trimmed': (new_width, new_height),
        'left': left_trim,
        'right': right_trim,
        'top': top_trim,
        'bottom': bottom_trim
    }, "Cropped"


def process_all_images(input_dir, output_dir=None, dry_run=False):
    """Process all PNG images in the directory."""
    input_path = Path(input_dir)

    if output_dir:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = input_path

    # Find all PNG files
    png_files = list(input_path.glob("*.png"))
    print(f"Found {len(png_files)} PNG files")

    processed = 0
    skipped = 0

    for img_file in sorted(png_files):
        out_file = output_path / img_file.name if output_dir else img_file

        try:
            result, status = improve_crop(img_file, out_file, dry_run)
            if result:
                print(f"  {img_file.name}: {result['original']} -> {result['trimmed']} (L:{result['left']} R:{result['right']} T:{result['top']} B:{result['bottom']}) - {status}")
                processed += 1
            else:
                print(f"  {img_file.name}: {status}")
                skipped += 1
        except Exception as e:
            print(f"  {img_file.name}: ERROR - {e}")
            skipped += 1

    print(f"\nProcessed: {processed}, Skipped: {skipped}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python improve_general_crops.py <input_dir> [output_dir] [--dry-run]")
        print("\nExamples:")
        print("  python improve_general_crops.py ../frontend/public/images/generals/ --dry-run")
        print("  python improve_general_crops.py ../frontend/public/images/generals/")
        sys.exit(1)

    input_dir = sys.argv[1]
    output_dir = None
    dry_run = False

    for arg in sys.argv[2:]:
        if arg == "--dry-run":
            dry_run = True
        else:
            output_dir = arg

    print(f"Input: {input_dir}")
    print(f"Output: {output_dir or 'in-place'}")
    print(f"Dry run: {dry_run}")
    print()

    process_all_images(input_dir, output_dir, dry_run)
