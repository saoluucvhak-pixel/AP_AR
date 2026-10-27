// Kiểm thử quyền xem PO và liên kết PO của chứng từ điều chỉnh/đảo (prompt bản 12 mục 2-3). Dữ liệu giả, KHÔNG phải Google thật.
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
const LIM={id:'lim',email:'lim@x.vn',role:'APPROVER',scope:{partnerIds:['p2'],businessGroups:['G1']}};
const FULL=U;
const dl=(c,u,p)=>c.docList_(u,{payload:Object.assign({direction:'AP'},p||{})});
const ids=r=>r.items.map(x=>x.id).sort();
function setup(){
  const m=mk();link(m.T);m.T.Partner.find(p=>p.id==='p2').isCustomer=1;
  m.T.Order.push(base({id:'o3',orderNo:'DH-3',poNo:'PO3',customerPartnerId:'p2',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-03',status:'OPEN',servicesJson:'[]'}));
  return m;
}
const mkDoc=(id,dir,pid,g,o)=>base(Object.assign({id,docNo:id.toUpperCase(),direction:dir,docType:'INVOICE',partnerId:pid,currency:'VND',businessGroupCode:'G1',docDate:'2026-10-05',postingDate:'2026-10-05',status:'POSTED',totalGrossMinor:g,dueDate:'2026-10-30',isOpening:0,adjustsDocId:'',reversesDocId:''},o||{}));
const mkLine=(id,doc,g,o)=>base(Object.assign({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'x',netMinor:g,grossMinor:g,vatMinor:0,vatMode:'NONE'},o||{}));
suite('1. Người chỉ có quyền NCC p2 xem hóa đơn AP nhưng KHÔNG thấy mã/ID/số lượng PO của khách p1',()=>{
  const {c}=setup();
  eq(code(()=>c.orderGet_(LIM,{payload:{id:'o1'}})),'NOT_FOUND','nền: orderGet_ chặn (đồng nhất NOT_FOUND theo ID)');
  const r=dl(c,LIM);eq(r.items.length,1);const x=r.items[0];deq(x.orders,[]);eq(x.orderCount,0);eq(x.ordersRestricted,true,'biết có liên kết bị giới hạn');deq(x.poRefs,[],'PO NCC của khoản gắn PO ẩn cũng không lộ');
  const raw=JSON.stringify(r);ok(!/DH-1|PO1|"o1"|NCC-PO-77/.test(raw),'không lộ chuỗi PO ẩn: '+raw.slice(0,300));
  const f=dl(c,FULL).items[0];deq(f.orders.map(o=>o.orderNo),['DH-1']);eq(f.ordersRestricted,false);deq(f.poRefs,['NCC-PO-77']);
});
suite('2. Hóa đơn nhiều PO (khoản chia): chỉ PO trong quyền được trả, ordersRestricted=true',()=>{
  const {T,c}=setup();const ac=T.Accrual.find(a=>a.id==='c1');ac.orderId='';
  T.AccrualSplit.push(base({id:'s1',accrualId:'c1',orderId:'o1',shareNetMinor:300,shareVatMinor:0,shareGrossMinor:300,basis:'EQUAL'}),base({id:'s2',accrualId:'c1',orderId:'o3',shareNetMinor:300,shareVatMinor:0,shareGrossMinor:300,basis:'EQUAL'}));
  const x=dl(c,LIM).items[0];deq(x.orders.map(o=>o.orderNo),['DH-3']);eq(x.orderCount,1,'số lượng chỉ đếm PO được xem');eq(x.ordersRestricted,true);
  const f=dl(c,FULL).items[0];deq(f.orders.map(o=>o.orderNo).sort(),['DH-1','DH-3']);eq(f.orderCount,2);eq(f.ordersRestricted,false);
});
suite('3. Tìm theo số đơn/PO và lọc orderId không làm lộ PO ngoài quyền (kết quả y hệt tìm chuỗi không tồn tại)',()=>{
  const {c}=setup();
  for(const q of ['DH-1','PO1','dh-1']){eq(dl(c,LIM,{q}).total,0,'tìm '+q);}
  eq(dl(c,LIM,{q:'ZZZ-NOPE'}).total,0);
  eq(dl(c,LIM,{adv:{sel:{orderId:['o1']}}}).total,0,'lọc orderId PO ẩn');eq(dl(c,LIM,{adv:{sel:{orderId:['khong-co']}}}).total,0,'giống orderId không tồn tại');
  eq(dl(c,FULL,{q:'DH-1'}).total,1);eq(dl(c,FULL,{adv:{sel:{orderId:['o1']}}}).total,1);
  eq(dl(c,LIM,{q:'D2'}).total,1,'vẫn tìm được theo số chứng từ hợp lệ');
});
suite('4. noOrder: hóa đơn không PO thật ≠ hóa đơn có PO bị giới hạn quyền',()=>{
  const {T,c}=setup();
  T.DebtDoc.push(mkDoc('d5','AP','p2',700));T.DebtLine.push(mkLine('l5','d5',700));
  const no=dl(c,LIM,{adv:{flag:{noOrder:true}}});deq(ids(no),['d5'],'d2 có PO ẩn không bị coi là chưa gắn PO');
  const nf=dl(c,FULL,{adv:{flag:{noOrder:true}}});deq(ids(nf),['d5']);
  eq(dl(c,LIM).total,2,'không loại hóa đơn hợp lệ khỏi phạm vi chỉ để che PO');
  const d5=dl(c,LIM).items.find(x=>x.id==='d5');eq(d5.ordersRestricted,false);eq(d5.orderCount,0);
});
suite('5. Điều chỉnh/đảo kế thừa PO của ĐÚNG dòng gốc; tăng và giảm đều xuất hiện khi lọc PO',()=>{
  const {T,c}=setup();
  T.DebtDoc.push(mkDoc('adjUp','AR','p1',50,{docType:'ADJ_INC',adjustsDocId:'d1'}),mkDoc('adjDn','AR','p1',-30,{docType:'ADJ_DEC',adjustsDocId:'d1'}),mkDoc('rev1','AR','p1',-1000,{docType:'REVERSAL',reversesDocId:'d1'}));
  T.DebtLine.push(mkLine('lU','adjUp',50,{adjustsLineId:'l1'}),mkLine('lD','adjDn',-30,{adjustsLineId:'l1'}),mkLine('lR','rev1',-1000,{adjustsLineId:'l1'}));
  const r=c.docList_(FULL,{payload:{direction:'AR',adv:{sel:{orderId:['o1']}}}});deq(ids(r),['adjDn','adjUp','d1','rev1'],'cả gốc, điều chỉnh tăng/giảm và chứng từ đảo');eq(r.total,4);
  r.items.forEach(x=>deq(x.orders.map(o=>o.id),['o1'],x.id));
  eq(c.docList_(FULL,{payload:{direction:'AR',q:'PO1'}}).total,4,'tìm theo PO cũng ra điều chỉnh');
  const pg=c.docList_(FULL,{payload:{direction:'AR',adv:{sel:{orderId:['o1']}},page:2,pageSize:3}});eq(pg.total,4);eq(pg.items.length,1);
  const lim=c.docList_({id:'l2',email:'l@x',role:'APPROVER',scope:{partnerIds:['p1'],businessGroups:['G1']}},{payload:{direction:'AR',adv:{sel:{orderId:['o1']}}}});eq(lim.total,4,'p1 có quyền đơn o1 của chính mình');
  const none=c.docList_(LIM,{payload:{direction:'AR',adv:{sel:{orderId:['o1']}}}});eq(none.total,0,'LIM không có quyền p1 → không thấy cả chứng từ');
});
suite('6. Hóa đơn nhiều PO: điều chỉnh một dòng chỉ kế thừa PO của dòng đó; khoản chia nhiều PO',()=>{
  const {T,c}=setup();
  T.Order.push(base({id:'o4',orderNo:'DH-4',poNo:'PO4',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-03',status:'OPEN',servicesJson:'[]'}));
  T.Accrual.push(base({id:'rx',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-03',feeTypeCode:'F',description:'x',netMinor:10,vatMode:'NONE',vatMinor:0,grossMinor:10,currency:'VND',status:'INVOICED'}),base({id:'ry',orderId:'o4',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-03',feeTypeCode:'F',description:'y',netMinor:20,vatMode:'NONE',vatMinor:0,grossMinor:20,currency:'VND',status:'INVOICED'}));
  T.DebtDoc.push(mkDoc('multi','AR','p1',30),mkDoc('adj2','AR','p1',5,{docType:'ADJ_INC',adjustsDocId:'multi'}));
  T.DebtLine.push(mkLine('ma','multi',10,{lineNo:1,accrualId:'rx'}),mkLine('mb','multi',20,{lineNo:2,accrualId:'ry'}),mkLine('la2','adj2',5,{adjustsLineId:'mb'}));
  const m=c.docList_(FULL,{payload:{direction:'AR'}}).items;deq(m.find(x=>x.id==='multi').orders.map(o=>o.orderNo).sort(),['DH-4','DH-1'].sort());deq(m.find(x=>x.id==='adj2').orders.map(o=>o.orderNo),['DH-4'],'điều chỉnh dòng mb chỉ kế thừa DH-4, không lấy DH-1');
  eq(c.docList_(FULL,{payload:{direction:'AR',adv:{sel:{orderId:['o1']}}}}).items.some(x=>x.id==='adj2'),false,'không lọc nhầm adj2 vào DH-1');
});
suite('7. Liên kết gốc thiếu / vòng lặp / quá sâu không treo API và không suy đoán PO',()=>{
  const {T,c}=setup();
  T.DebtDoc.push(mkDoc('x1','AR','p1',1,{docType:'ADJ_INC'}),mkDoc('x2','AR','p1',1,{docType:'ADJ_INC'}),mkDoc('x3','AR','p1',1,{docType:'ADJ_INC'}),mkDoc('x4','AR','p1',1,{docType:'ADJ_INC'}));
  T.DebtLine.push(mkLine('lx1','x1',1,{adjustsLineId:'nope'}),mkLine('lx2','x2',1,{adjustsLineId:'lx3'}),mkLine('lx3','x3',1,{adjustsLineId:'lx2'}),mkLine('lx4','x4',1,{adjustsLineId:'lx4'}));
  const r=c.docList_(FULL,{payload:{direction:'AR',q:'x'}});['x1','x2','x3','x4'].forEach(i=>{const it=r.items.find(x=>x.id===i);ok(it,i);deq(it.orders,[],i)});
  // chuỗi dài 12 mức → vượt giới hạn độ sâu 8, không gắn PO
  let prev='l1';for(let i=0;i<12;i++){T.DebtDoc.push(mkDoc('c'+i,'AR','p1',1,{docType:'ADJ_INC'}));T.DebtLine.push(mkLine('lc'+i,'c'+i,1,{adjustsLineId:prev}));prev='lc'+i}
  const deep=c.docList_(FULL,{payload:{direction:'AR',pageSize:100}}).items;ok(deep.find(x=>x.id==='c0').orders.length===1,'1 bước vẫn tới PO');deq(deep.find(x=>x.id==='c11').orders,[],'12 bước vượt giới hạn');
});
suite('8. Số dư, phân bổ và tổng chứng từ không đổi: tổng theo tiền tệ khớp với/không có lọc PO',()=>{
  const {c}=setup();
  const a=dl(c,FULL),b=dl(c,LIM);deq(a.totalsByCurrency,b.totalsByCurrency,'quyền xem PO không đổi số dư công nợ');
  eq(a.items[0].outstandingMinor,b.items[0].outstandingMinor);eq(a.items[0].totalGrossMinor,b.items[0].totalGrossMinor);
});
suite('9. Cache kết quả ấm không chia sẻ giữa hai người dùng khác phạm vi',()=>{
  const {c}=setup();const store={};const nodeCrypto=require('crypto');
  Object.assign(c.Utilities,{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(al,s)=>[...nodeCrypto.createHash('sha256').update(String(s)).digest()].map(x=>x>127?x-256:x)});
  c.props_=()=>({getProperty:()=>''});
  c.CacheService={getScriptCache:()=>({get:k=>store[k]||null,put:(k,v)=>{store[k]=v},remove:k=>{delete store[k]}})};
  const k1=c.respKey_(FULL,'doc.list',{direction:'AP'},7),k2=c.respKey_(LIM,'doc.list',{direction:'AP'},7);ok(k1!==k2,'khóa cache khác nhau theo người dùng/phạm vi');
  const k3=c.respKey_(Object.assign({},LIM,{scope:{partnerIds:['p2']}}),'doc.list',{direction:'AP'},7);ok(k3!==k2,'đổi phạm vi đổi khóa');
  if(c.MEMO_)c.MEMO_.cacheOk=true;
  const run=u=>c.cachedRead_(u,'doc.list',{direction:'AP'},7,()=>dl(c,u));
  const a=run(FULL),b=run(LIM),a2=run(FULL),b2=run(LIM);
  ok(Object.keys(store).length>=2,'cache thực sự được ghi cho cả hai người: '+Object.keys(store).length);ok(/DH-1/.test(JSON.stringify(a)),'người đủ quyền thấy PO');ok(!/DH-1|PO1/.test(JSON.stringify(b2)),'cache ấm: người hạn chế vẫn không thấy PO của người kia');deq(a2.items[0].orders.map(o=>o.orderNo),['DH-1']);
});
suite('10. Luồng thật docAdjust_: điều chỉnh tăng của hóa đơn gắn PO vẫn hiện khi lọc PO',()=>{
  const {T,c}=setup();
  const r=c.docAdjust_(FULL,{requestId:rid(),payload:{docId:'d1',kind:'INC',reason:'x',docDate:'2026-10-10',lines:[{targetLineId:'l1',amountMinor:50,description:'điều chỉnh'}]}});
  const adj=T.DebtDoc.find(d=>d.id===r.id);ok(adj,'đã tạo điều chỉnh');adj.status='POSTED';adj.postingDate='2026-10-10';
  const l=c.docList_(FULL,{payload:{direction:'AR',adv:{sel:{orderId:['o1']}}}});ok(l.items.some(x=>x.id===r.id),'điều chỉnh có trong danh sách lọc PO');deq(l.items.find(x=>x.id===r.id).orders.map(o=>o.id),['o1']);
});
console.log('Tổng kiểm tra:',steps);
suite('11. checkTriggers chỉ đọc: báo thiếu/trùng, không tạo hay xóa bộ kích hoạt',()=>{
  const {c}=setup();let created=0,deleted=0,list=[];
  const mkT=f=>({getHandlerFunction:()=>f});
  c.ScriptApp={getProjectTriggers:()=>list,newTrigger:()=>{created++;throw new Error('không được tạo')},deleteTrigger:()=>{deleted++}};
  let r=c.checkTriggers();eq(r.ok,false);eq(r.problems.length,5,'thiếu cả 5');
  list=['backupDailyTrigger','recoverTrigger','overdueDigestTrigger','reconcileTrigger','archiveTrigger'].map(mkT);r=c.checkTriggers();eq(r.ok,true);eq(r.counts.recoverTrigger,1);
  list.push(mkT('recoverTrigger'));r=c.checkTriggers();eq(r.ok,false);ok(/Trùng 2 bộ kích hoạt recoverTrigger/.test(r.problems[0]));
  eq(created+deleted,0,'không tạo/xóa gì');
});
console.log('Tổng kiểm tra:',steps);
