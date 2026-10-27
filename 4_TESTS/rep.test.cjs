const vm=require('vm'),fs=require('fs'),assert=require('assert');
const src=fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(src,ctx);
const T={
 Partner:[{id:'p1',shortName:'ABC',legalName:'ABC Co',taxCode:'1',status:'ACTIVE'}],
 DebtDoc:[
  {id:'d1',partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-02-01',statementPeriod:'2026-02'},
  {id:'d2',partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G2',docDate:'2026-02-02',statementPeriod:'2026-02'}],
 DebtLine:[
  {id:'l1',docId:'d1',lineNo:1,description:'Phí G1',netMinor:100,vatMode:'NONE',vatMinor:0,grossMinor:100,isPassThrough:0,containerQty:1,shipmentRefId:'',lotNote:''},
  {id:'l2',docId:'d2',lineNo:1,description:'Phí G2',netMinor:900,vatMode:'NONE',vatMinor:0,grossMinor:900,isPassThrough:0,containerQty:1,shipmentRefId:'',lotNote:''}],
 ShipmentRef:[],
 Payment:[
  {id:'x1',payNo:'PH-1',direction:'IN',partnerId:'p1',cashAccountCode:'BANK1',status:'POSTED',effectiveDate:'2026-03-01',amountMinor:500,currency:'VND'},
  {id:'x2',payNo:'PC-1',direction:'OUT',partnerId:'',cashAccountCode:'BANK1',status:'POSTED',effectiveDate:'2026-03-02',amountMinor:20,currency:'VND',note:'Phí NH'}],
 OpeningBalance:[{kind:'CASH',cashAccountCode:'BANK1',amountMinor:1000}],
 Allocation:[],Catalog:[{id:'c1',catalogType:'CASH_ACCOUNT',code:'BANK1',name:'NH 1',attrsJson:'{"currency":"VND"}',active:1,sortOrder:1}],Config:[]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const mk=(scope)=>({id:'u',email:'u@x',role:'ACCOUNTANT',scope});
const full=mk({allPartners:true}), grp=mk({allPartners:true,businessGroups:['G1']}), part=mk({partnerIds:['p1']});
const run=(f,...a)=>{try{return vm.runInContext(f,ctx)(...a)}catch(e){return {err:e.code||e.message}}};
const r5=(u)=>ctx.rep05_(u,'R05',{partnerId:'p1',statementPeriod:'2026-02',direction:'AR',currency:'VND',asOf:'2026-10-25'});
const total=(rep)=>rep.rows.filter(r=>r.t==='total')[0].cells.total;
// R05: full scope sees both groups; group-limited sees only G1
assert.strictEqual(total(r5(full)),1000);
assert.strictEqual(total(r5(grp)),100);
// R08
const r8=(u)=>{try{return ctx.rep08_(u,'R08',{cashAccountCode:'BANK1',from:'2026-01-01',to:'2026-12-31',asOf:'2026-10-25'})}catch(e){return {err:e.code}}};
const bal=(rep)=>rep.rows.filter(r=>r.t==='total')[0].cells.bal;
assert.strictEqual(bal(r8(full)),1000+500-20);   // phí NH không có đối tác nay được tính
assert.strictEqual(r8(grp).err,'OUT_OF_SCOPE');
assert.strictEqual(r8(part).err,'OUT_OF_SCOPE');
console.log('OK: R05 theo nhóm', total(r5(full)),'/',total(r5(grp)),'| R08 tồn quỹ',bal(r8(full)),'| người giới hạn bị chặn: nhóm',r8(grp).err,', đối tác',r8(part).err);
