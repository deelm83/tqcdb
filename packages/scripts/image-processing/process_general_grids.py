#!/usr/bin/env python3
"""
Process multiple grid images to extract individual general portraits.

Usage:
    python process_general_grids.py [input_dir] [output_dir]

    Defaults:
        input_dir: ../screenshots/grids/
        output_dir: ../output/generals/

Output:
    - Individual general images in output_dir/images/
    - generals_mapping.json with name -> filename associations
"""

import anthropic
import base64
import json
import sys
import os
from pathlib import Path
from PIL import Image

# Load .env file if exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
    else:
        root_env = Path(__file__).parent.parent.parent.parent / '.env'
        if root_env.exists():
            load_dotenv(root_env)
except ImportError:
    pass


def detect_card_boundaries(img):
    """Detect card boundaries by finding dark vertical columns."""
    width, height = img.size
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
    min_brightness = min(col_brightness)
    threshold = min_brightness + 30
    dark_cols = [x for x, b in enumerate(col_brightness) if b < threshold]

    if not dark_cols:
        return None

    # Group nearby dark columns into separator regions
    separator_regions = []
    current = [dark_cols[0]]
    for x in dark_cols[1:]:
        if x - current[-1] <= 20:
            current.append(x)
        else:
            # Store the center of the separator region
            separator_regions.append((min(current) + max(current)) // 2)
            current = [x]
    separator_regions.append((min(current) + max(current)) // 2)

    # Filter separators to find evenly spaced ones
    # Try different column counts (5, 6, 7) and find the best fit
    best_ranges = None
    best_score = float('inf')

    for expected_cols in [5, 6, 7]:
        expected_width = width / expected_cols

        # Find separators that match expected spacing
        matched_separators = [0]  # Start from left edge

        for sep in separator_regions:
            # Check if this separator is near an expected boundary
            for col in range(1, expected_cols):
                expected_pos = col * expected_width
                if abs(sep - expected_pos) < expected_width * 0.15:
                    if not matched_separators or abs(sep - matched_separators[-1]) > expected_width * 0.5:
                        matched_separators.append(sep)
                    break

        matched_separators.append(width)  # End at right edge

        # Calculate score (lower is better)
        if len(matched_separators) >= expected_cols:
            # Calculate variance in card widths
            widths = [matched_separators[i+1] - matched_separators[i] for i in range(len(matched_separators)-1)]
            avg_width = sum(widths) / len(widths)
            variance = sum((w - avg_width) ** 2 for w in widths) / len(widths)
            score = variance + abs(len(widths) - expected_cols) * 10000

            if score < best_score:
                best_score = score
                # Create card ranges from separators
                best_ranges = []
                for i in range(len(matched_separators) - 1):
                    left = matched_separators[i]
                    right = matched_separators[i + 1]
                    if right - left > 100:  # Minimum card width
                        best_ranges.append((left, right))

    return best_ranges


def is_portrait_image(img, min_ratio=1.2, max_ratio=2.0):
    """Check if image has portrait dimensions (taller than wide)."""
    width, height = img.size
    if width == 0:
        return False
    ratio = height / width
    return min_ratio <= ratio <= max_ratio


def is_valid_card(img, min_size=100):
    """Check if the cropped image is a valid general card."""
    width, height = img.size

    # Must be minimum size
    if width < min_size or height < min_size:
        return False

    # Must be roughly portrait orientation (height >= width * 0.9)
    if height < width * 0.9:
        return False

    # Check if image is mostly black/empty by sampling center area
    pixels = img.load()
    dark_pixels = 0
    total_samples = 0

    # Sample a grid of points in the center region
    for y in range(height // 4, 3 * height // 4, height // 8):
        for x in range(width // 4, 3 * width // 4, width // 8):
            r, g, b = pixels[x, y][:3]
            brightness = (r + g + b) / 3
            if brightness < 20:
                dark_pixels += 1
            total_samples += 1

    # If more than 80% of samples are very dark, it's likely empty
    if total_samples > 0 and dark_pixels / total_samples > 0.8:
        return False

    return True


def crop_grid_image(img, cols=None, rows=2):
    """Crop a grid image into individual cards."""
    width, height = img.size

    # Detect card boundaries first
    card_ranges = detect_card_boundaries(img)

    # Auto-detect number of columns from detected boundaries
    if card_ranges and len(card_ranges) >= 3:
        cols = len(card_ranges)
        print(f"  Auto-detected {cols} columns from boundaries")
    elif cols is None:
        cols = 5  # default fallback

    # Auto-detect number of rows based on aspect ratio
    # Card ratio is approximately 1.12 (height/width) based on sample grids
    if card_ranges:
        avg_card_width = sum(r[1] - r[0] for r in card_ranges) / len(card_ranges)
    else:
        avg_card_width = width / cols

    expected_card_ratio = 1.12
    card_height_estimate = avg_card_width * expected_card_ratio

    detected_rows = max(1, round(height / card_height_estimate))
    if detected_rows != rows:
        print(f"  Auto-detected {detected_rows} row(s)")
        rows = detected_rows

    row_height = height / rows

    if not card_ranges or len(card_ranges) < 3:
        # Fallback to simple division
        card_width = width / cols
        card_ranges = [(int(i * card_width), int((i + 1) * card_width)) for i in range(cols)]
        print(f"  Using fallback: {cols} columns")

    # Trim pixels from edges
    trim_x = 5
    trim_y = 5

    cards = []
    for row in range(rows):
        for col in range(cols):
            if col < len(card_ranges):
                left = card_ranges[col][0] + trim_x
                right = card_ranges[col][1] - trim_x
            else:
                continue

            top = int(row * row_height) + trim_y
            bottom = int((row + 1) * row_height) - trim_y

            if right <= left:
                continue

            card = img.crop((left, top, right, bottom))

            # Skip invalid cards (not portrait, too small, or empty)
            if not is_valid_card(card):
                continue

            cards.append({
                'image': card,
                'row': row,
                'col': col
            })

    return cards


def encode_image(img):
    """Encode PIL Image to base64."""
    import io
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return base64.standard_b64encode(buffer.getvalue()).decode('utf-8')


def extract_general_name(img, client):
    """Extract general name from card image using Claude Vision."""
    image_data = encode_image(img)

    prompt = """Look at this game card image and extract ONLY the general's name shown at the bottom of the card.

The name appears after a number (like "20") at the bottom of the card in Vietnamese.

Return ONLY a JSON object with this format:
{
    "name_vi": "<Vietnamese name exactly as shown>",
    "name_cn": "<Chinese name if you can determine it, otherwise null>"
}

Examples of names: "Tuấn Úc", "Tào Tháo", "Quan Vũ", "Lưu Bị", "Gia Cát Lượng", "Tôn Sách", etc.

Return ONLY the JSON, no other text."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_data
                        }
                    },
                    {"type": "text", "text": prompt}
                ]
            }]
        )

        response_text = message.content[0].text.strip()

        # Extract JSON from response
        if '```json' in response_text:
            json_str = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            json_str = response_text.split('```')[1].split('```')[0].strip()
        else:
            json_str = response_text

        return json.loads(json_str)

    except Exception as e:
        print(f"    Error extracting name: {e}")
        return None


def sanitize_filename(name):
    """Convert name to safe filename."""
    # Replace Vietnamese characters with ASCII equivalents for filename
    replacements = {
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

    result = name.lower()
    for viet, ascii_char in replacements.items():
        result = result.replace(viet, ascii_char.lower())

    # Replace spaces and special characters
    result = result.replace(' ', '_')
    result = ''.join(c for c in result if c.isalnum() or c == '_')

    return result


def process_grids(input_dir: str, output_dir: str, skip_api: bool = False):
    """Process all grid images in input directory."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)

    if not input_path.exists():
        print(f"Input directory not found: {input_dir}")
        return

    # Create output directories
    images_dir = output_path / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    # Find all grid images
    image_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
    grid_files = [f for f in input_path.iterdir()
                  if f.suffix.lower() in image_extensions]

    if not grid_files:
        print(f"No images found in {input_dir}")
        return

    print(f"Found {len(grid_files)} grid images to process")
    print("=" * 60)

    # Initialize Claude client (only if needed)
    client = None if skip_api else anthropic.Anthropic()

    # Results mapping
    generals_mapping = {}
    processed_count = 0
    error_count = 0

    for grid_idx, grid_file in enumerate(sorted(grid_files), 1):
        print(f"\n[{grid_idx}/{len(grid_files)}] Processing: {grid_file.name}")
        print("-" * 40)

        try:
            img = Image.open(grid_file)
            cards = crop_grid_image(img)
            print(f"  Extracted {len(cards)} cards")

            for card_idx, card_data in enumerate(cards):
                card_img = card_data['image']
                row = card_data['row']
                col = card_data['col']

                print(f"  Card ({row},{col}): ", end="", flush=True)

                # Extract general name (or skip if no API)
                if skip_api:
                    name_info = None
                else:
                    name_info = extract_general_name(card_img, client)

                if name_info and name_info.get('name_vi'):
                    name_vi = name_info['name_vi']
                    name_cn = name_info.get('name_cn')

                    # Generate filename
                    safe_name = sanitize_filename(name_vi)

                    # Check for duplicates
                    if safe_name in generals_mapping:
                        # Add suffix for duplicate
                        suffix = 2
                        while f"{safe_name}_{suffix}" in generals_mapping:
                            suffix += 1
                        safe_name = f"{safe_name}_{suffix}"

                    filename = f"{safe_name}.png"
                    filepath = images_dir / filename

                    # Save image
                    card_img.save(filepath)

                    # Add to mapping
                    generals_mapping[safe_name] = {
                        "name_vi": name_vi,
                        "name_cn": name_cn,
                        "filename": filename,
                        "source_grid": grid_file.name,
                        "position": {"row": row, "col": col}
                    }

                    print(f"{name_vi} -> {filename}")
                    processed_count += 1
                else:
                    # Save with generic name
                    filename = f"unknown_{grid_file.stem}_{row}_{col}.png"
                    filepath = images_dir / filename
                    card_img.save(filepath)
                    print(f"Unknown (saved as {filename})")
                    error_count += 1

        except Exception as e:
            print(f"  Error processing grid: {e}")
            error_count += 1

    # Save mapping JSON
    mapping_file = output_path / "generals_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(generals_mapping, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print(f"Processing complete!")
    print(f"  Processed: {processed_count} generals")
    print(f"  Errors: {error_count}")
    print(f"  Images saved to: {images_dir}")
    print(f"  Mapping saved to: {mapping_file}")

    return generals_mapping


def main():
    script_dir = Path(__file__).parent
    default_input = script_dir.parent / "screenshots" / "grids"
    default_output = script_dir.parent / "output" / "generals"

    # Parse arguments
    args = sys.argv[1:]
    skip_api = "--skip-api" in args
    if skip_api:
        args.remove("--skip-api")

    input_dir = args[0] if len(args) > 0 else str(default_input)
    output_dir = args[1] if len(args) > 1 else str(default_output)

    print(f"Input directory: {input_dir}")
    print(f"Output directory: {output_dir}")
    if skip_api:
        print("Skipping API calls - all cards will be saved as 'unknown'")

    process_grids(input_dir, output_dir, skip_api=skip_api)


if __name__ == "__main__":
    main()
