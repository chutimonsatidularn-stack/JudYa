from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':900})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/judya/out/index.html#proto');pg.wait_for_timeout(800)
    ph=pg.locator('#phone');ev=pg.evaluate
    ev("document.querySelector('[data-open=\"meds\"]').click()");pg.wait_for_timeout(200)
    ev("S.person='แม่';draw()");pg.wait_for_timeout(150)
    ph.locator('[data-act="aledit:0"]').click();pg.wait_for_timeout(200)
    print(ev("S.screen"),ev("S.al.drug"),ev("document.querySelector('#phone h1').innerText"))
    ph.locator('[data-al="drug"]').fill('Penicillin V');ph.locator('[data-act="alsave"]').click();pg.wait_for_timeout(250)
    print(ev("S.allergies.แม่[0].drug"),ev("S.allergies.แม่[0].date"),ev("S.allergies.แม่.length"))
    ph.locator('[data-act="aldelask:0"]').click();pg.wait_for_timeout(200)
    print('confirm shown','ลบรายการนี้ใช่ไหม' in ev("document.querySelector('#phone').innerText"))
    ph.locator('[data-act="aldelno"]').click();pg.wait_for_timeout(150);print('still',ev("S.allergies.แม่.length"))
    ph.locator('[data-act="aldelask:0"]').click();pg.wait_for_timeout(150)
    ph.locator('[data-act="aldel:0"]').click();pg.wait_for_timeout(250)
    print('after delete',ev("S.allergies.แม่.length"),'ยังไม่มีบันทึกแพ้ยา' in ev("document.querySelector('#phone').innerText"))
    print('errors',errs);b.close()
