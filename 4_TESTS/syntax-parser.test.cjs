// Kiểm thử chính bộ kiểm tra cú pháp: fixture chứng minh token trong chú thích/chuỗi/template/regex KHÔNG bị báo sai,
// cú pháp thực thi bị cấm theo chính sách ES2019 PHẢI bị phát hiện với đúng số dòng, và thiếu/hỏng parser cho trạng thái BLOCKED (không PASS giả).
const fs=require('fs'),path=require('path'),assert=require('assert'),{spawnSync}=require('child_process'),crypto=require('crypto');
const SC=require('./_syntax_check.cjs');let steps=0;const eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)},ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
const PR=SC.loadParser(),dir=path.join(__dirname,'fixtures','syntax'),exp=JSON.parse(fs.readFileSync(path.join(dir,'expect.json'),'utf8'));
suite('1. Parser ghim phiên bản nạp được và đúng SHA256',()=>{ok(PR.parser,'không nạp được parser: '+PR.reason);eq(PR.name,'acorn 8.18.0');const pin=JSON.parse(fs.readFileSync(path.join(__dirname,'vendor','PARSER_PIN.json'),'utf8'));eq(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'vendor',pin.file))).digest('hex'),pin.sha256)});
suite('2. Fixture: token cấm trong chú thích/chuỗi/template/regex không báo sai; cú pháp thực thi bị cấm bị phát hiện đúng dòng',()=>{
  Object.keys(exp).forEach(f=>{const r=SC.checkPolicy(PR.parser,fs.readFileSync(path.join(dir,f),'utf8'));eq(r.ok,exp[f].ok,f+': '+JSON.stringify(r));if(!exp[f].ok)eq(r.line,exp[f].line,f+' sai số dòng: '+r.line)});
  eq(Object.keys(exp).length,6);
});
suite('3. Mức ES2019 vẫn cho phép cú pháp dự án đang dùng (spread đối tượng, async, ** ...)',()=>{
  ok(SC.checkPolicy(PR.parser,'var o = {a:1}; var p = {...o, b:2}; async function f(){ await 1; } var q = 2 ** 3; var r = [..."ab"]; try{ f() }catch{ }').ok);
});
suite('4. Thiếu parser → syntax.test báo BLOCKED (thoát mã 3), không PASS và không quy lỗi cho ứng dụng',()=>{
  const r=spawnSync(process.execPath,[path.join(__dirname,'syntax.test.cjs')],{encoding:'utf8',env:Object.assign({},process.env,{KATY_NO_PARSER:'1'})});
  eq(r.status,3,r.stdout.slice(-300));ok(/BLOCKED/.test(r.stdout)&&/CHƯA XÁC MINH/.test(r.stdout));ok(!/đạt chính sách ES2019/.test(r.stdout),'không được in PASS cho kiểm tra parser khi thiếu parser');
  const r2=spawnSync(process.execPath,[path.join(__dirname,'syntax.test.cjs')],{encoding:'utf8'});eq(r2.status,0,'có parser thì đạt: '+r2.stdout.slice(-200));
});
suite('5. Parser bị sửa nội dung (SHA256 lệch) → không dùng, báo BLOCKED',()=>{
  const tmp=fs.mkdtempSync(path.join(require('os').tmpdir(),'katy-syn-'));try{
    fs.mkdirSync(path.join(tmp,'vendor'));fs.copyFileSync(path.join(__dirname,'_syntax_check.cjs'),path.join(tmp,'_syntax_check.cjs'));fs.readdirSync(path.join(__dirname,'vendor')).forEach(f=>fs.copyFileSync(path.join(__dirname,'vendor',f),path.join(tmp,'vendor',f)));fs.appendFileSync(path.join(tmp,'vendor','acorn-8.18.0.js'),'\n// sửa đổi\n');
    const r=require(path.join(tmp,'_syntax_check.cjs')).loadParser();ok(!r.parser&&/SHA256/.test(r.reason),r.reason);
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
console.log('Tổng kiểm tra:',steps);
