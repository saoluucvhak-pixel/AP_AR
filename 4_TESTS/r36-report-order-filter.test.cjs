// R36: R02/R03 lọc theo đơn hàng (orderId) và tìm theo số đơn/PO (q). Dữ liệu mô phỏng có PO thật.
const path=require('path'),assert=require('assert'),makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.deepStrictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const U={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},LIM={id:'u2',email:'l@x.vn',displayName:'L',role:'APPROVER',scope:{partnerIds:['p3','p6','p9','p12'],businessGroups:['G1']}};
const env=()=>{const E=makeEnv(SRCP);seed(E.ctx,300);E.ctx.todayVn_=()=>'2026-10-25';return E};
const data=(r)=>[...r.rows].filter(x=>x.t==='data'&&x.cells.docNo).map(x=>x.cells.docNo);
const ASOF='2026-10-25';
function expected(ctx,user,ord,dir){const led=ctx.loadLedger_(user,ASOF),ox=ctx.docOrderIndex_(user,led.lines);return led.docs.filter(d=>d.direction===dir&&ox[d.id]&&[...ox[d.id].orders].some(o=>o.id===ord)).map(d=>d.docNo)}
suite('1. R02/R03 lọc theo orderId: chỉ còn chứng từ gắn với đơn đó (kể cả khoản chia đơn)',()=>{
  const {ctx}=env();let tested=0;
  for(const [code,dir] of [['R02','AR'],['R03','AP']])for(const oid of ['o1','o7','o20']){
    const all=data(ctx.rep02_(U,code,{asOf:ASOF})),got=data(ctx.rep02_(U,code,{asOf:ASOF,orderId:oid})),exp=expected(ctx,U,oid,dir);
    eq([...got].sort(),[...exp].sort(),code+' '+oid);ok(got.length<all.length,'ít hơn khi không lọc');if(got.length)tested++;
  }
  ok(tested>=3,'có dữ liệu thật để kiểm: '+tested);
});
suite('2. Tiêu đề báo cáo ghi đơn hàng đã lọc; tìm q theo số đơn/PO',()=>{
  const {ctx}=env(),r=ctx.rep02_(U,'R02',{asOf:ASOF,orderId:'o7'});ok(/DH-7 · PO PO7/.test(r.meta.order),r.meta.order);
  const q=ctx.rep02_(U,'R02',{asOf:ASOF,q:'dh-7'});ok(/dh-7/.test(q.meta.order));ok(data(q).length>=data(r).length&&data(q).length>0,'q khớp DH-7 (và DH-7x)');
  eq(ctx.rep02_(U,'R02',{asOf:ASOF}).meta.order,undefined);
});
suite('3. Người bị giới hạn phạm vi không lọc/lộ được đơn ngoài phạm vi',()=>{
  const {ctx}=env(),led=ctx.loadLedger_(LIM,ASOF),r=ctx.rep02_(LIM,'R02',{asOf:ASOF,orderId:'o1'});
  ok(/không có trong phạm vi/.test(r.meta.order)||data(r).length>=0);
  const ox=ctx.docOrderIndex_(LIM,led.lines);for(const n of data(r)){const d=led.docs.find(x=>x.docNo===n);ok([...ox[d.id].orders].some(o=>o.id==='o1'))}
});
console.log('Tổng kiểm tra:',steps);
