const vm=require('vm'),fs=require('fs'),assert=require('assert');
const props={};const sheets={};// id -> {name->sheetObj}
function makeSheet(){const rows=[];const sh={rows,getLastRow:()=>rows.length,getMaxRows:()=>Math.max(rows.length,1000),setName(n){sh.name=n},getRange(r,c,nr,nc){return{getValues:()=>rows.slice(r-1,r-1+nr).map(x=>x.slice(0,nc)),setValues:v=>{v.forEach((row,i)=>{rows[r-1+i]=row.slice()})},getValue:()=>(rows[r-1]||[])[c-1],setNumberFormat(){}}},deleteRows(r,n){rows.splice(r-1,n)},setFrozenRows(){}};return sh}
let created=0;
const SS={create:name=>{const id='ss'+(++created);const sh=makeSheet();sheets[id]={sheets:[sh],name};return {getId:()=>id,getSheets:()=>sheets[id].sheets,getSheetByName:n=>sheets[id].sheets.find(x=>x.name===n)||null}},openById:id=>({getId:()=>id,getSheets:()=>sheets[id].sheets,getSheetByName:n=>sheets[id].sheets.find(x=>x.name===n)||null}),flush(){}};
const ctx=vm.createContext({console,Logger:{log(){}},SpreadsheetApp:SS,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in props?props[k]:null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]},getProperties:()=>props})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
// DB giả
const mainSh={tx:makeSheet(),au:makeSheet()};mainSh.tx.name='SysTx';mainSh.au.name='AuditLog';
ctx.openDb_=kind=>({getSheetByName:n=>n==='SysTx'?mainSh.tx:n==='AuditLog'?mainSh.au:null});
ctx.repoReadAll_=()=>[];ctx.cfgGet_=(k,d)=>d;let hdrChecks=0;ctx.repoSheet_=(t,f)=>{if(f)hdrChecks++};
const old=new Date(Date.now()-200*86400000).toISOString(),old2=new Date(Date.now()-120*86400000).toISOString(),recent=new Date(Date.now()-5*86400000).toISOString(),ancient=new Date(Date.now()-900*86400000).toISOString();
// SysTx: id,requestId,action,actor,payloadHash,status,startedAt,...
const tx=(id,st,at)=>[id,'r'+id,'a','u','h',st,at,'','','','','',];
[tx('t1','FINALIZED',old),tx('t2','ROLLED_BACK',old2),tx('t3','PENDING',old2),tx('t4','FINALIZED',old),tx('t5','FINALIZED',recent)].forEach(r=>mainSh.tx.rows.push(r));
mainSh.tx.rows.unshift(['id','requestId','action','actor','payloadHash','status','startedAt']);
const au=(id,at)=>[id,at,'u','e','act','T','e','{}','tx','rq','OK',''];
mainSh.au.rows.push(['id','at'],au('a1',ancient),au('a2',ancient),au('a3',recent));
const r=ctx.archiveOldData();
assert.strictEqual(r.results[0].archived,2,'SysTx: chỉ phần đầu liên tiếp đủ điều kiện (t1,t2) – dừng ở t3 PENDING');
assert.strictEqual(mainSh.tx.rows.map(x=>x[0]).join(),'id,t3,t4,t5');
assert.strictEqual(r.results[1].archived,2);assert.strictEqual(mainSh.au.rows.map(x=>x[0]).join(),'id,a3');
// kho lưu trữ có đúng dữ liệu, có tiêu đề
const archTx=Object.values(sheets).find(s=>s.name.startsWith('CONGNO_ARCHIVE_SysTx'));assert.ok(archTx);const as=archTx.sheets[0];assert.strictEqual(as.name,'SysTx');assert.strictEqual(as.rows[0][0],'id');assert.strictEqual(as.rows.slice(1).map(x=>x[0]).join(),'t1,t2');
// chạy lại không làm gì thêm
assert.strictEqual(ctx.archiveOldData().results[0].archived,0);assert.strictEqual(ctx.archiveOldData().results[1].archived,0);
// sự cố giữa chừng: đã chép nhưng chưa xóa -> lần sau chỉ xóa, không chép trùng
mainSh.tx.rows.splice(1,0,tx('t0','FINALIZED',old));
const origDel=mainSh.tx.deleteRows;mainSh.tx.deleteRows=()=>{throw new Error('mất kết nối')};
assert.throws(()=>ctx.archiveOldData(),/mất kết nối/);assert.ok(props['ARCH_PENDING_SysTx']);
const archRows1=as.rows.length;mainSh.tx.deleteRows=origDel;
const r2=ctx.archiveOldData();assert.strictEqual(r2.results[0].archived,1);assert.strictEqual(as.rows.length,archRows1,'không chép trùng');assert.ok(!props['ARCH_PENDING_SysTx']);assert.strictEqual(mainSh.tx.rows.map(x=>x[0]).join(),'id,t3,t4,t5');
// kiểm tra bản lưu không khớp -> không xóa nguồn
mainSh.tx.rows.splice(1,0,tx('t00','FINALIZED',old));const before=mainSh.tx.rows.length;
const gv=as.getRange;as.getRange=(r_,c,nr,nc)=>{const g=gv(r_,c,nr,nc);return Object.assign({},g,{getValue:()=>'SAI'})};
assert.throws(()=>ctx.archiveOldData(),/không khớp/);assert.ok(!props['ARCH_PENDING_SysTx'],'lỗi kiểm tra: không để lại dấu đã chép');assert.strictEqual(mainSh.tx.rows.length,before,'dữ liệu gốc còn nguyên');
assert.ok(hdrChecks>=2,'lưu trữ kiểm tiêu đề thật trước khi xóa');console.log('OK archive');
