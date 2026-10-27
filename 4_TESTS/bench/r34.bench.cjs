// R34: so sánh các phương án ĐỌC cho doc.list trên giả lập (Sheet/Cache giả đếm lệnh getValues và ô). KHÔNG phải số đo Google thật.
// Phương án: FULL (đọc nguyên bảng — mặc định hiện tại) và SLICE gap=0..8 (đọc chọn cột, gộp dải khi khoảng trống ≤ gap). Mỗi phương án: tải lạnh, cache bảng ấm, ngay sau ghi; ≥5 lần/điều kiện; kiểm tra KẾT QUẢ GIỐNG HỆT FULL.
// Chạy: node 4_TESTS/bench/r34.bench.cjs [Backend.gs]   Biến: BENCH_N=3000 BENCH_R=5
const vm=require('vm'),path=require('path'),assert=require('assert'),seed=require('./_seed_po.cjs');
const N=+(process.env.BENCH_N||3000),R=+(process.env.BENCH_R||5),src=process.argv[2]||path.join(__dirname,'..','..','1_BACKEND','Backend.gs');
const admin={id:'ad',email:'ad@x.vn',displayName:'AD',role:'ADMIN',scope:{allPartners:true}},user={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},narrow={id:'u2',email:'b@x.vn',displayName:'B',role:'APPROVER',scope:{partnerIds:['p1','p2','p3'],businessGroups:['G1']}};
function mk(){const E=require('./_env.cjs')(src),{ctx,C,S,cache}=E;const fx=seed(ctx,N);return {E,ctx,C,S,cache,fx}}
function setPerf(ctx,on,gap){ctx.resetMemoDirect_();ctx.dispatch_(admin,'perf.set',{requestId:'cfg'+Math.random(),payload:{listSlice:on,sliceGap:gap}});ctx.resetMemoDirect_()}
const base={direction:'AR',asOf:'2026-10-25',pageSize:25,page:1};
const VAR=[base,{...base,direction:'AP'},{...base,page:3},{...base,q:'CT-12'},{...base,q:'PO12'},{...base,sort:'outstandingMinor',dir:'desc'},{...base,sort:'partnerName',dir:'asc'},{...base,status:'POSTED'},{...base,adv:{sel:{orderId:['o12']}}},{...base,adv:{flag:{noOrder:true}}},{...base,adv:{flag:{overdue:true}}},{...base,adv:{flag:{hasWarning:true}}},{...base,from:'2026-02-01',to:'2026-06-30'},{...base,onlyOutstanding:true}];
const strip=r=>{const c=JSON.parse(JSON.stringify(r));delete c.read;delete c.dataVersion;return c};
function measure(m,label,mode,payload,user_){
  const {ctx,C,S,cache}=m,rows=[];
  for(let i=0;i<R;i++){
    if(mode==='cold'){Object.keys(cache).forEach(k=>delete cache[k]);vm.runInContext('MEMO_.cacheOk=false;',ctx)}
    else if(mode==='coldcache'){Object.keys(cache).forEach(k=>delete cache[k]);vm.runInContext('MEMO_.cacheOk=true;',ctx);}
    else if(mode==='warm'){vm.runInContext('MEMO_.cacheOk=true;',ctx);ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);ctx.cachePrefetch_&&ctx.cachePrefetch_();if(i===0){ctx.dispatch_(user_||user,'doc.list',{requestId:'w',payload})}}
    else if(mode==='afterwrite'){vm.runInContext('MEMO_.cacheOk=true;',ctx);ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);ctx.cachePrefetch_&&ctx.cachePrefetch_();ctx.dispatch_(user_||user,'doc.list',{requestId:'w0',payload});ctx.bumpGen_('DebtLine');ctx.bumpGen_('DebtDoc');ctx.bumpGen_('Allocation')}
    ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk='+(mode==='cold'?'false':'true')+';',ctx);if(mode!=='cold'&&ctx.cachePrefetch_)ctx.cachePrefetch_();
    Object.keys(C).forEach(k=>C[k]=0);S.getValues=0;S.cells=0;S.by={};
    const t0=process.hrtime.bigint(),r=ctx.dispatch_(user_||user,'doc.list',{requestId:'r',payload});const ms=Number(process.hrtime.bigint()-t0)/1e6;
    rows.push({reads:S.getValues,cells:S.cells,ms,total:r.total,consistent:r.read&&r.read.consistent,by:Object.assign({},S.by)});
  }
  const ms=rows.map(x=>x.ms).sort((a,b)=>a-b),last=rows[rows.length-1];
  return {label,mode,reads:last.reads,cells:last.cells,msP50:Math.round(ms[Math.floor(ms.length/2)]),msMin:Math.round(ms[0]),msMax:Math.round(ms[ms.length-1]),samples:R,by:last.by,total:last.total};
}
const strategies0=[['FULL (hiện tại)',''],['SLICE gap=0','0'],['SLICE gap=1','1'],['SLICE gap=2','2'],['SLICE gap=3','3'],['SLICE gap=5','5'],['SLICE gap=8','8']];
const strategies=process.env.BENCH_ONLY_FULL==='1'?strategies0.slice(0,1):strategies0;  // BENCH_ONLY_FULL=1: chỉ đo đường FULL (dùng để so với Backend R3.3 không có perf.set)
const out=[],full={};
// kết quả chuẩn từ FULL
{const m=mk();VAR.forEach((p,i)=>{full[i]=strip(m.ctx.dispatch_(user,'doc.list',{requestId:'f',payload:p}))});full.narrow=strip(m.ctx.dispatch_(narrow,'doc.list',{requestId:'f',payload:base}));
 for(const [name,gap] of strategies){
  const m2=mk();if(name.startsWith('SLICE'))setPerf(m2.ctx,true,+gap)
  // tương đương
  let eq=true;VAR.forEach((p,i)=>{try{assert.deepStrictEqual(strip(m2.ctx.dispatch_(user,'doc.list',{requestId:'e',payload:p})),full[i])}catch(e){eq=false}});try{assert.deepStrictEqual(strip(m2.ctx.dispatch_(narrow,'doc.list',{requestId:'e',payload:base})),full.narrow)}catch(e){eq=false}
  const rows=[measure(m2,name,'cold',base),measure(m2,name,'coldcache',base),measure(m2,name,'warm',base),measure(m2,name,'afterwrite',base)];
  out.push({name,gap,equal:eq,rows});
 }}
console.log('R34 bench — N='+N+' chứng từ, R='+R+' lần/điều kiện. Số đo GIẢ LẬP (đếm lệnh/ô); ms là CPU Node, không đại diện Google.\n');
console.table(out.flatMap(o=>o.rows.map(r=>({'phương án':o.name,'điều kiện':r.mode,'lệnh đọc':r.reads,'ô đọc':r.cells,'ms p50':r.msP50,'ms min–max':r.msMin+'–'+r.msMax,'mẫu':r.samples,'kết quả = FULL':o.equal?'có':'KHÔNG'}))));
// phân tích cân bằng: mỗi lệnh đọc thêm đổi lấy bao nhiêu ô tiết kiệm (điểm hòa vốn theo chi phí tương đối lệnh/ô)
const f=out[0].rows[0];console.log('\nSo với FULL (tải lạnh): lệnh '+f.reads+', ô '+f.cells);
console.table(out.slice(1).map(o=>{const r=o.rows[0],dR=r.reads-f.reads,dC=f.cells-r.cells;return {'phương án':o.name,'Δ lệnh':'+'+dR,'ô tiết kiệm':dC,'% ô giảm':(100*dC/f.cells).toFixed(1)+'%','ô tiết kiệm / lệnh thêm':dR>0?Math.round(dC/dR):'—','chỉ có lợi nếu 1 lệnh getValues tốn hơn bao nhiêu ô đọc':dR>0?'< '+Math.round(dC/dR)+' ô':'luôn lợi'}}));
require('fs').writeFileSync(path.join(__dirname,'KET_QUA_R34.json'),JSON.stringify({N,R,note:'giả lập',out},null,1));
if(out.some(o=>!o.equal)){console.log('\nKẾT QUẢ KHÁC FULL ở: '+out.filter(o=>!o.equal).map(o=>o.name).join(', '));process.exitCode=1}
