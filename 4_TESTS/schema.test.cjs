// Schema bản mới: bảng FxRate/FxEntry, cột tỷ giá thêm cuối Payment/DebtDoc/Allocation, tiền tố ID, ensureSchema chạy lại an toàn, dữ liệu cũ không đổi, nháp cũ không bị coi là hợp lệ. Engine thật + Sheet giả (KHÔNG phải Google thật).
const assert=require('assert'),path=require('path');
const makeEnv=require('./bench/_env.cjs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)},deq=(a,b,m)=>{steps++;assert.strictEqual(JSON.stringify(a),JSON.stringify(b),m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
suite('1. TABLES_/ID_PREFIX_: mọi bảng có tiền tố ID duy nhất (trừ bảng khóa cố định); bảng mới có mặt',()=>{
  const {ctx}=makeEnv(SRCP),T=ctx.TABLES_,P=ctx.ID_PREFIX_;
  ok(T.FxRate&&T.FxEntry,'có FxRate, FxEntry');eq(P.FxRate,'fxr');eq(P.FxEntry,'fxe');
  const missing=Object.keys(T).filter(t=>!P[t]);ok(!missing.includes('FxRate')&&!missing.includes('FxEntry'),'bảng mới có tiền tố');
  const vals=Object.values(P);eq(new Set(vals).size,vals.length,'tiền tố ID không trùng');
  eq(ctx.tableHome_('FxEntry'),'MAIN');eq(ctx.tableHome_('FxRate'),'MAIN');ok(ctx.CACHED_TABLES_.FxEntry===undefined,'FxEntry/FxRate không vào cache bảng (đọc thẳng nguồn khi ghi nhận)');
  ctx.parseCols_('FxEntry').forEach(c=>ok(c.name&&/^[sin]$/.test(c.type)));
  ['Payment','DebtDoc','Allocation'].forEach(t=>{const cols=ctx.parseCols_(t).map(c=>c.name),ex=ctx.EXTRA_COLS_[t].map(x=>x.split(':')[0]);deq(cols.slice(-ex.length),ex,t+': cột tỷ giá nằm CUỐI, sau cột hệ thống')});
  eq(ctx.SCHEMA_VERSION,'2.7');
});
suite('2. ensureSchema trên cơ sở dữ liệu trống: tạo đủ bảng, tiêu đề khớp, chạy lại không đổi gì',()=>{
  const {ctx,dbs}=makeEnv(SRCP);
  const p1=ctx.ensureSchema();deq(p1,[],'không lệch');
  ['FxRate','FxEntry','Payment','DebtDoc','Allocation'].forEach(t=>{const s=dbs.main[t];ok(s,'có sheet '+t);const cols=ctx.parseCols_(t);deq(cols.map((c,i)=>s.cells['1,'+(i+1)]),cols.map(c=>c.name),'tiêu đề '+t)});
  const snap=JSON.stringify(Object.keys(dbs.main).map(n=>dbs.main[n].cells));const p2=ctx.ensureSchema();deq(p2,[]);eq(JSON.stringify(Object.keys(dbs.main).map(n=>dbs.main[n].cells)),snap,'chạy lại không đổi dữ liệu');
});
suite('3. Nâng cấp từ sheet cũ (chưa có cột tỷ giá): thêm cột cuối, giữ nguyên dữ liệu cũ, đọc được số 0/rỗng',()=>{
  const {ctx,dbs}=makeEnv(SRCP);
  // dựng sheet Payment theo schema CŨ (không có cột tỷ giá) với một dòng dữ liệu
  const all=ctx.TABLES_.Payment.concat(ctx.SYS_COLS_),old=all.map(d=>d.split(':')[0]);
  ctx.repoSheet_('Config');const s=ctx.openDb_('MAIN').insertSheet('Payment');old.forEach((n,i)=>{s.cells['1,'+(i+1)]=n});
  const row={id:'pay_old',payNo:'PT-1',direction:'IN',partnerId:'p1',currency:'USD',amountMinor:5000,effectiveDate:'2026-09-01',status:'POSTED',version:1,isDeleted:0,commitState:'C'};
  old.forEach((n,i)=>{s.cells['2,'+(i+1)]=row[n]===undefined?'':row[n]});
  const before=JSON.stringify(old.map((n,i)=>s.cells['2,'+(i+1)]));
  const added=ctx.ensureSchema();deq(added,[]);
  const cols=ctx.parseCols_('Payment');ok(s.cells['1,'+(cols.length)]==='allocPlanJson'&&s.cells['1,'+(cols.length-1)]==='amountBaseMinor','cột mới ở cuối');
  eq(JSON.stringify(old.map((n,i)=>s.cells['2,'+(i+1)])),before,'dòng cũ giữ nguyên từng ô');
  ctx.resetMemoDirect_();const rows=ctx.repoValid_('Payment');eq(rows.length,1);eq(rows[0].fxRateE4,0);eq(rows[0].amountBaseMinor,0);eq(rows[0].fxSource,'');eq(rows[0].amountMinor,5000);
});
suite('4. Bản nháp bút toán cũ không có thông tin kiểm tra: không tự coi là mới; ghi nhận bắt buộc chữ ký và kiểm tra lại nguồn',()=>{
  const {ctx}=makeEnv(SRCP);
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
  ['Catalog','Partner','DebtDoc','DebtLine','FxRate','FxEntry','Config','Period','Allocation','Payment','SysTx','AuditLog'].forEach(t=>ctx.repoSheet_(t));
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'}),B({id:'fx.entry.grants',value:JSON.stringify({adm:['fx.entry.read','fx.entry.post'],adm2:['fx.entry.post']})})]);
  // nháp "di sản": do bản cũ tạo, số liệu không còn khớp dữ liệu hiện tại
  ctx.repoAppend_('FxEntry',[B({id:'fxe_old',periodId:'2026-10',entryType:'UNREALIZED',currency:'USD',direction:'AR',foreignMinor:100,rateE4:250000000,amountBaseMinor:999,status:'DRAFT',reversesId:'',asOf:'2026-10-31',note:'cũ',createdBy:'x'})]);
  ctx.todayVn_=()=>'2026-11-05';
  const U={id:'adm2',email:'a2@x',role:'ADMIN',scope:{allPartners:true}};
  assert.throws(()=>ctx.dispatch_(U,'fx.entryPost',{requestId:'r1',payload:{periodId:'2026-10'}}),e=>e.code==='VALIDATION_FAILED');steps++;
  const sig=ctx.fxDraftSig_(ctx.repoValid_('FxEntry'));
  assert.throws(()=>ctx.dispatch_(U,'fx.entryPost',{requestId:'r2',payload:{periodId:'2026-10',draftSig:sig}}),e=>e.code==='STALE_DRAFT');steps++;
  eq(ctx.repoValid_('FxEntry')[0].status,'DRAFT','nháp cũ không bị ghi nhận');
});
console.log('Tổng kiểm tra:',steps);
