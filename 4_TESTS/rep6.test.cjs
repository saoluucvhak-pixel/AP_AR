const vm=require('vm'),fs=require('fs'),assert=require('assert');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
const sandbox={console,Utilities:{getUuid:()=>'u',formatDate:()=>'x'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='OPEN_TX'?'{"t1":"PENDING"}':null})},SpreadsheetApp:{flush(){}}};
const ctx=vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(SRC,'utf8'),ctx);
const doc=(id,o)=>Object.assign({id,docNo:id,partnerId:'p1',direction:'AR',currency:'VND',status:'DRAFT',isOpening:0,businessGroupCode:'G1',docDate:'2026-02-10',docType:'INVOICE',totalGrossMinor:100,warningsJson:''},o);
const T={Partner:[{id:'p1',shortName:'A',status:'ACTIVE'},{id:'p2',shortName:'B',status:'ACTIVE'}],
 DebtDoc:[doc('a'),doc('b',{partnerId:'p2'}),doc('c',{businessGroupCode:'G2'}),doc('e',{currency:'USD'})],DebtLine:[],Allocation:[],Payment:[],Config:[],Catalog:[],
 ServiceFile:[{id:'s1',dataGapJson:'[{"partnerId":"p1"}]'},{id:'s2',dataGapJson:'[{"partnerId":"p2"}]'},{id:'s3',dataGapJson:'[{"note":"không gắn đối tác"}]'}]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const sum=(u,p)=>ctx.dashboardSummary_(u,{payload:Object.assign({asOf:'2026-10-25'},p||{})}).quality;
const full={id:'a',email:'a@x',role:'APPROVER',scope:{allPartners:true}};
const acc={id:'b',email:'b@x',role:'ACCOUNTANT',scope:{partnerIds:['p1']}};
const aud={id:'c',email:'c@x',role:'AUDITOR',scope:{allPartners:true}};
// số hồ sơ thiếu số liệu theo phạm vi
// thao tác ghi dở chỉ cho người có quyền sao lưu
assert.strictEqual(sum(full).openTx,1,'Kế toán trưởng thấy'); assert.strictEqual(sum(aud).openTx,1,'Kiểm soát viên thấy'); assert.strictEqual(sum(acc).openTx,0,'Kế toán nhập liệu không thấy');
// chứng từ chờ xử lý theo bộ lọc
const pend=(u,p)=>{const q=sum(u,p).pendingDocs;return q.DRAFT};
assert.strictEqual(pend(full),4,'không lọc'); assert.strictEqual(pend(full,{group:'G1'}),3,'lọc nhóm'); assert.strictEqual(pend(full,{partnerId:'p2'}),1,'lọc đối tác'); assert.strictEqual(pend(full,{currency:'USD'}),1,'lọc tiền tệ');
// xóa tệp tạm
function run(withDrive){
 const log=[]; ctx.SpreadsheetApp={flush(){log.push('flush')}};
 ctx.DriveApp={getFileById:id=>({setTrashed:()=>log.push('trash:'+id)})};
 if(withDrive) ctx.Drive={Files:{remove:id=>log.push('remove:'+id)}}; else delete ctx.Drive;
 const sheet={clear:()=>log.push('clear')};
 ctx.discardTempSheet_({getId:()=> 'SS1'},sheet); return log.join(',');
}
assert.strictEqual(run(true),'remove:SS1','có Drive API: xóa hẳn');
assert.strictEqual(run(false),'clear,flush,trash:SS1','không có Drive API: xóa sạch nội dung rồi bỏ thùng rác');
console.log('OK mục nhỏ');
