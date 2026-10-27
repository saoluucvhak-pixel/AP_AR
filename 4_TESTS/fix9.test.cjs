const vm=require('vm'),fs=require('fs'),assert=require('assert');
const props={OPEN_TX:'{}'};
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]||null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const T={DebtDoc:[],Payment:[],ImportBatch:[],Period:[{id:'2026-01',status:'CLOSED'},{id:'2026-02',status:'REOPENED'}],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const item=(id,c)=>ctx.periodChecklist_(id).find(x=>x.code===c);
assert.strictEqual(item('2026-01','PRIOR_OPEN').ok,true,'tháng đầu sổ không có kỳ trước');
let p=item('2026-04','PRIOR_OPEN');assert.strictEqual(p.ok,false);assert.ok(/2026-02/.test(p.message),'chỉ ra kỳ mở sớm nhất (REOPENED tính là chưa khóa)');
T.Period[1].status='CLOSED';p=item('2026-03','PRIOR_OPEN');assert.strictEqual(p.ok,true);
p=item('2026-04','PRIOR_OPEN');assert.strictEqual(p.ok,false);assert.ok(/2026-03/.test(p.message),'tháng 3 chưa có bản ghi = chưa khóa');
assert.strictEqual(item('2026-01','OPENING_PENDING').ok,true,'chưa có lô dư đầu kỳ thì không chặn');
T.ImportBatch.push({id:'b',mode:'OPENING',status:'SUBMITTED'});assert.strictEqual(item('2026-01','OPENING_PENDING').ok,false);
T.ImportBatch[0].status='COMMITTED';assert.strictEqual(item('2026-01','OPENING_PENDING').ok,true);
// periodClose_ bị chặn khi còn kỳ trước
const ap={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
ctx.runTx_=(u,m,b)=>b({find:()=>null,insert:(t,o)=>o,update(){},rows:()=>[]}).result;
ctx.todayVn_=()=>'2026-10-25';
let e;try{ctx.periodClose_(ap,{requestId:'x',payload:{id:'2026-06'}})}catch(x){e=x}
assert.strictEqual(e&&e.code,'PERIOD_CHECK_FAILED');assert.ok(/2026-03/.test(e.message));
console.log('OK fix9');
