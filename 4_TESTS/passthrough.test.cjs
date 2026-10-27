// Kiểm thử quyền xem PO và liên kết PO của chứng từ điều chỉnh/đảo (prompt bản 12 mục 2-3). Dữ liệu giả, KHÔNG phải Google thật.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
const J=x=>JSON.stringify(x),code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
function world(today){
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:(d)=>d&&d.toISOString?d.toISOString().slice(0,10):today},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
  vm.runInContext(SRC,ctx);ctx.todayVn_=()=>today;
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c1b','CURRENCY','USD',{decimals:2}),cat('g','BUSINESS_GROUP','G1'),cat('f','FEE_TYPE','F'),cat('fp','FEE_TYPE','PASS_THROUGH'),cat('s1','SERVICE_CODE','FWD'),cat('q','CASH_ACCOUNT','Q1',{currency:'VND',type:'BANK'})],
   Partner:[{id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1}],
   Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],Period:[],OpeningBalance:[],ImportBatch:[],ImportRow:[],ServiceFile:[],ShipmentRef:[],Followup:[],
   Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoSliceValid_=(t)=>ctx.repoValid_(t);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  let n=0;
  ctx.runTx_=(user,meta,build)=>{const ins=[],upd=[];const tx={user,now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),
    insert:(t,o)=>{const r=Object.assign({id:t+'_'+(++n),version:1,createdBy:user.id,createdAt:today+'T03:00:00.000Z'},o);ins.push([t,r]);return r},
    update:(t,id,p)=>{const b=(T[t]||[]).find(x=>x.id===id);if(!b)throw Object.assign(new Error('NF'),{code:'NOT_FOUND'});upd.push([t,id,p]);return Object.assign({},b,p)},nextSeq:k=>++n};
    const built=build(tx);ins.forEach(([t,r])=>(T[t]=T[t]||[]).push(r));upd.forEach(([t,id,p])=>Object.assign(T[t].find(x=>x.id===id),p,{updatedAt:today+'T03:00:00.000Z'}));return built&&built.result};
  return {ctx,T};
}
const full={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
const rid=()=>'r'+Math.random(),call=(w,fn,u,p)=>w.ctx[fn](u,{requestId:rid(),payload:p});
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',e.message.split('\n')[0]);process.exitCode=1}}
const base=o=>Object.assign({version:1,isDeleted:0,commitState:'C',txId:'',createdAt:'2026-10-01T00:00:00Z',createdBy:'t'},o);
const U={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
const ACC={id:'ac',email:'ac@x.vn',role:'ACCOUNTANT',scope:{allPartners:true}},EXEC={id:'ex',email:'ex@x.vn',role:'EXEC',scope:{allPartners:true}},LIM={id:'lim',email:'l@x.vn',role:'APPROVER',scope:{partnerIds:['p3'],businessGroups:['G1']}};
function mk(){
  const w=world('2026-10-25'),T=w.T,c=w.ctx;T.PassLink=[];
  T.Partner.push(base({id:'p2',shortName:'CANG',legalName:'CANG',isCustomer:0,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:''}),base({id:'p3',shortName:'KHACH3',legalName:'KHACH3',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:''}));
  T.Order.push(base({id:'o1',orderNo:'DH-1',poNo:'PO1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN'}),base({id:'o2',orderNo:'DH-2',poNo:'PO2',customerPartnerId:'p3',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN'}));
  const A=(id,k,pid,oid,n,x)=>base(Object.assign({id,orderId:oid,kind:k,partnerId:pid,accrualDate:'2026-09-01',feeTypeCode:'F',description:'d'+id,netMinor:n,vatMode:'NONE',vatMinor:0,grossMinor:n,isPassThrough:1,currency:'VND',status:'OPEN'},x||{}));
  T.Accrual.push(A('c1','COST','p2','o1',1000),A('c2','COST','p2','o2',500),A('r1','REVENUE','p1','o1',600),A('r2','REVENUE','p1','o1',900),A('r3','REVENUE','p3','o2',500),A('r4','REVENUE','p1','o1',400,{isPassThrough:0}),A('r5','REVENUE','p1','o1',50,{currency:'USD'}));
  return {w,T,c};
}
const L=(c,u,p)=>c.passList_(u,{payload:p||{}}),LK=(c,u,p)=>c.passLink_(u,{requestId:rid(),payload:p}),byId=(r,id)=>r.items.find(i=>i.id===id);
suite('1. Danh sách chỉ gồm khoản hộ; tuổi, trạng thái, tổng theo tiền tệ',()=>{const{c}=mk(),r=L(c,U);eq(r.total,6,'6 khoản hộ, bỏ khoản không đánh dấu hộ');const x=byId(r,'c1');eq(x.side,'THU_HO','chi phí hộ = THU HỘ (phải trả lại)');eq(byId(r,'r1').side,'CHI_HO','doanh thu hộ = CHI HỘ (thu lại của khách)');eq(x.openMinor,1000);eq(x.state,'OPEN');eq(x.ageDays,54);eq(x.customerName,'ABC');
  const s=r.summary.VND;eq(s.chiHo,2000);eq(s.thuHo,1500);eq(s.chiHoOpen,2000);eq(s.thuHoOpen,1500);eq(s.chiAging[1],2000,'54 ngày nằm nhóm 31–60');ok(r.summary.USD,'USD tách riêng');eq(L(c,U,{side:'THU_HO',state:'OPEN',currency:'VND'}).total,2);eq(L(c,U,{side:'CHI_HO',state:'OPEN',currency:'VND'}).total,3)});
suite('2. Ghép: mặc định lấy số nhỏ hơn, ghép một phần, trạng thái đổi',()=>{const{c,T}=mk(),a=LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r2'});eq(a.amountMinor,900);let r=L(c,U);eq(byId(r,'c1').state,'PARTIAL');eq(byId(r,'c1').openMinor,100);eq(byId(r,'r2').state,'MATCHED');
  eq(r.summary.VND.chiHoLinked,900);eq(r.summary.VND.thuHoLinked,900);const b=LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r1',amountMinor:100});eq(b.amountMinor,100);r=L(c,U);eq(byId(r,'c1').state,'MATCHED');eq(T.PassLink.length,2);
  ok(code(()=>LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r1'}))!=='OK','c1 đã ghép hết')});
suite('3. Từ chối: vượt phần mở, khác tiền tệ, không phải khoản hộ, sai phía',()=>{const{c}=mk();
  eq(code(()=>LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r1',amountMinor:700})),'VALIDATION_FAILED');eq(code(()=>LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r1',amountMinor:1.5})),'VALIDATION_FAILED');eq(code(()=>LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r5'})),'VALIDATION_FAILED','khác tiền tệ');
  eq(code(()=>LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r4'})),'NOT_FOUND','khoản không đánh dấu hộ');eq(code(()=>LK(c,U,{costAccrualId:'r1',revenueAccrualId:'c1'})),'NOT_FOUND','đảo phía');eq(code(()=>LK(c,U,{costAccrualId:'zz',revenueAccrualId:'r1'})),'NOT_FOUND')});
suite('4. Khác đơn/khách phải xác nhận',()=>{const{c}=mk();eq(code(()=>LK(c,U,{costAccrualId:'c2',revenueAccrualId:'r1'})),'CONFIRM_REQUIRED');const a=LK(c,U,{costAccrualId:'c2',revenueAccrualId:'r1',confirmMismatch:true});eq(a.mismatch,true);eq(a.amountMinor,500);
  const x=mk(),b=LK(x.c,U,{costAccrualId:'c2',revenueAccrualId:'r3'});eq(b.mismatch,false)});
suite('5. Gỡ ghép trả lại số mở; không gỡ hai lần; khoản đang ghép không hủy được',()=>{const{c,T}=mk(),a=LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r2'});
  eq(code(()=>c.accrualCancel_(ACC,{requestId:rid(),payload:{id:'c1'}})),'STATE_TRANSITION_INVALID','đang ghép → không hủy');
  c.passUnlink_(U,{requestId:rid(),payload:{id:a.id}});let r=L(c,U);eq(byId(r,'c1').openMinor,1000);eq(byId(r,'c1').state,'OPEN');eq(code(()=>c.passUnlink_(U,{requestId:rid(),payload:{id:a.id}})),'STATE_TRANSITION_INVALID');
  eq(code(()=>c.accrualCancel_(ACC,{requestId:rid(),payload:{id:'c1'}})),'OK','hết ghép thì hủy được');eq(T.Accrual.find(x=>x.id==='c1').status,'CANCELLED');eq(L(c,U).total,5,'khoản hủy rời danh sách')});
suite('6. Gợi ý đối ứng: cùng đơn trước, cùng khách sau, bỏ khác tiền tệ',()=>{const{c}=mk(),d=c.passCandidates_(U,{payload:{accrualId:'c1'}}),ids=d.items.map(x=>x.id);ok(ids.indexOf('r5')<0,'không gợi ý USD');eq(d.items[0].rank,0);eq(d.items[0].basis,'Cùng đơn');eq(d.items.find(x=>x.id==='r3').rank,2);eq(ids.join(','),'r1,r2,r3');
  const e=c.passCandidates_(U,{payload:{accrualId:'r3'}});eq(e.items.map(x=>x.id).join(','),'c2,c1');eq(e.items[0].rank,0)});
suite('7. Phạm vi xem và quyền',()=>{const{c}=mk();const r=L(c,LIM);eq(r.items.map(x=>x.id).sort().join(','),'c2,r3');eq(code(()=>LK(c,LIM,{costAccrualId:'c1',revenueAccrualId:'r3'})),'NOT_FOUND');eq(code(()=>LK(c,LIM,{costAccrualId:'c2',revenueAccrualId:'r3'})),'OK');
  ok(code(()=>L(c,EXEC))!=='OK','EXEC không có quyền đọc công nợ');ok(code(()=>LK(c,EXEC,{costAccrualId:'c2',revenueAccrualId:'r3'}))!=='OK','EXEC không ghép');ok(code(()=>c.passReport_(EXEC,{payload:{}}))==='OK','EXEC xem được báo cáo');
  eq(code(()=>c.passCandidates_(LIM,{payload:{accrualId:'c1'}})),'NOT_FOUND')});
suite('8. Đối chiếu theo khách và theo đơn',()=>{const{c}=mk();LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r2'});let r=c.passReport_(U,{payload:{groupBy:'CUSTOMER'}});const abc=r.items.find(x=>x.name==='ABC'&&x.currency==='VND');eq(abc.chiHo,1500);eq(abc.thuHo,1000);eq(abc.chiHoOpen,600);eq(abc.thuHoOpen,100);eq(abc.openGap,-500,'sau bù trừ khách còn nợ mình 500');eq(abc.oldestOpen,'2026-09-01');eq(abc.maxAge,54);
  r=c.passReport_(U,{payload:{groupBy:'ORDER',currency:'VND'}});const o1=r.items.find(x=>x.name==='DH-1 · PO1');eq(o1.chiHo,1500);eq(o1.thuHo,1000);eq(r.items.length,2);
  LK(c,U,{costAccrualId:'c1',revenueAccrualId:'r1',amountMinor:100});LK(c,U,{costAccrualId:'c2',revenueAccrualId:'r3'});r=c.passReport_(U,{payload:{groupBy:'ORDER',currency:'VND',onlyOpen:true}});eq(r.items.length,1,'chỉ còn DH-1 (r1 mở 500)');eq(r.items[0].chiHoOpen,500)});
suite('9. Bảng PassLink có trong lược đồ và có tiền tố mã',()=>{const{c}=mk();ok(c.TABLES_.PassLink.indexOf('amountMinor:i')>=0);eq(c.ID_PREFIX_.PassLink,'pls');ok(c.routes_()['passthrough.link'].write===true);ok(!c.routes_()['passthrough.list'].write)});
console.log('Số khẳng định:',steps);
