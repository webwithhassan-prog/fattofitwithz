"""
Copies and resizes the images and content the website needs from ../docs into this app.

Run from the app folder:   python scripts/prepare-assets.py
Safe to re-run: it overwrites the generated files.

Inputs  : ../docs/assets/..., ../docs/seed/*.json, ../docs/reference/content/legal-clean/*.md
Outputs : public/images/..., src/app/icon.png, src/app/apple-icon.png, src/content/...
"""
from pathlib import Path
import shutil
from PIL import Image, ImageDraw, ImageFont

APP = Path(__file__).resolve().parent.parent
DOCS = APP.parent / "docs"
ASSETS = DOCS / "assets"
PUBLIC = APP / "public" / "images"
CONTENT = APP / "src" / "content"


def save_jpg(img: Image.Image, path: Path, quality: int = 82) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    print("  wrote", path.relative_to(APP))


def main() -> None:
    # 1. Coach photos: already cropped to 4:5 around the coach (720x900)
    for src in sorted((ASSETS / "client-supplied" / "crops-4x5").glob("coach-p*-720x900.jpg")):
        key = src.name.split("-")[1]  # "p01"
        save_jpg(Image.open(src), PUBLIC / "coach" / f"coach-{key}.jpg", 85)

    # 2. Logo (transparent PNG) + favicon / apple icon (square, padded, white background)
    logo = Image.open(ASSETS / "client-supplied" / "logo-cropped.png").convert("RGBA")
    (PUBLIC).mkdir(parents=True, exist_ok=True)
    small = logo.copy()
    small.thumbnail((256, 256), Image.LANCZOS)
    small.save(PUBLIC / "logo.png", optimize=True)
    print("  wrote public/images/logo.png")
    for size, name in ((512, "icon.png"), (180, "apple-icon.png")):
        canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
        mark = logo.copy()
        mark.thumbnail((int(size * 0.92), int(size * 0.92)), Image.LANCZOS)
        canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
        canvas.convert("RGB").save(APP / "src" / "app" / name)
        print("  wrote src/app/" + name)

    # 3. Before/after pair for the drag slider (split the side-by-side composite)
    t4 = Image.open(ASSETS / "original" / "transformation-04-71-to-61kg.png").convert("RGB")
    photo = t4.crop((0, 0, t4.width, int(t4.height * 0.62)))
    half = photo.width // 2
    save_jpg(photo.crop((8, 8, half - 4, photo.height)), PUBLIC / "results" / "before-71kg.jpg", 88)
    save_jpg(photo.crop((half + 4, 8, photo.width - 8, photo.height)), PUBLIC / "results" / "after-61kg.jpg", 88)

    # 4. Transformation posters (shown uncropped on the testimonials page)
    for src in sorted((ASSETS / "original").glob("transformation-*")):
        img = Image.open(src)
        img.thumbnail((900, 1600), Image.LANCZOS)
        save_jpg(img, PUBLIC / "results" / (src.stem + ".jpg"), 80)

    # 5. Illustrations (pink "how it works" art) - keep PNG for transparency
    for src in sorted((ASSETS / "original").glob("how-step-*.png")):
        img = Image.open(src).convert("RGBA")
        img.thumbnail((640, 640), Image.LANCZOS)
        (PUBLIC / "illustrations").mkdir(parents=True, exist_ok=True)
        img.save(PUBLIC / "illustrations" / src.name, optimize=True)
        print("  wrote public/images/illustrations/" + src.name)

    # 6. Social share image (1200x630) - blush background, coach photo, headline
    og = Image.new("RGB", (1200, 630), (251, 239, 241))
    coach = Image.open(PUBLIC / "coach" / "coach-p01.jpg").resize((420, 525), Image.LANCZOS)
    og.paste(coach, (720, 52))
    draw = ImageDraw.Draw(og)
    try:
        serif = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 64)
        serif_i = ImageFont.truetype("C:/Windows/Fonts/georgiai.ttf", 64)
        sans = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 28)
    except OSError:  # non-Windows machine: fall back to the default bitmap font
        serif = serif_i = sans = ImageFont.load_default()
    draw.text((70, 150), "Your Health in", font=serif, fill=(43, 26, 31))
    draw.text((70, 230), "Safe Hands.", font=serif_i, fill=(163, 21, 79))
    draw.text((70, 340), "Online nutrition & fitness coaching for women", font=sans, fill=(107, 88, 93))
    draw.text((70, 380), "with Zaineb Danish  ·  fattofitwithz.com", font=sans, fill=(107, 88, 93))
    og.paste(small.resize((96, 96)), (70, 470), small.resize((96, 96)))
    save_jpg(og, PUBLIC / "og.jpg", 85)

    # 7. Content: seed JSON + clean legal markdown
    CONTENT.mkdir(parents=True, exist_ok=True)
    for src in (DOCS / "seed").glob("*.json"):
        shutil.copy(src, CONTENT / src.name)
        print("  copied src/content/" + src.name)
    (CONTENT / "legal").mkdir(exist_ok=True)
    for src in (DOCS / "reference" / "content" / "legal-clean").glob("*.md"):
        shutil.copy(src, CONTENT / "legal" / src.name)
        print("  copied src/content/legal/" + src.name)


if __name__ == "__main__":
    main()
