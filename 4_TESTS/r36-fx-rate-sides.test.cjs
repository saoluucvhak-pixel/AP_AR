// R36: nhập/lưu/liệt kê tỷ giá MUA – BÁN (fx.save, fx.list). Dữ liệu mô phỏng.
const path=require('path'),assert=require('assert'),makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.deepStrictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const U={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}};
const call=(c,u,a,p)=>c.dispatch_(u,a,{requestId:'r'+Math.random(),payload:p||{}});
const env=()=>{const E=makeEnv(SRCP);seed(E.ctx,30);E.ctx.todayVn_=()=>'2026-10-25';E.ctx.repoAppend_('Catalog',[{id:'cu',catalogType:'CURRENCY',code:'USD',name:'USD',attrsJson:'{"decimals":2}',active:1,sortOrder:2,version:1,isDeleted:0,commitState:'C'}]);return E};
const code=(f)=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
suite('1. fx.save nhận tỷ giá mua/bán (không bắt buộc), từ chối mua > bán hoặc sai định dạng; fx.list trả về mua/bán',()=>{
  const {ctx}=env(),base={currency:'USD',rateDate:'2026-10-20',rate:'25.2'};
  eq(code(()=>call(ctx,U,'fx.save',Object.assign({},base,{buy:'25.3',sell:'25.1'}))),'VALIDATION_FAILED','mua > bán');
  eq(code(()=>call(ctx,U,'fx.save',Object.assign({},base,{buy:'abc'}))),'VALIDATION_FAILED','sai định dạng');
  eq(code(()=>call(ctx,U,'fx.save',Object.assign({},base,{sell:'0'}))),'VALIDATION_FAILED','bán = 0 là sai (để trống nếu không có)');
  eq(code(()=>call(ctx,U,'fx.save',Object.assign({},base,{buy:'25.15',sell:'25.25'}))),'OK');
  let it=call(ctx,U,'fx.list',{currency:'USD'}).items.find(x=>x.rateDate==='2026-10-20');eq([it.buy,it.sell,it.rate],[ctx.fxText_(251500),ctx.fxText_(252500),ctx.fxText_(252000)]);
  eq(code(()=>call(ctx,U,'fx.save',base)),'OK','lưu lại không có mua/bán → xóa mua/bán cũ');
  it=call(ctx,U,'fx.list',{currency:'USD'}).items.find(x=>x.rateDate==='2026-10-20');eq([it.buy,it.sell],['','']);
  eq(code(()=>call(ctx,U,'fx.save',Object.assign({},base,{buy:'25.15'}))),'OK','chỉ nhập mua');
  it=call(ctx,U,'fx.list',{currency:'USD'}).items.find(x=>x.rateDate==='2026-10-20');eq([it.buy,it.sell],[ctx.fxText_(251500),'']);
});
suite('2. Tỷ giá mua/bán đã lưu được đánh giá lại dùng đúng chiều: fxClosing_ BUY/SELL/MID',()=>{
  const {ctx}=env();call(ctx,U,'fx.save',{currency:'USD',rateDate:'2026-10-20',rate:'25.2',buy:'25.15',sell:'25.25'});
  const rates=ctx.repoValid_('FxRate');const c=(s)=>{const r=ctx.fxClosing_('USD','2026-10-25',rates,s);return [r.e4,r.basis,r.rateDate]};
  eq(c('BUY'),[251500,'BUY','2026-10-20']);eq(c('SELL'),[252500,'SELL','2026-10-20']);eq(c('MID'),[252000,'MID','2026-10-20']);ok(ctx.fxUsesSides_('USD',rates));ok(!ctx.fxUsesSides_('EUR',rates));
});
console.log('Tổng kiểm tra:',steps);
