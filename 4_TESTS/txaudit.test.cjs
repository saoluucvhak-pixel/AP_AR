// Giao dịch + nhật ký: dừng thực thi tại từng bước rồi phục hồi; nhật ký không mất, không trùng. Dùng Sheet/Cache/Lock giả (KHÔNG phải Apps Script thật).
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const props={DB_MAIN_ID:'main',DB_AUDIT_ID:'aud',ENV:'TEST'};const cache={};
function mkSheet(name){const g={};const sh={name,cells:g,maxCols:200,maxRows:5000,failSet:false,
 getLastRow(){let m=0;Object.keys(g).forEach(k=>{const r=+k.split(',')[0];if(g[k]!==''&&g[k]!==undefined&&r>m)m=r});return m},getMaxRows(){return sh.maxRows},getMaxColumns(){return sh.maxCols},insertColumnsAfter(c,n){sh.maxCols+=n},setFrozenRows(){},
 getRange(r,c,nr=1,nc=1){return{getValues:()=>{const o=[];for(let i=0;i<nr;i++){const row=[];for(let j=0;j<nc;j++){const v=g[(r+i)+','+(c+j)];row.push(v===undefined?'':v)}o.push(row)}return o},
  getValue:()=>{const v=g[r+','+c];return v===undefined?'':v},
  setValues:v=>{if(sh.failSet)throw new Error('SHEET_WRITE_FAIL');v.forEach((row,i)=>row.forEach((x,j)=>{g[(r+i)+','+(c+j)]=x}))},setValue:x=>{if(sh.failSet)throw new Error('SHEET_WRITE_FAIL');g[r+','+c]=x},setNumberFormat(){},
  createTextFinder:val=>{let ent=false;const f={matchEntireCell:()=>{ent=true;return f},matchCase:()=>f,useRegularExpression:()=>f,findAll:()=>{const out=[];for(let i=0;i<nr;i++)for(let j=0;j<nc;j++){const v=g[(r+i)+','+(c+j)];if(v!==undefined&&(ent?String(v)===val:String(v).includes(val)))out.push({getRow:()=>r+i})}return out}};return f}}}};return sh}
const dbs={main:{},aud:{}};
const SS={openById:id=>({getSheetByName:n=>dbs[id][n]||null,insertSheet:n=>(dbs[id][n]=mkSheet(n)),getSheets:()=>Object.values(dbs[id])}),flush(){}};
const ctx=vm.createContext({console:{log(){},warn(){},error(){}},Logger:{log(){}},SpreadsheetApp:SS,MailApp:{sendEmail(){}},Utilities:{getUuid:()=>'u'+Math.random().toString(16).slice(2),formatDate:()=>'2026-10-25',computeDigest:()=>[1,2,3],DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1}},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},CacheService:{getScriptCache:()=>({get:k=>cache[k]||null,put:(k,v)=>{cache[k]=v},remove:k=>{delete cache[k]}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in props?props[k]:null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})}});
vm.runInContext(fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8'),ctx);
ctx.sha256Hex_=s=>String(s).length+':'+String(s).slice(0,40);
const user={id:'u1',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
const rows=(db,t)=>{const s=dbs[db][t];if(!s)return[];const cols=ctx.parseCols_(t),out=[];for(let r=2;r<=s.getLastRow();r++){const o={};cols.forEach((c,i)=>{o[c.name]=s.cells[r+','+(i+1)]});out.push(o)}return out};
const tx=(reqId,failAt,name)=>{try{return {ok:true,r:ctx.runTx_(user,{requestId:reqId,action:'test.save',payload:{n:name},failAt},t=>{const row=t.insert('Partner',{shortName:name,legalName:name,isCustomer:1,isSupplier:0,status:'ACTIVE'});return {result:{id:row.id},audit:[{entityType:'Partner',entityId:row.id,action:'partner.create',diff:{name}}]}})}}catch(e){return {ok:false,e}}};
const audits=txId=>rows('aud','AuditLog').filter(a=>a.txId===txId);
const sysOf=req=>rows('main','SysTx').find(x=>x.requestId===req);
ctx.repoSheet_('Partner');ctx.repoSheet_('SysTx');ctx.repoSheet_('AuditLog');
// 1) bình thường: nhật ký OK đúng một dòng, giao dịch FINALIZED
let r=tx('req1',null,'A1');assert.ok(r.ok);let s1=sysOf('req1');assert.strictEqual(s1.status,'FINALIZED');
assert.deepStrictEqual(audits(s1.id).map(a=>a.result),['OK']);assert.strictEqual(rows('main','Partner').filter(p=>p.shortName==='A1')[0].commitState,'C');
// 2) dừng SAU commit, TRƯỚC khi hoàn tất: dữ liệu + nhật ký phục hồi, không trùng
r=tx('req2','AFTER_COMMIT','A2');assert.ok(!r.ok&&/FAILPOINT:AFTER_COMMIT/.test(r.e.message));let s2=sysOf('req2');assert.strictEqual(s2.status,'COMMITTED');
assert.deepStrictEqual(audits(s2.id).map(a=>a.result),['PENDING'],'nhật ký đã được lưu bền trước khi commit (chờ hoàn tất)');
const out=ctx.recoverStale_(0);assert.strictEqual(out.finalized,1);s2=sysOf('req2');assert.strictEqual(s2.status,'FINALIZED');
assert.deepStrictEqual(audits(s2.id).map(a=>a.result),['OK']);assert.strictEqual(rows('main','Partner').filter(p=>p.shortName==='A2')[0].commitState,'C');
ctx.recoverStale_(0);ctx.recoverStale_(0);assert.strictEqual(audits(s2.id).length,1,'phục hồi lặp không tạo thêm nhật ký');
const again=tx('req2',null,'A2');assert.ok(again.ok&&again.r.id,'gửi lại cùng requestId trả kết quả cũ');assert.strictEqual(rows('main','Partner').filter(p=>p.shortName==='A2').length,1,'không tạo bản ghi trùng');assert.strictEqual(audits(s2.id).length,1,'gửi lại không tạo nhật ký trùng');
// 3) dừng giữa chừng TRƯỚC commit (sau khi chèn / sau kế hoạch): hoàn tác hết, nhật ký ghi ROLLED_BACK
for(const fp of ['AFTER_PLAN','AFTER_INSERT','AFTER_UPDATE']){const rq='req_'+fp;r=tx(rq,fp,'B_'+fp);assert.ok(!r.ok);const st=sysOf(rq);assert.strictEqual(st.status,'PENDING');
 const o=ctx.recoverStale_(0);assert.strictEqual(o.rolledBack,1,fp);const st2=sysOf(rq);assert.strictEqual(st2.status,'ROLLED_BACK');
 assert.deepStrictEqual(audits(st2.id).map(a=>a.result),['ROLLED_BACK'],fp);
 const pr=rows('main','Partner').filter(p=>p.shortName==='B_'+fp);assert.ok(pr.every(p=>p.commitState==='A'),'bản ghi bị đánh dấu hủy: '+fp);
 const retry=tx(rq,null,'B_'+fp);assert.ok(!retry.ok&&retry.e.code==='REQUEST_FAILED','gửi lại requestId đã hủy bị từ chối rõ ràng')}
// 4) ghi nhật ký thất bại: giao dịch không ghi dữ liệu, không để lại bản ghi hợp lệ
dbs.aud.AuditLog.failSet=true;const before=rows('main','Partner').length;r=tx('req4',null,'C1');assert.ok(!r.ok&&/SHEET_WRITE_FAIL/.test(r.e.message));dbs.aud.AuditLog.failSet=false;
assert.strictEqual(rows('main','Partner').length,before,'chưa ghi dữ liệu khi nhật ký chưa lưu được');
const o4=ctx.recoverStale_(0);assert.strictEqual(o4.rolledBack,1);assert.strictEqual(sysOf('req4').status,'ROLLED_BACK');
// 5) sau tất cả vẫn không còn nhật ký PENDING
assert.ok(rows('aud','AuditLog').every(a=>a.result!=='PENDING'),'không còn nhật ký chờ');
// 6) mã nhật ký xác định theo giao dịch
assert.ok(audits(s2.id)[0].id==='aud_'+s2.id+'_0');
console.log('OK txaudit: bình thường, dừng sau commit, dừng trước commit (3 điểm), lỗi ghi nhật ký');
// 7) gửi lặp cùng requestId nhưng nội dung/thao tác khác -> từ chối, không ghi thêm
{const n0=rows('main','Partner').length;let e7=null;try{ctx.runTx_(user,{requestId:'req1',action:'test.save',payload:{n:'KHAC'}},t=>{t.insert('Partner',{shortName:'KHAC',legalName:'KHAC',isCustomer:1,isSupplier:0,status:'ACTIVE'});return{result:{},audit:[]}})}catch(x){e7=x}
 assert.ok(e7&&e7.code==='IDEMPOTENCY_MISMATCH','cùng requestId, nội dung khác bị từ chối: '+(e7&&e7.code));assert.strictEqual(rows('main','Partner').length,n0,'không ghi thêm');
 e7=null;try{ctx.runTx_(user,{requestId:'req1',action:'test.khac',payload:{n:'A1'}},t=>({result:{},audit:[]}))}catch(x){e7=x}assert.ok(e7&&e7.code==='IDEMPOTENCY_MISMATCH','cùng requestId, thao tác khác bị từ chối')}
// 8) hai người cùng sửa: người sau dùng version cũ bị VERSION_CONFLICT, dữ liệu của người trước giữ nguyên
{const p=rows('main','Partner').find(x=>x.shortName==='A1');const v0=p.version;
 const up=(rq,name,ifv)=>{try{return{ok:true,r:ctx.runTx_(user,{requestId:rq,action:'test.edit',payload:{id:p.id,name,ifv}},t=>{t.update('Partner',p.id,{shortName:name},ifv);return{result:{},audit:[]}})}}catch(e){return{ok:false,e}}};
 const a=up('ed1','A1-nguoi1',v0);assert.ok(a.ok,'người thứ nhất sửa được');
 const b=up('ed2','A1-nguoi2',v0);assert.ok(!b.ok&&b.e.code==='VERSION_CONFLICT','người thứ hai (version cũ) bị từ chối: '+(b.e&&b.e.code));
 assert.strictEqual(rows('main','Partner').find(x=>x.id===p.id).shortName,'A1-nguoi1','dữ liệu người trước không bị ghi đè');
 const cur=rows('main','Partner').find(x=>x.id===p.id).version;const c=up('ed3','A1-nguoi2',cur);assert.ok(c.ok,'tải lại rồi sửa với version mới thì được')}
console.log('OK txaudit: gửi lặp khác nội dung, hai người cùng sửa');
