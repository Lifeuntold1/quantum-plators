import os
from PIL import Image

TARGET_DIR = r"C:\Users\DELL\.gemini\antigravity\scratch\quantum\assets\images\events\naps-award"

def compress_images():
    if not os.path.exists(TARGET_DIR):
        print(f"Directory not found: {TARGET_DIR}")
        return

    processed = 0
    for filename in os.listdir(TARGET_DIR):
        if filename.lower().endswith((".png", ".jpg", ".jpeg")):
            filepath = os.path.join(TARGET_DIR, filename)
            try:
                with Image.open(filepath) as img:
                    # Convert to RGB to save as JPEG/WebP easily
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # Resize if width > 800px
                    max_width = 800
                    if img.width > max_width:
                        ratio = max_width / float(img.width)
                        new_height = int((float(img.height) * float(ratio)))
                        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Save compressed version (overwrite or save as WebP)
                    # To save space, we'll save it as WebP and remove the original, 
                    # but let's just overwrite the PNG with a highly optimized version for now 
                    # or save as .webp and delete .png. Let's save as .webp.
                    webp_filename = os.path.splitext(filename)[0] + ".webp"
                    webp_filepath = os.path.join(TARGET_DIR, webp_filename)
                    
                    img.save(webp_filepath, "WEBP", quality=80)
                    
                    if filename != webp_filename:
                        os.remove(filepath) # Remove original to save space
                    
                    processed += 1
                    print(f"Compressed: {filename} -> {webp_filename}")
            except Exception as e:
                print(f"Failed to compress {filename}: {e}")
                
    print(f"Total processed: {processed}")

if __name__ == "__main__":
    compress_images()
