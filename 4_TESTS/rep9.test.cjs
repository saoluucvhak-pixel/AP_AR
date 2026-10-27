const vm=require('vm'),fs=require('fs'),assert=require('assert');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
let mails=[];
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})},
 MailApp:{sendEmail:(to,s,b)=>{if(to==='bad@x')throw new Error('mail lỗi');mails.push(to)}}});
vm.runInContext(fs.readFileSync(SRC,'utf8'),ctx);
const doc=(id,o)=>Object.assign({id,docNo:id,partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-08-01',postingDate:'2026-08-01',dueDate:'2026-09-01',docType:'INVOICE',totalGrossMinor:100,warningsJson:''},o);
const T={Partner:[{id:'p1',shortName:'A',legalName:'A Co',status:'ACTIVE',contactEmail:'a@x'}],
 DebtDoc:[doc('d1',{})],DebtLine:[{id:'l1',docId:'d1',lineNo:1,grossMinor:100,vatMode:'NONE'}],Allocation:[],ServiceFile:[{id:'s1',hsdvCode:'GML/1',businessGroupCode:'G2',dataGapJson:'[{"partnerId":"p1"}]'}],Config:[],Catalog:[],Order:[],Accrual:[],AccrualSplit:[],
 Payment:[{id:'x1',payNo:'PH-1',direction:'IN',partnerId:'p1',status:'REVERSED',effectiveDate:'2026-02-20',reversedDate:'2026-04-05',amountMinor:500,currency:'VND',source:'MANUAL'}],
 Followup:[
  {id:'f1',partnerId:'p1',direction:'AR',kind:'REMINDER_SENT',followDate:'2026-10-20',status:'DONE'},
  {id:'f2',partnerId:'p1',direction:'AR',kind:'REMINDER_SENT',followDate:'2026-11-02',status:'DONE'},
  {id:'f3',partnerId:'p1',direction:'AR',kind:'PROMISE',followDate:'2026-11-01',promisedDate:'2026-11-05',promisedAmountMinor:100,currency:'VND',status:'OPEN'}],
 AppUser:[{id:'u1',email:'ok@x',role:'APPROVER',status:'ACTIVE',scopeJson:'{"allPartners":true}'},{id:'u2',email:'bad@x',role:'APPROVER',status:'ACTIVE',scopeJson:'{"allPartners":true}'},
  {id:'u3',email:'ok2@x',role:'APPROVER',status:'ACTIVE',scopeJson:'{"allPartners":true}'},{id:'u4',email:'none@x',role:'APPROVER',status:'ACTIVE',scopeJson:'{"partnerIds":["zzz"]}'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const full={id:'u',email:'u@x',role:'APPROVER',scope:{allPartners:true},displayName:'U'};
// A: theo dõi chỉ tính đến ngày chốt
let ov=ctx.alertOverview_(full,{payload:{asOf:'2026-10-25'}}).AR[0];
assert.strictEqual(ov.lastReminder,'2026-10-20','thư nhắc sau ngày chốt không tính'); assert.strictEqual(ov.promise,null,'cam kết lập sau ngày chốt không tính');
ov=ctx.alertOverview_(full,{payload:{asOf:'2026-11-10'}}).AR[0];
assert.strictEqual(ov.lastReminder,'2026-11-02'); assert.ok(ov.promise&&ov.promise.broken===false||ov.promise,'ngày chốt sau đó thấy cam kết');
// B: bản tin
let alerts=[]; ctx.alertAdmin_=(s,b)=>alerts.push(s+':'+b);
ctx.overdueDigestTrigger();
assert.deepStrictEqual(JSON.parse(JSON.stringify(mails.sort())),['ok2@x','ok@x'],'u2 lỗi gửi không làm dừng u3; u4 không có khoản nào thì không gửi: '+mails);
assert.strictEqual(alerts.length,1,'báo quản trị một lần'); assert.ok(/bad@x/.test(alerts[0]));
T.DebtDoc[0].dueDate='2027-01-01'; mails=[];ctx.overdueDigestTrigger(); assert.strictEqual(mails.length,0,'không quá hạn thì không gửi bản tin');
T.DebtDoc[0].dueDate='2026-09-01';
// C: theo dõi gắn chứng từ kiểm quyền nhóm
ctx.runTx_=(user,meta,build)=>{const tx={find:(t,id)=>T[t].find(x=>x.id===id),insert:(t,o)=>{const r=Object.assign({id:'n'},o);return r}};return build(tx).result};
const grp={id:'g',email:'g@x',role:'APPROVER',scope:{allPartners:true,businessGroups:['G2']},displayName:'G'};
const sv=(u)=>{try{ctx.followupSave_(u,{requestId:'r',payload:{partnerId:'p1',docId:'d1',direction:'AR',kind:'NOTE',note:'x'}});return 'ok'}catch(e){return e.code}};
assert.strictEqual(sv(grp),'VALIDATION_FAILED'); assert.strictEqual(sv(full),'ok');
// D: đối chiếu Excel – phải trả của đối tác không có trong Excel
const parsed={ar:[],ap:[{sheet:'ncc',row:3,partner:'ABC',invoiceNo:'I1',currency:'VND',out:100,desc:''}],bmt:[],gaps:[],skipped:{},seen:{ncc:1}};
const sys={arLines:[],apDocs:[{partnerId:'p1',invoiceNo:'I1',currency:'VND',out:100,docId:'a'},{partnerId:'p2',invoiceNo:'Z',currency:'VND',out:300,docId:'b'}],partners:[{id:'p1',shortName:'ABC',legalName:'ABC'},{id:'p2',shortName:'Công ty Z',legalName:'Z'}]};
const rc=ctx.reconCompare(parsed,sys);
assert.ok(rc.notes.some(n=>/KHÔNG xuất hiện trong sheet NCC/.test(n)&&/Công ty Z \(VND\) 300/.test(n)),'ghi chú đối tác vắng: '+JSON.stringify(rc.notes));
// xu hướng đã thu: phiếu bị đảo
const tr=ctx.dashboardSummaryLive_(full,{payload:{asOf:'2026-10-25'}}).trend.series['AR:VND'].paid;
assert.strictEqual(JSON.stringify(tr.slice(0,5)),'[0,500,0,-500,0]'.replace('[0,500,0,-500,0]','[0,500,0,-500,0]'),'đã thu T1..T5: '+JSON.stringify(tr));
console.log('OK các mục còn lại');
