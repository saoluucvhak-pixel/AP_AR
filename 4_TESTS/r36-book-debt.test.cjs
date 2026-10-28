// R36: công nợ tổng thể QUY ĐỔI VND theo GIÁ TRỊ GHI SỔ (tỷ giá ĐÃ LƯU trên từng chứng từ/phiếu, không dùng tỷ giá ngày chốt): lõi, bảng tổng hợp theo đối tác, Tổng quan, R01/R02/R07. Dữ liệu giả.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(JSON.stringify(a),JSON.stringify(b),m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
function world(withFx){
  const today='2026-10-23';
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:()=>today},LockService:{getScriptLock:()=>({tryLock:()=>true,waitLock(){},releaseLock(){},hasLock:()=>true})},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null,setProperty(){},deleteProperty(){}})}});
  vm.runInContext(SRC,ctx);ctx.todayVn_=()=>today;
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','CURRENCY','USD',{decimals:2}),cat('g','BUSINESS_GROUP','G1'),cat('f','FEE_TYPE','F')],Partner:[{id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1}],
    Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],Period:[],FxRate:[{id:'fx1',currency:'USD',rateDate:'2026-10-01',rateE4:252000,source:'MANUAL',version:1}],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  const doc=(id,dir,cur,amt,o)=>{T.DebtDoc.push(Object.assign({id,docNo:id.toUpperCase(),direction:dir,docType:'INVOICE',partnerId:'p1',currency:cur,businessGroupCode:'G1',docDate:'2026-10-01',postingDate:'2026-10-01',status:'POSTED',totalGrossMinor:amt,version:1},o||{}));T.DebtLine.push({id:'l'+id.slice(1),docId:id,lineNo:1,feeTypeCode:'F',description:'x',netMinor:amt,grossMinor:amt,vatMinor:0,vatMode:'NONE'})};
  // AR USD 1.000,00 tỷ giá 25,30 (đã thu 400,00); AR VND 5.000.000; AP USD 500,00 tỷ giá 25,40; AR USD cũ không lưu tỷ giá (dùng bảng tỷ giá theo ngày chứng từ 25,20); AR USD thiếu tỷ giá hoàn toàn
  doc('d1','AR','USD',100000,{fxRateE4:253000,dueDate:'2026-10-20'});doc('d2','AR','VND',5000000);doc('d3','AP','USD',50000,{fxRateE4:254000});doc('d4','AR','USD',20000,{dueDate:'2026-10-30'});doc('d5','AR','USD',30000,{docDate:'2026-10-02',postingDate:'2026-10-02'});
  T.Payment.push({id:'pay1',payNo:'P1',direction:'IN',partnerId:'p1',currency:'USD',amountMinor:50000,effectiveDate:'2026-10-02',method:'BANK',cashAccountCode:'Q1',status:'POSTED',fxRateE4:253000,amountBaseMinor:12650,version:1});
  T.Allocation.push({id:'al1',paymentId:'pay1',debtLineId:'l1',docId:'d1',partnerId:'p1',currency:'USD',amountMinor:40000,effectiveDate:'2026-10-03',status:'ACTIVE'});
  return {ctx,T};
}
const full={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}},ASOF='2026-10-23';
const led=w=>w.ctx.loadLedger_(full,ASOF);
const rows=(r)=>[...r.rows].map(x=>({t:x.t,cur:x.currency,...x.cells}));
const EXP={ARout:15180+5000000+5040,ADV:2530,APout:12700};
suite('1. Lõi: VND giữ nguyên; USD theo tỷ giá lưu trên chứng từ; chứng từ cũ dùng bảng tỷ giá theo ngày chứng từ; thiếu tỷ giá → null; phiếu ứng trước theo số VND đã lưu (chia theo tỷ lệ)',()=>{
  const w=world(),c=w.ctx,bc=c.bookCtx_(),d=id=>w.T.DebtDoc.find(x=>x.id===id);
  eq(c.bookOfLine_(bc,d('d2'),5000000),5000000);eq(c.bookOfLine_(bc,d('d1'),60000),15180,'600,00 USD × 25,30');eq(c.bookOfLine_(bc,d('d4'),20000),5040,'200,00 USD × 25,20 (bảng tỷ giá)');eq(c.bookOfLine_(bc,d('d5'),30000),null,'thiếu tỷ giá');
  eq(c.bookOfAdv_(bc,w.T.Payment[0],10000),2530,'100,00 / 500,00 × 12.650');eq(c.bookOfAdv_(bc,Object.assign({},w.T.Payment[0],{amountBaseMinor:0}),10000),2530,'không có số VND đã lưu: theo tỷ giá phiếu');eq(c.bookOfAdv_(bc,Object.assign({},w.T.Payment[0],{amountBaseMinor:0,fxRateE4:0,effectiveDate:'2026-01-05'}),10000),null,'thiếu tỷ giá');
});
suite('2. bookDebtTotals_: phải thu/phải trả/ứng trước/ròng quy đổi VND, chi tiết từng tiền tệ, đếm dòng thiếu tỷ giá; bộ lọc đối tác/tiền tệ',()=>{
  const w=world(),t=w.ctx.bookDebtTotals_(led(w),{});
  eq([t.AR.out,t.AR.adv,t.AR.net],[EXP.ARout,EXP.ADV,EXP.ARout-EXP.ADV]);eq([t.AP.out,t.AP.adv,t.AP.net],[EXP.APout,0,EXP.APout]);eq(t.net,EXP.ARout-EXP.ADV-EXP.APout,'ròng = phải thu − phải trả');eq(t.missing,1,'d5 thiếu tỷ giá');eq(t.currency,'VND');
  eq(t.AR.byCur.USD,{out:60000+20000,outB:15180+5040,adv:10000,advB:2530},'USD: nguyên tệ và quy đổi');eq(t.AR.byCur.VND,{out:5000000,outB:5000000,adv:0,advB:0});
  const u=w.ctx.bookDebtTotals_(led(w),{currency:'USD'});eq([u.AR.out,u.AP.out],[15180+5040,12700],'lọc tiền tệ USD');eq(w.ctx.bookDebtTotals_(led(w),{partnerId:'khong-co'}).AR.out,0,'lọc đối tác khác');
});
suite('3. Bảng tổng hợp theo đối tác (PARTNERS) và Tổng hợp công nợ: có số quy đổi theo từng nhóm hạn; bản dựng cũ → bookReady=false',()=>{
  const w=world(),c=w.ctx,model=c.rmBuild_('PARTNERS',ASOF);c.rmServe_=()=>({value:model});c.rmMeta_=()=>({});
  const s=c.summaryPartners_(full,{payload:{}}),it=s.items.find(x=>x.partnerId==='p1');eq(s.bookReady,true);
  eq(it.base.AR,{out:EXP.ARout,overdue:15180,due7:5040,missing:5000000,adv:EXP.ADV,net:EXP.ARout-EXP.ADV,miss:1},'AR quy đổi theo nhóm hạn');eq(it.base.AP.out,EXP.APout);
  eq([s.book.AR.out,s.book.net],[EXP.ARout,EXP.ARout-EXP.ADV-EXP.APout],'tổng toàn đối tác');
  const old=model.map(r=>{const x=Object.assign({},r);['outB','overdueB','due7B','missingB','creditB','baseMiss','amtB'].forEach(k=>delete x[k]);return x});c.rmServe_=()=>({value:old});eq(c.summaryPartners_(full,{payload:{}}).bookReady,false,'bản dựng của phiên bản cũ');
});
suite('4. Tổng quan: dashboard.summary có bookTotals khớp lõi (và lọc theo đối tác)',()=>{
  const w=world(),c=w.ctx,d=c.dashboardSummaryLive_(full,{payload:{asOf:ASOF}}),t=c.bookDebtTotals_(led(w),{});eq([d.bookTotals.AR.out,d.bookTotals.AP.out,d.bookTotals.net,d.bookTotals.missing],[t.AR.out,t.AP.out,t.net,t.missing]);
  eq(c.dashboardSummaryLive_(full,{payload:{asOf:ASOF,partnerId:'khong-co'}}).bookTotals.AR.out,0);
});
suite('5. R01: khối "Quy đổi VND" (tổng, đã thu, còn lại), ứng trước và công nợ ròng; chú thích thiếu tỷ giá; chỉ VND thì không có khối',()=>{
  const w=world(),r=w.ctx.rep01_(full,'R01',{asOf:ASOF}),R=rows(r),g=R.findIndex(x=>x.t==='group'&&/^Quy đổi VND/.test(x.stt||''));ok(g>0,'có khối quy đổi, nhãn ở cột đầu');const sec=R.slice(g);
  const ar=sec.find(x=>x.t==='total'&&x.label==='TỔNG PHẢI THU QUY ĐỔI VND');eq([ar.gross,ar.settled,ar.out],[25300+5000000+5040,10120,EXP.ARout],'đã thu quy đổi = tổng − còn lại');eq(sec.find(x=>x.t==='total'&&x.label==='TỔNG PHẢI TRẢ QUY ĐỔI VND').out,EXP.APout);
  eq(sec.find(x=>x.t==='data'&&/ứng trước/.test(x.label||'')).out,-EXP.ADV,'ứng trước');eq(sec.find(x=>/CÔNG NỢ RÒNG/.test(x.label||'')).out,EXP.ARout-EXP.ADV-EXP.APout);
  ok(r.notes.some(n=>/^1 dòng\/phiếu chưa có tỷ giá ghi nhận/.test(n)),'báo thiếu tỷ giá');ok(R.slice(0,g).every(x=>!/QUY ĐỔI/.test(x.label||'')),'phần từng tiền tệ phía trên không bị đụng');
  const v=world();v.T.DebtDoc=v.T.DebtDoc.filter(x=>x.currency==='VND');v.T.DebtLine=v.T.DebtLine.filter(x=>x.docId==='d2');v.T.Allocation.length=0;v.T.Payment.length=0;ok(!rows(v.ctx.rep01_(full,'R01',{asOf:ASOF})).some(x=>/^Quy đổi VND/.test(x.stt||'')),'chỉ VND: không có khối');
});
suite('6. R02: khối "Quy đổi VND" theo đối tác (gồm mọi tiền tệ), dòng tổng, ứng trước và "gồm ứng trước"; R03 tương tự cho phải trả',()=>{
  const w=world(),R=rows(w.ctx.rep02_(full,'R02',{asOf:ASOF})),g=R.findIndex(x=>x.t==='group'&&/^Quy đổi VND/.test(x.stt||''));ok(g>0);const sec=R.slice(g),row=sec.find(x=>x.t==='data'&&x.desc==='ABC');eq([row.gross,row.settled,row.out],[25300+5000000+5040,10120,EXP.ARout]);
  const tot=sec.filter(x=>x.t==='total');eq([tot[0].desc,tot[0].out],['TỔNG QUY ĐỔI VND',EXP.ARout]);eq([tot[1].desc,tot[1].settled,tot[1].out],['TỔNG QUY ĐỔI VND – đã thu gồm ứng trước 2.530 VND',10120+EXP.ADV,EXP.ARout-EXP.ADV]);ok(!sec.some(x=>x.t==='data'&&/ứng trước/.test(x.desc||'')),'một dòng ứng trước, không lặp');eq(sec.filter(x=>x.t==='data').map(x=>x.stt),[1],'đánh số lại từ 1 trong khối quy đổi');
  const ap=rows(w.ctx.rep02_(full,'R03',{asOf:ASOF})),ga=ap.findIndex(x=>x.t==='group'&&/^Quy đổi VND/.test(x.stt||''));ok(ga>0);eq(ap.slice(ga).find(x=>x.t==='total').out,EXP.APout);
});
suite('7. R07: khối "Quy đổi VND" theo nhóm tuổi nợ: tổng các nhóm = tổng; khớp lõi',()=>{
  const w=world(),R=rows(w.ctx.rep07_(full,'R07',{asOf:ASOF})),g=R.findIndex(x=>x.t==='group'&&/^QUY ĐỔI VND/.test(x.partner||''));ok(g>0);const sec=R.slice(g),tot=sec.find(x=>x.t==='total'&&/PHẢI THU QUY ĐỔI/.test(x.partner));
  eq(tot.total,EXP.ARout);eq(['NOT_DUE','D1_30','D31_60','D61_90','D90P','MISSING_DUE'].reduce((s,k)=>s+(tot[k]||0),0),EXP.ARout,'các nhóm cộng lại = tổng');eq(sec.find(x=>x.t==='total'&&/PHẢI TRẢ QUY ĐỔI/.test(x.partner)).total,EXP.APout);
});
suite('8. Cùng một con số ở mọi nơi: lõi = Tổng quan = Tổng hợp công nợ = R01 = R02 = R07 (phải thu còn nợ quy đổi)',()=>{
  const w=world(),c=w.ctx,core=c.bookDebtTotals_(led(w),{}).AR.out;c.rmServe_=()=>({value:c.rmBuild_('PARTNERS',ASOF)});c.rmMeta_=()=>({});
  const vals=[c.dashboardSummaryLive_(full,{payload:{asOf:ASOF}}).bookTotals.AR.out,c.summaryPartners_(full,{payload:{}}).book.AR.out,
    rows(c.rep01_(full,'R01',{asOf:ASOF})).find(x=>x.label==='TỔNG PHẢI THU QUY ĐỔI VND').out,rows(c.rep02_(full,'R02',{asOf:ASOF})).find(x=>x.desc==='TỔNG QUY ĐỔI VND').out,rows(c.rep07_(full,'R07',{asOf:ASOF})).find(x=>/PHẢI THU QUY ĐỔI/.test(x.partner||'')&&x.t==='total').total];
  vals.forEach(v=>eq(v,core));
});
console.log('Tổng kiểm tra:',steps);
