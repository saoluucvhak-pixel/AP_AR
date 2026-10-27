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
const mkU=(id,role)=>({id,email:id+'@x.vn',role,scope:{allPartners:true}});
const maker=mkU('mk','ACCOUNTANT'),other=mkU('ot','ACCOUNTANT'),appr=mkU('ap','APPROVER');
const base=o=>Object.assign({version:1,isDeleted:0,createdAt:'2026-10-01T00:00:00Z'},o);
function mk(){const w=world('2026-10-25');w.T.DebtDoc.push(base({id:'d1',docNo:'D1',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',status:'REJECTED',createdBy:'mk',totalGrossMinor:100,docDate:'2026-10-05',rejectReason:'sai\nlý do'}));
 w.T.DebtLine.push(base({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',description:'x',netMinor:100,grossMinor:100,vatMinor:0,vatMode:'NONE'}));
 w.T.Payment.push(base({id:'y1',payNo:'P1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:5,status:'REJECTED',createdBy:'mk'}));return w}
suite('Chứng từ/phiếu bị từ chối: người lập được sửa + gửi lại, người duyệt được xóa',()=>{
  const w=mk(),c=w.ctx,d=w.T.DebtDoc[0],p=w.T.Payment[0];
  const A=(u)=>c.docActions_(u,d).sort(),P=(u)=>c.payActions_(u,p,0).sort();
  eq(J(A(maker)),J(['save','submit']),'người lập: sửa/gửi lại, KHÔNG xóa');
  eq(J(A(appr)),J(['delete']),'người duyệt: chỉ xóa');
  eq(J(A(other)),J([]),'người khác: không gì');
  eq(J(P(maker)),J(['save','submit']));eq(J(P(appr)),J(['delete']));eq(J(P(other)),J([]));
  eq(code(()=>call(w,'docDelete_',maker,{id:'d1'})),'FORBIDDEN','người lập không xóa được');
  eq(code(()=>call(w,'docSubmit_',appr,{id:'d1'})),'FORBIDDEN','người duyệt không gửi lại thay người lập');
  eq(code(()=>call(w,'payDelete_',maker,{id:'y1'})),'FORBIDDEN');
  eq(code(()=>call(w,'docDelete_',appr,{id:'d1'})),'OK');eq(d.status,'DELETED');
  eq(code(()=>call(w,'payDelete_',appr,{id:'y1'})),'OK');eq(p.status,'DELETED');
  // bản nháp thì giữ nguyên quy tắc cũ: người lập xóa được
  const w2=mk();w2.T.DebtDoc[0].status='DRAFT';eq(J(w2.ctx.docActions_(maker,w2.T.DebtDoc[0]).sort()),J(['delete','save','submit']));
});
console.log('Kiểm thử quyền bản bị từ chối:',steps,'khẳng định');
