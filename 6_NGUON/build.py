#!/usr/bin/env python3
"""Ghép các phần nguồn thành dist/index.html: python3 src/build.py  (chạy từ thư mục gốc dự án)."""
import os,sys
R=os.path.dirname(os.path.abspath(__file__))
def rd(n): return open(os.path.join(R,n),encoding='utf8').read()
t=rd('index.template.html')
script='<script>/* ===== HAK Smart Filter: lõi nhúng nguyên văn từ HAK_SMART_FILTER (commit 51816814f1224e8d0f666dc9a3cc1c66ca440b83) ===== */\n'+rd('filter-core.js')+'</script>\n<script>'+rd('hak-format.js')+'\n'+rd('filter-fields.js')+'\n'+rd('filter-ui.js')+'\n'+rd('master-detail.js')+'\n'+rd('summary-ui.js')+'\n'+rd('xlsx-lite.js')+'\n'+rd('bulk-template.js')+'\n'+rd('einvoice-xml.js')+'\n'+rd('xml-import-ui.js')+'\n'+rd('passthrough-ui.js')+'\n'+rd('cashbook-ui.js')+'\n'+rd('cashcontrol-ui.js')+'</script>\n'
assert '</script>' not in rd('filter-core.js')+rd('hak-format.js')+rd('filter-fields.js')+rd('filter-ui.js')+rd('master-detail.js')+rd('summary-ui.js')+rd('xlsx-lite.js')+rd('bulk-template.js')+rd('einvoice-xml.js')+rd('xml-import-ui.js')
assert t.count('<!--@@SCRIPT_BLOCK@@-->')==1 and t.count('/*@@CSS_BLOCK@@*/')==1
t=t.replace('<!--@@SCRIPT_BLOCK@@-->',script).replace('/*@@CSS_BLOCK@@*/',rd('filter.css'))
# Apps Script coi mọi '<?' trong index.html là mở khối scriptlet của HtmlTemplate: chỉ cho phép đúng dấu <?= userEmail ?>. Chuỗi XML '<?xml ...' trong mã JS phải viết '<' + '?xml' (lỗi đã gặp: SyntaxError: Unexpected identifier 'version' (line 5, file "Code")).
import re
_rest=t.replace('<?= userEmail ?>','')
assert '<?' not in _rest, 'index.html còn chuỗi "<?" ngoài <?= userEmail ?>: '+repr(_rest[_rest.index('<?')-30:_rest.index('<?')+60])
out=os.path.join(os.path.dirname(R),'dist'); os.makedirs(out,exist_ok=True)
open(os.path.join(out,'index.html'),'w',encoding='utf8').write(t)
print('dist/index.html',len(t))

# ---- bản an toàn khi dán (không còn chú thích // /* */) ----
import subprocess,shutil
safe=os.path.join(os.path.dirname(R),'dist-safe'); os.makedirs(safe,exist_ok=True)
be=rd('Backend.gs'); assert be.count('/*@@HAK_FORMAT@@*/')==1
tmp=os.path.join(os.path.dirname(R),'.build-tmp'); os.makedirs(tmp,exist_ok=True)
open(os.path.join(tmp,'Backend.gs'),'w',encoding='utf8').write(be.replace('/*@@HAK_FORMAT@@*/',rd('hak-format.js')))
for name,mode in (('Backend.gs','js'),('Gateway.gs','js'),('luong-nghiep-vu.html','html')):
    subprocess.check_call(['node',os.path.join(R,'strip_comments.cjs'),(os.path.join(tmp,name) if name=='Backend.gs' else os.path.join(R,name)),os.path.join(safe,name),mode])
subprocess.check_call(['node',os.path.join(R,'strip_comments.cjs'),os.path.join(out,'index.html'),os.path.join(safe,'index.html'),'html'])
for name in ('Backend.gs','Gateway.gs','luong-nghiep-vu.html'): shutil.copy(os.path.join(tmp if name=='Backend.gs' else R,name),os.path.join(out,name))
shutil.rmtree(tmp)
print('dist/ và dist-safe/ đã dựng')
