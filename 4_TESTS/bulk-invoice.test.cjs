// Kiểm thử theo prompt nâng cấp: ngày ghi nhận, khóa kỳ, trạng thái hóa đơn, thu hộ/chi hộ, thanh toán/phân bổ. Dữ liệu giả, KHÔNG phải Apps Script thật.
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
const U={id:'ap',email:'ap@x.vn',role:'APPROVER',scope:{allPartners:true}};
const deq=(a,b,m)=>eq(J(a),J(b),m);
const row=(o)=>Object.assign({partner:'ABC',invoiceNo:'HD001',serial:'AA/26E',invoiceDate:'2026-10-05',docDate:'',due:'2026-11-05',expectedPay:'',period:'',group:'G1',currency:'VND',order:'',poRef:'',serviceCode:'FWD',feeType:'F',description:'Phí A',containerQty:'',declNo:'',declDate:'',netText:'1.000.000',vat:'8',isPassThrough:0,lotNote:'PO-77',note:''},o||{});
function fresh(){const w=world('2026-10-25');w.T.Catalog.forEach(c=>{if(c.code==='F'&&c.catalogType==='FEE_TYPE')c.name='Phí'});return w}
suite('1. Nhập hàng loạt hóa đơn bán: gom dòng theo số hóa đơn, tạo chứng từ NHÁP nhiều dòng',()=>{
  const w=fresh(),rows=[row(),row({description:'Phí B',netText:'500.000',vat:'KCT'}),row({invoiceNo:'HD002',netText:'2.000.000'})];
  const pv=call(w,'docBulkPreview_',U,{direction:'AR',rows});eq(pv.errors,0,J(pv.rows.map(r=>r.issues)));eq(pv.created.docs,2);eq(pv.created.lines,3);eq(pv.canCommit,true);
  eq(pv.totals.VND,1080000+500000+2160000,'tổng gồm thuế 8%: 1.000.000→1.080.000, KCT 500.000, 2.000.000→2.160.000');
  const r=call(w,'docBulkCommit_',U,{direction:'AR',rows,batchLabel:'Đợt T10'});eq(r.created.docs,2);
  const docs=w.T.DebtDoc;eq(docs.length,2);ok(docs.every(d=>d.status==='DRAFT'&&d.direction==='AR'&&d.batchLabel==='Đợt T10'&&d.partnerId==='p1'));
  const d1=docs.find(d=>d.invoiceNo==='HD001');eq(d1.totalGrossMinor,1580000);eq(w.T.DebtLine.filter(l=>l.docId===d1.id).length,2);eq(d1.dueDate,'2026-11-05');ok(w.T.DebtLine.every(l=>l.lotNote===''||l.lotNote==='PO-77'));
  eq(w.T.DebtLine.filter(l=>l.docId===d1.id).reduce((a,l)=>a+l.grossMinor,0),d1.totalGrossMinor,'tổng dòng = tổng chứng từ');
});
suite('2. Hóa đơn mua (phải trả) dùng nhà cung cấp; khách không phải NCC bị từ chối',()=>{
  const w=fresh();w.T.Partner.push({id:'pk',shortName:'KHACH',legalName:'KHACH',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});
  const ok1=call(w,'docBulkPreview_',U,{direction:'AP',rows:[row()]});eq(ok1.errors,0);
  const bad=call(w,'docBulkPreview_',U,{direction:'AP',rows:[row({partner:'KHACH'})]});eq(bad.errors,1);eq(bad.rows[0].issues[0].code,'PARTNER_UNKNOWN');
});
suite('3. Báo lỗi đúng dòng; có lỗi thì không ghi hóa đơn nào',()=>{
  const w=fresh(),rows=[row(),row({invoiceNo:'',description:'x'}),row({invoiceNo:'HD003',invoiceDate:'invalid'}),row({invoiceNo:'HD004',feeType:'khong co'}),row({invoiceNo:'HD005',netText:'abc'}),row({invoiceNo:'HD006',partner:'Ma'}),row({invoiceNo:'HD001',description:'Phí C',invoiceDate:'2026-10-06'}),row({invoiceNo:'HD007',vat:'99'}),row({invoiceNo:'HD008',description:''}),row({invoiceNo:'HD009',group:'ZZ'})];
  const pv=call(w,'docBulkPreview_',U,{direction:'AR',rows});eq(pv.canCommit,false);
  const codes=i=>pv.rows[i].issues.map(x=>x.code);
  ok(codes(1).includes('INVOICE_NO_REQUIRED'));ok(codes(2).includes('DATE_INVALID'));ok(codes(3).includes('FEE_UNKNOWN'));ok(codes(4).some(c=>/AMOUNT/.test(c)));ok(codes(5).includes('PARTNER_UNKNOWN'));ok(codes(6).includes('HEADER_MISMATCH'),'cùng số hóa đơn nhưng khác ngày');ok(codes(7).includes('TAX_INVALID'));ok(codes(8).includes('DESCRIPTION_REQUIRED'));ok(pv.rows[9].issues.length>0,'nhóm nghiệp vụ sai');
  eq(code(()=>call(w,'docBulkCommit_',U,{direction:'AR',rows})),'VALIDATION_FAILED');eq(w.T.DebtDoc.length,0,'không ghi gì');eq(w.T.DebtLine.length,0);
  eq(code(()=>call(w,'docBulkPreview_',U,{direction:'XX',rows:[row()]})),'VALIDATION_FAILED');eq(code(()=>call(w,'docBulkPreview_',U,{direction:'AR',rows:[]})),'VALIDATION_FAILED');
});
suite('4. Nghi trùng với hóa đơn đã có: cảnh báo (không chặn), lưu cờ để xác nhận khi ghi nhận',()=>{
  const w=fresh();call(w,'docBulkCommit_',U,{direction:'AR',rows:[row()]});
  const pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row()]});eq(pv.errors,0);eq(pv.duplicates,1);ok(/nghi trùng/.test(pv.rows[0].summary));
  call(w,'docBulkCommit_',U,{direction:'AR',rows:[row()]});const d=w.T.DebtDoc[1];ok(/duplicates/.test(d.warningsJson));
});
suite('5. Tùy chọn gửi duyệt ngay: cấp số chứng từ, người gửi là người nhập; người duyệt khác thấy ở Chờ duyệt',()=>{
  const w=fresh();call(w,'docBulkCommit_',U,{direction:'AR',submit:true,rows:[row(),row({invoiceNo:'HD002'})]});
  ok(w.T.DebtDoc.every(d=>d.status==='SUBMITTED'&&/^PT-2026-\d{6}$/.test(d.docNo)&&d.submittedBy==='ap'));eq(new Set(w.T.DebtDoc.map(d=>d.docNo)).size,2,'số chứng từ không trùng');
  const acc={id:'ac',email:'ac@x.vn',role:'ACCOUNTANT',scope:{allPartners:true}};eq(code(()=>call(w,'docBulkCommit_',acc,{direction:'AR',submit:true,rows:[row({invoiceNo:'HD003'})]})),'OK','kế toán có quyền gửi duyệt');
});
suite('6. Phạm vi người dùng',()=>{
  const w=fresh(),sc={id:'sc',email:'sc@x',role:'ACCOUNTANT',scope:{allPartners:false,partnerIds:['zz'],businessGroups:['G1']}};
  const pv=call(w,'docBulkPreview_',sc,{direction:'AR',rows:[row()]});eq(pv.errors,1);eq(pv.rows[0].issues[0].code,'PARTNER_UNKNOWN');
});
function withOrders(w){const T=w.T;T.Order.push(base2({id:'o1',orderNo:'DH-1',poNo:'PO-KH-1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-02',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'H1'}]),serviceCode:'FWD'}),base2({id:'o2',orderNo:'DH-2',poNo:'PO-KH-2',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-03',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'H2'}]),serviceCode:'FWD'}));return w}
const base2=o=>Object.assign({version:1,isDeleted:0,createdAt:'2026-10-01T00:00:00Z'},o);
const acc=(id,order,kind,partner,gross,x)=>base2(Object.assign({id,orderId:order,kind,partnerId:partner,poRef:'',accrualDate:'2026-10-02',feeTypeCode:'F',description:'d'+id,netMinor:gross,vatMode:'NONE',vatMinor:0,grossMinor:gross,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD'},x||{}));
suite('7. TỰ GẮN PO: hóa đơn bán khớp khoản phát sinh còn mở, không có thì tạo khoản mới trong đơn',()=>{
  const w=withOrders(fresh());w.T.Accrual.push(acc('r1','o1','REVENUE','p1',1080000));
  const rows=[row({order:'DH-1',netText:'1.000.000',vat:'8'}),row({order:'DH-1',description:'Phí B',netText:'500.000',vat:'KCT'})];
  const pv=call(w,'docBulkPreview_',U,{direction:'AR',rows});eq(pv.errors,0,J(pv.rows.map(r=>r.issues)));eq(pv.created.linked,2);eq(pv.created.matchedAccruals,1,'dòng 1.080.000 khớp khoản r1');eq(pv.created.newAccruals,1);
  ok(/khớp khoản phát sinh sẵn có/.test(pv.rows[0].summary));ok(/tạo khoản phát sinh mới/.test(pv.rows[1].summary));
  call(w,'docBulkCommit_',U,{direction:'AR',rows});const d=w.T.DebtDoc[0];eq(d.source,'ORDER','chứng từ gắn PO khóa dòng như hóa đơn lập từ đơn');
  const lines=w.T.DebtLine.filter(l=>l.docId===d.id);ok(lines.every(l=>l.accrualId));
  const r1=w.T.Accrual.find(a=>a.id==='r1');deq([r1.status,r1.docId,r1.debtLineId],['INVOICING',d.id,lines[0].id],'khoản có sẵn chuyển INVOICING và trỏ tới dòng hóa đơn');
  const nu=w.T.Accrual.find(a=>a.id!=='r1');deq([nu.orderId,nu.kind,nu.status,nu.docId,nu.debtLineId,nu.grossMinor],['o1','REVENUE','INVOICING',d.id,lines[1].id,500000],'khoản mới tạo trong đơn');
  eq(d.sourceKey.split(',').length,2);
  // hiển thị PO ở danh sách công nợ
  const ls=call(w,'docList_',U,{direction:'AR'});
  const it=ls.items.find(x=>x.id===d.id);deq(it.orders.map(o=>o.orderNo),['DH-1'],'cột Đơn hàng/PO thấy ngay');
});
suite('8. Gắn PO: tra theo số đơn hoặc PO khách; hóa đơn mua gắn đơn + PO NCC; lỗi rõ ràng',()=>{
  const w=withOrders(fresh());
  let pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'PO-KH-2'})]});eq(pv.errors,0,'tra theo PO khách');
  pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'KHONGCO'})]});ok(pv.rows[0].issues.some(i=>i.code==='ORDER_UNKNOWN'));
  pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'DH-1'}),row({description:'Phí B',order:''})]});ok(pv.rows[0].issues.some(i=>i.code==='ORDER_ALL_OR_NONE'),'đã gắn PO thì mọi dòng phải gắn');
  w.T.Partner.push({id:'p9',shortName:'KHAC',legalName:'KHAC',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});
  pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({partner:'KHAC',order:'DH-1'})]});ok(pv.rows[0].issues.some(i=>i.code==='ORDER_PARTNER_MISMATCH'),'đơn của khách khác');
  pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'DH-1',serviceCode:'CBT'})]});ok(pv.rows[0].issues.some(i=>/SERVICE_CODE/.test(i.code)),'mã dịch vụ không thuộc PO');
  pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'DH-1',group:'G2'})]});ok(pv.rows[0].issues.length>0,'nhóm khác nhóm của đơn');
  // hóa đơn mua
  const rowsAp=[row({invoiceNo:'NCC-1',order:'DH-1',poRef:'PO-NCC-9',netText:'700.000',vat:'KCT',group:''})];
  pv=call(w,'docBulkPreview_',U,{direction:'AP',rows:rowsAp});eq(pv.errors,0,J(pv.rows[0].issues));eq(pv.created.newAccruals,1);
  call(w,'docBulkCommit_',U,{direction:'AP',rows:rowsAp});const a=w.T.Accrual[0];deq([a.kind,a.orderId,a.poRef,a.status,a.grossMinor],['COST','o1','PO-NCC-9','INVOICING',700000]);eq(w.T.DebtDoc[0].businessGroupCode,'G1','nhóm tự lấy theo đơn');
  const ls=call(w,'docList_',U,{direction:'AP'}).items[0];deq(ls.poRefs,['PO-NCC-9']);
});
suite('9. Tất cả hoặc không: một dòng PO sai thì không tạo hóa đơn/khoản phát sinh nào; kỳ khóa chặn; đủ cột tờ khai/container',()=>{
  const w=withOrders(fresh());w.T.Accrual.push(acc('r1','o1','REVENUE','p1',1080000));
  eq(code(()=>call(w,'docBulkCommit_',U,{direction:'AR',rows:[row({order:'DH-1'}),row({invoiceNo:'HD2',order:'KHONGCO'})]})),'VALIDATION_FAILED');eq(w.T.DebtDoc.length,0);eq(w.T.Accrual.length,1);eq(w.T.Accrual[0].status,'OPEN','khoản có sẵn không bị đổi');
  w.T.Period.push({id:'2026-10',status:'CLOSED',version:1});const pv=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'DH-1'})]});ok(pv.rows[0].issues.some(i=>i.code==='PERIOD_CLOSED'));w.T.Period.length=0;
  call(w,'docBulkCommit_',U,{direction:'AR',rows:[row({containerQty:'2',declNo:'TK-123',declDate:'2026-10-04',expectedPay:'2026-11-20',period:'2026-10',docDate:'2026-10-06'})]});
  const d=w.T.DebtDoc[0],l=w.T.DebtLine[0];deq([d.docDate,d.invoiceDate,d.expectedPayDate,d.statementPeriod],['2026-10-06','2026-10-05','2026-11-20','2026-10']);eq(l.containerQty,2);ok(l.shipmentRefId,'tờ khai tạo/liên kết');eq(w.T.ShipmentRef[0].refValue,'TK-123');
});
suite('10. Gợi ý ghép dòng hóa đơn XML với khoản phát sinh còn mở (PO/Cost)',()=>{
  const w=withOrders(fresh());w.T.Accrual.push(acc('r1','o1','REVENUE','p1',10800000,{netMinor:10000000,vatMode:'EXCLUSIVE',vatRateBp:800,vatMinor:800000,serviceCode:'FWD'}),acc('r2','o2','REVENUE','p1',1500000,{serviceCode:'FWD'}),acc('c1','o1','COST','p1',500,{partnerId:'p1'}));
  const r=call(w,'docBulkSuggest_',U,{direction:'AR',partnerId:'p1',currency:'VND',lines:[{netText:'10000000',vat:'8'},{netText:'1500000',vat:'KCT'},{netText:'777',vat:'KCT'}]});
  eq(r.items[0].candidates.length,1);eq(r.items[0].candidates[0].orderNo,'DH-1');eq(r.items[0].candidates[0].exact,true);eq(r.items[0].candidates[0].serviceCode,'FWD');
  eq(r.items[1].candidates[0].orderNo,'DH-2','dòng 2 khớp khoản của đơn khác');eq(r.items[2].candidates.length,0,'không khớp thì trống');
  const ap=call(w,'docBulkSuggest_',U,{direction:'AP',partnerId:'p1',currency:'VND',lines:[{netText:'500',vat:'KCT'}]});eq(ap.items[0].candidates[0].id,'c1','chiều mua dùng khoản chi phí');
  eq(call(w,'docBulkSuggest_',U,{direction:'AR',partnerId:'p1',currency:'USD',lines:[{netText:'10000000',vat:'8'}]}).items[0].candidates.length,0,'khác tiền tệ');
  eq(call(w,'docBulkSuggest_',U,{direction:'AR',partnerId:'khongco',currency:'VND',lines:[{netText:'1',vat:'KCT'}]}).items[0].candidates.length,0);
  eq(code(()=>call(w,'docBulkSuggest_',U,{direction:'XX',lines:[]})),'VALIDATION_FAILED');
  const sc={id:'sc',email:'sc@x',role:'ACCOUNTANT',scope:{allPartners:false,partnerIds:['zz'],businessGroups:['G1']}};eq(JSON.stringify(call(w,'docBulkSuggest_',sc,{direction:'AR',partnerId:'p1',currency:'VND',lines:[]}).items),'[]','đối tác ngoài phạm vi: không gợi ý gì (giống đối tác không tồn tại)');
});
suite('11. Một hóa đơn nhiều mã dịch vụ (dòng khác mã dịch vụ của cùng PO) gắn đúng từng dòng',()=>{
  const w=withOrders(fresh());w.T.Order[0].servicesJson=J([{code:'FWD',hsdvNo:'H1'},{code:'CFN',hsdvNo:'H3'}]);w.T.Catalog.push({id:'s2',catalogType:'SERVICE_CODE',code:'CFN',name:'CFN',attrsJson:'{}',active:1,sortOrder:2,version:1});
  const rows=[row({order:'DH-1',serviceCode:'FWD',description:'Cước',netText:'1.000.000',vat:'KCT'}),row({order:'DH-1',serviceCode:'CFN',description:'Chuyển phát',netText:'500.000',vat:'KCT'})];
  const pv=call(w,'docBulkPreview_',U,{direction:'AR',rows});eq(pv.errors,0,J(pv.rows.map(r=>r.issues)));
  call(w,'docBulkCommit_',U,{direction:'AR',rows});deq(w.T.DebtLine.map(l=>l.serviceCode),['FWD','CFN']);deq(w.T.Accrual.map(a=>a.serviceCode),['FWD','CFN']);
  const bad=call(w,'docBulkPreview_',U,{direction:'AR',rows:[row({order:'DH-1',serviceCode:'',description:'x'})]});ok(bad.rows[0].issues.some(i=>/SERVICE_CODE/.test(i.code)),'PO nhiều mã dịch vụ mà để trống thì báo phải chọn');
});
console.log('Kiểm thử nhập hàng loạt hóa đơn:',steps,'khẳng định');
suite('R35. Nhập hàng loạt hóa đơn bán / mua có SL × đơn giá: để trống thành tiền thì tự tính; nhập cả hai phải khớp; đơn giá thiếu SL bị chặn; ghi lại SL + đơn giá vào dòng phí',()=>{
  for(const dir of ['AR','AP']){
    const w=fresh(),b=o=>row(Object.assign({partner:'ABC',vat:'KCT'},o));
    const pv=call(w,'docBulkPreview_',U,{direction:dir,rows:[b({containerQty:'2,5',unitPrice:'5.000',netText:''})]});eq(pv.errors,0,J(pv.rows.map(r=>r.issues)));eq(pv.totals.VND,12500,dir+': 2,5 × 5.000 = 12.500');
    eq(call(w,'docBulkPreview_',U,{direction:dir,rows:[b({containerQty:'2,5',unitPrice:'5.000',netText:'12.500'})]}).errors,0,'nhập cả hai và khớp');
    const bad=call(w,'docBulkPreview_',U,{direction:dir,rows:[b({containerQty:'2,5',unitPrice:'5.000',netText:'12.499'})]});eq(bad.errors,1);ok(bad.rows[0].issues.some(i=>i.code==='NET_MISMATCH'),J(bad.rows[0].issues));
    const nq=call(w,'docBulkPreview_',U,{direction:dir,rows:[b({unitPrice:'5.000',netText:''})]});ok(nq.errors>=1,'đơn giá không có SL');
    eq(call(w,'docBulkPreview_',U,{direction:dir,rows:[b({containerQty:'4',unitPrice:'',netText:'10.000'})]}).errors,0,'có SL không đơn giá: nhập thành tiền');
    call(w,'docBulkCommit_',U,{direction:dir,rows:[b({containerQty:'2,5',unitPrice:'5.000',netText:''})],batchLabel:'T'});
    const ln=w.T.DebtLine[0];eq(ln.containerQty,2.5);eq(ln.unitPrice,5000);eq(ln.netMinor,12500);
  }
});
