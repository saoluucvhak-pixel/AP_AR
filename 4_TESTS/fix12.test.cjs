const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){if(process.env.DBG)console.log(e.message);return e.code||e.message}};
const cat=(id,type,c,act)=>({id,catalogType:type,code:c,name:c,attrsJson:'{}',active:act===undefined?1:act,sortOrder:1,version:1});
const O=(id,o)=>Object.assign({id,orderNo:'DH-'+id,poNo:'P'+id,customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-05-10',status:'OPEN',version:1},o);
const T={Catalog:[cat('c1','CURRENCY','VND'),cat('s1','SERVICE_CODE','FWD'),cat('s2','SERVICE_CODE','OLD',0)],
 Partner:[{id:'p1',shortName:'ABC',legalName:'A',isCustomer:1,status:'ACTIVE',scopeTags:'t1'},{id:'p2',shortName:'XYZ',legalName:'X',isCustomer:1,status:'ACTIVE',scopeTags:'t2'},{id:'p3',shortName:'--',legalName:'Z',isCustomer:1,status:'ACTIVE',scopeTags:'t1'}],
 Order:[O('1',{}),O('2',{}),O('3',{servicesJson:JSON.stringify([{code:'FWD',hsdvNo:'GML/FWD/ABC-26/001'}])}),O('4',{customerPartnerId:'p2'}),O('5',{status:'CANCELLED'}),O('6',{customerPartnerId:'p3'})],
 Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],ImportBatch:[],Followup:[],Period:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();ctx.repoCommitted_=ctx.repoValid_;const cfg={};
ctx.runTx_=(u,m,b)=>b({find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),insert:(t,o)=>{T[t].push(o);return o},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:k=>(cfg[k]=(cfg[k]||0)+1)}).result;
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
const sc={id:'s',email:'s@x.vn',role:'APPROVER',scope:{partnerTags:['t1']}};
const call=(u,p)=>ctx.orderAssignService_(u,{requestId:'r'+Math.random(),payload:p});
// bộ lọc
const miss=ctx.orderList_(ap,{payload:{onlyMissingService:true,pageSize:50}}).items.map(x=>x.id).sort();assert.strictEqual(miss.join(),'1,2,4,5,6');
// validate
assert.strictEqual(code(()=>call(ap,{orderIds:[],serviceCode:'FWD'})),'VALIDATION_FAILED');
assert.strictEqual(code(()=>call(ap,{orderIds:['1'],serviceCode:'OLD'})),'VALIDATION_FAILED','mã ngừng dùng');
assert.strictEqual(code(()=>call(ap,{orderIds:['1'],serviceCode:'NOPE'})),'VALIDATION_FAILED');
const r=call(sc,{orderIds:['1','2','3','4','5','6','zz'],serviceCode:'fwd'});
assert.strictEqual(r.assigned.map(x=>x.id).join(),'1,2','chỉ PO trong phạm vi, chưa có mã, chưa hủy, khách có tên viết tắt');
assert.strictEqual(r.assigned.map(x=>x.hsdvNo).join(),'GML/FWD/ABC-26/002,GML/FWD/ABC-26/003','tránh trùng số 001 đã dùng ở PO 3');
const why=r.skipped.map(x=>x.id+':'+x.reason).join('|');
assert.ok(/3:PO đã có mã/.test(why)&&/4:Không tìm thấy PO/.test(why)&&/5:PO đã hủy/.test(why)&&/6:Thiếu/.test(why)&&/zz:Không tìm thấy/.test(why),why);
assert.strictEqual(T.Order[0].serviceCode,'FWD');assert.strictEqual(ctx.orderServices_(T.Order[1])[0].code,'FWD');assert.strictEqual(T.Order[3].serviceCode,undefined,'PO ngoài phạm vi không bị đổi');
// còn thiếu mã sau khi gán
assert.strictEqual(ctx.orderList_(ap,{payload:{onlyMissingService:true,pageSize:50}}).items.map(x=>x.id).sort().join(),'4,5,6');
// chỉ báo chất lượng
const q=ctx.dashboardSummaryLive_(ap,{payload:{asOf:'2026-10-25'}}).quality;assert.strictEqual(q.ordersNoService,2,'chỉ PO đang mở (4,6), không tính PO hủy');
const q2=ctx.dashboardSummaryLive_(sc,{payload:{asOf:'2026-10-25'}}).quality;assert.strictEqual(q2.ordersNoService,1,'phạm vi t1: chỉ PO 6');
const J=x=>JSON.stringify(x);
for(const u of [ap,sc]){const q1=ctx.dashboardSummaryLive_(u,{payload:{asOf:'2026-10-25'}}).quality,w=ctx.workbenchSummaryLive_(u,{payload:{asOf:'2026-10-25'}});assert.strictEqual(J(w.quality),J(q1),'workbench.summary trả đúng cùng chỉ số chất lượng');assert.ok(!('sections' in w)&&!('trend' in w));assert.ok(ctx.routes_()['workbench.summary']);}
assert.strictEqual(ctx.workbenchSummaryLive_(ap,{payload:{asOf:'2025-01-01'}}).noHistory,true);
console.log('OK fix12');
