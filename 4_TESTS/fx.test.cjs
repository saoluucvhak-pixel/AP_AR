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
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',e.message.split('\n')[0]);process.exitCode=1}}
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
suite('1. Quy đổi và phân tích tỷ giá: số nguyên ×10.000, làm tròn nửa lên, số âm đối xứng',()=>{
  const {c}=mk();
  eq(c.fxE4_('25350.5'),253505000);eq(c.fxE4_('25350'),253500000);eq(c.fxE4_('0'),0);eq(c.fxE4_('-1'),0);eq(c.fxE4_('25350,5'),0);eq(c.fxE4_('1.23456'),0);eq(c.fxE4_('abc'),0);
  eq(c.fxToBase_(60000,2,253505000),15210300,'600,00 USD × 25.350,5 = 15.210.300 VND');eq(c.fxToBase_(1,2,253505000),254,'0,01 USD → 253,505 → làm tròn 254');eq(c.fxToBase_(-1,2,253505000),-254);eq(c.fxToBase_(5,0,10000),5);
  eq(c.fxText_(253505000),'25.350,5');eq(c.fxText_(250000000),'25.000');eq(c.fxText_(0),'');
  const g=c.fxPickGoogle_([['2026-10-06',25100.1],['2026-10-08','25200,5'],['2026-10-12',99999],['x',1],['2026-10-07',0]],'2026-10-10');deq(g,{date:'2026-10-08',rateE4:252005000},'lấy phiên gần nhất không sau ngày yêu cầu, bỏ ngày sau và dòng lỗi');eq(c.fxPickGoogle_([],'2026-10-10'),null);
});
suite('2. Ưu tiên nguồn: nhập tay > bảng (nhập tay trước Google) > tự lấy Google Finance > báo thiếu',()=>{
  const {T,c}=mk();
  assert.throws(()=>c.fxResolve_(U,'USD','2026-10-10'),e=>e.code==='FX_RATE_MISSING'&&/Chưa có tỷ giá USD/.test(e.userMessage));steps++;
  eq(c.fxResolve_(U,'VND','2026-10-10'),null,'VND không cần tỷ giá');
  let calls=0;c.fxGoogle_=(cur,d)=>{calls++;return {date:'2026-10-09',rateE4:251000000}};
  const r1=c.fxResolve_(U,'USD','2026-10-10');eq(r1.e4,251000000);eq(r1.source,'GOOGLE');eq(T.FxRate.length,1,'lưu lại để lần sau không gọi Google');eq(T.FxRate[0].source,'GOOGLE');
  c.fxResolve_(U,'USD','2026-10-10');eq(calls,1,'lần 2 dùng bảng');
  c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'25300.25',note:'tay'}});
  const r2=c.fxResolve_(U,'USD','2026-10-10');eq(r2.e4,253002500);eq(r2.source,'MANUAL','nhập tay thắng Google cùng ngày');
  const r3=c.fxResolve_(U,'USD','2026-10-11','25400');eq(r3.e4,254000000);eq(r3.source,'MANUAL');eq(T.FxRate.filter(x=>x.rateDate==='2026-10-11').length,1,'tỷ giá nhập trên phiếu cũng lưu vào bảng theo ngày');
  assert.throws(()=>c.fxResolve_(U,'USD','2026-10-12','abc'),e=>e.code==='VALIDATION_FAILED');steps++;
  const f=c.fxFetch_(U,{payload:{currency:'USD',rateDate:'2026-10-10'}});eq(f.skipped,true,'không đè tỷ giá nhập tay');
  assert.throws(()=>{c.fxGoogle_=()=>null;c.fxFetch_(U,{payload:{currency:'USD',rateDate:'2026-10-20'}})},e=>e.code==='FX_FETCH_FAILED');steps++;
});
suite('3. fx.save kiểm tra dữ liệu, sửa lại cùng ngày thì cập nhật, cần quyền fx.write',()=>{
  const {T,c}=mk();
  const bad=p=>code(()=>c.fxSave_(U,{requestId:rid(),payload:p}));
  eq(bad({currency:'VND',rateDate:'2026-10-10',rate:'1'}),'VALIDATION_FAILED');eq(bad({currency:'USD',rateDate:'2026-13-10',rate:'1'}),'VALIDATION_FAILED');eq(bad({currency:'USD',rateDate:'2026-10-10',rate:'0'}),'VALIDATION_FAILED');eq(bad({currency:'USD',rateDate:'2027-12-10',rate:'1'}),'VALIDATION_FAILED','không nhập tỷ giá tương lai');
  const a=c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'25000'}}),b=c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'25100'}});
  eq(a.replaced,false);eq(b.replaced,true);eq(T.FxRate.length,1);eq(T.FxRate[0].rateE4,251000000);
  eq(code(()=>c.fxSave_({id:'x',role:'AUDITOR',email:'a'},{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'1'}})),'FORBIDDEN');
  const l=c.fxList_(U,{payload:{currency:'USD'}});eq(l.total,1);eq(l.items[0].rate,'25.100');
});
suite('4. Phiếu thu ngoại tệ lưu tỷ giá theo ngày thực thu và số VND; phiếu VND không có tỷ giá',()=>{
  const {T,c}=mk();c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'25500'}});
  const r=save(c,payIn());const p=T.Payment[0];eq(p.fxRateE4,255000000);eq(p.fxSource,'MANUAL');eq(p.amountBaseMinor,15300000,'600 USD × 25.500');
  const miss=code(()=>save(c,payIn({effectiveDate:'2026-10-12'})));eq(miss,'FX_RATE_MISSING','ngày chưa có tỷ giá và Google lỗi → báo thiếu');
  const own=save(c,payIn({effectiveDate:'2026-10-12',fxRate:'25600'}));eq(T.Payment[1].fxRateE4,256000000,'nhập tỷ giá ngay trên phiếu');
  c.fxResolve_(U,'VND','2026-10-10');
  const v=save(c,payIn({currency:'VND',amountMinor:1000,cashAccountCode:'Q1'}));eq(T.Payment[2].fxRateE4,0);eq(T.Payment[2].amountBaseMinor,1000);
  eq(c.payRowOut_(T.Payment[0],{payBal:{},pm:{p1:{shortName:'ABC'}}},{}).fxRate,'25.500');
});
const ALLP=['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill'];
function grant(T,ids){T.Config.push({id:'fx.entry.grants',value:JSON.stringify(ids)})}
function posted(T,c,dir,rateDoc,ratePay){
  c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-01',rate:rateDoc}});c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:ratePay}});
  save(c,dir==='IN'?payIn():payIn({direction:'OUT',partnerId:'p2'}));const p=T.Payment[T.Payment.length-1];p.status='POSTED';p.payNo='X'+p.id;return p;
}
suite('5. Chênh lệch tỷ giá đã thực hiện: thu (tăng giá = lãi), chi (tăng giá = lỗ), đảo phân bổ một phần',()=>{
  const {T,c}=mk(),p=posted(T,c,'IN','25000','25500');
  const res=c.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:p.id,items:[{debtLineId:'l1',amountMinor:60000}]}});
  eq(res.fxDiffBaseMinor,300000,'600 USD × (25.500 − 25.000) = +300.000 VND lãi');eq(res.fxMissing,0);
  const a=T.Allocation[0];deq([a.fxPayRateE4,a.fxDocRateE4,a.fxDiffBaseMinor],[255000000,250000000,300000]);
  const r=c.paymentReverseAllocation_(U,{requestId:rid(),payload:{allocationId:a.id,amountMinor:15000,effectiveDate:'2026-10-25'}});
  const rv=T.Allocation[1];eq(rv.amountMinor,-15000);eq(rv.fxDiffBaseMinor,-75000,'đảo 1/4 → đảo 1/4 chênh lệch');
  const {T:T2,c:c2}=mk(),p2=posted(T2,c2,'OUT','25000','25500');
  eq(c2.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:p2.id,items:[{debtLineId:'l2',amountMinor:60000}]}}).fxDiffBaseMinor,-300000,'phải trả: tỷ giá tăng → lỗ');
});
suite('6. Thiếu tỷ giá chứng từ cũ: vẫn phân bổ được, chênh lệch 0 và cảnh báo; tự lấy Google khi có',()=>{
  const {T,c}=mk();c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'25500'}});
  save(c,payIn());const p=T.Payment[0];p.status='POSTED';p.payNo='X1';
  const r=c.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:p.id,items:[{debtLineId:'l1',amountMinor:1000}]}});eq(r.fxDiffBaseMinor,0);eq(r.fxMissing,1);
  const {T:T2,c:c2}=mk();c2.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-10',rate:'25500'}});save(c2,payIn());const q=T2.Payment[0];q.status='POSTED';q.payNo='X2';
  c2.fxGoogle_=(cur,d)=>({date:d,rateE4:250000000});
  const r2=c2.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:q.id,items:[{debtLineId:'l1',amountMinor:1000}]}});eq(r2.fxMissing,0);eq(r2.fxDiffBaseMinor,fxd(c2,1000,255000000,250000000),'tự lấy Google cho ngày chứng từ');
});
function fxd(c,amt,pr,dr){return c.fxToBase_(amt,2,pr)-c.fxToBase_(amt,2,dr)}
suite('7. Báo cáo R13 (đã thực hiện) và R14 (quy đổi VND tại ngày chốt)',()=>{
  const {T,c}=mk(),p=posted(T,c,'IN','25000','25500');
  c.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:p.id,items:[{debtLineId:'l1',amountMinor:60000}]}});
  const run=(code,params)=>c.reportRun_(U,{payload:{code,params}});
  const r13=run('R13',{asOf:'2026-10-25',from:'2026-10-01',to:'2026-10-31'});
  const tot=r13.rows.find(r=>r.t==='total');eq(tot.cells.diff,300000);eq(r13.rows.filter(r=>r.t==='data').length,1);const d0=r13.rows[0].cells;deq([d0.docRate,d0.payRate,d0.amount],['25.000','25.500','600,00']);
  c.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);
  const r14=run('R14',{asOf:'2026-10-25'});
  const ar=r14.rows.find(r=>r.cells.dir==='Phải thu'),ap=r14.rows.find(r=>r.cells.dir==='Phải trả');
  eq(ar.cells.amount,'400,00','còn nợ 1.000 − 600 USD');eq(ar.cells.orig,10000000,'400 × 25.000');eq(ar.cells.now,10200000,'400 × 25.500 (tỷ giá gần nhất không sau ngày chốt)');eq(ar.cells.diff,200000);
  eq(ap.cells.diff,-(25500-25000)*1000,'phải trả 1.000 USD: tăng giá → lỗ');
  ok(r14.notes.some(n=>/tham khảo/.test(n)),'ghi chú nói rõ chỉ tham khảo');
  T.FxRate.length=0;const none=run('R14',{asOf:'2026-10-25'});ok(none.notes.some(n=>/Chưa có tỷ giá USD|thiếu tỷ giá/.test(n)),'trước ngày có tỷ giá thì báo thiếu thay vì bịa số');
});
suite('8. Lấy Google Finance (Sheet giả): đợi "Loading...", chọn phiên gần nhất, dọn tệp tạm, lỗi thì trả null',()=>{
  const {c}=mk();const src=SRC;const c2=vm.createContext(Object.assign({},{console,Logger:{log(){}}}));
  let trashed=0,flush=0,sleeps=0,formula='',seq=[[['Loading...']],[['Date','Close'],['2026-10-08',25200],['2026-10-09',25250]]],i=0;
  Object.assign(c2,{Utilities:{formatDate:()=>'2026-10-08',sleep:()=>{sleeps++},getUuid:()=>'u'},SpreadsheetApp:{create:()=>({getId:()=>'id1',getSheets:()=>[{getRange:()=>({setFormula:f=>{formula=f}}),getDataRange:()=>({getValues:()=>seq[Math.min(i++,seq.length-1)]})}]}),flush:()=>{flush++}},DriveApp:{getFileById:()=>({setTrashed:()=>{trashed++}})}});
  vm.runInContext(src,c2);
  const g=c2.fxGoogle_('USD','2026-10-10');deq(g,{date:'2026-10-09',rateE4:252500000});ok(/CURRENCY:USDVND/.test(formula)&&/"close"/.test(formula),formula);eq(sleeps,1,'đợi 1 lần khi còn Loading');eq(trashed,1,'xóa tệp tạm');
  seq=[[['#N/A']]];i=0;eq(c2.fxGoogle_('USD','2026-10-10'),null,'lỗi #N/A → null');eq(trashed,2,'lỗi vẫn dọn tệp tạm');
  eq(c2.fxGoogle_('usd; DROP','2026-10-10'),null,'mã tiền tệ lạ bị từ chối, không đưa vào công thức');
  c2.SpreadsheetApp.create=()=>{throw new Error('quota')};eq(c2.fxGoogle_('USD','2026-10-10'),null,'ngoại lệ → null, không chặn nghiệp vụ');
});
suite('9. Chứng từ tạo từ PO/Cost/XML: tự gắn tỷ giá khi ghi nhận; chạy bù cho chứng từ cũ',()=>{
  const {T,c}=mk();grant(T,{ap:ALLP});
  c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-01',rate:'25000'}});
  const d1=T.DebtDoc[0];eq(c.fxStampFields_(d1,T.FxRate).fxRateE4,250000000);eq(c.fxStampFields_(d1,T.FxRate).totalBaseMinor,25000000,'1.000 USD × 25.000');
  deq(c.fxStampFields_(Object.assign({},d1,{fxRateE4:1}),T.FxRate),{},'đã có tỷ giá thì không đè');deq(c.fxStampFields_(Object.assign({},d1,{currency:'VND'}),T.FxRate),{});
  T.DebtDoc.push(base({id:'d3',docNo:'D3',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'USD',businessGroupCode:'G1',docDate:'2026-10-03',postingDate:'2026-10-03',status:'POSTED',totalGrossMinor:500,isOpening:0}));
  let calls=[];c.fxGoogle_=(cur,d)=>{calls.push(d);return d==='2026-10-03'?{date:d,rateE4:251000000}:null};
  const r=c.fxBackfill_(U,{requestId:rid(),payload:{}});
  eq(r.stamped,3,'d1,d2 (ngày 10-01 đã có tỷ giá) + d3 (lấy Google ngày 10-03)');eq(T.DebtDoc.every(d=>d.fxRateE4>0),true);eq(calls.length,1,'chỉ tra Google cho ngày chưa có');eq(r.remaining,0);
  T.DebtDoc.push(base({id:'d4',docNo:'D4',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'USD',businessGroupCode:'G1',docDate:'2026-10-04',status:'POSTED',totalGrossMinor:1,isOpening:0}));
  const r2=c.fxBackfill_(U,{requestId:rid(),payload:{}});eq(r2.stamped,0);eq(r2.remaining,1);ok(/chưa có tỷ giá/.test(r2.message));
});
suite('10. Bảng kê GTGT: hóa đơn ngoại tệ quy đổi VND theo tỷ giá ngày hóa đơn; thiếu tỷ giá thì loại ra và ghi chú',()=>{
  const {T,c}=mk();
  T.Partner[0].taxCode='0101234567';
  const d=T.DebtDoc[0];Object.assign(d,{invoiceNo:'123',invoiceSerial:'1C26T',invoiceDate:'2026-10-05'});
  const l=T.DebtLine[0];Object.assign(l,{netMinor:100000,vatMode:'EXCLUSIVE',vatRateBp:1000,vatMinor:10000,grossMinor:110000});d.totalGrossMinor=110000;
  const run=()=>c.reportRun_(U,{payload:{code:'R10',params:{asOf:'2026-10-31',from:'2026-10-01',to:'2026-10-31'}}});
  let r=run();eq(r.rows.filter(x=>x.t==='data').length,0,'chưa có tỷ giá → không kê');ok(r.notes.some(n=>/chưa có tỷ giá/.test(n)));
  c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-05',rate:'25000'}});
  r=run();const row=r.rows.find(x=>x.t==='data');eq(row.cells.net,25000000,'1.000 USD × 25.000');eq(row.cells.vat,2500000,'100 USD × 25.000');ok(/USD 1\.100,00 × 25\.000/.test(row.cells.note),row.cells.note);
  eq(r.rows.find(x=>x.t==='total').cells.vat,2500000);ok(r.notes.some(n=>/quy đổi VND theo tỷ giá ngày hóa đơn/.test(n)));
  T.FxRate.length=0;d.fxRateE4=24000000*10;r=run();eq(r.rows.find(x=>x.t==='data').cells.vat,2400000,'không có tỷ giá ngày hóa đơn: dùng tỷ giá của chứng từ và ghi chú');ok(r.notes.some(n=>/dùng tỷ giá ngày chứng từ/.test(n)));
});
suite('11. Bút toán chênh lệch tỷ giá tháng: đã thực hiện + đánh giá lại cuối kỳ, duyệt khác người, tự đảo kỳ sau',()=>{
  const {T,c}=mk();grant(T,{ap:ALLP,ap2:ALLP});const p=posted(T,c,'IN','25000','25500');
  c.paymentAllocate_(U,{requestId:rid(),payload:{paymentId:p.id,items:[{debtLineId:'l1',amountMinor:60000}]}});
  c.todayVn_=()=>'2026-11-05';c.fxSave_(U,{requestId:rid(),payload:{currency:'USD',rateDate:'2026-10-31',rate:'25600'}});
  const pv=c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}});
  const re=pv.items.find(i=>i.entryType==='REALIZED'),un=pv.items.filter(i=>i.entryType==='UNREALIZED');
  eq(re.amountBaseMinor,300000);eq(re.currency,'USD');
  const ar=un.find(i=>i.direction==='AR'),ap=un.find(i=>i.direction==='AP'),cash=un.find(i=>i.direction==='CASH');eq(cash.amountBaseMinor,c.fxToBase_(60000,2,256000000)-c.fxToBase_(60000,2,255000000),'quỹ USD: 600 USD nhập 25.500, cuối kỳ 25.600 → lãi chưa thực hiện 60.000');
  eq(ar.amountBaseMinor,400*100*0+ (c.fxToBase_(40000,2,256000000)-c.fxToBase_(40000,2,250000000)),'phải thu còn 400 USD: (25.600 − 25.000) × 400');eq(ap.amountBaseMinor,-(c.fxToBase_(100000,2,256000000)-c.fxToBase_(100000,2,250000000)),'phải trả 1.000 USD: tăng giá → lỗ');
  c.fxEntryCreate_(U,{requestId:rid(),payload:{periodId:'2026-10'}});eq(T.FxEntry.length,4,'đã thực hiện + AR + AP + quỹ USD');eq(T.FxEntry.every(e=>e.status==='DRAFT'),true);
  c.fxEntryCreate_(U,{requestId:rid(),payload:{periodId:'2026-10'}});eq(T.FxEntry.filter(e=>!e.isDeleted).length,4,'tạo lại thay bản nháp cũ, không nhân đôi');
  const sig0=c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}}).draftSig;eq(code(()=>c.fxEntryPost_(U,{requestId:rid(),payload:{periodId:'2026-10',draftSig:sig0}})),'SELF_APPROVAL_FORBIDDEN','người lập không tự ghi nhận');
  const U2=Object.assign({},U,{id:'ap2'});T.FxEntry.forEach(e=>{e.createdBy='ap'});
  eq(code(()=>c.fxEntryPost_({id:'x',role:'ACCOUNTANT',email:'a',scope:{allPartners:true}},{requestId:rid(),payload:{periodId:'2026-10',draftSig:sig0}})),'FORBIDDEN','kế toán thường không có quyền ghi nhận');
  eq(c.fxEntryPost_(U2,{requestId:rid(),payload:{periodId:'2026-10',draftSig:sig0}}).posted,4);eq(T.FxEntry.filter(e=>!e.isDeleted).every(e=>e.status==='POSTED'),true);
  const pv2=c.fxEntryPreview_(U,{payload:{periodId:'2026-10'}});eq(pv2.items.filter(i=>i.entryType==='REALIZED').length,0,'đã ghi nhận thì không tạo lại phần đã thực hiện');
  const nv=c.fxEntryPreview_(U,{payload:{periodId:'2026-11'}});const rv=nv.items.filter(i=>i.entryType==='UNREALIZED_REVERSAL');eq(rv.length,3,'tháng sau tự đảo 3 bút toán đánh giá lại (AR, AP, quỹ)');eq(rv.reduce((t,x)=>t+x.amountBaseMinor,0),-(ar.amountBaseMinor+ap.amountBaseMinor+cash.amountBaseMinor));
  const first=T.FxEntry.find(e=>e.entryType==='UNREALIZED'&&e.status==='POSTED');c.fxEntryReverse_(U2,{requestId:rid(),payload:{id:first.id,ifVersion:first.version,reason:'sai tỷ giá'}});eq(first.status,'REVERSED');const rev=T.FxEntry.find(e=>e.entryType==='REVERSAL');eq(rev.amountBaseMinor,-first.amountBaseMinor);
  eq(code(()=>c.fxEntryReverse_(U2,{requestId:rid(),payload:{id:first.id,ifVersion:first.version,reason:'x'}})),'STATE_TRANSITION_INVALID');
  eq(code(()=>c.fxEntryPreview_(U,{payload:{periodId:'2026-13'}})),'VALIDATION_FAILED');
});
console.log('Tổng kiểm tra:',steps);
