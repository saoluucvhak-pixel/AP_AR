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
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
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
const strip=r=>{const c=JSON.parse(J(r));if(c.meta)delete c.meta.generatedAt;return J(c)};
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',e.message.split('\n')[0]);process.exitCode=1}}
const addDoc=(w,id,o,amount)=>{w.T.DebtDoc.push(Object.assign({id,docNo:id.toUpperCase(),direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-30',status:'APPROVED',totalGrossMinor:amount||1000,isOpening:0,createdBy:'creator',approvedBy:'x',version:1},o));w.T.DebtLine.push({id:'l_'+id,docId:id,lineNo:1,feeTypeCode:'F',netMinor:amount||1000,grossMinor:amount||1000,vatMinor:0,vatMode:'NONE'})};
const outstanding=(w,asOf)=>{const l=w.ctx.loadLedger_(full,asOf);return Object.keys(l.bal.byLine).reduce((s,k)=>s+l.bal.byLine[k].out,0)};

suite('A. Chứng từ ngày 30/09 ghi nhận ngày 23/10 (qua hai kỳ): sổ đã chốt 30/09 không đổi',()=>{
  const w=world('2026-10-23');w.T.Period.push({id:'2026-09',status:'CLOSED',version:1});
  addDoc(w,'d1',{docNo:'PT-1'});
  const beforeLedger=J(w.ctx.loadLedger_(full,'2026-09-30').bal.byLine),beforeRep=strip(w.ctx.reportRun_(full,{payload:{code:'R02',params:{asOf:'2026-09-30'}}}));
  eq(outstanding(w,'2026-09-30'),0,'chưa ghi nhận: chưa có công nợ');
  // ghi nhận vào kỳ đã khóa bị chặn; ghi nhận trước ngày chứng từ bị chặn; ghi nhận ở tương lai bị chặn
  eq(code(()=>call(w,'docPost_',full,{id:'d1',postingDate:'2026-09-30'})),'PERIOD_CLOSED','ghi nhận vào kỳ đã khóa');
  eq(code(()=>call(w,'docPost_',full,{id:'d1',postingDate:'2026-09-01'})),'VALIDATION_FAILED','ghi nhận trước ngày chứng từ');
  eq(code(()=>call(w,'docPost_',full,{id:'d1',postingDate:'2026-11-01'})),'VALIDATION_FAILED','ghi nhận ở tương lai');
  eq(code(()=>call(w,'docPost_',full,{id:'d1',postingDate:'2026-10-23'})),'OK');
  eq(w.T.DebtDoc[0].status,'POSTED');eq(w.T.DebtDoc[0].postingDate,'2026-10-23');
  eq(J(w.ctx.loadLedger_(full,'2026-09-30').bal.byLine),beforeLedger,'số dư tại 30/09 không đổi sau ghi nhận ngày 23/10');
  eq(strip(w.ctx.reportRun_(full,{payload:{code:'R02',params:{asOf:'2026-09-30'}}})),beforeRep,'báo cáo tại 30/09 không đổi');
  eq(outstanding(w,'2026-10-22'),0,'22/10 chưa có');eq(outstanding(w,'2026-10-23'),1000,'23/10 có công nợ');
  // chế độ riêng theo ngày chứng từ: ghi nhãn rõ, tại 30/09 thấy chứng từ
  const doc=w.ctx.reportRun_(full,{payload:{code:'R02',params:{asOf:'2026-09-30',dateBasis:'DOC'}}});
  ok(/NGÀY CHỨNG TỪ/.test(doc.notes[0])&&doc.meta.dateBasis==='Ngày chứng từ','chế độ ngày chứng từ được ghi nhãn');
  eq(outstanding(w,'2026-09-30'),0,'sau khi trả về chế độ ghi nhận mặc định vẫn 0');
  eq(code(()=>call(w,'reportIssue_',full,{code:'R02',params:{asOf:'2026-09-30',dateBasis:'DOC'}})),'VALIDATION_FAILED','không lập bản chốt theo ngày chứng từ');
  // dữ liệu cũ bị ảnh hưởng được liệt kê
  const imp=w.ctx.ledgerDateImpact_();eq(imp.length,1);eq(imp[0].docNo,'PT-1');ok(imp[0].docPeriodClosed,'nêu rõ kỳ chứng từ đã khóa');
});
suite('A2. Thanh toán/phân bổ/điều chỉnh/đảo theo ngày hiệu lực của sổ',()=>{
  const w=world('2026-10-23');addDoc(w,'d1',{status:'POSTED',postingDate:'2026-10-23',docDate:'2026-09-30'});
  w.T.Payment.push({id:'pay1',payNo:'PH1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:1000,effectiveDate:'2026-10-23',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  eq(code(()=>call(w,'paymentAllocate_',full,{paymentId:'pay1',items:[{debtLineId:'l_d1',amountMinor:100}],effectiveDate:'2026-10-01'})),'VALIDATION_FAILED','phân bổ trước ngày vào sổ của chứng từ/phiếu');
  eq(code(()=>call(w,'paymentAllocate_',full,{paymentId:'pay1',items:[{debtLineId:'l_d1',amountMinor:400}],effectiveDate:'2026-10-24'})),'OK');
  eq(outstanding(w,'2026-10-23'),1000,'23/10 chưa phân bổ');eq(outstanding(w,'2026-10-24'),600,'24/10 còn 600');
  w.T.DebtDoc.push({id:'adj',docNo:'DC1',direction:'AR',docType:'ADJ_DEC',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-10-20',status:'APPROVED',totalGrossMinor:-100,adjustsDocId:'d1',createdBy:'creator',version:1});
  w.T.DebtLine.push({id:'l_adj',docId:'adj',lineNo:1,netMinor:-100,grossMinor:-100,vatMinor:0,adjustsLineId:'l_d1'});
  eq(code(()=>call(w,'docPost_',full,{id:'adj',postingDate:'2026-10-25'})),'VALIDATION_FAILED','ngày ghi nhận trong tương lai (hôm nay 23/10)');
  eq(code(()=>call(w,'docPost_',full,{id:'adj',postingDate:'2026-10-23'})),'OK');
  eq(outstanding(w,'2026-10-22'),0,'điều chỉnh ghi nhận 23/10 không đổi số tại 22/10');eq(outstanding(w,'2026-10-24'),500,'sau điều chỉnh -100 và thu 400');
});
suite('B. Khóa kỳ: nhập tay, nhập hàng loạt, sửa/hủy khoản, đổi ngày/chuyển hồ sơ',()=>{
  const w=world('2026-10-23');w.T.Period.push({id:'2026-09',status:'CLOSED',version:1});
  w.T.Order.push({id:'oc',orderNo:'DH-C',poNo:'PC',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-10',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'GML/FWD/ABC-26/001'}]),serviceCode:'FWD',hsdvNo:'GML/FWD/ABC-26/001',version:1},
                {id:'oo',orderNo:'DH-O',poNo:'PO',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-05',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'GML/FWD/ABC-26/002'}]),serviceCode:'FWD',hsdvNo:'GML/FWD/ABC-26/002',version:1});
  const acc=(id,o,d)=>({id,orderId:o,kind:'REVENUE',partnerId:'p1',accrualDate:d,feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',vatMinor:0,grossMinor:1000,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  w.T.Accrual.push(acc('ac','oc','2026-09-10'),acc('ao','oo','2026-10-05'));
  const P=(o,d,extra)=>Object.assign({orderId:o,kind:'REVENUE',partnerId:'p1',currency:'VND',accrualDate:d,feeTypeCode:'F',description:'x',netMinor:500,vatMode:'NONE',serviceCode:'FWD'},extra);
  const snap=()=>J(w.T);
  const rej=(fn,c,m)=>{const b=snap();eq(code(fn),c,m);eq(snap(),b,m+' – không ghi gì')};
  rej(()=>call(w,'accrualSave_',full,P('oo','2026-09-20')),'PERIOD_CLOSED','tạo khoản có ngày thuộc kỳ khóa');
  rej(()=>call(w,'accrualSave_',full,P('oc','2026-10-05',{id:'ac'})),'PERIOD_CLOSED','sửa khoản gốc thuộc kỳ khóa (dù ngày mới ở kỳ mở)');
  rej(()=>call(w,'accrualSave_',full,P('oo','2026-09-30',{id:'ao'})),'PERIOD_CLOSED','chuyển ngày khoản sang kỳ khóa');
  eq(code(()=>call(w,'accrualSave_',full,P('oo','2026-10-06',{id:'ao'}))),'OK','sửa khoản kỳ mở bình thường');
  rej(()=>call(w,'orderSave_',full,{customerPartnerId:'p1',poNo:'N',orderDate:'2026-09-15',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD']}),'PERIOD_CLOSED','tạo đơn vào kỳ khóa');
  rej(()=>call(w,'orderSave_',full,{id:'oc',customerPartnerId:'p1',poNo:'PC',orderDate:'2026-10-02',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD']}),'PERIOD_CLOSED','chuyển ngày đơn thuộc kỳ khóa sang kỳ mở');
  rej(()=>call(w,'orderSave_',full,{id:'oo',customerPartnerId:'p1',poNo:'PO',orderDate:'2026-09-02',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD']}),'PERIOD_CLOSED','chuyển ngày đơn kỳ mở về kỳ khóa');
  rej(()=>call(w,'orderSave_',full,{id:'oc',customerPartnerId:'p1',poNo:'PC',orderDate:'2026-09-10',businessGroupCode:'G1',currency:'USD',serviceCodes:['FWD']}),'PERIOD_CLOSED','đổi tiền tệ đơn thuộc kỳ khóa');
  eq(code(()=>call(w,'orderSave_',full,{id:'oc',customerPartnerId:'p1',poNo:'PC-moi',orderDate:'2026-09-10',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD'],note:'ghi chú'})),'OK','chỉ đổi số PO/ghi chú không ảnh hưởng báo cáo');
  // nhập hàng loạt vào kỳ khóa: chặn cả xem trước và ghi
  const row={customer:'ABC',poNo:'PB',date:'2026-09-12',group:'G1',currency:'VND',serviceCode:'FWD',feeType:'F',description:'x',netText:'1000',vat:'KCT'};
  const pv=w.ctx.orderBulkPreview_(full,{payload:{kind:'REVENUE',rows:[row]}});eq(pv.errors,1);ok(pv.rows[0].issues.some(i=>i.code==='PERIOD_CLOSED'));
  rej(()=>call(w,'orderBulkCommit_',full,{kind:'REVENUE',rows:[row]}),'VALIDATION_FAILED','ghi hàng loạt vào kỳ khóa');
  eq(w.ctx.orderBulkPreview_(full,{payload:{kind:'REVENUE',rows:[Object.assign({},row,{date:'2026-10-12'})]}}).errors,0,'cùng dòng ở kỳ mở thì hợp lệ');
  // phân bổ vào kỳ khóa
  addDoc(w,'dp',{status:'POSTED',postingDate:'2026-10-05',docDate:'2026-10-05'});w.T.Payment.push({id:'pp',payNo:'PH',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:500,effectiveDate:'2026-09-01',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  rej(()=>call(w,'paymentAllocate_',full,{paymentId:'pp',items:[{debtLineId:'l_dp',amountMinor:100}],effectiveDate:'2026-09-20'}),'PERIOD_CLOSED','phân bổ vào kỳ khóa');
  // hủy khoản gốc kỳ khóa: được phép nhưng ghi ngày hủy ở kỳ mở
  eq(code(()=>call(w,'accrualCancel_',full,{id:'ac'})),'OK');eq(w.T.Accrual[0].cancelledDate,'2026-10-23');
});
suite('B2. Báo cáo quá khứ trước/sau ngày hủy khoản và hủy đơn',()=>{
  const w=world('2026-10-23');
  w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1});
  const mk=(id,k,net,d)=>({id,orderId:'o1',kind:k,partnerId:'p1',accrualDate:d,feeTypeCode:'F',description:'x',netMinor:net,vatMode:'NONE',vatMinor:0,grossMinor:net,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  w.T.Accrual.push(mk('r1','REVENUE',1000,'2026-09-10'),mk('c1','COST',300,'2026-09-12'));
  const r9=asOf=>{const t=w.ctx.rep09_(full,'R09',{asOf}).rows.filter(r=>r.t==='total')[0];return t?t.cells:{unRev:0,unCost:0}};
  // khoản chưa lập hóa đơn (OPEN) chưa là doanh thu/chi phí ghi nhận: theo dõi ở cột chưa lập HĐ
  eq(r9('2026-09-30').unRev,1000);eq(r9('2026-09-30').unCost,300);eq(r9('2026-09-30').rev,0,'chưa lập HĐ thì chưa vào doanh thu');
  call(w,'accrualCancel_',full,{id:'c1'});   // hủy chi phí ngày 23/10
  eq(r9('2026-09-30').unCost,300,'tại 30/09 chi phí đã hủy sau đó vẫn còn');eq(r9('2026-10-22').unCost,300,'trước ngày hủy vẫn còn');eq(r9('2026-10-23').unCost,0,'từ ngày hủy trở đi không còn');
  eq(w.ctx.dashboardUninvoicedLive_(full,{payload:{asOf:'2026-09-30'}}).uninvoiced.VND.cost,300,'chưa lập hóa đơn tại 30/09 gồm khoản hủy sau đó');
  eq((w.ctx.dashboardUninvoicedLive_(full,{payload:{asOf:'2026-10-23'}}).uninvoiced.VND||{cost:0}).cost,0);
  // hủy đơn: đơn và khoản của đơn
  call(w,'orderSetStatus_',full,{id:'o1',status:'CANCELLED'});eq(w.T.Order[0].cancelledDate,'2026-10-23');
  eq(r9('2026-09-30').unRev,1000,'đơn hủy ngày 23/10 vẫn nằm trong báo cáo 30/09');eq(r9('2026-10-23').unRev,0);
});
suite('C. Khoản OPEN → INVOICING → INVOICED không mất, không trùng',()=>{
  const w=world('2026-10-23');
  w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1});
  const mk=(id,k,net,st,extra)=>Object.assign({id,orderId:'o1',kind:k,partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:'x',netMinor:net,vatMode:'NONE',vatMinor:0,grossMinor:net,isPassThrough:0,currency:'VND',status:st,docId:'',debtLineId:'',serviceCode:'FWD',version:1},extra||{});
  w.T.Accrual.push(mk('r_open','REVENUE',100,'OPEN'),mk('r_ing','REVENUE',200,'INVOICING',{docId:'dx'}),mk('r_inv','REVENUE',400,'INVOICED',{docId:'dy'}),mk('c_open','COST',10,'OPEN'),mk('c_ing','COST',20,'INVOICING',{docId:'dx'}),mk('c_inv','COST',40,'INVOICED',{docId:'dy'}),mk('c_x','COST',999,'CANCELLED'));
  const t=w.ctx.orderTotals(w.T.Accrual.map(a=>Object.assign({},a)))['VND'];
  eq(t.revenueGross,700);eq(t.revenueGross,t.uninvoicedRevenue+t.invoicingRevenue+t.invoicedRevenue,'doanh thu = chưa lập + đang lập + đã ghi nhận');
  eq(t.costGross,70);eq(t.costGross,t.uninvoicedCost+t.invoicingCost+t.invoicedCost,'chi phí đối chiếu đủ, khoản hủy không tính');
  eq(t.invoicingRevenue,200);eq(t.invoicingCost,20);eq(t.incompleteRevenue,300,'chưa hoàn tất = chưa lập + đang lập');
  const rep=w.ctx.rep09_(full,'R09',{asOf:'2026-10-23'}),tot=rep.rows.filter(r=>r.t==='total')[0].cells;
  eq(tot.unRev,100);eq(tot.invRev,200,'R09 có cột đang lập HĐ');eq(tot.invCost,20);eq(tot.unCost,10);
  const un=w.ctx.dashboardUninvoicedLive_(full,{payload:{asOf:'2026-10-23'}}).uninvoiced.VND;eq(un.invoicingRevenue,200);eq(un.revenue,100);
  eq(w.ctx.orderList_(full,{payload:{onlyUninvoiced:true}}).items.length,1,'đơn còn khoản chưa hoàn tất hiện trong bộ lọc');
  eq(code(()=>call(w,'orderSetStatus_',full,{id:'o1',status:'CLOSED'})),'ORDER_HAS_UNINVOICED','không đóng đơn khi còn khoản chưa/đang lập hóa đơn');
  // vòng đời thật: lập hóa đơn -> INVOICING, xóa nháp -> OPEN lại, không trùng
  const w2=world('2026-10-23');w2.T.Order.push(Object.assign({},w.T.Order[0]));w2.T.Accrual.push(mk('a1','REVENUE',500,'OPEN'));
  call(w2,'accrualInvoice_',full,{accrualIds:['a1'],invoiceNo:'HD1',invoiceDate:'2026-10-10',docDate:'2026-10-10'});
  eq(w2.T.Accrual[0].status,'INVOICING');eq(w2.T.DebtDoc.length,1);eq(w2.T.DebtLine.length,1);
  eq(code(()=>call(w2,'accrualInvoice_',full,{accrualIds:['a1'],invoiceNo:'HD2',invoiceDate:'2026-10-10'})),'STATE_TRANSITION_INVALID','khoản đang lập hóa đơn không lập lần hai');eq(w2.T.DebtDoc.length,1);
  call(w2,'docDelete_',full,{id:w2.T.DebtDoc[0].id});eq(w2.T.Accrual[0].status,'OPEN','xóa nháp trả khoản về OPEN');eq(w2.T.Accrual[0].docId,'');
});
suite('D. Thu hộ/chi hộ tách khỏi lợi nhuận; phí dịch vụ riêng; từng tiền tệ',()=>{
  const w=world('2026-10-23');
  w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1});
  const mk=(id,k,net,cur,pass,fee,st)=>({id,orderId:'o1',kind:k,partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:fee||'F',description:'x',netMinor:net,vatMode:'NONE',vatMinor:0,grossMinor:net,isPassThrough:pass?1:0,currency:cur,status:st||'INVOICED',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  w.T.Accrual.push(mk('svc_r','REVENUE',1000,'VND'),mk('svc_c','COST',400,'VND'),mk('pass_r','REVENUE',300,'VND',true),mk('pass_c','COST',300,'VND',true),mk('usd_r','REVENUE',50,'USD'));
  let t=w.ctx.orderTotals(w.T.Accrual.map(a=>a))['VND'],u=w.ctx.orderTotals(w.T.Accrual)['USD'];
  eq(t.revenueNet,1000,'doanh thu dịch vụ không gồm thu hộ');eq(t.costNet,400);eq(t.margin,600,'lãi gộp chỉ từ phí dịch vụ');eq(t.passRevenue,300);eq(t.passCost,300);eq(t.passGap,0,'thu hộ = chi hộ: cân');eq(u.revenueNet,50,'USD tách riêng');eq(t.revenueNet+u.revenueNet===1050,true,'(chỉ để kiểm tra không có hàm cộng chéo)');
  const rep=w.ctx.rep09_(full,'R09',{asOf:'2026-10-23'}),tots=rep.rows.filter(r=>r.t==='total'&&!/QUY ĐỔI/.test(r.cells.order));eq(tots.length,2,'mỗi tiền tệ một dòng tổng (không tính dòng tổng quy đổi VND)');
  const v=tots.find(r=>r.currency==='VND').cells;eq(v.margin,600);eq(v.passGap,0);eq(tots.find(r=>r.currency==='USD').cells.rev,50);
  // chi hộ lệch: không tự thành lợi nhuận
  w.T.Accrual[3].netMinor=w.T.Accrual[3].grossMinor=200;t=w.ctx.orderTotals(w.T.Accrual)['VND'];eq(t.margin,600,'lệch số hộ không làm đổi lãi gộp');eq(t.passGap,100,'số hộ chưa đối ứng = 100');
  const v2=w.ctx.rep09_(full,'R09',{asOf:'2026-10-23'}).rows.filter(r=>r.t==='total'&&r.currency==='VND')[0].cells;ok(/số hộ chưa đối ứng/.test(v2.state),'tình trạng: số hộ chưa đối ứng');
  // nguyên tắc: có hóa đơn mới ghi nhận doanh thu/chi phí — khoản chưa lập (OPEN) và đang lập (INVOICING) không vào doanh thu/chi phí/lãi
  const w5=world('2026-10-23');w5.T.Order.push(w.T.Order[0]);w5.T.Accrual.push(mk('i_r','REVENUE',1000,'VND',false,'F','INVOICED'),mk('i_c','COST',400,'VND',false,'F','INVOICED'),mk('o_r','REVENUE',5000,'VND',false,'F','OPEN'),mk('n_c','COST',700,'VND',false,'F','INVOICING'));
  const t5=w5.ctx.orderTotals(w5.T.Accrual)['VND'];eq(t5.revenueNet,1000,'chỉ khoản đã lập hóa đơn là doanh thu');eq(t5.costNet,400);eq(t5.margin,600,'lãi gộp không gồm khoản chưa/đang lập hóa đơn');eq(t5.uninvoicedRevenue,5000,'khoản chưa lập vẫn hiện ở cột chưa lập HĐ');eq(t5.invoicingCost,700);eq(t5.revenueGross,6000,'đối chiếu tổng khoản hợp lệ vẫn đủ');
  const v5=w5.ctx.rep09_(full,'R09',{asOf:'2026-10-23'}).rows.filter(r=>r.t==='total'&&r.currency==='VND')[0].cells;eq(v5.rev,1000);eq(v5.margin,600);ok(/chưa tính vào lãi/.test(v5.state),'tình trạng nói rõ khoản chưa lập HĐ chưa tính vào lãi: '+v5.state);
  // doanh thu chưa có chi phí: chưa đủ dữ liệu; chi hộ chưa đánh dấu: chờ xác minh
  const w3=world('2026-10-23');w3.T.Order.push(w.T.Order[0]);w3.T.Accrual.push(mk('r',"REVENUE",100,'VND'),mk('cp','COST',50,'VND',false,'PASS_THROUGH'));
  const t3=w3.ctx.orderTotals(w3.T.Accrual)['VND'];eq(t3.passUnverified,1,'chi hộ chưa đánh dấu = chờ xác minh');eq(t3.costNet,50,'chưa xác minh thì chưa loại khỏi chi phí dịch vụ (không tự đoán)');
  const w4=world('2026-10-23');w4.T.Order.push(w.T.Order[0]);w4.T.Accrual.push(mk('r',"REVENUE",100,'VND'));
  ok(/Chưa đủ dữ liệu/.test(w4.ctx.rep09_(full,'R09',{asOf:'2026-10-23'}).rows.filter(r=>r.t==='total')[0].cells.state),'doanh thu chưa có chi phí');
});
suite('E. Thanh toán một phần, nhiều lần, đảo phân bổ, chặn vượt số dư',()=>{
  const w=world('2026-10-23');addDoc(w,'d1',{status:'POSTED',postingDate:'2026-10-01',docDate:'2026-10-01'});
  w.T.Payment.push({id:'pay1',payNo:'PH1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:700,effectiveDate:'2026-10-02',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1},{id:'pay2',payNo:'PH2',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:900,effectiveDate:'2026-10-03',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  const al=(pay,amt,d)=>call(w,'paymentAllocate_',full,{paymentId:pay,items:[{debtLineId:'l_d1',amountMinor:amt}],effectiveDate:d||'2026-10-10'});
  eq(code(()=>al('pay1',400)),'OK');eq(outstanding(w,'2026-10-10'),600,'thanh toán một phần');
  eq(code(()=>al('pay1',400)),'VALIDATION_FAILED','vượt số dư chưa phân bổ của phiếu (còn 300)');
  eq(code(()=>al('pay1',300)),'OK');eq(outstanding(w,'2026-10-10'),300,'nhiều lần');
  eq(code(()=>al('pay2',400)),'VALIDATION_FAILED','vượt số dư còn lại của dòng (còn 300)');
  eq(code(()=>al('pay2',300)),'OK');eq(outstanding(w,'2026-10-10'),0);
  eq(code(()=>al('pay2',1)),'VALIDATION_FAILED','dòng đã thanh toán hết');
  const a1=w.T.Allocation[0];
  eq(code(()=>call(w,'paymentReverseAllocation_',full,{allocationId:a1.id,amountMinor:1000,effectiveDate:'2026-10-11'})),'VALIDATION_FAILED','đảo vượt số đã phân bổ');
  eq(code(()=>call(w,'paymentReverseAllocation_',full,{allocationId:a1.id,amountMinor:150,effectiveDate:'2026-10-11'})),'OK');eq(outstanding(w,'2026-10-11'),150,'đảo một phần phân bổ');eq(outstanding(w,'2026-10-10'),0,'ngày trước đảo không đổi');
  eq(code(()=>call(w,'paymentReverseAllocation_',full,{allocationId:a1.id,effectiveDate:'2026-10-12'})),'OK','đảo nốt phần còn lại');eq(outstanding(w,'2026-10-12'),400);
  eq(code(()=>call(w,'paymentReverseAllocation_',full,{allocationId:a1.id,amountMinor:1,effectiveDate:'2026-10-12'})),'VALIDATION_FAILED','không đảo quá');
});
console.log('\nKiểm thử theo prompt: '+steps+' khẳng định (dữ liệu giả)');

const OPENORD=(w)=>w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1});
const MKA=(o)=>Object.assign({id:'a1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-09-05',feeTypeCode:'F',description:'x',netMinor:1000000,vatMode:'NONE',vatMinor:0,grossMinor:1000000,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1},o||{});
const r09=(w,asOf)=>w.ctx.rep09_(full,'R09',{asOf}).rows.filter(r=>r.t==='total')[0].cells;
suite('F. R09 quá khứ không đổi khi đảo hóa đơn / lập hóa đơn nháp sau ngày chốt',()=>{
  // Ca A: hóa đơn ghi nhận tháng 9, đảo ngày 25/10
  const w=world('2026-10-25');OPENORD(w);
  w.T.Accrual.push(MKA({status:'INVOICED',docId:'d1',debtLineId:'l1'}));
  w.T.DebtDoc.push({id:'d1',docNo:'HD1',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-15',postingDate:'2026-09-15',status:'POSTED',totalGrossMinor:1000000,createdAt:'2026-09-10T03:00:00.000Z',createdBy:'creator',version:1});
  w.T.DebtLine.push({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',netMinor:1000000,grossMinor:1000000,vatMinor:0,accrualId:'a1'});
  const b=r09(w,'2026-09-30'),bNow=r09(w,'2026-10-25');eq(b.unRev,0);eq(b.invRev,0);eq(bNow.unRev,0);
  call(w,'docReverse_',full,{docId:'d1',reason:'sai',docDate:'2026-10-25'});
  const rev=w.T.DebtDoc.find(d=>d.reversesDocId==='d1');rev.status='APPROVED';rev.createdBy='creator';
  eq(code(()=>call(w,'docPost_',full,{id:rev.id,postingDate:'2026-10-25'})),'OK');
  eq(w.T.Accrual[0].status,'OPEN','sau đảo khoản được giải phóng để lập lại');
  const a=r09(w,'2026-09-30');eq(a.unRev,0,'R09 tại 30/09 vẫn thấy khoản đã lập hóa đơn (không quay lại chưa lập)');eq(a.rev,b.rev,'doanh thu không đổi');
  const a2=r09(w,'2026-10-25');eq(a2.unRev,1000000,'hôm nay (sau đảo) khoản chưa lập hóa đơn');
  // Ca B: khoản OPEN tháng 9, tạo hóa đơn nháp 25/10
  const w2=world('2026-10-25');OPENORD(w2);w2.T.Accrual.push(MKA());
  eq(r09(w2,'2026-09-30').unRev,1000000);
  call(w2,'accrualInvoice_',full,{accrualIds:['a1'],invoiceNo:'HD9',invoiceDate:'2026-10-25',docDate:'2026-10-25'});
  eq(w2.T.Accrual[0].status,'INVOICING');
  const c=r09(w2,'2026-09-30');eq(c.unRev,1000000,'R09 tại 30/09 vẫn là chưa lập hóa đơn');eq(c.invRev,0,'chưa có "đang lập" tại 30/09');
  const c2=r09(w2,'2026-10-25');eq(c2.unRev,0);eq(c2.invRev,1000000,'hôm nay là đang lập hóa đơn');
  eq(c.rev,c2.rev,'tổng doanh thu không đổi');
});
suite('G. Điều chỉnh giảm giá dịch vụ cập nhật doanh thu R09 theo ngày hiệu lực',()=>{
  const w=world('2026-10-25');OPENORD(w);
  w.T.Accrual.push(MKA({status:'INVOICED',docId:'d1',debtLineId:'l1'}));
  w.T.DebtDoc.push({id:'d1',docNo:'HD1',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-15',postingDate:'2026-09-15',status:'POSTED',totalGrossMinor:1000000,createdAt:'2026-09-10T03:00:00.000Z',createdBy:'creator',version:1});
  w.T.DebtLine.push({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',netMinor:1000000,grossMinor:1000000,vatMinor:0,vatMode:'NONE',accrualId:'a1'});
  eq(r09(w,'2026-10-25').rev,1000000);
  call(w,'docAdjust_',full,{docId:'d1',kind:'DEC',reason:'giảm giá',docDate:'2026-10-25',lines:[{targetLineId:'l1',amountMinor:100000,description:'Giảm giá dịch vụ'}]});
  const adj=w.T.DebtDoc.find(d=>d.docType==='ADJ_DEC');eq(r09(w,'2026-10-25').rev,1000000,'điều chỉnh nháp chưa ghi nhận: chưa đổi');
  adj.status='APPROVED';adj.createdBy='creator';
  eq(code(()=>call(w,'docPost_',full,{id:adj.id,postingDate:'2026-10-25'})),'OK');
  eq(outstanding(w,'2026-10-25'),900000,'công nợ còn 900.000');
  eq(r09(w,'2026-10-25').rev,900000,'R09 hôm nay: doanh thu dịch vụ sau điều chỉnh');
  eq(r09(w,'2026-10-24').rev,1000000,'R09 trước ngày điều chỉnh giữ nguyên');
  eq(r09(w,'2026-09-30').rev,1000000);
  const t=w.ctx.orderList_(full,{payload:{}}).items[0].totals.VND;eq(t.revenueNet,900000,'danh sách đơn hiện doanh thu đã điều chỉnh');
  // điều chỉnh tăng
  call(w,'docAdjust_',full,{docId:'d1',kind:'INC',reason:'bổ sung',docDate:'2026-10-25',lines:[{targetLineId:'l1',amountMinor:50000,description:'Phụ phí'}]});
  const inc=w.T.DebtDoc.filter(d=>d.docType==='ADJ_INC')[0];inc.status='APPROVED';inc.createdBy='creator';call(w,'docPost_',full,{id:inc.id,postingDate:'2026-10-25'});
  eq(r09(w,'2026-10-25').rev,950000,'cộng điều chỉnh tăng, không cộng hai lần');
});

suite('H. Xóa / từ chối hóa đơn nháp sau ngày chốt không đổi R09 quá khứ',()=>{
  const mkw=(today)=>{const w=world(today);OPENORD(w);w.T.Accrual.push(MKA({status:'INVOICING',docId:'d1',debtLineId:'l1'}));
    w.T.DebtDoc.push({id:'d1',docNo:'HD1',direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-20',status:'SUBMITTED',totalGrossMinor:1000000,createdAt:'2026-09-20T03:00:00.000Z',createdBy:'creator',submittedBy:'creator',version:1});
    w.T.DebtLine.push({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',netMinor:1000000,grossMinor:1000000,vatMinor:0,vatMode:'NONE',accrualId:'a1'});return w};
  // xóa
  let w=mkw('2026-10-25');
  eq(r09(w,'2026-09-30').invRev,1000000);eq(r09(w,'2026-09-19').unRev,1000000,'trước ngày tạo hóa đơn là chưa lập');
  w.T.DebtDoc[0].status='DRAFT';
  call(w,'docDelete_',full,{id:'d1'});eq(w.T.Accrual[0].status,'OPEN');
  eq(r09(w,'2026-09-30').invRev,1000000,'xóa ngày 25/10: R09 tại 30/09 vẫn đang lập');eq(r09(w,'2026-09-30').unRev,0);
  eq(r09(w,'2026-10-25').invRev,0);eq(r09(w,'2026-10-25').unRev,1000000,'hôm nay khoản đã được giải phóng');
  // từ chối (khoản vẫn thuộc hóa đơn bị từ chối, chờ sửa/gửi lại)
  w=mkw('2026-10-25');
  call(w,'docReject_',{id:'ap2',email:'b@x',role:'APPROVER',scope:{allPartners:true}},{id:'d1',reason:'sai'});eq(w.T.DebtDoc[0].status,'REJECTED');
  eq(r09(w,'2026-09-30').invRev,1000000,'từ chối ngày 25/10: R09 tại 30/09 vẫn đang lập');eq(r09(w,'2026-09-30').unRev,0);eq(r09(w,'2026-10-25').invRev,1000000,'khoản vẫn được giữ bởi hóa đơn bị từ chối');
  // xóa rồi lập lại bằng hóa đơn khác: không cộng hai lần
  w=mkw('2026-10-25');w.T.DebtDoc[0].status='DRAFT';call(w,'docDelete_',full,{id:'d1'});
  call(w,'accrualInvoice_',full,{accrualIds:['a1'],invoiceNo:'HD2',invoiceDate:'2026-10-25',docDate:'2026-10-25'});
  const x=r09(w,'2026-10-25');eq(x.invRev,1000000);eq(x.unRev,0);eq(x.rev,0,'hóa đơn nháp chưa ghi nhận nên chưa vào doanh thu');eq(x.invRev+x.unRev,1000000,'không trùng sau khi lập lại');eq(r09(w,'2026-09-30').invRev,1000000);
});
suite('I. Điều chỉnh khoản chi phí chia nhiều đơn: tổng các phần = điều chỉnh gốc',()=>{
  const cases=[{n:2,w:[500,500],cur:'VND',kind:'INC',amt:1},{n:3,w:[1,1,1],cur:'VND',kind:'INC',amt:1},{n:3,w:[333,333,334],cur:'USD',kind:'DEC',amt:100},{n:5,w:[7,11,13,17,19],cur:'VND',kind:'INC',amt:1001},{n:4,w:[1,1,1,1],cur:'VND',kind:'DEC',amt:3}];
  cases.forEach((cs,ci)=>{
    const w=world('2026-10-25'),tot=cs.w.reduce((a,b)=>a+b,0);
    for(let i=0;i<cs.n;i++)w.T.Order.push({id:'o'+i,orderNo:'DH-'+i,poNo:'P'+i,customerPartnerId:'p1',businessGroupCode:'G1',currency:cs.cur,orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N'+i}]),serviceCode:'FWD',hsdvNo:'N'+i,version:1});
    w.T.Accrual.push({id:'c1',orderId:'',kind:'COST',partnerId:'p1',accrualDate:'2026-09-05',feeTypeCode:'F',description:'x',netMinor:tot,vatMode:'NONE',vatMinor:0,grossMinor:tot,isPassThrough:0,currency:cs.cur,status:'INVOICED',docId:'d1',debtLineId:'l1',serviceCode:'FWD',version:1});
    cs.w.forEach((x,i)=>w.T.AccrualSplit.push({id:'sp'+i,accrualId:'c1',orderId:'o'+i,shareNetMinor:x,shareVatMinor:0,shareGrossMinor:x,basis:'MANUAL'}));
    w.T.DebtDoc.push({id:'d1',docNo:'HD1',direction:'AP',docType:'INVOICE',partnerId:'p1',currency:cs.cur,businessGroupCode:'G1',docDate:'2026-09-15',postingDate:'2026-09-15',status:'POSTED',totalGrossMinor:tot,createdAt:'2026-09-10T03:00:00.000Z',createdBy:'creator',version:1});
    w.T.DebtLine.push({id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',netMinor:tot,grossMinor:tot,vatMinor:0,vatMode:'NONE',accrualId:'c1'});
    call(w,'docAdjust_',full,{docId:'d1',kind:cs.kind,reason:'dc',docDate:'2026-10-25',lines:[{targetLineId:'l1',amountMinor:cs.amt,description:'dc'}]});
    const adj=w.T.DebtDoc.find(d=>d.docType==='ADJ_'+cs.kind);adj.status='APPROVED';adj.createdBy='creator';eq(code(()=>call(w,'docPost_',full,{id:adj.id,postingDate:'2026-10-25'})),'OK');
    const want=tot+(cs.kind==='INC'?cs.amt:-cs.amt),rep=w.ctx.rep09_(full,'R09',{asOf:'2026-10-25'}),T=rep.rows.filter(r=>r.t==='total')[0].cells;
    eq(T.cost,want,'ca '+ci+': tổng chi phí R09 = công nợ sau điều chỉnh');
    eq(w.ctx.rep09_(full,'R09',{asOf:'2026-10-24'}).rows.filter(r=>r.t==='total')[0].cells.cost,tot,'ca '+ci+': trước ngày điều chỉnh giữ nguyên');
    const again=w.ctx.rep09_(full,'R09',{asOf:'2026-10-25'}).rows.filter(r=>r.t==='data').map(r=>r.cells.cost);eq(J(again),J(rep.rows.filter(r=>r.t==='data').map(r=>r.cells.cost)),'ca '+ci+': phân phối phần dư ổn định giữa các lần chạy');
  });
});
suite('J. Danh sách chi phí chờ phân bổ',()=>{
  const w=world('2026-10-25');OPENORD(w);
  const mk=(id,o)=>Object.assign({id,orderId:'o1',kind:'COST',partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:id,netMinor:100,vatMode:'NONE',vatMinor:0,grossMinor:100,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1},o||{});
  w.T.Order.push({id:'o2',orderNo:'DH-2',poNo:'P2',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:'[]',serviceCode:'',hsdvNo:'',version:1});
  w.T.Accrual.push(mk('ok'),mk('nocode',{orderId:'o2',serviceCode:''}),mk('general',{orderId:''}),mk('shared',{orderId:''}));
  w.T.AccrualSplit.push({id:'s1',accrualId:'shared',orderId:'o1',shareNetMinor:100,shareVatMinor:0,shareGrossMinor:100,basis:'MANUAL'});
  const all=w.ctx.accrualList_(full,{payload:{kind:'COST'}}),wt=w.ctx.accrualList_(full,{payload:{kind:'COST',waiting:true}});
  eq(all.total,4);eq(wt.waitingCount,2);eq(wt.items.map(x=>x.id).sort().join(),'general,nocode','chỉ chi phí chung và chi phí chưa gắn mã nằm trong danh sách chờ; khoản đã chia/đã gắn mã thì không');
});
suite('R36: một hóa đơn thật lập thành nhiều chứng từ (chọn các khoản của đơn làm nhiều lần) không bị báo nghi trùng; khác ngày hóa đơn vẫn báo',()=>{
  const w=world('2026-10-23'),mk=(id,k)=>({id,orderId:'o1',kind:k,partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:'x',netMinor:500,vatMode:'NONE',vatMinor:0,grossMinor:500,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1});
  ['a1','a2','a3','a4'].forEach(id=>w.T.Accrual.push(mk(id,'REVENUE')));
  const inv=(ids,no,dt)=>{call(w,'accrualInvoice_',full,{accrualIds:ids,invoiceNo:no,invoiceDate:dt,docDate:dt});return w.T.DebtDoc[w.T.DebtDoc.length-1]};
  const d1=inv(['a1'],'HD1','2026-10-10'),d2=inv(['a2'],'HD1','2026-10-10'),d3=inv(['a3'],'HD1','2026-10-10');
  eq(d1.warningsJson||'','');eq(d2.warningsJson||'','','khoản thứ hai cùng số HĐ, cùng ngày HĐ: không nghi trùng');eq(d3.warningsJson||'','');
  const d4=inv(['a4'],'HD1','2026-10-12');ok(/Cùng số hóa đơn/.test(d4.warningsJson||''),'khác ngày hóa đơn: vẫn nghi trùng');
  const dup=w.ctx.findDuplicateDocs_(Object.assign({},d1,{id:undefined,source:'MANUAL'}),w.T.DebtDoc,null);ok(dup.length>=1,'lập tay (không qua khoản phát sinh) vẫn báo trùng');
});
console.log('Kiểm thử bổ sung F–J xong; tổng',steps,'khẳng định');
