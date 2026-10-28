// R36: doc.get chỉ đọc cột cần dùng của Accrual (id, orderId) và Payment (id, payNo) thay vì cả bảng; kết quả giữ nguyên. Dữ liệu mô phỏng.
const path=require('path'),assert=require('assert'),makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.deepStrictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const U={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}};
const call=(c,a,p)=>c.dispatch_(U,a,{requestId:'r'+Math.random(),payload:p||{}});
suite('1. doc.get đọc ít ô hơn nhiều ở Accrual/Payment mà kết quả không đổi',()=>{
  const E=makeEnv(SRCP),{ctx,S,cache}=E;seed(ctx,300);ctx.todayVn_=()=>'2026-10-25';
  const reset=()=>{Object.keys(cache).forEach(k=>delete cache[k]);ctx.resetMemoDirect_();S.getValues=0;S.cells=0;S.by={}};
  const ids=['d5','d10','d33','d40'];
  const slim=ids.map(id=>{reset();const r=call(ctx,'doc.get',{id,asOf:'2026-10-25'});return {r:JSON.stringify(r),by:Object.assign({},S.by)}});
  const accFull=ctx.repoValid_('Accrual').length*ctx.parseCols_('Accrual').length,payFull=ctx.repoValid_('Payment').length*ctx.parseCols_('Payment').length;
  slim.forEach(x=>{ok(x.by.Accrual<accFull/5,'Accrual đọc '+x.by.Accrual+' ô < 1/5 của '+accFull);ok(x.by.Payment<payFull/5,'Payment đọc '+x.by.Payment+' ô < 1/5 của '+payFull)});
  ids.forEach((id,i)=>{reset();ctx.repoValid_('Accrual');ctx.repoValid_('Payment');const full=JSON.stringify(call(ctx,'doc.get',{id,asOf:'2026-10-25'}));eq(slim[i].r,full,id+': cùng kết quả khi bảng đã nạp đủ cột')});
  const r=JSON.parse(slim[0].r);ok(r.lines.length>0&&r.doc.docNo);
});
console.log('Tổng kiểm tra:',steps);
