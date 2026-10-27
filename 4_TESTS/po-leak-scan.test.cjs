// Quét TOÀN BỘ API đọc: người hẹp quyền không được thấy mã/số PO/ID/HSDV của đơn ngoài phạm vi ở BẤT KỲ phản hồi nào (kể cả bảng tổng hợp, báo cáo, bàn làm việc, nhắc nợ, phê duyệt). Engine thật + Sheet giả.
const assert=require('assert'),path=require('path');
const makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
const FULL={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},LIM={id:'u2',email:'l@x.vn',displayName:'L',role:'APPROVER',scope:{partnerIds:['p3','p6','p9','p12'],businessGroups:['G1']}};
const {ctx}=makeEnv(SRCP);seed(ctx,300);ctx.todayVn_=()=>'2026-10-25';
// thêm khoản phát sinh ĐANG MỞ (chưa lập hóa đơn) để các màn Đơn hàng/PO, COST, chưa lập hóa đơn, R04/R09 có dữ liệu thật
{const B0=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o),ex=[];for(let i=0;i<60;i++){ex.push(B0({id:'xr'+i,orderId:'o'+i,kind:'REVENUE',partnerId:'p'+(i%60),accrualDate:'2026-10-05',feeTypeCode:'F',description:'doanh thu mở '+i,netMinor:500,vatMode:'NONE',vatMinor:0,grossMinor:500,currency:'VND',status:'OPEN',serviceCode:'FWD'}),B0({id:'xc'+i,orderId:'o'+i,kind:'COST',partnerId:'p'+((i*3)%60),poRef:'NCCX-'+i,accrualDate:'2026-10-05',feeTypeCode:'F',description:'chi phí mở '+i,netMinor:300,vatMode:'NONE',vatMinor:0,grossMinor:300,currency:'VND',status:'OPEN',serviceCode:'FWD'}))}ctx.repoAppend_('Accrual',ex)}
ctx.rmRefreshIfNeeded_(true);
const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
// HSDV/mã dịch vụ cho một số đơn để có thêm định danh nhạy cảm
const orders=ctx.repoValid_('Order'),pm=ctx.partnerMap_();
const hidden=orders.filter(o=>!ctx.orderInScope_(LIM,o,pm)),visible=orders.filter(o=>ctx.orderInScope_(LIM,o,pm));
const tokens=[];hidden.forEach(o=>{tokens.push(['hsdv '+o.hsdvNo,new RegExp('\\b'+o.hsdvNo+'\\b')],['orderNo '+o.orderNo,new RegExp('\\b'+o.orderNo.replace(/[-]/g,'\\-')+'\\b')],['poNo '+o.poNo,new RegExp('\\b'+o.poNo+'\\b')],['id '+o.id,new RegExp('"'+o.id+'"')],['poRef NCCX-'+o.id.slice(1),new RegExp('NCCX-'+o.id.slice(1)+'\\b')])});
const call=(u,a,p)=>{try{return JSON.stringify(ctx.dispatch_(u,a,{requestId:'r'+Math.random(),payload:p||{}}))}catch(e){return 'ERR:'+(e.code||e.message)}};
const leaks=(label,out)=>{const hit=[];for(const [n,re] of tokens){if(re.test(out)){hit.push(n);if(hit.length>2)break}}return hit.length?label+' → '+hit.join(', '):null};
suite('0. Điều kiện kiểm: có PO ngoài phạm vi và PO trong phạm vi để so sánh',()=>{ok(hidden.length>50&&visible.length>0,'ẩn '+hidden.length+' / thấy '+visible.length);const f=call(FULL,'order.list',{pageSize:500});ok(/DH-1\b/.test(f),'người đủ quyền thấy PO')});
const SKIP={'backup.run':1,'backup.switch':1,'backup.rollbackSwitch':1,'backup.restorePrepare':1,'backup.cancelRestore':1,'backup.verify':1,'sys.alertAck':1,'summary.refresh':1,'draft.discard':1,'draft.save':1};
const docsIn=ctx.dispatch_(LIM,'doc.list',{requestId:'x',payload:{pageSize:500,direction:'AR'}}).items.concat(ctx.dispatch_(LIM,'doc.list',{requestId:'x2',payload:{pageSize:500,direction:'AP'}}).items);
suite('0b. Đối chứng độ nhạy: cùng bộ quét tìm ra PO ở các API khi người xem ĐỦ quyền (nếu không, bộ quét vô nghĩa)',()=>{
  const all=[];orders.forEach(o=>all.push(new RegExp('\\b'+o.orderNo.replace(/-/g,'\\-')+'\\b')));
  const hit=a=>{const out=call(FULL,a,{pageSize:500});return all.some(re=>re.test(out))};
  ['order.list','doc.list','accrual.list','summary.orders','summary.costs'].forEach(a=>ok(hit(a),a+' phải chứa PO với người đủ quyền'));
});
suite('1. Quét mọi API đọc (không payload) và các biến thể thường dùng: không lộ PO ngoài phạm vi',()=>{
  const routes=ctx.routes_(),bad=[];
  Object.keys(routes).filter(k=>!routes[k].write&&!SKIP[k]).forEach(k=>{
    const variants=[{}];
    if(/^(doc|order|payment|accrual)\.list$/.test(k))variants.push({pageSize:500},{pageSize:500,direction:'AP'},{q:'DH-1'},{q:'PO1'});
    if(k==='report.run'||k==='report.export')return;
    variants.forEach(p=>{const l=leaks(k+' '+JSON.stringify(p),call(LIM,k,p));if(l)bad.push(l)})});
  assert.deepStrictEqual(bad,[],'LỘ PO: '+bad.slice(0,8).join(' | '));steps++;
});
suite('2. Chi tiết: doc.get từng chứng từ trong phạm vi, payment.get, order.get PO ẩn bị từ chối',()=>{
  const bad=[];docsIn.slice(0,150).forEach(d=>{const l=leaks('doc.get '+d.docNo,call(LIM,'doc.get',{id:d.id}));if(l)bad.push(l)});
  const pays=ctx.dispatch_(LIM,'payment.list',{requestId:'p',payload:{pageSize:100}}).items;pays.slice(0,60).forEach(p=>{const l=leaks('payment.get '+p.payNo,call(LIM,'payment.get',{id:p.id}));if(l)bad.push(l)});
  hidden.slice(0,40).forEach(o=>{const r=call(LIM,'order.get',{id:o.id});if(!/ERR:(OUT_OF_SCOPE|NOT_FOUND)/.test(r))bad.push('order.get '+o.id+' trả '+r.slice(0,40))});
  hidden.slice(0,10).forEach(o=>{const r=call(LIM,'order.archiveCheck',{id:o.id});if(!/ERR:/.test(r))bad.push('order.archiveCheck '+o.id)});
  assert.deepStrictEqual(bad,[],bad.slice(0,6).join(' | '));steps++;
});
suite('3. Mọi báo cáo R01–R14 (và xuất) với tham số mặc định: không lộ PO ngoài phạm vi',()=>{
  const bad=[];Object.keys(ctx.REPORTS_).forEach(code=>{[{},{partnerId:'p3'},{from:'2026-01-01',to:'2026-12-31'}].forEach(extra=>{const p=Object.assign({asOf:'2026-10-25'},extra);const l=leaks('report.run '+code+' '+JSON.stringify(extra),call(LIM,'report.run',{code,params:p}));if(l)bad.push(l)})});
  assert.deepStrictEqual(bad,[],'LỘ PO: '+bad.slice(0,8).join(' | '));steps++;
});
suite('4. Gợi ý nhập hàng loạt / tạo chứng từ / thu chi không gợi ý PO ngoài phạm vi',()=>{
  const bad=[];const sample=visible.slice(0,3);
  const lines=[{partner:'KH3',invoiceNo:'X1',feeType:'F',description:'a',netText:'1000',vat:'0',order:'DH-1'},{partner:'KH3',invoiceNo:'X2',feeType:'F',description:'b',netText:'1000',vat:'0',order:'PO1'}];
  [['doc.bulkSuggest',{kind:'INV_AR',lines}],['doc.bulkPreview',{kind:'INV_AR',lines}],['order.bulkPreview',{rows:[{poNo:'PO1'},{orderNo:'DH-1'}]}],['payment.suggest',{partnerId:'p3',currency:'VND',amountMinor:1000,direction:'IN'}]].forEach(([a,p])=>{const l=leaks(a,call(LIM,a,p));if(l)bad.push(l)});
  assert.deepStrictEqual(bad,[],bad.join(' | '));steps++;
});
suite('5. Đối chứng âm tính: vô hiệu hóa kiểm tra phạm vi PO thì bộ quét PHẢI phát hiện lộ (chứng minh bộ quét không vô nghĩa)',()=>{
  const e2=makeEnv(SRCP),c2=e2.ctx;seed(c2,300);c2.todayVn_=()=>'2026-10-25';c2.rmRefreshIfNeeded_(true);c2.orderInScope_=function(){return true};
  const found={};['doc.list','order.list','accrual.list','summary.orders','summary.costs'].forEach(a=>{let out;try{out=JSON.stringify(c2.dispatch_(LIM,a,{requestId:'n'+a,payload:{pageSize:500,direction:'AP'}}))}catch(e){out=''}if(tokens.some(([n,re])=>re.test(out)))found[a]=1});
  ok(Object.keys(found).length>=3,'phát hiện lộ ở: '+Object.keys(found).join(','));
});
suite('6. Thông báo lỗi khi nhập hàng loạt: số đơn/PO ngoài phạm vi trả cùng thông điệp như số không tồn tại (không dò được sự tồn tại/trạng thái/số lượng)',()=>{
  const hiddenO=hidden.find(o=>/^PO\d+$/.test(o.poNo)),fake='DH-987654',fakePo='PO987654';
  const msg=(dir,ref,partner)=>{const r=ctx.dispatch_(LIM,'doc.bulkPreview',{requestId:'q'+Math.random(),payload:{direction:dir,rows:[{partner,invoiceNo:'ZZ'+Math.random(),invoiceDate:'05/10/2026',due:'05/11/2026',group:'G1',currency:'VND',order:ref,serviceCode:'FWD',feeType:'F',description:'x',netText:'1000',vat:'0'}]}});return JSON.stringify(r.rows[0].issues.map(i=>[i.field,i.code,String(i.message).split(ref).join('#')]))};
  for(const dir of ['AR','AP']){const partner=dir==='AR'?'KH3':'KH3';
    ok(msg(dir,hiddenO.orderNo,partner)===msg(dir,fake,partner),dir+' theo số đơn: '+msg(dir,hiddenO.orderNo,partner)+' ≠ '+msg(dir,fake,partner));
    ok(msg(dir,hiddenO.poNo,partner)===msg(dir,fakePo,partner),dir+' theo số PO: '+msg(dir,hiddenO.poNo,partner)+' ≠ '+msg(dir,fakePo,partner));}
});
suite('7. Chia chi phí cho đơn ngoài phạm vi: cùng thông điệp như đơn không tồn tại',()=>{
  const o=hidden[0],run=id=>{try{ctx.accrualSave_(LIM,{requestId:'s'+Math.random(),payload:{kind:'COST',partnerId:'p3',currency:'VND',accrualDate:'2026-10-05',feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',allocMode:'SHARED',splits:[{orderId:id,shareNetMinor:500},{orderId:'o_khac_khong_co',shareNetMinor:500}]}});return 'OK'}catch(e){return JSON.stringify([e.code,(e.fields||[]).map(f=>[f.path,f.code,f.message])]).split(id).join('#')}};
  const a=run(o.id),b=run('o_khong_ton_tai');ok(!/DH-|PO\d/.test(a)&&!new RegExp(o.orderNo).test(a),'không lộ số đơn: '+a.slice(0,200));ok(a===b,a.slice(0,160)+' ≠ '+b.slice(0,160));
});
ctx.repoAppend_('Catalog',[{id:'scFWD',catalogType:'SERVICE_CODE',code:'FWD',name:'FWD',attrsJson:'{}',active:1,sortOrder:1,version:1,isDeleted:0,commitState:'C'}]);
suite('8. Truy cập theo ID: ID đơn/khoản phát sinh ngoài phạm vi trả NOT_FOUND GIỐNG HỆT ID không tồn tại (cả đọc lẫn ghi)',()=>{
  const ho=hidden.find(o=>o.status==='OPEN'),hacc=ctx.repoValid_('Accrual').find(a=>a.orderId===ho.id&&a.kind==='COST'),fo='o_khong_co',fa='acc_khong_co';
  const run=(fn,mk)=>{const f=(id,aid)=>{try{var r=ctx[fn](LIM,{requestId:'i'+Math.random(),payload:mk(id,aid)});return 'OK:'+JSON.stringify(r)}catch(e){return JSON.stringify([e.code,e.userMessage||e.message])}};return [f(ho.id,hacc.id),f(fo,fa)]};
  const cases=[['orderGet_',id=>({id})],['orderArchiveCheck_',id=>({id})],['orderSave_',id=>({id,customerPartnerId:'p3',poNo:'x',orderDate:'2026-10-02',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD']})],
    ['orderSetStatus_',id=>({id,status:'CLOSED'})],['orderArchive_',id=>({id,note:'x'})],['orderUnarchive_',id=>({id,note:'x'})],['orderAssignService_',id=>({orderIds:[id],serviceCode:'FWD'})],
    ['accrualCancel_',(id,aid)=>({id:aid})],['accrualSave_',(id,aid)=>({id:aid,kind:'COST',partnerId:'p3',currency:'VND',accrualDate:'2026-10-10',feeTypeCode:'F',description:'x',netMinor:5,vatMode:'NONE'})],['accrualInvoice_',(id,aid)=>({accrualIds:[aid]})]];
  const bad=[];cases.forEach(([fn,mk])=>{if(!ctx[fn]){bad.push(fn+' không có');return}const [h,f]=run(fn,mk);const norm=s=>s.split(ho.id).join('#').split(hacc.id).join('#').split(fo).join('#').split(fa).join('#');if(norm(h)!==norm(f)||!/NOT_FOUND|Không tìm thấy/.test(h))bad.push(fn+': ẩn='+h.slice(0,110)+' | không có='+f.slice(0,110))});
  assert.deepStrictEqual(bad,[],bad.join('\n'));steps++;
});
suite('9. Truy cập theo ID của chứng từ/phiếu/đối tác/phân bổ/theo dõi: ID ngoài phạm vi = ID không tồn tại (đọc, ghi, chuyển trạng thái, tham số trong payload)',()=>{
  const B1=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
  ctx.repoAppend_('Allocation',[B1({id:'alHID',paymentId:'y1',debtLineId:'l1_0',docId:'d1',partnerId:'p1',currency:'VND',amountMinor:100,effectiveDate:'2026-10-01',status:'ACTIVE'})]);
  ctx.repoAppend_('Followup',[B1({id:'fuHID',partnerId:'p1',docId:'',direction:'AR',kind:'NOTE',followDate:'2026-10-01',status:'OPEN',note:'x'})]);
  const H={doc:'d1',pay:'y1',par:'p1',alc:'alHID',fu:'fuHID'},F={doc:'d_khong_co',pay:'y_khong_co',par:'p_khong_co',alc:'alc_khong_co',fu:'fu_khong_co'};
  const exec=(fn,mk,ids)=>{try{const r=ctx[fn](LIM,{requestId:'z'+Math.random(),payload:mk(ids)});return 'OK:'+JSON.stringify(r).slice(0,300)}catch(e){return JSON.stringify([e.code,e.userMessage||e.message,(e.fields||[]).map(f=>[f.path,f.code,f.message])])}};
  const norm=s=>{Object.values(H).concat(Object.values(F)).forEach(v=>{s=s.split(v).join('#')});return s};
  const cases=[['docGet_',i=>({id:i.doc})],['docSave_',i=>({id:i.doc,partnerId:'p3',direction:'AR',currency:'VND',lines:[]})],['docSubmit_',i=>({id:i.doc})],['docApprove_',i=>({id:i.doc})],['docReject_',i=>({id:i.doc,reason:'x'})],['docDelete_',i=>({id:i.doc})],['docPost_',i=>({id:i.doc})],
    ['docReverse_',i=>({docId:i.doc,reason:'x'})],['docAdjust_',i=>({docId:i.doc,kind:'INC',reason:'x',docDate:'2026-10-10',lines:[]})],
    ['paymentGet_',i=>({id:i.pay})],['paymentSave_',i=>({id:i.pay,direction:'IN',partnerId:'p3',currency:'VND',amountMinor:5,effectiveDate:'2026-10-06',cashAccountCode:'Q1'})],['paySubmit_',i=>({id:i.pay})],['payApprove_',i=>({id:i.pay})],['payReject_',i=>({id:i.pay,reason:'x'})],['payDelete_',i=>({id:i.pay})],['payPost_',i=>({id:i.pay})],['payReverse_',i=>({id:i.pay,reason:'x'})],
    ['paymentAllocate_',i=>({paymentId:i.pay,items:[{debtLineId:'l3_0',amountMinor:1}]})],['paymentReverseAllocation_',i=>({allocationId:i.alc})],['paymentSuggest_',i=>({paymentId:i.pay})],
    ['partnerGet_',i=>({id:i.par})],['partnerSave_',i=>({id:i.par,shortName:'x',legalName:'x'})],['followupClose_',i=>({id:i.fu})],['reminderPreview_',i=>({partnerId:i.par})],['reminderSend_',i=>({partnerId:i.par})]];
  const bad=[];cases.forEach(([fn,mk])=>{if(!ctx[fn]){bad.push(fn+': không có hàm');return}const h=norm(exec(fn,mk,H)),f=norm(exec(fn,mk,F));if(h!==f)bad.push(fn+': ẩn='+h.slice(0,120)+' | không có='+f.slice(0,120))});
  // tham số đối tác/dòng nằm trong payload (tạo mới, phân bổ, báo cáo)
  const viaPayload=[['docSave_',i=>({partnerId:i.par,direction:'AR',docType:'INVOICE',currency:'VND',businessGroupCode:'G1',docDate:'2026-10-05',lines:[{feeTypeCode:'F',description:'x',netMinor:1,vatMode:'NONE'}]})],['paymentSave_',i=>({direction:'IN',partnerId:i.par,currency:'VND',amountMinor:5,effectiveDate:'2026-10-06',cashAccountCode:'Q1'})],
    ['accrualSave_',i=>({kind:'COST',allocMode:'GENERAL',partnerId:i.par,currency:'VND',accrualDate:'2026-10-10',feeTypeCode:'F',description:'x',netMinor:5,vatMode:'NONE'})],['followupSave_',i=>({partnerId:i.par,direction:'AR',kind:'NOTE',note:'x'})],['docBulkSuggest_',i=>({direction:'AR',partnerId:i.par,currency:'VND',lines:[{netText:'1000',vat:'0'}]})]];
  viaPayload.forEach(([fn,mk])=>{const h=norm(exec(fn,mk,H)),f=norm(exec(fn,mk,F));if(h!==f)bad.push('payload '+fn+': ẩn='+h.slice(0,120)+' | không có='+f.slice(0,120))});
  ['R05','R06'].forEach(code=>{const run=pid=>{try{ctx.reportRun_(LIM,{payload:{code,params:{asOf:'2026-10-25',partnerId:pid,statementPeriod:'2026-10',from:'2026-10-01',to:'2026-10-31'}}});return 'OK'}catch(e){return JSON.stringify([e.code,e.userMessage])}};const h=run(H.par),f=run(F.par);if(h!==f)bad.push(code+': '+h+' ≠ '+f)});
  // người ngoài phạm vi: ID hiện hữu mà ĐƯỢC phép vẫn dùng bình thường (đối chứng dương)
  ok(!/NOT_FOUND/.test(exec('partnerGet_',i=>({id:'p3'}),H)),'đối tác trong phạm vi vẫn xem được');ok(!/NOT_FOUND/.test(exec('docGet_',i=>({id:'d3'}),H)),'chứng từ trong phạm vi vẫn xem được');
  assert.deepStrictEqual(bad,[],bad.join('\n'));steps++;
});
console.log('Tổng kiểm tra:',steps);
