const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){if(process.env.DBG)console.log(e.message,JSON.stringify(e.fields));return e.code||e.message}};
const cat=(id,type,c,a,act)=>({id,catalogType:type,code:c,name:c+' tên',attrsJson:JSON.stringify(a||{}),active:act===undefined?1:act,sortOrder:1,version:1});
const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','BUSINESS_GROUP','G1'),cat('c3','SERVICE_CODE','DV01'),cat('c4','SERVICE_CODE','DV02',{},0),cat('f','FEE_TYPE','F')],
 Partner:[{id:'p1',shortName:'KH',legalName:'KH Co',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:''}],Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const mk=env=>({now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{const r=Object.assign({id:t+((T[t]||[]).length+1),version:1},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:()=>1});
ctx.runTx_=(u,m,b)=>b(mk()).result;
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
const base={customerPartnerId:'p1',poNo:'PO1',orderDate:'2026-10-10',businessGroupCode:'G1',currency:'VND'};
assert.strictEqual(code(()=>ctx.orderSave_(ap,{requestId:'1',payload:base})),'VALIDATION_FAILED','bắt buộc mã dịch vụ');
assert.strictEqual(code(()=>ctx.orderSave_(ap,{requestId:'1',payload:Object.assign({serviceCode:'XX'},base)})),'VALIDATION_FAILED','mã lạ');
assert.strictEqual(code(()=>ctx.orderSave_(ap,{requestId:'1',payload:Object.assign({serviceCode:'DV02'},base)})),'VALIDATION_FAILED','mã ngừng dùng');
assert.strictEqual(code(()=>ctx.orderSave_(ap,{requestId:'1',payload:Object.assign({serviceCode:'dv01'},base)})),'OK');
assert.strictEqual(T.Order[0].serviceCode,'DV01');
const o=ctx.orderOut_(T.Order[0],{pm:{p1:T.Partner[0]},accByOrder:{}});assert.strictEqual(o.serviceCode,'DV01');assert.ok(/DV01/.test(o.serviceName));assert.ok(!('hsdv' in o));
// catalog khóa mã khi đã dùng
assert.strictEqual(code(()=>ctx.catalogSave_(ap,{requestId:'c',payload:{id:'c3',catalogType:'SERVICE_CODE',code:'DV09',name:'x',attrs:{}}})),'IN_USE');
assert.strictEqual(code(()=>ctx.catalogSave_(ap,{requestId:'c',payload:{catalogType:'SERVICE_CODE',code:'DV03',name:'Mới',attrs:{}}})),'OK');
// bulk
const prev=(rows)=>ctx.orderBulkPreview_(ap,{payload:{kind:'REVENUE',rows}});
const row=(sc)=>({customer:'KH',poNo:'PO9',date:'2026-10-11',group:'G1',currency:'VND',serviceCode:sc,feeType:'F',description:'x',netText:'1000',vat:'KCT'});
assert.strictEqual(prev([row('')]).rows[0].ok,false);assert.strictEqual(prev([row('NOPE')]).rows[0].ok,false);
const okp=prev([row('DV01'),row('DV01')]);assert.strictEqual(okp.errors,0);assert.strictEqual(okp.created.orders,1,'gom cùng khách+PO+mã');
// hóa đơn từ khoản: dòng mang mã
const ord=T.Order[0];T.Accrual.push({id:'a1',orderId:ord.id,kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-11',feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',vatRateBp:null,vatMinor:0,grossMinor:1000,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',version:1});
ctx.accrualInvoice_(ap,{requestId:'i',payload:{accrualIds:['a1'],invoiceNo:'X1',invoiceDate:'2026-10-12',docDate:'2026-10-12'}});
assert.strictEqual(T.DebtLine[0].serviceCode,'DV01');
// dòng thủ công: mã lạ bị từ chối
const env=ctx.docEnv_(mk(),'p1');const v=ctx.validateDocInput_({direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-10-12',invoiceNo:'A',lines:[{feeTypeCode:'F',description:'d',netMinor:5,vatMode:'NONE',serviceCode:'NOPE'}]},env);
assert.ok(v.errors.some(e=>/serviceCode/.test(e.path)));
// dư đầu kỳ
const oenv=ctx.openingEnv_();assert.ok(ctx.validateOpeningRow_({kind:'AR',partnerId:'p1',businessGroupCode:'G1',currency:'VND',amountMinor:5,serviceCode:'NOPE'},oenv).some(i=>i.code==='SERVICE_CODE_UNKNOWN'));
assert.strictEqual(ctx.validateOpeningRow_({kind:'AR',partnerId:'p1',businessGroupCode:'G1',currency:'VND',amountMinor:5,serviceCode:'DV01'},oenv).length,0);
// bootstrap
const b=ctx.appBootstrap_(ap,{});assert.ok(b.catalogs.serviceCodes.some(c=>c.code==='DV01')&&!b.catalogs.serviceCodes.some(c=>c.code==='DV02'));
console.log('OK fix6');
