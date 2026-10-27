// Kiểm thử theo prompt nâng cấp: ngày ghi nhận, khóa kỳ, trạng thái hóa đơn, thu hộ/chi hộ, thanh toán/phân bổ. Dữ liệu giả, KHÔNG phải Apps Script thật.
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
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',e.message.split('\n')[0]);process.exitCode=1}}
const base=o=>Object.assign({version:1,isDeleted:0,commitState:'C',txId:'',createdAt:'2026-10-01T00:00:00Z',createdBy:'t'},o);
const U={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
// Dựng một đơn đã quyết toán: doanh thu 1000 (khách p1) và chi phí 600 (NCC p2), cùng VND
function mk(opt){
  opt=opt||{};const w=world('2026-10-25'),T=w.T,c=w.ctx;
  T.Partner.push({id:'p2',shortName:'NCC',legalName:'NCC',isCustomer:0,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});
  T.Order.push(base({id:'o1',orderNo:'DH-1',poNo:'PO1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-02',status:opt.status||'CLOSED',servicesJson:J([{code:'FWD',hsdvNo:'H1'}]),serviceCode:'FWD',hsdvNo:'H1'}));
  const docSt=opt.docStatus||'POSTED';
  const D=(id,dir,pid,g)=>base({id,docNo:id.toUpperCase(),direction:dir,docType:'INVOICE',partnerId:pid,currency:'VND',businessGroupCode:'G1',docDate:'2026-10-05',postingDate:'2026-10-05',status:docSt,totalGrossMinor:g,dueDate:'2026-10-30',isOpening:0,createdAt:'2026-10-05T03:00:00.000Z',warningsJson:''});
  const L=(id,doc,g)=>base({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'x',netMinor:g,grossMinor:g,vatMinor:0,vatMode:'NONE'});
  const A=(id,k,pid,n,x)=>base(Object.assign({id,orderId:'o1',kind:k,partnerId:pid,accrualDate:'2026-10-03',feeTypeCode:'F',description:'d'+id,netMinor:n,vatMode:'NONE',vatMinor:0,grossMinor:n,isPassThrough:0,currency:'VND',status:'INVOICED',serviceCode:'FWD'},x||{}));
  T.DebtDoc.push(D('d1','AR','p1',1000));T.DebtLine.push(L('l1','d1',1000));T.Accrual.push(A('r1','REVENUE','p1',1000,{docId:'d1',debtLineId:'l1'}));
  if(!opt.revenueOnly){T.DebtDoc.push(D('d2','AP','p2',600));T.DebtLine.push(L('l2','d2',600));T.Accrual.push(A('c1','COST','p2',600,{docId:'d2',debtLineId:'l2'}));}
  const pay=(id,dir,pid,amt)=>base({id,payNo:'P'+id,direction:dir,partnerId:pid,currency:'VND',amountMinor:amt,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'Q1',status:'POSTED'});
  const al=(id,pay,line,doc,amt)=>base({id,paymentId:pay,debtLineId:line,docId:doc,amountMinor:amt,effectiveDate:'2026-10-11'});
  T.Payment.push(pay('y1','IN','p1',1000));T.Allocation.push(al('a1','y1','l1','d1',opt.arPaid==null?1000:opt.arPaid));
  if(!opt.revenueOnly){T.Payment.push(pay('y2','OUT','p2',600));T.Allocation.push(al('a2','y2','l2','d2',opt.apPaid==null?600:opt.apPaid));}
  return {w,T,c};
}
const deq=(a,b,m)=>eq(J(a),J(b),m);
const mkU=(id,role)=>({id,email:id+'@x.vn',role,scope:{allPartners:true}});
const maker=mkU('mk','ACCOUNTANT'),appr=mkU('ap','APPROVER'),viewer=mkU('vw','AUDITOR');
function setup(){const {T,c}=mk({docStatus:'SUBMITTED'});T.AppUser=[{id:'mk',email:'mk@x.vn',displayName:'Lập CT',version:1},{id:'ap',email:'ap@x.vn',displayName:'Duyệt',version:1}];
  T.DebtDoc.forEach(d=>{d.createdBy='mk';d.submittedBy='mk';d.updatedAt='2026-10-20T03:00:00Z'});
  T.Payment.forEach(x=>{x.status='SUBMITTED';x.createdBy='mk';x.submittedBy='mk';x.updatedAt='2026-10-22T03:00:00Z'});return {T,c}}
const L=(c,u,p)=>c.approvalList_(u,{payload:p||{}});
suite('1. Người duyệt thấy đủ mục chờ duyệt (chứng từ + phiếu), đúng người gửi và số ngày chờ',()=>{
  const {c}=setup();const r=L(c,appr);eq(r.counts.total,4,'2 chứng từ + 2 phiếu');eq(r.counts.approve,4);eq(r.counts.post,0);
  ok(r.items.every(i=>i.canAct&&i.submittedBy==='Lập CT'));ok(r.items[0].waitDays>=r.items[r.items.length-1].waitDays,'sắp xếp lâu nhất lên đầu');
  ok(r.items.some(i=>i.kind==='DOC'&&i.no==='D1'&&i.amountMinor===1000&&i.partnerName));ok(r.items.some(i=>i.kind==='PAYMENT'));
});
suite('2. Người lập không tự duyệt được mục của mình: không tính vào "chờ bạn", chỉ báo đang chờ người khác',()=>{
  const {c}=setup();const r=L(c,maker);eq(r.counts.total,0);
  const u=mkU('mk','APPROVER');const r2=L(c,u);eq(r2.counts.total,0,'cả khi vai trò APPROVER, mục do mình gửi không tự duyệt');eq(r2.counts.waitingOthers,4);
  const r3=L(c,u,{includeBlocked:true});eq(r3.items.length,4);ok(r3.items.every(i=>!i.canAct&&/người khác/.test(i.why)));
});
suite('3. Chờ ghi nhận (đã duyệt) và quyền xem',()=>{
  const {T,c}=setup();T.DebtDoc[0].status='APPROVED';const r=L(c,appr);eq(r.counts.post,1);ok(r.items.some(i=>i.step==='POST'&&i.kind==='DOC'));
  eq(L(c,viewer).counts.total,0,'người chỉ xem không có việc duyệt');eq(L(c,appr,{summaryOnly:true}).items.length,0,'chế độ chỉ đếm');
});
suite('4. Phạm vi người dùng',()=>{
  const {c}=setup();const sc={id:'sc',email:'sc@x',role:'APPROVER',scope:{allPartners:false,partnerIds:['zz'],businessGroups:['G1']}};eq(L(c,sc).counts.total,0);
});
console.log('Kiểm thử hàng chờ duyệt:',steps,'khẳng định');
