const vm=require('vm'),fs=require('fs'),assert=require('assert');
const props={DB_MAIN_ID:'cur',DB_AUDIT_ID:'aud'};
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in props?props[k]:null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
const cat=(id,type,c,attrs)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(attrs||{}),active:1,sortOrder:1,version:1});
const P=(id,tags,st)=>({id,shortName:id,legalName:id,isCustomer:1,isSupplier:1,status:st||'ACTIVE',scopeTags:tags,taxCode:''});
const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','BUSINESS_GROUP','G1'),cat('c3','CASH_ACCOUNT','Q1',{currency:'VND',type:'CASH'})],Partner:[P('p1','t1'),P('p2','t2'),P('p3','t1','INACTIVE')],Config:[{id:'ledgerStartDate',value:'2026-01-01'}],
 ImportBatch:[{id:'b1',mode:'OPENING',status:'DRAFT',createdBy:'x',version:1,summaryJson:'{}'}],
 ImportRow:[{id:'r1',batchId:'b1',rowNo:1,dataJson:JSON.stringify({kind:'AR',partnerId:'p1',businessGroupCode:'G1',currency:'VND',amountMinor:5}),issuesJson:'[]'},{id:'r2',batchId:'b1',rowNo:2,dataJson:JSON.stringify({kind:'AR',partnerId:'p2',businessGroupCode:'G1',currency:'VND',amountMinor:7}),issuesJson:'[]'},{id:'r3',batchId:'b1',rowNo:3,dataJson:JSON.stringify({kind:'CASH',cashAccountCode:'Q1',amountMinor:9}),issuesJson:'[]'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const sc={id:'s',email:'s@x',role:'ACCOUNTANT',scope:{partnerTags:['t1']}};
const full={id:'f',email:'f@x',role:'APPROVER',scope:{allPartners:true}};
// O1
const g=ctx.openingGet_(sc,{payload:{}});assert.strictEqual(g.rows.length,2,'ẩn dòng ngoài phạm vi (p2), giữ dòng quỹ');assert.ok(!g.rows.some(r=>r.partnerId==='p2'));
assert.strictEqual(ctx.openingGet_(full,{payload:{}}).rows.length,3);
for(const f of ['openingSave_','openingSubmit_','openingReject_','openingCommit_'])assert.strictEqual(code(()=>ctx[f](Object.assign({},sc,{role:'APPROVER'}),{requestId:'x',payload:{rows:[]}})),'OUT_OF_SCOPE',f);
// O2/O4 validation
const env=ctx.openingEnv_();
assert.ok(ctx.validateOpeningRow_({kind:'AR',partnerId:'p3',businessGroupCode:'G1',currency:'VND',amountMinor:5},env).some(i=>i.code==='PARTNER_INACTIVE'));
assert.ok(ctx.validateOpeningRow_({kind:'AR',partnerId:'p1',businessGroupCode:'G1',currency:'VND',amountMinor:5,docDate:'2025-12-01',dueDate:'2025-11-01'},env).some(i=>i.code==='DUE_BEFORE_DOC'));
assert.strictEqual(ctx.validateOpeningRow_({kind:'AR',partnerId:'p1',businessGroupCode:'G1',currency:'VND',amountMinor:5,docDate:'2025-12-01',dueDate:'2026-01-30'},env).length,0);
// O3 duplicates cash + credit direction (qua openingSave_)
let saved;ctx.runTx_=(u,m,b)=>{const tx={now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{const r=Object.assign({id:t+Math.random(),version:1},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:()=>1};return b(tx).result};
const res=ctx.openingSave_(full,{requestId:'o',payload:{rows:[{kind:'CASH',cashAccountCode:'Q1',amountMinor:1},{kind:'CASH',cashAccountCode:'Q1',amountMinor:2},{kind:'CREDIT',partnerId:'p1',direction:'IN',currency:'VND',amountMinor:5},{kind:'CREDIT',partnerId:'p1',direction:'OUT',currency:'VND',amountMinor:5}]}});
const iss=T.ImportRow.filter(r=>r.batchId==='b1'&&!r.isDeleted).map(r=>JSON.parse(r.issuesJson));
assert.ok(iss[1].some(i=>i.code==='DUPLICATE_ACCOUNT'&&i.severity==='ERROR'));assert.ok(!iss[3].some(i=>i.code==='SUSPECT_DUPLICATE'),'IN/OUT không báo trùng');
// B
assert.ok(ctx.schemaLte_('1.3','1.4')&&ctx.schemaLte_('1.4','1.4')&&!ctx.schemaLte_('1.10','1.4')&&ctx.schemaLte_('1.4','1.10'));
assert.strictEqual(ctx.copyFidelityDiffs_({A:{rows:2,sha256:'x'}},{A:{rows:2,sha256:'x'}},'main').length,0);
assert.strictEqual(ctx.copyFidelityDiffs_({A:{rows:2,sha256:'x'},B:{rows:1,sha256:'y'}},{A:{rows:2,sha256:'z'}},'main').length,2);
ctx.dbFingerprint_=()=>({});
assert.ok(ctx.verifyBackupRow_({manifestJson:JSON.stringify({sheets:{main:{},audit:{}},sourceDiffs:['main/Partner: bản sao khác DB gốc']})}).ok===false);
let trig;ctx.doBackup_=(u,t)=>{trig=t;return {}};ctx.backupRun_(full,{payload:{trigger:'PRE_RESTORE/../x'}});assert.strictEqual(trig,'MANUAL');
ctx.withLock_=(ms,f)=>f();
assert.strictEqual(code(()=>ctx.backupRollbackSwitch_(full,{payload:{}})),'VALIDATION_FAILED');
assert.strictEqual(code(()=>ctx.backupRollbackSwitch_(Object.assign({},full,{role:'ADMIN'}),{payload:{reason:'x'}})),'FORBIDDEN');
props.DB_MAIN_ID_PREV='old';assert.strictEqual(code(()=>ctx.backupRollbackSwitch_(full,{payload:{reason:'sai dữ liệu'}})),'OK');assert.strictEqual(props.DB_MAIN_ID,'old');
console.log('OK fix2.test');
