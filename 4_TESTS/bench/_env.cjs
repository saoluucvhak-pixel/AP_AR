// Môi trường giả (Sheet/Cache/Lock/Properties) đếm lệnh gọi, dùng cho đo hiệu năng và test cache. Không phải Apps Script thật.
const vm=require('vm'),fs=require('fs'),zlib=require('zlib');
module.exports=function makeEnv(srcPath){
  const props={DB_MAIN_ID:'main',DB_AUDIT_ID:'aud',ENV:'TEST'};const cache={};const C={get:0,getAll:0,getAllKeys:0,put:0,putAll:0};
  const S={getValues:0,cells:0,by:{}};
  function mkSheet(name){const g={};const sh={name,cells:g,maxCols:200,maxRows:200000,
   getLastRow(){let m=0;Object.keys(g).forEach(k=>{const r=+k.split(',')[0];if(g[k]!==''&&g[k]!==undefined&&r>m)m=r});return m},getMaxRows(){return sh.maxRows},getMaxColumns(){return sh.maxCols},insertColumnsAfter(c,n){sh.maxCols+=n},setFrozenRows(){},
   getRange(r,c,nr=1,nc=1){return{getValues:()=>{S.getValues++;S.cells+=nr*nc;S.by[name]=(S.by[name]||0)+nr*nc;const o=[];for(let i=0;i<nr;i++){const row=[];for(let j=0;j<nc;j++){const v=g[(r+i)+','+(c+j)];row.push(v===undefined?'':v)}o.push(row)}return o},
    getValue:()=>{const v=g[r+','+c];return v===undefined?'':v},setValues:v=>{v.forEach((row,i)=>row.forEach((x,j)=>{g[(r+i)+','+(c+j)]=x}))},setValue:x=>{g[r+','+c]=x},setNumberFormat(){},createTextFinder:val=>{let ent=false;const f={matchEntireCell:()=>{ent=true;return f},matchCase:()=>f,useRegularExpression:()=>f,findAll:()=>{const out=[];for(let i=0;i<nr;i++)for(let j=0;j<nc;j++){const v=g[(r+i)+','+(c+j)];if(v!==undefined&&(ent?String(v)===val:String(v).includes(val)))out.push({getRow:()=>r+i})}return out}};return f}}}};return sh}
  const dbs={main:{},aud:{}};
  const SS={openById:id=>({getSheetByName:n=>dbs[id][n]||null,insertSheet:n=>(dbs[id][n]=mkSheet(n)),getSheets:()=>Object.values(dbs[id])}),flush(){}};
  const ctx=vm.createContext({console:{log(){},warn(){},error(){}},Logger:{log(){}},SpreadsheetApp:SS,MailApp:{sendEmail(){}},Utilities:{getUuid:()=>'u'+Math.random().toString(16).slice(2),formatDate:()=>'2026-10-25',computeDigest:(a,x)=>Array.from(require('crypto').createHash('sha256').update(x).digest()).map(b=>b>127?b-256:b),DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1},newBlob:x=>{const bytes=Buffer.from(x);return {bytes,getBytes:()=>Array.from(bytes),getDataAsString:()=>bytes.toString()}},gzip:b=>{const bytes=zlib.gzipSync(b.bytes);return {bytes,getBytes:()=>Array.from(bytes)}},ungzip:b=>({getDataAsString:()=>zlib.gunzipSync(b.bytes).toString()}),base64Encode:a=>Buffer.from(a).toString('base64'),base64Decode:s=>Array.from(Buffer.from(s,'base64'))},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
   CacheService:{getScriptCache:()=>({get:k=>{C.get++;return cache[k]===undefined?null:cache[k]},getAll:ks=>{C.getAll++;C.getAllKeys+=ks.length;const o={};ks.forEach(k=>{if(cache[k]!==undefined)o[k]=cache[k]});return o},put:(k,v)=>{C.put++;cache[k]=v},putAll:o=>{C.putAll++;Object.assign(cache,o)},remove:k=>{delete cache[k]}})},
   PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in props?props[k]:null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})}});
  vm.runInContext(fs.readFileSync(srcPath,'utf8'),ctx);
  return {ctx,C,S,props,cache,dbs};
};
