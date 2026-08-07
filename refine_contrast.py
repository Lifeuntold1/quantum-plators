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

# Explicit whitelist of existing high-contrast student portraits requiring additional contrast reduction
# New images uploaded after this checkpoint will NOT be processed or altered in any way.
TARGETED_CONTRAST_PORTRAITS = [
    "paschal.jpeg", "paschal.jpg", "paschal.png",
    "buki.jpeg", "buki.jpg", "buki.png",
    "bulus.jpeg", "bulus.jpg", "bulus.png",
    "josiah.jpeg", "josiah.jpg", "josiah.png",
    "penuel.jpeg", "penuel.jpg", "penuel.png",
    "arigu.jpeg", "arigu.jpg",
    "jeremiah.jpeg", "jeremiah.jpg",
    "seth.jpeg", "seth.jpg"
]

def reduce_portrait_contrast(file_path: Path):
    try:
        ext = file_path.suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            return

        name_lower = file_path.name.lower()
        if name_lower not in TARGETED_CONTRAST_PORTRAITS:
            # Preserve all new images and normally balanced portraits without any modification
            return

        print(f"[CONTRAST SOFTENING] Refining {file_path.name}...")
        
        with Image.open(file_path) as img:
            img = ImageOps.exif_transpose(img)

            if img.mode in ("RGBA", "P") and ext in ['.jpg', '.jpeg']:
                img = img.convert("RGB")
            elif img.mode != "RGB" and ext not in ['.png', '.webp']:
                img = img.convert("RGB")

            # Soften contrast by an additional 12% (0.88x) to rescue dark shadow details on PASCHAL and similar portraits
            contrast_enhancer = ImageEnhance.Contrast(img)
            img = contrast_enhancer.enhance(0.88)

            # Subtle sharpness smoothing (0.94x) to remove hard digital edge halos
            sharpness_enhancer = ImageEnhance.Sharpness(img)
            img = sharpness_enhancer.enhance(0.94)

            if ext in ['.jpg', '.jpeg']:
                img.save(file_path, format='JPEG', quality=92, optimize=True)
                print("  +-- Successfully reduced harsh contrast & balanced tonal depth (JPEG).")
            elif ext == '.png':
                img.save(file_path, format='PNG', optimize=True)
                print("  +-- Successfully reduced harsh contrast & balanced tonal depth (PNG).")
            elif ext == '.webp':
                img.save(file_path, format='WEBP', quality=92)
                print("  +-- Successfully reduced harsh contrast & balanced tonal depth (WEBP).")

    except Exception as e:
        print(f"[ERROR] Failed contrast refinement on {file_path.name}: {str(e)}")

def main():
    root_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [root_dir / "assets" / "images", root_dir / "src" / "assets"]

    print("=== Initiating Selective Contrast Softening on Targeted Existing Portraits ===")
    print("NOTE: Any newly uploaded files will be explicitly excluded and preserved unedited.")

    processed_count = 0
    for directory in target_dirs:
        if directory.exists():
            for root, _, files in os.walk(directory):
                for file in files:
                    file_path = Path(root) / file
                    if file.lower() in TARGETED_CONTRAST_PORTRAITS:
                        reduce_portrait_contrast(file_path)
                        processed_count += 1

    print(f"=== Selective Portrait Contrast Softening Complete (Refined {processed_count} items) ===")

if __name__ == "__main__":
    main()
