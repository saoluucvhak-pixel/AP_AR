const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const cat=(id,type,code,attrs)=>({id,catalogType:type,code,name:code,attrsJson:JSON.stringify(attrs||{}),active:1,sortOrder:1,version:1});
const P=(id,tags)=>({id,shortName:id,legalName:id+' Co',isCustomer:1,isSupplier:1,status:'ACTIVE',taxCode:'',scopeTags:tags,paymentTermDays:null,creditLimitMinor:null,creditLimitCurrency:'',version:1,createdBy:'x'});
const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','BUSINESS_GROUP','G1'),cat('c3','FEE_TYPE','F1'),cat('c4','FEE_TYPE','F2')],
 Partner:[P('p1','t1'),P('p2','t2')],
 Order:[{id:'o1',orderNo:'DH1',customerPartnerId:'p2',businessGroupCode:'G1',status:'OPEN',currency:'VND',orderDate:'2026-10-01',version:1}],
 DebtDoc:[{id:'dd',partnerId:'p1',direction:'AR',currency:'VND',businessGroupCode:'G1',status:'POSTED'}],DebtLine:[{id:'ll',docId:'dd',feeTypeCode:'F1'}],
 Payment:[{id:'pay2',payNo:'P2',partnerId:'p2',status:'DRAFT',createdBy:'s',currency:'VND',version:1}],Accrual:[],ServiceFile:[],OpeningBalance:[],Config:[]};
ctx.repoValid_=t=>(T[t]||[]).slice();
ctx.runTx_=(user,meta,build)=>{const tx={now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),
 insert:(t,o)=>{const r=Object.assign({id:t+((T[t]||[]).length+1),version:1},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,patch)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,patch);return r},nextSeq:()=>1};return build(tx).result};
const fin={id:'f',email:'f@x',role:'APPROVER',scope:{allPartners:true},displayName:'F'};
const sc={id:'s',email:'s@x',role:'ACCOUNTANT',scope:{partnerTags:['t1']},displayName:'S'};
const code=f=>{try{f();return 'OK'}catch(e){return e.code}};
// 1 catalog
assert.strictEqual(code(()=>ctx.catalogSave_(fin,{requestId:'a',payload:{id:'c3',catalogType:'FEE_TYPE',code:'F1_MOI',name:'x',attrs:{}}})),'IN_USE');
assert.strictEqual(code(()=>ctx.catalogSave_(fin,{requestId:'a',payload:{id:'c4',catalogType:'FEE_TYPE',code:'F2_MOI',name:'x',attrs:{}}})),'OK','mục chưa dùng đổi mã được');
assert.strictEqual(code(()=>ctx.catalogSave_(fin,{requestId:'a',payload:{id:'c3',catalogType:'FEE_TYPE',code:'F1',name:'Tên mới',attrs:{}}})),'OK','đổi tên được');
assert.strictEqual(code(()=>ctx.catalogSave_(fin,{requestId:'a',payload:{id:'c1',catalogType:'CURRENCY',code:'VND',name:'VND',attrs:{decimals:2}}})),'IN_USE');
assert.strictEqual(code(()=>ctx.catalogSave_(fin,{requestId:'a',payload:{id:'c3',catalogType:'CURRENCY',code:'F1',name:'x',attrs:{decimals:0}}})),'VALIDATION_FAILED','không đổi loại');
// 2 partner scope + new fields
const base={isCustomer:1,isSupplier:0,paymentTermDays:null};
assert.strictEqual(code(()=>ctx.partnerSave_(sc,{requestId:'b',payload:Object.assign({id:'p2',shortName:'KH2',legalName:'Sửa'},base)})),'NOT_FOUND');
assert.strictEqual(code(()=>ctx.partnerSave_(sc,{requestId:'b',payload:Object.assign({id:'p1',shortName:'p1',legalName:'p1 Co',scopeTags:'t9'},base)})),'OUT_OF_SCOPE','không tự đẩy mình ra ngoài phạm vi');
assert.strictEqual(code(()=>ctx.partnerSave_(sc,{requestId:'b',payload:Object.assign({shortName:'New',legalName:'New Co',scopeTags:''},base)})),'OUT_OF_SCOPE','tạo mới phải gán thẻ trong phạm vi');
assert.strictEqual(code(()=>ctx.partnerSave_(fin,{requestId:'b',payload:Object.assign({id:'p1',shortName:'p1',legalName:'p1 Co',scopeTags:'t1',phone:'abc'},base)})),'VALIDATION_FAILED');
assert.strictEqual(code(()=>ctx.partnerSave_(fin,{requestId:'b',payload:Object.assign({id:'p1',shortName:'p1',legalName:'p1 Co',scopeTags:'t1',address:'12 Lê Lợi, Đà Nẵng',phone:'0236 3888 999',contactName:'Nguyễn Thị A',contactTitle:'Kế toán trưởng',bankAccountNo:'0071000123456',bankName:'Vietcombank - CN Đà Nẵng',contactEmail:'a@b.vn'},base)})),'OK');
const p1=T.Partner[0];assert.strictEqual(p1.address,'12 Lê Lợi, Đà Nẵng');assert.strictEqual(p1.contactTitle,'Kế toán trưởng');assert.strictEqual(p1.bankAccountNo,'0071000123456');assert.strictEqual(p1.bankName,'Vietcombank - CN Đà Nẵng');assert.strictEqual(p1.phone,'0236 3888 999');
const out=ctx.partnerOut_(p1);assert.strictEqual(out.contactName,'Nguyễn Thị A');
assert.strictEqual(code(()=>ctx.partnerBulkCommit_(sc,{requestId:'c',payload:{rows:[{shortName:'Z',isCustomer:'1'}]}})),'OUT_OF_SCOPE');
assert.strictEqual(code(()=>ctx.partnerBulkCommit_(fin,{requestId:'c',payload:{rows:[{shortName:'Z',isCustomer:'1',phone:'0905123456',bankAccountNo:'123456789',bankName:'ACB',address:'HN',contactName:'B',contactTitle:'GĐ'}]}})),'OK');
const z=T.Partner.find(x=>x.shortName==='Z');assert.strictEqual(z.bankName,'ACB');assert.strictEqual(z.contactTitle,'GĐ');
// 3 draft scope
assert.strictEqual(code(()=>ctx.paymentSave_(Object.assign({},sc,{perms:null}),{requestId:'d',payload:{id:'pay2',direction:'IN',partnerId:'p1'}})),'NOT_FOUND','nháp thanh toán của đối tác ngoài phạm vi');
assert.strictEqual(code(()=>ctx.orderSave_(sc,{requestId:'e',payload:{id:'o1',customerPartnerId:'p1'}})),'NOT_FOUND','đơn ngoài phạm vi');
// 6 pass-through VAT
const r=ctx.calcLine_({feeTypeCode:'F',description:'chi hộ',netMinor:1000,vatMode:'EXCLUSIVE',vatRateBp:1000,isPassThrough:1},0,false);
assert.ok(r.errors.some(e=>e.code==='PASS_THROUGH_VAT'));
assert.strictEqual(ctx.calcLine_({feeTypeCode:'F',description:'chi hộ',netMinor:1000,vatMode:'NONE',isPassThrough:1},0,false).errors.length,0);
assert.strictEqual(ctx.calcLine_({feeTypeCode:'F',description:'phí',netMinor:1000,vatMode:'EXCLUSIVE',vatRateBp:1000,isPassThrough:0},0,false).errors.length,0);
// 5 period
const ap={id:'a',email:'a@x',role:'APPROVER',scope:{allPartners:true}};
assert.strictEqual(code(()=>ctx.periodClose_(ap,{requestId:'f',payload:{id:'2027-03'}})),'VALIDATION_FAILED','tương lai');
ctx.ledgerStart_=()=>'2026-01-01';
assert.strictEqual(code(()=>ctx.periodClose_(ap,{requestId:'f',payload:{id:'2025-12'}})),'VALIDATION_FAILED','trước đầu sổ');
console.log('OK fix.test');
