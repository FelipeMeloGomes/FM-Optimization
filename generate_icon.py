from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 256
OUTPUT_DIR = "assets"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "icon.ico")

BG_COLOR = (18, 18, 42)
TEXT_COLOR = (255, 140, 0)
ACCENT_COLOR = (0, 229, 255)

FONT_PATH = os.path.join("fonts", "JetBrainsMonoNerdFont-Bold.ttf")

img = Image.new("RGBA", (SIZE, SIZE), BG_COLOR)
draw = ImageDraw.Draw(img)

font_size = 130
if os.path.exists(FONT_PATH):
    font = ImageFont.truetype(FONT_PATH, font_size)
else:
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except:
        font = ImageFont.load_default()

text = "FM"
bbox = draw.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
x = (SIZE - text_w) // 2 - bbox[0]
y = (SIZE - text_h) // 2 - bbox[1] - 10
draw.text((x, y), text, fill=TEXT_COLOR, font=font)

bar_y = y + text_h + 16
draw.rounded_rectangle([72, bar_y, 184, bar_y + 4], radius=2, fill=ACCENT_COLOR)

os.makedirs(OUTPUT_DIR, exist_ok=True)
img.save(OUTPUT_FILE, format="ICO", sizes=[(256, 256), (48, 48), (32, 32), (16, 16)])
print(f"Icon generated: {os.path.abspath(OUTPUT_FILE)}")
