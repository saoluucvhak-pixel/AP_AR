// Cache đọc: đọc ấm cho cùng kết quả với đọc nguội; ghi làm cache cũ mất hiệu lực; khóa phiên bản/đầu khác nhau thì bỏ qua; getAll gộp khóa. Cache giả, KHÔNG phải Apps Script thật.
const assert=require('assert'),path=require('path'),vm=require('vm');
const makeEnv=require('./bench/_env.cjs');
const {ctx,C}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
ctx.repoSheet_('Partner');
const mk=(id,n)=>({id,shortName:n,legalName:n,isCustomer:1,isSupplier:0,status:'ACTIVE',version:1,isDeleted:0,commitState:'C'});
ctx.repoAppend_('Partner',[mk('a','A'),mk('b','B')]);
const eq0=(a,b,m)=>assert.strictEqual(a,b,m);
const flags=on=>vm.runInContext('MEMO_.cacheOk='+on+';',ctx);
const read=()=>{ctx.resetMemoDirect_();flags(true);ctx.cachePrefetch_();return ctx.repoValid_('Partner').map(x=>x.id).sort().join(',')};
const cold=read();assert.strictEqual(cold,'a,b');
Object.keys(C).forEach(k=>C[k]=0);const warm=read();assert.strictEqual(warm,'a,b','đọc ấm = đọc nguội');
assert.strictEqual(C.get,0,'không còn lệnh get lẻ');assert.ok(C.getAll<=2,'gộp bằng getAll: '+C.getAll);
// ghi mới + bumpGen_: cache cũ không được dùng
ctx.repoAppend_('Partner',[mk('c','C')]);ctx.bumpGen_('Partner');
assert.strictEqual(read(),'a,b,c','sau ghi thấy dữ liệu mới');
assert.strictEqual(read(),'a,b,c','đọc ấm lại sau khi nạp lại cache');
// đầu cache của phiên bản khác (không khớp gen) -> bỏ qua, đọc lại từ Sheet
ctx.bumpGen_('Partner');ctx.resetMemoDirect_();flags(true);ctx.cachePrefetch_();assert.strictEqual(ctx.repoValid_('Partner').length,3,'gen đổi: đọc lại Sheet');
// cache tắt (ghi): không đụng cache
flags(false);ctx.resetMemoDirect_();Object.keys(C).forEach(k=>C[k]=0);ctx.repoValid_('Partner');assert.strictEqual(C.get+C.getAll,0,'đường ghi không dùng cache');
// ---- bộ nhớ đệm kết quả đọc (cachedRead_) ----
const U=(id,role,scope)=>({id,role,scope:scope||{allPartners:true}});let runs=0;const run=v=>()=>{runs++;return {v,n:runs}};
ctx.resetMemoDirect_();flags(true);
const a1=ctx.cachedRead_(U('u1','APPROVER'),'doc.list',{page:1},5,run('A'));eq0(a1.n,1,'lần đầu chạy thật');
const a2=ctx.cachedRead_(U('u1','APPROVER'),'doc.list',{page:1},5,run('B'));eq0(a2.n,1,'lần hai lấy từ đệm, không chạy lại');eq0(runs,1);
ctx.cachedRead_(U('u1','APPROVER'),'doc.list',{page:2},5,run('C'));eq0(runs,2,'khác tham số → chạy lại');
ctx.cachedRead_(U('u1','APPROVER'),'doc.list',{page:1},6,run('D'));eq0(runs,3,'dữ liệu đã đổi phiên bản (có ghi) → chạy lại');
ctx.cachedRead_(U('u2','APPROVER'),'doc.list',{page:1},5,run('E'));eq0(runs,4,'khác người dùng → khác khóa');
ctx.cachedRead_(U('u1','APPROVER',{allPartners:false,partnerIds:['p1']}),'doc.list',{page:1},5,run('F'));eq0(runs,5,'cùng người nhưng khác phạm vi → khác khóa (không lộ dữ liệu)');
ctx.cachedRead_(U('u1','VIEWER'),'doc.list',{page:1},5,run('G'));eq0(runs,6,'khác vai trò → khác khóa');
ctx.cachedRead_(U('u1','APPROVER'),'report.export',{page:1},5,run('H'));ctx.cachedRead_(U('u1','APPROVER'),'report.export',{page:1},5,run('H'));eq0(runs,8,'hành động không thuộc danh sách đọc thuần không bao giờ bị đệm');
flags(false);ctx.cachedRead_(U('u1','APPROVER'),'doc.list',{page:1},5,run('I'));eq0(runs,9,'đường ghi (cacheOk=false) không dùng đệm');flags(true);
let big=0;const bigRun=()=>{big++;return {x:'z'.repeat(95000)}};ctx.cachedRead_(U('u3','APPROVER'),'doc.list',{p:1},5,bigRun);ctx.cachedRead_(U('u3','APPROVER'),'doc.list',{p:1},5,bigRun);eq0(big,2,'kết quả quá 90KB không đệm');
let thrown=0;try{ctx.cachedRead_(U('u4','APPROVER'),'doc.list',{p:1},5,()=>{throw new Error('boom')})}catch(e){thrown++}eq0(thrown,1,'lỗi không bị nuốt và không bị đệm');
eq0(ctx.cachedRead_(U('u4','APPROVER'),'doc.list',{p:1},5,run('J')).v,'J','sau lỗi chạy lại bình thường');
// làm ấm cache bảng
ctx.bumpGen_('Partner');ctx.resetMemoDirect_();Object.keys(C).forEach(k=>C[k]=0);ctx.warmCache_();
ctx.resetMemoDirect_();flags(true);ctx.cachePrefetch_();Object.keys(C).forEach(k=>C[k]=0);ctx.repoValid_('Partner');eq0(C.getAll<=2&&C.put===0&&C.putAll===0,true,'sau khi làm ấm, đọc bảng không phải nạp lại từ Sheet');
console.log('OK cache: đọc ấm = nguội, ghi làm mất hiệu lực, gộp getAll, đệm kết quả đọc theo người dùng/phạm vi/phiên bản, làm ấm');
