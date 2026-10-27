const vm=require('vm'),fs=require('fs'),assert=require('assert');
const src=fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(src,ctx);
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
// 1: mọi nơi giữ khóa đều hoàn tác ngay giao dịch dở
assert.strictEqual((src.match(/recoverStale_\(0\)/g)||[]).length,4);assert.ok(!/recoverStale_\(\)/.test(src));
const T={Partner:[{id:'p1',scopeTags:'t1',isCustomer:1,isSupplier:1,status:'ACTIVE',shortName:'a'},{id:'p2',scopeTags:'t2',isCustomer:1,isSupplier:1,status:'ACTIVE',shortName:'b'}],
 Order:[{id:'o1',customerPartnerId:'p1',businessGroupCode:'G1',status:'OPEN',orderNo:'D1',version:1},{id:'o2',customerPartnerId:'p1',businessGroupCode:'G1',status:'CANCELLED',orderNo:'D2',version:1},{id:'o3',customerPartnerId:'p1',businessGroupCode:'G1',status:'CLOSED',orderNo:'D3',version:1}],
 Accrual:[{id:'a1',orderId:'',kind:'COST',partnerId:'p2',status:'OPEN',netMinor:1,currency:'VND',version:1},{id:'a2',orderId:'',kind:'COST',partnerId:'p1',status:'CANCELLED',version:1}],AccrualSplit:[],Config:[],Catalog:[{id:'c',catalogType:'CURRENCY',code:'VND',attrsJson:'{"decimals":0}',active:1},{id:'f',catalogType:'FEE_TYPE',code:'F',attrsJson:'{}',active:1}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
ctx.runTx_=(u,m,b)=>{const tx={now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{const r=Object.assign({id:t+Math.random(),version:1},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:()=>1};return b(tx).result};
const sc={id:'s',email:'s@x.vn',role:'ACCOUNTANT',scope:{partnerTags:['t1']}};
// 2
assert.strictEqual(code(()=>ctx.accrualSave_(sc,{requestId:'a',payload:{id:'a1',allocMode:'GENERAL',kind:'COST',partnerId:'p1',currency:'VND',accrualDate:'2026-10-10',feeTypeCode:'F',description:'x',netMinor:5,vatMode:'NONE'}})),'NOT_FOUND');
// 3
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
assert.strictEqual(code(()=>ctx.orderSetStatus_(ap,{requestId:'s',payload:{id:'o2',status:'OPEN'}})),'STATE_TRANSITION_INVALID');
assert.strictEqual(code(()=>ctx.orderSetStatus_(ap,{requestId:'s',payload:{id:'o3',status:'CLOSED'}})),'STATE_TRANSITION_INVALID');
assert.strictEqual(code(()=>ctx.orderSetStatus_(ap,{requestId:'s',payload:{id:'o3',status:'OPEN'}})),'OK');
assert.strictEqual(code(()=>ctx.orderSetStatus_(ap,{requestId:'s',payload:{id:'o1',status:'CLOSED'}})),'OK');
try{ctx.accrualCancel_(ap,{requestId:'c',payload:{id:'a2'}})}catch(e){assert.ok(/đã được hủy/.test(e.message))}
// 6 setup không in lại secret, có migrate
const body=src.slice(src.indexOf('function setupBackend'),src.indexOf('function seedDefaults_'));
assert.ok(body.includes('migrateHeaders_()')&&body.includes('if (secretNew)'));
console.log('OK fix5');
