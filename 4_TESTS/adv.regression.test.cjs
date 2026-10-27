// Bộ lọc nâng cao (adv), kiểm tra đầu vào chặt, phạm vi người dùng, đối chiếu cha–con do máy chủ tính. Dữ liệu giả, KHÔNG phải Apps Script thật.
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
const only1={id:'u1',email:'u1@x.vn',role:'ACCOUNTANT',scope:{allPartners:false,partnerIds:['p1']}};
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(J(a),J(b),m)};
const rid=()=>'r'+Math.random(),call=(w,fn,u,p)=>w.ctx[fn](u,{requestId:rid(),payload:p});
const strip=r=>{const c=JSON.parse(J(r));if(c.meta)delete c.meta.generatedAt;return J(c)};

function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',e.message.split('\n').slice(0,12).join(' | '));process.exitCode=1}}
const mkdoc=(id,o,gross)=>Object.assign({id,docNo:id.toUpperCase(),direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-10',postingDate:'2026-09-10',status:'POSTED',totalGrossMinor:gross===undefined?1000:gross,isOpening:0,dueDate:'2026-09-30',createdAt:'2026-09-10T03:00:00.000Z',createdBy:'c',version:1,warningsJson:''},o||{});
const mkline=(id,doc,gross)=>({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'x',netMinor:gross,grossMinor:gross,vatMinor:0,vatMode:'NONE'});
function seed(w){
  w.T.Partner.push({id:'p2',shortName:'XYZ',legalName:'XYZ',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});
  w.T.DebtDoc.push(mkdoc('d1',{},1000),mkdoc('d2',{partnerId:'p2',currency:'USD',dueDate:'',warningsJson:'[{"code":"W"}]',docDate:'2026-10-01',postingDate:'2026-10-01'},5000),mkdoc('d3',{status:'DRAFT',isOpening:1,dueDate:'2026-12-01'},300),mkdoc('d4',{status:'POSTED',businessGroupCode:'G1',dueDate:'2026-10-20',docDate:'2026-10-02',postingDate:'2026-10-02'},2000));
  [['l1','d1',1000],['l2','d2',5000],['l3','d3',300],['l4','d4',2000]].forEach(x=>w.T.DebtLine.push(mkline(...x)));
}
const L=(w,u,p)=>w.ctx.docList_(u,{payload:Object.assign({direction:'AR',asOf:'2026-10-25',pageSize:50},p)});
const ids=r=>r.items.map(x=>x.id).sort();
suite('1. Lọc chứng từ: chọn nhiều, khoảng, cờ, kết hợp',()=>{
  const w=world('2026-10-25');seed(w);
  eq(ids(L(w,full,{})),['d1','d2','d3','d4']);
  eq(ids(L(w,full,{adv:{sel:{partnerId:['p2']}}})),['d2']);
  eq(ids(L(w,full,{adv:{sel:{status:['POSTED','DRAFT']}}})),['d1','d2','d3','d4']);
  eq(ids(L(w,full,{adv:{sel:{status:['DRAFT']}}})),['d3']);
  eq(ids(L(w,full,{adv:{sel:{currency:['USD']}}})),['d2']);
  eq(ids(L(w,full,{adv:{range:{dueDate:{from:'2026-10-01',to:'2026-12-31'}}}})),['d3','d4'],'khoảng hạn thanh toán; chứng từ không có hạn bị loại');
  eq(ids(L(w,full,{adv:{range:{docDate:{from:'2026-10-01'}}}})),['d2','d4']);
  eq(ids(L(w,full,{adv:{flag:{overdue:true}}})),['d1','d4'],'quá hạn tính tại ngày chốt 25/10: d1 (hạn 30/09) và d4 (hạn 20/10); d2 không có hạn, d3 nháp');
  eq(ids(L(w,full,{adv:{flag:{missingDue:true}}})),['d2']);
  eq(ids(L(w,full,{adv:{flag:{hasWarning:true}}})),['d2']);
  eq(ids(L(w,full,{adv:{flag:{onlyOpening:true}}})),['d3']);
  eq(ids(L(w,full,{adv:{flag:{onlyOutstanding:true}}})),['d1','d2','d4']);
  eq(ids(L(w,full,{adv:{sel:{currency:['VND']},range:{amountMinor:{from:1500,to:3000}}}})),['d4'],'khoảng số tiền với đúng một tiền tệ');
  eq(ids(L(w,full,{adv:{sel:{currency:['VND']},flag:{overdue:true,onlyOutstanding:true},range:{dueDate:{to:'2026-10-05'}}}})),['d1'],'nhiều điều kiện cùng lúc');
  eq(ids(L(w,full,{q:'xyz',adv:{sel:{currency:['USD']}}})),['d2'],'kết hợp tìm kiếm');
  eq(ids(L(w,full,{adv:{sel:{status:[]}}})),['d1','d2','d3','d4'],'danh sách rỗng = không lọc');
  eq(L(w,full,{adv:{flag:{overdue:true}}}).adv.flag.overdue,true,'trả lại điều kiện đã chuẩn hóa');
});
suite('2. Đầu vào xấu bị từ chối VALIDATION_FAILED',()=>{
  const w=world('2026-10-25');seed(w);
  const bad=(adv,m)=>eq(code(()=>L(w,full,{adv})),'VALIDATION_FAILED',m);
  bad('x','adv không phải đối tượng');bad([],'adv là mảng');bad({foo:{}},'nhóm lạ');bad({sel:{evil:['a']}},'khóa chọn lạ');
  bad({sel:{direction:['IN']}},'khóa của màn hình khác (phiếu thu/chi)');bad({flag:{onlyUnallocated:true}},'cờ của màn hình khác');bad({flag:{overdue:'yes'}},'cờ không phải boolean');
  bad({range:{dueDate:{from:'2026-12-01',to:'2026-01-01'}}},'khoảng đảo');bad({range:{dueDate:{from:'2026-13-45'}}},'ngày sai');
  bad({sel:{currency:['VND']},range:{amountMinor:{from:1.5}}},'số tiền không nguyên');bad({range:{amountMinor:{from:1,to:2}}},'số tiền không có tiền tệ');
  bad({sel:{currency:['VND','USD']},range:{amountMinor:{from:1}}},'số tiền với hai tiền tệ');
  bad({sel:{status:Array.from({length:51},(_,i)=>'S'+i)}},'quá 50 giá trị');bad({sel:{status:'POSTED'}},'giá trị chọn không phải mảng');bad({sel:{status:[1]}},'giá trị không phải chuỗi');
  bad({range:{dueDate:{from:'2026-01-01',extra:1}}},'khoảng có khóa thừa');bad({range:{amountMinor:{from:1}},sel:{currency:['VND']},foo:1},'nhóm thừa');
  eq(code(()=>w.ctx.orderList_(full,{payload:{adv:{flag:{overdue:true}}}})),'VALIDATION_FAILED','đơn hàng: cờ của màn khác');
  eq(code(()=>w.ctx.paymentList_(full,{payload:{adv:{range:{dueDate:{from:'2026-01-01'}}}}})),'VALIDATION_FAILED','phiếu: khoảng của màn khác');
  eq(code(()=>w.ctx.paymentList_(full,{payload:{adv:{range:{amountMinor:{from:1}}}}})),'VALIDATION_FAILED','phiếu: số tiền không có tiền tệ');
});
suite('3. Lọc luôn sau giới hạn phạm vi, không mở rộng quyền xem',()=>{
  const w=world('2026-10-25');seed(w);
  eq(ids(L(w,only1,{})),['d1','d3','d4'],'người giới hạn chỉ thấy đối tác p1');
  eq(ids(L(w,only1,{adv:{sel:{partnerId:['p2']}}})),[],'chọn đối tác ngoài phạm vi không ra dòng nào');
  eq(ids(L(w,only1,{adv:{sel:{partnerId:['p1','p2']}}})),['d1','d3','d4']);
  eq(ids(L(w,only1,{adv:{flag:{missingDue:true}}})),[],'d2 (thiếu hạn) thuộc p2: không lộ');
  eq(L(w,only1,{adv:{sel:{currency:['USD']}}}).total,0);
  w.T.Payment.push({id:'pay1',payNo:'P1',direction:'IN',partnerId:'p2',currency:'VND',amountMinor:500,effectiveDate:'2026-10-01',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  eq(w.ctx.paymentList_(only1,{payload:{adv:{sel:{partnerId:['p2']}}}}).total,0,'phiếu ngoài phạm vi không lộ');
  eq(w.ctx.paymentList_(full,{payload:{adv:{sel:{partnerId:['p2']}}}}).total,1);
});
suite('4. Phiếu thu/chi và đơn hàng',()=>{
  const w=world('2026-10-25');seed(w);
  w.T.Payment.push({id:'a',payNo:'PA',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:500,effectiveDate:'2026-10-01',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1},{id:'b',payNo:'PB',direction:'OUT',partnerId:'p2',currency:'USD',amountMinor:900,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  const P=a=>w.ctx.paymentList_(full,{payload:{adv:a}}).items.map(x=>x.id).sort();
  eq(P({sel:{direction:['IN']}}),['a']);eq(P({sel:{currency:['USD']},range:{amountMinor:{from:800}}}),['b']);eq(P({range:{effectiveDate:{from:'2026-10-05'}}}),['b']);eq(P({flag:{onlyUnallocated:true}}),['a','b']);
  w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1},{id:'o2',orderNo:'DH-2',poNo:'P2',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-05',status:'CLOSED',servicesJson:'[]',serviceCode:'',hsdvNo:'',version:1});
  const O=a=>w.ctx.orderList_(full,{payload:{adv:a}}).items.map(x=>x.id).sort();
  eq(O({sel:{status:['CLOSED']}}),['o2']);eq(O({flag:{onlyMissingService:true}}),['o2']);eq(O({range:{orderDate:{from:'2026-10-01'}}}),['o2']);eq(O({sel:{serviceCode:['FWD']}}),['o1']);
});
suite('5. Đối chiếu cha = con do máy chủ tính (chứng từ, phiếu, đơn)',()=>{
  const w=world('2026-10-25');w.ctx.repoReadAll_=()=>[];
  w.T.DebtDoc.push(mkdoc('nochild',{},0),mkdoc('one',{},1000),mkdoc('many',{},1500),mkdoc('lech',{},1000));
  w.T.DebtLine.push(mkline('o1','one',1000),mkline('m1','many',1000),mkline('m2','many',500),mkline('x1','lech',900));
  const G=id=>w.ctx.docGet_(full,{payload:{id,asOf:'2026-10-25'}});
  let r=G('nochild').reconcile;eq([r.lineCount,r.childSumMinor,r.childOk],[0,0,true],'cha không con, tổng 0');
  r=G('one').reconcile;eq([r.lineCount,r.childOk],[1,true]);
  r=G('many').reconcile;eq([r.lineCount,r.childSumMinor,r.childOk],[2,1500,true]);
  r=G('lech').reconcile;eq([r.childOk,r.childDiffMinor],[false,-100],'đối chiếu lệch (dữ liệu cố ý)');
  w.T.Payment.push({id:'pay',payNo:'P1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:1000,effectiveDate:'2026-10-01',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  w.T.Allocation.push({id:'al1',paymentId:'pay',debtLineId:'o1',docId:'one',amountMinor:400,effectiveDate:'2026-10-02'},{id:'al2',paymentId:'pay',debtLineId:'m1',docId:'many',amountMinor:300,effectiveDate:'2026-10-03'});
  let pr=w.ctx.paymentGet_(full,{payload:{id:'pay'}}).reconcile;eq([pr.allocCount,pr.allocSumMinor,pr.allocOk,pr.overAllocated],[2,700,true,false]);
  w.T.Allocation.push({id:'al3',paymentId:'pay',debtLineId:'m2',docId:'many',amountMinor:500,effectiveDate:'2026-10-04'});
  pr=w.ctx.paymentGet_(full,{payload:{id:'pay'}}).reconcile;eq([pr.allocSumMinor,pr.overAllocated,pr.allocOk],[1200,true,false],'phân bổ vượt số tiền phiếu bị báo lệch');
  eq(G('one').reconcile.allocOk,true);
  // phạm vi: người bị giới hạn không đọc được chứng từ của đối tác khác
  w.T.Partner.push({id:'p2',shortName:'XYZ',legalName:'XYZ',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});w.T.DebtDoc.push(mkdoc('other',{partnerId:'p2'},100));
  eq(code(()=>w.ctx.docGet_(only1,{payload:{id:'other'}})),'NOT_FOUND');
  eq(G('one').reconcile.scoped,false);eq(w.ctx.docGet_(only1,{payload:{id:'one'}}).reconcile.scoped,true);
  // đơn hàng: một con / nhiều con / phần chia lệch
  w.T.Order.push({id:'o',orderNo:'DH',poNo:'P',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1});
  const A=(id,k,n,st)=>({id,orderId:'o',kind:k,partnerId:'p1',accrualDate:'2026-09-05',feeTypeCode:'F',description:id,netMinor:n,vatMode:'NONE',vatMinor:0,grossMinor:n,isPassThrough:0,currency:'VND',status:st||'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  eq(w.ctx.orderGet_(full,{payload:{id:'o'}}).reconcile.childOk,true,'đơn không có khoản');
  w.T.Accrual.push(A('r1','REVENUE',1000),A('c1','COST',400),A('cx','COST',99,'CANCELLED'));
  const rc=w.ctx.orderGet_(full,{payload:{id:'o'}}).reconcile;eq([rc.childOk,rc.byCurrency.VND.childSumMinor,rc.byCurrency.VND.stateSumMinor],[true,1400,1400],'hủy không tính');
  w.T.Accrual.push({id:'sh',orderId:'',kind:'COST',partnerId:'p1',accrualDate:'2026-09-06',feeTypeCode:'F',description:'chung',netMinor:600,vatMode:'NONE',vatMinor:0,grossMinor:600,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  w.T.AccrualSplit.push({id:'s1',accrualId:'sh',orderId:'o',shareNetMinor:200,shareVatMinor:0,shareGrossMinor:200,basis:'M'});
  const rl=w.ctx.orderGet_(full,{payload:{id:'o'}}).reconcile;eq([rl.childOk,rl.splitMismatches.length],[false,1],'phần chia không đủ khoản gốc bị báo lệch');
});
suite('6. Đọc sau ghi thấy dữ liệu mới',()=>{
  const w=world('2026-10-25');seed(w);
  eq(L(w,full,{adv:{sel:{status:['DRAFT']}}}).total,1);
  w.T.DebtDoc.push(mkdoc('d9',{status:'DRAFT'},700));w.T.DebtLine.push(mkline('l9','d9',700));w.ctx.resetMemoDirect_&&w.ctx.resetMemoDirect_();
  eq(L(w,full,{adv:{sel:{status:['DRAFT']}}}).total,2,'chứng từ mới ghi hiện ngay trong kết quả lọc');
});
console.log('Kiểm thử bộ lọc nâng cao + cha–con:',steps,'khẳng định (dữ liệu giả)');
