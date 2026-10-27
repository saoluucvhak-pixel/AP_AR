// Đo trên GIẢ LẬP (Sheet/Cache giả đếm lệnh gọi) với dữ liệu có PO thật: Order, Accrual (gắn dòng hóa đơn), AccrualSplit, hóa đơn nhiều dòng, điều chỉnh, thanh toán, phân bổ.
// KHÔNG phải số đo trên Google thật; ms (Node) không dùng để cam kết tốc độ Apps Script.
// Chạy: node 4_TESTS/bench/po.bench.cjs [Backend_cũ.gs]    (BENCH_N=3000 chứng từ mặc định)
const vm=require('vm'),path=require('path');
const seed=require('./_seed_po.cjs');
function run(srcPath,N){
  const E=require('./_env.cjs')(srcPath),{ctx,C,S,cache}=E;const fx=seed(ctx,N);
  const user={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}};
  function call1(label,action,payload,mode){
    if(mode==='coldcache')Object.keys(cache).forEach(k=>delete cache[k]);
    if(mode==='afterwrite'){ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);if(ctx.cachePrefetch_)ctx.cachePrefetch_();ctx.dispatch_(user,action,{requestId:'w',payload});ctx.bumpGen_('Accrual');ctx.bumpGen_('DebtLine');}
    ctx.resetMemoDirect_&&ctx.resetMemoDirect_();Object.keys(C).forEach(k=>C[k]=0);S.getValues=0;S.cells=0;S.by={};
    vm.runInContext('MEMO_.cacheOk='+(mode!=='cold'?'true':'false')+';',ctx);
    if(mode!=='cold'&&ctx.cachePrefetch_)ctx.cachePrefetch_();
    const t0=process.hrtime.bigint();
    const r=mode==='result'&&ctx.cachedRead_?ctx.cachedRead_(user,action,payload,7,()=>ctx.dispatch_(user,action,{requestId:'r',payload})):ctx.dispatch_(user,action,{requestId:'r',payload});
    const ms=Number(process.hrtime.bigint()-t0)/1e6;
    return {label,reads:S.getValues,cells:S.cells,cacheGet:C.get+C.getAll,cachePut:C.put+C.putAll,bytes:JSON.stringify(r).length,total:r&&r.total,ms:Math.round(ms),by:Object.assign({},S.by)};
  }
  const R=+(process.env.BENCH_R||5);
  function call(label,action,payload,mode){const rs=[];for(let i=0;i<R;i++)rs.push(call1(label,action,payload,mode));const ms=rs.map(x=>x.ms).sort((a,b)=>a-b);const m=rs[rs.length-1];m.ms=ms[Math.floor(ms.length/2)];m.msMin=ms[0];m.msMax=ms[ms.length-1];return m}
  const base={direction:'AR',asOf:'2026-10-25',pageSize:25,page:1},out=[];
  out.push(call('Tải lạnh: trang 1, không lọc PO','doc.list',base,'cold'));
  out.push(call('Tải lạnh: tìm theo số PO (q=PO12)','doc.list',Object.assign({},base,{q:'PO12'}),'cold'));
  out.push(call('Tải lạnh: lọc orderId=o12','doc.list',Object.assign({},base,{adv:{sel:{orderId:['o12']}}}),'cold'));
  out.push(call('Tải lạnh: noOrder','doc.list',Object.assign({},base,{adv:{flag:{noOrder:true}}}),'cold'));
  out.push(call('Cache bật nhưng trống (tải lạnh thật): trang 1','doc.list',base,'coldcache'));
  out.push(call('Cache bật nhưng trống: lọc orderId=o12','doc.list',Object.assign({},base,{adv:{sel:{orderId:['o12']}}}),'coldcache'));
  out.push(call('Bảng đã ấm (cache bảng): trang 1','doc.list',base,'warm'));
  out.push(call('Bảng đã ấm: lọc orderId=o12','doc.list',Object.assign({},base,{adv:{sel:{orderId:['o12']}}}),'warm'));
  out.push(call('Ngay sau khi ghi (đổi phiên bản Accrual + DebtLine): trang 1','doc.list',base,'afterwrite'));
  out.push(call('Đệm kết quả: lần 1','doc.list',base,'result'));
  out.push(call('Đệm kết quả: lần 2 (trúng)','doc.list',base,'result'));
  return {fx,out};
}
const N=+(process.env.BENCH_N||3000),cur=path.join(__dirname,'..','..','1_BACKEND','Backend.gs'),old=process.argv[2];
const show=(t,r)=>{console.log('\n'+t+' — N='+N+' chứng từ; dữ liệu: '+JSON.stringify(r.fx));console.log('Ô đọc theo bảng ở kịch bản tải lạnh đầu tiên: '+JSON.stringify(r.out[0].by));console.table(r.out.map(x=>({'kịch bản':x.label,'lần đọc Sheet':x.reads,'ô đọc':x.cells,'lệnh cache get':x.cacheGet,'lệnh cache put':x.cachePut,'byte phản hồi':x.bytes,'tổng bản ghi':x.total,'ms trung vị (Node)':x.ms,'ms min–max':x.msMin+'–'+x.msMax})))};
if(old)show('TRƯỚC SỬA ('+old+')',run(old,N));
show('SAU SỬA',run(cur,N));
const bySheet=r=>r.out.slice(0,1).map(x=>JSON.stringify(x.by)).join('');
console.log('\nĐo trên giả lập (Node + Sheet/Cache giả đếm lệnh). ms phụ thuộc máy chạy và không đại diện cho Google Apps Script thật.');
