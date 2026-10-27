// R35: các quyết định chính sách của kế toán trưởng (26/10/2026): 1B chặn chi vượt quỹ TIỀN MẶT · 2B chênh lệch làm tròn dồn vào phiếu cuối · 3B kỳ khóa: không tính lại một phần · 5B chênh lệch tỷ giá bù trừ thu hộ/chi hộ vào lãi/lỗ đã thực hiện · 6A khoản hộ không chịu thuế · 7B thừa kiểm kê ngoại tệ nhập theo bình quân · 8A hủy đơn đang bù trừ vẫn chặn.
// Dữ liệu giả, KHÔNG phải Google thật. Chạy với Backend R3.4 (BACKEND_SRC) thì các ca phải THẤT BẠI.
const assert=require('assert'),path=require('path'),fs=require('fs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
// helper của fx-pool.test.cjs (cắt đến hết world5) và passthrough.test.cjs (cắt trước nhóm 1)
const head=fs.readFileSync(path.join(__dirname,'fx-pool.test.cjs'),'utf8'),w5=head.indexOf('function world5()'),cut=head.indexOf('\n',w5)+1;
const mod={};new Function('require','__dirname','process','module','console',head.slice(0,cut).replace(/function suite\(name,fn\)\{[^\n]*\n/,'function suite(){}\n').concat('\nmodule.exports={mk,world,save,payIn,OUT,pay,world2,world3,world4,world5,RATE,XF,EX,VP,U,U2,rid,code};'))(require,__dirname,process,mod,console);
const H=mod.exports;
const ph=fs.readFileSync(path.join(__dirname,'passthrough.test.cjs'),'utf8'),pcut=ph.indexOf("suite('1. Danh sách chỉ gồm khoản hộ");
const pm={};new Function('require','__dirname','process','module','console',ph.slice(0,pcut).replace(/function suite\(name,fn\)\{[^\n]*\n/,'function suite(){}\n').concat('\nmodule.exports={mk,LK,U,ACC,rid,A:(id,k,pid,oid,n,x)=>base(Object.assign({id,orderId:oid,kind:k,partnerId:pid,accrualDate:"2026-09-01",feeTypeCode:"F",description:"d"+id,netMinor:n,vatMode:"NONE",vatMinor:0,grossMinor:n,isPassThrough:1,currency:"VND",status:"OPEN"},x||{}))};'))(require,__dirname,process,pm,console);
const P=pm.exports;
const setType=(T,code,type)=>{const c=T.Catalog.find(x=>x.code===code);const a=JSON.parse(c.attrsJson);a.type=type;c.attrsJson=JSON.stringify(a)};
const snap=T=>JSON.stringify([T.Payment,T.CashTransfer||[],T.CashExchange||[],T.Allocation]);

suite('1B-a. Quỹ tiền mặt USD: phiếu chi vượt số dư bị chặn (CASH_OVERDRAFT), không đổi dữ liệu; quỹ ngân hàng giữ cách cũ (tạm ghi theo tỷ giá ngày)',()=>{
  const {T,c}=H.world2();setType(T,'QU','CASH');H.pay(c,T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');  // 1000 + 500 = 1.500 USD
  const s0=snap(T);
  eq(H.code(()=>H.pay(c,T,H.OUT({amountMinor:160000,effectiveDate:'2026-10-12'}),'PC-BIG')),'CASH_OVERDRAFT');
  const bad=T.Payment.find(x=>x.payNo==='PC-BIG');ok(!bad||bad.status!=='POSTED','phiếu vượt quỹ không được ghi nhận');
  eq(H.code(()=>H.pay(c,T,H.OUT({amountMinor:150000,effectiveDate:'2026-10-12'}),'PC-OK')),'OK','chi đúng bằng số dư vẫn được');
  const b=H.world2();setType(b.T,'QU','BANK');H.pay(b.c,b.T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');
  eq(H.code(()=>H.pay(b.c,b.T,H.OUT({amountMinor:160000,effectiveDate:'2026-10-12'}),'PC-BIG')),'OK','quỹ ngân hàng: không chặn (tạm ghi theo tỷ giá ngày)');
});
suite('1B-b. Chi lùi ngày làm các lần chi sau vượt quỹ cũng bị chặn',()=>{
  const {T,c}=H.world2();setType(T,'QU','CASH');H.pay(c,T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');
  eq(H.code(()=>H.pay(c,T,H.OUT({amountMinor:140000,effectiveDate:'2026-10-15'}),'PC1')),'OK');   // còn 100 USD
  eq(H.code(()=>H.pay(c,T,H.OUT({amountMinor:20000,effectiveDate:'2026-10-12'}),'PC2')),'CASH_OVERDRAFT','chi 200 USD ngày 12 khiến lần chi ngày 15 thiếu quỹ');
});
suite('1B-c. Quỹ tiền mặt VND: chi vượt bị chặn; mua ngoại tệ trả VND vượt quỹ bị chặn; quỹ ngân hàng VND không chặn',()=>{
  const {T,c}=H.world5();setType(T,'Q1','CASH');
  eq(H.code(()=>H.VP(c,T,H.OUT({amountMinor:60000000,effectiveDate:'2026-10-15'}),'VC-BIG')),'CASH_OVERDRAFT');
  eq(H.code(()=>H.VP(c,T,H.OUT({amountMinor:1000000,effectiveDate:'2026-10-15'}),'VC-OK')),'OK');
  const d=H.EX(c,H.U,{kind:'BUY',foreignMinor:1000000,baseMinor:260000000,effectiveDate:'2026-10-16'});c.exchPost_;
  eq(H.code(()=>c.exchPost_(H.U2,{requestId:H.rid(),payload:{id:d.id}})),'CASH_OVERDRAFT','mua ngoại tệ trả VND vượt quỹ tiền mặt');
  const b=H.world5();setType(b.T,'Q1','BANK');eq(H.code(()=>H.VP(b.c,b.T,H.OUT({amountMinor:60000000,effectiveDate:'2026-10-15'}),'VC-BIG')),'OK','ngân hàng VND: giữ cách cũ');
});
suite('1B-d. Chuyển quỹ và bán ngoại tệ vượt số dư quỹ tiền mặt nguồn bị chặn khi ghi nhận',()=>{
  const {T,c}=H.world3();setType(T,'QU','CASH');   // 1.000 + 500 = 1.500 USD
  const x=H.XF(c,H.U,{amountMinor:200000});eq(H.code(()=>c.xferPost_(H.U2,{requestId:H.rid(),payload:{id:x.id}})),'CASH_OVERDRAFT');eq(T.CashTransfer.find(t=>t.id===x.id).status,'DRAFT','nháp vẫn là nháp');
  const x2=H.XF(c,H.U,{amountMinor:40000});eq(H.code(()=>c.xferPost_(H.U2,{requestId:H.rid(),payload:{id:x2.id}})),'OK');
  const w=H.world4();setType(w.T,'QU','CASH');H.pay(w.c,w.T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');
  const e=H.EX(w.c,H.U,{kind:'SELL',foreignMinor:250000,baseMinor:50000000});eq(H.code(()=>w.c.exchPost_(H.U2,{requestId:H.rid(),payload:{id:e.id}})),'CASH_OVERDRAFT','bán nhiều hơn tồn quỹ');
});
suite('2B. Chênh lệch làm tròn của bình quân không tồn đọng: chi hết quỹ thì phiếu cuối nhận đúng phần còn lại (số dư VND về 0)',()=>{
  const {T,c}=H.world2();H.pay(c,T,H.payIn({amountMinor:33333,effectiveDate:'2026-10-10'}),'PT1');
  H.pay(c,T,H.OUT({amountMinor:50001,effectiveDate:'2026-10-12'}),'PC1');H.pay(c,T,H.OUT({amountMinor:50001,effectiveDate:'2026-10-15'}),'PC2');
  H.pay(c,T,H.OUT({amountMinor:33333+100000-50001-50001,effectiveDate:'2026-10-20'}),'PC3');
  const a=c.fxPoolRun_(null,null).accounts.QU;eq(a.balF,0);eq(a.balB,0,'phần dư làm tròn dồn hết vào phiếu chi cuối');
});
suite('3B. Tính lại bình quân khi có phiếu bị ảnh hưởng trong kỳ đã khóa: từ chối cả lượt (PERIOD_CLOSED), không đổi dữ liệu; mở khóa thì tính lại được',()=>{
  const {T,c}=H.world2();H.pay(c,T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');H.pay(c,T,H.OUT({amountMinor:60000,effectiveDate:'2026-10-12'}),'PC1');H.pay(c,T,H.payIn({amountMinor:20000,effectiveDate:'2026-10-05'}),'PT0');
  T.Period.push({id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'CLOSED',version:1});const s0=snap(T);
  eq(H.code(()=>c.fxPoolRecalc_(H.U,{requestId:H.rid(),payload:{}})),'PERIOD_CLOSED');eq(snap(T),s0);
  T.Period.length=0;eq(c.fxPoolRecalc_(H.U,{requestId:H.rid(),payload:{}}).changed,1);
});
suite('5B. Bù trừ thu hộ/chi hộ ngoại tệ khác ngày: chênh lệch tỷ giá lưu trên bản ghép và vào bút toán chênh lệch đã thực hiện (chiều PASS); gỡ ghép thì bỏ',()=>{
  const {c,T}=P.mk();T.FxRate=[{id:'f1',rateDate:'2026-09-01',currency:'USD',rateE4:240000000,source:'MANUAL',version:1,isDeleted:0},{id:'f2',rateDate:'2026-09-10',currency:'USD',rateE4:250000000,source:'MANUAL',version:1,isDeleted:0}];
  T.Accrual.push(P.A('cu','COST','p2','o1',10000,{currency:'USD',accrualDate:'2026-09-10'}),P.A('ru','REVENUE','p1','o1',10000,{currency:'USD',accrualDate:'2026-09-01'}));
  const lk=P.LK(c,P.U,{costAccrualId:'cu',revenueAccrualId:'ru'});eq(lk.amountMinor,10000);
  const row=T.PassLink.find(l=>l.id===lk.id);eq(row.costRateE4,250000000);eq(row.revRateE4,240000000);eq(row.fxDiffBaseMinor,c.fxToBase_(10000,2,240000000)-c.fxToBase_(10000,2,250000000),'−100 USD×(25.000−24.000) = −100.000 VND (lỗ)');eq(row.fxDiffBaseMinor,-100000);
  const it=c.fxPeriodItems_('2026-10').items.filter(i=>i.direction==='PASS');eq(it.length,1);eq(it[0].entryType,'REALIZED');eq(it[0].amountBaseMinor,-100000);eq(it[0].currency,'USD');
  c.passUnlink_(P.U,{requestId:H.rid(),payload:{id:lk.id}});eq(c.fxPeriodItems_('2026-10').items.filter(i=>i.direction==='PASS').length,0,'gỡ ghép: không còn chênh lệch');
  // VND: không có chênh lệch tỷ giá
  const v=P.LK(c,P.U,{costAccrualId:'c1',revenueAccrualId:'r2'});eq(T.PassLink.find(l=>l.id===v.id).fxDiffBaseMinor||0,0);
  // thiếu tỷ giá: ghi 0 + cảnh báo, không chặn
  T.FxRate.length=0;const m=P.LK(c,P.U,{costAccrualId:'cu',revenueAccrualId:'ru'});ok(/Thiếu tỷ giá/.test(m.warning),'cảnh báo thiếu tỷ giá');eq(m.fxDiffBaseMinor,0);
});
suite('6A. Khoản thu hộ/chi hộ không chịu thuế: chỉ nhận vatMode NONE (EXCLUSIVE/UNCONFIRMED bị từ chối)',()=>{
  const {c,T}=P.mk();T.Order.forEach(o=>o.serviceCode='FWD');const a=T.Accrual.find(x=>x.id==='r2');
  const sv=o=>c.accrualSave_(P.U,{requestId:P.rid(),payload:Object.assign({id:a.id,ifVersion:a.version,orderId:a.orderId,allocMode:'ORDER',kind:a.kind,partnerId:a.partnerId,accrualDate:a.accrualDate,feeTypeCode:'F',description:a.description,netMinor:a.grossMinor,vatMode:'NONE',vatRateBp:null,currency:a.currency,isPassThrough:1,serviceCode:'FWD'},o||{})});
  eq(code(()=>sv({vatMode:'EXCLUSIVE',vatRateBp:1000})),'VALIDATION_FAILED');eq(code(()=>sv({vatMode:'UNCONFIRMED'})),'VALIDATION_FAILED');eq(code(()=>sv({})),'OK');
});
suite('7B. Thừa kiểm kê quỹ ngoại tệ nhập theo tỷ giá BÌNH QUÂN của quỹ (không lãi/lỗ), không cần tỷ giá ngày; biên bản cũ có tỷ giá đã lưu giữ nguyên',()=>{
  const {T,c}=H.world4();const CS=p=>c.countSave_(H.U,{requestId:H.rid(),payload:Object.assign({account:'QU',countDate:'2026-10-20'},p)});
  const before=c.fxPoolRun_(null,'2026-10-20').accounts.QU;const avg=c.fxAvgE4_(before.balB,before.balF,before.decimals);
  const su=CS({countedMinor:before.balF+10000,reason:'Thừa 100 USD'});c.countConfirm_(H.U2,{requestId:H.rid(),payload:{id:su.id}});c.countAdjust_(H.U2,{requestId:H.rid(),payload:{id:su.id,kind:'EXPENSE',note:'x'}});
  const cc=T.CashCount.find(x=>x.id===su.id);eq(cc.adjustRateE4,0,'không lưu tỷ giá ngày');
  const ev=c.fxPoolRun_(null,'2026-10-31').accounts.QU.events.find(e=>e.direction==='AIN');eq(ev.baseMinor,c.fxToBase_(10000,2,avg),'nhập theo bình quân');
  cc.adjustRateE4=260000000;const ev2=c.fxPoolRun_(null,'2026-10-31').accounts.QU.events.find(e=>e.direction==='AIN');eq(ev2.baseMinor,c.fxToBase_(10000,2,260000000),'biên bản đã xử lý trước R35 giữ tỷ giá đã lưu');
});
suite('9. (chị chốt 27/10) Đảo phiếu thu / chuyển quỹ nhận / bán ngoại tệ / xử lý thừa kiểm kê làm quỹ TIỀN MẶT âm hoặc vượt quỹ bị chặn; đảo bình thường vẫn được; quỹ ngân hàng không chặn',()=>{
  const REV=(c,id)=>c.payReverse_(H.U2,{requestId:H.rid(),payload:{id,reason:'nhầm'}});
  // phiếu thu USD
  let {T,c}=H.world2();setType(T,'QU','CASH');const pt=H.pay(c,T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');
  H.pay(c,T,H.OUT({amountMinor:140000,effectiveDate:'2026-10-15'}),'PC1');   // 1.000 + 500 − 1.400 = 100
  const s0=snap(T);eq(H.code(()=>REV(c,pt.p.id)),'CASH_OVERDRAFT','đảo phiếu thu 500 USD khi quỹ chỉ còn 100');eq(snap(T),s0,'không đổi dữ liệu');
  let w=H.world2();setType(w.T,'QU','CASH');const pt2=H.pay(w.c,w.T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');eq(H.code(()=>REV(w.c,pt2.p.id)),'OK','quỹ còn đủ: đảo bình thường');
  w=H.world2();setType(w.T,'QU','BANK');const pt3=H.pay(w.c,w.T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');H.pay(w.c,w.T,H.OUT({amountMinor:140000,effectiveDate:'2026-10-15'}),'PC1');eq(H.code(()=>REV(w.c,pt3.p.id)),'OK','quỹ ngân hàng: không chặn');
  // phiếu thu VND
  ({T,c}=H.world5());setType(T,'Q1','CASH');const pv=T.Payment.find(x=>x.payNo==='PT6');H.VP(c,T,H.OUT({amountMinor:52000000,effectiveDate:'2026-10-20'}),'VC-ALL');
  eq(H.code(()=>REV(c,pv.id)),'CASH_OVERDRAFT','VND: đảo phiếu thu 2.000.000 khi quỹ chỉ còn 700.000');
  // chuyển quỹ: quỹ nhận đã chi hết
  ({T,c}=H.world3());setType(T,'QU2','CASH');const x=H.XF(c,H.U,{amountMinor:40000});c.xferPost_(H.U2,{requestId:H.rid(),payload:{id:x.id}});
  H.pay(c,T,H.OUT({amountMinor:40000,effectiveDate:'2026-10-15',cashAccountCode:'QU2'}),'PC-QU2');
  eq(H.code(()=>c.xferReverse_(H.U2,{requestId:H.rid(),payload:{id:x.id,reason:'nhầm'}})),'CASH_OVERDRAFT','quỹ nhận đã chi hết nên không đảo được chuyển quỹ');
  // bán ngoại tệ thu VND vào quỹ tiền mặt VND rồi chi hết
  ({T,c}=H.world4());setType(T,'Q1','CASH');H.pay(c,T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT9');
  const e=H.EX(c,H.U,{kind:'SELL',foreignMinor:20000,baseMinor:5000000,effectiveDate:'2026-10-12'});c.exchPost_(H.U2,{requestId:H.rid(),payload:{id:e.id}});
  H.VP(c,T,H.OUT({amountMinor:54000000,effectiveDate:'2026-10-15'}),'VC-ALL');   // 50.000.000 + 5.000.000 − 54.000.000 = 1.000.000 < 5.000.000
  eq(H.code(()=>c.exchReverse_(H.U2,{requestId:H.rid(),payload:{id:e.id,reason:'nhầm'}})),'CASH_OVERDRAFT','đảo phiếu bán khi tiền VND thu về đã chi');
  // thừa kiểm kê ngoại tệ đã chi
  ({T,c}=H.world4());setType(T,'QU','CASH');const before=c.fxPoolRun_(null,'2026-10-20').accounts.QU;
  const su=c.countSave_(H.U,{requestId:H.rid(),payload:{account:'QU',countDate:'2026-10-20',countedMinor:before.balF+10000,reason:'Thừa 100 USD'}});c.countConfirm_(H.U2,{requestId:H.rid(),payload:{id:su.id}});c.countAdjust_(H.U2,{requestId:H.rid(),payload:{id:su.id,kind:'EXPENSE',note:'x'}});
  H.pay(c,T,H.OUT({amountMinor:before.balF+10000,effectiveDate:'2026-10-31'}),'PC-ALL');
  eq(H.code(()=>c.countAdjustReverse_(H.U2,{requestId:H.rid(),payload:{id:su.id,reason:'nhầm'}})),'CASH_OVERDRAFT','đảo xử lý thừa khi số thừa đã chi');
});
suite('10. Nhập hàng loạt sao kê / sổ thu chi: lô làm quỹ TIỀN MẶT VND âm bị chặn khi duyệt ghi; quỹ ngân hàng và lô hợp lệ vẫn ghi được (engine thật)',()=>{
  const makeEnv=require('./bench/_env.cjs'),{ctx}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
  ['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','OpeningBalance','ImportBatch','ImportRow','AppUser','SysTx','AuditLog','CashTransfer','CashExchange','CashCount'].forEach(t=>ctx.repoSheet_(t));
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o),cat=(id,t,c,a)=>B({id,catalogType:t,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1});
  ctx.repoAppend_('Catalog',[cat('c1','CURRENCY','VND',{decimals:0}),cat('q1','CASH_ACCOUNT','TM1',{currency:'VND',type:'CASH'}),cat('q2','CASH_ACCOUNT','NH1',{currency:'VND',type:'BANK'})]);
  ctx.repoAppend_('Partner',[B({id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE'})]);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'})]);
  ctx.repoAppend_('OpeningBalance',[B({id:'ob1',kind:'CASH',cashAccountCode:'TM1',currency:'VND',amountMinor:1000000,ledgerStartDate:'2026-01-01'})]);
  ctx.todayVn_=()=>'2026-11-10';const mkU=(id)=>({id,email:id+'@x.vn',displayName:id,role:'APPROVER',scope:{allPartners:true}}),A=mkU('ap'),A2=mkU('ap2'),rid=()=>'q'+Math.random();
  const H='Ngày,Tài khoản quỹ,Thu,Chi,Mã GD ngân hàng,Đối tác,Diễn giải,Số HĐ/Mã dịch vụ\n';
  const run=(csv,name)=>{const pv=ctx.importBankPreview_(A,{requestId:rid(),payload:{csv:H+csv,fileName:name}});const g=ctx.importGet_(A,{payload:{batchId:pv.batchId}});
    g.rows.forEach(r=>ctx.importRowDecide_(A,{requestId:rid(),payload:{rowId:r.id,decision:'ACCEPT'}}));const g2=ctx.importGet_(A,{payload:{batchId:pv.batchId}});
    return ()=>ctx.importBankCommit_(A2,{requestId:rid(),payload:{batchId:pv.batchId,expectedSummaryHash:g2.summaryHash}})};
  const pays=()=>ctx.repoValid_('Payment').length;
  eq(code(run('05/11/2026,TM1,,1500000,PC1,ABC,chi vượt quỹ,\n','a.csv')),'CASH_OVERDRAFT','chi 1.500.000 khi quỹ tiền mặt chỉ có 1.000.000');eq(pays(),0,'không ghi phiếu nào');
  eq(code(run('05/11/2026,NH1,,99000000,FT1,ABC,chi ngân hàng,\n','b.csv')),'OK','quỹ ngân hàng không bị chặn');eq(pays(),1);
  eq(code(run('05/11/2026,TM1,,800000,PC2,ABC,chi,\n06/11/2026,TM1,500000,,PT2,ABC,thu,\n','c.csv')),'OK','lô hợp lệ ghi được');eq(pays(),3);
  eq(code(run('07/11/2026,TM1,,700001,PC3,ABC,chi,\n','d.csv')),'CASH_OVERDRAFT','quỹ còn đúng 700.000: chi 700.001 bị chặn');eq(pays(),3);
  eq(code(run('07/11/2026,TM1,,700000,PC4,ABC,chi đúng số dư,\n','e.csv')),'OK','chi đúng bằng số dư vẫn được');eq(pays(),4);
});
suite('10b. Nhập hàng loạt vào quỹ TIỀN MẶT ngoại tệ (USD): lô chi vượt số dư bị chặn khi duyệt ghi; chi đúng số dư và quỹ ngân hàng USD vẫn ghi được',()=>{
  const makeEnv=require('./bench/_env.cjs'),{ctx}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
  ['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','OpeningBalance','ImportBatch','ImportRow','AppUser','SysTx','AuditLog','CashTransfer','CashExchange','CashCount','FxRate','FxEntry'].forEach(t=>ctx.repoSheet_(t));
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o),cat=(id,t,c,a)=>B({id,catalogType:t,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1});
  ctx.repoAppend_('Catalog',[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','CURRENCY','USD',{decimals:2}),cat('q1','CASH_ACCOUNT','TQ',{currency:'USD',type:'CASH'}),cat('q2','CASH_ACCOUNT','NHU',{currency:'USD',type:'BANK'})]);
  ctx.repoAppend_('Partner',[B({id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE'})]);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'})]);
  ctx.repoAppend_('OpeningBalance',[B({id:'ob1',kind:'CASH',cashAccountCode:'TQ',currency:'USD',amountMinor:100000,ledgerStartDate:'2026-01-01'})]);   // 1.000 USD
  ctx.repoAppend_('FxRate',['2026-01-01:24000','2026-11-05:25000','2026-11-06:25100','2026-11-07:25200'].map((x,i)=>{const [d,r]=x.split(':');return B({id:'fx'+i,rateDate:d,currency:'USD',rateE4:+r*10000,source:'MANUAL'})}));
  ctx.todayVn_=()=>'2026-11-10';const mkU=id=>({id,email:id+'@x.vn',displayName:id,role:'APPROVER',scope:{allPartners:true}}),A=mkU('ap'),A2=mkU('ap2'),rid=()=>'q'+Math.random();
  const H='Ngày,Tài khoản quỹ,Thu,Chi,Mã GD ngân hàng,Đối tác,Diễn giải,Số HĐ/Mã dịch vụ\n';
  const run=(csv,name)=>{const pv=ctx.importBankPreview_(A,{requestId:rid(),payload:{csv:H+csv,fileName:name}});const g=ctx.importGet_(A,{payload:{batchId:pv.batchId}});
    g.rows.forEach(r=>ctx.importRowDecide_(A,{requestId:rid(),payload:{rowId:r.id,decision:'ACCEPT'}}));const g2=ctx.importGet_(A,{payload:{batchId:pv.batchId}});
    return ()=>ctx.importBankCommit_(A2,{requestId:rid(),payload:{batchId:pv.batchId,expectedSummaryHash:g2.summaryHash}})};
  const pays=()=>ctx.repoValid_('Payment').length;
  eq(code(run('05/11/2026,TQ,,1500.00,PC1,ABC,chi vượt quỹ USD,\n','a.csv')),'CASH_OVERDRAFT','chi 1.500 USD khi quỹ chỉ có 1.000');eq(pays(),0);
  eq(code(run('05/11/2026,NHU,,9000.00,FT1,ABC,ngân hàng USD,\n','b.csv')),'OK','quỹ ngân hàng USD không bị chặn');eq(pays(),1);
  eq(code(run('05/11/2026,TQ,,400.00,PC2,ABC,chi,\n06/11/2026,TQ,200.00,,PT2,ABC,thu,\n','c.csv')),'OK');eq(pays(),3);   // 1.000 − 400 + 200 = 800
  eq(code(run('07/11/2026,TQ,,800.01,PC3,ABC,chi,\n','d.csv')),'CASH_OVERDRAFT','còn 800 USD: chi 800,01 bị chặn');eq(pays(),3);
  eq(code(run('07/11/2026,TQ,,800.00,PC4,ABC,chi đúng số dư,\n','e.csv')),'OK');eq(pays(),4);
});
suite('8A. Hủy đơn đang có khoản bù trừ vẫn bị chặn (ORDER_HAS_PASS_LINKS) — giữ nguyên',()=>{
  const {c,T}=P.mk();P.LK(c,P.U,{costAccrualId:'c1',revenueAccrualId:'r2'});
  eq(code(()=>c.orderSetStatus_(P.U,{requestId:P.rid(),payload:{id:'o1',status:'CANCELLED',ifVersion:T.Order.find(o=>o.id==='o1').version}})),'ORDER_HAS_PASS_LINKS');
});
console.log('Tổng kiểm tra:',steps);
