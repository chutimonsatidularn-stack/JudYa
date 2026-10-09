# Rebuild the review prototype: python3 build.py  (run inside prototype/)
# app.src.html holds placeholders (__LOGO_V__ etc.); this inlines the approved SVGs from ../docs/design/assets and the Home banner pictures from ../assets/banner.
import base64
def uri(p): return 'data:image/svg+xml;base64,'+base64.b64encode(open(p,'rb').read()).decode()
t=open('app.src.html',encoding='utf8').read()
for k,f in {'__LOGO_V__':'logo-vertical-tight','__LOGO_NT__':'logo-vertical-notag-tight','__ICON__':'icon','__SPLASH__':'splash-noleaf-tight','__WOMAN__':'woman-tight'}.items():
    assert k in t,k
    t=t.replace(k,uri(f'../docs/design/assets/{f}.svg'))
for k,f in {'__BN_NORMAL__':'normal','__BN_REMINDER__':'reminder','__BN_FAMILY__':'family'}.items():
    assert k in t,k
    t=t.replace(k,uri(f'../assets/banner/judya-banner-{f}.svg'))
open('judya-flow-v0.7.html','w',encoding='utf8').write(t)
print('built',len(t))
