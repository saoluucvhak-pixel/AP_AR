const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return "OK"}catch(e){if(process.env.DBG)console.log(e.message,JSON.stringify(e.fields));return e.code||e.message}};
const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
const doc=(id,o)=>Object.assign({id,docNo:id,partnerId:'p1',direction:'AR',currency:'VND',businessGroupCode:'G1',status:'POSTED',docType:'INVOICE',docDate:'2026-10-02',postingDate:'2026-10-02',totalGrossMinor:1000,isOpening:0,createdBy:'x'},o);
const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','BUSINESS_GROUP','G1')],Partner:[{id:'p1',shortName:'A',legalName:'A',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'t1',taxCode:''},{id:'p2',shortName:'B',legalName:'B',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'t2',taxCode:''}],
 DebtDoc:[doc('d1',{}),doc('d2',{partnerId:'p1'})],
 DebtLine:[{id:'l1',docId:'d1',lineNo:1,feeTypeCode:'F',netMinor:1000,grossMinor:1000,vatMinor:0,vatMode:'NONE'},{id:'l2',docId:'d2',lineNo:1,feeTypeCode:'F',netMinor:1000,grossMinor:1000,vatMinor:0,vatMode:'NONE'}],
 Allocation:[],Payment:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}],ServiceFile:[],Period:[],ImportBatch:[],ImportRow:[],AppUser:[{id:'u1',email:'a@x.vn',role:'ADMIN',status:'ACTIVE',scopeJson:'{"allPartners":true}',permissionsVersion:1,version:1}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
ctx.runTx_=(u,m,b)=>{const tx={now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{const r=Object.assign({id:t+((T[t]||[]).length+1),version:1,createdBy:u.id},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:()=>1};return b(tx).result};
const ap={id:'ap',email:'ap@x',role:'APPROVER',scope:{allPartners:true}};
const adj=(kind,lines,docId)=>ctx.docAdjust_(ap,{requestId:'r'+Math.random(),payload:{docId:docId||'d1',kind,reason:'x',docDate:'2026-10-10',lines}});
// 1 duplicate target in one doc
assert.strictEqual(code(()=>adj('DEC',[{targetLineId:'l1',amountMinor:600,description:'a'},{targetLineId:'l1',amountMinor:600,description:'b'}])),'VALIDATION_FAILED');
// pending draft counted
assert.strictEqual(code(()=>adj('DEC',[{targetLineId:'l1',amountMinor:600,description:'a'}])),'OK');
assert.strictEqual(code(()=>adj('DEC',[{targetLineId:'l1',amountMinor:600,description:'b'}])),'VALIDATION_FAILED','nháp thứ hai vượt');
assert.strictEqual(code(()=>adj('DEC',[{targetLineId:'l1',amountMinor:400,description:'b'}])),'OK','vừa đủ');
// 2 reverse blocked by adjustments
assert.strictEqual(code(()=>ctx.docReverse_(ap,{requestId:'rv',payload:{docId:'d1',reason:'x',docDate:'2026-10-20'}})),'HAS_ADJUSTMENTS');
assert.strictEqual(code(()=>ctx.docReverse_(ap,{requestId:'rv',payload:{docId:'d2',reason:'x',docDate:'2026-10-01'}})),'VALIDATION_FAILED','trước ngày gốc');
assert.strictEqual(code(()=>ctx.docReverse_(ap,{requestId:'rv',payload:{docId:'d2',reason:'x',docDate:'2026-10-20'}})),'OK');
const adjDoc=T.DebtDoc.find(d=>d.docType==='ADJ_DEC');adjDoc.status='POSTED';
assert.strictEqual(code(()=>ctx.docReverse_(ap,{requestId:'rv2',payload:{docId:adjDoc.id,reason:'x'}})),'STATE_TRANSITION_INVALID');
// post ADJ_DEC recheck: simulate allocation consuming the line after drafting
const drafts=T.DebtDoc.filter(d=>d.docType==='ADJ_DEC'&&d.status==='DRAFT');drafts[0].status='APPROVED';drafts[0].createdBy='x';T.Allocation.push({id:'al',paymentId:'pp',debtLineId:'l1',docId:'d1',partnerId:'p1',currency:'VND',amountMinor:900,effectiveDate:'2026-10-05',status:'ACTIVE'});
T.Payment.push({id:'pp',status:'POSTED',partnerId:'p1',direction:'IN',currency:'VND',amountMinor:900,effectiveDate:'2026-10-05'});
ctx.assertPeriodOpen_=()=> '2026-10';
assert.strictEqual(code(()=>ctx.docPost_(ap,{requestId:'po',payload:{id:drafts[0].id}})),'ADJ_OVER_OUTSTANDING');
// 5 posting date before docDate
const nd=doc('d9',{status:'APPROVED',docDate:'2026-10-15',docType:'INVOICE'});T.DebtDoc.push(nd);T.DebtLine.push({id:'l9',docId:'d9',grossMinor:1000});
assert.strictEqual(code(()=>ctx.docPost_(ap,{requestId:'po2',payload:{id:'d9',postingDate:'2026-10-01'}})),'VALIDATION_FAILED');
// payments self reject / submit owner
T.Payment.push({id:'p5',status:'SUBMITTED',createdBy:'ap',submittedBy:'ap',partnerId:'p1',direction:'IN',currency:'VND',amountMinor:1,effectiveDate:'2026-10-01',version:1});
const acc={id:'ac',email:'ac@x',role:'ACCOUNTANT',scope:{allPartners:true}};
T.Payment.push({id:'p6',status:'DRAFT',createdBy:'zzz',partnerId:'p1',direction:'IN',currency:'VND',amountMinor:1,effectiveDate:'2026-10-01',version:1});
assert.strictEqual(code(()=>ctx.paySubmit_(acc,{requestId:'ps',payload:{id:'p6'}})),'FORBIDDEN');
ctx.sha256Hex_=s=>'H';
// 3 bank import scope
const sc={id:'s',email:'s@x',role:'ACCOUNTANT',scope:{partnerTags:['t1']}};
for(const f of ['importBankPreview_','importRowDecide_','importCancel_','importBankCommit_'])assert.strictEqual(code(()=>ctx[f](Object.assign({},sc,{role:'APPROVER'}),{requestId:'i',payload:{csv:'x'}})),'OUT_OF_SCOPE',f);
assert.strictEqual(ctx.importList_(sc,{payload:{}}).items.length,0);
T.ImportBatch.push({id:'b1',sourceType:'BANK_STATEMENT',fileName:'f',status:'IN_REVIEW',version:1,createdBy:'x',fileSha256:'abcdef1234567890'});
T.ImportRow.push({id:'r1',batchId:'b1',rowNo:1,dataJson:JSON.stringify({partnerId:'p1',decision:'ACCEPT',direction:'IN',currency:'VND',amountMinor:5}),issuesJson:'[]',decision:'ACCEPT'},{id:'r2',batchId:'b1',rowNo:2,dataJson:JSON.stringify({partnerId:'p2',direction:'IN',currency:'VND',amountMinor:7}),issuesJson:'[]',decision:'ACCEPT'});
const g=ctx.importGet_(sc,{payload:{batchId:'b1'}});assert.strictEqual(g.rows.length,1);assert.strictEqual(g.rows[0].data.partnerId,'p1');
// 4 commit duplicate recheck
ctx.bankAccountsMap_=()=>({Q1:{currency:'VND'}});
T.ImportRow.length=0;T.ImportRow.push({id:'r3',batchId:'b1',rowNo:1,dataJson:JSON.stringify({partnerId:'p1',direction:'IN',currency:'VND',amountMinor:500,date:'2026-10-05',account:'Q1',bankRef:'REF1'}),issuesJson:'[]',decision:'ACCEPT'});
T.Payment.push({id:'px',status:'POSTED',cashAccountCode:'Q1',effectiveDate:'2026-10-05',amountMinor:500,bankRef:'REF1',payNo:'PH1'});
const hash=ctx.sha256Hex_?null:null;
ctx.sha256Hex_=s=>'H';
assert.strictEqual(code(()=>ctx.importBankCommit_(ap,{requestId:'ic',payload:{batchId:'b1',expectedSummaryHash:'H'}})),'VALIDATION_FAILED','trùng với phiếu đã có');
// 5d user scope
assert.strictEqual(code(()=>ctx.userSave_({id:'u1',email:'a@x',role:'ADMIN',scope:{allPartners:true}},{requestId:'u',payload:{id:'u1',email:'a@x.vn',displayName:'A',role:'ADMIN',scope:{allPartners:true,partnerIds:['nope']}}})),'VALIDATION_FAILED');
assert.strictEqual(code(()=>ctx.userSave_({id:'u1',email:'a@x',role:'ADMIN',scope:{allPartners:true}},{requestId:'u',payload:{id:'u1',email:'a@x.vn',displayName:'A',role:'ADMIN',scope:{allPartners:false,partnerTags:['t1']}}})),'FORBIDDEN');
assert.strictEqual(code(()=>ctx.userSave_({id:'u1',email:'a@x',role:'ADMIN',scope:{allPartners:true}},{requestId:'u',payload:{id:'u1',email:'a@x.vn',displayName:'Tên mới',role:'ADMIN',scope:{allPartners:true}}})),'OK','đổi tên bản thân vẫn được');
assert.strictEqual(code(()=>ctx.userSave_({id:'u1',email:'a@x',role:'ADMIN',scope:{allPartners:true}},{requestId:'u',payload:{id:'new',email:'n@x.vn',displayName:'N',role:'ACCOUNTANT',scope:{businessGroups:['XX']}}})),'NOT_FOUND');
// 5e mask
const m=ctx.maskPartnerDiff_({bankAccountNo:'0071000123456',phone:'0905123456',searchText:'x',legalName:'A'});assert.strictEqual(m.bankAccountNo,'***3456');assert.ok(!('searchText' in m));
console.log('OK fix4');
