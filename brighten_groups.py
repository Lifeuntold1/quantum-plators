import os
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

# Ensure ASCII fallback for Windows console output
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def enhance_group_photo(file_path: Path):
    try:
        ext = file_path.suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            return

        # Target all group gallery shots, class photos, and slideshow banners
        name = file_path.name.lower()
        parent = str(file_path.parent).lower()
        if "group" not in name and "group" not in parent and "class" not in name and "slideshow" not in parent:
            return

        print(f"[GROUP BRIGHTENING] Processing {file_path.name}...")
        
        with Image.open(file_path) as img:
            img = ImageOps.exif_transpose(img)

            if img.mode in ("RGBA", "P") and ext in ['.jpg', '.jpeg']:
                img = img.convert("RGB")
            elif img.mode != "RGB" and ext not in ['.png', '.webp']:
                img = img.convert("RGB")

            # Significant Brightness Boost (+25%) for high vibrancy in wide shot group pictures
            brightness_enhancer = ImageEnhance.Brightness(img)
            img = brightness_enhancer.enhance(1.25)

            # Contrast tuning (+12%) to preserve depth and prevent washout from high brightness
            contrast_enhancer = ImageEnhance.Contrast(img)
            img = contrast_enhancer.enhance(1.12)

            # Color enrichment (+10%) for richer academic robes and vibrant backgrounds
            color_enhancer = ImageEnhance.Color(img)
            img = color_enhancer.enhance(1.10)

            # Sharpness enhancement (+15%) to define facial clarity across multi-person group shots
            sharpness_enhancer = ImageEnhance.Sharpness(img)
            img = sharpness_enhancer.enhance(1.15)

            if ext in ['.jpg', '.jpeg']:
                img.save(file_path, format='JPEG', quality=90, optimize=True)
                print(f"  +-- Successfully applied enhanced high-illumination boost (JPEG).")
            elif ext == '.png':
                img.save(file_path, format='PNG', optimize=True)
                print(f"  +-- Successfully applied enhanced high-illumination boost (PNG).")
            elif ext == '.webp':
                img.save(file_path, format='WEBP', quality=90)
                print(f"  +-- Successfully applied enhanced high-illumination boost (WEBP).")

    except Exception as e:
        print(f"[ERROR] Failed group brightening on {file_path.name}: {str(e)}")

def main():
    root_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [root_dir / "assets" / "images", root_dir / "src" / "assets", root_dir / "public" / "assets"]

    found_count = 0
    for directory in target_dirs:
        if directory.exists():
            print(f"=== Scanning Directory for Group Galleries: {directory} ===")
            for root, _, files in os.walk(directory):
                for file in files:
                    file_path = Path(root) / file
                    if "group" in file.lower() or "class" in file.lower() or "slideshow" in str(file_path).lower():
                        enhance_group_photo(file_path)
                        found_count += 1

    print(f"=== Group Picture High-Illumination Enhancement Complete (Processed {found_count} candidate items) ===")

if __name__ == "__main__":
    main()
