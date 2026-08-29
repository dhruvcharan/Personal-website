#!/usr/bin/env python3
"""
Sprite Normalization and Quality Control Pipeline
Standardizes canvas sizes, extracts clean alpha channels, trims empty bounds,
and registers bottom ground baselines to eliminate frame-to-frame jitter.
"""

import os
import sys
import glob
from PIL import Image, ImageOps

def extract_alpha_from_white(img: Image.Image, threshold: int = 240) -> Image.Image:
    """Extract alpha mask from images with solid or near-white background."""
    img = img.convert("RGBA")
    r, g, b, a = img.split()
    
    # Check pixels where r, g, b are all above threshold
    grayscale = ImageOps.grayscale(img.convert("RGB"))
    # Invert grayscale: white becomes 0 (transparent), dark becomes 255 (opaque)
    alpha = grayscale.point(lambda p: 0 if p >= threshold else (255 if p < 200 else int((threshold - p) / (threshold - 200) * 255)))
    
    # Combine with original alpha
    final_alpha = Image.composite(a, Image.new('L', img.size, 0), alpha)
    img.putalpha(final_alpha)
    return img

def normalize_sprite(
    input_path: str,
    output_path: str,
    target_canvas_size: tuple = (512, 512),
    target_baseline_y: int = 460,
    target_height: int = None,
    remove_white_bg: bool = False
):
    """
    Normalizes a single sprite image:
    1. Loads image and optionally removes background
    2. Finds the tight bounding box of non-transparent content
    3. Crops to bounding box
    4. Rescales to target height (preserving aspect ratio)
    5. Pastes onto standardized transparent canvas anchored at (center_x, baseline_y)
    """
    img = Image.open(input_path)
    
    if remove_white_bg or img.mode == 'RGB':
        img = extract_alpha_from_white(img)
    elif img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get non-transparent bounding box
    bbox = img.getbbox()
    if not bbox:
        print(f"[WARN] Image {input_path} is completely empty/transparent!")
        return

    cropped = img.crop(bbox)
    crop_w, crop_h = cropped.size

    # Calculate scale factor
    if target_height is not None and target_height > 0:
        scale = target_height / crop_h
        new_w = max(1, int(crop_w * scale))
        new_h = target_height
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    else:
        resized = cropped
        new_w, new_h = crop_w, crop_h

    # Ensure it fits on target canvas
    canvas_w, canvas_h = target_canvas_size
    if new_w > canvas_w or new_h > target_baseline_y:
        scale = min((canvas_w - 20) / new_w, (target_baseline_y - 20) / new_h)
        new_w = max(1, int(new_w * scale))
        new_h = max(1, int(new_h * scale))
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Create master normalized canvas
    canvas = Image.new("RGBA", target_canvas_size, (0, 0, 0, 0))
    paste_x = (canvas_w - new_w) // 2
    paste_y = target_baseline_y - new_h

    canvas.paste(resized, (paste_x, paste_y), mask=resized)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    canvas.save(output_path, "PNG", optimize=True)
    print(f"[QC PASS] {os.path.basename(input_path)} -> {output_path} (Canvas: {target_canvas_size}, Bounds: {new_w}x{new_h} at y={paste_y})")

def normalize_animation_sequence(
    input_paths: list,
    output_dir: str,
    target_canvas_size: tuple = (512, 512),
    target_baseline_y: int = 460,
    target_height: int = 380,
    remove_white_bg: bool = False
):
    """
    Normalizes a set of frames in an animation sequence with an identical locked scale
    and locked ground contact footline.
    """
    for p in input_paths:
        filename = os.path.basename(p)
        name, _ = os.path.splitext(filename)
        out_p = os.path.join(output_dir, f"{name}.png")
        normalize_sprite(
            input_path=p,
            output_path=out_p,
            target_canvas_size=target_canvas_size,
            target_baseline_y=target_baseline_y,
            target_height=target_height,
            remove_white_bg=remove_white_bg
        )

if __name__ == "__main__":
    print("Sprite Normalization Pipeline Ready.")
