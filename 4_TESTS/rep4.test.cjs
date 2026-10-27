const vm=require('vm'),fs=require('fs'),assert=require('assert');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync(SRC,'utf8'),ctx);
const doc=(id,o)=>{const d=Object.assign({id,docNo:id,partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-02-10',postingDate:'2026-02-10',docType:'INVOICE',totalGrossMinor:0,warningsJson:''},o);if(o.docDate&&!o.postingDate)d.postingDate=o.docDate;return d};
const line=(id,docId,g,o)=>Object.assign({id,docId,lineNo:1,grossMinor:g,netMinor:g,vatMinor:0,vatMode:'NONE'},o);
const snap=(id,params,by)=>({id,reportCode:'R02',versionLabel:'RPT-'+id,paramsJson:JSON.stringify(params),asOfDate:'2026-10-25',status:'ISSUED',issuedBy:by,issuedAt:'2026-10-25T00:00:00Z',dataSha256:'x',dataFileId:'f'});
const T={Partner:[{id:'p1',shortName:'A',status:'ACTIVE'},{id:'p2',shortName:'B',status:'ACTIVE'}],
 DebtDoc:[doc('d4',{status:'REVERSED',totalGrossMinor:200}),doc('r4',{docType:'REVERSAL',totalGrossMinor:-200,docDate:'2026-04-01',postingDate:'2026-04-01'}),doc('d9',{totalGrossMinor:999,docDate:'2026-11-20'})],
 DebtLine:[line('l4','d4',200),line('lr4','r4',-200,{adjustsLineId:'l4'}),line('l9','d9',999)],Allocation:[],Payment:[],ServiceFile:[],Config:[],Catalog:[],Order:[],Accrual:[],AccrualSplit:[],
 ReportSnapshot:[snap('s_all',{asOf:'2026-10-25'},'admin'),snap('s_own',{asOf:'2026-10-25'},'u2'),snap('s_p1',{partnerId:'p1'},'admin'),snap('s_p2',{partnerId:'p2'},'admin')]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const ids=(u)=>ctx.reportSnapshots_(u,{payload:{}}).items.map(x=>x.id).sort().join(',');
const scoped={id:'u2',email:'u2@x',role:'AUDITOR',scope:{partnerIds:['p1']}};
const other={id:'u3',email:'u3@x',role:'AUDITOR',scope:{partnerIds:['p1']}};
const full={id:'u',email:'u@x',role:'APPROVER',scope:{allPartners:true},displayName:'x'};
const grp={id:'u4',email:'u4@x',role:'APPROVER',scope:{allPartners:true,businessGroups:['G1']}};
assert.strictEqual(ids(full),'s_all,s_own,s_p1,s_p2','toàn phần thấy hết');
assert.strictEqual(ids(scoped),'s_own,s_p1','người hẹp: bản của mình + đối tác p1; không thấy bản chốt tổng hợp của admin');
assert.strictEqual(ids(other),'s_p1','người hẹp khác: chỉ bản đối tác p1');
assert.strictEqual(ids(grp),'s_p1,s_p2','giới hạn nhóm: không thấy bản tổng hợp của người khác');
// tải xuống bị chặn trước khi chạm Drive
const exp=(u,id)=>{try{ctx.DriveApp={getFileById(){throw new Error('DRIVE')}};ctx.reportSnapshotExport_(u,{payload:{id}});return 'ok'}catch(e){return e.code||e.message}};
assert.strictEqual(exp(other,'s_all'),'OUT_OF_SCOPE'); assert.strictEqual(exp(other,'s_p2'),'OUT_OF_SCOPE');
assert.strictEqual(exp(other,'s_p1'),'DRIVE','p1 hợp lệ -> tới bước đọc tệp'); assert.strictEqual(exp(full,'s_all'),'DRIVE');
// xu hướng phát sinh
const d=ctx.dashboardSummaryLive_(full,{payload:{asOf:'2026-10-25'}}); const s=d.trend.series['AR:VND'];
assert.strictEqual(JSON.stringify(s.issued.slice(1,4)),'[200,0,-200]','phát sinh T2..T4');
assert.strictEqual(JSON.stringify(s.out.slice(1,4)),'[200,200,0]','dư T2..T4');
assert.strictEqual(s.issued.reduce((a,b)=>a+b,0),0,'tổng phát sinh toàn kỳ về 0, chứng từ 20/11 (sau ngày chốt) không tính');
console.log('OK bản chốt theo phạm vi | phát sinh',JSON.stringify(s.issued.slice(1,4)),'dư',JSON.stringify(s.out.slice(1,4)));
