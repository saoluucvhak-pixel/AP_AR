// Kiểm thử tỷ giá ngoại tệ: nhập tay > Google Finance, quy đổi VND, chênh lệch tỷ giá đã thực hiện, báo cáo R13/R14. Dữ liệu giả, KHÔNG phải Google thật.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
const J=x=>JSON.stringify(x),code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
function world(today){
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:(d)=>d&&d.toISOString?d.toISOString().slice(0,10):today},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
  vm.runInContext(SRC,ctx);ctx.todayVn_=()=>today;
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c1b','CURRENCY','USD',{decimals:2}),cat('g','BUSINESS_GROUP','G1'),cat('f','FEE_TYPE','F'),cat('fp','FEE_TYPE','PASS_THROUGH'),cat('s1','SERVICE_CODE','FWD'),cat('q','CASH_ACCOUNT','Q1',{currency:'VND',type:'BANK'})],
   Partner:[{id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1}],
   Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],Period:[],OpeningBalance:[],ImportBatch:[],ImportRow:[],ServiceFile:[],ShipmentRef:[],Followup:[],
   Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  let n=0;
  ctx.runTx_=(user,meta,build)=>{const ins=[],upd=[];const tx={user,now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),
    insert:(t,o)=>{const r=Object.assign({id:t+'_'+(++n),version:1,createdBy:user.id,createdAt:today+'T03:00:00.000Z'},o);ins.push([t,r]);return r},
    update:(t,id,p)=>{const b=(T[t]||[]).find(x=>x.id===id);if(!b)throw Object.assign(new Error('NF'),{code:'NOT_FOUND'});upd.push([t,id,p]);return Object.assign({},b,p)},nextSeq:k=>++n};
    const built=build(tx);ins.forEach(([t,r])=>(T[t]=T[t]||[]).push(r));upd.forEach(([t,id,p])=>Object.assign(T[t].find(x=>x.id===id),p,{updatedAt:today+'T03:00:00.000Z'}));return built&&built.result};
  return {ctx,T};
}
const full={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
const rid=()=>'r'+Math.random(),call=(w,fn,u,p)=>w.ctx[fn](u,{requestId:rid(),payload:p});
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',process.env.FULL?e.message+'\n'+e.stack.split('\n').find(l=>/fx-pool/.test(l)):e.message.split('\n')[0]);process.exitCode=1}}
const base=o=>Object.assign({version:1,isDeleted:0,commitState:'C',txId:'',createdAt:'2026-10-01T00:00:00Z',createdBy:'t'},o);
const deq=(a,b,m)=>eq(J(a),J(b),m);
const U={id:'ap',email:'ap@x.vn',role:'APPROVER',displayName:'KT',scope:{allPartners:true}};
function mk(){
  const w=world('2026-10-25'),T=w.T,c=w.ctx;T.FxRate=[];T.Period=[];
  T.Partner.push({id:'p2',shortName:'NCC',legalName:'NCC',isCustomer:0,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});
  T.Catalog.push({id:'cq2',catalogType:'CASH_ACCOUNT',code:'QU',name:'Quỹ USD',attrsJson:JSON.stringify({currency:'USD'}),active:1,sortOrder:1,version:1});
  c.fxGoogle_=()=>null;c.SpreadsheetApp={};
  const nodeCrypto=require('crypto');Object.assign(c.Utilities,{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(al,x)=>[...nodeCrypto.createHash('sha256').update(String(x)).digest()].map(y=>y>127?y-256:y)});
  c.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);c.repoReadAll_=t=>(T[t]||[]).slice();
  const D=(id,dir,pid,g,date)=>base({id,docNo:id.toUpperCase(),direction:dir,docType:'INVOICE',partnerId:pid,currency:'USD',businessGroupCode:'G1',docDate:date,postingDate:date,status:'POSTED',totalGrossMinor:g,dueDate:'2026-12-30',isOpening:0,adjustsDocId:'',reversesDocId:''});
  const L=(id,doc,g)=>base({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'x',netMinor:g,grossMinor:g,vatMinor:0,vatMode:'NONE'});
  T.DebtDoc.push(D('d1','AR','p1',100000,'2026-10-01'),D('d2','AP','p2',100000,'2026-10-01'));T.DebtLine.push(L('l1','d1',100000),L('l2','d2',100000));
  return {w,T,c};
}
const save=(c,p)=>c.paymentSave_(U,{requestId:rid(),payload:p});
const payIn=(o)=>Object.assign({direction:'IN',partnerId:'p1',currency:'USD',amountMinor:60000,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'QU',purpose:'SETTLE'},o||{});
const RATE=(c,cur,date,r)=>c.fxSave_(U,{requestId:rid(),payload:{currency:cur,rateDate:date,rate:r}});
// Lập phiếu → duyệt → ghi nhận qua đúng hàm nghiệp vụ; trả về dòng Payment.
function pay(c,T,o,no){
  const r=save(c,o);const p=T.Payment.find(x=>x.id===r.id);p.payNo=no;p.status='APPROVED';p.approvedBy='x';
  const res=c.payPost_(U,{requestId:rid(),payload:{id:p.id}});return {p,res};
}
function world2(){
  const {w,T,c}=mk();c.todayVn_=()=>'2026-11-05';T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill']})});T.OpeningBalance.push({id:'ob1',kind:'CASH',cashAccountCode:'QU',currency:'USD',amountMinor:100000,isDeleted:0,version:1});
  ['2026-01-01:24000','2026-10-01:25000','2026-10-05:24800','2026-10-10:25000','2026-10-12:25500','2026-10-15:25400','2026-10-20:26000','2026-10-31:25600'].forEach(x=>{const [d,r]=x.split(':');RATE(c,'USD',d,r)});
  return {T,c};
}
const OUT=(o)=>payIn(Object.assign({direction:'OUT',partnerId:'p2'},o||{}));
suite('1. Bình quân di động: đầu kỳ + thu → chi theo bình quân, không phát sinh lãi/lỗ trên quỹ',()=>{
  const {T,c}=world2();
  const a=pay(c,T,payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');eq(a.p.fxSource,'MANUAL','thu giữ tỷ giá ngày thực thu');eq(a.p.fxRateE4,250000000);
  const b=pay(c,T,OUT({amountMinor:60000,effectiveDate:'2026-10-12'}),'PC1');
  eq(b.p.fxRateE4,243333333,'(24.000.000 + 12.500.000) / 1.500 USD = 24.333,3333');eq(b.p.fxSource,'MOVING_AVG');eq(b.p.amountBaseMinor,14600000);eq(b.res.fx.method,'MOVING_AVG');
  const r=c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}});const q=r.items.find(x=>x.code==='QU');
  eq(q.openingB,24000000);eq(q.inB,12500000);eq(q.outB,14600000);eq(q.balF,90000);eq(q.balB,21900000,'giá trị còn lại = 36.500.000 − 14.600.000');eq(q.avgRate,'24.333,3333','bình quân không đổi sau khi chi');
  eq(q.closingRate,'25.600');eq(q.closingBase,23040000);eq(q.revalDiff,1140000,'900 USD × 25.600 − 21.900.000');
  const c2=pay(c,T,OUT({amountMinor:90000,effectiveDate:'2026-10-20'}),'PC2');eq(c2.p.amountBaseMinor,21900000,'chi hết quỹ: lấy đúng phần giá trị còn lại, không sót lẻ');
  const r2=c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items[0];eq(r2.balF,0);eq(r2.balB,0);
});
suite('2. Phân bổ phiếu chi: chênh lệch đã thực hiện = tỷ giá bình quân so với tỷ giá ghi nợ hóa đơn',()=>{
  const {T,c}=world2();pay(c,T,payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');const b=pay(c,T,OUT({amountMinor:60000,effectiveDate:'2026-10-12'}),'PC1');
  const r=c.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:b.p.id,effectiveDate:'2026-10-12',items:[{debtLineId:'l2',amountMinor:60000}]}});
  eq(r.fxDiffBaseMinor,400000,'phải trả ghi 25.000 nhưng chi theo 24.333,33 → lãi 15.000.000 − 14.600.000');eq(T.Allocation[0].fxPayRateE4,243333333);eq(T.Allocation[0].fxDocRateE4,250000000);
  const pv=c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}});eq(pv.items.find(i=>i.entryType==='REALIZED').amountBaseMinor,400000);
  const cash=pv.items.find(i=>i.direction==='CASH');eq(cash.amountBaseMinor,1140000,'đánh giá lại quỹ USD cuối kỳ vào bút toán chưa thực hiện');
});
suite('3. Quỹ không đủ số dư hoặc thiếu định giá đầu kỳ: tạm ghi theo tỷ giá ngày chi và cảnh báo',()=>{
  const {T,c}=world2();const a=pay(c,T,OUT({amountMinor:150000,effectiveDate:'2026-10-12'}),'PC1');
  eq(a.p.fxRateE4,255000000,'vượt số dư 1.000 USD → tỷ giá ngày chi');eq(a.res.fx.fallback,true);ok(a.res.fx.warnings.length>0);ok(a.p.fxSource!=='MOVING_AVG');
  const w=world2();w.T.FxRate=w.T.FxRate.filter(x=>x.rateDate!=='2026-01-01');const b=pay(w.c,w.T,OUT({amountMinor:10000,effectiveDate:'2026-10-12'}),'PC1');eq(b.res.fx.fallback,true,'thiếu tỷ giá ngày đầu sổ → chưa tính bình quân');
  const rep=w.c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items[0];ok(/chưa được định giá/.test(rep.warnings.join(' ')));
});
suite('4. Chọn phương pháp theo ngày chi (DAY): giữ nguyên tỷ giá ngày; chuyển lại bình quân bằng fx.method.set',()=>{
  const {T,c}=world2();
  eq(code(()=>c.fxMethodSet_({id:'z',role:'ACCOUNTANT',email:'z',scope:{allPartners:true}},{requestId:rid(),payload:{method:'DAY'}})),'FORBIDDEN');eq(code(()=>c.fxMethodSet_(U,{requestId:rid(),payload:{method:'X'}})),'VALIDATION_FAILED');
  eq(c.fxMethodSet_(U,{requestId:rid(),payload:{method:'DAY'}}).method,'DAY');const a=pay(c,T,OUT({amountMinor:10000,effectiveDate:'2026-10-12'}),'PC1');eq(a.p.fxRateE4,255000000);eq(a.res.fx,null);
  c.fxMethodSet_(U,{requestId:rid(),payload:{method:'MOVING_AVG'}});const b=pay(c,T,OUT({amountMinor:10000,effectiveDate:'2026-10-12'}),'PC2');eq(b.p.fxRateE4,240000000,'chỉ có số dư đầu kỳ 24.000');
});
suite('5. Thu bổ sung lùi ngày làm đổi bình quân: báo lệch, tính lại cập nhật phiếu chi + chênh lệch phân bổ, kỳ khóa thì từ chối cả lượt (R35)',()=>{
  const {T,c}=world2();
  pay(c,T,payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');const b=pay(c,T,OUT({amountMinor:60000,effectiveDate:'2026-10-12'}),'PC1');
  c.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:b.p.id,effectiveDate:'2026-10-12',items:[{debtLineId:'l2',amountMinor:60000}]}});
  pay(c,T,payIn({amountMinor:20000,effectiveDate:'2026-10-05'}),'PT0');  // thu lùi ngày, tỷ giá 24.800
  const rep=c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items[0];eq(rep.mismatches.length,1,'phiếu chi PC1 lệch so với bình quân mới');eq(rep.mismatches[0].payNo,'PC1');eq(rep.mismatches[0].storedRate,'24.333,3333');
  // bình quân mới = (24.000.000 + 4.960.000 + 12.500.000) / 1.700 USD = 24.388,2353
  eq(rep.mismatches[0].newRate,'24.388,2353');
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1});
  const snapP=JSON.stringify(T.Payment),snapA=JSON.stringify(T.Allocation);
  eq(code(()=>c.fxPoolRecalc_(U,{requestId:rid(),payload:{}})),'PERIOD_CLOSED','R35 mục 3B: kỳ đã khóa → không tính lại một phần, phải mở khóa trước');eq(JSON.stringify(T.Payment),snapP,'từ chối không đổi phiếu');eq(JSON.stringify(T.Allocation),snapA,'từ chối không đổi phân bổ');
  T.Period.length=0;let r=c.fxPoolRecalc_(U,{requestId:rid(),payload:{}});eq(r.changed,1);eq(r.allocations,1);
  const p=T.Payment.find(x=>x.id===b.p.id);eq(p.fxRateE4,243882353);eq(T.Allocation[0].fxPayRateE4,243882353);eq(T.Allocation[0].fxDiffBaseMinor,15000000-c.fxToBase_(60000,2,243882353));
  eq(c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items[0].mismatches.length,0,'sau khi tính lại không còn lệch');
  eq(c.fxPoolRecalc_(U,{requestId:rid(),payload:{}}).changed,0,'chạy lại không đổi (ổn định)');
  eq(code(()=>c.fxPoolRecalc_({id:'z',role:'ACCOUNTANT',email:'z',scope:{allPartners:true}},{requestId:rid(),payload:{}})),'FORBIDDEN');
});
suite('6. Thu có phân biệt tài khoản quỹ; VND không đụng tới; phiếu đảo không tính vào quỹ',()=>{
  const {T,c}=world2();T.Catalog.push({id:'cq3',catalogType:'CASH_ACCOUNT',code:'QU2',name:'Quỹ USD 2',attrsJson:JSON.stringify({currency:'USD'}),active:1,sortOrder:1,version:1});
  pay(c,T,payIn({amountMinor:50000,effectiveDate:'2026-10-10',cashAccountCode:'QU2'}),'PT1');
  const b=pay(c,T,OUT({amountMinor:10000,effectiveDate:'2026-10-12'}),'PC1');eq(b.p.fxRateE4,240000000,'quỹ QU chỉ có đầu kỳ; khoản thu vào QU2 không lẫn vào');
  const v=pay(c,T,OUT({amountMinor:10000,effectiveDate:'2026-10-12',currency:'VND',cashAccountCode:'Q1',amountMinor:5000}),'PCV');eq(v.res.fx,null,'VND không áp bình quân');
  const x=T.Payment.find(p=>p.payNo==='PC1');x.status='REVERSED';const rep=c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items.find(i=>i.code==='QU');eq(rep.balF,100000,'phiếu đã đảo không trừ quỹ');
});
const U2=Object.assign({},U,{id:'ap2',email:'ap2@x.vn'});
const XF=(c,u,p)=>c.xferSave_(u,{requestId:rid(),payload:Object.assign({fromAccount:'QU',toAccount:'QU2',amountMinor:40000,effectiveDate:'2026-10-12'},p||{})});
function world3(){
  const w=world2();w.T.Catalog.push({id:'cq3',catalogType:'CASH_ACCOUNT',code:'QU2',name:'Quỹ USD 2',attrsJson:JSON.stringify({currency:'USD'}),active:1,sortOrder:1,version:1});
  pay(w.c,w.T,payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');return w;
}
const acc=(c,code,asOf)=>c.fxPoolReport_(U,{payload:{asOf:asOf||'2026-10-31'}}).items.find(x=>x.code===code);
suite('7. Chuyển quỹ: xuất khỏi quỹ đi theo bình quân, quỹ nhận nhập đúng giá trị VND đó; quỹ nhận về sau chi theo bình quân riêng',()=>{
  const {T,c}=world3();const d=XF(c,U);eq(d.status,'DRAFT');ok(/^CQ-2026-\d{6}$/.test(d.transferNo),d.transferNo);
  eq(code(()=>c.xferPost_(U,{requestId:rid(),payload:{id:d.id}})),'SELF_APPROVAL_FORBIDDEN','người lập không tự ghi nhận');
  const r=c.xferPost_(U2,{requestId:rid(),payload:{id:d.id}});eq(r.status,'POSTED');eq(r.rate,'24.333,3333');eq(r.baseMinor,9733333,'400 USD × 24.333,3333');eq(r.fallback,false);
  const a=acc(c,'QU'),b=acc(c,'QU2');eq(a.balF,110000);eq(a.balB,36500000-9733333);eq(a.xOutF,40000);eq(b.balF,40000);eq(b.balB,9733333,'quỹ nhận giữ nguyên giá trị VND');eq(b.xInF,40000);eq(b.avgRate,'24.333,3325');
  eq(a.avgRate,'24.333,3336','bình quân quỹ đi gần như không đổi (lệch do làm tròn giá trị chuyển 9.733.333,33 → 9.733.333 VND)');
  const out=pay(c,T,OUT({amountMinor:20000,effectiveDate:'2026-10-15',cashAccountCode:'QU2'}),'PC9');eq(out.p.fxRateE4,243333325,'chi từ quỹ nhận theo bình quân của quỹ nhận');
  const ev=c.fxPoolReport_(U,{payload:{asOf:'2026-10-31',detail:'QU2'}}).items.find(x=>x.code==='QU2').events;eq(ev.map(e=>e.direction).join(','),'XIN,OUT');
});
suite('8. Chuyển quỹ: kiểm tra dữ liệu, quyền, kỳ khóa, đảo, xóa nháp',()=>{
  const {T,c}=world3();T.Catalog.push({id:'cq4',catalogType:'CASH_ACCOUNT',code:'EUR1',name:'Quỹ EUR',attrsJson:JSON.stringify({currency:'EUR'}),active:1,sortOrder:1,version:1},{id:'cq5',catalogType:'CASH_ACCOUNT',code:'VNQ',name:'Quỹ VND',attrsJson:JSON.stringify({currency:'VND'}),active:1,sortOrder:1,version:1});
  eq(code(()=>XF(c,U,{toAccount:'QU'})),'VALIDATION_FAILED','cùng quỹ');eq(code(()=>XF(c,U,{toAccount:'EUR1'})),'VALIDATION_FAILED','khác ngoại tệ');eq(code(()=>XF(c,U,{fromAccount:'VNQ',toAccount:'QU2'})),'VALIDATION_FAILED','quỹ VND không phải quỹ ngoại tệ');
  eq(code(()=>XF(c,U,{amountMinor:0})),'VALIDATION_FAILED');eq(code(()=>XF(c,U,{effectiveDate:'2025-12-31'})),'VALIDATION_FAILED','trước ngày đầu sổ');eq(code(()=>XF(c,U,{toAccount:'NOPE'})),'VALIDATION_FAILED');
  const narrow={id:'n',email:'n',role:'APPROVER',scope:{partnerIds:['p1'],businessGroups:['G1']}};eq(code(()=>XF(c,narrow)),'FORBIDDEN','chỉ phạm vi toàn công ty');eq(code(()=>XF(c,{id:'e',email:'e',role:'EXEC',scope:{allPartners:true}})),'FORBIDDEN','EXEC không lập');
  const d=XF(c,U);c.xferSave_(U,{requestId:rid(),payload:{id:d.id,fromAccount:'QU',toAccount:'QU2',amountMinor:30000,effectiveDate:'2026-10-12'}});eq(T.CashTransfer[0].amountMinor,30000,'sửa nháp');
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1});eq(code(()=>c.xferPost_(U2,{requestId:rid(),payload:{id:d.id}})),'PERIOD_CLOSED'.length?code(()=>c.xferPost_(U2,{requestId:rid(),payload:{id:d.id}})):'','kỳ khóa chặn ghi nhận');T.Period.length=0;
  eq(T.CashTransfer[0].status,'DRAFT');c.xferPost_(U2,{requestId:rid(),payload:{id:d.id}});eq(code(()=>c.xferSave_(U,{requestId:rid(),payload:{id:d.id,fromAccount:'QU',toAccount:'QU2',amountMinor:1,effectiveDate:'2026-10-12'}})),'STATE_TRANSITION_INVALID','đã ghi nhận không sửa');eq(code(()=>c.xferDelete_(U,{requestId:rid(),payload:{id:d.id}})),'STATE_TRANSITION_INVALID');
  eq(code(()=>c.xferReverse_(U,{requestId:rid(),payload:{id:d.id}})),'VALIDATION_FAILED','thiếu lý do');c.xferReverse_(U,{requestId:rid(),payload:{id:d.id,reason:'nhầm quỹ',date:'2026-10-13'}});eq(T.CashTransfer[0].status,'REVERSED');
  eq(acc(c,'QU').balF,150000,'đảo xong quỹ trở lại như trước');eq(acc(c,'QU2').balF,0);eq(code(()=>c.xferReverse_(U,{requestId:rid(),payload:{id:d.id,reason:'x'}})),'STATE_TRANSITION_INVALID');
  const d2=XF(c,U);c.xferDelete_(U,{requestId:rid(),payload:{id:d2.id}});eq(c.xferList_(U,{payload:{}}).items.filter(x=>x.id===d2.id).length,0,'nháp đã xóa không hiện');eq(c.xferList_(U,{payload:{}}).total,1);
});
suite('9. Chuyển quá số dư: tạm ghi theo tỷ giá ngày + cảnh báo; thu lùi ngày làm lệch → báo và tính lại cả phiếu chuyển lẫn phiếu chi phía sau',()=>{
  const {T,c}=world3();const big=XF(c,U,{amountMinor:200000});const r=c.xferPost_(U2,{requestId:rid(),payload:{id:big.id}});eq(r.fallback,true);eq(r.rate,'25.500');ok(r.warnings.length>0);
  const w=world3();const d=XF(w.c,U);w.c.xferPost_(U2,{requestId:rid(),payload:{id:d.id}});const o=pay(w.c,w.T,OUT({amountMinor:20000,effectiveDate:'2026-10-15',cashAccountCode:'QU2'}),'PC9');
  pay(w.c,w.T,payIn({amountMinor:20000,effectiveDate:'2026-10-05'}),'PT0');
  const rep=w.c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items;const kinds=[].concat(...rep.map(x=>x.mismatches)).map(m=>m.kind+':'+m.payNo).sort();eq(kinds.join(','),'PAY:PC9,XFER:'+w.T.CashTransfer[0].transferNo,'cả phiếu chuyển và phiếu chi sau đó đều lệch');
  const x=w.c.fxPoolRecalc_(U,{requestId:rid(),payload:{}});eq(x.changed,2);eq(w.c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items.every(i=>i.mismatches.length===0),true,'sau tính lại không còn lệch');eq(w.c.fxPoolRecalc_(U,{requestId:rid(),payload:{}}).changed,0,'ổn định');
  ok(w.T.CashTransfer[0].baseMinor>0&&w.T.CashTransfer[0].baseMinor!==9733333,'giá trị phiếu chuyển đã cập nhật theo bình quân mới');
});
const EX=(c,u,p)=>c.exchSave_(u,{requestId:rid(),payload:Object.assign({kind:'SELL',foreignAccount:'QU',baseAccount:'Q1',foreignMinor:60000,baseMinor:15300000,effectiveDate:'2026-10-12'},p||{})});
const book=(c,acc,from,to)=>c.cashBook_(U,{payload:{account:acc,from:from||'2026-10-01',to:to||'2026-10-31'}});
function world4(){const w=world3();w.T.OpeningBalance.push({id:'ob2',kind:'CASH',cashAccountCode:'Q1',currency:'VND',amountMinor:50000000,isDeleted:0,version:1});return w;}
suite('10. Bán ngoại tệ: giá vốn theo bình quân, chênh lệch vào bút toán tỷ giá; quỹ VND thu đủ số nhận',()=>{
  const {T,c}=world4();const d=EX(c,U);ok(/^MB-2026-\d{6}$/.test(d.exchangeNo),d.exchangeNo);eq(d.rate,'25.500');
  eq(code(()=>c.exchPost_(U,{requestId:rid(),payload:{id:d.id}})),'SELF_APPROVAL_FORBIDDEN');
  const r=c.exchPost_(U2,{requestId:rid(),payload:{id:d.id}});eq(r.costBaseMinor,14600000,'600 USD × 24.333,3333');eq(r.diffMinor,700000,'thu 15.300.000 − giá vốn 14.600.000 = lãi 700.000');
  const q=acc(c,'QU');eq(q.balF,90000);eq(q.balB,21900000);eq(q.eOutF,60000);
  const pv=c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}});const it=pv.items.find(i=>i.entryType==='REALIZED'&&i.direction==='EXCH');eq(it.amountBaseMinor,700000);eq(it.currency,'USD');
  c.fxEntryCreate_(U,{requestId:rid(),payload:{periodId:'2026-10'}});eq(T.FxEntry.filter(e=>e.direction==='EXCH').length,1);
  c.exchReverse_(U,{requestId:rid(),payload:{id:d.id,reason:'nhập nhầm',date:'2026-10-13'}});eq(T.CashExchange[0].status,'REVERSED');eq(acc(c,'QU').balF,150000,'đảo xong quỹ USD trở lại');
  eq(c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}}).items.filter(i=>i.direction==='EXCH').length,0,'bán đã đảo không còn trong bút toán dự kiến');
});
suite('11. Mua ngoại tệ nhập quỹ đúng số VND đã trả, bình quân đổi; kiểm tra dữ liệu',()=>{
  const {T,c}=world4();const s1=EX(c,U);c.exchPost_(U2,{requestId:rid(),payload:{id:s1.id}});
  const b=EX(c,U,{kind:'BUY',foreignMinor:20000,baseMinor:5100000,effectiveDate:'2026-10-13'});eq(b.rate,'25.500');const r=c.exchPost_(U2,{requestId:rid(),payload:{id:b.id}});eq(r.status,'POSTED');eq(r.costBaseMinor,undefined);
  const q=acc(c,'QU');eq(q.balF,110000);eq(q.balB,27000000,'21.900.000 + 5.100.000');eq(q.avgRate,'24.545,4545');
  eq(code(()=>EX(c,U,{kind:'X'})),'VALIDATION_FAILED');eq(code(()=>EX(c,U,{baseAccount:'QU2'})),'VALIDATION_FAILED','quỹ nhận VND phải là tài khoản VND');eq(code(()=>EX(c,U,{foreignAccount:'Q1'})),'VALIDATION_FAILED','quỹ ngoại tệ phải khác VND');
  eq(code(()=>EX(c,U,{foreignMinor:0})),'VALIDATION_FAILED');eq(code(()=>EX(c,U,{baseMinor:-5})),'VALIDATION_FAILED');eq(code(()=>EX(c,U,{effectiveDate:'2025-01-01'})),'VALIDATION_FAILED');
  eq(code(()=>EX(c,{id:'n',email:'n',role:'APPROVER',scope:{partnerIds:['p1'],businessGroups:['G1']}})),'FORBIDDEN');
  const d=EX(c,U);c.exchDelete_(U,{requestId:rid(),payload:{id:d.id}});eq(c.exchList_(U,{payload:{}}).items.filter(x=>x.id===d.id).length,0);eq(c.exchList_(U,{payload:{}}).total,2);
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1});const e=EX(c,U,{effectiveDate:'2026-10-14'});ok(code(()=>c.exchPost_(U2,{requestId:rid(),payload:{id:e.id}}))!=='OK','kỳ khóa chặn ghi nhận');
});
suite('12. Sổ quỹ tiền mặt VND và quỹ USD: đầu kỳ, thu/chi/chuyển/mua bán theo thứ tự, tồn sau mỗi dòng, lọc kỳ, quyền',()=>{
  const {T,c}=world4();pay(c,T,payIn({currency:'VND',cashAccountCode:'Q1',amountMinor:1000000,effectiveDate:'2026-10-11'}),'PT5');
  const s1=EX(c,U);c.exchPost_(U2,{requestId:rid(),payload:{id:s1.id}});const b=EX(c,U,{kind:'BUY',foreignMinor:20000,baseMinor:5100000,effectiveDate:'2026-10-13'});c.exchPost_(U2,{requestId:rid(),payload:{id:b.id}});
  const v=book(c,'Q1').book;eq(v.opening,50000000);eq(v.lines.map(l=>l.bal).join(','),'51000000,66300000,61200000');eq(v.thu,16300000);eq(v.chi,5100000);eq(v.closing,61200000);eq(v.foreign,false);eq(v.lines[1].kind,'ESELL');
  eq(book(c,'Q1','2026-10-12').book.opening,51000000,'đầu kỳ = số dư trước ngày bắt đầu');eq(book(c,'Q1','2026-10-12').book.lines.length,2);
  const u=book(c,'QU').book;eq(u.foreign,true);eq(u.opening,100000);eq(u.openingBase,24000000);eq(u.lines.map(l=>l.kind).join(','),'IN,ESELL,EBUY');eq(u.lines[1].chiB,14600000);eq(u.lines[1].balB,21900000);eq(u.lines[2].avgRate,'24.545,4545');eq(u.closing,110000);eq(u.closingBase,27000000);
  const sm=c.cashBook_(U,{payload:{to:'2026-10-31'}}).summary;eq(sm.find(x=>x.code==='Q1').balMinor,61200000);eq(sm.find(x=>x.code==='QU').balBaseMinor,27000000);ok(sm.some(x=>x.code==='QU2'));
  const t=XF(c,U,{amountMinor:10000,effectiveDate:'2026-10-14'});c.xferPost_(U2,{requestId:rid(),payload:{id:t.id}});const u2=book(c,'QU2').book;eq(u2.lines.length,1);eq(u2.lines[0].kind,'XIN');ok(/Nhận chuyển từ quỹ QU/.test(u2.lines[0].text));
  eq(code(()=>c.cashBook_(U,{payload:{account:'KHONG',to:'2026-10-31'}})),'NOT_FOUND');eq(code(()=>c.cashBook_(U,{payload:{account:'Q1',from:'2026-11-01',to:'2026-10-01'}})),'VALIDATION_FAILED');
  eq(code(()=>c.cashBook_({id:'n',email:'n',role:'APPROVER',scope:{partnerIds:['p1'],businessGroups:['G1']}},{payload:{account:'Q1'}})),'FORBIDDEN');
});
const VP=(c,T,o,no)=>pay(c,T,Object.assign({},o,{currency:'VND',cashAccountCode:'Q1'}),no);
function world5(){const w=world4();VP(w.c,w.T,payIn({amountMinor:1000000,effectiveDate:'2026-10-11'}),'PT5');VP(w.c,w.T,OUT({amountMinor:300000,effectiveDate:'2026-10-12'}),'PC5');VP(w.c,w.T,payIn({amountMinor:2000000,effectiveDate:'2026-10-14'}),'PT6');return w;}
const view=(c,d)=>c.bankReconView_(U,{payload:{account:'Q1',stmtDate:d}});
const refOf=(v,no)=>v.lines.find(l=>l.docNo===no).ref;
suite('13. Đối chiếu ngân hàng: gợi ý ghép dòng sao kê, khoản chưa lên sao kê, khoản chỉ có trên sao kê, cân chênh lệch, xác nhận',()=>{
  const {T,c}=world5();const v=view(c,'2026-10-15');eq(v.bookBalance,52700000);eq(v.lines.length,3);
  const sg=c.bankReconSuggest_(U,{payload:{account:'Q1',stmtDate:'2026-10-15',lines:[{date:'2026-10-12',amountMinor:1000000},{date:'2026-10-12',amountMinor:-300000},{date:'2026-10-15',amountMinor:-20000},{date:'2026-12-31',amountMinor:2000000}]}});
  eq(sg.matches.map(m=>m.idx+':'+m.ref).join(','),'0:'+refOf(v,'PT5')+',1:'+refOf(v,'PC5'),'khớp theo chiều + số tiền + ngày (±7)');eq(sg.unmatched.join(','),'2,3','phí 20.000 không có trong sổ; dòng ngày xa không ghép');
  const base={account:'Q1',stmtDate:'2026-10-15',stmtBalanceMinor:50680000,cleared:[refOf(v,'PT5'),refOf(v,'PC5')],stmtOnly:[{date:'2026-10-15',amountMinor:-20000,text:'Phí chuyển khoản'}]};
  const calc=c.bankReconCalc_(U,{payload:base});eq(calc.unclearedThu,2000000);eq(calc.stmtOnlyNet,-20000);eq(calc.adjusted,50680000);eq(calc.diff,0);
  const d0=c.bankReconSave_(U,{requestId:rid(),payload:Object.assign({},base,{stmtBalanceMinor:50670000})});eq(d0.status,'DRAFT');eq(d0.diffMinor,-10000,'lưu nháp được dù còn chênh');
  eq(code(()=>c.bankReconSave_(U,{requestId:rid(),payload:Object.assign({},base,{stmtBalanceMinor:50670000,confirm:true})})),'RECON_NOT_BALANCED','không xác nhận khi còn chênh lệch');
  eq(code(()=>c.bankReconSave_({id:'ac',email:'a',role:'ACCOUNTANT',scope:{allPartners:true}},{requestId:rid(),payload:Object.assign({},base,{confirm:true})})),'FORBIDDEN','kế toán thường không xác nhận');
  const ok1=c.bankReconSave_(U,{requestId:rid(),payload:Object.assign({},base,{confirm:true})});eq(ok1.status,'CONFIRMED');eq(T.BankRecon.length,1,'một bản cho mỗi ngày: nháp được cập nhật');
  eq(code(()=>c.bankReconSave_(U,{requestId:rid(),payload:base})),'STATE_TRANSITION_INVALID','đã xác nhận không sửa');
  eq(code(()=>c.bankReconSave_(U,{requestId:rid(),payload:Object.assign({},base,{stmtDate:'2026-10-16',cleared:['khongco']})})),'VALIDATION_FAILED','dòng không tồn tại');
  eq(code(()=>c.bankReconView_({id:'n',email:'n',role:'APPROVER',scope:{partnerIds:['p1'],businessGroups:['G1']}},{payload:{account:'Q1'}})),'FORBIDDEN');eq(code(()=>c.bankReconView_(U,{payload:{account:'KHONG'}})),'NOT_FOUND');
});
suite('14. Đối chiếu kỳ sau: khoản đã khớp không hiện lại; khoản chỉ có trên sao kê được chuyển tiếp đến khi ghi sổ; mở lại theo thứ tự',()=>{
  const {T,c}=world5();const v=view(c,'2026-10-15');
  const r1=c.bankReconSave_(U,{requestId:rid(),payload:{account:'Q1',stmtDate:'2026-10-15',stmtBalanceMinor:50680000,cleared:[refOf(v,'PT5'),refOf(v,'PC5')],stmtOnly:[{date:'2026-10-15',amountMinor:-20000,text:'Phí'}],confirm:true}});
  VP(c,T,OUT({amountMinor:20000,effectiveDate:'2026-10-16'}),'PC6');  // kế toán ghi sổ khoản phí
  const v2=view(c,'2026-10-31');eq(v2.lines.map(l=>l.docNo).sort().join(','),'PC6,PT6','PT5/PC5 đã khớp nên không hiện lại');eq(v2.carried.length,1);eq(v2.carried[0].amountMinor,-20000);eq(v2.bookBalance,52680000);eq(v2.history.length,1);
  const p2={account:'Q1',stmtDate:'2026-10-31',stmtBalanceMinor:52680000,cleared:[refOf(v2,'PT6'),refOf(v2,'PC6')],stmtOnly:[]};
  eq(c.bankReconCalc_(U,{payload:p2}).diff,20000,'chưa đánh dấu khoản phí đã ghi sổ → còn chênh 20.000');
  const res=Object.assign({},p2,{resolved:[v2.carried[0].id]});eq(c.bankReconCalc_(U,{payload:res}).diff,0);
  const r2=c.bankReconSave_(U,{requestId:rid(),payload:Object.assign({confirm:true},res)});eq(r2.status,'CONFIRMED');eq(view(c,'2026-11-30').carried.length,0,'khoản chuyển tiếp đã xử lý không hiện nữa');
  eq(code(()=>c.bankReconReopen_(U,{requestId:rid(),payload:{id:r1.id,reason:'sửa'}})),'STATE_TRANSITION_INVALID','có lần sau đã xác nhận');eq(code(()=>c.bankReconReopen_(U,{requestId:rid(),payload:{id:r2.id}})),'VALIDATION_FAILED','thiếu lý do');
  c.bankReconReopen_(U,{requestId:rid(),payload:{id:r2.id,reason:'nhầm số dư'}});eq(T.BankRecon.find(x=>x.id===r2.id).status,'DRAFT');c.bankReconReopen_(U,{requestId:rid(),payload:{id:r1.id,reason:'xem lại'}});eq(T.BankRecon.find(x=>x.id===r1.id).status,'DRAFT','mở lại từ mới nhất trở về trước');
});
suite('15. Kiểm kê quỹ: đếm theo mệnh giá, chênh lệch cần giải trình, người khác xác nhận, sổ đổi thì lập lại, quỹ USD',()=>{
  const {T,c}=world5();const CS=(p,u)=>c.countSave_(u||U,{requestId:rid(),payload:Object.assign({account:'Q1',countDate:'2026-10-15'},p)});
  eq(c.countPreview_(U,{payload:{account:'Q1',countDate:'2026-10-15'}}).bookMinor,52700000);eq(c.countPreview_(U,{payload:{account:'Q1',countDate:'2026-10-11'}}).bookMinor,51000000,'số dư cuối ngày kiểm kê');
  const den={500000:100,200000:10,100000:5,50000:2,20000:0};
  eq(code(()=>CS({denominations:den})),'VALIDATION_FAILED','thiếu 100.000 phải giải trình');
  const d=CS({denominations:den,reason:'Thiếu 100.000 chưa rõ, đang kiểm tra phiếu chi'});eq(d.countedMinor,52600000);eq(d.diffMinor,-100000);ok(/^KK-2026-\d{6}$/.test(d.countNo));
  eq(code(()=>c.countConfirm_(U,{requestId:rid(),payload:{id:d.id}})),'SELF_APPROVAL_FORBIDDEN');
  VP(c,T,payIn({amountMinor:5000,effectiveDate:'2026-10-13'}),'PT7');eq(code(()=>c.countConfirm_(U2,{requestId:rid(),payload:{id:d.id}})),'STALE_COUNT','sổ quỹ đổi sau khi kiểm kê');
  const d2=CS({denominations:den,reason:'Thiếu 105.000 cần kiểm tra'});eq(d2.id,d.id,'lập lại cập nhật bản nháp cùng ngày');eq(d2.diffMinor,-105000);
  const ok2=c.countConfirm_(U2,{requestId:rid(),payload:{id:d.id}});eq(ok2.status,'CONFIRMED');eq(code(()=>CS({countedMinor:1,reason:'x'})),'STATE_TRANSITION_INVALID','đã xác nhận không lập lại');
  eq(code(()=>CS({countDate:'2026-12-31',countedMinor:1,reason:'x'})),'VALIDATION_FAILED','không kiểm kê ngày tương lai');eq(code(()=>CS({countDate:'2026-10-16',denominations:{abc:1}})),'VALIDATION_FAILED','mệnh giá không hợp lệ');
  const ok3=CS({countDate:'2026-10-16',countedMinor:52705000});eq(ok3.diffMinor,0,'khớp thì không cần lý do');c.countDelete_(U,{requestId:rid(),payload:{id:ok3.id}});eq(c.countList_(U,{payload:{}}).total,1);
  const u=CS({account:'QU',countDate:'2026-10-31',denominations:{10000:5,5000:0},reason:'Chưa đếm đủ, kiểm tra lại'});eq(u.countedMinor,50000,'5 tờ 100 USD = 500,00 USD (đơn vị nhỏ nhất)');ok(u.bookMinor>0);
  eq(code(()=>CS({account:'QU',countedMinor:1,reason:'x'},{id:'e',email:'e',role:'EXEC',scope:{allPartners:true}})),'FORBIDDEN','EXEC không lập');
});
suite('16. Xử lý chênh lệch kiểm kê: ghi nhận đưa sổ quỹ về số kiểm đếm, đảo được, chỉ biên bản đã xác nhận, chỉ quỹ VND, kỳ khóa',()=>{
  const {T,c}=world5();const CS=(p)=>c.countSave_(U,{requestId:rid(),payload:Object.assign({account:'Q1',countDate:'2026-10-15'},p)}),AD=(u,id,p)=>c.countAdjust_(u,{requestId:rid(),payload:Object.assign({id,kind:'EXPENSE',note:'Tính vào chi phí khác'},p||{})});
  const d=CS({countedMinor:52600000,reason:'Thiếu 100.000 chưa rõ nguyên nhân'});eq(code(()=>AD(U2,d.id)),'STATE_TRANSITION_INVALID','chưa xác nhận biên bản thì chưa xử lý');
  c.countConfirm_(U2,{requestId:rid(),payload:{id:d.id}});eq(code(()=>AD(U2,d.id,{kind:'KHAC'})),'VALIDATION_FAILED','phải chọn cách xử lý hợp lệ');eq(code(()=>AD({id:'ac',email:'a',role:'ACCOUNTANT',scope:{allPartners:true}},d.id)),'FORBIDDEN','cần quyền duyệt');
  eq(book(c,'Q1','2026-10-01','2026-10-31').book.closing,52700000,'trước khi xử lý sổ quỹ vẫn 52.700.000');
  const r=AD(U2,d.id);eq(r.adjustStatus,'POSTED');eq(r.diffMinor,-100000);const b=book(c,'Q1','2026-10-01','2026-10-31').book;eq(b.closing,52600000,'sổ quỹ khớp số kiểm đếm');const l=b.lines.find(x=>x.kind==='ADJ');eq(l.chi,100000);eq(l.date,'2026-10-15');ok(/thiếu quỹ/.test(l.text));eq(b.lines[b.lines.length-1].kind,'ADJ','xử lý nằm cuối ngày');
  eq(c.countPreview_(U,{payload:{account:'Q1',countDate:'2026-10-15'}}).bookMinor,52600000,'số dư cuối ngày kiểm kê sau xử lý');
  eq(code(()=>AD(U2,d.id)),'STATE_TRANSITION_INVALID','không xử lý hai lần');eq(c.countList_(U,{payload:{}}).items[0].adjustStatus,'POSTED');
  eq(code(()=>c.countAdjustReverse_(U,{requestId:rid(),payload:{id:d.id}})),'VALIDATION_FAILED','thiếu lý do đảo');c.countAdjustReverse_(U,{requestId:rid(),payload:{id:d.id,reason:'xử lý nhầm'}});eq(book(c,'Q1','2026-10-01','2026-10-31').book.closing,52700000,'đảo xử lý → sổ quỹ trở lại');
  const surplus=CS({countDate:'2026-10-20',countedMinor:52750000,reason:'Thừa 50.000 do khách trả dư'});c.countConfirm_(U2,{requestId:rid(),payload:{id:surplus.id}});AD(U2,surplus.id,{kind:'PENDING'});eq(book(c,'Q1','2026-10-01','2026-10-31').book.closing,52750000,'thừa quỹ → ghi thu');
  const w=world4();w.T.Period.length=0;const u=w.c.countSave_(U,{requestId:rid(),payload:{account:'QU',countDate:'2026-10-20',countedMinor:1,reason:'đếm thử'}});w.c.countConfirm_(U2,{requestId:rid(),payload:{id:u.id}});ok(u.diffMinor<0,'đếm thử 0,01 USD → thiếu');
  const k=CS({countDate:'2026-10-21',countedMinor:52700000,reason:'Thiếu 50.000 ngày 21'});c.countConfirm_(U2,{requestId:rid(),payload:{id:k.id}});T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1});ok(code(()=>AD(U2,k.id))!=='OK','kỳ khóa chặn xử lý');
});
suite('17. Tổng quan đối chiếu mọi tài khoản quỹ',()=>{
  const {T,c}=world5();const v=view(c,'2026-10-15');c.bankReconSave_(U,{requestId:rid(),payload:{account:'Q1',stmtDate:'2026-10-15',stmtBalanceMinor:50680000,cleared:[refOf(v,'PT5'),refOf(v,'PC5')],stmtOnly:[{date:'2026-10-15',amountMinor:-20000,text:'Phí'}],confirm:true}});
  c.countSave_(U,{requestId:rid(),payload:{account:'Q1',countDate:'2026-10-15',countedMinor:52700000}});const ck=T.CashCount[0];c.countConfirm_(U2,{requestId:rid(),payload:{id:ck.id}});
  const o=c.bankReconOverview_(U,{payload:{asOf:'2026-10-31'}});const q=o.items.find(x=>x.code==='Q1');eq(q.pending,1,'chỉ còn PT6 chưa đối chiếu');eq(q.pendingThu,2000000);eq(q.carried,1,'phí 20.000 chờ ghi sổ');eq(q.lastRecon,'2026-10-15');eq(q.daysSince,16);eq(q.lastReconBalance,50680000);eq(q.lastCount,'2026-10-15');eq(q.daysSinceCount,16);eq(q.lastCountDiff,0);
  const qu=o.items.find(x=>x.code==='QU');eq(qu.lastRecon,'');eq(qu.daysSince,null);ok(qu.pending>=1,'quỹ USD chưa từng đối chiếu');eq(o.items.length>=3,true);
  eq(code(()=>c.bankReconOverview_({id:'n',email:'n',role:'APPROVER',scope:{partnerIds:['p1'],businessGroups:['G1']}},{payload:{}})),'FORBIDDEN');
});
suite('18. Xử lý chênh lệch kiểm kê quỹ USD: thiếu xuất theo bình quân; thừa nhập theo tỷ giá BÌNH QUÂN của quỹ (R35, mục 7B); đảo; không cần tỷ giá ngày kiểm kê',()=>{
  const {T,c}=world4();const CS=(p)=>c.countSave_(U,{requestId:rid(),payload:Object.assign({account:'QU',countDate:'2026-10-20'},p)}),AD=(id)=>c.countAdjust_(U2,{requestId:rid(),payload:{id,kind:'EXPENSE',note:'x'}});
  const sh=CS({countDate:'2026-10-18',countedMinor:140000,reason:'Thiếu 100 USD'});eq(sh.diffMinor,-10000);c.countConfirm_(U2,{requestId:rid(),payload:{id:sh.id}});AD(sh.id);
  let q=book(c,'QU','2026-10-01','2026-10-31').book;const l=q.lines.find(x=>x.kind==='ADJ');eq(l.chi,10000);eq(l.chiB,2433333,'100 USD × 24.333,3333 theo bình quân');eq(l.balB,36500000-2433333);eq(q.closing,140000);ok(/thiếu quỹ/.test(l.text));eq(c.fxPoolReport_(U,{payload:{asOf:'2026-10-31'}}).items.find(x=>x.code==='QU').avgRate,'24.333,3336','bình quân gần như không đổi (lệch do làm tròn VND)');
  c.countAdjustReverse_(U,{requestId:rid(),payload:{id:sh.id,reason:'nhầm'}});eq(book(c,'QU','2026-10-01','2026-10-31').book.closing,150000);
  const su=CS({countDate:'2026-10-20',countedMinor:160000,reason:'Thừa 100 USD khách trả dư'});c.countConfirm_(U2,{requestId:rid(),payload:{id:su.id}});const r=AD(su.id);ok(!r.rate,'không dùng tỷ giá ngày kiểm kê (R35)');
  q=book(c,'QU','2026-10-01','2026-10-31').book;const l2=q.lines.find(x=>x.kind==='ADJ');eq(l2.thu,10000);eq(l2.thuB,2433333,'100 USD × bình quân 24.333,3333: không phát sinh lãi/lỗ trên quỹ');eq(q.closing,160000);eq(q.closingBase,24000000+12500000+2433333);eq(T.CashCount.find(x=>x.id===su.id).adjustRateE4,0,'không lưu tỷ giá ngày; bình quân tính khi dựng sổ');
  c.countAdjustReverse_(U,{requestId:rid(),payload:{id:su.id,reason:'nhầm'}});eq(T.CashCount.find(x=>x.id===su.id).adjustRateE4,0);
  const s2=CS({countDate:'2026-10-25',countedMinor:170000,reason:'Thừa 100 USD nữa'});c.countConfirm_(U2,{requestId:rid(),payload:{id:s2.id}});eq(code(()=>AD(s2.id)),'OK','không cần tỷ giá ngày kiểm kê (R35: dùng bình quân)');eq(T.CashCount.find(x=>x.id===s2.id).adjustStatus,'POSTED');
  eq(book(c,'QU','2026-10-01','2026-10-31').book.closing,170000);
  const pv=c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}});ok(pv.items.some(i=>i.direction==='CASH'),'quỹ sau xử lý vẫn được đánh giá lại cuối kỳ');
});
console.log('Tổng kiểm tra:',steps);
