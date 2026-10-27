const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'25/10/2026 10:00'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync(SRC,'utf8'),ctx);
ctx.sha256Hex_=s=>crypto.createHash('sha256').update(s).digest('hex');
const T={ReportSnapshot:[],Partner:[{id:'p1',shortName:'A',status:'ACTIVE'}],DebtDoc:[{id:'d1',docNo:'D1',partnerId:'p1',status:'POSTED',postingDate:'2026-02-10',docDate:'2026-02-01'}],
 Order:[{id:'o1',orderNo:'DH1',customerPartnerId:'p1',orderDate:'2026-02-01',businessGroupCode:'G1',currency:'VND',status:'OPEN'}],ServiceFile:[],AccrualSplit:[],Config:[],Catalog:[],
 Accrual:[
  {id:'c1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-02-05',netMinor:1000,grossMinor:1100,currency:'VND',status:'INVOICED',docId:'d1'},
  {id:'c2',orderId:'o1',kind:'COST',partnerId:'p1',accrualDate:'2026-03-01',netMinor:400,grossMinor:440,currency:'VND',status:'OPEN',docId:''},
  {id:'c3',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-11-01',netMinor:500,grossMinor:500,currency:'VND',status:'OPEN',docId:''}]};
ctx.repoValid_=t=>(T[t]||[]).slice();ctx.repoCommitted_=ctx.repoValid_;
const full={id:'u',email:'u@x',role:'APPROVER',scope:{allPartners:true},displayName:'U'};
// ---- Lỗi 5: khối chưa lập hóa đơn theo ngày chốt
const un=(asOf)=>{const u=JSON.parse(JSON.stringify(ctx.dashboardUninvoiced_(full,{payload:{asOf}}).uninvoiced));Object.keys(u).forEach(c=>{delete u[c].invoicingRevenue;delete u[c].invoicingCost;delete u[c].invoicingCount});return JSON.stringify(u)};
assert.strictEqual(un('2026-02-07'),JSON.stringify({VND:{revenue:1100,cost:0,revenueCount:1,costCount:0}}),'07/02: hóa đơn chưa ghi nhận');
assert.strictEqual(un('2026-10-25'),JSON.stringify({VND:{revenue:0,cost:440,revenueCount:0,costCount:1}}),'25/10');
// ---- Lỗi 3: khóa phiên bản
const rep=(code,params,meta)=>({code,meta:Object.assign({asOf:'2026-10-25',params},meta||{}),issueBlockers:[],columns:[],rows:[],notes:[],words:[]});
const k=(code,params,meta)=>ctx.snapshotKey_(rep(code,params,meta));
assert.notStrictEqual(k('R07',{currency:'VND'}),k('R07',{currency:'USD'}),'VND khác USD');
assert.notStrictEqual(k('R07',{group:'G1'}),k('R07',{group:'G2'}),'nhóm khác nhau');
assert.notStrictEqual(k('R08',{cashAccountCode:'B1'}),k('R08',{cashAccountCode:'B2'}),'quỹ khác nhau');
assert.strictEqual(k('R07',{currency:'VND'}),k('R07',{currency:'VND'}),'cùng bộ lọc cùng khóa');
assert.strictEqual(k('R01',{}),'R01-2026-10-25','không bộ lọc: giữ khóa cũ');
// ---- Lỗi 4: phát hành đồng thời + phát lại
let files=[],trashed=0,created=0,txCount=0,racing=null,prior=null;
const mkFile=(n)=>{created++;const f={name:n,setTrashed(){trashed++},getId:()=>'F'+created};files.push(f);return f};
ctx.driveFolder_=()=>({createFile:(a)=>mkFile(typeof a==='string'?a:'blob')});
ctx.exportReportFile_=()=>({setName(){return this}});
ctx.reportRun_=()=>rep('R07',{currency:'VND',asOf:'2026-10-25'});
ctx.findTxByRequest_=()=>prior;
ctx.runTx_=(user,meta,build)=>{txCount++;if(racing)racing();const tx={now:'T',rows:t=>(T[t]||[]).slice(),update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},insert:(t,o)=>{const r=Object.assign({id:'n'+T[t].length},o);T[t].push(r);return r}};return build(tx).result};
const issue=(rid)=>{try{return ctx.reportIssue_(full,{requestId:rid,payload:{code:'R07',params:{currency:'VND'}}})}catch(e){return {err:e.code}}};
let r=issue('rq1'); assert.ok(/v01$/.test(r.versionLabel),'bản đầu v01: '+JSON.stringify(r));
r=issue('rq2'); assert.ok(/v02$/.test(r.versionLabel),'bản hai v02'); assert.strictEqual(T.ReportSnapshot.filter(s=>s.status==='SUPERSEDED').length,1,'v01 bị thay thế');
// đồng thời: có bản khác chen vào trước khi ghi
created=0;trashed=0;files=[];
racing=()=>{T.ReportSnapshot.push({id:'race',versionLabel:ctx.snapshotKey_(rep('R07',{currency:'VND',asOf:'2026-10-25'})).replace(/^/,'RPT-')+'-v03',status:'ISSUED',issuedBy:'x'});racing=null};
r=issue('rq3'); assert.strictEqual(r.err,'SERVER_BUSY','phát hiện bản khác chen vào'); assert.strictEqual(trashed,2,'2 tệp mồ côi bị xóa');
// phát lại cùng requestId đã thành công: không tạo tệp mới
created=0;
const payload=JSON.stringify({code:'R07',key:ctx.snapshotKey_(rep('R07',{currency:'VND',asOf:'2026-10-25'})),params:{currency:'VND',asOf:'2026-10-25'}});
prior={actor:'u@x',action:'report.issue',payloadHash:ctx.sha256Hex_(payload),status:'FINALIZED',resultJson:'{"id":"old","versionLabel":"RPT-old"}'};
r=issue('rq1'); assert.strictEqual(r.id,'old','trả kết quả cũ'); assert.strictEqual(created,0,'không tạo tệp mới khi phát lại');
console.log('OK lỗi 3,4,5');
