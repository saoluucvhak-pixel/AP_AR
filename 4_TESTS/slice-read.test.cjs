// Đọc theo cột (repoSliceValid_) cho liên kết PO: kết quả giống hệt đọc cả bảng, đúng điều kiện hợp lệ, không dùng dữ liệu cũ sau khi ghi. Engine thật + Sheet giả (KHÔNG phải Apps Script thật).
const assert=require('assert'),path=require('path');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
const makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)},deq=(a,b,m)=>{steps++;assert.deepStrictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
function env(N){const e=makeEnv(SRCP);const {ctx,S}=e;ctx.repoSliceValid_?0:0;seed(ctx,N||300);ctx.todayVn_=()=>'2026-10-25';return e}
const ADM={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},LIM={id:'u2',email:'l@x.vn',role:'APPROVER',scope:{partnerIds:['p3','p6','p9'],businessGroups:['G1']}};
const q=(ctx,u,p)=>ctx.dispatch_(u,'doc.list',{requestId:'r'+Math.random(),payload:Object.assign({direction:'AR',asOf:'2026-10-25',pageSize:25,page:1},p||{})});
const FULLREAD=ctx=>{ctx.repoSliceValid_=function(t){return ctx.repoValid_(t)}};
suite('1. Kết quả đọc theo cột giống hệt đọc cả bảng (trang, tìm PO, lọc orderId, noOrder, người hẹp quyền, tổng bản ghi)',()=>{
  const cases=[{},{q:'PO12'},{q:'NCC-3'},{adv:{sel:{orderId:['o12']}}},{adv:{flag:{noOrder:true}}},{page:3,pageSize:10},{sort:'totalGrossMinor',dir:'asc'}];
  for(const dir of ['AR','AP'])for(const u of [ADM,LIM]){
    const a=env(300),b=env(300);FULLREAD(b.ctx);
    for(const p of cases){const x=q(a.ctx,u,Object.assign({direction:dir},p)),y=q(b.ctx,u,Object.assign({direction:dir},p));deq(JSON.parse(JSON.stringify(x)),JSON.parse(JSON.stringify(y)),dir+' '+u.id+' '+JSON.stringify(p));}
  }
});
suite('2. Đọc theo cột thực sự đọc ít ô hơn so với đọc cả bảng (cùng dữ liệu)',()=>{
  const a=env(300),b=env(300);FULLREAD(b.ctx);
  const cells=(e)=>{e.ctx.resetMemoDirect_();e.S.cells=0;e.S.getValues=0;q(e.ctx,ADM,{q:'PO12'});return {cells:e.S.cells,reads:e.S.getValues}};
  const sa=cells(a),sb=cells(b);ok(sa.cells<sb.cells,'ô đọc theo cột '+sa.cells+' < cả bảng '+sb.cells);ok(sa.reads<=sb.reads+8,'số lần đọc tăng có giới hạn: '+sa.reads+' vs '+sb.reads);
});
suite('3. Điều kiện hợp lệ như repoValid_: bỏ dòng đã xóa mềm, bỏ dòng chưa commit; dòng "P" của giao dịch đã COMMITTED vẫn hiện',()=>{
  const {ctx}=env(60);
  const before=ctx.repoSliceValid_('Order',['id','orderNo']).length;
  ctx.repoAppend_('Order',[{id:'ox1',orderNo:'X1',poNo:'',customerPartnerId:'p0',businessGroupCode:'G1',currency:'VND',status:'OPEN',servicesJson:'[]',version:1,isDeleted:1,commitState:'C'},{id:'ox2',orderNo:'X2',poNo:'',customerPartnerId:'p0',businessGroupCode:'G1',currency:'VND',status:'OPEN',servicesJson:'[]',version:1,isDeleted:0,commitState:'P',txId:'tNO'},{id:'ox3',orderNo:'X3',poNo:'',customerPartnerId:'p0',businessGroupCode:'G1',currency:'VND',status:'OPEN',servicesJson:'[]',version:1,isDeleted:0,commitState:'P',txId:'tYES'}]);
  ctx.setOpenTx_('tYES','COMMITTED');ctx.setOpenTx_('tNO','PENDING');
  const ids=ctx.repoSliceValid_('Order',['id','orderNo']).map(o=>o.id),full=ctx.repoValid_('Order').map(o=>o.id);
  ok(ids.includes('ox3')&&!ids.includes('ox1')&&!ids.includes('ox2'),'điều kiện hợp lệ: '+ids.slice(-3));deq(ids,full,'cùng tập với repoValid_');eq(ids.length,before+1);
});
suite('4. Sau khi ghi, đọc theo cột không trả dữ liệu cũ (memo bị xóa)',()=>{
  const {ctx}=env(60);const n0=ctx.repoSliceValid_('Accrual',['id','orderId','poRef']).length;
  ctx.repoAppend_('Accrual',[{id:'acNEW',orderId:'o1',kind:'COST',partnerId:'p0',poRef:'NEW-PO',accrualDate:'2026-10-01',feeTypeCode:'F',description:'x',netMinor:1,vatMode:'NONE',vatMinor:0,grossMinor:1,currency:'VND',status:'OPEN',version:1,isDeleted:0,commitState:'C'}]);
  const a=ctx.repoSliceValid_('Accrual',['id','orderId','poRef']);eq(a.length,n0+1);eq(a.find(x=>x.id==='acNEW').poRef,'NEW-PO');
});
suite('5. Bảng đang nằm trong cache bảng: dùng cache, không đọc Sheet; cache lỗi/thiếu chunk: đọc lại Sheet đúng',()=>{
  const e=env(60),{ctx,S}=e;ctx.resetMemoDirect_();
  const rows=ctx.repoValid_('Order');ctx.resetMemoDirect_();ctx.MEMO_.cacheOk=true;
  ctx.cacheLoad_=function(t){return t==='Order'?{gen:'g',rows:rows.map(r=>Object.assign({},r))}:{gen:'g',rows:null}};
  S.cells=0;const got=ctx.repoSliceValid_('Order',['id','orderNo']);eq(S.cells,0,'cache trúng: 0 ô đọc');eq(got.length,rows.length);
  ctx.resetMemoDirect_();ctx.MEMO_.cacheOk=true;ctx.cacheLoad_=function(t){return {gen:'g',rows:null}};S.cells=0;
  const got2=ctx.repoSliceValid_('Order',['id','orderNo']);ok(S.cells>0,'cache thiếu: đọc Sheet');eq(got2.length,rows.length);
});
suite('6. Cột không có trong schema → quay về đọc cả bảng (an toàn)',()=>{
  const {ctx}=env(30);const r=ctx.repoSliceValid_('Order',['id','khongCoCot']);ok(r.length>0&&r[0].orderNo!==undefined,'trả bản ghi đầy đủ qua repoValid_');
});
console.log('Tổng kiểm tra:',steps);
