// R35: SL × đơn giá = thành tiền (bỏ "container"): số lượng tối đa 3 số lẻ, đơn giá tối đa 4 số lẻ, tính BigInt half-up; có đơn giá thì thành tiền phải khớp; không có đơn giá thì nhập thành tiền. Dữ liệu giả.
const assert=require('assert'),path=require('path'),fs=require('fs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
const ph=fs.readFileSync(path.join(__dirname,'passthrough.test.cjs'),'utf8'),pcut=ph.indexOf("suite('1. Danh sách chỉ gồm khoản hộ");
const pm={};new Function('require','__dirname','process','module','console',ph.slice(0,pcut).replace(/function suite\(name,fn\)\{[^\n]*\n/,'function suite(){}\n').concat('\nmodule.exports={mk,U,rid};'))(require,__dirname,process,pm,console);
const P=pm.exports;
const L=(c,o,cur)=>c.calcLine_(Object.assign({feeTypeCode:'F',description:'d',vatMode:'NONE'},o),0,false,cur);
const errs=r=>r.errors.map(e=>e.code).join(',');
suite('1. mulQtyPrice_: làm tròn half-up đúng theo số lẻ của tiền tệ, không dùng số thực',()=>{
  const {c}=P.mk();
  eq(c.mulQtyPrice_(2.5,1234.5678,0),3086);eq(c.mulQtyPrice_(2.5,1234.5678,2),308642);eq(c.mulQtyPrice_(0.333,3,0),1);eq(c.mulQtyPrice_(1000,0.0001,2),10);eq(c.mulQtyPrice_(3,0.5,0),2,'1,5 → 2 (half-up)');eq(c.mulQtyPrice_(1.005,1,2),101,'100,5 → 101 (half-up)');eq(c.mulQtyPrice_(1e21,1,0),null,'số mũ bị từ chối');eq(c.mulQtyPrice_(1.2345,1,0),null,'quá 3 số lẻ của SL');
});
suite('2. calcLine_: có SL + đơn giá thì thành tiền phải khớp; sai thì NET_MISMATCH; đơn giá không có SL bị từ chối; SL không đơn giá thì nhập thành tiền',()=>{
  const {c}=P.mk();
  eq(errs(L(c,{containerQty:2,unitPrice:5000,netMinor:10000},'VND')),'');eq(L(c,{containerQty:2,unitPrice:5000,netMinor:10000},'VND').line.unitPrice,5000);
  eq(errs(L(c,{containerQty:2,unitPrice:5000,netMinor:9999},'VND')),'NET_MISMATCH');
  eq(errs(L(c,{containerQty:2.5,unitPrice:12.34,netMinor:3085},'USD')),'','USD: 2,5 × 12,34 = 30,85 USD = 3085 cent');eq(errs(L(c,{containerQty:2.5,unitPrice:12.34,netMinor:3086},'USD')),'NET_MISMATCH');
  eq(errs(L(c,{unitPrice:5000,netMinor:10000},'VND')),'UNIT_PRICE_NEEDS_QTY');
  eq(errs(L(c,{containerQty:4,netMinor:10000},'VND')),'','có SL, không đơn giá: nhập thành tiền');eq(L(c,{containerQty:4,netMinor:10000},'VND').line.unitPrice,null);
  eq(errs(L(c,{containerQty:2.1234,netMinor:10},'VND')),'QTY_INVALID');eq(errs(L(c,{containerQty:-1,netMinor:10},'VND')),'QTY_INVALID');eq(errs(L(c,{containerQty:1,unitPrice:1.23456,netMinor:1},'VND')),'UNIT_PRICE_INVALID');
  eq(errs(L(c,{netMinor:10000})),'','không SL, không đơn giá: như cũ');
});
suite('3. Lưu khoản phát sinh: SL, đơn giá được lưu; sai thành tiền bị từ chối; bản ghi cũ (không đơn giá) vẫn sửa được',()=>{
  const {c,T}=P.mk();T.Order.forEach(o=>o.serviceCode='FWD');const a=T.Accrual.find(x=>x.id==='r4');
  const sv=o=>c.accrualSave_(P.U,{requestId:P.rid(),payload:Object.assign({id:a.id,ifVersion:a.version,orderId:a.orderId,allocMode:'ORDER',kind:a.kind,partnerId:a.partnerId,accrualDate:a.accrualDate,feeTypeCode:'F',description:a.description,netMinor:10000,vatMode:'NONE',vatRateBp:null,currency:'VND',isPassThrough:0,serviceCode:'FWD'},o||{})});
  eq(code(()=>sv({containerQty:2,unitPrice:5000})),'OK');const row=T.Accrual.find(x=>x.id==='r4');eq(row.containerQty,2);eq(row.unitPrice,5000);eq(row.netMinor,10000);
  eq(code(()=>sv({ifVersion:row.version,containerQty:3,unitPrice:5000})),'VALIDATION_FAILED','3 × 5000 ≠ 10000');
  eq(code(()=>sv({ifVersion:T.Accrual.find(x=>x.id==='r4').version,containerQty:2.5,unitPrice:4000,netMinor:10000})),'OK');eq(T.Accrual.find(x=>x.id==='r4').containerQty,2.5);
});
suite('4. Schema: cột unitPrice ở DebtLine và Accrual (thêm cuối, SCHEMA_VERSION 2.7)',()=>{
  const {c}=P.mk();ok(c.parseCols_('DebtLine').some(x=>x.name==='unitPrice'&&x.type==='n'));ok(c.parseCols_('Accrual').some(x=>x.name==='unitPrice'));eq(c.SCHEMA_VERSION,'2.7');
});
suite('5. Lọc nhiều đơn hàng (order.list adv.sel.orderId): chỉ trả đúng các đơn được chọn; bỏ chọn thì trả hết',()=>{
  const env=require('./bench/_env.cjs')(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs')),seed=require('./bench/_seed_po.cjs'),crypto=require('crypto');seed(env.ctx,40);
  ['PassLink','Period','FxRate'].forEach(t=>env.ctx.repoSheet_(t));env.ctx.todayVn_=()=>'2026-10-25';const U={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
  const all=env.ctx.dispatch_(U,'order.list',{requestId:'a',payload:{pageSize:200}});ok(all.total>=3,'có đơn: '+all.total);
  const ids=all.items.slice(0,3).map(o=>o.id),r=env.ctx.dispatch_(U,'order.list',{requestId:'b',payload:{pageSize:200,adv:{sel:{orderId:ids.slice(0,2)}}}});
  eq(r.total,2);eq(r.items.map(o=>o.id).sort().join(),ids.slice(0,2).sort().join());eq(env.ctx.dispatch_(U,'order.list',{requestId:'c',payload:{pageSize:200,adv:{sel:{orderId:['khong-co']}}}}).total,0);
});
console.log('Tổng kiểm tra:',steps);
