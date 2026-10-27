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
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoSliceValid_=(t)=>ctx.repoValid_(t);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
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
function link(T){T.DebtLine.find(l=>l.id==='l1').accrualId='r1';T.DebtLine.find(l=>l.id==='l2').accrualId='c1';T.Accrual.find(a=>a.id==='c1').poRef='NCC-PO-77'}
suite('1. Danh sách công nợ cho biết chứng từ thuộc PO nào (phải thu và phải trả)',()=>{
  const {T,c}=mk();link(T);
  const ar=c.docList_(U,{payload:{direction:'AR'}}).items[0],ap=c.docList_(U,{payload:{direction:'AP'}}).items[0];
  deq(ar.orders.map(o=>[o.orderNo,o.poNo]),[['DH-1','PO1']]);eq(ar.orderCount,1);deq(ap.orders.map(o=>o.orderNo),['DH-1']);deq(ap.poRefs,['NCC-PO-77'],'PO gửi NCC của chi phí');
});
suite('2. Hóa đơn không gắn PO / chi phí chia nhiều đơn',()=>{
  const {T,c}=mk();link(T);
  T.Order.push(base({id:'o2',orderNo:'DH-2',poNo:'PO2',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-03',status:'OPEN',servicesJson:'[]'}));
  const ac=T.Accrual.find(a=>a.id==='c1');ac.orderId='';T.AccrualSplit.push(base({id:'s1',accrualId:'c1',orderId:'o1',shareNetMinor:300,shareVatMinor:0,shareGrossMinor:300,basis:'EQUAL'}),base({id:'s2',accrualId:'c1',orderId:'o2',shareNetMinor:300,shareVatMinor:0,shareGrossMinor:300,basis:'EQUAL'}));
  const ap=c.docList_(U,{payload:{direction:'AP'}}).items[0];deq(ap.orders.map(o=>o.orderNo).sort(),['DH-1','DH-2'],'chia 2 đơn');eq(ap.orderCount,2);
  T.DebtLine.find(l=>l.id==='l1').accrualId='';const ar=c.docList_(U,{payload:{direction:'AR'}}).items[0];deq(ar.orders,[],'hóa đơn nhập trực tiếp: không PO');eq(ar.orderCount,0);
});
suite('3. Tìm theo số đơn/số PO/PO NCC và lọc theo PO, chưa gắn PO',()=>{
  const {T,c}=mk();link(T);
  const ids=(p)=>c.docList_(U,{payload:p}).items.map(x=>x.id).sort();
  deq(ids({q:'PO1'}),['d1','d2'].sort(),'tìm số PO khách ra cả hóa đơn bán và hóa đơn mua của đơn');deq(ids({q:'DH-1'}).length,2);deq(ids({q:'NCC-PO-77'}),['d2'],'tìm PO gửi NCC');deq(ids({q:'khongco'}),[]);
  deq(ids({adv:{sel:{orderId:['o1']}}}).length,2);deq(ids({adv:{sel:{orderId:['nope']}}}),[]);
  T.DebtLine.find(l=>l.id==='l1').accrualId='';deq(ids({adv:{flag:{noOrder:true}}}),['d1'],'chỉ hóa đơn chưa gắn PO');
});
suite('4. Phạm vi người dùng vẫn áp dụng',()=>{
  const {T,c}=mk();link(T);const scoped={id:'s',email:'s@x',role:'APPROVER',scope:{allPartners:false,partnerIds:['p1'],businessGroups:['G1']}};
  const r=c.docList_(scoped,{payload:{direction:'AP'}});eq(r.items.length,0,'NCC p2 ngoài phạm vi không lộ PO');
});
console.log('Kiểm thử cột PO ở danh sách công nợ:',steps,'khẳng định');
