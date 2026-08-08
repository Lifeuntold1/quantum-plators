import os
from PIL import Image, ImageEnhance

# Directories to process
TARGET_DIRS = [
    os.path.join("assets", "images", "students"),
    os.path.join("assets", "images", "events", "class-group"),
    os.path.join("assets", "images", "events"),
    os.path.join("assets", "images", "slideshow"),
    os.path.join("assets", "images", "prof")
]

# Adjustments
BRIGHTNESS_FACTOR = 0.85 # Reduce brightness by 15%
CONTRAST_FACTOR = 0.95   # Slight contrast reduction for softness

def process_image(filepath):
    try:
        with Image.open(filepath) as img:
            # Convert to RGB if necessary (e.g. RGBA or P)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Apply brightness reduction
            enhancer = ImageEnhance.Brightness(img)
            img_reduced_brightness = enhancer.enhance(BRIGHTNESS_FACTOR)
            
            # Apply contrast adjustment
            contrast_enhancer = ImageEnhance.Contrast(img_reduced_brightness)
            final_img = contrast_enhancer.enhance(CONTRAST_FACTOR)
            
            # Save the processed image back
            final_img.save(filepath, quality=95)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    total_processed = 0
    total_failed = 0
    
    for directory in TARGET_DIRS:
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue
            
        print(f"Processing directory: {directory}")
        for root, _, files in os.walk(directory):
            for filename in files:
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    filepath = os.path.join(root, filename)
                    if process_image(filepath):
                        total_processed += 1
                    else:
                        total_failed += 1
                    
    print(f"\nProcessing Complete.")
    print(f"Successfully processed: {total_processed} images")
    print(f"Failed to process: {total_failed} images")

if __name__ == "__main__":
    main()
