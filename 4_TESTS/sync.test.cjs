// Đồng bộ gói: dựng lại từ 6_NGUON bằng build.py (trong thư mục tạm) rồi so SHA-256 với 1_BACKEND, 2_GATEWAY, AN_TOAN_KHI_DAN. Backend nguồn có điểm nhúng hak-format.js nên so sánh với bản đã dựng, không so thô với nguồn.
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root=path.join(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'katy-sync-')),src=path.join(tmp,'src');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
try{
  fs.mkdirSync(src);for(const f of fs.readdirSync(path.join(root,'6_NGUON')))fs.copyFileSync(path.join(root,'6_NGUON',f),path.join(src,f));
  let r=null;for(const exe of (process.env.PYTHON?[process.env.PYTHON]:['python3','python','py'])){r=spawnSync(exe,[path.join(src,'build.py')],{encoding:'utf8',cwd:tmp});if(!r.error&&r.status===0)break;r=null}
  if(!r){console.log('⚠ BỊ CHẶN (chưa xác minh): không chạy được Python để dựng lại (đặt biến PYTHON)');process.exitCode=0;return}
  const pairs=[['dist/Backend.gs','1_BACKEND/Backend.gs'],['dist/index.html','2_GATEWAY/index.html'],['dist/Gateway.gs','2_GATEWAY/Gateway.gs'],['dist/luong-nghiep-vu.html','2_GATEWAY/luong-nghiep-vu.html'],
    ['dist-safe/Backend.gs','AN_TOAN_KHI_DAN/Backend.gs'],['dist-safe/index.html','AN_TOAN_KHI_DAN/index.html'],['dist-safe/Gateway.gs','AN_TOAN_KHI_DAN/Gateway.gs'],['dist-safe/luong-nghiep-vu.html','AN_TOAN_KHI_DAN/luong-nghiep-vu.html']];
  let bad=0;for(const [a,b] of pairs){const ok=sha(path.join(tmp,a))===sha(path.join(root,b));console.log((ok?'✔ ':'✖ ')+b+(ok?'':' KHÁC bản dựng từ 6_NGUON'));if(!ok)bad++}
  const be=fs.readFileSync(path.join(root,'1_BACKEND/Backend.gs'),'utf8'),hf=fs.readFileSync(path.join(root,'6_NGUON/hak-format.js'),'utf8');
  if(!be.includes(hf.trim())){console.log('✖ Backend triển khai không chứa nguyên văn hak-format.js');bad++}else console.log('✔ Backend chứa nguyên văn hak-format.js');
  process.exitCode=bad?1:0;
}finally{try{fs.rmSync(tmp,{recursive:true,force:true})}catch(e){}}
