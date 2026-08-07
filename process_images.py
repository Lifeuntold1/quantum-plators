import os
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

# Ensure stdout handles UTF-8 or falls back without crashing on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIF_SUPPORTED = True
except ImportError:
    HEIF_SUPPORTED = False
    print("Warning: pillow_heif not installed. Install with 'pip install pillow-heif' to process iPhone HEIC/HEIF images.")

def optimize_and_enhance_image(file_path: Path):
    try:
        ext = file_path.suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']:
            return

        if ext in ['.heic', '.heif'] and not HEIF_SUPPORTED:
            print(f"[SKIP] {file_path.name} - pillow_heif required for HEIC conversion.")
            return

        print(f"[PROCESSING] {file_path.name}...")
        
        with Image.open(file_path) as img:
            # Auto-orient based on EXIF tagging from iPhone cameras
            img = ImageOps.exif_transpose(img)

            # Convert RGBA/P to RGB for standard JPEG savings if needed
            if img.mode in ("RGBA", "P") and ext in ['.jpg', '.jpeg', '.heic', '.heif']:
                img = img.convert("RGB")
            elif img.mode != "RGB" and ext not in ['.png', '.webp']:
                img = img.convert("RGB")

            # 1. Studio-grade photo enhancement (Brightening & Contrast)
            # Brighten by 15% to clear low-light room shadows in student photos
            brightness_enhancer = ImageEnhance.Brightness(img)
            img = brightness_enhancer.enhance(1.15)

            # Boost contrast by 10% for crisp definition
            contrast_enhancer = ImageEnhance.Contrast(img)
            img = contrast_enhancer.enhance(1.10)

            # Boost color saturation slightly by 8% for warm skin tones
            color_enhancer = ImageEnhance.Color(img)
            img = color_enhancer.enhance(1.08)

            # 2. Responsive web resolution cap (downscale huge raw camera shots)
            max_dimension = 2000
            if max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                print(f"  +-- Resized dimensions to max {max_dimension}px")

            # 3. Save optimized format (Convert HEIC/HEIF to JPG)
            if ext in ['.heic', '.heif']:
                new_path = file_path.with_suffix('.jpg')
                img.save(new_path, format='JPEG', quality=88, optimize=True)
                try:
                    file_path.unlink()  # Remove unoptimized HEIC source
                except Exception:
                    pass
                print(f"  +-- Converted HEIC -> {new_path.name} & deleted source.")
            elif ext in ['.jpg', '.jpeg']:
                img.save(file_path, format='JPEG', quality=88, optimize=True)
                print(f"  +-- Enhanced & compressed JPEG (Quality: 88%).")
            elif ext == '.png':
                img.save(file_path, format='PNG', optimize=True)
                print(f"  +-- Enhanced & compressed PNG.")
            elif ext == '.webp':
                img.save(file_path, format='WEBP', quality=88)
                print(f"  +-- Enhanced & compressed WEBP.")

    except Exception as e:
        print(f"[ERROR] Failed to process {file_path.name}: {str(e)}")

def main():
    root_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [root_dir / "assets" / "images", root_dir / "src" / "assets"]

    found = False
    for directory in target_dirs:
        if directory.exists():
            found = True
            print(f"=== Scanning Image Repository: {directory} ===")
            for root, _, files in os.walk(directory):
                for file in files:
                    file_path = Path(root) / file
                    optimize_and_enhance_image(file_path)

    if not found:
        print("No media directories located at 'assets/images' or 'src/assets'. Verify asset structure.")
    else:
        print("=== Media Vault Brightening, Conversion & Compression Complete ===")

if __name__ == "__main__":
    main()
