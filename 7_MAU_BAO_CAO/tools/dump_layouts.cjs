// Dựng dữ liệu mẫu logistics (giả) → chạy các báo cáo thật của Backend.gs → xuất bố cục JSON để dựng xem trước. Dữ liệu hoàn toàn giả.
const vm=require('vm'),fs=require('fs'),path=require('path');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','..','1_BACKEND','Backend.gs'),'utf8');
const J=x=>JSON.stringify(x);
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



const full={id:'ap',email:'ap@x.vn',displayName:'Nguyễn Thị Kế Toán',role:'APPROVER',scope:{allPartners:true}};
const w=world('2026-10-25');w.ctx.repoReadAll_=()=>[];
const P=(id,n,l,c,s)=>({id,shortName:n,legalName:l,isCustomer:c,isSupplier:s,status:'ACTIVE',scopeTags:'',taxCode:'0400'+id.slice(-3),version:1});
w.T.Partner.length=0;w.T.Partner.push(P('p1','YUANDA','CÔNG TY TNHH YUANDA VIỆT NAM',1,0),P('p2','KHTERM','KHTERM LOGISTICS CO., LTD',1,0),P('p3','SHUTTLE','CÔNG TY CP VẬN TẢI SHUTTLE',0,1),P('p4','GLOTRACO','CẢNG GLOTRACO',0,1));
w.T.Catalog.push({id:'cx',catalogType:'CURRENCY',code:'USD',name:'USD',attrsJson:'{"decimals":2}',active:1,sortOrder:2,version:1});
const cfg=(k,v)=>w.T.Config.push({id:k,value:v});cfg('entity.name','CÔNG TY TNHH GLOBAL MULTI LOGISTICS');cfg('entity.address','Lô 12, KCN Hòa Khánh, Đà Nẵng');cfg('entity.taxCode','0401234567');cfg('entity.phone','0236 3 000 000');cfg('entity.email','ketoan@gml.example');cfg('entity.bank','Vietcombank CN Đà Nẵng · STK 0000000000 · CT TNHH Global Multi Logistics');
let n=0;const doc=(id,dir,pid,cur,date,due,amt,extra)=>{w.T.DebtDoc.push(Object.assign({id,docNo:(dir==='AR'?'PT-2026-':'PC-2026-')+('000000'+(++n)).slice(-6),direction:dir,docType:'INVOICE',partnerId:pid,currency:cur,businessGroupCode:'G1',docDate:date,postingDate:date,status:'POSTED',totalGrossMinor:amt,isOpening:0,dueDate:due,expectedPayDate:'',invoiceNo:'HD'+n,invoiceSerial:'C26T',invoiceDate:date,createdAt:date+'T03:00:00.000Z',createdBy:'c',version:1,warningsJson:'',batchLabel:'',statusNote:''},extra||{}));w.T.DebtLine.push({id:'l_'+id,docId:id,lineNo:1,feeTypeCode:'F',description:dir==='AR'?'Cước vận chuyển + phí thủ tục hải quan':'Phí hãng tàu / vận tải nội địa',serviceCode:'FWD',netMinor:amt,grossMinor:amt,vatMinor:0,vatMode:'NONE'})};
doc('a1','AR','p1','VND','2026-09-10','2026-10-10',125000000);doc('a2','AR','p1','VND','2026-10-02','2026-11-01',84500000);doc('a3','AR','p2','VND','2026-08-15','2026-09-15',42300000);doc('a4','AR','p2','VND','2026-10-12','',17850000);doc('a5','AR','p2','USD','2026-10-05','2026-11-04',1850000);
doc('b1','AP','p3','VND','2026-09-20','2026-10-27',61200000);doc('b2','AP','p4','VND','2026-10-08','2026-11-07',18400000,{expectedPayDate:'2026-10-30'});doc('b3','AP','p3','USD','2026-10-01','2026-10-31',620000);
w.T.Payment.push({id:'y1',payNo:'PH-2026-000001',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:60000000,effectiveDate:'2026-10-05',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
w.T.Payment.push({id:'y2',payNo:'PH-2026-000002',direction:'IN',partnerId:'p2',currency:'VND',amountMinor:20000000,effectiveDate:'2026-10-20',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1},{id:'y3',payNo:'PC-2026-000001',direction:'OUT',partnerId:'p3',currency:'VND',amountMinor:5000000,effectiveDate:'2026-10-22',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
w.T.Allocation.push({id:'al1',paymentId:'y1',debtLineId:'l_a1',docId:'a1',amountMinor:60000000,effectiveDate:'2026-10-05'});
w.T.Order.push({id:'o1',orderNo:'DH-2026-001',poNo:'PO-8841',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'GML/FWD/YD-26/001'}]),serviceCode:'FWD',hsdvNo:'GML/FWD/YD-26/001',version:1},{id:'o2',orderNo:'DH-2026-002',poNo:'PO-9012',customerPartnerId:'p2',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-03',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'GML/FWD/KT-26/002'}]),serviceCode:'FWD',hsdvNo:'GML/FWD/KT-26/002',version:1});
const A=(id,o,k,n,x)=>w.T.Accrual.push(Object.assign({id,orderId:o,kind:k,partnerId:k==='REVENUE'?(o==='o1'?'p1':'p2'):'p3',accrualDate:'2026-10-01',feeTypeCode:'F',description:k==='REVENUE'?'Cước dịch vụ':'Chi phí NCC',netMinor:n,vatMode:'NONE',vatMinor:0,grossMinor:n,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1},x||{}));
A('r1','o1','REVENUE',125000000,{status:'INVOICED',docId:'a1'});A('c1','o1','COST',61200000,{status:'INVOICED',docId:'b1'});A('r2','o2','REVENUE',42300000);A('c2','o2','COST',18400000);A('r3','o2','REVENUE',9000000,{isPassThrough:1,feeTypeCode:'PASS_THROUGH'});A('c3','o2','COST',7000000,{isPassThrough:1,feeTypeCode:'PASS_THROUGH'});
const out={};[['R02',{asOf:'2026-10-25'}],['R07',{asOf:'2026-10-25'}],['R09',{asOf:'2026-10-25',from:'2026-09-01',to:'2026-10-25'}],['R12',{asOf:'2026-10-25'}],['R12W',{asOf:'2026-10-25',granularity:'WEEK'}],['R06',{asOf:'2026-10-25',partnerId:'p1'}]].forEach(([c,p])=>{const rep=w.ctx.reportRun_(full,{payload:{code:c.slice(0,3),params:p}});out[c]=w.ctx.reportLayout_(rep,'BẢN NHÁP – CHƯA CHỐT · in lúc 25/10/2026 09:30 · '+full.displayName)});
fs.writeFileSync(process.argv[2]||'layouts.json',J(out));console.log('đã dựng',Object.keys(out).join(','));
