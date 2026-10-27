// Đo trên GIẢ LẬP (Sheet/Cache giả đếm lệnh gọi): số lần đọc Sheets, số ô đọc, số lần gọi CacheService, kích thước phản hồi. KHÔNG phải số đo trên Google thật.
// Chạy: node 4_TESTS/bench/perf.bench.cjs [đường_dẫn_Backend_cũ.gs]   (không có đối số: chỉ đo bản hiện tại)
const vm=require('vm'),path=require('path');
function run(srcPath,N){
  const {ctx,C,S}=require('./_env.cjs')(srcPath);
  const T=['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','Order','Accrual','AccrualSplit'];T.forEach(t=>ctx.repoSheet_(t));
  const partners=[];for(let i=0;i<60;i++)partners.push({id:'p'+i,shortName:'KH'+i,legalName:'KH'+i,isCustomer:1,isSupplier:i%3===0?1:0,status:'ACTIVE',version:1,isDeleted:0,commitState:'C'});ctx.repoAppend_('Partner',partners);
  const docs=[],lines=[],pays=[],allocs=[];
  for(let i=0;i<N;i++){const d={id:'d'+i,docNo:'CT-'+i,direction:i%2?'AP':'AR',docType:'INVOICE',partnerId:'p'+(i%60),currency:i%7?'VND':'USD',businessGroupCode:'G1',docDate:'2026-0'+(1+i%9)+'-1'+(i%9),postingDate:'2026-0'+(1+i%9)+'-1'+(i%9),status:'POSTED',totalGrossMinor:3000+i,dueDate:i%5?'2026-1'+(i%3)+'-20':'',isOpening:0,version:1,isDeleted:0,commitState:'C',createdAt:'2026-01-01T00:00:00Z',warningsJson:''};docs.push(d);
    for(let k=0;k<2;k++){lines.push({id:'l'+i+'_'+k,docId:d.id,lineNo:k+1,feeTypeCode:'F',description:'Phí '+k,netMinor:(1500+i/2)|0,grossMinor:k?3000+i-((1500+i/2)|0):(1500+i/2)|0,vatMinor:0,vatMode:'NONE',version:1,isDeleted:0,commitState:'C'})}
    if(i%3===0)allocs.push({id:'a'+i,paymentId:'y'+(i%800),debtLineId:'l'+i+'_0',docId:d.id,amountMinor:500,effectiveDate:'2026-10-01',version:1,isDeleted:0,commitState:'C'});}
  for(let i=0;i<800;i++)pays.push({id:'y'+i,payNo:'PT-'+i,direction:'IN',partnerId:'p'+(i%60),currency:'VND',amountMinor:100000,effectiveDate:'2026-10-0'+(1+i%9),method:'BANK',status:'POSTED',version:1,isDeleted:0,commitState:'C'});
  ctx.repoAppend_('DebtDoc',docs);ctx.repoAppend_('DebtLine',lines);ctx.repoAppend_('Payment',pays);ctx.repoAppend_('Allocation',allocs);
  ctx.repoAppend_('Config',[{id:'ledgerStartDate',value:'2026-01-01',version:1,isDeleted:0,commitState:'C'}]);
  const user={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}};
  function call(action,payload,cacheOk){
    ctx.resetMemo_&&ctx.resetMemo_();ctx.MEMO_&&0;ctx.resetMemoDirect_&&ctx.resetMemoDirect_();
    Object.keys(C).forEach(k=>C[k]=0);S.getValues=0;S.cells=0;
    vm.runInContext('MEMO_.cacheOk='+(cacheOk?'true':'false')+';',ctx);
    if(cacheOk&&ctx.cachePrefetch_)ctx.cachePrefetch_();
    const t0=Date.now();const r=ctx.dispatch_(user,action,{requestId:'r',payload});const ms=Date.now()-t0;
    return {action:(cacheOk?'ấm/nguội ':'')+action,sheetReads:S.getValues,cells:S.cells,cacheGet:C.get,cacheGetAll:C.getAll,cacheKeysInGetAll:C.getAllKeys,cachePut:C.put+C.putAll,bytes:JSON.stringify(r).length,ms};
  }
  function callRc(action,payload,note){
    ctx.resetMemoDirect_();Object.keys(C).forEach(k=>C[k]=0);S.getValues=0;S.cells=0;
    vm.runInContext('MEMO_.cacheOk=true;',ctx);if(ctx.cachePrefetch_)ctx.cachePrefetch_();
    const t0=Date.now();const r=ctx.cachedRead_?ctx.cachedRead_(user,action,payload,7,()=>ctx.dispatch_(user,action,{requestId:'r',payload})):ctx.dispatch_(user,action,{requestId:'r',payload});const ms=Date.now()-t0;
    return {action:action,note:note,sheetReads:S.getValues,cells:S.cells,cacheGet:C.get,cacheGetAll:C.getAll,cacheKeysInGetAll:C.getAllKeys,cachePut:C.put+C.putAll,bytes:JSON.stringify(r).length,ms};
  }
  const out=[];
  out.push(Object.assign(call('doc.list',{direction:'AR',asOf:'2026-10-25',pageSize:25,page:1},false),{note:'không cache'}));
  out.push(Object.assign(call('doc.list',{direction:'AR',asOf:'2026-10-25',pageSize:25,page:1},true),{note:'cache nguội (lần đầu)'}));
  out.push(Object.assign(call('doc.list',{direction:'AR',asOf:'2026-10-25',pageSize:25,page:1},true),{note:'cache ấm'}));
  out.push(Object.assign(call('workbench.summary',{asOf:'2026-10-25'},true),{note:'Bàn làm việc, cache ấm'}));
  out.push(Object.assign(call('payment.list',{asOf:'2026-10-25',pageSize:25},true),{note:'cache ấm'}));
  if(ctx.cachedRead_){out.push(callRc('doc.list',{direction:'AR',asOf:'2026-10-25',pageSize:25,page:2},'đệm kết quả: lần 1 (bảng đã ấm)'));out.push(callRc('doc.list',{direction:'AR',asOf:'2026-10-25',pageSize:25,page:2},'đệm kết quả: lần 2 (trúng đệm)'));out.push(callRc('order.list',{pageSize:25,page:1},'đệm kết quả: lần 1 (chưa có đệm kết quả)'))}
  // Bảng tổng hợp định kỳ: dựng một lần (như bộ kích hoạt), sau đó người dùng chỉ đọc bảng nhỏ
  if(ctx.rmRefreshIfNeeded_){
    ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=true;',ctx);Object.keys(C).forEach(k=>C[k]=0);S.getValues=0;S.cells=0;const t0=Date.now(),rr=ctx.rmRefreshIfNeeded_(true);out.push({action:'bộ kích hoạt dựng '+rr.rebuilt.length+' bảng tổng hợp',note:'chạy nền, người dùng không chờ',sheetReads:S.getValues,cells:S.cells,cacheGet:C.get,cacheGetAll:C.getAll,cacheKeysInGetAll:C.getAllKeys,cachePut:C.put+C.putAll,bytes:0,ms:Date.now()-t0});
    out.push(Object.assign(call('summary.partners',{},false),{note:'đọc bảng tổng hợp (khách hàng + dư nợ)'}));
    out.push(Object.assign(call('summary.partners',{live:true},true),{note:'tính trực tiếp (để so sánh)'}));
    out.push(Object.assign(call('workbench.summary',{},false),{note:'Bàn làm việc đọc bảng tổng hợp'}));
  }
  return out;
}
const N=+(process.env.BENCH_N||3000),cur=path.join(__dirname,'..','..','1_BACKEND','Backend.gs'),old=process.argv[2];
const show=(t,rows)=>{console.log('\n'+t+' (N='+N+' chứng từ)');console.table(rows.map(r=>({'thao tác':r.action,'ghi chú':r.note,'lần đọc Sheet':r.sheetReads,'ô đọc':r.cells,'cache get':r.cacheGet,'cache getAll':r.cacheGetAll,'khóa trong getAll':r.cacheKeysInGetAll,'cache ghi':r.cachePut,'byte phản hồi':r.bytes,'ms (Node)':r.ms})))};
if(old)show('TRƯỚC: '+path.basename(path.dirname(old)),run(old,N));
show('SAU: bản hiện tại',run(cur,N));
console.log('\nĐo trên giả lập (Node + Sheet/Cache giả đếm lệnh); thời gian ms không đại diện cho Google Apps Script thật.');
