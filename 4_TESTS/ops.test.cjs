// Bảng tổng hợp định kỳ (ReadModel): dựng/ghi/đọc, khớp với tính trực tiếp, phạm vi người dùng, độ tươi, lọc live, chia mảnh, hàng rào đọc. Sheet/Cache giả, KHÔNG phải Apps Script thật.
const assert=require('assert'),path=require('path'),vm=require('vm');
const makeEnv=require('./bench/_env.cjs');
const {ctx,props}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
const J=x=>JSON.stringify(x);let steps=0;const eq=(a,b,m)=>{steps++;assert.strictEqual(J(a),J(b),m)},ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',String(e.message).split('\n').slice(0,6).join(' | '));process.exitCode=1}}
const base=o=>Object.assign({version:1,isDeleted:0,commitState:'C',txId:'',createdAt:'2026-10-01T00:00:00Z',createdBy:'t',updatedAt:'',updatedBy:''},o);
Object.keys(ctx).length;['Partner','Catalog','Config','DebtDoc','DebtLine','Allocation','Payment','Order','Accrual','AccrualSplit','ReadModel','DraftEntry','AuditLog','SystemAlert','BackupCatalog','Period','AppUser'].forEach(t=>ctx.repoSheet_(t));
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

const ADMIN={id:'ad',email:'ad@x',role:'ADMIN',scope:{allPartners:true}};
suite('1. Cảnh báo được ghi bền, trùng thì gộp, email lỗi vẫn không mất cảnh báo',()=>{
  const sent=[];ctx.MailApp={sendEmail:(to,s)=>sent.push(s)};props.ALERT_EMAIL='a@x';
  ctx.alertAdmin_('Dựng lỗi','chi tiết 1','FAIL');ctx.alertAdmin_('Dựng lỗi','chi tiết 2','FAIL');
  let al=ctx.repoValid_('SystemAlert');eq(al.length,1,'gộp cùng chủ đề');eq(al[0].count,2);eq(al[0].body,'chi tiết 2');eq(sent.length,1,'email không bắn lại trong 2 giờ');eq(al[0].emailOk,1);
  ctx.MailApp={sendEmail:()=>{throw new Error('Service invoked too many times for one day: email')}};
  ctx.alertAdmin_('Chủ đề khác','x','WARN');al=ctx.repoValid_('SystemAlert');eq(al.length,2,'email hết hạn mức vẫn ghi cảnh báo');eq(al.find(a=>a.subject==='Chủ đề khác').emailOk,0);
  const st=C(ADMIN,'sysStatus_',{});eq(st.unackedAlerts,2);ok(st.flags.some(f=>f.code==='ALERT'));
  eq(C(ADMIN,'sysAlertAck_',{id:al[0].id}).acked,1);eq(C(ADMIN,'sysStatus_',{summaryOnly:true}).unackedAlerts,1);
  eq(C(ADMIN,'sysAlertAck_',{}).acked,1,'xác nhận tất cả');
  ctx.alertAdmin_('Dựng lỗi','lần mới sau khi đã xác nhận','FAIL');eq(ctx.repoValid_('SystemAlert').filter(a=>!a.ackedAt).length,1,'đã xác nhận rồi thì cảnh báo mới tạo bản ghi mới');
  eq(code(()=>C(UA,'sysStatus_',{})),'FORBIDDEN','chỉ quản trị xem');
});
suite('2. Trạng thái hệ thống phát hiện: chưa dựng, dựng lỗi, đối soát LỖI, sao lưu cũ, giao dịch dở',()=>{
  let st=C(ADMIN,'sysStatus_',{});ok(st.flags.some(f=>f.code==='NO_SUMMARY'));ok(st.flags.some(f=>f.code==='NO_BACKUP'));
  props.dataVersion='5';reset();ctx.rmRefreshIfNeeded_(true);reset();st=C(ADMIN,'sysStatus_',{});ok(!st.flags.some(f=>f.code==='NO_SUMMARY'));ok(st.build&&st.build.dataVersion===5);
  props.OPEN_TX=J({tx_1:'PENDING'});st=C(ADMIN,'sysStatus_',{});ok(st.flags.some(f=>f.code==='OPEN_TX'));delete props.OPEN_TX;
  ctx.repoAppend_('BackupCatalog',[base({id:'b1',type:'DATA',trigger:'DAILY',createdAt:'2020-01-01T00:00:00Z',verifyStatus:'VERIFIED'})]);reset();st=C(ADMIN,'sysStatus_',{});ok(st.flags.some(f=>f.code==='BACKUP_OLD'));
  eq(st.status==='OK',false);
});
suite('4. Duyệt trong lúc đang dựng bảng tổng hợp: số liệu đã công bố không bị hỏng và không công bố bản lệch',()=>{
  props.dataVersion='20';reset();ctx.rmRefreshIfNeeded_(true);const before=ctx.rmManifest_();
  const orig=ctx.rmBuild_;let fired=false;ctx.rmBuild_=(m,t)=>{const r=orig(m,t);if(!fired){fired=true;props.dataVersion='21'}return r};
  reset();const r=ctx.rmRefreshIfNeeded_(true);ctx.rmBuild_=orig;ok(r.stale,'nguồn đổi giữa chừng → bỏ bản dựng: '+J(r));
  reset();const after=ctx.rmManifest_();eq([after.dataVersion,after.builtAt],[before.dataVersion,before.builtAt],'bộ đang công bố nguyên vẹn');eq(after.status.failures,0,'nguồn đổi giữa chừng là chuyện thường: KHÔNG tính vào bộ đếm lỗi/cảnh báo');
  reset();ok(ctx.rmRefreshIfNeeded_(true).rebuilt.length===6,'lượt kế tiếp dựng lại bình thường');
});
console.log('Kiểm thử vận hành (cảnh báo, trạng thái, đồng thời):',steps,'khẳng định');
