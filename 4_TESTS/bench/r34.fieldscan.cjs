// Quét TRƯỜNG thực sự được đọc trên đường doc.list (DebtDoc/DebtLine/Allocation) bằng Proxy, qua nhiều biến thể lọc/sắp xếp/phân trang.
// Dùng để quyết định có thể đọc chọn cột hay không. Chạy: node 4_TESTS/bench/r34.fieldscan.cjs [Backend.gs]  (BENCH_N=3000)
const path=require('path'),seed=require('./_seed_po.cjs');
const src=process.argv[2]||path.join(__dirname,'..','..','1_BACKEND','Backend.gs'),N=+(process.env.BENCH_N||600);
const E=require('./_env.cjs')(src),{ctx}=E;seed(ctx,N);
const user={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}};
const WATCH={DebtDoc:new Set(),DebtLine:new Set(),Allocation:new Set()},LEAK={DebtDoc:0,DebtLine:0,Allocation:0};
const orig=ctx.repoValid_;
ctx.repoValid_=function(t){const rows=orig.call(this,t);if(!WATCH[t])return rows;return rows.map(r=>new Proxy(r,{get(o,k){if(typeof k==='string')WATCH[t].add(k);return o[k]},ownKeys(o){LEAK[t]++;return Reflect.ownKeys(o)},has(o,k){if(typeof k==='string')WATCH[t].add(k);return k in o}}))};
const base={direction:'AR',asOf:'2026-10-25',pageSize:25,page:1};
const variants=[base,{...base,direction:'AP'},{...base,page:2},{...base,q:'CT-12'},{...base,q:'PO12'},{...base,sort:'docDate',dir:'asc'},{...base,sort:'outstanding',dir:'desc'},{...base,status:'POSTED'},{...base,currency:'VND'},
 {...base,adv:{sel:{orderId:['o12']}}},{...base,adv:{flag:{noOrder:true}}},{...base,adv:{flag:{overdue:true}}},{...base,adv:{range:{outstanding:{min:1}}}},{...base,partnerId:'p3'},{...base,from:'2026-02-01',to:'2026-06-30'}];
const res=[];for(const v of variants){ctx.resetMemoDirect_&&ctx.resetMemoDirect_();try{const r=ctx.dispatch_(user,'doc.list',{requestId:'r',payload:v});res.push((r&&r.total!==undefined?r.total:'?')+'')}catch(e){res.push('ERR '+e.code)}}
console.log('Tổng bản ghi từng biến thể:',res.join(' '));
for(const t of Object.keys(WATCH)){const cols=ctx.parseCols_(t).map(c=>c.name),used=[...WATCH[t]].filter(k=>cols.includes(k)).sort((a,b)=>cols.indexOf(a)-cols.indexOf(b));console.log('\n'+t+': dùng '+used.length+'/'+cols.length+' cột; ownKeys/spread '+LEAK[t]+' lần\n  dùng: '+used.join(', ')+'\n  KHÔNG dùng: '+cols.filter(c=>!used.includes(c)).join(', '))}
