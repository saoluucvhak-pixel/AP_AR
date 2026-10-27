const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){if(process.env.DBG)console.log(e.message);return e.code||e.message}};
const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c+' tên',attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
const sv=JSON.stringify([{code:'FWD',hsdvNo:'GML/FWD/ABC-26/001'},{code:'CBT',hsdvNo:'GML/CBT/ABC-26/001'}]);
const ac=(id,kind,net,svc,o)=>Object.assign({id,orderId:'o1',kind,partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:'x',netMinor:net,vatMode:'NONE',vatMinor:0,grossMinor:net,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:svc,version:1},o||{});
const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','BUSINESS_GROUP','G1'),cat('s1','SERVICE_CODE','FWD',{department:'Forwarding'}),cat('s2','SERVICE_CODE','CBT',{department:'Vận tải xuyên biên giới'}),cat('f','FEE_TYPE','F')],
 Partner:[{id:'p1',shortName:'ABC',legalName:'A',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:''}],
 Order:[{id:'o1',orderNo:'DH-1',poNo:'PO1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-01',status:'OPEN',servicesJson:sv,serviceCode:'FWD',hsdvNo:'GML/FWD/ABC-26/001',version:1}],
 Accrual:[ac('a1','REVENUE',1000,'FWD'),ac('a2','COST',400,'FWD'),ac('a3','REVENUE',500,'CBT'),ac('a4','COST',100,'CBT'),ac('a5','COST',50,'')],AccrualSplit:[],DebtDoc:[],DebtLine:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();ctx.repoCommitted_=ctx.repoValid_;
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
// danh mục: bộ phận thực hiện
ctx.runTx_=(u,m,b)=>b({find:(t,id)=>T[t].find(x=>x.id===id),rows:t=>T[t].slice(),insert:(t,o)=>{T[t].push(o);return o},update:(t,id,p)=>{const r=T[t].find(x=>x.id===id);Object.assign(r,p);return r},nextSeq:()=>1}).result;
assert.strictEqual(code(()=>ctx.catalogSave_(ap,{requestId:'c',payload:{catalogType:'SERVICE_CODE',code:'TRD',name:'Trading',attrs:{department:'  Trading  ',junk:'x'}}})),'OK');
const t=T.Catalog.find(c=>c.code==='TRD');assert.strictEqual(JSON.stringify(JSON.parse(t.attrsJson)),JSON.stringify({department:'Trading'}));
const b=ctx.appBootstrap_(ap,{});assert.strictEqual(b.catalogs.serviceCodes.find(c=>c.code==='FWD').department,'Forwarding');
// R09 tách theo mã
const rep=ctx.rep09_(ap,'R09',{asOf:'2026-10-25'});
const data=rep.rows.filter(r=>r.t==='data').map(r=>r.cells);
const fwd=data.find(r=>r.svc==='FWD'),cbt=data.find(r=>r.svc==='CBT'),un=data.find(r=>r.svc==='(chưa gắn mã)');
assert.ok(fwd&&cbt&&un);assert.strictEqual(fwd.rev,1000);assert.strictEqual(fwd.cost,400);assert.strictEqual(fwd.margin,600);assert.strictEqual(fwd.hsdv,'GML/FWD/ABC-26/001');assert.strictEqual(fwd.dept,'Forwarding');
assert.strictEqual(cbt.rev,500);assert.strictEqual(cbt.cost,100);assert.strictEqual(cbt.dept,'Vận tải xuyên biên giới');
assert.strictEqual(un.cost,50);assert.strictEqual(un.margin,-50);
const tot=rep.rows.filter(r=>r.t==='total')[0].cells;assert.strictEqual(tot.rev,1500);assert.strictEqual(tot.cost,550);assert.strictEqual(tot.margin,950);
const sub=rep.rows.filter(r=>r.t==='subtotal').map(r=>r.cells);const sf=sub.find(r=>r.svc==='FWD');assert.strictEqual(sf.margin,600);assert.strictEqual(sub.find(r=>r.svc==='—').cost,50);
assert.strictEqual(sub.reduce((s,r)=>s+r.margin,0),tot.margin,'tổng hợp theo mã = tổng chung');
// danh sách chi phí có số HSDV + bộ phận
const L=ctx.accrualList_(ap,{payload:{kind:'COST'}}).items;const a2=L.find(x=>x.id==='a2');assert.strictEqual(a2.serviceCode,'FWD');assert.strictEqual(a2.hsdvNo,'GML/FWD/ABC-26/001');assert.strictEqual(a2.department,'Forwarding');
const g=ctx.orderGet_(ap,{payload:{id:'o1'}});assert.strictEqual(g.accruals.find(x=>x.id==='a4').hsdvNo,'GML/CBT/ABC-26/001');assert.strictEqual(g.order.services[1].department,'Vận tải xuyên biên giới');
console.log('OK fix11');
