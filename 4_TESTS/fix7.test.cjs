const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Logger:{log:console.log},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:()=>'x'},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const cat=[{catalogType:'SERVICE_CODE',code:'FWD'}];ctx.repoReadAll_=()=>cat.slice();ctx.repoAppend_=(t,rows)=>rows.forEach(r=>cat.push(r));
ctx.seedServiceCodes();assert.deepStrictEqual(cat.map(c=>c.code),['FWD','CFN','CBT','MV','TRD']);
ctx.seedServiceCodes();assert.strictEqual(cat.length,5,'chạy lại không nhân đôi');
assert.ok(cat.every(c=>/^[A-Z0-9_\-]{2,30}$/.test(c.code)));
console.log('OK fix7');
