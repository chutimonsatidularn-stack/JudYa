import sys, glob, os
from playwright.sync_api import sync_playwright
out = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch()
    for f in sorted(glob.glob(out + "/*.svg")):
        pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        pg.goto("file://" + os.path.abspath(f))
        h = pg.evaluate("document.documentElement.getBoundingClientRect().height")
        pg.set_viewport_size({"width": 390, "height": int(h)})
        pg.screenshot(path=os.path.join(out, "png", os.path.basename(f).replace(".svg", ".png")))
    b.close()
