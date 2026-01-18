#!/usr/bin/env python3
"""
Crop individual general cards from a grid image.

Usage:
    python crop_general_grid.py <grid_image_path> [output_dir]
"""

import sys
from pathlib import Path
from PIL import Image


def crop_grid(image_path: str, output_dir: str = None, cols: int = 5, rows: int = 2):
    """Crop a grid image into individual cards."""
    img = Image.open(image_path)
    width, height = img.size
    print(f"Image size: {width}x{height}")

    # Detect actual card boundaries by finding dark vertical columns
    pixels = img.load()

    # Calculate average brightness of each column
    col_brightness = []
    for x in range(width):
        total = 0
        samples = 0
        for y in range(0, height, 10):
            r, g, b = pixels[x, y][:3]
            total += (r + g + b) / 3
            samples += 1
        col_brightness.append(total / samples)

    # Find dark columns (potential card separators)
    threshold = min(col_brightness) + 30  # dark columns
    dark_cols = [x for x, b in enumerate(col_brightness) if b < threshold]

    # Group nearby dark columns and find their centers
    if dark_cols:
        groups = []
        current = [dark_cols[0]]
        for x in dark_cols[1:]:
            if x - current[-1] <= 15:
                current.append(x)
            else:
                groups.append((min(current), max(current)))
                current = [x]
        groups.append((min(current), max(current)))

        print(f"Detected dark column groups: {groups[:12]}")

        # Groups come in pairs: (card_end, card_start) for frame areas
        # Card content is between alternate boundaries
        # Pattern: card0_start, card0_end, card1_start, card1_end, ...
        all_edges = []
        for g_min, g_max in groups:
            all_edges.append(g_min)
            if g_max - g_min > 5:  # if range is significant
                all_edges.append(g_max)

        # For 5 columns, we need card boundaries
        # Take pairs: (start, end) where start is left edge, end is right edge
        card_ranges = []
        for i in range(0, len(all_edges) - 1, 2):
            card_ranges.append((all_edges[i], all_edges[i + 1]))

        print(f"Card ranges: {card_ranges[:6]}")

        # Use card ranges directly
        separators = card_ranges if card_ranges else None
    else:
        # Fallback to simple division
        separators = [int(i * width / cols) for i in range(cols + 1)]
        print(f"Using simple division: {separators}")

    # Calculate row height
    row_height = height / rows
    print(f"Row height: {row_height:.1f}")

    # Output directory
    if output_dir:
        out_path = Path(output_dir)
    else:
        out_path = Path(image_path).parent / "cropped"
    out_path.mkdir(parents=True, exist_ok=True)

    # Trim pixels from edges of each card
    trim_x = 5
    trim_y = 5

    cropped_files = []
    for row in range(rows):
        for col in range(cols):
            # Use detected card ranges if available
            if separators and isinstance(separators, list) and col < len(separators):
                if isinstance(separators[col], tuple):
                    # Card range format: (start, end)
                    left = separators[col][0] + trim_x
                    right = separators[col][1] - trim_x
                else:
                    # Separator format
                    left = separators[col] + trim_x
                    right = separators[col + 1] - trim_x if col + 1 < len(separators) else width - trim_x
            else:
                # Fallback to simple division
                card_w = width / cols
                left = int(col * card_w) + trim_x
                right = int((col + 1) * card_w) - trim_x

            top = int(row * row_height) + trim_y
            bottom = int((row + 1) * row_height) - trim_y

            # Ensure valid crop region
            if right <= left:
                print(f"  Skipping invalid crop for ({row},{col}): left={left}, right={right}")
                continue

            # Crop the card
            card = img.crop((left, top, right, bottom))

            # Save with row_col naming
            filename = f"general_{row}_{col}.png"
            filepath = out_path / filename
            card.save(filepath)
            cropped_files.append(filepath)
            print(f"Saved: {filepath} ({right-left}x{bottom-top})")

    print(f"\nCropped {len(cropped_files)} cards to {out_path}")
    return cropped_files


def main():
    if len(sys.argv) < 2:
        print("Usage: python crop_general_grid.py <grid_image_path> [output_dir]")
        sys.exit(1)

    image_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    crop_grid(image_path, output_dir)


if __name__ == "__main__":
    main()
