// R34 mục 6: ensureSchema/migration các bảng + cột thêm ở R3.x–R3.4 (PassLink, CashTransfer, CashExchange, BankRecon, CashCount + cột xử lý chênh lệch). Chạy lại nhiều lần, giữ dữ liệu, phát hiện sửa tay tiêu đề. Engine thật + Sheet giả (KHÔNG phải Google thật).
const assert=require('assert'),path=require('path');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),makeEnv=require('./bench/_env.cjs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const NEW=['PassLink','CashTransfer','CashExchange','BankRecon','CashCount'];
const dump=db=>JSON.stringify(Object.keys(db).sort().map(n=>[n,db[n].cells]));
suite('M1. Cơ sở trống: ensureSchema tạo đủ bảng mới, tiêu đề đúng, chạy lại 3 lần không đổi một ô nào',()=>{
  const {ctx,dbs}=makeEnv(SRCP);eq(JSON.stringify(ctx.ensureSchema()),'[]');
  NEW.forEach(t=>{const s=dbs.main[t];ok(s,'có '+t);const cols=ctx.parseCols_(t);eq(JSON.stringify(cols.map((c,i)=>s.cells['1,'+(i+1)])),JSON.stringify(cols.map(c=>c.name)),'tiêu đề '+t)});
  const snap=dump(dbs.main);for(let i=0;i<3;i++){eq(JSON.stringify(ctx.ensureSchema()),'[]');eq(dump(dbs.main),snap,'lần '+(i+2)+' không đổi')}
});
suite('M2. CashCount bản cũ (chưa có cột xử lý chênh lệch): thêm cột cuối, giữ nguyên dòng cũ, đọc ra trống; chạy lại không thêm lần nữa',()=>{
  const {ctx,dbs}=makeEnv(SRCP);const extra=ctx.EXTRA_COLS_.CashCount.map(d=>d.split(':')[0]);
  const all=ctx.parseCols_('CashCount').map(c=>c.name),old=all.filter(n=>extra.indexOf(n)<0);ok(extra.length>=6&&old.length+extra.length===all.length,'cột thêm nằm cuối');
  ctx.repoSheet_('Config');const s=ctx.openDb_('MAIN').insertSheet('CashCount');old.forEach((n,i)=>{s.cells['1,'+(i+1)]=n});
  const row={id:'ckk_old',account:'Q1',countDate:'2026-10-15',countedMinor:100,bookMinor:120,status:'CONFIRMED',version:1,isDeleted:0,commitState:'C'};old.forEach((n,i)=>{s.cells['2,'+(i+1)]=row[n]===undefined?'':row[n]});
  const before=JSON.stringify(old.map((n,i)=>s.cells['2,'+(i+1)]));
  eq(JSON.stringify(ctx.ensureSchema()),'[]');all.forEach((n,i)=>eq(s.cells['1,'+(i+1)],n,'tiêu đề cột '+(i+1)));
  eq(JSON.stringify(old.map((n,i)=>s.cells['2,'+(i+1)])),before,'dòng cũ giữ nguyên từng ô');
  ctx.resetMemoDirect_();const r=ctx.repoValid_('CashCount');eq(r.length,1);eq(r[0].id,'ckk_old');eq(r[0].countedMinor,100);eq(r[0].adjustStatus,'');eq(r[0].adjustRateE4,0);
  const snap=dump(dbs.main);ctx.ensureSchema();eq(dump(dbs.main),snap,'chạy lại không đổi');
});
suite('M3. Tiêu đề bị sửa tay: ensureSchema báo SCHEMA_MISMATCH rõ bảng, KHÔNG tự ghi đè; sửa lại tiêu đề thì hết báo',()=>{
  const {ctx,dbs}=makeEnv(SRCP);ctx.ensureSchema();const s=dbs.main.CashTransfer,orig=s.cells['1,3'];
  s.cells['1,3']='cot_sai';ctx.resetMemoDirect_();const p=ctx.ensureSchema();ok(p.length===1&&/CashTransfer/.test(p[0]),'báo đúng bảng: '+JSON.stringify(p));eq(s.cells['1,3'],'cot_sai','không tự sửa tiêu đề');
  s.cells['1,3']=orig;ctx.resetMemoDirect_();eq(JSON.stringify(ctx.ensureSchema()),'[]');
});
suite('M4. Dữ liệu đã có ở bảng mới được giữ nguyên qua ensureSchema (không xóa/ghi đè)',()=>{
  const {ctx,dbs}=makeEnv(SRCP);ctx.ensureSchema();const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
  ctx.repoAppend_('PassLink',[B({id:'pls_1',costAccrualId:'c1',revenueAccrualId:'r1',amountMinor:700})]);ctx.resetMemoDirect_();
  const snap=dump(dbs.main);ctx.ensureSchema();eq(dump(dbs.main),snap);eq(ctx.repoValid_('PassLink').length,1);eq(ctx.repoValid_('PassLink')[0].amountMinor,700);
});
suite('M5. Quay lui: Backend bản cũ (BACKEND_OLD=<đường dẫn Backend R3.3>) vẫn đọc được cơ sở dữ liệu đã nâng schema (cột/bảng mới nằm cuối, bản cũ bỏ qua)',()=>{
  const OLD=process.env.BACKEND_OLD;if(!OLD||!require('fs').existsSync(OLD)){console.log('  (bỏ qua: không đặt BACKEND_OLD — KHÔNG tính là đạt phần quay lui; xem hướng dẫn staging)');return}
  const cur=makeEnv(SRCP);cur.ctx.ensureSchema();const old=makeEnv(OLD);Object.assign(old.dbs.main,cur.dbs.main);Object.assign(old.dbs.aud,cur.dbs.aud);
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);cur.ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'})]);
  old.ctx.resetMemoDirect_();eq(JSON.stringify(old.ctx.schemaProblems_()),'[]','bản cũ không báo lệch schema trên DB mới');
  eq(old.ctx.repoValid_('Config').length,1,'bản cũ đọc được dữ liệu');
});
suite('M6. installTriggers chạy lặp không tạo trùng (đúng 1 bộ/hàm, trigger 10 phút giữ nguyên 1); checkTriggers báo trùng/thiếu và chỉ đọc',()=>{
  const {ctx}=makeEnv(SRCP);let list=[],id=0,created=0;
  const mkT=f=>{const t={f,h:f,getHandlerFunction:()=>f};return t};
  ctx.ScriptApp={getProjectTriggers:()=>list.slice(),deleteTrigger:t=>{list=list.filter(x=>x!==t)},getOAuthToken:()=>'x',newTrigger:f=>{const b={timeBased:()=>b,atHour:()=>b,everyDays:()=>b,everyMinutes:()=>b,inTimezone:()=>b,create:()=>{created++;const t=mkT(f);list.push(t);return t}};return b}};
  const count=f=>list.filter(t=>t.getHandlerFunction()===f).length;
  list.push(mkT('recoverTrigger'),mkT('recoverTrigger'),mkT('unrelatedTrigger'));  // đang trùng + một trigger lạ
  const c0=ctx.checkTriggers();ok(!c0.ok&&c0.problems.some(x=>/Trùng 2/.test(x)),'phát hiện trùng');eq(list.length,3,'checkTriggers chỉ đọc');
  ctx.installTriggers();ctx.installTriggers();ctx.installTriggers();
  ['backupDailyTrigger','recoverTrigger','overdueDigestTrigger','reconcileTrigger','archiveTrigger'].forEach(f=>eq(count(f),1,f));eq(count('unrelatedTrigger'),1,'trigger lạ không bị xóa');eq(ctx.checkTriggers().ok,true);
});
suite('M7. R35: PassLink bản cũ (chưa có cột tỷ giá/chênh lệch) được thêm 3 cột cuối, giữ nguyên dòng cũ; chạy lại không đổi',()=>{
  const {ctx,dbs}=makeEnv(SRCP);const extra=ctx.EXTRA_COLS_.PassLink.map(d=>d.split(':')[0]);eq(extra.join(','),'costRateE4,revRateE4,fxDiffBaseMinor');
  const all=ctx.parseCols_('PassLink').map(c=>c.name),old=all.filter(n=>extra.indexOf(n)<0);
  ctx.repoSheet_('Config');const s=ctx.openDb_('MAIN').insertSheet('PassLink');old.forEach((n,i)=>{s.cells['1,'+(i+1)]=n});
  const row={id:'pls_old',costAccrualId:'c1',revenueAccrualId:'r1',currency:'USD',amountMinor:500,status:'ACTIVE',linkDate:'2026-10-01',version:1,isDeleted:0,commitState:'C'};old.forEach((n,i)=>{s.cells['2,'+(i+1)]=row[n]===undefined?'':row[n]});
  const before=JSON.stringify(old.map((n,i)=>s.cells['2,'+(i+1)]));eq(JSON.stringify(ctx.ensureSchema()),'[]');all.forEach((n,i)=>eq(s.cells['1,'+(i+1)],n));
  eq(JSON.stringify(old.map((n,i)=>s.cells['2,'+(i+1)])),before,'dòng cũ giữ nguyên');ctx.resetMemoDirect_();const r=ctx.repoValid_('PassLink');eq(r.length,1);eq(r[0].amountMinor,500);eq(r[0].fxDiffBaseMinor,0);
  const snap=dump(dbs.main);ctx.ensureSchema();eq(dump(dbs.main),snap);
});
console.log('Tổng kiểm tra:',steps);
