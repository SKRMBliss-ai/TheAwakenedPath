import os
from PIL import Image

dir_path = r"c:\Github\Bliss\MindGym\public\assets\landing"
for filename in os.listdir(dir_path):
    if filename.endswith(".png"):
        file_path = os.path.join(dir_path, filename)
        img = Image.open(file_path)
        webp_path = os.path.join(dir_path, filename.replace(".png", ".webp"))
        img.save(webp_path, "WEBP", quality=85)
        print(f"Converted {filename} to {os.path.basename(webp_path)}")
        os.remove(file_path)
