python3 -I - <<'PY'
import re
s=open('src.html',encoding='utf8').read();a=open('app.js',encoding='utf8').read()
d=open('data.js',encoding='utf8').read().replace("if (typeof module !== 'undefined') module.exports","if (false) module.exports")
a=a.replace('__LOGO__',open('assets/logo.b64').read().strip()).replace('__GLOGO__',open('assets/glogo.b64').read().strip()).replace('__PHOTO__',open('assets/photo.b64').read().strip())
out=s+"\n<script>\n"+d+"\n"+a+"\n</script>\n"
open('page.html','w',encoding='utf8').write(out)
open('ebrameeto.html','w',encoding='utf8').write('<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+out+'</body></html>')
PY
