const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const assertJ=(a,b)=>assert.strictEqual(JSON.stringify(a),JSON.stringify(b));
const code=f=>{try{f();return 'OK'}catch(e){if(process.env.DBG)console.log(e.message,JSON.stringify(e.fields));return e.code||e.message}};
const cat=(id,type,c,act)=>({id,catalogType:type,code:c,name:c,attrsJson:'{}',active:act===undefined?1:act,sortOrder:1,version:1});
const T={Catalog:[{id:'c1',catalogType:'CURRENCY',code:'VND',attrsJson:'{"decimals":0}',active:1},cat('c2','BUSINESS_GROUP','G1'),cat('s1','SERVICE_CODE','FWD'),cat('s2','SERVICE_CODE','CBT'),cat('s3','SERVICE_CODE','TRD'),cat('f','FEE_TYPE','F')],
 Partner:[{id:'p1',shortName:'ABC',legalName:'A',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:''},{id:'p9',shortName:'NCC',legalName:'N',isCustomer:0,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:''}],
 Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();const cfg={};
ctx.runTx_=(u,m,b)=>{const tx={now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{const r=Object.assign({id:t+((T[t]||[]).length+1),version:1},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:k=>(cfg[k]=(cfg[k]||0)+1)};return b(tx).result};
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
const P=(o)=>Object.assign({customerPartnerId:'p1',poNo:'PO1',orderDate:'2026-10-10',businessGroupCode:'G1',currency:'VND',serviceCodes:['FWD','CBT']},o);
const save=(o)=>ctx.orderSave_(ap,{requestId:'r'+Math.random(),payload:o});
// PO nhiều mã: mỗi mã một số HSDV
const r=save(P({}));assertJ(r.services.map(x=>x.hsdvNo),['GML/FWD/ABC-26/001','GML/CBT/ABC-26/001']);
const o=T.Order[0];assert.strictEqual(o.serviceCode,'FWD');assert.strictEqual(ctx.orderServices_(o).length,2);
const out=ctx.orderOut_(o,{pm:{p1:T.Partner[0]},accByOrder:{}});assert.strictEqual(out.services.length,2);assert.strictEqual(out.hsdvNo,'GML/FWD/ABC-26/001, GML/CBT/ABC-26/001');
// bắt buộc >=1, tối đa 10, trùng được gộp
assert.strictEqual(code(()=>save(P({serviceCodes:[]}))),'VALIDATION_FAILED');
assert.strictEqual(code(()=>save(P({poNo:'X',serviceCodes:['FWD','fwd']}))),'OK');assert.strictEqual(ctx.orderServices_(T.Order[1]).length,1);
// thêm mã vào PO có sẵn: số cũ giữ, số mới cấp
save(P({id:o.id,serviceCodes:['FWD','CBT','TRD']}));assertJ(ctx.orderServices_(T.Order[0]).map(x=>x.hsdvNo),['GML/FWD/ABC-26/001','GML/CBT/ABC-26/001','GML/TRD/ABC-26/001']);
// khoản: PO nhiều mã bắt buộc chọn mã thuộc PO
const acc=(s)=>({orderId:o.id,kind:'REVENUE',partnerId:'p1',currency:'VND',accrualDate:'2026-10-11',feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',serviceCode:s});
const asave=(p)=>ctx.accrualSave_(ap,{requestId:'q'+Math.random(),payload:p});
assert.strictEqual(code(()=>asave(acc(''))),'VALIDATION_FAILED','nhiều mã -> phải chọn');
assert.strictEqual(code(()=>asave(acc('XYZ'))),'VALIDATION_FAILED');
assert.strictEqual(code(()=>asave(acc('cbt'))),'OK');assert.strictEqual(T.Accrual[0].serviceCode,'CBT');
// PO một mã: tự điền
save(P({poNo:'ONE',serviceCodes:['TRD']}));const one=T.Order[T.Order.length-1];
assert.strictEqual(code(()=>asave(Object.assign(acc(''),{orderId:one.id}))),'OK');assert.strictEqual(T.Accrual[1].serviceCode,'TRD');
// không bỏ mã đã có khoản
assert.strictEqual(code(()=>save(P({id:o.id,serviceCodes:['FWD','TRD']}))),'VALIDATION_FAILED','CBT đã có khoản');
assert.strictEqual(code(()=>save(P({id:o.id,serviceCodes:['FWD','CBT']}))),'OK','bỏ TRD (chưa dùng) được');
// danh mục: mã đã dùng bị khóa đổi
assert.strictEqual(code(()=>ctx.catalogSave_(ap,{requestId:'c',payload:{id:'s3',catalogType:'SERVICE_CODE',code:'TRD2',name:'x',attrs:{}}})),'IN_USE');
assert.strictEqual(code(()=>ctx.catalogSave_(ap,{requestId:'c',payload:{id:'s2',catalogType:'SERVICE_CODE',code:'CBT',name:'tên mới',attrs:{}}})),'OK');
// hóa đơn: dòng mang mã của khoản
ctx.accrualInvoice_(ap,{requestId:'i',payload:{accrualIds:[T.Accrual[0].id],invoiceNo:'X1',invoiceDate:'2026-10-12',docDate:'2026-10-12'}});assert.strictEqual(T.DebtLine[0].serviceCode,'CBT');
// bulk: nhiều mã cùng PO
const row=(po,sc)=>({customer:'ABC',poNo:po,date:'2026-10-11',group:'G1',currency:'VND',serviceCode:sc,feeType:'F',description:'x',netText:'1000',vat:'KCT'});
const rows=[row('PB1','FWD'),row('PB1','CBT'),row('PB1','FWD'),row('PB2','TRD')];
const pv=ctx.orderBulkPreview_(ap,{payload:{kind:'REVENUE',rows}});assert.strictEqual(pv.errors,0);assert.strictEqual(pv.created.orders,2,'PB1 gom 3 dòng vào 1 đơn');
const n0=T.Order.length;ctx.orderBulkCommit_(ap,{requestId:'b',payload:{kind:'REVENUE',rows}});
const pb1=T.Order.slice(n0).find(x=>x.poNo==='PB1');assertJ(ctx.orderServices_(pb1).map(x=>x.code),['FWD','CBT']);
const codesAcc=T.Accrual.filter(a=>a.orderId===pb1.id).map(a=>a.serviceCode);assertJ(codesAcc,['FWD','CBT','FWD']);
// bulk vào PO có sẵn: thêm mã mới (đơn đã lưu trong DB)
const rows2=[row('PO1','TRD')];const pv2=ctx.orderBulkPreview_(ap,{payload:{kind:'REVENUE',rows:rows2}});assert.strictEqual(pv2.errors,0);assert.strictEqual(pv2.created.orders,0);
ctx.orderBulkCommit_(ap,{requestId:'b2',payload:{kind:'REVENUE',rows:rows2}});assert.ok(ctx.orderServices_(T.Order[0]).some(x=>x.code==='TRD'));
// bulk chi phí: PO nhiều mã cần cột Mã dịch vụ
const crow=(sc)=>({orderRef:o.orderNo,supplier:'NCC',poRef:'',date:'2026-10-12',feeType:'F',description:'c',netText:'500',vat:'KCT',currency:'VND',serviceCode:sc});
assert.strictEqual(ctx.orderBulkPreview_(ap,{payload:{kind:'COST',rows:[crow('')]}}).errors,1);
assert.strictEqual(ctx.orderBulkPreview_(ap,{payload:{kind:'COST',rows:[crow('FWD')]}}).errors,0);
console.log('OK fix10');
