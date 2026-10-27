// Bảng tổng hợp định kỳ (ReadModel): dựng/ghi/đọc, khớp với tính trực tiếp, phạm vi người dùng, độ tươi, lọc live, chia mảnh, hàng rào đọc. Sheet/Cache giả, KHÔNG phải Apps Script thật.
const assert=require('assert'),path=require('path'),vm=require('vm');
const makeEnv=require('./bench/_env.cjs');
const {ctx,props}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
const J=x=>JSON.stringify(x);let steps=0;const eq=(a,b,m)=>{steps++;assert.strictEqual(J(a),J(b),m)},ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',String(e.message).split('\n').slice(0,6).join(' | '));process.exitCode=1}}
const base=o=>Object.assign({version:1,isDeleted:0,commitState:'C',txId:'',createdAt:'2026-10-01T00:00:00Z',createdBy:'t',updatedAt:'',updatedBy:''},o);
Object.keys(ctx).length;['Partner','Catalog','Config','DebtDoc','DebtLine','Allocation','Payment','Order','Accrual','AccrualSplit','ReadModel','DraftEntry','AuditLog','Period','AppUser'].forEach(t=>ctx.repoSheet_(t));
const cat=(id,t,c,a)=>base({id,catalogType:t,code:c,name:c,attrsJson:J(a||{}),active:1,sortOrder:1});
ctx.repoAppend_('Catalog',[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','CURRENCY','USD',{decimals:2}),cat('g1','BUSINESS_GROUP','G1'),cat('g2','BUSINESS_GROUP','G2'),cat('f','FEE_TYPE','F'),cat('s','SERVICE_CODE','FWD')]);
ctx.repoAppend_('Config',[base({id:'ledgerStartDate',value:'2026-01-01'})]);
const P=(id,n,c,s,tags)=>base({id,shortName:n,legalName:n,isCustomer:c,isSupplier:s,status:'ACTIVE',scopeTags:tags||'',taxCode:'',createdAt:''});
ctx.repoAppend_('Partner',[P('p1','KH-A',1,0),P('p2','KH-B',1,0),P('p3','NCC-X',0,1)]);
const D=(id,dir,pid,cur,grp,due,gross,date)=>base({id,docNo:id.toUpperCase(),direction:dir,docType:'INVOICE',partnerId:pid,currency:cur,businessGroupCode:grp,docDate:date||'2026-10-01',postingDate:date||'2026-10-01',status:'POSTED',totalGrossMinor:gross,dueDate:due,expectedPayDate:'',isOpening:0,createdAt:(date||'2026-10-01')+'T03:00:00.000Z',warningsJson:''});
const Ln=(id,doc,gross)=>base({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'x',netMinor:gross,grossMinor:gross,vatMinor:0,vatMode:'NONE'});
ctx.repoAppend_('DebtDoc',[D('d1','AR','p1','VND','G1','2026-10-20',1000),D('d2','AR','p1','USD','G1','2026-11-30',50000),D('d3','AR','p2','VND','G2','',700),D('d4','AP','p3','VND','G1','2026-10-28',500),D('d5','AR','p1','VND','G2','2026-12-01',300)]);
ctx.repoAppend_('DebtLine',[Ln('l1','d1',1000),Ln('l2','d2',50000),Ln('l3','d3',700),Ln('l4','d4',500),Ln('l5','d5',300)]);
ctx.repoAppend_('Payment',[base({id:'y1',payNo:'PT1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:600,effectiveDate:'2026-10-05',method:'BANK',cashAccountCode:'Q1',status:'POSTED'})]);
ctx.repoAppend_('Allocation',[base({id:'a1',paymentId:'y1',debtLineId:'l1',docId:'d1',amountMinor:400,effectiveDate:'2026-10-06'})]);
const O=(id,no,cp,g,st)=>base({id,orderNo:no,poNo:'PO'+no,customerPartnerId:cp,businessGroupCode:g,currency:'VND',orderDate:'2026-10-02',status:st||'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'H'+no}]),serviceCode:'FWD',hsdvNo:'H'+no});
ctx.repoAppend_('Order',[O('o1','DH-1','p1','G1'),O('o2','DH-2','p2','G2'),O('o3','DH-3','p1','G1','CLOSED')]);
const A=(id,o,k,n,x)=>base(Object.assign({id,orderId:o,kind:k,partnerId:k==='REVENUE'?'p1':'p3',accrualDate:'2026-10-03',feeTypeCode:'F',description:'d'+id,netMinor:n,vatMode:'NONE',vatMinor:0,grossMinor:n,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD'},x||{}));
ctx.repoAppend_('Accrual',[A('r1','o1','REVENUE',1000,{status:'INVOICED',docId:'d1',debtLineId:'l1'}),A('r2','o1','REVENUE',250),A('c1','o1','COST',400),A('c2','o2','COST',90),A('c3','','COST',60),A('c4','o1','COST',500,{status:'INVOICED',docId:'d4',debtLineId:'l4'}),A('r3','o3','REVENUE',100,{status:'INVOICED',docId:'d5',debtLineId:'l5'})]);
ctx.repoAppend_('AccrualSplit',[base({id:'s1',accrualId:'c3',orderId:'o1',shareNetMinor:40,shareVatMinor:0,shareGrossMinor:40,basis:'M'}),base({id:'s2',accrualId:'c3',orderId:'o2',shareNetMinor:20,shareVatMinor:0,shareGrossMinor:20,basis:'M'})]);
props.dataVersion='7';
const full={id:'f',email:'f@x',displayName:'F',role:'APPROVER',scope:{allPartners:true}};
const scoped={id:'s',email:'s@x',displayName:'S',role:'APPROVER',scope:{allPartners:false,partnerIds:['p1'],businessGroups:['G1']}};
const reset=()=>{ctx.resetMemoDirect_();vm.runInContext('MEMO_.cacheOk=false;',ctx)};
const TODAY='2026-10-25';
const U=(id,role)=>({id,email:id+'@x',displayName:id,role,scope:{allPartners:true}});
const UA=U('ua','ACCOUNTANT'),UB=U('ub','ACCOUNTANT'),UV=U('uv','AUDITOR');
const C=(u,fn,p)=>ctx[fn](u,{payload:p,requestId:'r'});
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
const DID='drf_abcdef123456';
suite('1. Lưu nháp: chủ sở hữu; gửi lại không tạo trùng; không đổi dataVersion, không ghi nhật ký',()=>{
  const v0=props.dataVersion,n0=ctx.repoValid_('AuditLog').length;
  const r1=C(UA,'draftSave_',{id:DID,kind:'DOC',title:'HĐ bán ABC',data:{lines:[1],partnerId:'p1'}});eq(r1.version,1);
  const r2=C(UA,'draftSave_',{id:DID,kind:'DOC',title:'HĐ bán ABC',data:{lines:[1,2],partnerId:'p1'}});eq(r2.version,2,'gửi lại cùng id → cập nhật, không thêm hàng');
  eq(ctx.repoValid_('DraftEntry').length,1);eq(props.dataVersion,v0,'không đổi dataVersion');eq(ctx.repoValid_('AuditLog').length,n0,'không ghi nhật ký');
  eq(C(UA,'draftGet_',{id:DID}).data.lines,[1,2]);eq(C(UA,'draftList_',{}).items.length,1);
});
suite('2. Người khác không đọc/ghi đè/xóa; người không có quyền lập thì không lưu nháp',()=>{
  eq(C(UB,'draftList_',{}).items.length,0,'B không thấy nháp của A');
  eq(code(()=>C(UB,'draftGet_',{id:DID})),'NOT_FOUND');eq(code(()=>C(UB,'draftSave_',{id:DID,kind:'DOC',data:{}})),'FORBIDDEN');eq(code(()=>C(UB,'draftDiscard_',{id:DID})),'NOT_FOUND');
  eq(C(UA,'draftGet_',{id:DID}).data.lines,[1,2],'nháp của A nguyên vẹn');
  eq(code(()=>C(UV,'draftSave_',{kind:'DOC',data:{}})),'FORBIDDEN');eq(code(()=>C(UA,'draftSave_',{kind:'XXX',data:{}})),'VALIDATION_FAILED');eq(code(()=>C(UA,'draftSave_',{id:'bad id',kind:'DOC',data:{}})),'VALIDATION_FAILED');
  eq(code(()=>C(UA,'draftSave_',{kind:'DOC',data:{pad:'z'.repeat(50000)}})),'VALIDATION_FAILED','quá lớn');
});
suite('3. Làm mới/dựng lại/vô hiệu hóa bảng tổng hợp KHÔNG đụng bản nháp',()=>{
  reset();ctx.rmRefreshIfNeeded_(true);reset();ctx.rmInvalidate_();reset();ctx.rmRefreshIfNeeded_(true);
  eq(C(UA,'draftGet_',{id:DID}).data.lines,[1,2]);eq(ctx.repoValid_('DraftEntry').length,1);
});
suite('4. Lưu thật thành công thì dọn nháp; lỗi thì giữ nháp; nháp đã dọn không "sống lại" khi gửi muộn',()=>{
  C(UA,'draftSave_',{id:'drf_keep00000001',kind:'PAYMENT',data:{a:1}});
  const orig=ctx.routes_;let fail=false;ctx.routes_=()=>({'doc.save':{fn:()=>{if(fail)throw Object.assign(new Error('x'),{code:'VALIDATION_FAILED'});return {id:'d9'}},write:true},'payment.save':{fn:()=>({id:'y9'}),write:true}});
  fail=true;eq(code(()=>ctx.dispatch_(UA,'doc.save',{payload:{draftId:DID}})),'VALIDATION_FAILED');eq(C(UA,'draftList_',{kind:'DOC'}).items.length,1,'lỗi → giữ nháp');
  fail=false;ctx.dispatch_(UA,'doc.save',{payload:{draftId:DID,draftVersion:C(UA,'draftGet_',{id:DID}).version}});eq(C(UA,'draftList_',{kind:'DOC'}).items.length,0,'lưu đúng phiên bản xong → dọn');
  eq(C(UA,'draftList_',{kind:'PAYMENT'}).items.length,1,'nháp khác loại không bị ảnh hưởng');
  ctx.dispatch_(UB,'doc.save',{payload:{draftId:'drf_keep00000001'}});eq(C(UA,'draftList_',{kind:'PAYMENT'}).items.length,1,'người khác không dọn được nháp của A');
  ctx.routes_=orig;
  eq(C(UA,'draftSave_',{id:DID,kind:'DOC',data:{late:1}}).discarded,true,'tự lưu muộn không làm nháp sống lại');eq(C(UA,'draftList_',{kind:'DOC'}).items.length,0);
});
suite('5. Bản nháp dựa trên bản ghi cũ: báo lỗi thời; bản ghi gốc mất thì báo mất',()=>{
  const d=ctx.repoValid_('DebtDoc')[0];
  C(UA,'draftSave_',{id:'drf_stale0000001',kind:'DOC',targetId:d.id,baseVersion:d.version,data:{}});eq(C(UA,'draftGet_',{id:'drf_stale0000001'}).stale,false);
  const row=ctx.repoReadAll_('DebtDoc').find(x=>x.id===d.id);ctx.repoWriteRow_('DebtDoc',row._row,Object.assign({},row,{version:d.version+1}));
  eq(C(UA,'draftGet_',{id:'drf_stale0000001'}).stale,true,'bản ghi đã đổi sau khi nháp');
  eq(code(()=>C(UA,'draftSave_',{kind:'DOC',targetId:'nope',data:{}})),'NOT_FOUND');
});
suite('6. Dọn nháp quá hạn; chuyển file DRAFT chỉ khi đã cấu hình',()=>{
  const r=ctx.repoReadAll_('DraftEntry').find(x=>x.id==='drf_keep00000001');ctx.repoWriteRow_('DraftEntry',r._row,Object.assign({},r,{updatedAt:'2020-01-01T00:00:00Z'}));
  ok(ctx.draftPurge_(30)>=1);eq(C(UA,'draftList_',{kind:'PAYMENT'}).items.length,0);
  eq(ctx.tableHome_('ReadModel'),'MAIN','chưa cấu hình DB_DRAFT_ID → file chính (tương thích)');ctx.props_().setProperty('DB_DRAFT_ID','sheetDraft');
  eq([ctx.tableHome_('ReadModel'),ctx.tableHome_('DraftEntry'),ctx.tableHome_('DebtDoc'),ctx.tableHome_('AuditLog')],['DRAFT','DRAFT','MAIN','AUDIT'],'phân bổ file theo bảng');ctx.props_().deleteProperty('DB_DRAFT_ID');
});
suite('7. Dựng bảng tổng hợp không giữ khóa script khi ghi khe, chỉ khóa ngắn lúc công bố',()=>{
  props.dataVersion='90';reset();const LS=ctx.LockService,orig=LS.getScriptLock;let held=0,writesUnderLock=0,inLock=false;
  LS.getScriptLock=()=>{const l=orig.call(LS);return Object.assign(Object.create(l),{tryLock:(ms)=>{const r=l.tryLock(ms);if(r)inLock=true;return r},releaseLock:()=>{inLock=false;l.releaseLock()}})};
  const ow=ctx.rmWriteKey_;ctx.rmWriteKey_=(k,v,m)=>{if(inLock&&/^[AB]:/.test(k))writesUnderLock++;return ow(k,v,m)};
  const r=ctx.rmRefreshIfNeeded_(true);ctx.rmWriteKey_=ow;LS.getScriptLock=orig;
  eq(r.failed,[]);eq(writesUnderLock,0,'không ghi mô hình khi đang giữ khóa script');
});
console.log('Kiểm thử bản nháp / file DRAFT:',steps,'khẳng định');
