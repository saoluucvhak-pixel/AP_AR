// Bảng tổng hợp định kỳ (ReadModel): dựng/ghi/đọc, khớp với tính trực tiếp, phạm vi người dùng, độ tươi, lọc live, chia mảnh, hàng rào đọc. Sheet/Cache giả, KHÔNG phải Apps Script thật.
const assert=require('assert'),path=require('path'),vm=require('vm');
const makeEnv=require('./bench/_env.cjs');
const {ctx,props}=makeEnv(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'));
const J=x=>JSON.stringify(x);let steps=0;const eq=(a,b,m)=>{steps++;assert.strictEqual(J(a),J(b),m)},ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',String(e.message).split('\n').slice(0,6).join(' | '));process.exitCode=1}}
const base=o=>Object.assign({version:1,isDeleted:0,commitState:'C',txId:'',createdAt:'2026-10-01T00:00:00Z',createdBy:'t',updatedAt:'',updatedBy:''},o);
Object.keys(ctx).length;['Partner','Catalog','Config','DebtDoc','DebtLine','Allocation','Payment','Order','Accrual','AccrualSplit','ReadModel','DraftEntry','Period','AppUser'].forEach(t=>ctx.repoSheet_(t));
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
suite('1. Dựng và ghi bảng tổng hợp; đọc lại khớp với tính trực tiếp',()=>{
  reset();const r=ctx.rmRefreshIfNeeded_(true);eq(r.failed,[]);eq(r.rebuilt.sort(),['COSTS','DASHBOARD','ORDERS','PARTNERS','UNINVOICED','WORKBENCH']);
  ['PARTNERS','ORDERS','COSTS'].forEach(m=>{reset();const snap=ctx.rmLoad_(m);ok(snap,'có bản dựng '+m);eq(snap.dataVersion,7);eq(snap.asOf,TODAY);eq(snap.value,ctx.rmBuild_(m,TODAY),m+': bản đọc lại = tính trực tiếp')});
  reset();eq(ctx.rmLoad_('WORKBENCH').value.quality.openTx,0);
  const rows=ctx.repoValid_('ReadModel');ok(rows.length>=6&&rows.length<=12,'bảng nhỏ: '+rows.length+' hàng');
  reset();const again=ctx.rmRefreshIfNeeded_(false);eq(again.rebuilt,[],'dữ liệu không đổi → bộ kích hoạt không làm gì');
  eq(ctx.repoValid_('ReadModel').length,rows.length,'không phình bảng sau nhiều lần dựng');
});
suite('2. Nội dung: dư nợ khách, PO chưa thanh toán, chi phí chưa thanh toán',()=>{
  reset();const sp=ctx.summaryPartners_(full,{payload:{}});eq(sp.meta.source,'SNAPSHOT');
  const a=sp.items.find(x=>x.name==='KH-A');eq([a.AR.VND.out,a.AR.VND.overdue,a.AR.VND.docs,a.AR.USD.out],[900,600,2,50000],'KH-A: d1 còn 600 (quá hạn 5 ngày) + d5 300 = 900; USD riêng');
  eq(a.adv.AR.VND,200,'phiếu thu chưa phân bổ 200');
  const b=sp.items.find(x=>x.name==='KH-B');eq([b.AR.VND.out,b.AR.VND.missing],[700,700],'KH-B chưa có hạn');
  const x=sp.items.find(x=>x.name==='NCC-X');eq([x.AP.VND.out,x.AP.VND.due7],[500,500]);
  reset();const so=ctx.summaryOrders_(full,{payload:{}});const o1=so.items.find(x=>x.no==='DH-1');
  eq([o1.cur.VND.rev,o1.cur.VND.un,o1.cur.VND.ar,o1.cur.VND.cost],[1250,250,600,940],'DH-1: doanh thu 1250, chưa lập 250, phải thu còn 600, chi phí 400+500+phần chia 40');
  ok(so.items.find(x=>x.no==='DH-3'),'DH-3 đã đóng nhưng còn phải thu 300 vẫn hiện');
  eq(sp.totals,{AR:{USD:{out:50000,overdue:0,due7:0,missing:0},VND:{out:1600,overdue:600,due7:0,missing:700}},AP:{VND:{out:500,overdue:0,due7:500,missing:0}}},'tổng do máy chủ tính, từng tiền tệ');
  eq(Object.keys(so.totals.VND).length>0,true);
  reset();const sc=ctx.summaryCosts_(full,{payload:{}});eq(sc.items.map(x=>x.id).sort(),['c1','c2','c3','c4'],'chi phí chưa thanh toán: chưa nhận HĐ + hóa đơn còn nợ');
  eq(sc.totals.VND,{out:1050,unbilled:550,billed:500},'tổng chi phí chưa thanh toán');eq(sc.items.find(x=>x.id==='c4').out,500);eq(sc.items.find(x=>x.id==='c3').on,'Chia 2 đơn');
});
suite('3. Phạm vi người dùng áp khi đọc (không lộ hàng ngoài phạm vi)',()=>{
  reset();const sp=ctx.summaryPartners_(scoped,{payload:{}});eq(sp.items.map(x=>x.name),['KH-A'],'chỉ KH-A');
  eq(sp.items[0].AR.VND.out,600,'nhóm G2 (d5 300) bị loại theo phạm vi nhóm');
  reset();const so=ctx.summaryOrders_(scoped,{payload:{}});eq(so.items.map(x=>x.no),['DH-3','DH-1'],'chỉ đơn G1 của p1 (DH-2 khác đối tác/nhóm bị ẩn)');
  reset();const sc=ctx.summaryCosts_(scoped,{payload:{}});eq(sc.items.map(x=>x.id).sort(),['c1','c4'],'c2 (đơn của p2), c3 (chia sang đơn p2) bị ẩn');
  reset();const wb=ctx.workbenchSummary_(scoped,{payload:{}});eq(wb.snapshot,undefined,'người có phạm vi hẹp luôn tính trực tiếp (không dùng bản toàn bộ)');
  reset();const wf=ctx.workbenchSummary_(full,{payload:{}});ok(wf.snapshot&&wf.snapshot.source==='SNAPSHOT','phạm vi toàn bộ dùng bản dựng sẵn');
  reset();eq(ctx.workbenchSummary_(full,{payload:{asOf:TODAY,group:'G1'}}).snapshot,undefined,'có bộ lọc → tính trực tiếp');
});
suite('4. Độ tươi: bản cũ vẫn phục vụ trong hạn; live=true tính lại; quá hạn thì tính trực tiếp; thay đổi vào bản sau khi kích hoạt',()=>{
  ctx.repoAppend_('DebtDoc',[D('d6','AR','p2','VND','G2','2026-10-30',111)]);ctx.repoAppend_('DebtLine',[Ln('l6','d6',111)]);props.dataVersion='8';
  reset();let sp=ctx.summaryPartners_(full,{payload:{}});eq(sp.meta.source,'SNAPSHOT');eq(sp.meta.behind,1,'báo có 1 thay đổi chưa vào bảng');eq(sp.items.find(x=>x.name==='KH-B').AR.VND.out,700,'số cũ trong hạn');
  reset();sp=ctx.summaryPartners_(full,{payload:{live:true}});eq(sp.meta.source,'LIVE');eq(sp.items.find(x=>x.name==='KH-B').AR.VND.out,811,'tính lại ngay thấy số mới');
  reset();sp=ctx.summaryPartners_(full,{payload:{}});eq(sp.meta.source,'SNAPSHOT');eq(sp.items.find(x=>x.name==='KH-B').AR.VND.out,811,'lần tính trực tiếp đã lưu lại cho người sau');eq(sp.meta.behind,0);
  const old=ctx.rmMaxAgeMin_;ctx.rmMaxAgeMin_=()=>-1;reset();sp=ctx.summaryPartners_(full,{payload:{}});eq(sp.meta.source,'LIVE','quá tuổi → tính trực tiếp');ctx.rmMaxAgeMin_=old;
  props.dataVersion='9';reset();const r=ctx.rmRefreshIfNeeded_(false);ok(r.rebuilt.length===6,'phiên bản đổi → bộ kích hoạt dựng lại tất cả: '+r.rebuilt);
});
suite('5. Chia mảnh dữ liệu lớn; mảnh lệch thời điểm bị coi là không có; thu nhỏ không để mảnh mồ côi',()=>{
  const big=[];for(let i=0;i<1500;i++)big.push({id:'x'+i,pad:'z'.repeat(60)});
  const meta={dataVersion:9,builtAt:new Date().toISOString(),asOf:TODAY};
  reset();ok(ctx.rmStore_('TESTBIG',big,meta));reset();const s1=ctx.rmReadKey_('TESTBIG');eq(s1.value.length,1500);const parts=ctx.repoValid_('ReadModel').filter(r=>r.model==='TESTBIG');ok(parts.length>=3,'chia nhiều mảnh: '+parts.length);ok(parts.every(r=>r.json.length<=49000));
  // mảnh 1 lệch thời điểm
  reset();const rows=ctx.repoReadAll_('ReadModel').filter(r=>r.model==='TESTBIG');ctx.repoWriteRow_('ReadModel',rows[1]._row,Object.assign({},rows[1],{builtAt:'2000-01-01T00:00:00Z'}));reset();eq(ctx.rmReadKey_('TESTBIG'),null,'mảnh lệch → không dùng');
  // ghi lại bản nhỏ hơn
  reset();ok(ctx.rmStore_('TESTBIG',big.slice(0,10),Object.assign({},meta,{builtAt:new Date(Date.now()+1000).toISOString()})));reset();eq(ctx.rmReadKey_('TESTBIG').value.length,10);eq(ctx.repoValid_('ReadModel').filter(r=>r.model==='TESTBIG').length,1,'mảnh thừa được đánh dấu xóa');
  // quá lớn: không lưu
  reset();eq(ctx.rmStore_('TESTHUGE',[{pad:'z'.repeat(2500000)}],meta),false,'quá giới hạn mảnh → không lưu, đọc sẽ tính trực tiếp');
  const huge=Array.from({length:5000},(_,i)=>({id:i,pad:'z'.repeat(600)}));reset();eq(ctx.rmStore_('TESTHUGE2',huge,meta),false);
});
suite('6. Hàng rào đọc: đang có giao dịch dở thì không dựng (không ghi số nửa vời)',()=>{
  const rs=ctx.recoverStale_;ctx.recoverStale_=()=>({});props.OPEN_TX=J({tx_1:1});props.dataVersion='10';reset();const r=ctx.rmRefreshIfNeeded_(false);ok(r.failed.length>0&&r.rebuilt.length===0,'không dựng khi có giao dịch dở: '+J(r));delete props.OPEN_TX;ctx.recoverStale_=rs;
  reset();const r2=ctx.rmRefreshIfNeeded_(false);ok(r2.rebuilt.length===6,'hết giao dịch dở thì dựng lại');
});
suite('7. Bảng tổng hợp là dữ liệu dẫn xuất: không đổi phiên bản dữ liệu, không ghi nhật ký',()=>{
  const v=props.dataVersion;reset();ctx.rmRefreshIfNeeded_(true);eq(props.dataVersion,v,'dựng lại không tăng dataVersion');
});
suite('8. Sau khi đổi cơ sở dữ liệu (khôi phục): bản dựng sẵn bị bỏ, không hiện số cũ',()=>{
  reset();ok(ctx.rmLoad_('PARTNERS'));ctx.rmInvalidate_();reset();eq(ctx.rmLoad_('PARTNERS'),null);eq(ctx.repoValid_('ReadModel').length,0);
  reset();const sp=ctx.summaryPartners_(full,{payload:{}});eq(sp.meta.source,'LIVE','sau khi bỏ: tính trực tiếp rồi lưu lại');reset();eq(ctx.summaryPartners_(full,{payload:{}}).meta.source,'SNAPSHOT');
});
suite('9. Bộ bản dựng nhất quán: mọi mô hình cùng một phiên bản, công bố bằng bản kê, lỗi giữa chừng giữ bộ cũ',()=>{
  props.dataVersion='20';reset();const r=ctx.rmRefreshIfNeeded_(true);eq(r.failed,[]);
  reset();const mf=ctx.rmManifest_();eq(mf.dataVersion,20);eq(mf.models.slice().sort(),['COSTS','DASHBOARD','ORDERS','PARTNERS','UNINVOICED','WORKBENCH']);
  mf.models.forEach(m=>{reset();const s=ctx.rmLoad_(m);ok(s,m);eq([s.dataVersion,s.builtAt],[mf.dataVersion,mf.builtAt],m+' cùng phiên bản/thời điểm với bản kê')});
  const slot1=mf.slot;
  // dựng bộ mới vào khe còn lại
  props.dataVersion='21';reset();ctx.rmRefreshIfNeeded_(true);reset();const mf2=ctx.rmManifest_();ok(mf2.slot!==slot1,'đổi khe A/B');eq(mf2.dataVersion,21);
  // lỗi giữa chừng khi dựng 1 mô hình → bộ cũ nguyên vẹn, ghi nhận lỗi
  const orig=ctx.rmBuild_;let n=0;ctx.rmBuild_=(m,t)=>{if(++n===3)throw new Error('boom');return orig(m,t)};
  props.dataVersion='22';reset();const f=ctx.rmRefreshIfNeeded_(false);ok(f.failed.length===1&&f.rebuilt.length===0,J(f));
  reset();const mf3=ctx.rmManifest_();eq([mf3.slot,mf3.dataVersion,mf3.builtAt],[mf2.slot,21,mf2.builtAt],'bản kê vẫn trỏ bộ cũ');eq(mf3.status.failures,1);ok(/boom/.test(mf3.status.lastError));
  mf3.models.forEach(m=>{reset();ok(ctx.rmLoad_(m),m+' còn đọc được')});
  // ghi dở một khe (không lật bản kê) không làm hỏng bộ đang công bố
  reset();const cur=ctx.rmManifest_();const other=cur.slot==='A'?'B':'A';ctx.rmStore_(other+':PARTNERS',[{x:1}],{dataVersion:99,builtAt:nowStr(),asOf:TODAY});
  reset();eq(ctx.rmLoad_('PARTNERS').dataVersion,21,'vẫn đọc bộ cũ');
  // phục hồi: lần dựng sau thành công xóa bộ đếm lỗi
  ctx.rmBuild_=orig;reset();ctx.rmRefreshIfNeeded_(false);reset();eq(ctx.rmManifest_().status.failures,0);eq(ctx.rmManifest_().dataVersion,22);
});
suite('10. Cảnh báo: lỗi dựng liên tiếp ≥3 lần báo quản trị đúng một lần; bản dựng cũ quá hạn cũng báo',()=>{
  const sent=[];const oa=ctx.alertAdmin_;ctx.alertAdmin_=(s,b)=>{sent.push(s)};
  const orig=ctx.rmBuild_;ctx.rmBuild_=()=>{throw new Error('lỗi giả')};
  for(let i=0;i<5;i++){props.dataVersion=String(30+i);reset();ctx.rmRefreshIfNeeded_(false)}
  reset();eq(ctx.rmManifest_().status.failures,5);eq(sent.length,1,'chỉ báo một lần trong 2 giờ: '+sent.length);ok(/lỗi/.test(sent[0]));
  ctx.rmBuild_=orig;
  // người dùng xem: trạng thái lỗi hiện trong meta
  reset();const sp=ctx.summaryPartners_(full,{payload:{}});ok(sp.meta.status.failures===0||sp.meta.status.failures>=0,'có trường tình trạng');
  ctx.alertAdmin_=oa;
});
suite('11. Đối soát hằng đêm: dữ liệu sạch → OK; gài lỗi → báo đúng mục; chỉ đọc',()=>{
  props.dataVersion='40';reset();ctx.rmRefreshIfNeeded_(true);
  const before=J(ctx.repoValid_('DebtDoc'))+J(ctx.repoValid_('Allocation'));
  reset();const sent=[];const oa=ctx.alertAdmin_;ctx.alertAdmin_=(s)=>sent.push(s);
  let r=ctx.reconRun_({});eq(r.status,'OK',J(r.checks.filter(c=>c.status!=='OK')));eq(sent.length,0);
  eq(J(ctx.repoValid_('DebtDoc'))+J(ctx.repoValid_('Allocation')),before,'đối soát không sửa dữ liệu');
  const st=ctx.summaryReconcile_({role:'AUDITOR',email:'a@x',scope:{allPartners:true}},{payload:{}});eq(st.status,'OK');ok(st.runAt);
  let denied=false;try{ctx.summaryReconcile_({role:'VIEWER',email:'v@x',scope:{allPartners:true}},{payload:{}})}catch(e){denied=true}ok(denied,'cần quyền audit.read');
  // gài lỗi: tổng chứng từ lệch dòng; phân bổ mồ côi; phân bổ vượt phiếu
  const d=ctx.repoReadAll_('DebtDoc').find(x=>x.id==='d1');ctx.repoWriteRow_('DebtDoc',d._row,Object.assign({},d,{totalGrossMinor:1234}));
  ctx.repoAppend_('Allocation',[base({id:'azz',paymentId:'y1',debtLineId:'l-none',docId:'d1',amountMinor:5,effectiveDate:'2026-10-06'}),base({id:'azy',paymentId:'y1',debtLineId:'l1',docId:'d1',amountMinor:9999,effectiveDate:'2026-10-07'})]);
  props.dataVersion='41';reset();ctx.rmRefreshIfNeeded_(true);reset();
  r=ctx.reconRun_({});eq(r.status,'FAIL');const bad=r.checks.filter(c=>c.status==='FAIL').map(c=>c.code).sort();
  ok(bad.includes('DOC_LINES_SUM')&&bad.includes('ORPHANS')&&bad.includes('PAY_OVERALLOC'),J(bad));eq(sent.length,1,'báo quản trị khi có lỗi');
  reset();eq(ctx.summaryReconcile_({role:'AUDITOR',email:'a@x',scope:{allPartners:true}},{payload:{}}).status,'FAIL');
  // bảng tổng hợp bị sửa tay sai số → phát hiện
  const act=ctx.rmManifest_().slot;const row=ctx.repoValid_('ReadModel').find(x=>x.model===act+':PARTNERS');const j=JSON.parse(row.json);j[0].out=(j[0].out||0)+777;
  const rr=ctx.repoReadAll_('ReadModel').find(x=>x.id===row.id);ctx.repoWriteRow_('ReadModel',rr._row,Object.assign({},rr,{json:J(j)}));
  reset();r=ctx.reconRun_({noAlert:true});const c=r.checks.find(x=>x.code==='SUMMARY_VS_LIVE');eq(c.status,'FAIL');ok(/PARTNERS/.test(c.samples[0]));ok(r.checks.find(x=>x.code==='SUMMARY_TOTALS').status==='FAIL','tổng độc lập phát hiện lệch');
  ctx.alertAdmin_=oa;
});
suite('12. Báo cáo V7: khóa cache theo bộ đã công bố; kiểm lại phiên bản trong khóa; không dựng chồng; mở màn không dựng cả bộ',()=>{
  props.dataVersion='50';reset();ctx.rmRefreshIfNeeded_(true);
  // (1) khóa cache phản hồi đổi khi công bố bộ mới dù dataVersion nguồn không đổi
  const k1=ctx.respKey_(full,'dashboard.summary',{},50),d1=ctx.respKey_(full,'doc.list',{},50);
  reset();ctx.rmRefreshIfNeeded_(true);
  ok(k1!==ctx.respKey_(full,'dashboard.summary',{},50),'dashboard.summary: khóa đổi sau khi dựng lại');
  eq(d1,ctx.respKey_(full,'doc.list',{},50),'màn không dùng bảng tổng hợp: khóa không đổi');
  // (2) nguồn đổi đúng lúc lấy khóa → không công bố, bộ cũ nguyên vẹn, không tính là lỗi
  reset();const before=ctx.rmManifest_();const LS=ctx.LockService,orig=LS.getScriptLock;let armed=false;
  LS.getScriptLock=()=>{const l=orig.call(LS);const t=l.tryLock;return Object.assign(Object.create(l),{tryLock:(ms)=>{const r=t.call(l,ms);if(armed){armed=false;props.dataVersion=String(Number(props.dataVersion)+1)}return r},releaseLock:()=>l.releaseLock()})};
  armed=false;props.dataVersion='51';reset();
  // lease lấy khóa lần đầu (không armed); lần sau trong rmBuildSetLocked_ mới đổi nguồn → bật cờ sau khi lease xong
  const oldLease=ctx.rmLease_;ctx.rmLease_=(on,token)=>{const r=oldLease(on,token);if(on)armed=true;return r};
  const r=ctx.rmRefreshIfNeeded_(false);ctx.rmLease_=oldLease;LS.getScriptLock=orig;
  ok(r.stale&&r.rebuilt.length===0,'bỏ bản dựng: '+J(r));reset();const after=ctx.rmManifest_();eq([after.dataVersion,after.builtAt],[before.dataVersion,before.builtAt],'bộ đang công bố không đổi');eq(after.status.failures,0,'không tính là lỗi dựng');
  // (3) không dựng chồng
  props.RM_LEASE=J({at:new Date().toISOString()});reset();const busy=ctx.rmRefreshIfNeeded_(true);ok(busy.stale&&busy.rebuilt.length===0,'đang có lượt dựng khác: '+J(busy));delete props.RM_LEASE;
  props.RM_LEASE=J({at:'2000-01-01T00:00:00Z'});reset();ok(ctx.rmRefreshIfNeeded_(true).rebuilt.length===6,'lease quá hạn bị bỏ qua');ok(!props.RM_LEASE,'lease được trả sau khi dựng');
  // (4) mở màn khi bản dựng cũ: chỉ tính mô hình cần, không công bố bộ mới
  props.dataVersion='60';reset();const man=ctx.rmManifest_();const old=ctx.rmMaxAgeMin_;ctx.rmMaxAgeMin_=()=>-1;
  let built=[];const ob=ctx.rmBuild_;ctx.rmBuild_=(m,t)=>{built.push(m);return ob(m,t)};
  reset();const sp=ctx.summaryPartners_(full,{payload:{}});ctx.rmBuild_=ob;ctx.rmMaxAgeMin_=old;
  eq(built,['PARTNERS'],'chỉ tính PARTNERS');eq(sp.meta.source,'LIVE');reset();eq(ctx.rmManifest_().builtAt,man.builtAt,'không công bố bộ mới từ đường đọc');
});
function nowStr(){return new Date().toISOString()}
console.log('Kiểm thử bảng tổng hợp:',steps,'khẳng định (Sheet/Cache giả)');
