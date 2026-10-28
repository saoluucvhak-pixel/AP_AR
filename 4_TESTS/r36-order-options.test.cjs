// R36: order.options — danh sách đơn NHẸ cho ô lọc (chỉ đọc Order + Partner), cùng phạm vi xem như order.list. Dữ liệu mô phỏng.
const path=require('path'),assert=require('assert'),makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.deepStrictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const U={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},LIM={id:'u2',email:'l@x.vn',displayName:'L',role:'APPROVER',scope:{partnerIds:['p3','p6','p9','p12'],businessGroups:['G1']}},EXEC={id:'ex',email:'ex@x.vn',role:'EXEC',scope:{allPartners:true}};
const env=()=>{const E=makeEnv(SRCP);seed(E.ctx,600);E.ctx.todayVn_=()=>'2026-10-25';return E};
const call=(c,u,a,p)=>c.dispatch_(u,a,{requestId:'r'+Math.random(),payload:p||{}});
suite('1. Trả đúng dạng {id, orderNo, poNo, customerName}, sắp xếp ngày đơn mới nhất trước, đủ số đơn',()=>{
  const {ctx}=env(),r=call(ctx,U,'order.options');eq(Object.keys(r.items[0]).sort(),['customerName','id','orderNo','poNo']);eq(r.total,r.items.length);eq(r.total,ctx.repoValid_('Order').filter(o=>o.status!=='DELETED').length,'đủ mọi đơn chưa xóa');ok(r.total>=100,'có dữ liệu: '+r.total);eq(r.truncated,false);
  const ord=ctx.repoValid_('Order'),dates=r.items.map(x=>ord.find(o=>o.id===x.id).orderDate);for(let i=1;i<dates.length;i++)ok(dates[i-1]>=dates[i],'giảm dần theo ngày đơn');
});
suite('2. Cùng phạm vi xem như order.list: người giới hạn đối tác chỉ thấy đơn của mình; mọi đơn order.list trả về đều có trong order.options',()=>{
  const {ctx}=env();for(const u of [U,LIM]){const opt=new Set(call(ctx,u,'order.options').items.map(x=>x.id)),lst=call(ctx,u,'order.list',{pageSize:200,adv:{flag:{includeArchived:true}}}).items;ok(lst.length>0,'có đơn');ok(lst.every(x=>opt.has(x.id)),u.id+': order.list ⊆ order.options')}
  const lim=call(ctx,LIM,'order.options'),all=call(ctx,U,'order.options');ok(lim.total<all.total&&lim.total>0,'người giới hạn thấy ít hơn: '+lim.total+' < '+all.total);
  const ord=ctx.repoValid_('Order'),own=new Set(['p3','p6','p9','p12']);ok(lim.items.every(x=>own.has(ord.find(o=>o.id===x.id).customerPartnerId)),'chỉ đơn của đối tác trong phạm vi');
});
suite('3. Chỉ đọc bảng Order và Partner (không đọc Accrual, DebtDoc, DebtLine…); nhẹ hơn order.list rất nhiều',()=>{
  const {ctx,S,cache}=env(),meas=(a,p)=>{Object.keys(cache).forEach(k=>delete cache[k]);ctx.resetMemoDirect_();S.getValues=0;S.cells=0;S.by={};call(ctx,U,a,p);return {cells:S.cells,tables:Object.keys(S.by).sort()}};
  const o=meas('order.options'),l=meas('order.list',{pageSize:200});eq(o.tables,['Order','Partner']);ok(o.cells*10<l.cells,'order.options đọc '+o.cells+' ô, order.list '+l.cells+' ô (kỳ vọng < 10%)');
});
suite('4. Quyền: người dùng không có quyền đọc bị từ chối',()=>{
  const {ctx}=env();let code='OK';try{call(ctx,{id:'x',email:'x@x',role:'NONE',scope:{allPartners:true}},'order.options')}catch(e){code=e.code||e.message}ok(code!=='OK','vai trò không có quyền đọc: '+code);
});
console.log('Tổng kiểm tra:',steps);
