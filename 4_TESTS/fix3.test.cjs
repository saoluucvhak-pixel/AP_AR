const vm=require('vm'),fs=require('fs'),assert=require('assert');
const props={DB_MAIN_ID:'cur',DB_AUDIT_ID:'aud',OPEN_TX:'{"a":1}',RESTORE_CANDIDATE:JSON.stringify({candidateId:'cand',backupId:'b1',preparedBy:'other',controlTotals:{'AR:VND':{out:5}}}),MAINTENANCE:'1'};
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'x'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in props?props[k]:null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
ctx.repoFind_=()=>({manifestJson:JSON.stringify({sheets:{main:{}}})});ctx.dbFingerprint_=()=>({});ctx.migrateHeaders_=()=>[];
ctx.controlTotals_=()=>{throw new Error('SCHEMA_MISMATCH Partner')};
const ap={id:'a',email:'a@x',role:'APPROVER',scope:{allPartners:true}};
try{ctx.backupSwitchLocked_(ap,{});assert.fail('x')}catch(e){assert.strictEqual(e.code,'RESTORE_SMOKE_FAILED')}
assert.strictEqual(props.DB_MAIN_ID,'cur');assert.strictEqual(props.OPEN_TX,'{"a":1}');assert.ok(props.RESTORE_CANDIDATE&&props.MAINTENANCE==='1');assert.ok(!('DB_MAIN_ID_PREV' in props));
// thành công
ctx.controlTotals_=()=>({'AR:VND':{out:5}});ctx.writeAudit_=()=>{};
const r=ctx.backupSwitchLocked_(ap,{});assert.strictEqual(props.DB_MAIN_ID,'cand');assert.ok(!props.RESTORE_CANDIDATE&&!props.MAINTENANCE);
console.log('OK fix3');
