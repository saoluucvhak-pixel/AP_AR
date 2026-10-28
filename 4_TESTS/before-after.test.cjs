// So sánh TRƯỚC/SAU trên cùng fixture (có PO thật): số dư, phân bổ, tổng và báo cáo giữ nguyên; chỉ trường liên kết PO thay đổi theo quy tắc đã sửa. Bản "trước" = Backend của congno_deploy_v12_FIXED.zip (baseline/Backend_v12_FIXED_goc.gs). Engine thật + Sheet giả.
const assert=require('assert'),path=require('path'),fs=require('fs');
const makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const NEW=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),OLD=process.env.BASELINE_BACKEND||path.join(__dirname,'baseline','Backend_v12_FIXED_goc.gs');
let steps=0;const eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
if(!fs.existsSync(OLD)){console.log('⚠ BỊ CHẶN: không có Backend gốc để so sánh ('+OLD+')');process.exit(0)}
const U={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},LIM={id:'u2',email:'l@x.vn',displayName:'L',role:'APPROVER',scope:{partnerIds:['p3','p6','p9','p12'],businessGroups:['G1']}};
const mk=src=>{const e=makeEnv(src);seed(e.ctx,600);e.ctx.todayVn_=()=>'2026-10-25';return e.ctx};
const J=x=>JSON.stringify(x);
function ledgerView(ctx,u,dir){
  const out=ctx.dispatch_(u,'doc.list',{requestId:'r'+Math.random(),payload:{direction:dir,asOf:'2026-10-25',pageSize:500,page:1}});
  return {total:out.total,totals:out.totalsByCurrency,rows:out.items.map(x=>[x.id,x.docNo,x.partnerId,x.currency,x.status,x.totalGrossMinor,x.allocatedMinor,x.outstandingMinor,x.payStatus,x.aging,x.dueDate])};
}
const A=mk(OLD),B=mk(NEW);
suite('1. Danh sách công nợ AR/AP: số dư, phân bổ, tổng theo tiền tệ giống hệt (người đủ quyền và người hẹp quyền)',()=>{
  for(const dir of ['AR','AP'])for(const u of [U,LIM]){const a=ledgerView(A,u,dir),b=ledgerView(B,u,dir);eq(a.total,b.total,'tổng bản ghi '+dir+' '+u.id);eq(J(a.totals),J(b.totals),'tổng tiền '+dir);eq(J(a.rows),J(b.rows),'từng chứng từ '+dir+' '+u.id)}
});
suite('2. Báo cáo R01/R02/R03/R07/R12 và bàn làm việc giống hệt',()=>{
  // R36: R02/R03 có thêm dòng tiền chưa phân bổ (ứng trước), dòng "gồm ứng trước" và một chú thích — thay đổi có chủ đích (kiểm ở r36-advance.test.cjs); bỏ riêng các dòng đó rồi so phần còn lại giống hệt bản gốc.
  const R36_ROW=/ứng trước|trả trước/,R36_NOTE=/^Từng dòng chứng từ chỉ hiện phần đã phân bổ/;
  const strip=r=>J({rows:r.rows.filter(x=>!R36_ROW.test(x.cells.desc||'')).map(x=>[x.t,x.currency,x.cells]),notes:r.notes.filter(n=>!R36_NOTE.test(n))});
  for(const code of ['R01','R02','R03','R07','R12']){const p={asOf:'2026-10-25'};const a=A.reportRun_(U,{payload:{code,params:p}}),b=B.reportRun_(U,{payload:{code,params:p}});eq(strip(a),strip(b),code)}
  const w=ctx=>J(ctx.dispatch_(U,'workbench.summary',{requestId:'w',payload:{asOf:'2026-10-25'}})).replace(/"(builtAt|setId|lastOkAt|lastAttemptAt|generatedAt)":"[^"]*"/g,'"$1":"-"');eq(w(A),w(B),'workbench');
  const d=ctx=>J(ctx.dispatch_(U,'dashboard.summary',{requestId:'d',payload:{asOf:'2026-10-25'}})).replace(/"(builtAt|setId|lastOkAt|lastAttemptAt|generatedAt)":"[^"]*"/g,'"$1":"-"');eq(d(A),d(B),'dashboard');
});
suite('3. Phiếu thu/chi và phân bổ không đổi',()=>{
  const p=ctx=>J(ctx.dispatch_(U,'payment.list',{requestId:'p',payload:{asOf:'2026-10-25',pageSize:200}}));eq(p(A),p(B),'payment.list');
});
suite('4. Liên kết PO (hiển thị, đếm, ordersRestricted, tìm, lọc) giống hệt bản FIXED: đợt này chỉ đổi cách đọc dữ liệu (theo cột), không đổi kết quả',()=>{
  const view=(ctx,u,p)=>{const o=ctx.dispatch_(u,'doc.list',{requestId:'z'+Math.random(),payload:Object.assign({direction:'AR',asOf:'2026-10-25',pageSize:500},p)});return J({t:o.total,i:o.items.map(x=>[x.id,x.orders,x.orderCount,x.poRefs,!!x.ordersRestricted])})};
  for(const u of [U,LIM])for(const dir of ['AR','AP'])for(const p of [{},{q:'PO12'},{q:'NCC-3'},{adv:{sel:{orderId:['o12','o40']}}},{adv:{flag:{noOrder:true}}}])eq(view(A,u,Object.assign({direction:dir},p)),view(B,u,Object.assign({direction:dir},p)),u.id+' '+dir+' '+J(p));
  const adj=B.dispatch_(U,'doc.list',{requestId:'a',payload:{direction:'AR',asOf:'2026-10-25',pageSize:500}}).items.filter(x=>x.docType==='ADJ_INC');eq(adj.length>0&&adj.every(x=>x.orderCount>0),true,'điều chỉnh vẫn kế thừa PO dòng gốc');
});
console.log('Tổng kiểm tra:',steps);
