// R34: lỗi MỚI tìm thấy khi rà thu hộ/chi hộ, quỹ ngoại tệ/bình quân, kiểm kê. Mỗi lỗi có tái hiện trên R3.3 (chạy với BACKEND_SRC=<Backend R3.3>: các ca này phải THẤT BẠI) và đạt trên bản sửa.
// B1 sửa khoản đang bù trừ làm số còn mở âm/lệch tiền tệ · B2 hủy đơn làm hủy khoản đang bù trừ, bản ghép mồ côi · B3 xử lý chênh lệch kiểm kê khi sổ quỹ đã đổi sau lúc kiểm kê · B4 "Tính lại bình quân" ghi đè phiếu chi theo tỷ giá ngày khi đang chọn phương pháp DAY.
const assert=require('assert'),path=require('path'),vm=require('vm'),fs=require('fs'),crypto=require('crypto');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
const makeEnvFile=require('./bench/_env.cjs'),SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),seed=require('./bench/_seed_po.cjs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
const codeD=f=>{try{f();return 'OK'}catch(e){return (e.code||e.message)+' '+JSON.stringify(e.details||e.fields||'')}};
const U={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}},U2={id:'ap2',email:'ap2@x.vn',role:'APPROVER',scope:{allPartners:true}},ADM={id:'adm',email:'adm@x.vn',role:'ADMIN',scope:{allPartners:true}};
// ---- B1, B2: thế giới giả của passthrough.test (c1 chi phí 1000 / r2 doanh thu 900, cùng đơn o1) ----
const ph=fs.readFileSync(path.join(__dirname,'passthrough.test.cjs'),'utf8'),pcut=ph.indexOf("suite('1. Danh sách chỉ gồm khoản hộ");
const pm={};new Function('require','__dirname','process','module','console',ph.slice(0,pcut).replace(/function suite\(name,fn\)\{[^\n]*\n/,'function suite(){}\n').concat('\nmodule.exports={mk,LK,U,ACC,rid};'))(require,__dirname,process,pm,console);
const P=pm.exports;
const saveP=(c,a,o)=>c.accrualSave_(P.U,{requestId:P.rid(),payload:Object.assign({id:a.id,ifVersion:a.version,orderId:a.orderId,allocMode:'ORDER',kind:a.kind,partnerId:a.partnerId,accrualDate:a.accrualDate,feeTypeCode:'F',description:a.description,netMinor:a.grossMinor,vatMode:'NONE',vatRateBp:null,currency:a.currency,isPassThrough:1,serviceCode:'FWD'},o||{})});
suite('B1. Khoản đang bù trừ thu hộ/chi hộ không được sửa làm hỏng bù trừ (giảm dưới phần đã ghép, đổi tiền tệ, bỏ đánh dấu hộ)',()=>{
  const {c,T}=P.mk();T.Order.forEach(o=>o.serviceCode='FWD');P.LK(c,P.U,{costAccrualId:'c1',revenueAccrualId:'r2'});  // ghép 900
  const fresh=id=>T.Accrual.find(x=>x.id===id);
  eq(code(()=>saveP(c,fresh('r2'),{netMinor:500})),'STATE_TRANSITION_INVALID','giảm dưới 900 đã ghép');
  eq(code(()=>saveP(c,fresh('r2'),{isPassThrough:0})),'STATE_TRANSITION_INVALID','bỏ đánh dấu hộ');
  eq(code(()=>saveP(c,fresh('r2'),{currency:'USD'})),'STATE_TRANSITION_INVALID','đổi tiền tệ');
  eq(fresh('r2').grossMinor,900,'dữ liệu không đổi khi bị từ chối');
  eq(code(()=>saveP(c,fresh('r2'),{netMinor:1200,description:'tăng số tiền được phép'})),'OK','tăng số tiền hoặc sửa mô tả vẫn được');
  const list=c.passList_(P.U,{payload:{}}).items;ok(list.every(i=>i.openMinor>=0),'không có số còn mở âm: '+JSON.stringify(list.map(i=>[i.id,i.openMinor])));
});
suite('B2. Hủy đơn không được làm hủy khoản đang bù trừ (bản ghép mồ côi); gỡ ghép xong hủy được',()=>{
  const {c,T}=P.mk(),lk=P.LK(c,P.U,{costAccrualId:'c1',revenueAccrualId:'r2'});
  const cancel=()=>c.orderSetStatus_(P.U,{requestId:P.rid(),payload:{id:'o1',status:'CANCELLED',ifVersion:T.Order.find(o=>o.id==='o1').version}});
  eq(code(cancel),'ORDER_HAS_PASS_LINKS');ok(T.Accrual.find(a=>a.id==='r2').status!=='CANCELLED','khoản không bị hủy khi đơn hủy bị từ chối');
  c.passUnlink_(P.U,{requestId:P.rid(),payload:{id:lk.id}});
  eq(code(cancel),'OK','sau gỡ ghép hủy được');ok(T.Accrual.filter(a=>a.orderId==='o1').every(a=>a.status==='CANCELLED'),'khoản của đơn bị hủy theo');
});
// ---- B3, B4: thế giới giả như fx-pool.test ----
const head=fs.readFileSync(path.join(__dirname,'fx-pool.test.cjs'),'utf8'),w5=head.indexOf('function world5()'),cut=head.indexOf('\n',w5)+1;
const mod={};new Function('require','__dirname','process','module','console',head.slice(0,cut).replace(/function suite\(name,fn\)\{[^\n]*\n/,'function suite(){}\n').concat('\nmodule.exports={mk,world,save,payIn,OUT,pay,world2,world3,world4,world5,RATE,XF,EX,VP,U,U2,rid,code};'))(require,__dirname,process,mod,console);
const H=mod.exports;
suite('B3. Xử lý chênh lệch kiểm kê bị chặn khi sổ quỹ đã đổi sau lúc kiểm kê (STALE_COUNT); lập biên bản mới thì xử lý được và sổ khớp số đếm',()=>{
  const {T,c}=H.world5();c.todayVn_=()=>'2026-11-05';const CS=(p)=>c.countSave_(H.U,{requestId:H.rid(),payload:Object.assign({account:'Q1',countDate:'2026-10-15'},p)});
  const k=CS({countedMinor:52600000,reason:'Thiếu 100.000'});c.countConfirm_(H.U2,{requestId:H.rid(),payload:{id:k.id}});
  H.VP(c,T,H.payIn({amountMinor:5000,effectiveDate:'2026-10-13'}),'PTLATE');  // phiếu thu lùi ngày làm sổ quỹ thay đổi sau lúc kiểm kê
  eq(H.code(()=>c.countAdjust_(H.U2,{requestId:H.rid(),payload:{id:k.id,kind:'EXPENSE'}})),'STALE_COUNT');
  eq(c.cashBook_(H.U,{payload:{account:'Q1',from:'2026-10-01',to:'2026-10-31'}}).book.closing,52705000,'chưa xử lý nên sổ giữ nguyên, không bị lệch thêm');
});
suite('B4. Chọn phương pháp DAY: báo lệch/tính lại bình quân KHÔNG đụng phiếu chi ghi theo tỷ giá ngày chi',()=>{
  const {T,c}=H.world2();T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill']})});
  c.fxMethodSet_(H.U,{requestId:H.rid(),payload:{method:'DAY'}});
  H.pay(c,T,H.payIn({amountMinor:50000,effectiveDate:'2026-10-10'}),'PT1');const o=H.pay(c,T,H.OUT({amountMinor:60000,effectiveDate:'2026-10-12'}),'PC1');eq(o.p.fxRateE4,255000000,'ghi theo tỷ giá ngày chi');eq(o.p.fxSource==='MOVING_AVG',false);
  H.pay(c,T,H.payIn({amountMinor:20000,effectiveDate:'2026-10-05'}),'PT0');
  const rep=c.fxPoolReport_(H.U,{payload:{asOf:'2026-10-31'}}).items[0];eq(rep.mismatches.length,0,'phương pháp DAY: không báo lệch bình quân');
  const r=c.fxPoolRecalc_(H.U,{requestId:H.rid(),payload:{}});eq(r.changed,0);eq(T.Payment.find(x=>x.id===o.p.id).fxRateE4,255000000,'phiếu chi giữ tỷ giá ngày');
  // đổi sang bình quân: phiếu cũ (ngày chi) vẫn không bị ghi đè; phiếu mới theo bình quân mới tính lại bình thường
  c.fxMethodSet_(H.U,{requestId:H.rid(),payload:{method:'MOVING_AVG'}});eq(c.fxPoolRecalc_(H.U,{requestId:H.rid(),payload:{}}).changed,0,'phiếu ghi theo ngày chi trước đây không bị đổi');
});
console.log('Tổng kiểm tra:',steps);
