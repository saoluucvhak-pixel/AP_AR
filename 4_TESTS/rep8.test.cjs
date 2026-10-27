const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
let mails=[],mailFail=false;
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'x'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})},
 MailApp:{getRemainingDailyQuota:()=>100,sendEmail:(m)=>{if(mailFail)throw new Error('quota');mails.push(m)}}});
vm.runInContext(fs.readFileSync(SRC,'utf8'),ctx);
// ---------- Đối chiếu Excel
const T0={Catalog:[],ServiceFile:[],Config:[]};
ctx.repoValid_=t=>(T0[t]||[]).slice();
const cell=(n,o)=>{const a=new Array(12).fill('');Object.keys(o).forEach(k=>a[k]=o[k]);return a};
const hdr=[[],[]];
const sheets={fwd:hdr.concat([cell(0,{1:'ABC',2:'gml 001',4:1000,5:0,7:'x'})]),cbt:hdr.concat([cell(0,{1:'XYZ',2:'GML/2',4:12.34,5:0})]),
 ncc:hdr.concat([cell(0,{1:'ABC Logistics',4:'inv-01',6:'VND',7:500,8:0})]),
 bmt:hdr.concat([cell(0,{0:1,1:'GML/7',3:50,4:'X9',8:'trạng thái không biết',9:'B'}),cell(0,{0:2,1:'GML/8',3:20,4:'X10',8:'Chưa thanh toán',9:'B'})])};
const parsed=ctx.reconParseWorkbook(sheets);
assert.strictEqual(parsed.ar.find(r=>r.group==='CBT').debit,1234,'USD 12.34 => 1234 đơn vị nhỏ nhất');
assert.ok(Object.keys(parsed.skipped).some(k=>/trạng thái lạ/.test(k)),'BMT trạng thái lạ được đếm: '+JSON.stringify(parsed.skipped));
const sys={arLines:[{currency:'VND',group:'FWD',hsdv:'GML001',out:1000},{currency:'VND',group:'OTHER',hsdv:'GML/9',out:700},{currency:'EUR',group:'FWD',hsdv:'GML/E',out:5}],
 apDocs:[{partnerId:'p1',invoiceNo:'INV-01',currency:'VND',out:500,docId:'x'},{partnerId:'p1',invoiceNo:'INV-02',currency:'VND',out:300,docId:'y'}],partners:[{id:'p1',shortName:'ABC',legalName:'ABC Logistics JSC'}]};
const res=ctx.reconCompare(parsed,sys);
const fwd=res.sections.find(s=>s.id==='AR-FWD');
assert.strictEqual(fwd.diff,0,'HSDV "gml 001" khớp "GML001": '+JSON.stringify(fwd));
assert.ok(res.notes.some(n=>/OTHER · VND/.test(n))&&res.notes.some(n=>/FWD · EUR/.test(n)),'có ghi chú phải thu ngoài phạm vi');
const ap=res.sections.find(s=>/AP-NCC/.test(s.id));
assert.strictEqual(ap.matched,1,'inv-01 khớp INV-01'); assert.deepStrictEqual(JSON.parse(JSON.stringify(ap.rows.map(r=>r.key))),['ABC · HĐ INV-02'],'dòng chỉ-có-trong-hệ-thống dùng tên đối tác: '+JSON.stringify(ap.rows));
const bad=ctx.reconCompare(ctx.reconParseWorkbook({fwd:hdr.concat([['a','b','c']]),cbt:[],ncc:[],bmt:[]}),{arLines:[],apDocs:[],partners:[]});
assert.ok(bad.notes.some(n=>/Sheet FWD.*không đọc được dòng nào/.test(n)),'cảnh báo sai mẫu: '+JSON.stringify(bad.notes));
// ---------- Tổng quan: đến hạn đúng ngày chốt
const doc={id:'d1',docNo:'D1',partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-09-01',postingDate:'2026-09-01',dueDate:'2026-10-25',docType:'INVOICE',totalGrossMinor:100};
const T={Partner:[{id:'p1',shortName:'A',legalName:'A Co',status:'ACTIVE',contactEmail:'a@x.com'}],DebtDoc:[doc],DebtLine:[{id:'l1',docId:'d1',lineNo:1,grossMinor:100,vatMode:'NONE'}],Allocation:[],Payment:[],ServiceFile:[],Config:[],Catalog:[],Followup:[],Order:[],Accrual:[],AccrualSplit:[]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const full={id:'u',email:'u@x',role:'APPROVER',scope:{allPartners:true},displayName:'U'};
const dash=ctx.dashboardSummary_(full,{payload:{asOf:'2026-10-25'}});
assert.strictEqual(dash.sections.VND.AR.dueSoon7,100,'Tổng quan tính khoản đến hạn hôm nay');
// ---------- Gửi thư nhắc nợ
const results={}; let failMark=0;
ctx.runTx_=(user,meta,build)=>{ ctx.resetMemoDirect_(); if(meta.requestId&&results[meta.requestId]) return results[meta.requestId];
 if(meta.action==='reminder.mark'&&failMark>0){failMark--;throw new Error('SERVER_BUSY')}
 const tx={find:(t,id)=>T[t].find(x=>x.id===id),update:(t,id,p)=>Object.assign(T[t].find(x=>x.id===id),p),insert:(t,o)=>{const r=Object.assign({id:'f'+T[t].length},o);T[t].push(r);return r}};
 const res=build(tx).result; if(meta.requestId)results[meta.requestId]=res; return res};
const send=(rid)=>{try{return ctx.reminderSend_(full,{requestId:rid,payload:{partnerId:'p1',currency:'VND',subject:'Nhắc nợ',body:'Nội dung'}})}catch(e){return {err:e.code}}};
let r=send('r1'); assert.strictEqual(mails.length,1,'gửi 1 thư'); assert.strictEqual(T.Followup[0].kind,'REMINDER_SENT','ghi nhận đã gửi'); assert.strictEqual(r.sentTo,'a@x.com');
r=send('r1'); assert.strictEqual(mails.length,1,'gửi lại cùng yêu cầu không gửi thêm thư');
// bước đánh dấu hỏng 1 lần: thử lại thành công
failMark=1; r=send('r2'); assert.strictEqual(mails.length,2); assert.strictEqual(T.Followup[1].kind,'REMINDER_SENT','đánh dấu thử lại thành công'); assert.ok(!r.markPending);
// đánh dấu hỏng cả 2 lần: vẫn báo đã gửi, bản ghi còn "chưa xác nhận"
failMark=2; r=send('r3'); assert.strictEqual(mails.length,3); assert.strictEqual(r.markPending,true); assert.strictEqual(T.Followup[2].kind,'REMINDER_QUEUED');
// gửi thất bại
mailFail=true; r=send('r4'); assert.strictEqual(r.err,'MAIL_FAILED'); assert.strictEqual(T.Followup[3].kind,'REMINDER_FAILED'); assert.strictEqual(mails.length,3);
mailFail=false; r=send('r4'); assert.strictEqual(r.err,'REQUEST_FAILED','gửi lại cùng yêu cầu sau thất bại phải soạn lại'); assert.strictEqual(mails.length,3);
console.log('OK đối chiếu Excel + nhắc nợ');
