const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){if(process.env.DBG)console.log(e.message);return e.code||e.message}};
const cat=(id,type,c)=>({id,catalogType:type,code:c,name:c,attrsJson:'{}',active:1,sortOrder:1,version:1});
const T={Catalog:[{id:'c1',catalogType:'CURRENCY',code:'VND',attrsJson:'{"decimals":0}',active:1},cat('c2','BUSINESS_GROUP','G1'),cat('c3','SERVICE_CODE','FWD'),cat('c4','SERVICE_CODE','CBT'),cat('f','FEE_TYPE','F')],
 Partner:[{id:'p1',shortName:'Yuanda Đà Nẵng',legalName:'Y',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:''},{id:'p2',shortName:'ABC',legalName:'A',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:''},{id:'p3',shortName:'---',legalName:'B',isCustomer:1,isSupplier:0,status:'ACTIVE',scopeTags:'',taxCode:''}],
 Order:[],Accrual:[],AccrualSplit:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const cfg={};
ctx.runTx_=(u,m,b)=>{const tx={now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{const r=Object.assign({id:t+((T[t]||[]).length+1),version:1},o);(T[t]=T[t]||[]).push(r);return r},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:k=>(cfg[k]=(cfg[k]||0)+1)};return b(tx).result};
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
const P=(o)=>Object.assign({customerPartnerId:'p1',poNo:'PO',orderDate:'2026-10-10',businessGroupCode:'G1',currency:'VND',serviceCode:'FWD'},o);
const save=(o)=>ctx.orderSave_(ap,{requestId:'r'+Math.random(),payload:o});
const r1=save(P({}));assert.strictEqual(r1.hsdvNo,'GML/FWD/YUANDADANANG-26/001');
assert.strictEqual(save(P({poNo:'PO2'})).hsdvNo,'GML/FWD/YUANDADANANG-26/002','PO thứ hai cùng khách+mã+năm');
assert.strictEqual(save(P({serviceCode:'CBT'})).hsdvNo,'GML/CBT/YUANDADANANG-26/001','đếm riêng theo mã dịch vụ');
assert.strictEqual(save(P({customerPartnerId:'p2'})).hsdvNo,'GML/FWD/ABC-26/001','đếm riêng theo khách');
assert.strictEqual(save(P({orderDate:'2027-01-05'})).hsdvNo,'GML/FWD/YUANDADANANG-27/001','sang năm bắt đầu lại');
// sửa: giữ số, khóa các trường đã cấp số
const o1=T.Order[0];
assert.strictEqual(save(P({id:o1.id,note:'sửa ghi chú',poNo:'PO-moi'})).hsdvNo,o1.hsdvNo);assert.strictEqual(T.Order[0].hsdvNo,'GML/FWD/YUANDADANANG-26/001');
assert.strictEqual(code(()=>save(P({id:o1.id,customerPartnerId:'p2'}))),'HSDV_LOCKED');
assert.strictEqual(code(()=>save(P({id:o1.id,orderDate:'2027-02-01'}))),'HSDV_LOCKED');
assert.strictEqual(save(P({id:o1.id,orderDate:'2026-12-31'})).hsdvNo,o1.hsdvNo,'đổi ngày trong cùng năm được');
// đơn cũ chưa có số -> cấp khi sửa
T.Order.push({id:'old',orderNo:'DH-OLD',customerPartnerId:'p2',poNo:'X',orderDate:'2026-03-01',businessGroupCode:'G1',currency:'VND',serviceCode:'',status:'OPEN',version:1});
assert.strictEqual(save(P({id:'old',customerPartnerId:'p2'})).hsdvNo,'GML/FWD/ABC-26/002');
// tên viết tắt không hợp lệ
assert.strictEqual(code(()=>save(P({customerPartnerId:'p3'}))),'VALIDATION_FAILED');
// bulk
const row={customer:'ABC',poNo:'PB1',date:'2026-10-11',group:'G1',currency:'VND',serviceCode:'FWD',feeType:'F',description:'x',netText:'1000',vat:'KCT'};
const pv=ctx.orderBulkPreview_(ap,{payload:{kind:'REVENUE',rows:[row,Object.assign({},row,{poNo:'PB2'})]}});assert.strictEqual(pv.errors,0);assert.strictEqual(pv.created.orders,2);
ctx.orderBulkCommit_(ap,{requestId:'b1',payload:{kind:'REVENUE',rows:[row,Object.assign({},row,{poNo:'PB2'})]}});
const nb=T.Order.filter(o=>o.note==='Nhập hàng loạt').map(o=>o.hsdvNo);assert.deepStrictEqual(nb,['GML/FWD/ABC-26/003','GML/FWD/ABC-26/004']);
// danh sách có số + tìm
const out=ctx.orderOut_(T.Order[0],{pm:{p1:T.Partner[0]},accByOrder:{}});assert.strictEqual(out.hsdvNo,'GML/FWD/YUANDADANANG-26/001');
console.log('OK fix8');
