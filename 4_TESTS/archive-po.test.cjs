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
const arch=(c,p)=>call({ctx:c},'orderArchive_',U,Object.assign({id:'o1',confirmComplete:true},p||{}));
const snap=T=>J({d:T.DebtDoc,l:T.DebtLine,a:T.Accrual.map(x=>Object.assign({},x)),al:T.Allocation,p:T.Payment});
suite('1. Lưu trữ PO đã quyết toán: chỉ đổi trạng thái, số tiền/liên kết/ID giữ nguyên; ẩn khỏi danh sách mặc định',()=>{
  const {T,c}=mk();const before=snap(T);
  const an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});eq(an.eligible,true,J(an.blockers));eq(an.warnings.length,0);
  eq(code(()=>arch(c,{confirmComplete:false})),'ORDER_ARCHIVE_NEEDS_CONFIRM','phải xác nhận tập hợp đủ');
  eq(code(()=>arch(c)),'OK');const o=T.Order[0];ok(o.archivedAt&&o.archivedBy==='ap@x.vn');eq(o.status,'CLOSED','trạng thái đơn không đổi');
  eq(snap(T),before,'chứng từ/dòng/phát sinh/phân bổ/phiếu không đổi');
  eq(code(()=>arch(c)),'STATE_TRANSITION_INVALID','không lưu trữ hai lần');
  let l=c.orderList_(U,{payload:{}});eq(l.items.length,0,'danh sách mặc định không có đơn lưu trữ');
  l=c.orderList_(U,{payload:{adv:{flag:{includeArchived:true}}}});eq(l.items.length,1);eq(l.items[0].id,'o1');ok(l.items[0].archivedAt);
  l=c.orderList_(U,{payload:{adv:{flag:{onlyArchived:true}}}});eq(l.items.length,1);
  eq(c.rmOrders_('2026-10-25').length,0,'tổng hợp PO không còn hiện đơn lưu trữ');
  eq(code(()=>call({ctx:c},'orderSetStatus_',U,{id:'o1',status:'OPEN'})),'ORDER_ARCHIVED','đơn lưu trữ không đổi trạng thái trực tiếp');
  const g=c.orderGet_(U,{payload:{id:'o1'}});eq(g.order.id,'o1');eq(g.accruals.length,2,'liên kết vẫn đủ');
});
suite('2. Mở lại lưu trữ giữ ID/lịch sử; cần lý do; sau đó mở lại đơn và ghi nhận bổ sung được',()=>{
  const {T,c}=mk();arch(c);
  eq(code(()=>call({ctx:c},'orderUnarchive_',U,{id:'o1'})),'VALIDATION_FAILED','cần lý do');
  eq(code(()=>call({ctx:c},'orderUnarchive_',U,{id:'o1',reason:'Phát sinh phí lưu bãi'})),'OK');ok(!T.Order[0].archivedAt);eq(T.Order[0].id,'o1');
  eq(c.orderList_(U,{payload:{}}).items.length,1,'hiện lại trong danh sách');
  eq(code(()=>call({ctx:c},'orderUnarchive_',U,{id:'o1',reason:'x'})),'STATE_TRANSITION_INVALID','chưa lưu trữ thì không mở lại');
  eq(code(()=>call({ctx:c},'orderSetStatus_',U,{id:'o1',status:'OPEN'})),'OK');eq(T.Order[0].status,'OPEN');
});
suite('3. PO hết phải thu nhưng còn phải trả: không lưu trữ được và vẫn được theo dõi (không nằm trong lưu trữ)',()=>{
  const {T,c}=mk({apPaid:100});
  const an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});eq(an.eligible,false);const b=an.blockers.find(x=>x.code==='OUTSTANDING');ok(b);eq(b.items.length,1,'chỉ phải trả NCC, phải thu đã hết');ok(/Phải trả/.test(b.items[0])&&/500/.test(b.items[0]));
  eq(code(()=>arch(c)),'ORDER_NOT_ARCHIVABLE');ok(!T.Order[0].archivedAt);
  const rows=c.rmOrders_('2026-10-25');eq(rows.length,1,'đơn đã đóng nhưng còn phải trả vẫn hiện ở tổng hợp');eq(rows[0].cur.VND.ap,500);eq(rows[0].cur.VND.ar,0);
});
suite('4. Không bù trừ phải thu với phải trả: còn cả hai chiều thì báo riêng từng chiều',()=>{
  const {c}=mk({arPaid:500,apPaid:100});
  const b=c.orderArchiveCheck_(U,{payload:{id:'o1'}}).blockers.find(x=>x.code==='OUTSTANDING');eq(b.items.length,2);ok(b.items.some(x=>/Phải thu/.test(x)&&/500/.test(x)));ok(b.items.some(x=>/Phải trả/.test(x)&&/500/.test(x)));
});
suite('5. Tập hợp doanh thu/chi phí thiếu không được kết luận đã quyết toán',()=>{
  let {T,c}=mk();T.Accrual.length=0;T.DebtDoc.length=0;T.DebtLine.length=0;T.Allocation.length=0;T.Payment.length=0;
  let an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});eq(an.eligible,false);ok(an.blockers.some(x=>x.code==='NO_ACCRUALS'),'đơn trống');
  ({T,c}=mk({revenueOnly:true}));an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});eq(an.eligible,true);ok(an.warnings.some(x=>x.code==='ONE_SIDED'),'chỉ có doanh thu → cảnh báo cần xác nhận');
  eq(code(()=>arch(c)),'ORDER_ARCHIVE_NEEDS_ACK');eq(code(()=>arch(c,{acks:['ONE_SIDED']})),'VALIDATION_FAILED','cần ghi chú');eq(code(()=>arch(c,{acks:['ONE_SIDED'],note:'Đơn chỉ thu phí dịch vụ, không có chi phí'})),'OK');eq(T.Order[0].archiveNote,'Đơn chỉ thu phí dịch vụ, không có chi phí');
  ({T,c}=mk());T.Accrual.push(base({id:'r2',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-04',feeTypeCode:'F',description:'chưa lập',netMinor:50,vatMode:'NONE',vatMinor:0,grossMinor:50,isPassThrough:0,currency:'VND',status:'OPEN',serviceCode:'FWD'}));
  an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});ok(an.blockers.some(x=>x.code==='UNINVOICED'),'còn khoản chưa lập hóa đơn');
});
suite('6. Chứng từ đang chờ, đơn chưa đóng, tiền chưa phân bổ',()=>{
  let {T,c}=mk({docStatus:'SUBMITTED'});ok(c.orderArchiveCheck_(U,{payload:{id:'o1'}}).blockers.some(x=>x.code==='PENDING_DOCS'),'hóa đơn chờ duyệt');
  ({T,c}=mk({status:'OPEN'}));ok(c.orderArchiveCheck_(U,{payload:{id:'o1'}}).blockers.some(x=>x.code==='NOT_CLOSED'));eq(code(()=>arch(c)),'ORDER_NOT_ARCHIVABLE');
  ({T,c}=mk());T.Payment.push(base({id:'y9',payNo:'PY9',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:50,effectiveDate:'2026-10-12',method:'BANK',cashAccountCode:'Q1',status:'POSTED'}));
  const an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});eq(an.eligible,true);ok(an.warnings.some(x=>x.code==='UNALLOCATED_CASH'),'khách còn tiền chưa phân bổ');
  eq(code(()=>arch(c)),'ORDER_ARCHIVE_NEEDS_ACK');eq(code(()=>arch(c,{acks:['UNALLOCATED_CASH'],note:'Khoản ứng cho đơn khác'})),'OK');
});
suite('7. Thu hộ/chi hộ lệch → cảnh báo cần xác nhận',()=>{
  const {T,c}=mk();T.Accrual.forEach(a=>{a.isPassThrough=1});T.Accrual.find(a=>a.id==='c1').grossMinor=T.Accrual.find(a=>a.id==='c1').netMinor=500;
  const an=c.orderArchiveCheck_(U,{payload:{id:'o1'}});ok(an.warnings.some(x=>x.code==='PASS_THROUGH_GAP'),J(an.warnings));
});
suite('8. Đối soát phát hiện PO lưu trữ nhưng phát sinh nghĩa vụ sau đó',()=>{
  const {T,c}=mk();arch(c);
  let r=c.reconChecks_().find(x=>x.code==='ARCHIVED_OBLIGATIONS');eq(r.status,'OK');
  T.Allocation.find(a=>a.id==='a2').amountMinor=100;
  r=c.reconChecks_().find(x=>x.code==='ARCHIVED_OBLIGATIONS');eq(r.status,'FAIL');ok(/DH-1/.test(r.samples[0]));
});
console.log('Kiểm thử lưu trữ PO:',steps,'khẳng định (dữ liệu giả)');
