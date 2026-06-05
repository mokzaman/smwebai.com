from pathlib import Path
from PIL import Image

source = Path('assets/logo.png')
if not source.exists():
    raise SystemExit('source logo missing')
with Image.open(source) as img:
    for size in [16, 32, 48, 180]:
        out = img.convert('RGBA').resize((size, size), Image.LANCZOS)
        out.save(Path(f'assets/favicon-{size}x{size}.png'))
    ico = img.convert('RGBA').resize((64, 64), Image.LANCZOS)
    ico.save(Path('assets/favicon.ico'), format='ICO', sizes=[(64, 64), (32, 32), (16, 16)])
print('favicon files created')
