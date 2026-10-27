const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'x'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
const ap={id:'a',email:'a@x.vn',role:'ADMIN',scope:{allPartners:true}};
assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.routes_()['app.whoami'].fn(ap,{}))),{email:'a@x.vn',role:'ADMIN'});
assert.ok(!ctx.routes_()['app.whoami'].write);
assert.strictEqual(code(()=>ctx.configSet_(ap,{requestId:'x',payload:{values:{'archive.sysTxDays':'10'}}})),'VALIDATION_FAILED');
assert.strictEqual(code(()=>ctx.configSet_(ap,{requestId:'x',payload:{values:{'archive.auditMonths':'6'}}})),'VALIDATION_FAILED');
assert.strictEqual(code(()=>ctx.configSet_(ap,{requestId:'x',payload:{values:{'archive.auditMonths':'abc'}}})),'VALIDATION_FAILED');
// Gateway: flowDoc chặn người chưa đăng ký
const gctx=vm.createContext({console,Session:{getActiveUser:()=>({getEmail:()=>'x@gmail.com'})},HtmlService:{createHtmlOutputFromFile:n=>({getContent:()=>'<html>'+n})},Utilities:{getUuid:()=>'u',base64Encode:x=>x,computeHmacSha256Signature:()=>'',computeDigest:()=>[],DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1}},PropertiesService:{getScriptProperties:()=>({getProperties:()=>({})})},UrlFetchApp:{}});
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..','2_GATEWAY','Gateway.gs'),'utf8'),gctx);
gctx.rpc=e=>({ok:false,error:{code:'FORBIDDEN'}});assert.throws(()=>gctx.flowDoc(),/FORBIDDEN/);
let sent;gctx.rpc=e=>{sent=e;return {ok:true,data:{email:'x'}}};assert.strictEqual(gctx.flowDoc(),'<html>luong-nghiep-vu');assert.strictEqual(sent.action,'app.whoami');
console.log('OK fix13');
