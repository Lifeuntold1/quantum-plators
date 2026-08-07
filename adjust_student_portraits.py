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

def adjust_student_portrait(file_path: Path):
    try:
        ext = file_path.suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            return

        # Explicitly exclude group shots, class photos, prof portraits, and banner slides
        name_lower = file_path.name.lower()
        parent_lower = str(file_path.parent).lower()
        excluded_keywords = ['group', 'class', 'prof', 'slideshow', 'banner']
        if any(kw in name_lower for kw in excluded_keywords) or any(kw in parent_lower for kw in excluded_keywords if kw != 'students'):
            return

        print(f"[PORTRAIT ADJUSTMENT] Rebalancing {file_path.name}...")
        
        with Image.open(file_path) as img:
            img = ImageOps.exif_transpose(img)

            if img.mode in ("RGBA", "P") and ext in ['.jpg', '.jpeg']:
                img = img.convert("RGB")
            elif img.mode != "RGB" and ext not in ['.png', '.webp']:
                img = img.convert("RGB")

            # Reduce Brightness (0.87x) to eliminate overexposure and blown-out highlights from iPhone HDR
            brightness_enhancer = ImageEnhance.Brightness(img)
            img = brightness_enhancer.enhance(0.87)

            # Smooth Contrast (0.94x) to soften hard shadows and restore balanced, natural skin textures
            contrast_enhancer = ImageEnhance.Contrast(img)
            img = contrast_enhancer.enhance(0.94)

            # Retain gentle color saturation for organic tonal fidelity
            color_enhancer = ImageEnhance.Color(img)
            img = color_enhancer.enhance(0.98)

            if ext in ['.jpg', '.jpeg']:
                img.save(file_path, format='JPEG', quality=90, optimize=True)
                print("  +-- Successfully calibrated portrait exposure & contrast (JPEG).")
            elif ext == '.png':
                img.save(file_path, format='PNG', optimize=True)
                print("  +-- Successfully calibrated portrait exposure & contrast (PNG).")
            elif ext == '.webp':
                img.save(file_path, format='WEBP', quality=90)
                print("  +-- Successfully calibrated portrait exposure & contrast (WEBP).")

    except Exception as e:
        print(f"[ERROR] Failed portrait adjustment on {file_path.name}: {str(e)}")

def main():
    root_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [root_dir / "assets" / "images", root_dir / "src" / "assets", root_dir / "public" / "assets"]

    processed_count = 0
    for directory in target_dirs:
        if directory.exists():
            print(f"=== Scanning Directory for Student Portraits: {directory} ===")
            for root, _, files in os.walk(directory):
                for file in files:
                    file_path = Path(root) / file
                    # Ensure we don't adjust excluded files
                    name_lower = file_path.name.lower()
                    excluded_keywords = ['group', 'class', 'prof', 'slideshow', 'banner']
                    if not any(kw in name_lower for kw in excluded_keywords):
                        adjust_student_portrait(file_path)
                        processed_count += 1

    print(f"=== Student Portrait Calibration Complete (Processed {processed_count} portrait items) ===")

if __name__ == "__main__":
    main()
