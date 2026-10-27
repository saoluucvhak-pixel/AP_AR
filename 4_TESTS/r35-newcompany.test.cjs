// R35: Khởi tạo dữ liệu mới cho công ty mới — bộ Sheets mới, giữ người dùng/danh mục, không xóa dữ liệu cũ, hai người, quay lui được. Sheet giả, KHÔNG phải Google thật.
const assert=require('assert'),path=require('path');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),makeEnv=require('./bench/_env.cjs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
function world(){
  const {ctx,dbs,props}=makeEnv(SRCP);let n=0,trashed=[];
  const SS=ctx.SpreadsheetApp,orig=SS.openById;
  ctx.SpreadsheetApp={openById:orig,flush(){},create:(name)=>{const id='new'+(++n);dbs[id]={};const o=orig(id);o.getId=()=>id;o.deleteSheet=s=>{delete dbs[id][s.name]};o.name=name;dbs[id]['Sheet1']=null;delete dbs[id]['Sheet1'];return o}};
  ctx.DriveApp={getFileById:id=>({setTrashed:()=>trashed.push(id)})};
  ctx.doBackup_=(u,t,note)=>({id:'bkp_'+t});ctx.alertAdmin_=()=>{};
  ctx.ensureSchema();
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o),cat=(id,t,c,a)=>B({id,catalogType:t,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1});
  ctx.repoAppend_('Catalog',[cat('c1','CURRENCY','VND',{decimals:0}),cat('f1','FEE_TYPE','CUOC'),cat('q1','CASH_ACCOUNT','NH1',{currency:'VND',type:'BANK'})]);
  ctx.repoAppend_('Partner',[B({id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE'})]);
  ctx.repoAppend_('AppUser',[B({id:'adm',email:'adm@x.vn',displayName:'A',role:'ADMIN',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1}),B({id:'kt1',email:'kt1@x.vn',displayName:'K1',role:'APPROVER',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1}),B({id:'kt2',email:'kt2@x.vn',displayName:'K2',role:'APPROVER',scopeJson:'{"allPartners":true}',status:'ACTIVE',permissionsVersion:1})]);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'}),B({id:'entity.name',value:'CÔNG TY CŨ'}),B({id:'entity.taxCode',value:'111'}),B({id:'seq.PH.2026',value:'57'}),B({id:'fx.outMethod',value:'DAY'})]);
  ctx.todayVn_=()=>'2026-11-10';
  const U=id=>({id,email:id+'@x.vn',role:id==='adm'?'ADMIN':'APPROVER',scope:{allPartners:true}});
  return {ctx,dbs,props,trashed,U};
}
const REQ={companyName:'CÔNG TY MỚI',shortName:'MOI',taxCode:'0312345678',ledgerStartDate:'2027-01-01',reason:'Công ty mới',confirmText:'khoi tao moi'};
const call=(w,fn,u,p)=>w.ctx[fn](u,{requestId:'r'+Math.random(),payload:p||{}});
suite('1. Yêu cầu: bắt buộc tên, ngày đầu sổ, lý do, cụm xác nhận; chỉ một yêu cầu chờ; hủy được; chưa đổi gì',()=>{
  const w=world(),adm=w.U('adm'),before=w.props.DB_MAIN_ID;
  eq(code(()=>call(w,'companyInitRequest_',adm,Object.assign({},REQ,{confirmText:'sai'}))),'VALIDATION_FAILED');eq(code(()=>call(w,'companyInitRequest_',adm,Object.assign({},REQ,{companyName:''}))),'VALIDATION_FAILED');eq(code(()=>call(w,'companyInitRequest_',adm,Object.assign({},REQ,{ledgerStartDate:'x'}))),'VALIDATION_FAILED');
  eq(code(()=>call(w,'companyInitRequest_',{id:'acc',email:'acc@x.vn',role:'ACCOUNTANT',scope:{allPartners:true}},REQ)),'FORBIDDEN','người không có quyền backup.restore');
  eq(code(()=>call(w,'companyInitRequest_',adm,Object.assign({},REQ,{confirmText:'KHỞI TẠO MỚI'}))),'OK','chấp nhận cả có dấu');eq(code(()=>call(w,'companyInitRequest_',adm,REQ)),'STATE_TRANSITION_INVALID','một yêu cầu chờ');
  eq(call(w,'companyInitStatus_',adm).pending.companyName,'CÔNG TY MỚI');call(w,'companyInitCancel_',adm);eq(call(w,'companyInitStatus_',adm).pending,null);eq(w.props.DB_MAIN_ID,before,'chưa đổi DB');
});
suite('2. Xác nhận: người yêu cầu không tự xác nhận; chỉ Kế toán trưởng/Người duyệt; cần cụm xác nhận',()=>{
  const w=world();call(w,'companyInitRequest_',w.U('kt1'),REQ);
  eq(code(()=>call(w,'companyInitConfirm_',w.U('kt1'),{confirmText:'khoi tao moi'})),'SELF_APPROVAL_FORBIDDEN');eq(code(()=>call(w,'companyInitConfirm_',w.U('adm'),{confirmText:'khoi tao moi'})),'FORBIDDEN','ADMIN không phải người duyệt');eq(code(()=>call(w,'companyInitConfirm_',w.U('kt2'),{confirmText:'x'})),'VALIDATION_FAILED');
  eq(w.props.MAINTENANCE,undefined,'không bật bảo trì khi bị từ chối');
});
suite('3. Khởi tạo: bộ DB mới, giữ người dùng + danh mục (trừ tài khoản quỹ) + cấu hình chung, bỏ đối tác/số thứ tự/tên công ty cũ; đặt công ty mới; DB cũ còn nguyên; ghi nhật ký',()=>{
  const w=world(),oldId=w.props.DB_MAIN_ID,oldPartners=w.ctx.repoValid_('Partner').length;call(w,'companyInitRequest_',w.U('kt1'),REQ);
  const r=call(w,'companyInitConfirm_',w.U('kt2'),{confirmText:'khoi tao moi'});eq(r.ok,true);ok(w.props.DB_MAIN_ID!==oldId&&/^new/.test(w.props.DB_MAIN_ID),'đã chuyển sang DB mới');eq(w.props.MAINTENANCE,undefined,'hết bảo trì');eq(w.props.INIT_REQUEST,undefined);
  const c=w.ctx;c.resetMemoDirect_();eq(c.repoValid_('Partner').length,0,'không còn đối tác cũ');eq(c.repoValid_('AppUser').length,3,'giữ người dùng');
  const cat=c.repoValid_('Catalog');ok(cat.some(x=>x.code==='CUOC'),'giữ loại phí');ok(!cat.some(x=>x.catalogType==='CASH_ACCOUNT'),'bỏ tài khoản quỹ cũ');ok(cat.some(x=>x.catalogType==='BUSINESS_GROUP'),'danh mục mặc định được bổ sung');
  const cfg=Object.fromEntries(c.repoValid_('Config').map(x=>[x.id,x.value]));eq(cfg.ledgerStartDate,'2027-01-01');eq(cfg['entity.name'],'CÔNG TY MỚI');eq(cfg['entity.taxCode'],'0312345678');eq(cfg['seq.PH.2026'],undefined,'số thứ tự chứng từ bắt đầu lại');eq(cfg['fx.outMethod'],'DAY','cấu hình chung giữ');
  eq(c.ledgerStart_(),'2027-01-01');
  // DB cũ còn nguyên
  eq(w.dbs[oldId].Partner.cells['2,1'],'p1','dữ liệu cũ giữ nguyên trong DB cũ');
  const log=c.repoReadAll_('AuditLog').filter(a=>a.action==='company.init'||a.action==='company.initRequest');ok(log.length>=2,'có nhật ký');
  eq(call(w,'companyInitStatus_',w.U('adm')).canRollback,true);
});
suite('4. Quay lui về dữ liệu công ty cũ (người duyệt, có lý do) và chuyển lại bộ mới được',()=>{
  const w=world(),oldId=w.props.DB_MAIN_ID;call(w,'companyInitRequest_',w.U('kt1'),REQ);call(w,'companyInitConfirm_',w.U('kt2'),{confirmText:'khoi tao moi'});const newId=w.props.DB_MAIN_ID;
  eq(code(()=>call(w,'companyInitRollback_',w.U('adm'),{reason:'x'})),'FORBIDDEN');eq(code(()=>call(w,'companyInitRollback_',w.U('kt2'),{})),'VALIDATION_FAILED');
  call(w,'companyInitRollback_',w.U('kt2'),{reason:'nhầm'});eq(w.props.DB_MAIN_ID,oldId);w.ctx.resetMemoDirect_();eq(w.ctx.repoValid_('Partner').length,1,'đã có lại đối tác công ty cũ');eq(w.ctx.cfgGet_('entity.name',''),'CÔNG TY CŨ');
  call(w,'companyInitRollback_',w.U('kt2'),{reason:'quay lại bộ mới'});eq(w.props.DB_MAIN_ID,newId);
});
suite('5. Lỗi giữa chừng (sao lưu thất bại) → không đổi DB, tắt bảo trì, yêu cầu vẫn còn để thử lại',()=>{
  const w=world(),oldId=w.props.DB_MAIN_ID;call(w,'companyInitRequest_',w.U('kt1'),REQ);w.ctx.doBackup_=()=>{throw new Error('Drive lỗi')};
  eq(code(()=>call(w,'companyInitConfirm_',w.U('kt2'),{confirmText:'khoi tao moi'})),'Drive lỗi');eq(w.props.DB_MAIN_ID,oldId);eq(w.props.MAINTENANCE,undefined);ok(!!w.props.INIT_REQUEST,'yêu cầu còn');
});
suite('6. Chuyển sang DB mới nhưng kiểm tra sau chuyển thất bại (người xác nhận không có trong bộ mới) → tự quay lại DB cũ, bỏ bộ mới vào thùng rác, hết bảo trì',()=>{
  const w=world(),oldId=w.props.DB_MAIN_ID;call(w,'companyInitRequest_',w.U('kt1'),REQ);
  eq(code(()=>call(w,'companyInitConfirm_',{id:'ghost',email:'g@x.vn',role:'APPROVER',scope:{allPartners:true}},{confirmText:'khoi tao moi'})),'INIT_FAILED');eq(w.props.DB_MAIN_ID,oldId,'về DB cũ');eq(w.props.MAINTENANCE,undefined);ok(w.trashed.length>=1,'bộ mới bị bỏ thùng rác');w.ctx.resetMemoDirect_();eq(w.ctx.repoValid_('Partner').length,1,'dữ liệu cũ nguyên vẹn');
});
suite('7. Trạng thái "bộ dữ liệu trước": tên công ty là của bộ vừa rời đi (khởi tạo → tên cũ; quay lui → tên mới)',()=>{
  const w=world();call(w,'companyInitRequest_',w.U('kt1'),REQ);call(w,'companyInitConfirm_',w.U('kt2'),{confirmText:'khoi tao moi'});
  eq(call(w,'companyInitStatus_',w.U('adm')).previous.companyName,'CÔNG TY CŨ','sau khởi tạo: bộ trước là công ty cũ');
  call(w,'companyInitRollback_',w.U('kt2'),{reason:'nhầm'});
  eq(call(w,'companyInitStatus_',w.U('adm')).previous.companyName,'CÔNG TY MỚI','sau quay lui: bộ trước là công ty mới');
  call(w,'companyInitRollback_',w.U('kt2'),{reason:'lại'});
  eq(call(w,'companyInitStatus_',w.U('adm')).previous.companyName,'CÔNG TY CŨ','quay đi quay lại giữ đúng tên');
});
suite('8. Quay lui: còn giao dịch đang mở → từ chối, không đổi DB; thành công thì hết bảo trì, kể cả khi ghi nhật ký lỗi',()=>{
  const w=world(),oldId=w.props.DB_MAIN_ID;call(w,'companyInitRequest_',w.U('kt1'),REQ);call(w,'companyInitConfirm_',w.U('kt2'),{confirmText:'khoi tao moi'});const newId=w.props.DB_MAIN_ID;
  w.props.OPEN_TX=JSON.stringify({tx1:'PENDING'});
  eq(code(()=>call(w,'companyInitRollback_',w.U('kt2'),{reason:'x'})),'STATE_TRANSITION_INVALID');eq(w.props.DB_MAIN_ID,newId,'DB không đổi');eq(w.props.OPEN_TX,JSON.stringify({tx1:'PENDING'}),'giao dịch mở không bị xoá');eq(w.props.MAINTENANCE,undefined);
  w.props.OPEN_TX='{}';call(w,'companyInitRollback_',w.U('kt2'),{reason:'ok'});eq(w.props.DB_MAIN_ID,oldId);eq(w.props.MAINTENANCE,undefined,'hết bảo trì sau quay lui');
  const wa=w.ctx.writeAudit_;w.ctx.writeAudit_=()=>{throw new Error('nhật ký lỗi')};
  eq(code(()=>call(w,'companyInitRollback_',w.U('kt2'),{reason:'lỗi nhật ký'})),'nhật ký lỗi');eq(w.props.MAINTENANCE,undefined,'lỗi giữa chừng không để kẹt chế độ bảo trì');w.ctx.writeAudit_=wa;
});
suite('9. Hiệu suất: currencyMap_ đọc danh mục MỘT lần cho nhiều lần gọi; ghi danh mục thì bản đệm được làm mới',()=>{
  const w=world(),c=w.ctx;c.resetMemoDirect_();let reads=0;const ra=c.repoReadAll_;c.repoReadAll_=function(t){if(t==='Catalog')reads++;return ra.apply(this,arguments)};
  const m1=c.currencyMap_();for(let i=0;i<2000;i++)c.currencyMap_();eq(reads,1,'2001 lần gọi chỉ đọc danh mục một lần');ok(m1===c.currencyMap_(),'cùng một bản đệm');eq(m1.VND.decimals,0);ok(!m1.USD);
  c.repoAppend_('Catalog',[{version:1,isDeleted:0,commitState:'C',id:'c2',catalogType:'CURRENCY',code:'USD',name:'USD',attrsJson:JSON.stringify({decimals:2}),active:1,sortOrder:2}]);
  eq(c.currencyMap_().USD.decimals,2,'thêm tiền tệ mới thì thấy ngay');
  const t0=process.hrtime.bigint();for(let i=0;i<20000;i++)c.currencyMap_();ok(Number(process.hrtime.bigint()-t0)/1e6<500,'20.000 lần gọi dưới 0,5 giây');
  c.repoReadAll_=ra;
});
console.log('Tổng kiểm tra:',steps);
