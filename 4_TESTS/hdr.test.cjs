const vm=require('vm'),fs=require('fs'),assert=require('assert');
const cache={};const props={DB_MAIN_ID:'main',DB_AUDIT_ID:'aud'};
function mkSheet(name){const g={};const sh={name,cells:g,maxCols:200,maxRows:1000,
 getLastRow(){let m=0;Object.keys(g).forEach(k=>{const r=+k.split(',')[0];if(g[k]!==''&&g[k]!==undefined&&r>m)m=r});return m},
 getMaxRows(){return sh.maxRows},getMaxColumns(){return sh.maxCols},insertColumnsAfter(c,n){sh.maxCols+=n},setFrozenRows(){},
 getRange(r,c,nr=1,nc=1){return{getValues:()=>{const o=[];for(let i=0;i<nr;i++){const row=[];for(let j=0;j<nc;j++){const v=g[(r+i)+','+(c+j)];row.push(v===undefined?'':v)}o.push(row)}return o},
  setValues:v=>{v.forEach((row,i)=>row.forEach((x,j)=>{g[(r+i)+','+(c+j)]=x}))},setValue:x=>{g[r+','+c]=x},setNumberFormat(){}}}};return sh}
const dbs={main:{},aud:{}};
const SS={openById:id=>({getSheetByName:n=>dbs[id][n]||null,insertSheet:n=>(dbs[id][n]=mkSheet(n)),getSheets:()=>Object.values(dbs[id])}),flush(){}};
const ctx=vm.createContext({console,Logger:{log:m=>(ctx.__log=(ctx.__log||'')+m+'\n')},SpreadsheetApp:SS,Utilities:{getUuid:()=>'u'+Math.random(),formatDate:()=>'x'},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},CacheService:{getScriptCache:()=>({get:k=>cache[k]||null,put:(k,v)=>{cache[k]=v},remove:k=>{delete cache[k]}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in props?props[k]:null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
// tạo bảng đúng chuẩn
ctx.repoSheet_('Partner');ctx.resetMemoDirect_();ctx.repoSheet_('Partner');const sh=dbs.main.Partner;assert.ok(Object.keys(cache).some(k=>k.startsWith('hdr:')),'cache tiêu đề đã có');
const cols=ctx.parseCols_('Partner');const idx=n=>cols.findIndex(c=>c.name===n)+1;
const obj={id:'p1',shortName:'A',legalName:'A',version:1,isDeleted:0,commitState:'C'};
assert.strictEqual(code(()=>ctx.repoAppend_('Partner',[obj])),'OK','đúng tiêu đề thì ghi được');
// hoán đổi tiêu đề + dữ liệu hai cột shortName/taxCode (cache còn sống)
const a=idx('shortName'),b=idx('taxCode');[ [1],[2] ].forEach(()=>{});
for(const r of [1,2]){const t=sh.cells[r+','+a];sh.cells[r+','+a]=sh.cells[r+','+b];sh.cells[r+','+b]=t}
const rowsBefore=sh.getLastRow();
ctx.resetMemoDirect_();
assert.strictEqual(code(()=>ctx.repoAppend_('Partner',[Object.assign({},obj,{id:'p2'})])),'SCHEMA_MISMATCH','ghi bị chặn dù cache còn');
assert.strictEqual(sh.getLastRow(),rowsBefore,'không ghi gì');
assert.strictEqual(code(()=>ctx.repoWriteRow_('Partner',2,obj)),'SCHEMA_MISMATCH');
assert.strictEqual(code(()=>ctx.repoSetCell_('Partner',2,'status','X')),'SCHEMA_MISMATCH');
// đọc vẫn dùng cache (chấp nhận độ trễ phát hiện) nhưng schemaProblems_ phải thấy
assert.strictEqual(code(()=>ctx.repoSheet_('Partner')),'OK');
assert.ok(ctx.schemaProblems_().some(x=>/^Partner:/.test(x)),'schemaProblems_ thấy dù cache còn');
// trả lại
for(const r of [1,2]){const t=sh.cells[r+','+a];sh.cells[r+','+a]=sh.cells[r+','+b];sh.cells[r+','+b]=t}
assert.strictEqual(code(()=>ctx.repoAppend_('Partner',[Object.assign({},obj,{id:'p3'})])),'OK');
// id đổi tên khi cache còn sống
sh.cells['1,1']='idx';assert.ok(ctx.schemaProblems_().some(x=>/Partner/.test(x)));sh.cells['1,1']='id';
// ---- migration 2 pha ----
const T2=dbs.main;delete T2.Order;ctx.repoSheet_('Order');ctx.HDR_OK_={};const os=T2.Order;
// cắt 2 cột bổ sung cuối (mô phỏng bảng cũ)
const oc=ctx.parseCols_('Order');for(let i=oc.length-3;i<oc.length;i++)os.cells['1,'+(i+1)]='';
os.cells['1,3']='SAI';// lõi sai
const before=JSON.stringify(os.cells);
ctx.__log='';const r=ctx.ensureSchema();assert.ok(r.length&&/Order/.test(r[0]));assert.strictEqual(JSON.stringify(os.cells),before,'dry-run lỗi: không ghi gì');
assert.ok(/chưa ghi gì/.test(ctx.__log));
assert.strictEqual(code(()=>ctx.migrateHeaders_()),'SCHEMA_MISMATCH');assert.strictEqual(JSON.stringify(os.cells),before);
// sửa lõi -> migration thêm đúng cột cuối
os.cells['1,3']=oc[2].name;const m=ctx.migrateHeaders_();assert.ok(m.some(x=>/^Order\./.test(x)),'đã thêm: '+m);
assert.deepStrictEqual(Array.from(ctx.headerProblems_()),[]);
assert.deepStrictEqual(Array.from(ctx.ensureSchema()),[]);
// đúng thứ tự cột: cột bổ sung sau cột hệ thống
assert.strictEqual(os.cells['1,'+oc.length],oc[oc.length-1].name);
console.log('OK hdr');
// ---- migration trên dữ liệu cũ: giữ nguyên dữ liệu & thứ tự cột, chạy lại không đổi ----
{const tabs=['Order','Accrual','DebtLine','Partner'];const ex={Order:['serviceCode','hsdvNo','servicesJson','cancelledDate'],Accrual:['serviceCode','cancelledDate'],DebtLine:['serviceCode'],Partner:['address','phone','contactName','contactTitle','bankAccountNo','bankName']};
 tabs.forEach(t=>{delete dbs.main[t];ctx.repoSheet_(t)});ctx.HDR_OK_={};
 const snap={};
 tabs.forEach(t=>{const sh=dbs.main[t],cs=ctx.parseCols_(t);
  // dữ liệu cũ: ghi 2 dòng có giá trị ở mọi cột lõi, rồi xoá tiêu đề + ô của các cột bổ sung (bảng schema cũ)
  for(let r=2;r<=3;r++)cs.forEach((c,i)=>{sh.cells[r+','+(i+1)]=(c.name==='id'?t+'_'+r:(c.name==='version'?1:'v'+r+c.name))});
  const idxs=ex[t].map(n=>cs.findIndex(c=>c.name===n)+1);idxs.forEach(i=>{for(let r=1;r<=3;r++)delete sh.cells[r+','+i]});
  snap[t]={sh,cs,idxs,keep:JSON.stringify(Object.keys(sh.cells).filter(k=>!idxs.includes(+k.split(',')[1])).sort().map(k=>[k,sh.cells[k]]))}});
 assert.deepStrictEqual(Array.from(ctx.headerProblems_()),[],'bảng cũ thiếu cột bổ sung không bị coi là lệch lõi (dry-run sạch, không ghi gì)');
 const m1=ctx.migrateHeaders_();tabs.forEach(t=>assert.ok(m1.some(x=>x.indexOf(t+'.')===0),'thêm cột cho '+t));
 tabs.forEach(t=>{const {sh,cs,idxs,keep}=snap[t];
  const now=JSON.stringify(Object.keys(sh.cells).filter(k=>!idxs.includes(+k.split(',')[1])).sort().map(k=>[k,sh.cells[k]]));
  assert.strictEqual(now,keep,'dữ liệu cũ nguyên vẹn (các cột cũ không đổi giá trị/vị trí): '+t);
  idxs.forEach((i,j)=>assert.strictEqual(sh.cells['1,'+i],ex[t][j],'tiêu đề cột mới đúng vị trí: '+t+'.'+ex[t][j]));
  for(let r=2;r<=3;r++)idxs.forEach(i=>assert.ok(sh.cells[r+','+i]===undefined||sh.cells[r+','+i]==='','ô cột mới để trống, không bịa dữ liệu'))});
 const after=tabs.map(t=>JSON.stringify(snap[t].sh.cells));
 const m2=ctx.migrateHeaders_();assert.strictEqual(m2.length,0,'chạy lại: không có gì để thêm');
 assert.deepStrictEqual(tabs.map(t=>JSON.stringify(snap[t].sh.cells)),after,'chạy lại: không đổi gì');
 assert.deepStrictEqual(Array.from(ctx.headerProblems_()),[]);
}
console.log('OK hdr: migration trên dữ liệu cũ, chạy lại không đổi');
