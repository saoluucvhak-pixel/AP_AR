// Hồi quy dạng "từ chối lỗi": mỗi ca đưa dữ liệu/thao tác SAI và khẳng định hệ thống (1) từ chối đúng mã lỗi, (2) KHÔNG ghi gì.
// Đây không phải bằng chứng "mã không còn lỗi"; mỗi ca chỉ khóa một lỗi đã từng gặp để lần sửa sau không làm hỏng lại.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8'); // BACKEND_SRC: chạy thử với bản mã khác (vd bản cũ để chứng minh test bắt được lỗi)
const J=x=>JSON.stringify(x);
function world(){
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
  vm.runInContext(SRC,ctx);
  const cat=(id,type,c,a,act)=>({id,catalogType:type,code:c,name:c+' tên',attrsJson:JSON.stringify(a||{}),active:act===undefined?1:act,sortOrder:1,version:1});
  const sv=JSON.stringify([{code:'FWD',hsdvNo:'GML/FWD/ABC-26/001'},{code:'CBT',hsdvNo:'GML/CBT/ABC-26/001'}]);
  const doc=(id,o)=>Object.assign({id,docNo:id.toUpperCase(),direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',status:'POSTED',docDate:'2026-10-02',postingDate:'2026-10-02',totalGrossMinor:1000,isOpening:0,createdBy:'creator',version:1},o);
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','BUSINESS_GROUP','G1'),cat('c2b','BUSINESS_GROUP','G2'),cat('f','FEE_TYPE','F'),cat('s1','SERVICE_CODE','FWD'),cat('s2','SERVICE_CODE','CBT'),cat('s3','SERVICE_CODE','OLD',{},0),cat('q','CASH_ACCOUNT','Q1',{currency:'VND',type:'CASH'})],
   Partner:[{id:'p1',shortName:'ABC',legalName:'ABC Co',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'t1',taxCode:'',version:1},{id:'p2',shortName:'XYZ',legalName:'XYZ Co',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'t2',taxCode:'',version:1},{id:'p3',shortName:'---',legalName:'Khong viet tat',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'t1',taxCode:'',version:1},{id:'p4',shortName:'OFF',legalName:'Off',isCustomer:1,isSupplier:0,status:'INACTIVE',scopeTags:'t1',taxCode:'',version:1}],
   Order:[{id:'o1',orderNo:'DH-1',poNo:'PO1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'OPEN',servicesJson:sv,serviceCode:'FWD',hsdvNo:'GML/FWD/ABC-26/001',version:1},
          {id:'o2',orderNo:'DH-2',poNo:'PO2',customerPartnerId:'p2',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'OPEN',version:1},
          {id:'o3',orderNo:'DH-3',poNo:'PO3',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'CANCELLED',version:1}],
   Accrual:[{id:'a1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',vatMinor:0,grossMinor:1000,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'CBT',version:1}],
   AccrualSplit:[],ServiceFile:[],ShipmentRef:[],
   DebtDoc:[doc('d1',{}),doc('d2',{partnerId:'p2',status:'DRAFT',createdBy:'creator'}),doc('d3',{businessGroupCode:'G2'}),doc('dsub',{status:'SUBMITTED',createdBy:'creator',submittedBy:'creator'}),doc('dapp',{status:'APPROVED',docDate:'2026-10-15',createdBy:'creator'}),doc('dadj',{docType:'ADJ_DEC',status:'POSTED',adjustsDocId:'d1'}),doc('dh',{partnerId:'p1'})],
   DebtLine:[{id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',netMinor:1000,grossMinor:1000,vatMinor:0,vatMode:'NONE'},{id:'l3',docId:'d3',lineNo:1,feeTypeCode:'F',netMinor:1000,grossMinor:1000,vatMinor:0,vatMode:'NONE'},{id:'ldh',docId:'dh',lineNo:1,feeTypeCode:'F',netMinor:1000,grossMinor:1000,vatMinor:0,vatMode:'NONE'},{id:'ldj',docId:'dadj',lineNo:1,feeTypeCode:'F',netMinor:-100,grossMinor:-100,vatMinor:0,vatMode:'NONE',adjustsLineId:'l1'}],
   Allocation:[],
   Payment:[{id:'pdraft',payNo:'PH-D',direction:'IN',partnerId:'p2',currency:'VND',amountMinor:500,effectiveDate:'2026-10-05',method:'BANK',cashAccountCode:'Q1',status:'DRAFT',createdBy:'creator',version:1},
            {id:'psub',payNo:'PH-S',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:500,effectiveDate:'2026-10-05',method:'BANK',cashAccountCode:'Q1',status:'SUBMITTED',createdBy:'creator',submittedBy:'creator',version:1},
            {id:'ppost',payNo:'PH-P',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:5000,effectiveDate:'2026-10-05',method:'BANK',cashAccountCode:'Q1',status:'POSTED',createdBy:'creator',version:1},
            {id:'pdraft1',payNo:'PH-D1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:500,effectiveDate:'2026-10-05',method:'BANK',cashAccountCode:'Q1',status:'DRAFT',createdBy:'creator',version:1}],
   Period:[{id:'2026-01',status:'CLOSED',version:1}],OpeningBalance:[],ImportBatch:[],ImportRow:[],Followup:[],ReportSnapshot:[],BackupCatalog:[],
   AppUser:[{id:'u1',email:'adm@x.vn',displayName:'Adm',role:'ADMIN',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1,version:1},{id:'u2',email:'b@x.vn',displayName:'B',role:'ACCOUNTANT',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1,version:1}],
   Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  const cnt={};
  // runTx_ mô phỏng đúng ngữ nghĩa thật: ghi được gom lại và CHỈ áp dụng khi hàm xây dựng không ném lỗi
  ctx.runTx_=(user,meta,build)=>{const ins=[],upd=[],seq={};
    const tx={user,now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),
      insert:(t,o)=>{const r=Object.assign({id:t+'_'+(++cnt.n||(cnt.n=1)),version:1,createdBy:user.id},o);ins.push([t,r]);return r},
      update:(t,id,p)=>{const b=(T[t]||[]).find(x=>x.id===id);if(!b)throw Object.assign(new Error('NF'),{code:'NOT_FOUND'});upd.push([t,id,p]);return Object.assign({},b,p)},
      nextSeq:k=>(seq[k]=(seq[k]||0)+1)};
    const built=build(tx);ins.forEach(([t,r])=>(T[t]=T[t]||[]).push(r));upd.forEach(([t,id,p])=>Object.assign(T[t].find(x=>x.id===id),p));return built&&built.result};
  return {ctx,T};
}
const users={
  adm:{id:'u1',email:'adm@x.vn',role:'ADMIN',scope:{allPartners:true}},
  full:{id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}},
  acc:{id:'ac',email:'ac@x.vn',role:'ACCOUNTANT',scope:{allPartners:true}},
  t1:{id:'s1',email:'s1@x.vn',role:'ACCOUNTANT',scope:{partnerTags:['t1']}},
  t1ap:{id:'s2',email:'s2@x.vn',role:'APPROVER',scope:{partnerTags:['t1']}},
  g1:{id:'g1',email:'g1@x.vn',role:'APPROVER',scope:{allPartners:true,businessGroups:['G1']}}};
let total=0,failed=[];
function suite(name,fn){const w=world();try{fn(w);console.log('✔',name)}catch(e){failed.push(name+': '+e.message);console.log('✖',name,'-',e.message.split('\n')[0])}}
// rejects(w, mã_lỗi, hàm): ném đúng mã lỗi và trạng thái dữ liệu không đổi
function rejects(w,codeExp,fn,note){const before=J(w.T);let err=null;try{fn()}catch(e){err=e}total++;
  assert.ok(err,(note||'')+' phải bị từ chối nhưng đã chạy được');assert.strictEqual(err.code,codeExp,(note||'')+' – mã lỗi: '+err.code+' / '+err.message);assert.strictEqual(J(w.T),before,(note||'')+' – dữ liệu đã bị ghi dù bị từ chối')}
const rid=()=>'r'+Math.random();
const call=(w,fn,u,p)=>w.ctx[fn](u,{requestId:rid(),payload:p});

suite('Hóa đơn từ khoản: không nhận mã khoản bị lặp / không tồn tại / đã lập hóa đơn',w=>{
  rejects(w,'VALIDATION_FAILED',()=>call(w,'accrualInvoice_',users.full,{accrualIds:['a1','a1'],invoiceNo:'X1',invoiceDate:'2026-10-05',docDate:'2026-10-05'}),'mã khoản lặp');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'accrualInvoice_',users.full,{accrualIds:[],invoiceNo:'X1'}),'không chọn khoản');
  rejects(w,'NOT_FOUND',()=>call(w,'accrualInvoice_',users.full,{accrualIds:['khong-co'],invoiceNo:'X1',invoiceDate:'2026-10-05'}),'khoản không tồn tại');
});
suite('Danh mục: mã đang dùng không đổi mã/số lẻ; không đổi loại',w=>{
  rejects(w,'IN_USE',()=>call(w,'catalogSave_',users.full,{id:'f',catalogType:'FEE_TYPE',code:'F2',name:'x',attrs:{}}),'đổi mã loại phí đang dùng');
  rejects(w,'IN_USE',()=>call(w,'catalogSave_',users.full,{id:'c1',catalogType:'CURRENCY',code:'VND',name:'VND',attrs:{decimals:2}}),'đổi số lẻ tiền tệ đã có dữ liệu');
  rejects(w,'IN_USE',()=>call(w,'catalogSave_',users.full,{id:'s2',catalogType:'SERVICE_CODE',code:'CBT2',name:'x',attrs:{}}),'đổi mã dịch vụ đang dùng');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'catalogSave_',users.full,{id:'f',catalogType:'CURRENCY',code:'F',name:'x',attrs:{decimals:0}}),'đổi loại danh mục');
  rejects(w,'FORBIDDEN',()=>call(w,'catalogSave_',users.t1,{catalogType:'FEE_TYPE',code:'ZZ',name:'x',attrs:{}}),'thiếu quyền danh mục');
});
suite('Đối tác: ngoài phạm vi, gán thẻ ra ngoài phạm vi, định dạng sai, nhập hàng loạt khi bị giới hạn',w=>{
  const base={isCustomer:1,isSupplier:0,paymentTermDays:null};
  rejects(w,'NOT_FOUND',()=>call(w,'partnerSave_',users.t1,Object.assign({id:'p2',shortName:'XYZ',legalName:'Đổi tên',scopeTags:'t2'},base)),'sửa đối tác ngoài phạm vi');
  rejects(w,'OUT_OF_SCOPE',()=>call(w,'partnerSave_',users.t1,Object.assign({id:'p1',shortName:'ABC',legalName:'ABC Co',scopeTags:'t9'},base)),'tự đẩy đối tác ra ngoài phạm vi');
  rejects(w,'OUT_OF_SCOPE',()=>call(w,'partnerSave_',users.t1,Object.assign({shortName:'MOI',legalName:'Mới',scopeTags:''},base)),'tạo đối tác không gán thẻ trong phạm vi');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'partnerSave_',users.full,Object.assign({id:'p1',shortName:'ABC',legalName:'ABC Co',scopeTags:'t1',phone:'abc'},base)),'điện thoại sai');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'partnerSave_',users.full,Object.assign({id:'p1',shortName:'ABC',legalName:'ABC Co',scopeTags:'t1',bankAccountNo:'1'},base)),'số tài khoản sai');
  rejects(w,'OUT_OF_SCOPE',()=>call(w,'partnerBulkCommit_',users.t1,{rows:[{shortName:'Z',isCustomer:'1'}]}),'nhập hàng loạt khi bị giới hạn');
});
suite('Bản nháp/đơn/phân bổ ngoài phạm vi bị từ chối',w=>{
  rejects(w,'NOT_FOUND',()=>call(w,'paymentSave_',users.t1ap,{id:'pdraft',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:5,effectiveDate:'2026-10-06',cashAccountCode:'Q1'}),'sửa nháp thanh toán của đối tác khác');
  rejects(w,'NOT_FOUND',()=>call(w,'orderSave_',users.t1ap,{id:'o2',customerPartnerId:'p1',poNo:'x',orderDate:'2026-10-02',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD']}),'sửa đơn của đối tác khác');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'paymentAllocate_',users.g1,{paymentId:'ppost',items:[{debtLineId:'l3',amountMinor:100}],effectiveDate:'2026-10-20'}),'phân bổ vào chứng từ nhóm nghiệp vụ ngoài phạm vi');
});
suite('Khóa kỳ: tương lai, trước đầu sổ, kỳ trước chưa khóa, dư đầu kỳ chưa duyệt',w=>{
  w.ctx.todayVn_=()=>'2026-10-25';
  rejects(w,'VALIDATION_FAILED',()=>call(w,'periodClose_',users.full,{id:'2027-03'}),'khóa kỳ tương lai');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'periodClose_',users.full,{id:'2025-12'}),'khóa kỳ trước đầu sổ');
  rejects(w,'PERIOD_CHECK_FAILED',()=>call(w,'periodClose_',users.full,{id:'2026-06'}),'khóa kỳ khi kỳ trước chưa khóa');
  w.T.ImportBatch.push({id:'ob',mode:'OPENING',status:'SUBMITTED',createdBy:'x'});
  const chk=w.ctx.periodChecklist_('2026-02').find(x=>x.code==='OPENING_PENDING');total++;assert.strictEqual(chk.ok,false,'dư đầu kỳ chưa duyệt phải chặn');
});
suite('Dòng phí: chi hộ không được có VAT',w=>{
  const r=w.ctx.calcLine_({feeTypeCode:'F',description:'chi hộ',netMinor:1000,vatMode:'EXCLUSIVE',vatRateBp:1000,isPassThrough:1},0,false);total++;
  assert.ok(r.errors.some(e=>e.code==='PASS_THROUGH_VAT'));
});
suite('Điều chỉnh/đảo chứng từ',w=>{
  const adj=(lines,docId)=>call(w,'docAdjust_',users.full,{docId:docId||'d1',kind:'DEC',reason:'x',docDate:'2026-10-10',lines});
  rejects(w,'VALIDATION_FAILED',()=>adj([{targetLineId:'ldh',amountMinor:600,description:'a'},{targetLineId:'ldh',amountMinor:600,description:'b'}],'dh'),'giảm trùng dòng gốc vượt số dư');
  w.ctx.docAdjust_(users.full,{requestId:rid(),payload:{docId:'dh',kind:'DEC',reason:'x',docDate:'2026-10-10',lines:[{targetLineId:'ldh',amountMinor:600,description:'a'}]}});
  rejects(w,'VALIDATION_FAILED',()=>adj([{targetLineId:'ldh',amountMinor:600,description:'b'}],'dh'),'bản giảm thứ hai vượt cùng khoản đang chờ');
  rejects(w,'HAS_ADJUSTMENTS',()=>call(w,'docReverse_',users.full,{docId:'dh',reason:'x',docDate:'2026-10-20'}),'đảo chứng từ còn điều chỉnh');
  rejects(w,'STATE_TRANSITION_INVALID',()=>call(w,'docReverse_',users.full,{docId:'dadj',reason:'x'}),'đảo chứng từ điều chỉnh');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'docReverse_',users.full,{docId:'d3',reason:'x',docDate:'2026-10-01'}),'ngày đảo trước ngày chứng từ gốc');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'docReverse_',users.full,{docId:'d3',docDate:'2026-10-20'}),'đảo không có lý do');
});
suite('Ghi nhận chứng từ',w=>{
  w.ctx.assertPeriodOpen_=()=>'2026-10';
  rejects(w,'VALIDATION_FAILED',()=>call(w,'docPost_',users.full,{id:'dapp',postingDate:'2026-10-01'}),'ngày ghi nhận trước ngày chứng từ');
  w.T.DebtDoc.push({id:'dd',docNo:'DD',direction:'AR',docType:'ADJ_DEC',partnerId:'p1',currency:'VND',businessGroupCode:'G1',status:'APPROVED',docDate:'2026-10-20',adjustsDocId:'d1',totalGrossMinor:-5000,createdBy:'creator',version:1});
  w.T.DebtLine.push({id:'ldd',docId:'dd',lineNo:1,netMinor:-5000,grossMinor:-5000,vatMinor:0,adjustsLineId:'l1'});
  rejects(w,'ADJ_OVER_OUTSTANDING',()=>call(w,'docPost_',users.full,{id:'dd'}),'điều chỉnh giảm vượt số dư lúc ghi nhận');
  rejects(w,'SELF_APPROVAL_FORBIDDEN',()=>call(w,'docApprove_',Object.assign({},users.full,{id:'creator'}),{id:'dsub'}),'tự duyệt chứng từ');
});
suite('Thanh toán: gửi duyệt/từ chối sai người',w=>{
  rejects(w,'FORBIDDEN',()=>call(w,'paySubmit_',users.acc,{id:'pdraft1'}),'gửi duyệt phiếu của người khác');
  rejects(w,'SELF_APPROVAL_FORBIDDEN',()=>call(w,'payReject_',Object.assign({},users.full,{id:'creator'}),{id:'psub',reason:'x'}),'tự từ chối phiếu của mình');
  rejects(w,'SELF_APPROVAL_FORBIDDEN',()=>call(w,'payApprove_',Object.assign({},users.full,{id:'creator'}),{id:'psub'}),'tự duyệt phiếu');
});
suite('Dư đầu kỳ',w=>{
  for(const f of ['openingSave_','openingSubmit_','openingReject_','openingCommit_'])rejects(w,'OUT_OF_SCOPE',()=>call(w,f,users.t1ap,{rows:[]}),f+' khi bị giới hạn phạm vi');
  call(w,'openingSave_',users.full,{rows:[{kind:'CASH',cashAccountCode:'Q1',amountMinor:1},{kind:'CASH',cashAccountCode:'Q1',amountMinor:2},{kind:'AR',partnerId:'p4',businessGroupCode:'G1',currency:'VND',amountMinor:5,docDate:'2025-12-01',dueDate:'2025-11-01'}]});
  rejects(w,'IMPORT_HAS_ERRORS',()=>call(w,'openingSubmit_',users.full,{}),'gửi duyệt khi còn dòng lỗi (quỹ trùng, đối tác ngừng dùng, hạn trước ngày CT)');
});
suite('Sao kê ngân hàng',w=>{
  for(const f of ['importBankPreview_','importRowDecide_','importCancel_','importBankCommit_'])rejects(w,'OUT_OF_SCOPE',()=>call(w,f,users.t1ap,{csv:'x'}),f+' khi bị giới hạn phạm vi');
});
suite('Người dùng',w=>{
  const ad=users.adm;
  rejects(w,'VALIDATION_FAILED',()=>call(w,'userSave_',ad,{id:'u2',email:'b@x.vn',displayName:'B',role:'ACCOUNTANT',scope:{partnerIds:['khong-co']}}),'phạm vi trỏ tới đối tác không tồn tại');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'userSave_',ad,{id:'u2',email:'b@x.vn',displayName:'B',role:'ACCOUNTANT',scope:{businessGroups:['G9']}}),'nhóm nghiệp vụ không tồn tại');
  rejects(w,'FORBIDDEN',()=>call(w,'userSave_',ad,{id:'u1',email:'adm@x.vn',displayName:'Adm',role:'ADMIN',scope:{partnerTags:['t1']}}),'tự đổi phạm vi của mình');
  rejects(w,'FORBIDDEN',()=>call(w,'userSave_',ad,{id:'u1',email:'adm@x.vn',displayName:'Adm',role:'APPROVER',scope:{allPartners:true}}),'tự đổi vai trò của mình');
  rejects(w,'FORBIDDEN',()=>call(w,'userSave_',users.acc,{email:'n@x.vn',displayName:'N',role:'ACCOUNTANT',scope:{}}),'thiếu quyền quản lý người dùng');
});
suite('Đơn hàng và mã dịch vụ',w=>{
  const P=o=>Object.assign({customerPartnerId:'p1',poNo:'PO9',orderDate:'2026-10-10',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD']},o);
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderSave_',users.full,P({serviceCodes:[]})),'PO không có mã dịch vụ');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderSave_',users.full,P({serviceCodes:['OLD']})),'mã dịch vụ ngừng dùng');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderSave_',users.full,P({serviceCodes:['NOPE']})),'mã dịch vụ không tồn tại');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderSave_',users.full,P({customerPartnerId:'p3'})),'khách không có tên viết tắt hợp lệ để cấp HSDV');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderSave_',users.full,P({id:'o1',serviceCodes:['FWD']})),'bỏ mã CBT đã có khoản');
  rejects(w,'HSDV_LOCKED',()=>call(w,'orderSave_',users.full,P({id:'o1',customerPartnerId:'p4',serviceCodes:['FWD','CBT']})),'đổi khách sau khi đã cấp số HSDV');
  rejects(w,'HSDV_LOCKED',()=>call(w,'orderSave_',users.full,P({id:'o1',orderDate:'2027-01-02',serviceCodes:['FWD','CBT']})),'đổi năm của đơn sau khi đã cấp số HSDV');
  rejects(w,'STATE_TRANSITION_INVALID',()=>call(w,'orderSetStatus_',users.full,{id:'o3',status:'OPEN'}),'mở lại đơn đã hủy');
  rejects(w,'STATE_TRANSITION_INVALID',()=>call(w,'orderSetStatus_',users.full,{id:'o1',status:'OPEN'}),'đặt lại đúng trạng thái đang có');
  const acc=s=>({orderId:'o1',kind:'REVENUE',partnerId:'p1',currency:'VND',accrualDate:'2026-10-11',feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',serviceCode:s});
  rejects(w,'VALIDATION_FAILED',()=>call(w,'accrualSave_',users.full,acc('')),'PO nhiều mã: khoản không chọn mã');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'accrualSave_',users.full,acc('TRD')),'khoản mang mã không thuộc PO');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'accrualSave_',users.full,Object.assign(acc('FWD'),{orderId:'o2'})),'khoản gắn vào PO chưa có mã dịch vụ');
  w.T.Accrual.push({id:'acx',orderId:'o1',kind:'COST',partnerId:'p1',status:'CANCELLED',version:1},{id:'aci',orderId:'o1',kind:'COST',partnerId:'p1',status:'INVOICED',version:1});
  rejects(w,'STATE_TRANSITION_INVALID',()=>call(w,'accrualCancel_',users.full,{id:'acx'}),'hủy khoản đã hủy');
  rejects(w,'STATE_TRANSITION_INVALID',()=>call(w,'accrualCancel_',users.full,{id:'aci'}),'hủy khoản đã lập hóa đơn');
});
suite('Gán mã dịch vụ hàng loạt',w=>{
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderAssignService_',users.full,{orderIds:['o2'],serviceCode:'OLD'}),'gán mã ngừng dùng');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'orderAssignService_',users.full,{orderIds:[],serviceCode:'FWD'}),'không chọn PO');
  const r=call(w,'orderAssignService_',users.t1ap,{orderIds:['o2','o1','o3'],serviceCode:'FWD'});total++;
  assert.ok(r.skipped.length===3&&!w.T.Order[1].servicesJson,'PO ngoài phạm vi/đã có mã/đã hủy bị bỏ qua và không bị đổi');
});
suite('Cấu hình',w=>{
  rejects(w,'VALIDATION_FAILED',()=>call(w,'configSet_',users.adm,{values:{'archive.sysTxDays':'10'}}),'giữ giao dịch dưới 30 ngày');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'configSet_',users.adm,{values:{'archive.auditMonths':'6'}}),'giữ nhật ký dưới 12 tháng');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'configSet_',users.adm,{values:{'credit.policy':'XXX'}}),'chính sách hạn mức lạ');
  rejects(w,'VALIDATION_FAILED',()=>call(w,'configSet_',users.adm,{values:{'khong.cho.sua':'1'}}),'khóa cấu hình lạ');
});
suite('Sao lưu/khôi phục: quay lại DB cũ cần lý do và đúng người',w=>{
  w.ctx.withLock_=(ms,f)=>f();
  rejects(w,'VALIDATION_FAILED',()=>call(w,'backupRollbackSwitch_',users.full,{}),'quay lại không có lý do');
  rejects(w,'FORBIDDEN',()=>call(w,'backupRollbackSwitch_',users.adm,{reason:'x'}),'quản trị không phải người duyệt');
});
console.log('\nHồi quy từ chối lỗi: '+total+' khẳng định "bị từ chối và không ghi gì"; '+(failed.length?failed.length+' nhóm LỖI':'tất cả đạt'));
if(failed.length){console.log(failed.join('\n'));process.exit(1)}
