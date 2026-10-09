import sys
from playwright.sync_api import sync_playwright
ids=sys.argv[1:]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':900})
    errs=[];pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'fonts' not in m.text and 'ERR_' not in m.text else None);pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/judya/out/index.html#proto');pg.wait_for_timeout(800)
    for i in ids:
        pg.evaluate(f"document.querySelector('[data-open=\"{i}\"]').click()");pg.wait_for_timeout(250)
        pg.locator('#phone').screenshot(path=f'work/s_{i}.png')
    print('errors:',errs)
    b.close()
