// R35: Gateway nêu nguyên nhân khi không gọi được Backend (không in địa chỉ/khóa) và diagBackend() chẩn đoán cấu hình. Giả lập, KHÔNG phải Google thật.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.GATEWAY_SRC||path.join(__dirname,'..','2_GATEWAY','Gateway.gs'),'utf8');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
const SECRET='S3CR3T-VALUE-123456';
function env(props,fetch){const logs=[];const ctx=vm.createContext({Logger:{log:x=>logs.push(x)},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'})},Utilities:{getUuid:()=>'u1',base64Encode:()=>'sig',computeHmacSha256Signature:()=>[1],computeDigest:()=>[1,2],DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1}},
  PropertiesService:{getScriptProperties:()=>({getProperties:()=>props,getProperty:k=>props[k]===undefined?null:props[k]})},UrlFetchApp:{fetch},HtmlService:{}});vm.runInContext(SRC,ctx);return {ctx,logs}}
const URL='https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXX/exec',call=e=>env({BACKEND_URL:URL,HMAC_SECRET:SECRET},()=>{throw new Error(e)}).ctx.rpc({action:'app.whoami',payload:{}});
suite('Gateway nêu nguyên nhân gọi Backend thất bại, không lộ địa chỉ/khóa',()=>{
  const a=call('You do not have permission to call UrlFetchApp.fetch. Required permissions: https://www.googleapis.com/auth/script.external_request');eq(a.error.code,'SERVER_BUSY');ok(/chưa được cấp quyền gọi URL/.test(a.error.message),a.error.message);ok(!/googleapis|AKfycb/.test(a.error.message));
  ok(/BACKEND_URL .*không hợp lệ/.test(call('Invalid argument: https://x').error.message));ok(/chưa phản hồi/.test(call('Timeout: request failed for https://x returned code 500. DNS error').error.message));ok(/diagBackend/.test(call('lạ').error.message));
});
suite('diagBackend: báo thiếu cấu hình, URL sai dạng, Backend đòi đăng nhập; không in HMAC_SECRET và không in toàn bộ URL',()=>{
  let e=env({},()=>({}));let o=e.ctx.diagBackend();ok(/CHƯA ĐẶT/.test(o.join()));
  e=env({BACKEND_URL:' https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXX/dev ',HMAC_SECRET:SECRET},()=>({getResponseCode:()=>200,getContentText:()=>'<html>Sign in - Google Accounts accounts.google.com</html>'}));o=e.ctx.diagBackend();let t=o.join('\n');
  ok(/khoảng trắng/.test(t)&&/không đúng dạng/.test(t)&&/Bất kỳ ai/.test(t),t);ok(!t.includes(SECRET)&&!t.includes('AKfycbzXXXXXXXXXXXXXXXX'),'không lộ khóa/URL đầy đủ');
  e=env({BACKEND_URL:URL,HMAC_SECRET:SECRET},()=>{throw new Error('Exception: Invalid argument: '+URL)});t=e.ctx.diagBackend().join('\n');ok(/LỖI khi gọi Backend/.test(t)&&!t.includes('AKfycb'),t);
});
console.log('Tổng kiểm tra:',steps);
