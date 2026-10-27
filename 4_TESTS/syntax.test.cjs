// Kiểm tra cú pháp Backend/Gateway và mọi khối <script> JavaScript nhúng trong HTML, cho CẢ bản thường (1_BACKEND, 2_GATEWAY) và bản an toàn khi dán (AN_TOAN_KHI_DAN). Chỉ biên dịch, không chạy.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');let n=0,bad=0;
function comp(name,code){try{new vm.Script(code,{filename:name});n++}catch(e){bad++;console.log('✖',name,e.message)}}
for(const f of ['1_BACKEND/Backend.gs','AN_TOAN_KHI_DAN/Backend.gs','2_GATEWAY/Gateway.gs','AN_TOAN_KHI_DAN/Gateway.gs'])comp(f,fs.readFileSync(path.join(root,f),'utf8'));
for(const f of ['2_GATEWAY/index.html','AN_TOAN_KHI_DAN/index.html','2_GATEWAY/luong-nghiep-vu.html','AN_TOAN_KHI_DAN/luong-nghiep-vu.html']){
  const t=fs.readFileSync(path.join(root,f),'utf8');let i=0,m;const re=/<script([^>]*)>([\s\S]*?)<\/script>/g;
  while((m=re.exec(t))){if(/\bsrc=/.test(m[1])||/type=["']?application\/(json|ld\+json)/i.test(m[1]))continue;comp(f+'#script'+(i++),m[2])}
  console.log('✔',f,i+' khối script JavaScript');
}
// Chính sách tương thích bảo thủ: phân tích Backend/Gateway bằng PARSER THẬT (acorn vendored, ghim phiên bản + SHA256) ở ecmaVersion 2019.
// Cấm hằng BigInt `1n`, `??`, `?.`, ngăn cách số `1_000` trong MÃ THỰC THI (chuỗi/chú thích/regex/template không bị đánh giá).
// Đây là chính sách kiểm tra của dự án, KHÔNG phải bằng chứng tương thích đầy đủ với Apps Script. Thiếu parser → BLOCKED (thoát mã 3), không báo PASS và không quy lỗi cho ứng dụng.
const SC=require('./_syntax_check.cjs'),PR=SC.loadParser();let blocked=0;
if(!PR.parser){blocked=1;console.log('⚠ BLOCKED  kiểm tra tương thích ES'+SC.POLICY_ECMA+' CHƯA XÁC MINH:',PR.reason)}
else{
  console.log('Parser:',PR.name,'sha256',PR.sha256.slice(0,16)+'…');
  for(const f of ['1_BACKEND/Backend.gs','AN_TOAN_KHI_DAN/Backend.gs','2_GATEWAY/Gateway.gs','AN_TOAN_KHI_DAN/Gateway.gs']){
    const r=SC.checkPolicy(PR.parser,fs.readFileSync(path.join(root,f),'utf8'));
    if(r.ok){n++;console.log('✔',f,'đạt chính sách ES'+SC.POLICY_ECMA+' (không chứng minh tương thích đầy đủ Apps Script)')}
    else{bad++;console.log('✖',f,'vi phạm chính sách ES'+SC.POLICY_ECMA+':',r.message,'— dòng',r.line,'cột',r.column)}
  }
}
// HtmlService template: index.html được nạp bằng createTemplateFromFile nên mọi "<?" mở một scriptlet (lỗi đã gặp thật: "Unexpected identifier 'version' (line 5, file Code)" do chuỗi '<?xml version...'). Chỉ cho phép <?= userEmail ?>.
for(const f of ['2_GATEWAY/index.html','AN_TOAN_KHI_DAN/index.html']){
  const t=fs.readFileSync(path.join(root,f),'utf8').replace('<?= userEmail ?>','');
  const k=t.indexOf('<?');
  if(k>=0){bad++;console.log('✖',f,'còn "<?" ngoài <?= userEmail ?> gần:',JSON.stringify(t.slice(k,k+40)))}else{n++;console.log('✔',f,'không còn "<?" lạ (an toàn với HtmlTemplate)')}
}
console.log('Đã biên dịch/kiểm',n,'mục; lỗi',bad+(blocked?'; BLOCKED: kiểm tra parser chưa xác minh':''));process.exitCode=bad?1:(blocked?3:0);
