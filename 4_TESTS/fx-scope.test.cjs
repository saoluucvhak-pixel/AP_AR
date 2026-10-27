// Phạm vi & quyền bút toán chênh lệch tỷ giá (prompt lần 2 mục 1-2): toàn công ty, quyền riêng, trạng thái cũ, đảo kỳ trước. Dữ liệu giả, KHÔNG phải Google thật.
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
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',process.env.FULL?e.message+'\n'+e.stack.split('\n').slice(0,4).join('\n'):e.message.split('\n')[0]);process.exitCode=1}}
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
function posted(T,c,dir,rateDoc,ratePay){
  c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-01',rate:rateDoc}});c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:ratePay}});
  save(c,dir==='IN'?payIn():payIn({direction:'OUT',partnerId:'p2'}));const p=T.Payment[T.Payment.length-1];p.status='POSTED';p.payNo='X'+p.id;return p;
}

const ALLP=['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill'];
const mkU=(id,role,scope)=>({id,email:id+'@x.vn',role,displayName:id,scope});
const WIDE={allPartners:true};
const FULL=mkU('ap','APPROVER',WIDE),CRT=mkU('crt','ACCOUNTANT',WIDE),PST=mkU('pst','APPROVER',WIDE),ADM=mkU('adm','ADMIN',WIDE),NARROW=mkU('nar','ACCOUNTANT',{partnerIds:['p2'],businessGroups:['G1']}),GRP=mkU('grp','APPROVER',{allPartners:true,businessGroups:['G1']}),RO=mkU('ro','APPROVER',WIDE);
function setup(){
  const m=mk();const {T,c}=m;
  T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:ALLP,crt:['fx.entry.read','fx.entry.write'],pst:['fx.entry.read','fx.entry.post','fx.entry.reverse'],nar:ALLP,grp:ALLP})});
  c.fxSave_(FULL,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-01',rate:'25000'}});
  c.todayVn_=()=>'2026-11-05';
  c.fxSave_(FULL,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-31',rate:'26000'}});
  return m;
}
const snap=T=>JSON.stringify({e:T.FxEntry,d:T.DebtDoc,c:T.Config,r:T.FxRate,a:T.Allocation,p:T.Payment});
const live=T=>T.FxEntry.filter(e=>e.isDeleted!==1);
const create=(c,u,per,extra)=>c.fxEntryCreate_(u,Object.assign({requestId:rid(),payload:{periodId:per||'2026-10'}},extra||{}));
const prev=(c,u,per)=>c.fxEntryPreview_(u,{payload:{periodId:per||'2026-10'}});
const post=(c,u,per,sig)=>c.fxEntryPost_(u,{requestId:rid(),payload:{periodId:per||'2026-10',draftSig:sig}});
suite('1. KỊCH BẢN LỖI: người chỉ có quyền p2/G1 không được thay thế bút toán nháp toàn kỳ, bản nháp AR/AP cũ giữ nguyên',()=>{
  const {T,c}=setup();
  create(c,CRT);const before=live(T);eq(before.length,2,'AR và AP đều có nháp đánh giá lại');deq(before.map(e=>e.direction).sort(),['AP','AR']);
  const s0=snap(T);
  eq(code(()=>create(c,NARROW)),'FORBIDDEN','người hẹp quyền (kể cả được cấp quyền trong cấu hình) bị từ chối');
  eq(snap(T),s0,'không có thay đổi dữ liệu nào sau lần từ chối');deq(live(T).map(e=>[e.id,e.version,e.amountBaseMinor,e.status]),before.map(e=>[e.id,e.version,e.amountBaseMinor,e.status]));
  const ar=live(T).find(e=>e.direction==='AR'),ap=live(T).find(e=>e.direction==='AP');eq(ar.amountBaseMinor,100000*0+(c.fxToBase_(100000,2,260000000)-c.fxToBase_(100000,2,250000000)),'AR 1.000 USD tăng giá → lãi');eq(ap.amountBaseMinor,-ar.amountBaseMinor,'AP đối xứng → lỗ');
});
suite('2. Mọi API bút toán từ chối người ngoài quyền TRƯỚC khi tính/ghi, không đổi dữ liệu (hẹp quyền, giới hạn nhóm, chỉ read, kế toán mặc định)',()=>{
  const {T,c}=setup();create(c,CRT);const sig=prev(c,FULL).draftSig,first=live(T)[0],s0=snap(T);
  const calls={
    preview:u=>prev(c,u),list:u=>c.fxEntryList_(u,{payload:{periodId:'2026-10'}}),create:u=>create(c,u),post:u=>post(c,u,'2026-10',sig),
    reverse:u=>c.fxEntryReverse_(u,{requestId:rid(),payload:{id:first.id,ifVersion:first.version,reason:'x'}}),backfill:u=>c.fxBackfill_(u,{requestId:rid(),payload:{}})};
  const users={'hẹp quyền p2/G1 (đã cấp quyền cấu hình)':NARROW,'allPartners nhưng giới hạn nhóm G1 (đã cấp quyền)':GRP,'APPROVER chỉ read (chưa cấp)':RO,'ACCOUNTANT mặc định':mkU('acc','ACCOUNTANT',WIDE),'EXEC':mkU('ex','EXEC',WIDE),'AUDITOR':mkU('au','AUDITOR',WIDE)};
  Object.keys(users).forEach(un=>Object.keys(calls).forEach(k=>{eq(code(()=>calls[k](users[un])),'FORBIDDEN',un+' / '+k)}));
  eq(snap(T),s0,'toàn bộ dữ liệu không đổi sau các lần từ chối');
  eq(code(()=>c.fxList_(NARROW,{payload:{}})),'OK','tra tỷ giá thông thường vẫn dùng được');
  eq(code(()=>c.fxSave_(mkU('acc','ACCOUNTANT',{partnerIds:['p2']}),{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-02',rate:'25100'}})),'OK','nhập tỷ giá thông thường theo chính sách riêng (fx.write), không bị đóng');
});
suite('3. Người được cấp đủ quyền: ADMIN mặc định, người lập, người ghi nhận, người đảo; AR/AP và REALIZED cùng một tập toàn công ty',()=>{
  const {T,c}=setup();
  const p=posted(T,c,'IN','25000','25500');c.paymentAllocate_(FULL,{requestId:rid(),payload:{paymentId:p.id,effectiveDate:'2026-10-26',items:[{debtLineId:'l1',amountMinor:60000}]}});
  const pv=prev(c,ADM);const types=pv.items.map(i=>i.entryType+':'+(i.direction||'-')).sort();deq(types,['REALIZED:-','UNREALIZED:AP','UNREALIZED:AR','UNREALIZED:CASH'],'ADMIN mặc định xem được cả ba loại');
  eq(pv.items.find(i=>i.entryType==='REALIZED').amountBaseMinor,300000);
  const sameAsNarrowCannot=code(()=>prev(c,NARROW));eq(sameAsNarrowCannot,'FORBIDDEN');
  create(c,ADM);const sig=prev(c,PST).draftSig;eq(post(c,PST,'2026-10',sig).posted,4,'người ghi nhận khác người lập');
  const e=T.FxEntry.find(x=>x.entryType==='UNREALIZED'&&x.direction==='AR');eq(c.fxEntryReverse_(PST,{requestId:rid(),payload:{id:e.id,ifVersion:e.version,reason:'sai'}}).id.length>0,true,'người đảo');
  eq(code(()=>c.fxEntryReverse_(PST,{requestId:rid(),payload:{id:T.FxEntry[0].id,reason:'x'}})),'VALIDATION_FAILED','đảo bắt buộc kèm phiên bản');
});
suite('4. Hai người tạo cùng kỳ không trùng, cùng requestId lặp an toàn, kỳ đã có POSTED giữ nguyên bản đã ghi',()=>{
  const {T,c}=setup();
  create(c,CRT);const n1=live(T).length;create(c,ADM);eq(live(T).filter(e=>e.status==='DRAFT').length,n1,'người thứ hai thay nháp, không nhân đôi');
  eq(T.FxEntry.filter(e=>e.status==='CANCELLED'&&e.isDeleted===1).length,n1,'nháp cũ bị hủy mềm, không xóa cứng');
  const sig=prev(c,PST).draftSig;post(c,PST,'2026-10',sig);const posted0=JSON.stringify(T.FxEntry.filter(e=>e.status==='POSTED'));
  create(c,CRT);eq(JSON.stringify(T.FxEntry.filter(e=>e.status==='POSTED')),posted0,'POSTED không bị xóa/ghi lại khi tạo lại');
  eq(live(T).filter(e=>e.status==='DRAFT').length,0,'đã ghi nhận hết, không tạo thêm bản trùng');
});
suite('5. Nháp cũ: đổi tỷ giá / phân bổ / nháp sau lúc lập thì ghi nhận bị từ chối, phải lập lại',()=>{
  const {T,c}=setup();create(c,CRT);const sig=prev(c,PST).draftSig;
  c.fxSave_(FULL,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-31',rate:'26500'}});
  eq(code(()=>post(c,PST,'2026-10',sig)),'STALE_DRAFT','đổi tỷ giá cuối kỳ');eq(T.FxEntry.filter(e=>e.status==='POSTED').length,0,'không ghi nhận âm thầm số cũ');
  create(c,CRT);const sig2=prev(c,PST).draftSig;ok(sig2!==sig,'chữ ký đổi sau khi lập lại');eq(code(()=>post(c,PST,'2026-10',sig)),'STALE_DRAFT','chữ ký cũ không dùng được');
  const p=posted(T,c,'IN','25000','25500');c.paymentAllocate_(FULL,{requestId:rid(),payload:{paymentId:p.id,effectiveDate:'2026-10-26',items:[{debtLineId:'l1',amountMinor:10000}]}});
  eq(code(()=>post(c,PST,'2026-10',sig2)),'STALE_DRAFT','có phân bổ mới sau lúc lập');
  create(c,CRT);const sig3=prev(c,PST).draftSig;eq(post(c,PST,'2026-10',sig3).posted>0,true,'lập lại rồi ghi nhận được');
  eq(code(()=>c.fxEntryPost_(PST,{requestId:rid(),payload:{periodId:'2026-10'}})),'VALIDATION_FAILED','thiếu chữ ký');
});
suite('6. Người lập tự ghi nhận bị chặn; kỳ khóa chặn ghi nhận và đảo',()=>{
  const {T,c}=setup();create(c,ADM);const sig=prev(c,ADM).draftSig;
  eq(code(()=>post(c,ADM,'2026-10',sig)),'SELF_APPROVAL_FORBIDDEN');
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1,isDeleted:0});
  eq(code(()=>post(c,PST,'2026-10',sig)),'PERIOD_CLOSED','kỳ khóa chặn ghi nhận');eq(live(T).every(e=>e.status==='DRAFT'),true,'nháp giữ nguyên sau khi bị từ chối');
  T.Period.length=0;eq(post(c,PST,'2026-10',sig).posted,2);const e=T.FxEntry.find(x=>x.status==='POSTED');
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1,isDeleted:0});
  eq(code(()=>c.fxEntryReverse_(PST,{requestId:rid(),payload:{id:e.id,ifVersion:e.version,reason:'x'}})),'PERIOD_CLOSED','kỳ khóa chặn đảo');eq(e.status,'POSTED');
});
suite('7. Đảo kỳ trước: nháp đã hủy không chặn, nháp còn hiệu lực không tạo trùng, phần đảo không mất khi tạo lại',()=>{
  const {T,c}=setup();create(c,CRT);post(c,PST,'2026-10',prev(c,PST).draftSig);
  c.todayVn_=()=>'2026-12-05';c.fxSave_(FULL,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-11-30',rate:'26000'}});
  const rv=pv=>pv.items.filter(i=>i.entryType==='UNREALIZED_REVERSAL');
  eq(rv(prev(c,PST,'2026-11')).length,2,'tháng 11 có 2 dòng đảo kỳ 10');
  create(c,CRT,'2026-11');const d1=T.FxEntry.filter(e=>e.periodId==='2026-11'&&e.entryType==='UNREALIZED_REVERSAL'&&e.isDeleted!==1);eq(d1.length,2);
  create(c,ADM,'2026-11');const d2=T.FxEntry.filter(e=>e.periodId==='2026-11'&&e.entryType==='UNREALIZED_REVERSAL'&&e.isDeleted!==1);eq(d2.length,2,'tạo lại không mất và không nhân đôi phần đảo');
  eq(T.FxEntry.filter(e=>e.periodId==='2026-11'&&e.entryType==='UNREALIZED_REVERSAL'&&e.isDeleted===1).length,2,'bản đã hủy giữ lịch sử');
  eq(rv(prev(c,PST,'2026-11')).length,2,'xem trước sau khi tạo lại vẫn thấy phần đảo');
  post(c,FULL,'2026-11',prev(c,FULL,'2026-11').draftSig);
  eq(rv(prev(c,PST,'2026-11')).length,0,'đã ghi nhận đảo thì không dựng lại');
});
suite('8. fx.backfill cần quyền toàn công ty; bỏ qua chứng từ thuộc kỳ đã khóa; ghi audit',()=>{
  const {T,c}=setup();
  eq(code(()=>c.fxBackfill_(NARROW,{requestId:rid(),payload:{}})),'FORBIDDEN');eq(T.DebtDoc.every(d=>!d.fxRateE4),true,'không chứng từ nào bị sửa');
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1,isDeleted:0});T.DebtDoc.forEach(d=>{d.periodId='2026-10'});
  const r=c.fxBackfill_(FULL,{requestId:rid(),payload:{}});eq(r.stamped,0);eq(r.skippedClosed,2,'kỳ khóa: không sửa chứng từ');
  T.Period.length=0;const r2=c.fxBackfill_(FULL,{requestId:rid(),payload:{}});eq(r2.stamped,2);eq(T.DebtDoc.every(d=>d.fxRateE4>0),true);
});
suite('9. Cấp quyền: chỉ user.manage; không cấp được quyền lạ; bootstrap chỉ báo quyền hợp lệ theo phạm vi',()=>{
  const {T,c}=setup();T.AppUser=[{id:'crt',email:'crt@x.vn',role:'ACCOUNTANT',version:1,isDeleted:0}];
  eq(code(()=>c.fxGrantsSet_(FULL,{requestId:rid(),payload:{userId:'crt',perms:['fx.entry.read']}})),'FORBIDDEN','APPROVER không cấp được');
  eq(code(()=>c.fxGrantsSet_(ADM,{requestId:rid(),payload:{userId:'crt',perms:['root']}})),'VALIDATION_FAILED');
  c.fxGrantsSet_(ADM,{requestId:rid(),payload:{userId:'crt',perms:['fx.entry.read','fx.entry.post']}});
  const g=JSON.parse(T.Config.find(x=>x.id==='fx.entry.grants').value);deq(g.crt,['fx.entry.read','fx.entry.post']);
  deq(c.fxGrantSummary_(CRT),{companyWide:true,read:true,write:false,post:true,reverse:false,backfill:false});
  deq(c.fxGrantSummary_(NARROW),{companyWide:false,read:false,write:false,post:false,reverse:false,backfill:false},'hẹp quyền: không quyền nào dù có trong cấu hình');
  deq(c.fxGrantSummary_(GRP).companyWide,false,'allPartners nhưng giới hạn nhóm không phải toàn công ty');
  c.fxGrantsSet_(ADM,{requestId:rid(),payload:{userId:'crt',perms:[]}});ok(!JSON.parse(T.Config.find(x=>x.id==='fx.entry.grants').value).crt,'thu hồi quyền');
});
suite('10. Báo cáo R13/R14 vẫn theo phạm vi người xem (không lộ chênh lệch của khách ngoài quyền)',()=>{
  const {T,c}=setup();
  const r14=c.reportRun_(NARROW,{payload:{code:'R14',params:{asOf:'2026-10-31'}}});
  deq(r14.rows.map(r=>r.cells.dir),['Phải trả'],'người p2 chỉ thấy phải trả của p2');
  const r14f=c.reportRun_(FULL,{payload:{code:'R14',params:{asOf:'2026-10-31'}}});deq(r14f.rows.map(r=>r.cells.dir).sort(),['Phải thu','Phải trả']);
});
suite('11. Engine giao dịch thật (Sheet giả): cùng requestId lặp an toàn, không tạo bút toán trùng',()=>{
  const makeEnv=require('./bench/_env.cjs'),{ctx}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
  ['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','FxRate','FxEntry','AppUser','SysTx','AuditLog'].forEach(t=>ctx.repoSheet_(t));
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
  ctx.repoAppend_('Catalog',[B({id:'c1',catalogType:'CURRENCY',code:'VND',name:'VND',attrsJson:'{"decimals":0}',active:1,sortOrder:1}),B({id:'c2',catalogType:'CURRENCY',code:'USD',name:'USD',attrsJson:'{"decimals":2}',active:1,sortOrder:2})]);
  ctx.repoAppend_('Partner',[B({id:'p1',shortName:'A',legalName:'A',isCustomer:1,isSupplier:0,status:'ACTIVE'})]);
  ctx.repoAppend_('DebtDoc',[B({id:'d1',docNo:'D1',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'USD',businessGroupCode:'G1',docDate:'2026-10-01',postingDate:'2026-10-01',status:'POSTED',totalGrossMinor:100000,isOpening:0})]);
  ctx.repoAppend_('DebtLine',[B({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',description:'x',netMinor:100000,grossMinor:100000,vatMinor:0,vatMode:'NONE'})]);
  ctx.repoAppend_('FxRate',[B({id:'r1',rateDate:'2026-10-01',currency:'USD',rateE4:250000000,source:'MANUAL'}),B({id:'r2',rateDate:'2026-10-31',currency:'USD',rateE4:260000000,source:'MANUAL'})]);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'}),B({id:'fx.entry.grants',value:JSON.stringify({adm:ALLP})})]);ctx.repoAppend_('AppUser',[B({id:'adm',email:'adm@x.vn',displayName:'A',role:'ADMIN',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1})]);
  ctx.todayVn_=()=>'2026-11-05';
  const U=mkU('adm','ADMIN',WIDE),req='REQ-FIXED-1',n=()=>ctx.repoValid_('FxEntry').length;
  const a=ctx.dispatch_(U,'fx.entryCreate',{requestId:req,payload:{periodId:'2026-10'}});eq(n(),1,'1 nháp AR');
  const b=ctx.dispatch_(U,'fx.entryCreate',{requestId:req,payload:{periodId:'2026-10'}});eq(n(),1,'cùng requestId: không ghi thêm');deq(a,b,'trả đúng kết quả cũ');
  const c2=ctx.dispatch_(U,'fx.entryCreate',{requestId:'REQ-2',payload:{periodId:'2026-10'}});eq(n(),1,'requestId khác: thay nháp, vẫn 1 bản hiệu lực');
  eq(code(()=>ctx.dispatch_(mkU('nar','ACCOUNTANT',{partnerIds:['p1'],businessGroups:['G1']}),'fx.entryCreate',{requestId:'REQ-3',payload:{periodId:'2026-10'}})),'FORBIDDEN');eq(n(),1);
  // ghi nhận + đảo bằng engine giao dịch thật (phiên bản, khóa, kiểm tra kỳ)
  ctx.repoAppend_('AppUser',[B({id:'adm2',email:'adm2@x.vn',displayName:'A2',role:'ADMIN',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1})]);
  ctx.dispatch_(U,'fx.grants.set',{requestId:'g2',payload:{userId:'adm2',perms:ALLP}});
  const U2=mkU('adm2','ADMIN',WIDE),pv=ctx.dispatch_(U2,'fx.entryPreview',{requestId:'p1',payload:{periodId:'2026-10'}});eq(pv.entries.filter(e=>e.status==='DRAFT').length,1);
  eq(code(()=>ctx.dispatch_(U,'fx.entryPost',{requestId:'po0',payload:{periodId:'2026-10',draftSig:pv.draftSig}})),'SELF_APPROVAL_FORBIDDEN','người lập không tự ghi nhận (engine thật)');
  eq(ctx.dispatch_(U2,'fx.entryPost',{requestId:'po1',payload:{periodId:'2026-10',draftSig:pv.draftSig}}).posted,1);eq(ctx.repoValid_('FxEntry')[0].status,'POSTED');
  eq(code(()=>ctx.dispatch_(U2,'fx.entryPost',{requestId:'po2',payload:{periodId:'2026-10',draftSig:pv.draftSig}})),'NOT_FOUND','hết nháp để ghi nhận');
  const e0=ctx.repoValid_('FxEntry')[0];
  eq(code(()=>ctx.dispatch_(U2,'fx.entryReverse',{requestId:'rv0',payload:{id:e0.id,ifVersion:e0.version+5,reason:'x'}})),'VERSION_CONFLICT','sai phiên bản bị từ chối');
  ctx.dispatch_(U2,'fx.entryReverse',{requestId:'rv1',payload:{id:e0.id,ifVersion:e0.version,reason:'sai'}});const all=ctx.repoValid_('FxEntry');eq(all.length,2);eq(all.find(e=>e.id===e0.id).status,'REVERSED');eq(all.find(e=>e.entryType==='REVERSAL').amountBaseMinor,-e0.amountBaseMinor);
});
suite('12. R34: engine thật + cache: cấp quyền có hiệu lực ở request kế tiếp, thu hồi chặn ngay (kể cả đọc từ cache); mọi lệnh bị từ chối không đổi dữ liệu',()=>{
  const makeEnv=require('./bench/_env.cjs'),{ctx,dbs}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
  ['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','FxRate','FxEntry','AppUser','SysTx','AuditLog'].forEach(t=>ctx.repoSheet_(t));
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
  ctx.repoAppend_('Catalog',[B({id:'c1',catalogType:'CURRENCY',code:'VND',name:'VND',attrsJson:'{"decimals":0}',active:1,sortOrder:1}),B({id:'c2',catalogType:'CURRENCY',code:'USD',name:'USD',attrsJson:'{"decimals":2}',active:1,sortOrder:2})]);
  ctx.repoAppend_('Partner',[B({id:'p1',shortName:'A',legalName:'A',isCustomer:1,isSupplier:0,status:'ACTIVE'})]);
  ctx.repoAppend_('DebtDoc',[B({id:'d1',docNo:'D1',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'USD',businessGroupCode:'G1',docDate:'2026-10-01',postingDate:'2026-10-01',status:'POSTED',totalGrossMinor:100000,isOpening:0})]);
  ctx.repoAppend_('DebtLine',[B({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',description:'x',netMinor:100000,grossMinor:100000,vatMinor:0,vatMode:'NONE'})]);
  ctx.repoAppend_('FxRate',[B({id:'r1',rateDate:'2026-10-01',currency:'USD',rateE4:250000000,source:'MANUAL'}),B({id:'r2',rateDate:'2026-10-31',currency:'USD',rateE4:260000000,source:'MANUAL'})]);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'}),B({id:'fx.entry.grants',value:JSON.stringify({adm:ALLP})})]);
  ctx.repoAppend_('AppUser',[B({id:'adm',email:'adm@x.vn',displayName:'A',role:'ADMIN',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1}),B({id:'crt',email:'crt@x.vn',displayName:'C',role:'ACCOUNTANT',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1})]);
  ctx.todayVn_=()=>'2026-11-05';
  const ADM=mkU('adm','ADMIN',WIDE),CRT=mkU('crt','ACCOUNTANT',WIDE),R=()=>'q'+Math.random();
  const snap=()=>J(['FxEntry','FxRate','Period','Config'].map(t=>ctx.repoValid_(t)));
  const D=(u,fn,p)=>ctx.dispatch_(u,fn,{requestId:R(),payload:p});
  // chưa được cấp: không đọc/lập được; đọc nhiều lần để cache nóng
  for(let i=0;i<2;i++)eq(code(()=>D(CRT,'fx.entryPreview',{periodId:'2026-10'})),'FORBIDDEN','chưa cấp quyền (lần '+(i+1)+')');
  let before=snap();eq(code(()=>D(CRT,'fx.entryCreate',{periodId:'2026-10'})),'FORBIDDEN');eq(snap(),before,'từ chối không đổi dữ liệu');
  D(ADM,'fx.grants.set',{userId:'crt',perms:['fx.entry.read','fx.entry.write']});
  eq(code(()=>D(CRT,'fx.entryPreview',{periodId:'2026-10'})),'OK','cấp xong, request kế tiếp có hiệu lực');
  eq(code(()=>D(CRT,'fx.entryCreate',{periodId:'2026-10'})),'OK','có quyền lập');
  const e0=ctx.repoValid_('FxEntry')[0];before=snap();
  eq(code(()=>D(CRT,'fx.entryPost',{periodId:'2026-10',draftSig:'x'})),'FORBIDDEN','chưa có quyền ghi nhận');eq(code(()=>D(CRT,'fx.entryReverse',{id:e0.id,ifVersion:e0.version,reason:'x'})),'FORBIDDEN','chưa có quyền đảo');eq(code(()=>D(CRT,'fx.backfill',{})),'FORBIDDEN','chưa có quyền backfill');eq(snap(),before,'các lệnh bị từ chối không đổi dữ liệu');
  D(ADM,'fx.grants.set',{userId:'crt',perms:[]});
  eq(code(()=>D(CRT,'fx.entryPreview',{periodId:'2026-10'})),'FORBIDDEN','thu hồi: chặn ngay ở request kế tiếp dù cache nóng');eq(code(()=>D(CRT,'fx.entryCreate',{periodId:'2026-10'})),'FORBIDDEN');
  // đảo sai phiên bản: dữ liệu không đổi
  D(ADM,'fx.grants.set',{userId:'adm',perms:ALLP});
  const adm2=mkU('adm2','ADMIN',WIDE);ctx.repoAppend_('AppUser',[B({id:'adm2',email:'adm2@x.vn',displayName:'A2',role:'ADMIN',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1})]);D(ADM,'fx.grants.set',{userId:'adm2',perms:ALLP});
  const pv=D(adm2,'fx.entryPreview',{periodId:'2026-10'});D(adm2,'fx.entryPost',{periodId:'2026-10',draftSig:pv.draftSig});const p0=ctx.repoValid_('FxEntry').find(e=>e.status==='POSTED');ok(p0,'đã ghi nhận');before=snap();
  eq(code(()=>D(adm2,'fx.entryReverse',{id:p0.id,ifVersion:p0.version+3,reason:'x'})),'VERSION_CONFLICT');eq(snap(),before,'đảo sai phiên bản không đổi dữ liệu');
  eq(code(()=>D(adm2,'fx.entryReverse',{id:'khong-co',ifVersion:1,reason:'x'})),'NOT_FOUND');eq(snap(),before);
});
console.log('Tổng kiểm tra:',steps);
