// R36: công nợ theo đối tác phải thể hiện cả tiền thu/chi chưa phân bổ (ứng trước): R02/R03 có dòng ứng trước và số "gồm ứng trước"; Tổng hợp công nợ có cột còn nợ ròng. Dữ liệu giả.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(JSON.stringify(a),JSON.stringify(b),m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
function world(today){
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:()=>today},LockService:{getScriptLock:()=>({tryLock:()=>true,waitLock(){},releaseLock(){},hasLock:()=>true})},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null,setProperty(){},deleteProperty(){}})}});
  vm.runInContext(SRC,ctx);ctx.todayVn_=()=>today;
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('g','BUSINESS_GROUP','G1'),cat('f','FEE_TYPE','F')],Partner:[{id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1}],
    Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],Period:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  return {ctx,T};
}
const full={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
function setup(dir,payAmt,allocAmt,docAmt){
  const w=world('2026-10-23'),T=w.T,AR=dir==='AR';
  T.DebtDoc.push({id:'d1',docNo:'D1',direction:dir,docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-10-01',postingDate:'2026-10-01',dueDate:'2026-10-20',status:'POSTED',totalGrossMinor:docAmt,version:1});
  T.DebtLine.push({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',description:'x',netMinor:docAmt,grossMinor:docAmt,vatMinor:0,vatMode:'NONE'});
  T.Payment.push({id:'pay1',payNo:'P1',direction:AR?'IN':'OUT',partnerId:'p1',currency:'VND',amountMinor:payAmt,effectiveDate:'2026-10-02',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  if(allocAmt)T.Allocation.push({id:'al1',paymentId:'pay1',debtLineId:'l1',docId:'d1',partnerId:'p1',currency:'VND',amountMinor:allocAmt,effectiveDate:'2026-10-10',status:'ACTIVE'});
  return w;
}
const rows=(w,fn,code)=>[...w.ctx[fn](full,code,{asOf:'2026-10-23'}).rows].map(r=>({t:r.t,...r.cells}));
suite('1. R02: thu 500, phân bổ 400 → dòng chứng từ giữ 400; cuối đối tác có dòng ứng trước 100 và số "đã thu gồm ứng trước" 500, còn phải thu 500',()=>{
  const r=rows(setup('AR',500,400,1000),'rep02_','R02'),doc=r.find(x=>x.t==='data'&&x.docNo==='D1');eq([doc.gross,doc.settled,doc.out],[1000,400,600],'theo chứng từ vẫn 400');
  const sub=r.filter(x=>x.t==='subtotal');eq([sub[0].desc,sub[0].settled,sub[0].out],['Cộng ABC',400,600]);const adv=r.find(x=>x.t==='data'&&/ứng trước/.test(x.desc||''));eq([adv.settled,adv.out],[100,-100]);
  eq([sub[1].desc,sub[1].gross,sub[1].settled,sub[1].out],['Cộng ABC – đã thu gồm ứng trước',1000,500,500],'theo khách hàng: 500');
  const tot=r.filter(x=>x.t==='total');eq([tot[0].desc,tot[0].settled,tot[0].out],['TỔNG CỘNG',400,600]);eq([tot[1].desc,tot[1].settled,tot[1].out],['TỔNG CỘNG – đã thu gồm ứng trước',500,500]);
});
suite('2. R03 (phải trả): chi 500, phân bổ 400 → "đã trả gồm ứng trước" 500, còn phải trả 500',()=>{
  const r=rows(setup('AP',500,400,1000),'rep02_','R03'),sub=r.filter(x=>x.t==='subtotal');eq([sub[1].desc,sub[1].settled,sub[1].out],['Cộng ABC – đã trả gồm ứng trước',500,500]);ok(r.some(x=>/trả trước/.test(x.desc||'')),'dòng trả trước');
});
suite('3. Không có tiền chưa phân bổ (phân bổ đủ) hoặc phiếu khác chiều → không thêm dòng nào',()=>{
  const a=rows(setup('AR',400,400,1000),'rep02_','R02');ok(!a.some(x=>/ứng trước/.test(x.desc||'')),'phân bổ đủ: không có dòng ứng trước');eq(a.filter(x=>x.t==='subtotal').length,1);eq(a.filter(x=>x.t==='total').length,1);
  const w=setup('AR',400,400,1000);w.T.Payment.push({id:'pay2',payNo:'P2',direction:'OUT',partnerId:'p1',currency:'VND',amountMinor:300,effectiveDate:'2026-10-03',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  ok(!rows(w,'rep02_','R02').some(x=>/ứng trước/.test(x.desc||'')),'phiếu chi chưa phân bổ không tính vào công nợ phải thu');
});
suite('4. Tổng hợp công nợ theo đối tác: net = còn nợ theo chứng từ − tiền chưa phân bổ (có thể âm)',()=>{
  const items=w=>{w.ctx.rmServe_=()=>({value:w.ctx.rmBuild_('PARTNERS','2026-10-23')});w.ctx.rmMeta_=()=>({});return w.ctx.summaryPartners_(full,{payload:{}}).items.find(x=>x.partnerId==='p1')};
  const it=items(setup('AR',500,400,1000));eq(it.AR.VND.out,600);eq(it.adv.AR.VND,100);eq(it.net.AR.VND,500,'ròng 500');
  const i2=items(setup('AR',900,100,500));eq(i2.net.AR.VND,400-800,'còn nợ 400, ứng trước 800 → âm 400');
  const i3=items(setup('AR',400,400,1000));eq(i3.net.AR.VND,600,'không có ứng trước: ròng = còn nợ');
});
console.log('Tổng kiểm tra:',steps);
