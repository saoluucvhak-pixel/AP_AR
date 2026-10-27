// R34: đọc CHỌN CỘT cho doc.list (cờ PERF_LIST_SLICE, mặc định TẮT). Kết quả phải GIỐNG HỆT đọc nguyên bảng ở mọi gap, bảo toàn tổng bản ghi/số dư/phạm vi quyền,
// cache chỉ tăng tốc (mất/hỏng chunk, đổi generation), rào phiên bản đọc (SERVER_BUSY) vẫn áp dụng, quyền bật/tắt đúng. Engine thật + Sheet/Cache giả.
const assert=require('assert'),path=require('path'),vm=require('vm');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)},deq=(a,b,m)=>{steps++;assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const ADM={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},LIM={id:'u2',email:'l@x.vn',role:'APPROVER',scope:{partnerIds:['p3','p6','p9'],businessGroups:['G1']}},SUP={id:'ad',email:'ad@x.vn',role:'ADMIN',scope:{allPartners:true}};
function env(N,slice,gap){const e=makeEnv(SRCP);seed(e.ctx,N||300);e.ctx.todayVn_=()=>'2026-10-25';if(slice)setPerf(e.ctx,true,gap);return e}
function setPerf(ctx,on,gap){ctx.resetMemoDirect_();ctx.dispatch_(SUP,'perf.set',{requestId:'p'+Math.random(),payload:{listSlice:on,sliceGap:gap}});ctx.resetMemoDirect_()}
const q=(ctx,u,p)=>ctx.dispatch_(u,'doc.list',{requestId:'r'+Math.random(),payload:Object.assign({direction:'AR',asOf:'2026-10-25',pageSize:25,page:1},p||{})});
const norm=r=>{const c=JSON.parse(JSON.stringify(r));delete c.dataVersion;return c};
const CASES=[{},{q:'PO12'},{q:'NCC-3'},{q:'CT-1'},{adv:{sel:{orderId:['o12']}}},{adv:{flag:{noOrder:true}}},{adv:{flag:{overdue:true}}},{adv:{flag:{hasWarning:true}}},{page:3,pageSize:10},{sort:'totalGrossMinor',dir:'asc'},{sort:'outstandingMinor',dir:'desc'},{sort:'partnerName'},{status:'POSTED'},{onlyOutstanding:true},{from:'2026-02-01',to:'2026-06-30'}];
suite('1. Mặc định TẮT; bật/tắt bằng perf.set cần quyền quản trị, gap hợp lệ 0–8',()=>{
  const e=env(60);eq(e.ctx.dispatch_(SUP,'perf.get',{requestId:'g',payload:{}}).listSlice,false);
  eq((()=>{try{e.ctx.dispatch_(ADM,'perf.set',{requestId:'x1',payload:{listSlice:true}});return 'OK'}catch(x){return x.code}})(),'FORBIDDEN','không phải quản trị');
  eq((()=>{try{e.ctx.dispatch_(SUP,'perf.set',{requestId:'x2',payload:{listSlice:true,sliceGap:9}});return 'OK'}catch(x){return x.code}})(),'VALIDATION_FAILED');
  eq((()=>{try{e.ctx.dispatch_(SUP,'perf.set',{requestId:'x3',payload:{listSlice:true,sliceGap:'a'}});return 'OK'}catch(x){return x.code}})(),'VALIDATION_FAILED');
  const r=e.ctx.dispatch_(SUP,'perf.set',{requestId:'x4',payload:{listSlice:true,sliceGap:2}});deq(r,{listSlice:true,sliceGap:2});deq(e.ctx.dispatch_(SUP,'perf.get',{requestId:'g2',payload:{}}),{listSlice:true,sliceGap:2});
  e.ctx.dispatch_(SUP,'perf.set',{requestId:'x5',payload:{listSlice:false}});eq(e.ctx.dispatch_(SUP,'perf.get',{requestId:'g3',payload:{}}).listSlice,false);eq(e.ctx.dispatch_(SUP,'perf.get',{requestId:'g4',payload:{}}).sliceGap,2,'giữ gap khi chỉ tắt');
});
suite('2. Kết quả chọn cột = nguyên bảng ở mọi gap 0–8, AR/AP, người đủ quyền và người hẹp quyền',()=>{
  for(const gap of [0,1,2,3,5,8])for(const dir of ['AR','AP'])for(const u of [ADM,LIM]){
    const a=env(300),b=env(300,true,gap);
    for(const p of CASES){const x=q(a.ctx,u,Object.assign({direction:dir},p)),y=q(b.ctx,u,Object.assign({direction:dir},p));deq(norm(y),norm(x),'gap '+gap+' '+dir+' '+u.id+' '+JSON.stringify(p))}
  }
});
suite('3. Số dư, tổng theo tiền tệ và tổng bản ghi không đổi khi có điều chỉnh/đảo/phân bổ/Split (dữ liệu giả lập có đủ)',()=>{
  const a=env(600),b=env(600,true,3);const x=q(a.ctx,ADM,{pageSize:200}),y=q(b.ctx,ADM,{pageSize:200});deq(y.totalsByCurrency,x.totalsByCurrency);eq(y.total,x.total);ok(x.items.some(i=>i.docType==='ADJ_INC'||i.allocatedMinor>0),'dữ liệu có điều chỉnh/phân bổ');
  eq(JSON.stringify(y.items.map(i=>[i.id,i.outstandingMinor,i.allocatedMinor,i.payStatus])),JSON.stringify(x.items.map(i=>[i.id,i.outstandingMinor,i.allocatedMinor,i.payStatus])));
});
suite('4. Đo lệnh/ô: chọn cột đọc ÍT Ô hơn nguyên bảng; cache bảng ấm = 0 lần đọc Sheet; kết quả đệm giữ nguyên',()=>{
  const cnt=(e,mode)=>{const {ctx,S,cache}=e;if(mode==='cold'){Object.keys(cache).forEach(k=>delete cache[k]);vm.runInContext('MEMO_.cacheOk=false;',ctx)}else vm.runInContext('MEMO_.cacheOk=true;',ctx);ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk='+(mode==='cold'?'false':'true')+';',ctx);if(mode!=='cold'&&ctx.cachePrefetch_)ctx.cachePrefetch_();S.getValues=0;S.cells=0;q(ctx,ADM);return {reads:S.getValues,cells:S.cells}};
  const full=env(400),sl=env(400,true,3),f=cnt(full,'cold'),s=cnt(sl,'cold');ok(s.cells<f.cells*0.8,'ô: '+s.cells+' < 80% của '+f.cells);ok(s.reads>f.reads,'số lệnh đọc tăng: '+s.reads+' > '+f.reads+' (đánh đổi đã biết)');
  cnt(sl,'warmup');const w=cnt(sl,'warm');eq(w.reads,0,'bảng ấm không đọc Sheet');
});
suite('5. Cache chỉ tăng tốc: chunk lát cắt mất/hỏng, generation đổi → vẫn đúng nguồn',()=>{
  const e=env(300,true,3),{ctx,cache}=e;vm.runInContext('MEMO_.cacheOk=true;',ctx);const ref=norm(q(ctx,ADM));
  ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);ctx.cachePrefetch_&&ctx.cachePrefetch_();const keys=Object.keys(cache).filter(k=>/^ts:(DebtDoc|DebtLine|Allocation)/.test(k));ok(keys.length>0,'có chunk lát cắt trong cache: '+Object.keys(cache).slice(0,5));
  keys.forEach(k=>{cache[k]='không phải JSON {{'});ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);deq(norm(q(ctx,ADM)),ref,'chunk hỏng');
  keys.forEach(k=>delete cache[k]);ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);deq(norm(q(ctx,ADM)),ref,'chunk mất');
  // ghi giữa hai lần đọc: sửa tổng một dòng rồi đổi generation → lần đọc sau thấy dữ liệu mới
  const lines=ctx.repoReadAll_('DebtLine'),l0=lines.find(l=>l.docId==='d2'&&!l.adjustsLineId);ctx.repoWriteRow_('DebtLine',l0._row,Object.assign({},l0,{grossMinor:l0.grossMinor+777}));ctx.bumpGen_('DebtLine');ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);
  const after=q(ctx,ADM,{pageSize:200}),before=ref,x=after.items.find(i=>i.id==='d2');ok(x&&x.totalGrossMinor===1000*3+777,'thấy dữ liệu mới sau khi đổi generation: '+(x&&x.totalGrossMinor));
  const plain=env(300);const lines2=plain.ctx.repoReadAll_('DebtLine'),m0=lines2.find(l=>l.docId==='d2'&&!l.adjustsLineId);plain.ctx.repoWriteRow_('DebtLine',m0._row,Object.assign({},m0,{grossMinor:m0.grossMinor+777}));deq(norm(after),norm(q(plain.ctx,ADM,{pageSize:200})),'giống đọc nguyên bảng sau ghi');
});
suite('6. Rào phiên bản đọc vẫn áp dụng cho đường chọn cột: đổi phiên bản giữa các lần đọc bảng → SERVER_BUSY (không trả bản trộn gắn nhãn mới)',()=>{
  const e=env(120,true,3),{ctx}=e,v=ctx.beginReadSnapshot_();const orig=ctx.repoSliceValid_;let calls=0;ctx.repoSliceValid_=function(t,n,g){const r=orig.call(this,t,n,g);if(++calls===2)ctx.bumpDataVersion_();return r};
  q(ctx,ADM);ctx.repoSliceValid_=orig;let code='OK';try{ctx.assertReadSnapshot_(v)}catch(x){code=x.code}eq(code,'SERVER_BUSY');
  const e2=env(120,true,3),v2=e2.ctx.beginReadSnapshot_();q(e2.ctx,ADM);eq((()=>{try{e2.ctx.assertReadSnapshot_(v2);return 'OK'}catch(x){return x.code}})(),'OK','không đổi → đạt');
});
suite('7. Thao tác tài chính KHÔNG dùng đường chọn cột/cache báo cáo: loadLedger_ ngoài doc.list luôn đọc đủ cột từ nguồn',()=>{
  const e=env(120,true,3),{ctx}=e;q(ctx,ADM);eq(vm.runInContext('MEMO_.listSlice',ctx),false,'cờ được xóa sau doc.list');ctx.resetMemoDirect_();const led=ctx.loadLedger_(ADM,'2026-10-25');ok(led.lines.length>0&&Object.prototype.hasOwnProperty.call(led.lines[0],'netMinor')&&Object.prototype.hasOwnProperty.call(led.docs[0],'invoiceSerial'),'loadLedger_ ngoài doc.list trả đủ trường');
  ok(!/listRows_\(/.test(String(ctx.paymentAllocate_))&&!/listRows_\(/.test(String(ctx.docPost_||'')),'đường ghi/phân bổ không gọi listRows_');
});
console.log('Tổng kiểm tra:',steps);
