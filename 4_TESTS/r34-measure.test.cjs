// measureDocList (đo từng bước trên staging): chạy được trên giả lập, chỉ đọc, báo đúng cấu trúc, không có p95 khi n<20, khôi phục cờ PERF_LIST_SLICE; stat.steps có trong phản hồi.
const assert=require('assert'),path=require('path');
const makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs'),SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
suite('1. measureDocList: cấu trúc, p50 luôn có, p95 chỉ khi n≥20, khôi phục cờ, không ghi dữ liệu',()=>{
  const e=makeEnv(SRCP),{ctx}=e;seed(ctx,200);ctx.todayVn_=()=>'2026-10-25';const rows0=ctx.repoValid_('DebtLine').length;
  const r=ctx.measureDocList(3,true);eq(r.n,3);eq(r.slice,true);for(const c of ['coldNoCache','cacheEmpty','warmTableCache','afterWrite'])ok(r.conditions[c]&&r.conditions[c].msP50>=0,c);
  eq(r.conditions.coldNoCache.msP95,null,'n<20 không có p95');ok(/không tính p95/.test(r.p95Note));ok(r.conditions.coldNoCache.reads>0&&r.conditions.coldNoCache.cells>0);eq(r.conditions.warmTableCache.reads,0,'bảng ấm không đọc Sheet');
  ok(r.conditions.coldNoCache.steps.readMs&&r.conditions.coldNoCache.steps.ledgerMs!==undefined&&r.conditions.coldNoCache.steps.filterSortMs!==undefined&&r.conditions.coldNoCache.steps.pageMs!==undefined,JSON.stringify(Object.keys(r.conditions.coldNoCache.steps)));
  eq(ctx.props_().getProperty('PERF_LIST_SLICE'),'0','khôi phục cờ về trạng thái trước (TẮT)');eq(ctx.repoValid_('DebtLine').length,rows0,'không ghi/xóa dữ liệu');
  const r2=ctx.measureDocList(20,false);ok(r2.conditions.coldNoCache.msP95!==null&&r2.conditions.coldNoCache.msP95>=r2.conditions.coldNoCache.msP50,'n≥20 có p95');
});
suite('2. Đường doc.list cũng chạy ở chế độ chọn cột và kết quả đồng nhất khi đo (bảo hiểm)',()=>{
  const e=makeEnv(SRCP),{ctx}=e;seed(ctx,120);ctx.todayVn_=()=>'2026-10-25';const u={id:'u',email:'u',role:'APPROVER',scope:{allPartners:true}};ctx.measureDocList(1,true);const a=ctx.docList_(u,{payload:{direction:'AR',pageSize:5}});ctx.measureDocList(1,false);const b=ctx.docList_(u,{payload:{direction:'AR',pageSize:5}});eq(JSON.stringify(a.items),JSON.stringify(b.items));
});
console.log('Tổng kiểm tra:',steps);
