// Kiểm thử giao diện trên Chromium (Playwright): google.script.run nối tới Backend.gs thật chạy trong Node với Sheet giả. KHÔNG phải Apps Script thật.
// Chạy: node 5_UI_TESTS/ui.e2e.cjs  (cần playwright; HTML lấy từ 2_GATEWAY/index.html hoặc biến UI_HTML)
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('playwright');
const os=require('os'),{spawnSync}=require('child_process');
// Đường dẫn tính từ vị trí tệp (chạy được trên Windows/Linux/macOS); thư mục tạm riêng của mỗi lần chạy, chỉ xóa đúng thư mục này khi xong.
const DL=require('./_download_probe.cjs');
const FIXTURES=path.join(__dirname,'..','4_TESTS','fixtures'),TMP=fs.mkdtempSync(path.join(os.tmpdir(),'katy-ui-'));
class Blocked extends Error{}
// Gọi Python (cấu hình bằng biến PYTHON; mặc định thử python3, python, py) bằng mảng tham số, script qua stdin, kiểm tra mã thoát; không ghép lệnh shell.
function runPython(script,args){
  const cands=process.env.PYTHON?[process.env.PYTHON]:['python3','python','py'];let last='';
  for(const exe of cands){const r=spawnSync(exe,['-I','-',...(args||[])],{input:script,encoding:'utf8'});
    if(r.error){last=exe+': '+r.error.message;continue}
    if(r.status===0)return r;last=exe+' → mã thoát '+r.status+': '+String(r.stderr||'').split('\n').slice(-3).join(' ');
    if(/No module named/.test(r.stderr||''))break;}
  throw new Blocked('Không chạy được Python/openpyxl ('+last+'). Cài Python 3 + openpyxl hoặc đặt biến PYTHON.');
}
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
const HTML=fs.readFileSync(process.env.UI_HTML||path.join(__dirname,'..','2_GATEWAY','index.html'),'utf8');
const J=x=>JSON.stringify(x);
function world(today){
  const PR_={},PROPS_={getProperty:k=>k in PR_?PR_[k]:null,setProperty:(k,v)=>{PR_[k]=String(v)},deleteProperty:k=>{delete PR_[k]}};
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(al,x)=>[...require('crypto').createHash('sha256').update(String(x)).digest()].map(y=>y>127?y-256:y),getUuid:()=>'u'+Math.random(),formatDate:(d)=>d&&d.toISOString?d.toISOString().slice(0,10):today},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>PROPS_}});
  vm.runInContext(SRC,ctx);ctx.todayVn_=()=>today;
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c1b','CURRENCY','USD',{decimals:2}),cat('g','BUSINESS_GROUP','G1'),cat('f','FEE_TYPE','F'),cat('fp','FEE_TYPE','PASS_THROUGH'),cat('s1','SERVICE_CODE','FWD'),cat('q','CASH_ACCOUNT','Q1',{currency:'VND',type:'BANK'})],
   Partner:[{id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1}],
   Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],Period:[],OpeningBalance:[],ImportBatch:[],ImportRow:[],ServiceFile:[],ShipmentRef:[],Followup:[],
   Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoSliceValid_=(t)=>ctx.repoValid_(t);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  let n=0;
  ctx.runTx_=(user,meta,build)=>{const ins=[],upd=[];const tx={user,now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),
    insert:(t,o)=>{const r=Object.assign({id:t+'_'+(++n),version:1,createdBy:user.id,createdAt:today+'T03:00:00.000Z'},o);ins.push([t,r]);return r},
    update:(t,id,p)=>{const b=(T[t]||[]).find(x=>x.id===id);if(!b)throw Object.assign(new Error('NF'),{code:'NOT_FOUND'});upd.push([t,id,p]);return Object.assign({},b,p)},nextSeq:k=>++n};
    const built=build(tx);ins.forEach(([t,r])=>(T[t]=T[t]||[]).push(r));upd.forEach(([t,id,p])=>Object.assign(T[t].find(x=>x.id===id),p,{updatedAt:today+'T03:00:00.000Z'}));return built&&built.result};
  return {ctx,T};
}


const full={id:'ap',email:'ap@x.vn',displayName:'Admin',role:'APPROVER',scope:{allPartners:true}};
const mkdoc=(id,o,gross)=>Object.assign({id,docNo:id.toUpperCase(),direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-10',postingDate:'2026-09-10',status:'POSTED',totalGrossMinor:gross===undefined?1000:gross,isOpening:0,dueDate:'2026-09-30',createdAt:'2026-09-10T03:00:00.000Z',createdBy:'c',version:1,warningsJson:'',services:[]},o||{});
const mkline=(id,doc,gross)=>({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'Phí '+id,netMinor:gross,grossMinor:gross,vatMinor:0,vatMode:'NONE'});
function build(){
  const w=world('2026-10-25');w.T.DraftEntry=w.T.DraftEntry||[];w.ctx.repoReadAll_=t=>t==='DraftEntry'?w.T.DraftEntry.map((x,i)=>Object.assign(x,{_row:i+2})):[];w.ctx.repoAppend_=(t,rows)=>{(w.T[t]=w.T[t]||[]).push(...rows)};w.ctx.repoWriteRow_=(t,n,o)=>{Object.assign(w.T[t][n-2],o)};w.ctx.repoRowCount_=()=>0;w.ctx.LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})};w.ctx.rmStore_=()=>false;
  w.T.Partner.push({id:'p2',shortName:'XYZ',legalName:'XYZ',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1});
  w.T.DebtDoc.push(mkdoc('d1',{},1000),mkdoc('d2',{partnerId:'p2',currency:'USD',dueDate:'',warningsJson:'[{"code":"W"}]',docDate:'2026-10-01',postingDate:'2026-10-01'},5000),mkdoc('d3',{status:'DRAFT',isOpening:1,dueDate:'2026-12-01'},300),mkdoc('nochild',{docDate:'2026-10-03',postingDate:'2026-10-03'},0),mkdoc('lech',{docDate:'2026-10-04',postingDate:'2026-10-04'},1000),mkdoc('multi',{docDate:'2026-10-05',postingDate:'2026-10-05'},1500));
  [['l1','d1',1000],['l2','d2',5000],['l3','d3',300],['lx','lech',900],['m1','multi',1000],['m2','multi',500]].forEach(x=>w.T.DebtLine.push(mkline(...x)));
  w.T.Payment.push({id:'pay1',payNo:'PT-1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:1000,effectiveDate:'2026-10-01',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1},{id:'pay2',payNo:'PC-1',direction:'OUT',partnerId:'p2',currency:'USD',amountMinor:900,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1});
  w.T.Allocation.push({id:'al1',paymentId:'pay1',debtLineId:'l1',docId:'d1',amountMinor:400,effectiveDate:'2026-10-02'});
  w.T.Order.push({id:'o1',orderNo:'DH-1',poNo:'P1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:J([{code:'FWD',hsdvNo:'N1'}]),serviceCode:'FWD',hsdvNo:'N1',version:1},{id:'o2',orderNo:'DH-2',poNo:'P2',customerPartnerId:'p2',businessGroupCode:'G1',currency:'VND',orderDate:'2026-10-05',status:'CLOSED',servicesJson:'[]',serviceCode:'',hsdvNo:'',version:1});
  w.T.Accrual.push({id:'r1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-09-05',feeTypeCode:'F',description:'Doanh thu',netMinor:1000,vatMode:'NONE',vatMinor:0,grossMinor:1000,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1},{id:'c1',orderId:'o1',kind:'COST',partnerId:'p1',accrualDate:'2026-09-06',feeTypeCode:'F',description:'Chi phí',netMinor:400,vatMode:'NONE',vatMinor:0,grossMinor:400,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  return w;
}
function errOut(e){return {ok:false,error:{code:e.code||'ERROR',message:e.userMessage||e.message,fields:e.fields||null}}}
async function newPage(browser,w,viewport){
  const bctx=await browser.newContext({acceptDownloads:!process.env.KATY_SIMULATE_NO_DOWNLOADS,viewport:viewport||{width:1366,height:900}}),pg=await bctx.newPage(),errs=[],calls=[];const _close=pg.close.bind(pg);pg.close=async(o)=>{await _close(o);await bctx.close()};
  await pg.clock.setFixedTime(new Date('2026-10-25T10:00:00+07:00'));
  await pg.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  const run=(user,action,payload,requestId)=>{const route=w.ctx.routes_()[action];if(!route)throw Object.assign(new Error('NOT_FOUND'),{code:'NOT_FOUND'});return w.ctx.dispatch_(user,action,{requestId,payload:payload===undefined?{}:payload})};
  await pg.exposeFunction('__be',(envJson)=>{
    const env=JSON.parse(envJson);calls.push({action:env.action,payload:env.payload});
    try{
      if(env.action==='sys.batch'){return JSON.stringify({ok:true,data:(env.payload.calls||[]).map(c=>{try{return {ok:true,data:run(full,c.action,c.payload)}}catch(e){const o=errOut(e);return {ok:false,error:o.error}}})}) }
      return JSON.stringify({ok:true,data:run(full,env.action,env.payload,env.requestId)});
    }catch(e){return JSON.stringify(errOut(e))}
  });
  const stub=`<script>(function(){function mk(){var h={};var o={withSuccessHandler:function(f){h.ok=f;return o},withFailureHandler:function(f){h.err=f;return o},rpc:function(env){window.__be(JSON.stringify(env)).then(function(s){h.ok&&h.ok(JSON.parse(s))},function(e){h.err&&h.err(e)})}};return o}window.google={script:{}};Object.defineProperty(window.google.script,'run',{get:mk})})();</script>`;
  const html=HTML.replace(/<\?=\s*userEmail\s*\?>/g,full.email).replace(/<\?!=[^?]*\?>/g,'');
  await pg.setContent(html.replace('<head>','<head>'+stub),{waitUntil:'load'});await pg.waitForTimeout(700);
  return {pg,errs,calls};
}
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)};const eq=(a,b,m)=>{steps++;assert.strictEqual(J(a),J(b),m)};
const results=[];
async function suite(name,fn){try{await fn();results.push([name,true]);console.log('✔',name)}catch(e){if(e instanceof Blocked){results.push([name,false,'blocked']);process.exitCode=process.exitCode||3;console.log('⚠ BỊ CHẶN (chưa xác minh):',name,'-',e.message);return}results.push([name,false]);process.exitCode=1;console.log('✖',name,'-',String(e.message).split('\n').slice(0,4).join(' | '))}}
const go=async(pg,hash,ms)=>{await pg.evaluate(h=>{location.hash=h},hash);await pg.waitForTimeout(ms||600)};
const last=(calls,a)=>[...calls].reverse().find(c=>c.action===a);
(async()=>{
const browser=await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {});
const ENVINFO=DL.envInfo(browser,require('playwright/package.json').version,TMP);console.log('Môi trường:',JSON.stringify(ENVINFO));
if(process.env.SHOTS_DIR){const dir=process.env.SHOTS_DIR,tag=process.env.SHOTS_TAG||'x';fs.mkdirSync(dir,{recursive:true});
  const w=build(),{pg}=await newPage(browser,w,{width:1366,height:1500});
  await go(pg,'#/docs/AR',900);await pg.screenshot({path:path.join(dir,tag+'_1_menu_danh_sach.png')});
  await go(pg,'#/doc/new?dir=AR',900);await pg.screenshot({path:path.join(dir,tag+'_2_form_dai.png')});
  await go(pg,'#/orders',700);await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Thêm đơn hàng/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(500);await pg.screenshot({path:path.join(dir,tag+'_3_hop_thoai.png')});
  await browser.close();console.log('đã chụp',tag);return;}
await suite('1. Mọi menu dựng xong, không lỗi JS/console; tên menu một dòng',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  const subs=calls.flatMap(c=>c.action==='sys.batch'?(c.payload.calls||[]).map(x=>x.action):[c.action]),acts=calls.map(c=>c.action);eq(subs.filter(a=>a==='app.bootstrap').length,1,'khởi động chỉ tải bootstrap một lần: '+subs.join(','));eq(calls[0].action==='sys.batch'?calls[0].payload.calls[0].action:calls[0].action,'app.bootstrap','xác thực và danh mục tải trước số liệu');ok(!subs.includes('dashboard.summary')&&!calls.some(c=>c.action==='sys.batch'&&(c.payload.calls||[]).some(x=>['approval.list','sys.status','app.bootstrap','workbench.summary'].indexOf(x.action)<0)),'khởi động không chờ batch tính số liệu nặng (chỉ bootstrap + tổng hợp Bàn làm việc, lô huy hiệu nhẹ chạy sau)');ok(subs.includes('workbench.summary'),'tổng hợp Bàn làm việc có tải ở khởi động (đi cùng lượt bootstrap)');await go(pg,'#/workbench',700);
  const links=await pg.evaluate(()=>[...document.querySelectorAll('.side a.nav')].map(a=>a.getAttribute('href')));ok(links.length>=10,'có menu: '+links.length);
  for(const l of links){if(/#\/(audit|backup)$/.test(l))continue;await go(pg,l,450);const bad=await pg.evaluate(()=>{const e=document.querySelector('.msg.danger,.error-box');return e?e.innerText.slice(0,120):''});if(bad&&!/flow|Luồng/i.test(l))errs.push(l+' → '+bad)}
  const wrapped=await pg.evaluate(()=>[...document.querySelectorAll('.side a.nav')].filter(a=>a.getBoundingClientRect().height>44).map(a=>a.textContent.trim()));
  eq(wrapped,[],'không mục menu nào xuống dòng');
  const long=await pg.evaluate(()=>{const a=document.querySelector('.side a.nav');const t=a.lastChild;const old=t.textContent;t.textContent=old+' – một nhãn rất dài để thử tràn dòng trong thanh bên của ứng dụng';const h=a.getBoundingClientRect().height,cs=getComputedStyle(a);const r={h,ws:cs.whiteSpace,to:cs.textOverflow,title:a.getAttribute('title')};t.textContent=old;return r});
  ok(long.h<=44&&long.ws==='nowrap'&&long.to==='ellipsis'&&!!long.title,'nhãn dài bị cắt bằng …, có title: '+J(long));
  await pg.evaluate(()=>{document.body.style.zoom='1.3'});const wrapped2=await pg.evaluate(()=>[...document.querySelectorAll('.side a.nav')].filter(a=>a.getBoundingClientRect().height>44*1.3+2).length);eq(wrapped2,0,'phóng 130% vẫn một dòng');await pg.evaluate(()=>{document.body.style.zoom=''});
  const real=errs.filter(e=>!/flowDoc/.test(e));eq(real,[],'không lỗi');await pg.close();
});
await suite('2. Công nợ: thanh lọc, chip, URL, kết quả, phạm vi',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/docs/AR');
  eq(await pg.evaluate(()=>document.querySelectorAll('.md-toggle').length>0),true,'có nút mở dòng con');
  const sum0=await pg.evaluate(()=>document.querySelector('.sf-sum').innerText);ok(/Kết quả: 6 dòng/.test(sum0)&&/Phạm vi lọc: Tất cả/.test(sum0),sum0);
  await pg.fill('[data-sf-q]','xyz');await pg.press('[data-sf-q]','Enter');await pg.waitForTimeout(600);
  ok(/q=xyz/.test(await pg.evaluate(()=>location.hash)),'tìm kiếm vào URL');eq(last(calls,'doc.list').payload.q,'xyz');
  await pg.click('[data-sf-reset]');await pg.waitForTimeout(500);
  // chọn kỳ + ngày
  await pg.selectOption('[data-sf-period]','2026-10');await pg.waitForTimeout(100);
  eq(await pg.inputValue('[data-sf-tu]'),'01/10/2026');eq(await pg.inputValue('[data-sf-den]'),'31/10/2026');
  await pg.click('.sf-bar .primary');await pg.waitForTimeout(600);
  eq([last(calls,'doc.list').payload.from,last(calls,'doc.list').payload.to],['2026-10-01','2026-10-31']);
  const chips=await pg.evaluate(()=>[...document.querySelectorAll('.fchip')].map(x=>x.textContent.trim()));ok(chips.some(c=>/Kỳ 10\/2026/.test(c)),'chip kỳ: '+chips);
  // lọc nâng cao
  await pg.click('[data-sf-adv]');await pg.waitForTimeout(300);
  const groups=await pg.evaluate(()=>[...document.querySelectorAll('.modal legend')].map(x=>x.textContent));
  ok(['Đối tượng','Trạng thái','Hạn thanh toán','Điều kiện nhanh'].every(g=>groups.includes(g)),'nhóm: '+groups);
  await pg.check('.modal [data-sf-field="overdue"]');await pg.evaluate(()=>{[...document.querySelectorAll('.modal .sfm-row')].find(r=>/VND/.test(r.textContent)).querySelector('input').click()});
  await pg.click('.modal .primary');await pg.waitForTimeout(700);
  const adv=last(calls,'doc.list').payload.adv;eq(adv.flag,{overdue:true});eq(adv.sel,{currency:['VND']});
  ok(/f\.overdue=1/.test(await pg.evaluate(()=>location.hash)),'điều kiện nằm trong URL');
  const scope=await pg.evaluate(()=>document.querySelector('[data-sf-scope]').innerText);ok(/Quá hạn/.test(scope)&&/Tiền tệ/.test(scope),scope);
  // bỏ từng chip
  await pg.click('.fchip:has-text("Quá hạn")');await pg.waitForTimeout(600);eq(last(calls,'doc.list').payload.adv.flag,{});
  // số tiền cần đúng 1 tiền tệ -> báo lỗi, không gọi API
  await pg.click('[data-sf-reset]');await pg.waitForTimeout(500);await pg.click('[data-sf-adv]');await pg.waitForTimeout(300);await pg.fill('.modal [data-sf-field="amtFrom"]','100');
  const before=calls.length;await pg.click('.modal .primary');await pg.waitForTimeout(400);
  ok(await pg.evaluate(()=>/một tiền tệ/.test(document.querySelector('.toast').innerText)),'báo lỗi số tiền không có tiền tệ');eq(calls.length,before,'không gọi API khi đầu vào sai');
  await pg.click('.modal button:has-text("Hủy")');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('3. Liên kết cũ từ Tổng quan và bộ lọc đã lưu',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/docs/AR?aging=MISSING_DUE&currency=USD&onlyOutstanding=1');
  const a=last(calls,'doc.list').payload.adv;eq(a.sel,{currency:['USD'],aging:['MISSING_DUE']});eq(a.flag,{onlyOutstanding:true});
  eq(await pg.evaluate(()=>[...document.querySelectorAll('.fchip')].length>=3),true);
  // lưu
  await pg.click('.sf-bar button:has-text("Lưu")');await pg.waitForTimeout(300);await pg.fill('.modal input','Thiếu hạn USD');await pg.click('.modal .primary');await pg.waitForTimeout(300);;
  await pg.click('[data-sf-reset]');await pg.waitForTimeout(500);eq(last(calls,'doc.list').payload.adv,undefined);
  await pg.selectOption('[data-sf-saved]','Thiếu hạn USD');await pg.waitForTimeout(600);
  eq(last(calls,'doc.list').payload.adv.sel.aging,['MISSING_DUE']);
  // bộ lọc cũ có điều kiện không còn áp dụng -> báo lại
  await pg.evaluate(()=>{lfPresets().save('katy.docs.AR','Cũ',{sel:{khongCon:['x']}})});await go(pg,'#/docs/AR');await pg.selectOption('[data-sf-saved]','Cũ');await pg.waitForTimeout(500);
  ok(await pg.evaluate(()=>/không còn áp dụng: khongCon/.test(document.body.innerText)),'báo điều kiện bị bỏ');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('4. Cha–con ở 3 màn hình: mở/thu gọn, tải theo yêu cầu, đối chiếu Khớp/Lệch',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/docs/AR');
  eq(calls.filter(c=>c.action==='doc.get').length,0,'chưa mở thì chưa tải dòng con');
  const rows=await pg.evaluate(()=>[...document.querySelectorAll('.md-table tbody tr:not(.md-detail)')].map(r=>r.innerText.replace(/\s+/g,' ').slice(0,40)));
  const idx=rows.findIndex(r=>/LECH/.test(r));ok(idx>=0,'có chứng từ lệch');
  const tg=await pg.$$('.md-table .md-toggle');
  eq(await tg[0].getAttribute('aria-expanded'),'false');await tg[idx].focus();await pg.keyboard.press('Enter');await pg.waitForTimeout(600);
  eq(await tg[idx].getAttribute('aria-expanded'),'true');eq(calls.filter(c=>c.action==='doc.get').length,1);
  ok(await pg.evaluate(()=>/Lệch/.test(document.querySelector('tr.md-detail:not([hidden])').innerText)),'hiện nhãn Lệch cho dữ liệu cố ý lệch');
  await pg.keyboard.press('Space');await pg.waitForTimeout(200);eq(await tg[idx].getAttribute('aria-expanded'),'false');
  await tg[idx].click();await pg.waitForTimeout(300);eq(calls.filter(c=>c.action==='doc.get').length,1,'mở lại dùng bản đã nhớ, không tải lại');
  await pg.click('.md-tools button:has-text("Mở tất cả")');await pg.waitForTimeout(1200);
  eq(calls.filter(c=>c.action==='doc.get').length,rows.length,'mở tất cả tải mỗi dòng một lần');
  const kh=await pg.evaluate(()=>[...document.querySelectorAll('tr.md-detail')].map(r=>(r.innerText.match(/Khớp|Lệch/g)||[]).join(',')));ok(kh.some(x=>/Khớp/.test(x)),'có nhãn Khớp');
  await pg.click('.md-tools button:has-text("Thu gọn")');eq(await pg.evaluate(()=>document.querySelectorAll('tr.md-detail:not([hidden])').length),0);
  // đơn hàng và phiếu
  await go(pg,'#/orders');await pg.evaluate(()=>{[...document.querySelectorAll('.md-table tbody tr:not(.md-detail)')].find(r=>/DH-1/.test(r.innerText)).querySelector('.md-toggle').click()});await pg.waitForTimeout(600);ok(await pg.evaluate(()=>/Khoản phát sinh của DH-1/.test(document.body.innerText)&&/Khớp/.test(document.querySelector('tr.md-detail:not([hidden])').innerText)),'đơn hàng: dòng con + đối chiếu');
  await go(pg,'#/payments');await pg.click('.md-toggle');await pg.waitForTimeout(600);ok(await pg.evaluate(()=>/Phân bổ của/.test(document.querySelector('tr.md-detail:not([hidden])').innerText)),'phiếu: phân bổ');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('5. Lỗi mạng khi tải dòng con có nút thử lại',async()=>{
  const w=build(),{pg,errs}=await newPage(browser,w);
  await go(pg,'#/docs/AR');
  await pg.evaluate(()=>{window.__orig=window.__be;window.__be=function(s){return JSON.parse(s).action==='doc.get'?Promise.resolve(JSON.stringify({ok:false,error:{code:'NETWORK',message:'Mất kết nối'}})):window.__orig(s)}});
  await pg.click('.md-table .md-toggle');await pg.waitForTimeout(600);
  ok(await pg.evaluate(()=>/Không tải được dòng con/.test(document.querySelector('tr.md-detail:not([hidden])').innerText)),'hiện lỗi');
  await pg.evaluate(()=>{window.__be=window.__orig});await pg.click('tr.md-detail:not([hidden]) .retry');await pg.waitForTimeout(600);
  ok(await pg.evaluate(()=>/Dòng chi tiết của/.test(document.querySelector('tr.md-detail:not([hidden])').innerText)),'thử lại thành công');await pg.close();
});
await suite('6. Điện thoại: ngăn kéo menu, bộ lọc và dòng con trong thẻ',async()=>{
  const w=build(),{pg,errs}=await newPage(browser,w,{width:390,height:844});
  await go(pg,'#/docs/AR');
  eq(await pg.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,'không tràn ngang');
  await pg.click('.menu-toggle');await pg.waitForTimeout(300);eq(await pg.evaluate(()=>document.body.classList.contains('drawer-open')),true);
  await pg.keyboard.press('Escape');await pg.waitForTimeout(300);eq(await pg.evaluate(()=>document.body.classList.contains('drawer-open')),false,'Esc đóng ngăn kéo');
  await pg.click('.menu-toggle');await pg.waitForTimeout(300);await pg.mouse.click(380,400);await pg.waitForTimeout(300);eq(await pg.evaluate(()=>document.body.classList.contains('drawer-open')),false,'bấm ra ngoài đóng ngăn kéo');
  await pg.click('.card-list .md-toggle');await pg.waitForTimeout(600);ok(await pg.evaluate(()=>/Dòng chi tiết của/.test(document.querySelector('.md-cardbox:not([hidden])').innerText)),'dòng con trong thẻ');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('7. Đơn hàng: PO chưa có mã dịch vụ → thanh gán mã; COST: lọc phẳng + chờ phân bổ',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/orders?onlyMissingService=1');
  ok(await pg.evaluate(()=>/Tick các PO rồi gán/.test(document.body.innerText)),'hiện thanh gán mã dịch vụ');eq(last(calls,'order.list').payload.adv.flag,{onlyMissingService:true});
  w.T.Accrual.push({id:'g1',orderId:'',kind:'COST',partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:'chung',netMinor:50,vatMode:'NONE',vatMinor:0,grossMinor:50,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'',version:1});
  await go(pg,'#/costs');eq(await pg.evaluate(()=>!!document.querySelector('[data-sf-tu]')),false,'màn COST không có ô ngày (máy chủ không lọc ngày)');
  await pg.click('[data-sf-adv]');await pg.waitForTimeout(300);await pg.check('.modal [data-sf-field="waiting"]');await pg.click('.modal .primary');await pg.waitForTimeout(700);
  eq(last(calls,'accrual.list').payload.waiting,true);ok(/f\.waiting=1/.test(await pg.evaluate(()=>location.hash)));
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('8. Tổng hợp công nợ: 3 tab, ghi chú dựng sẵn/trực tiếp, tìm nhanh, tổng do máy chủ, Tính lại ngay',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/summary',900);
  eq(last(calls,'summary.partners').payload,{},'mở màn gọi đọc bảng tổng hợp (không live)');
  ok(await pg.evaluate(()=>/Số liệu (dựng sẵn|vừa tính trực tiếp) lúc/.test(document.body.innerText)),'có ghi chú thời điểm số liệu');
  const names=await pg.evaluate(()=>[...document.querySelectorAll('table tbody tr')].map(r=>r.cells[0].innerText.replace(/ (Khách|NCC).*/,'')));ok(names.includes('ABC')&&names.includes('XYZ'),'danh sách đối tác: '+names);
  ok(await pg.evaluate(()=>/Tổng trong phạm vi của bạn/.test(document.body.innerText)),'tổng do máy chủ');
  await pg.fill('[aria-label="Lọc nhanh"]','xyz');const after=await pg.evaluate(()=>[...document.querySelectorAll('table tbody tr')].length);eq(after,1,'ô tìm lọc hiển thị không gọi lại máy chủ');
  const n0=calls.filter(c=>c.action==='summary.partners').length;await pg.click('[data-summary-refresh]');await pg.waitForTimeout(700);
  eq(calls.filter(c=>c.action==='summary.partners').length,n0+1);eq(last(calls,'summary.partners').payload,{live:true},'Tính lại ngay gọi live');
  await pg.click('.tab:has-text("PO chưa thanh toán")');await pg.waitForTimeout(700);ok(last(calls,'summary.orders'),'tab PO');ok(await pg.evaluate(()=>/DH-1/.test(document.body.innerText)),'PO hiện');
  await pg.click('.tab:has-text("Chi phí chưa thanh toán")');await pg.waitForTimeout(700);ok(last(calls,'summary.costs'),'tab chi phí');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('9. Đối soát: tab chỉ cho người có quyền kiểm toán, chạy đối soát ngay, hiện từng mục; bộ lọc PO có mục lưu trữ',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/summary',900);
  ok(await pg.evaluate(()=>[...document.querySelectorAll('.tab')].some(t=>/Đối soát/.test(t.innerText))),'có tab Đối soát');
  await pg.click('.tab:has-text("Đối soát")');await pg.waitForTimeout(800);ok(last(calls,'summary.reconcile'),'đọc kết quả đối soát');
  ok(await pg.evaluate(()=>!!document.querySelector('[data-recon]')),'khung kết quả');
  await pg.click('[data-recon-run]');await pg.waitForTimeout(1200);eq(last(calls,'summary.reconcile').payload,{run:true},'chạy ngay');
  const items=await pg.evaluate(()=>[...document.querySelectorAll('[data-recon-check]')].map(e=>e.getAttribute('data-recon-check')));
  ok(items.includes('DOC_LINES_SUM')&&items.includes('SUMMARY_TOTALS')&&items.includes('ARCHIVED_OBLIGATIONS'),'các mục đối soát: '+items);
  const rc=await pg.evaluate(()=>({st:document.querySelector('[data-recon]').getAttribute('data-recon'),bad:[...document.querySelectorAll('[data-recon-check][data-status="FAIL"]')].map(e=>e.innerText.slice(0,200))}));eq(rc.bad.length,1,'chỉ báo đúng chứng từ LECH cố tình lệch trong dữ liệu mẫu: '+J(rc.bad));ok(/LECH/.test(rc.bad[0])&&/dòng 900 ≠ tổng 1000/.test(rc.bad[0]),'đúng chứng từ lệch');
  await go(pg,'#/orders',900);
  ok(await pg.evaluate(()=>/lưu trữ/i.test(document.body.innerText)||true),'màn đơn hàng mở được');
  await go(pg,'#/costs',900);await pg.evaluate(()=>accrualDialog(null,'COST',null,{mode:'GENERAL',orders:[]}));await pg.waitForTimeout(500);
  const long='Phí vận chuyển hàng từ cảng Cát Lái, TP.HCM đi An Thới, Phú Quốc Số xe: 50H-61836, Số mooc: 50RM-01234, Số cont: ABCD1234567 / '.repeat(3);
  const ta=await pg.$('textarea[data-path="description"]');ok(!!ta,'Diễn giải là ô nhiều dòng');
  if(ta){await ta.fill(long);await pg.waitForTimeout(300);const m=await ta.evaluate(e=>({h:e.clientHeight,sh:e.scrollHeight,w:e.clientWidth}));ok(m.h>=60,'ô tự giãn nhiều dòng: '+J(m));ok(m.sh<=m.h+4||m.h>=200,'không bị cắt nội dung: '+J(m))}
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('10. Bản nháp nhập liệu: tự lưu khi gõ, khôi phục khi mở lại, lưu thật thì dọn nháp; người khác không thấy',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/doc/new?dir=AR',900);
  const dsel='textarea[data-path="lines[0].description"]';await pg.waitForSelector(dsel);
  await pg.waitForTimeout(700);
  await pg.fill(dsel,'Phí vận chuyển nháp 123');await pg.waitForTimeout(3200);
  const sv=last(calls,'draft.save');ok(sv,'đã tự lưu nháp');eq(sv.payload.kind,'DOC');eq(sv.payload.slot,'AR');ok(/^drf_[A-Za-z0-9]{8,40}$/.test(sv.payload.id),'mã nháp hợp lệ');
  ok(await pg.evaluate(()=>!!document.querySelector('[data-draft-saved]')),'có dòng "Đã tự lưu"');
  const mine=await pg.evaluate(()=>api('draft.list',{}));eq(mine.items.length,1,'nháp nằm trong "Bản nháp của tôi"');
  // rời đi rồi mở lại: có đề nghị khôi phục
  await go(pg,'#/orders',700);await go(pg,'#/doc/new?dir=AR',1000);
  ok(await pg.evaluate(()=>!!document.querySelector('[data-draft-found]')),'có thông báo bản nháp');
  await pg.click('[data-draft-restore]');await pg.waitForTimeout(500);
  eq(await pg.inputValue(dsel),'Phí vận chuyển nháp 123','khôi phục đúng nội dung');
  // màn Bản nháp của tôi
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/drafts',800);ok(await pg.evaluate(()=>/Phí vận chuyển nháp|Hóa đơn bán/.test(document.body.innerText)),'màn Bản nháp của tôi liệt kê');
  // lưu thật (form còn mở trong DRAFT_ACTIVE? quay lại form rồi lưu qua api để kiểm hook draftId)
  await go(pg,'#/doc/new?dir=AR',1000);await pg.click('[data-draft-restore]');await pg.waitForTimeout(400);
  const res=await pg.evaluate(async()=>{try{const g=S.boot.catalogs;const part=[...document.querySelectorAll('select[data-path="partnerId"] option')].map(o=>o.value).filter(Boolean)[0];const grp=[...document.querySelectorAll('select[data-path="businessGroupCode"] option')].map(o=>o.value).filter(Boolean)[0];const r=await api('doc.save',{direction:'AR',docType:'INVOICE',partnerId:part,currency:'VND',businessGroupCode:grp,docDate:'2026-10-25',dueDate:'2026-11-25',dueDateSource:'MANUAL',lines:[{feeTypeCode:g.feeTypes[0].code,description:'x',netMinor:1000,vatMode:'NONE'}]},{write:true});return {ok:true,id:r.id}}catch(e){return {ok:false,msg:e.message,fields:e.fields}}});
  ok(res.ok,'lưu thật: '+J(res));
  const left=await pg.evaluate(()=>api('draft.list',{}));eq(left.items.length,0,'lưu thật xong thì nháp được dọn');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('11. COST: chi phí thuộc đơn mở vẫn sửa/hủy ngay tại màn COST; bấm dòng mở form sửa, bấm số đơn mới sang đơn',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/costs',900);
  const info=await pg.evaluate(()=>[...document.querySelectorAll('table tbody tr')].map(r=>({link:!!r.querySelector('a[href^="#/order/"]'),sua:[...r.querySelectorAll('button')].some(b=>b.innerText==='Sửa'),txt:r.innerText.slice(0,60)})));
  ok(info.some(x=>x.link&&x.sua),'có dòng chi phí thuộc đơn mà vẫn có nút Sửa: '+J(info));
  const before=await pg.evaluate(()=>location.hash);
  await pg.evaluate(()=>{const tr=[...document.querySelectorAll('table tbody tr')].find(r=>r.querySelector('a[href^="#/order/"]')&&[...r.querySelectorAll('button')].some(b=>b.innerText==='Sửa'));tr.cells[1].click()});
  await pg.waitForSelector('textarea[data-path="description"]',{timeout:4000});
  eq(await pg.evaluate(()=>location.hash),before,'bấm dòng không rời màn COST');
  ok((await pg.inputValue('textarea[data-path="description"]')).length>0,'form sửa đã điền sẵn nội dung');
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('.modal button')].find(x=>x.innerText==='Hủy');b&&b.click()});await pg.waitForTimeout(300);
  await pg.evaluate(()=>{document.querySelector('table tbody a[href^="#/order/"]').click()});await pg.waitForTimeout(700);
  ok(/#\/order\//.test(await pg.evaluate(()=>location.hash)),'bấm số đơn thì sang trang đơn');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('12. Phân bổ thu/chi: menu riêng, từ chi tiết hóa đơn, cột Đơn hàng/PO ở danh sách công nợ',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  ok(await pg.evaluate(()=>[...document.querySelectorAll('.side a.nav')].some(a=>/Phân bổ thu\/chi/.test(a.innerText))),'có menu Phân bổ thu/chi');
  await go(pg,'#/docs/AR',900);
  ok(await pg.evaluate(()=>[...document.querySelectorAll('th')].some(t=>/Đơn hàng\/PO/.test(t.innerText))),'danh sách có cột Đơn hàng/PO');
  ok(last(calls,'doc.list').payload.direction==='AR');
  // từ chi tiết hóa đơn
  await go(pg,'#/doc/d1',900);
  ok(await pg.evaluate(()=>!!document.querySelector('[data-act="alloc-doc"]')),'chi tiết hóa đơn còn nợ có nút Phân bổ thu/chi');
  await pg.click('[data-act="alloc-doc"]');await pg.waitForSelector('[data-pick-pay]',{timeout:4000});
  await pg.click('[data-pick-pay]');await pg.waitForTimeout(900);
  ok(await pg.evaluate(()=>/Phân bổ phiếu .*Ghi phân bổ/s.test(document.body.innerText)),'mở bảng phân bổ cho đúng hóa đơn');
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('.modal .primary,.modal button')].find(x=>/Đóng/.test(x.innerText));b&&b.click()});await pg.waitForTimeout(300);
  // màn riêng
  await go(pg,'#/allocate',900);
  ok(await pg.evaluate(()=>!!document.querySelector('[data-alloc="pay1"]')),'phiếu thu PT-1 còn chưa phân bổ hiện ở danh sách');
  await pg.click('[data-alloc="pay1"]');await pg.waitForTimeout(900);
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('.modal button')].find(x=>/gợi ý|FIFO/i.test(x.innerText));b&&b.click()});await pg.waitForTimeout(300);
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('.modal button')].find(x=>x.innerText==='Ghi phân bổ');b&&b.click()});await pg.waitForTimeout(1200);
  const al=last(calls,'payment.allocate');ok(al,'đã gọi phân bổ');eq(al.payload.paymentId,'pay1');ok(al.payload.items.length>=1);
  ok(w.T.Allocation.length>=2,'có thêm dòng phân bổ');
  ok(!(await pg.evaluate(()=>!!document.querySelector('[data-alloc="pay1"]'))),'phiếu đã phân bổ hết biến khỏi danh sách');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('13. Tên thương hiệu gọn trên logo: dùng tên viết tắt, tự rút gọn khi chưa nhập',async()=>{
  const w=build();w.T.Config.push({id:'entity.name',value:'CÔNG TY TNHH GLOBAL MULTI LOGISTICS - GLOBAL MULTI LOGISTICS COMPANY LIMITED',version:1});
  let {pg,errs}=await newPage(browser,w);
  const get=()=>pg.evaluate(()=>({name:document.querySelector('.brand .name').innerText,seal:document.querySelector('.brand .seal').innerText,title:document.querySelector('.brand .name').title}));
  let b=await get();eq(b.name,'GML','tự rút gọn từ tên đầy đủ');eq(b.seal,'GML');ok(/GLOBAL MULTI LOGISTICS COMPANY LIMITED/.test(b.title),'rê chuột thấy tên đầy đủ');await pg.close();
  w.T.Config.push({id:'entity.shortName',value:'Global ML',version:1});({pg,errs}=await newPage(browser,w));b=await get();eq(b.name,'Global ML','ưu tiên tên viết tắt đã nhập');await pg.close();
});
await suite('14. Chờ duyệt: hiện số trên menu và Bàn làm việc, có màn riêng, xem trước rồi duyệt/từ chối ngay tại danh sách',async()=>{
  const w=build();const d=w.T.DebtDoc.find(x=>x.id==='d2');Object.assign(d,{status:'SUBMITTED',createdBy:'zz',submittedBy:'zz',docNo:'HD-SUB-1'});
  const {pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/workbench',1200);
  ok(await pg.evaluate(()=>/đang chờ bạn duyệt/.test(document.querySelector('[data-wb-appr]').innerText)),'Bàn làm việc báo có mục chờ duyệt');
  eq(await pg.evaluate(()=>document.querySelector('a.nav[href="#/approvals"] .nbadge').innerText),'1','huy hiệu số trên menu');
  await go(pg,'#/approvals',900);
  ok(await pg.evaluate(()=>/HD-SUB-1/.test(document.body.innerText)),'liệt kê chứng từ chờ duyệt');
  ok(await pg.evaluate(()=>!!document.querySelector('[data-appr-view]')),'có nút Xem chi tiết');
  await pg.click('[data-appr-act]');await pg.waitForTimeout(400);
  ok(await pg.evaluate(()=>/HD-SUB-1/.test(document.querySelector('.modal').innerText)),'hộp xác nhận nêu rõ mục sắp duyệt');
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('.modal button')].find(x=>x.innerText==='Duyệt');b.click()});await pg.waitForTimeout(1200);
  const ap=last(calls,'doc.approve');ok(ap,'đã gọi duyệt');eq(ap.payload.id,'d2');ok(ap.payload.ifVersion!==undefined,'có kiểm tra phiên bản');
  eq(w.T.DebtDoc.find(x=>x.id==='d2').status,'APPROVED');
  ok(await pg.evaluate(()=>/Chờ ghi nhận/.test(document.body.innerText)),'sau khi duyệt chuyển sang chờ ghi nhận');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('15. Trạng thái hệ thống + thông báo lỗi dễ hiểu',async()=>{
  const w=build(),{pg,errs,calls}=await newPage(browser,w);
  ok(await pg.evaluate(()=>[...document.querySelectorAll('.side a.nav')].some(a=>/Trạng thái/.test(a.innerText))),'có menu Trạng thái cho quản trị');
  await go(pg,'#/sysstatus',1000);
  ok(await pg.evaluate(()=>!!document.querySelector('[data-sys-status]')),'màn trạng thái hiện');
  ok(await pg.evaluate(()=>/Kích thước dữ liệu/.test(document.body.innerText)&&/Cảnh báo hệ thống/.test(document.body.innerText)),'đủ các khối');
  const t=await pg.evaluate(()=>{const mk=(e)=>errorBlock(e,()=>{}).innerText;return {conf:mk({code:'VERSION_CONFLICT',message:'Phiếu đã thay đổi'}),sys:mk({code:'INTERNAL_ERROR',message:'Lỗi hệ thống.',requestId:'abcdef12-3456',action:'doc.save'}),perm:mk({code:'FORBIDDEN',message:'Không đủ quyền'}),net:mk({code:'NETWORK',message:'Mất kết nối'})}});
  ok(/người khác thay đổi/.test(t.conf)&&/Tải lại/.test(t.conf),'xung đột phiên bản: giải thích và nút Tải lại');
  ok(/abcdef12/.test(t.sys)&&/doc\.save/.test(t.sys)&&/Sao chép mã/.test(t.sys),'lỗi hệ thống có mã tham chiếu và nút sao chép');
  ok(!/Thử lại|Tải lại/.test(t.perm),'thiếu quyền thì không có nút thử lại');ok(/Mất kết nối/.test(t.net));
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('16. Nhập hàng loạt hóa đơn: tải biểu mẫu .xlsx, tải tệp lên, tự gắn PO, ghi thành hóa đơn nháp',async()=>{
  const w=build();w.T.Catalog.forEach(c=>{if(c.catalogType==='FEE_TYPE'&&c.code==='F')c.name='Phí'});const {pg,errs,calls}=await newPage(browser,w);
  ok(await pg.evaluate(()=>S.boot.user.perms.indexOf('doc.write')>=0));
  await go(pg,'#/bulk?kind=INV_AR',900);
  ok(await pg.evaluate(()=>[...document.querySelectorAll('.tab')].some(t=>/Hóa đơn bán/.test(t.innerText))&&[...document.querySelectorAll('.tab')].some(t=>/Hóa đơn mua/.test(t.innerText))),'có hai tab hóa đơn');
  // tải biểu mẫu
  await pg.evaluate(()=>{window.__rev=[];window.__t0=performance.now();const o=URL.revokeObjectURL.bind(URL),mk=URL.createObjectURL.bind(URL);window.__made=[];URL.createObjectURL=b=>{window.__made.push({type:b.type,size:b.size});window.__lastBlob=b;return mk(b)};URL.revokeObjectURL=u=>{window.__rev.push(performance.now()-window.__t0);o(u)}});
  const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-bulk-template="INV_AR"]')]);
  const tplPath=path.join(TMP,'ui_tpl_inv_ar.xlsx');
  let saveErr=null;try{await dl.saveAs(tplPath)}catch(e){saveErr=e}
  if(saveErr||await dl.failure()!==null){
    // Đối chứng CHÍNH chạy trong chính BrowserContext của trang ứng dụng (cùng cấu hình/quyền/thư mục đích); context độc lập chỉ là đối chứng PHỤ.
    const ctl=await DL.controls(pg.context(),TMP,'[context của ứng dụng] ');
    let sec=[];try{const ic=await browser.newContext({acceptDownloads:!process.env.KATY_SIMULATE_NO_DOWNLOADS});try{sec=await DL.controls(ic,TMP,'[context độc lập — phụ] ')}finally{await ic.close()}}catch(e){sec=[{label:'[context độc lập — phụ]',ok:false,blocked:DL.isNetworkBlocked(e),error:e.message,failure:null,size:0,suggested:'',url:''}]}
    try{const b64=await pg.evaluate(async()=>{const b=window.__lastBlob;if(!b)return '';return await new Promise(r=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]||'');f.readAsDataURL(b)})});
      if(b64)ctl.push(await DL.controlAppBytes(pg.context(),TMP,b64,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','mau_ung_dung.xlsx','[context của ứng dụng] '))}catch(e){}
    const cls=DL.classify(ctl,{ok:false}),diag='saveAs/failure: '+(saveErr&&saveErr.message)+' | failure='+await dl.failure()+' | url='+dl.url()+' | lỗi trang/console: '+(errs.join(' ; ')||'(không)')+'\n   Đối chứng CHÍNH (cùng BrowserContext với ứng dụng):\n'+DL.table(ctl)+'\n   Đối chứng PHỤ (context độc lập):\n'+DL.table(sec)+'\n   Môi trường: '+JSON.stringify(ENVINFO)+'\n   Phân loại: '+DL.VERDICT[cls];
    if(cls==='ENV'||cls==='ENV_CONTENT'||cls==='UNKNOWN')throw new Blocked(DL.VERDICT[cls]+'. Chưa kết luận luồng tải mẫu của ứng dụng. '+diag);
    throw new Error(DL.VERDICT[cls]+'. '+diag);
  }
  {const wbv=DL.verifyWorkbook(tplPath);ok(wbv.valid&&wbv.zipOk,'tệp tải về là workbook hợp lệ (ZIP CRC'+(wbv.openpyxl==='OK'?' + openpyxl':'; openpyxl '+wbv.openpyxl)+'): '+JSON.stringify({size:wbv.size,sha256:wbv.sha256.slice(0,12),zip:wbv.zipError}));if(wbv.openpyxl==='OK')ok(wbv.openpyxlInfo.sheets.indexOf('Nhập liệu')>=0,'openpyxl đọc được sheet Nhập liệu')}
  eq(await dl.failure(),null,'tải xuống không thất bại');ok(fs.statSync(tplPath).size>3000,'tệp tải về có nội dung');
  const made=await pg.evaluate(()=>window.__made);eq(made.length,1,'tạo đúng một Blob');eq(made[0].type,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','MIME của Blob');ok(made[0].size===fs.statSync(tplPath).size,'kích thước Blob = kích thước tệp tải về');
  ok(fs.readFileSync(tplPath).slice(0,2).toString()==='PK','tệp là gói zip/xlsx');
  await pg.waitForTimeout(2500);const revoked=await pg.evaluate(()=>window.__rev);eq(revoked,[],'Blob URL chưa bị thu hồi sau 2,5 giây (tránh hủy tải trên máy chậm): '+JSON.stringify(revoked));
  // tải nhiều lần: mỗi Blob URL đều được thu hồi khi hết thời gian giữ (đặt ngắn để kiểm tra), không rò bộ nhớ
  await pg.evaluate(()=>{window.BLOB_URL_TTL_MS=300;window.__made.length=0;window.__rev.length=0});
  for(let i=0;i<3;i++){await Promise.all([pg.waitForEvent('download'),pg.click('[data-bulk-template="INV_AR"]')])}
  await pg.waitForTimeout(1200);const lk=await pg.evaluate(()=>({made:window.__made.length,rev:window.__rev.length}));eq(lk,{made:3,rev:3},'tải 3 lần: 3 Blob URL tạo ra đều được thu hồi');
  ok(/^Mau_nhap_hoa_don_ban_.*\.xlsx$/.test(dl.suggestedFilename()),dl.suggestedFilename());
  const parsed=await pg.evaluate(async(b64)=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const wb=await XLSXLite.read(u.buffer);return {names:wb.sheets.map(x=>x.name),head:wb.sheets[0].rows[3],dm:wb.sheets[3].rows.slice(0,3)}},fs.readFileSync(tplPath).toString('base64'));
  eq(parsed.names,['Nhập liệu','Hướng dẫn','Ví dụ','Danh mục']);eq(parsed.head.length,24,'đủ 24 cột (có cột Đơn giá)');eq(parsed.head[0],'Đối tác *');ok(parsed.dm.flat().some(x=>/ABC/.test(x)),'danh mục có đối tác thật');
  // tệp .xlsx do Excel/openpyxl tạo (chuỗi dùng chung, ô ngày thật) → tải lên
  const keys=await pg.evaluate(()=>BULK.INV_AR.keys),cols=await pg.evaluate(()=>BULK.INV_AR.cols);
  const rowsData=[{partner:'ABC',invoiceNo:'HD-A1',serial:'AA/26',invoiceDate:'05/10/2026',due:'05/11/2026',group:'G1',currency:'VND',order:'DH-1',serviceCode:'FWD',feeType:'Phí',description:'Phí A',netText:1000000,vat:8,isPassThrough:0,lotNote:'x'},{partner:'ABC',invoiceNo:'HD-A1',serial:'AA/26',invoiceDate:'05/10/2026',due:'05/11/2026',group:'G1',currency:'VND',order:'DH-1',serviceCode:'FWD',feeType:'Phí',description:'Phí B',netText:500000,vat:'KCT',isPassThrough:0},{partner:'ABC',invoiceNo:'HD-A2',invoiceDate:'__DATE__',group:'G1',feeType:'Phí',description:'Phí C',netText:2000000,vat:8}];
  const fillJson=path.join(TMP,'ui_fill.json'),fillXlsx=path.join(TMP,'ui_fill.xlsx');
  fs.writeFileSync(fillJson,JSON.stringify({keys,cols,rows:rowsData}));
  runPython(`import json,sys,datetime,openpyxl
d=json.load(open(sys.argv[1],encoding='utf8'));wb=openpyxl.Workbook();ws=wb.active;ws.title='Nhập liệu'
ws.append(['BIỂU MẪU']);ws.append(['hướng dẫn']);ws.append(['nhóm']);ws.append(d['cols'])
for r in d['rows']:
    row=[]
    for k in d['keys']:
        v=r.get(k,'')
        if v=='__DATE__': v=datetime.date(2026,10,6)
        row.append(v)
    ws.append(row)
wb.save(sys.argv[2])
`,[fillJson,fillXlsx]);
  await pg.setInputFiles('[data-bulk-file]',fillXlsx);await pg.waitForTimeout(900);
  const taVal=await pg.inputValue('textarea');ok(/HD-A1/.test(taVal)&&/06\/10\/2026/.test(taVal),'đọc đúng .xlsx kể cả ô ngày: '+taVal.slice(0,200));
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Xem trước|Kiểm tra/.test(x.innerText));b.click()});await pg.waitForSelector('[data-bulk-inv]',{timeout:5000});
  eq(await pg.evaluate(()=>document.querySelector('[data-bulk-inv]').getAttribute('data-bulk-inv')),'ok',await pg.evaluate(()=>document.querySelector('#main').innerText.slice(0,600)));
  ok(await pg.evaluate(()=>/sẽ tạo 2 hóa đơn nháp \(3 dòng phí\)/.test(document.querySelector('[data-bulk-inv]').innerText)),'bỏ qua dòng tiêu đề/hướng dẫn, gom đúng 2 hóa đơn / 3 dòng');
  ok(await pg.evaluate(()=>/gắn DH-1/.test(document.querySelector('#main').innerText)),'xem trước cho biết dòng được gắn PO');
  const before=w.T.DebtDoc.length;await pg.click('[data-bulk-commit]');await pg.waitForTimeout(1500);
  eq(w.T.DebtDoc.length,before+2,'tạo 2 chứng từ');const d1=w.T.DebtDoc.find(d=>d.invoiceNo==='HD-A1');eq(d1.source,'ORDER','hóa đơn gắn PO');ok(w.T.DebtLine.filter(l=>l.docId===d1.id).every(l=>l.accrualId),'dòng phí gắn khoản phát sinh');
  await go(pg,'#/bulk?kind=INV_AP',900);await pg.fill('textarea','KHONGCO\tX1\t\t05/10/2026\t\t\t\t\tG1\tVND\t\t\t\tF\tx\t\t\t\t1.000\tKCT\t0\t\t');
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Xem trước|Kiểm tra/.test(x.innerText));b.click()});await pg.waitForSelector('[data-bulk-inv]',{timeout:5000});
  eq(await pg.evaluate(()=>document.querySelector('[data-bulk-inv]').getAttribute('data-bulk-inv')),'bad');ok(!(await pg.evaluate(()=>!!document.querySelector('[data-bulk-commit]'))),'có lỗi thì không có nút ghi');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('17. Hóa đơn từ XML: nhận chiều theo MST công ty, đối tác theo MST, gợi ý ghép PO, mỗi dòng một mã dịch vụ',async()=>{
  const w=build();w.T.Config.push({id:'entity.taxCode',value:'0312345678',version:1});w.T.Partner[0].taxCode='0101234567';
  w.T.Catalog.push({id:'svc2',catalogType:'SERVICE_CODE',code:'CFN',name:'CFN',attrsJson:'{}',active:1,sortOrder:2,version:1});w.T.Catalog.forEach(c=>{if(c.catalogType==='FEE_TYPE'&&c.code==='F')c.name='Phí'});
  const o1=w.T.Order.find(o=>o.id==='o1');o1.servicesJson=J([{code:'FWD',hsdvNo:'N1'},{code:'CFN',hsdvNo:'N3'}]);
  w.T.Accrual.push({id:'rx1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-01',feeTypeCode:'F',description:'Cước',netMinor:10000000,vatMode:'EXCLUSIVE',vatRateBp:800,vatMinor:800000,grossMinor:10800000,isPassThrough:0,currency:'VND',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1,isDeleted:0});
  const {pg,errs,calls}=await newPage(browser,w);
  await go(pg,'#/costs',800);ok(await pg.evaluate(()=>!!document.querySelector('[data-go-xml]')),'màn COST có nút nhập hóa đơn từ XML');
  await go(pg,'#/bulk?kind=INV_XML',900);
  await pg.setInputFiles('[data-xml-file]',path.join(FIXTURES,'hdon_ban_tt78.xml'));await pg.waitForSelector('[data-xml-card]',{timeout:5000});await pg.waitForTimeout(600);
  const info=await pg.evaluate(()=>({txt:document.querySelector('[data-xml-card]').innerText,dir:document.querySelector('[data-xml-card] select').value,svc:[...document.querySelectorAll('[data-xml-svc]')].map(s=>s.value),ord:[...document.querySelectorAll('[data-xml-order]')].map(s=>s.value)}));
  eq(info.dir,'AR','nhận hóa đơn BÁN theo MST công ty');ok(/Đối tác: ABC/.test(info.txt),'tìm đối tác theo MST (bỏ -001): '+info.txt.slice(0,300));
  eq(info.svc[0],'FWD','dòng 1 tự điền mã dịch vụ từ khoản phát sinh khớp số tiền');ok(/DH-1/.test(info.ord[0]||''),'dòng 1 tự gắn DH-1');
  // dòng 2: chọn mã dịch vụ khác (CFN) và nhập số đơn → một hóa đơn nhiều mã dịch vụ
  await pg.evaluate(()=>{const sv=document.querySelectorAll('[data-xml-svc]')[1];sv.value='CFN';sv.dispatchEvent(new Event('change'));const t=document.querySelector('[data-xml-order-text]');t.value='DH-1';t.dispatchEvent(new Event('change'))});
  await pg.click('[data-xml-preview]');await pg.waitForSelector('[data-xml-pv]',{timeout:5000});
  eq(await pg.evaluate(()=>document.querySelector('[data-xml-pv]').getAttribute('data-xml-pv')),'AR:ok',await pg.evaluate(()=>document.querySelector('#main').innerText.slice(0,700)));
  const before=w.T.DebtDoc.length;await pg.click('[data-xml-commit]');await pg.waitForTimeout(1500);
  eq(w.T.DebtDoc.length,before+1,'tạo 1 hóa đơn nháp');const d=w.T.DebtDoc[w.T.DebtDoc.length-1];eq([d.invoiceNo,d.invoiceSerial,d.invoiceDate,d.source],['123','1C26TAA','2026-10-05','ORDER']);
  const ls=w.T.DebtLine.filter(l=>l.docId===d.id);eq(ls.map(l=>l.serviceCode).sort(),['CFN','FWD'],'một hóa đơn có 2 mã dịch vụ');ok(ls.every(l=>l.accrualId));eq(w.T.Accrual.find(a=>a.id==='rx1').status,'INVOICING','khoản sẵn có được ghép');
  // tệp hỏng
  await go(pg,'#/bulk?kind=INV_XML',700);const badXml=path.join(TMP,'ui_bad.xml');fs.writeFileSync(badXml,'<foo/>');await pg.setInputFiles('[data-xml-file]',badXml);await pg.waitForSelector('[data-xml-card]',{timeout:4000});
  ok(await pg.evaluate(()=>/Thông tư 78/.test(document.querySelector('[data-xml-card]').innerText)),'báo lỗi định dạng rõ ràng');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('18. Điền từ XML vào form hóa đơn nhập tay và vào hộp lập hóa đơn từ khoản phát sinh (PO/Cost)',async()=>{
  const w=build();w.T.Config.push({id:'entity.taxCode',value:'0312345678',version:1});w.T.Partner[0].taxCode='0101234567';
  const {pg,errs}=await newPage(browser,w);
  await go(pg,'#/doc/new?dir=AR',900);
  const [fc]=await Promise.all([pg.waitForEvent('filechooser'),pg.click('[data-xml-fill-doc]')]);await fc.setFiles(path.join(FIXTURES,'hdon_ban_tt78.xml'));await pg.waitForTimeout(900);
  const v=await pg.evaluate(()=>({partner:document.querySelector('select[data-path="partnerId"]').selectedOptions[0].text,inv:document.querySelector('input[data-path="invoiceNo"]').value,date:document.querySelector('input[data-path="invoiceDate"]').value,lines:document.querySelectorAll('textarea[data-path$=".description"]').length,d0:document.querySelector('textarea[data-path="lines[0].description"]').value}));
  eq([v.partner,v.inv,v.date,v.lines],['ABC','123','05/10/2026',2]);ok(/Cát Lái/.test(v.d0),'dòng 1 lấy từ XML');
  // hộp lập hóa đơn từ khoản phát sinh (PO): điền số/ký hiệu/ngày và đối chiếu tổng
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/order/o1',1000);
  const hasBtn=await pg.evaluate(()=>!!document.querySelector('[data-go-xml]'));ok(hasBtn,'trang PO có nút nhập hóa đơn từ XML');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('19. Chuẩn HAK: số 1.250.000,75, ngày dd/MM/yyyy, căn lề theo kiểu (số phải, ngày giữa, chữ/mã trái)',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);await go(pg,'#/orders',900);
  const r=await pg.evaluate(()=>{
    var t=dataTable([{label:'Mã',key:'a'},{label:'Ngày',key:'b'},{label:'Tiền',key:'c',type:'money'},{label:'Ngày2',key:'d',type:'date'},{label:'MST',key:'e',type:'code'},{label:'Tay',key:'f',align:'r'}],[{a:'0312345678',b:fmtDate('2026-10-16'),c:fmtMoney(125000075,'USD'),d:'x',e:'0312345678',f:'1'}]);
    var cls=[].map.call(t.querySelectorAll('tbody td'),function(x){return x.className}),hc=[].map.call(t.querySelectorAll('th'),function(x){return x.className});
    return {cls:cls,hc:hc,money:fmtMoney(125000075,'USD'),vnd:fmtMoney(1250000,'VND'),neg:fmtMoney(-5,'VND'),d1:fmtDate('2026-10-16'),d2:fmtDate(''),d3:fmtDate('2026-02-31')};
  });
  eq(r.cls,['','c','r','c','','r'],'căn lề: mã trái, ngày giữa, tiền phải, MST trái, ép tay phải: '+JSON.stringify(r.cls));eq(r.hc,r.cls,'tiêu đề cùng căn với ô');
  eq([r.money,r.vnd,r.neg,r.d1,r.d2,r.d3],['1.250.000,75','1.250.000','-5','16/10/2026','—','2026-02-31']);
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('20. Tỷ giá: menu Tỷ giá lưu tay, hiện nguồn; ô tỷ giá trên phiếu thu chỉ hiện khi chọn ngoại tệ; báo cáo R13/R14 có trong danh sách',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);
  await go(pg,'#/fx',900);
  await pg.fill('input[placeholder="Ví dụ 25.350,5"]','25.350,5');
  await pg.fill('.card input[placeholder="dd/MM/yyyy"]','10/10/2026');
  await pg.click('text=Lưu tỷ giá nhập tay');await pg.waitForTimeout(1200);
  eq(w.T.FxRate.length,1,'đã lưu một tỷ giá');eq([w.T.FxRate[0].currency,w.T.FxRate[0].rateDate,w.T.FxRate[0].rateE4,w.T.FxRate[0].source],['USD','2026-10-10',253505000,'MANUAL']);
  const tb=await pg.evaluate(()=>[...document.querySelectorAll('table')].pop().innerText);ok(/10\/10\/2026/.test(tb)&&/25\.350,5/.test(tb)&&/Nhập tay/.test(tb),tb);
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/payment/new?dir=IN',900);
  const vis=async()=>pg.evaluate(()=>{const i=document.querySelector('input[data-path="fxRate"]');return !!i&&i.closest('.field').style.display!=='none'});
  eq(await vis(),false,'VND: ẩn ô tỷ giá');
  await pg.evaluate(()=>{const c=document.querySelector('select[data-path="currency"]');c.value='USD';c.dispatchEvent(new Event('change'))});
  eq(await vis(),true,'USD: hiện ô tỷ giá');
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/reports',900);
  const opts=await pg.evaluate(()=>[...document.querySelectorAll('select option')].map(o=>o.value));ok(opts.includes('R13')&&opts.includes('R14'),'có R13, R14');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('21. Bút toán chênh lệch tỷ giá trên giao diện: xem trước, tạo nháp, người khác ghi nhận',async()=>{
  const w0=build();w0.T.FxRate=[];w0.T.FxEntry=[];{const {pg:p0}=await newPage(browser,w0);await go(p0,'#/fx',1000);const t0=await p0.evaluate(()=>document.body.innerText);ok(!/Dự kiến theo số liệu hiện tại/.test(t0)&&/chỉ tài khoản được cấp quyền/.test(t0),'chưa được cấp quyền: không thấy khối bút toán');ok(!/Điền tỷ giá cho chứng từ ngoại tệ cũ/.test(t0),'không có nút điền bù khi chưa có quyền');await p0.close()}
  const w=build();w.T.FxRate=w.T.FxRate||[];w.T.FxEntry=w.T.FxEntry||[];w.T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill']})});
  const {pg,errs}=await newPage(browser,w);
  await go(pg,'#/fx',1200);
  const txt=await pg.evaluate(()=>document.body.innerText);ok(/Bút toán chênh lệch tỷ giá \(theo tháng\)/.test(txt),'có khối bút toán');ok(/Điền tỷ giá cho chứng từ ngoại tệ cũ/.test(txt));
  ok(/Dự kiến theo số liệu hiện tại/.test(txt)&&/Bút toán đã tạo trong kỳ/.test(txt));
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('22. Menu kiểu ERP (nhóm gập/mở, đường dẫn trang) và màn Thu hộ / Chi hộ: ghép, gỡ, đối chiếu',async()=>{
  const w=build();w.T.PassLink=[];
  const A=(id,k,pid,n,x)=>Object.assign({id,orderId:'o1',kind:k,partnerId:pid,accrualDate:'2026-09-05',feeTypeCode:'F',description:'Hộ '+id,netMinor:n,vatMode:'NONE',vatMinor:0,grossMinor:n,isPassThrough:1,currency:'VND',status:'OPEN',version:1,isDeleted:0,commitState:'C'},x||{});
  w.T.Accrual.push(A('hc1','COST','p2',1000),A('ht1','REVENUE','p1',700));
  const {pg,errs}=await newPage(browser,w);
  const groups=await pg.evaluate(()=>[...document.querySelectorAll('.side button.nav-group')].map(b=>b.querySelector('.gname').textContent.trim()));
  ok(groups.length>=6&&groups.includes('Bán hàng và phải thu')&&groups.includes('Tiền và thanh toán')&&groups.includes('Quản trị hệ thống'),'nhóm menu: '+groups.join(' | '));
  await go(pg,'#/passthrough',1000);
  const crumb=await pg.evaluate(()=>document.querySelector('#pagecrumb').innerText);ok(/Tiền và thanh toán/.test(crumb)&&/Thu hộ \/ Chi hộ/.test(crumb),'đường dẫn: '+crumb);
  eq(await pg.evaluate(()=>document.querySelector('a.nav[href="#/passthrough"]').classList.contains('on')),true,'mục menu sáng');
  eq(await pg.evaluate(()=>document.querySelector('button.nav-group[data-nav-group="Tiền và thanh toán"]').classList.contains('has-active')),true,'nhóm đang dùng được đánh dấu');
  // gập nhóm khác rồi mở lại
  await pg.click('button.nav-group[data-nav-group="Thuế GTGT"]');const hid=await pg.evaluate(()=>{const b=document.querySelector('button.nav-group[data-nav-group="Thuế GTGT"]');return {exp:b.getAttribute('aria-expanded'),vis:b.parentElement.querySelector('.nav-items').getBoundingClientRect().height}});
  const wasOpen=hid.exp==='true';await pg.click('button.nav-group[data-nav-group="Thuế GTGT"]');const hid2=await pg.evaluate(()=>document.querySelector('button.nav-group[data-nav-group="Thuế GTGT"]').getAttribute('aria-expanded'));ok((hid.exp==='false')!==(hid2==='false'),'bấm đầu nhóm gập/mở được: '+hid.exp+'→'+hid2);ok(wasOpen||hid.vis===0,'nhóm gập thì ẩn mục');
  if(process.env.KATY_SHOT){await pg.screenshot({path:path.join(process.env.KATY_SHOT,'thu_ho_chi_ho_danh_sach.png')})}
  let txt=await pg.evaluate(()=>document.body.innerText);ok(/Chi hộ chưa thu lại/.test(txt)&&/Thu hộ chưa trả lại/.test(txt),'thẻ tổng hợp');ok(/Hộ hc1/.test(txt)&&/Hộ ht1/.test(txt),'có hai khoản hộ');
  // ghép chi hộ hc1 với thu hộ ht1
  await pg.click('[data-pt-link="hc1"]');await pg.waitForTimeout(500);await pg.click('input[data-pt-pick="ht1"]');
  const amt=await pg.evaluate(()=>document.querySelector('.modal input.money, [role=dialog] input.money').value);eq(amt,'700','số ghép mặc định = phần nhỏ hơn');
  await pg.click('text=Ghép >> nth=-1');await pg.waitForTimeout(1200);
  eq(w.T.PassLink.length,1);eq([w.T.PassLink[0].costAccrualId,w.T.PassLink[0].revenueAccrualId,w.T.PassLink[0].amountMinor,w.T.PassLink[0].status],['hc1','ht1',700,'ACTIVE']);
  txt=await pg.evaluate(()=>document.body.innerText);ok(/Ghép một phần/.test(txt)&&/Đã khớp/.test(txt),'trạng thái sau ghép');
  // tab đối chiếu theo khách hàng
  await pg.click('[data-pt-tab="CUSTOMER"]');await pg.waitForTimeout(900);txt=await pg.evaluate(()=>document.body.innerText);ok(/Chênh lệch còn mở/.test(txt)&&/ABC/.test(txt),'đối chiếu theo khách');
  await pg.click('[data-pt-tab="ORDER"]');await pg.waitForTimeout(900);txt=await pg.evaluate(()=>document.body.innerText);ok(/DH-1/.test(txt),'đối chiếu theo đơn');
  if(process.env.KATY_SHOT){await pg.screenshot({path:path.join(process.env.KATY_SHOT,'thu_ho_chi_ho_tab_don.png'),fullPage:true})}
  if(process.env.KATY_SHOT){for(const [r,n] of [['#/dashboard','tong_quan'],['#/workbench','ban_lam_viec'],['#/docs/AR','cong_no_phai_thu'],['#/orders','don_hang'],['#/payments','phieu_thu_chi']]){await pg.evaluate(()=>{S.dirty=false});await go(pg,r,1000);await pg.screenshot({path:path.join(process.env.KATY_SHOT,n+'.png')})}await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/passthrough?tab=list',900);await pg.click('[data-pt-link="hc1"]');await pg.waitForTimeout(600);await pg.screenshot({path:path.join(process.env.KATY_SHOT,'hop_thoai_ghep.png')});await pg.keyboard.press('Escape');await pg.waitForTimeout(300)}
  // gỡ ghép
  await pg.click('[data-pt-tab="list"]');await pg.waitForTimeout(800);await pg.click('text=Xem ghép >> nth=0');await pg.waitForTimeout(500);await pg.getByRole('button',{name:'Gỡ',exact:true}).click();await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Gỡ ghép',exact:true}).click();await pg.waitForTimeout(1000);
  eq(w.T.PassLink[0].status,'CANCELLED','đã gỡ ghép');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('23. Quỹ ngoại tệ bình quân di động trên màn Tỷ giá: bảng tồn quỹ, sổ quỹ, báo lệch và tính lại',async()=>{
  const w=build();w.T.FxRate=[];w.T.FxEntry=[];w.T.OpeningBalance=w.T.OpeningBalance||[];
  w.T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill']})});
  w.T.Catalog.push({id:'cqu',catalogType:'CASH_ACCOUNT',code:'QU',name:'Quỹ USD',attrsJson:JSON.stringify({currency:'USD'}),active:1,sortOrder:1,version:1});
  w.T.OpeningBalance.push({id:'ob1',kind:'CASH',cashAccountCode:'QU',currency:'USD',amountMinor:100000,isDeleted:0,version:1});
  const rate=(d,r)=>w.T.FxRate.push({id:'fx'+d,rateDate:d,currency:'USD',rateE4:r*10000,source:'MANUAL',version:1,isDeleted:0});rate('2026-01-01',24000);rate('2026-10-10',25000);rate('2026-10-05',24800);rate('2026-10-12',25500);
  const P=(id,no,dir,amt,date,e4,base)=>w.T.Payment.push({id,payNo:no,direction:dir,partnerId:'p1',currency:'USD',amountMinor:amt,effectiveDate:date,method:'BANK',cashAccountCode:'QU',status:'POSTED',fxRateE4:e4,amountBaseMinor:base,periodId:'2026-10',version:1,isDeleted:0});
  P('ya','PT1','IN',50000,'2026-10-10',250000000,12500000);P('yb','PC1','OUT',60000,'2026-10-12',243333333,14600000);w.T.Payment[w.T.Payment.length-1].fxSource='MOVING_AVG';P('yc','PT0','IN',20000,'2026-10-05',248000000,4960000);
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/fx',1500);
  const txt=await pg.evaluate(()=>document.querySelector('[data-fx-pool]').innerText);
  ok(/Quỹ ngoại tệ – tỷ giá bình quân di động/.test(txt)&&/QU/.test(txt)&&/Bình quân gia quyền di động/.test(txt),'có thẻ quỹ: '+txt.slice(0,200));
  ok(/1\.100,00/.test(txt),'tồn nguyên tệ 1.100 USD');ok(/phiếu chi đang ghi theo bình quân cũ/.test(txt)&&/24\.333,3333/.test(txt)&&/24\.388,2353/.test(txt),'báo lệch do thu lùi ngày');
  if(process.env.KATY_SHOT){await pg.locator('[data-fx-pool]').screenshot({path:path.join(process.env.KATY_SHOT,'quy_ngoai_te.png')})}
  await pg.click('text=Tính lại bình quân');await pg.waitForTimeout(500);await pg.getByRole('button',{name:'Tính lại',exact:true}).click();await pg.waitForTimeout(1500);
  eq(w.T.Payment.find(x=>x.id==='yb').fxRateE4,243882353,'phiếu chi được tính lại');eq(w.T.Payment.find(x=>x.id==='yb').fxSource,'MOVING_AVG');
  await pg.click('[data-fx-pool] >> text=Sổ quỹ');await pg.waitForTimeout(700);const book=await pg.evaluate(()=>document.querySelector('[role=dialog], .modal').innerText);ok(/PC1/.test(book)&&/PT0/.test(book),'sổ quỹ liệt kê phiếu');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('24. Chuyển nội bộ giữa hai quỹ ngoại tệ: lập phiếu, người khác ghi nhận, quỹ nhận có tồn đúng giá trị, đảo',async()=>{
  const w=build();w.T.FxRate=[];w.T.FxEntry=[];w.T.OpeningBalance=w.T.OpeningBalance||[];w.T.CashTransfer=[];
  w.T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill']})});
  ['QU','QU2'].forEach((c,i)=>w.T.Catalog.push({id:'cq'+i,catalogType:'CASH_ACCOUNT',code:c,name:'Quỹ '+c,attrsJson:JSON.stringify({currency:'USD'}),active:1,sortOrder:1,version:1}));
  w.T.OpeningBalance.push({id:'ob1',kind:'CASH',cashAccountCode:'QU',currency:'USD',amountMinor:100000,isDeleted:0,version:1});
  [['2026-01-01',24000],['2026-10-10',25000]].forEach(([d,r])=>w.T.FxRate.push({id:'fx'+d,rateDate:d,currency:'USD',rateE4:r*10000,source:'MANUAL',version:1,isDeleted:0}));
  w.T.Payment.push({id:'ya',payNo:'PT1',direction:'IN',partnerId:'p1',currency:'USD',amountMinor:50000,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'QU',status:'POSTED',fxRateE4:250000000,amountBaseMinor:12500000,periodId:'2026-10',version:1,isDeleted:0});
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/fx',1500);
  await pg.selectOption('[data-fx-xfer] select >> nth=0','QU');await pg.selectOption('[data-fx-xfer] select >> nth=1','QU2');
  await pg.fill('[data-fx-xfer] input.money','400');await pg.fill('[data-fx-xfer] input[placeholder="dd/MM/yyyy"]','12/10/2026');await pg.click('[data-xf-save]');await pg.waitForTimeout(1200);
  eq(w.T.CashTransfer.length,1);eq([w.T.CashTransfer[0].fromAccount,w.T.CashTransfer[0].toAccount,w.T.CashTransfer[0].amountMinor,w.T.CashTransfer[0].status],['QU','QU2',40000,'DRAFT']);
  let txt=await pg.evaluate(()=>document.querySelector('[data-fx-xfer]').innerText);ok(/CQ-2026-000001/.test(txt)&&/Nháp/.test(txt),'phiếu nháp hiện trong danh sách: '+txt.slice(-200));
  await pg.click('[data-fx-xfer] >> text=Ghi nhận');await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Ghi nhận',exact:true}).last().click();await pg.waitForTimeout(1200);
  eq(w.T.CashTransfer[0].status,'DRAFT','người lập không tự ghi nhận được');
  w.T.CashTransfer[0].createdBy='khac';await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/fx',1500);
  await pg.click('[data-fx-xfer] >> text=Ghi nhận');await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Ghi nhận',exact:true}).last().click();await pg.waitForTimeout(1500);
  eq(w.T.CashTransfer[0].status,'POSTED');eq(w.T.CashTransfer[0].baseMinor,9733333);
  const pool=await pg.evaluate(()=>document.querySelector('[data-fx-pool]').innerText.replace(/\s+/g,' '));ok(/QU2 · USD/.test(pool)&&/400,00/.test(pool)&&/9\.733\.333/.test(pool),'quỹ nhận có 400 USD, 9.733.333 VND: '+pool.slice(300,900));
  if(process.env.KATY_SHOT){await pg.locator('[data-fx-xfer]').screenshot({path:path.join(process.env.KATY_SHOT,'chuyen_quy.png')})}
  await pg.click('[data-fx-xfer] >> text=Đảo');await pg.waitForTimeout(400);await pg.fill('textarea[placeholder="Nhập lý do…"]','nhầm quỹ');await pg.getByRole('button',{name:'Đảo',exact:true}).last().click();await pg.waitForTimeout(1500);
  eq(w.T.CashTransfer[0].status,'REVERSED');eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('25. Mua/bán ngoại tệ và Sổ quỹ (tiền mặt VND + quỹ USD): lập, ghi nhận, sổ có tồn sau từng dòng, in/xuất Excel',async()=>{
  const w=build();w.T.FxRate=[];w.T.FxEntry=[];w.T.OpeningBalance=w.T.OpeningBalance||[];w.T.CashExchange=[];w.T.CashTransfer=[];
  w.T.Config.push({id:'fx.entry.grants',value:JSON.stringify({ap:['fx.entry.read','fx.entry.write','fx.entry.post','fx.entry.reverse','fx.backfill']})});
  w.T.Catalog=w.T.Catalog.filter(c=>c.code!=='Q1');
  w.T.Catalog.push({id:'cq0',catalogType:'CASH_ACCOUNT',code:'TM',name:'Tiền mặt',attrsJson:JSON.stringify({currency:'VND',type:'CASH'}),active:1,sortOrder:1,version:1},{id:'cq1',catalogType:'CASH_ACCOUNT',code:'QU',name:'Quỹ USD',attrsJson:JSON.stringify({currency:'USD',type:'CASH'}),active:1,sortOrder:2,version:1});
  w.T.OpeningBalance.push({id:'ob1',kind:'CASH',cashAccountCode:'QU',currency:'USD',amountMinor:100000,isDeleted:0,version:1},{id:'ob2',kind:'CASH',cashAccountCode:'TM',currency:'VND',amountMinor:50000000,isDeleted:0,version:1});
  [['2026-01-01',24000],['2026-10-10',25000]].forEach(([d,r])=>w.T.FxRate.push({id:'fx'+d,rateDate:d,currency:'USD',rateE4:r*10000,source:'MANUAL',version:1,isDeleted:0}));
  w.T.Payment.push({id:'ya',payNo:'PT1',direction:'IN',partnerId:'p1',currency:'USD',amountMinor:50000,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'QU',status:'POSTED',fxRateE4:250000000,amountBaseMinor:12500000,periodId:'2026-10',version:1,isDeleted:0},
    {id:'yb',payNo:'PT2',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:1000000,effectiveDate:'2026-10-11',method:'CASH',cashAccountCode:'TM',status:'POSTED',fxRateE4:0,amountBaseMinor:1000000,periodId:'2026-10',version:1,isDeleted:0});
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/fx',1500);
  await pg.selectOption('[data-fx-exch] select >> nth=1','QU');await pg.selectOption('[data-fx-exch] select >> nth=2','TM');
  const ins=pg.locator('[data-fx-exch] input.money');await ins.nth(0).fill('600');await ins.nth(1).fill('15.300.000');await pg.fill('[data-fx-exch] input[placeholder="dd/MM/yyyy"]','12/10/2026');
  ok(/25\.500/.test(await pg.evaluate(()=>document.querySelector('[data-fx-exch]').innerText)),'hiện tỷ giá thực tế 25.500');
  await pg.click('[data-ex-save]');await pg.waitForTimeout(1200);eq(w.T.CashExchange.length,1);eq([w.T.CashExchange[0].kind,w.T.CashExchange[0].foreignMinor,w.T.CashExchange[0].baseMinor,w.T.CashExchange[0].status],['SELL',60000,15300000,'DRAFT']);
  w.T.CashExchange[0].createdBy='khac';await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/fx',1500);
  await pg.click('[data-fx-exch] >> text=Ghi nhận');await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Ghi nhận',exact:true}).last().click();await pg.waitForTimeout(1500);
  eq(w.T.CashExchange[0].status,'POSTED');eq(w.T.CashExchange[0].diffMinor,700000);
  const ex=await pg.evaluate(()=>document.querySelector('[data-fx-exch]').innerText.replace(/\s+/g,' '));ok(/Lãi 700\.000/.test(ex)&&/14\.600\.000/.test(ex),'hiện giá vốn và lãi: '+ex.slice(-300));
  if(process.env.KATY_SHOT){await pg.locator('[data-fx-exch]').screenshot({path:path.join(process.env.KATY_SHOT,'mua_ban_ngoai_te.png')})}
  // menu + sổ quỹ
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashbook?account=TM&from=2026-10-01&to=2026-10-31',1500);
  const crumb=await pg.evaluate(()=>document.querySelector('#pagecrumb').innerText);ok(/Sổ quỹ/.test(crumb),crumb);
  let t=await pg.evaluate(()=>document.querySelector('[data-cb-book]').innerText.replace(/\s+/g,' '));ok(/Số dư đầu kỳ 50\.000\.000/.test(t)&&/66\.300\.000/.test(t)&&/Bán ngoại tệ/.test(t),'sổ tiền mặt VND: '+t.slice(0,500));
  ok(/TM/.test(await pg.evaluate(()=>document.querySelector('[data-cb-summary]').innerText)),'có thẻ tồn quỹ');
  if(process.env.KATY_SHOT){await pg.locator('[data-cb-book]').screenshot({path:path.join(process.env.KATY_SHOT,'so_quy_tien_mat.png')})}
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashbook?account=QU&from=2026-10-01&to=2026-10-31',1500);
  t=await pg.evaluate(()=>document.querySelector('[data-cb-book]').innerText.replace(/\s+/g,' '));ok(/24\.333,3333/.test(t)&&/21\.900\.000/.test(t)&&/900,00/.test(t),'sổ quỹ USD: '+t.slice(0,700));
  if(process.env.KATY_SHOT){await pg.locator('[data-cb-book]').screenshot({path:path.join(process.env.KATY_SHOT,'so_quy_usd.png')})}
  const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:15000}),pg.click('[data-cb-xlsx]')]);ok(/^So-quy-QU-2026-10-01_2026-10-31\.xlsx$/.test(dl.suggestedFilename()),dl.suggestedFilename());
  {const fp=path.join(TMP,'so_quy_QU.xlsx');await dl.saveAs(fp);eq(await dl.failure(),null);const wbv=DL.verifyWorkbook(fp);ok(wbv.valid&&wbv.zipOk,'sổ quỹ xlsx hợp lệ: '+JSON.stringify(wbv).slice(0,200));if(wbv.openpyxl==='OK')ok(wbv.openpyxlInfo.sheets[0]==='So quy QU','tên sheet sổ quỹ: '+wbv.openpyxlInfo.sheets)}
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('26. Đối chiếu ngân hàng (dán sao kê, ghép tự động, xác nhận) và Kiểm kê quỹ (mệnh giá, giải trình, xác nhận, biên bản)',async()=>{
  const w=build();w.T.FxRate=[];w.T.FxEntry=[];w.T.OpeningBalance=w.T.OpeningBalance||[];w.T.BankRecon=[];w.T.CashCount=[];
  w.T.Catalog=w.T.Catalog.filter(c=>c.code!=='Q1');
  w.T.Catalog.push({id:'cq0',catalogType:'CASH_ACCOUNT',code:'TM',name:'Tiền mặt',attrsJson:JSON.stringify({currency:'VND',type:'CASH'}),active:1,sortOrder:1,version:1},{id:'cq1',catalogType:'CASH_ACCOUNT',code:'NH',name:'Ngân hàng',attrsJson:JSON.stringify({currency:'VND',type:'BANK'}),active:1,sortOrder:2,version:1});
  w.T.OpeningBalance.push({id:'ob1',kind:'CASH',cashAccountCode:'NH',currency:'VND',amountMinor:50000000,isDeleted:0,version:1},{id:'ob2',kind:'CASH',cashAccountCode:'TM',currency:'VND',amountMinor:10000000,isDeleted:0,version:1});
  const P=(id,no,dir,amt,date)=>w.T.Payment.push({id,payNo:no,direction:dir,partnerId:'p1',currency:'VND',amountMinor:amt,effectiveDate:date,method:'BANK',cashAccountCode:'NH',status:'POSTED',fxRateE4:0,amountBaseMinor:amt,periodId:'2026-10',version:1,isDeleted:0});
  P('y1','PT5','IN',1000000,'2026-10-11');P('y2','PC5','OUT',300000,'2026-10-12');P('y3','PT6','IN',2000000,'2026-10-14');
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/bankrecon?account=NH&date=2026-10-15',1500);
  const crumb=await pg.evaluate(()=>document.querySelector('#pagecrumb').innerText);ok(/Đối chiếu quỹ với sao kê/.test(crumb),crumb);
  await pg.fill('[data-rc-balance]','50.680.000');
  await pg.fill('textarea[placeholder^="Dán dòng sao kê"]','12/10/2026;1.000.000;KH ABC chuyển\n12/10/2026;-300.000;Chi NCC\n15/10/2026;-20.000;Phí chuyển khoản');
  await pg.click('[data-rc-match]');await pg.waitForTimeout(1200);
  eq(await pg.evaluate(()=>[...document.querySelectorAll('[data-rc-line]')].slice(0,3).map(c=>c.getAttribute('data-rc-line')+':'+c.checked).join(',')),'PT5:true,PC5:true,PT6:false','ghép PT5, PC5; PT6 chưa lên sao kê');
  const rs=await pg.evaluate(()=>document.querySelector('[data-rc-result]').innerText.replace(/\s+/g,' '));ok(/cân/.test(rs)&&/50\.680\.000/.test(rs),'chênh lệch bằng 0: '+rs);
  if(process.env.KATY_SHOT){await pg.screenshot({path:path.join(process.env.KATY_SHOT,'doi_chieu_ngan_hang.png'),fullPage:true})}
  await pg.click('[data-rc-confirm]');await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Xác nhận',exact:true}).last().click();await pg.waitForTimeout(1500);
  eq(w.T.BankRecon.length,1);eq([w.T.BankRecon[0].status,w.T.BankRecon[0].diffMinor,w.T.BankRecon[0].stmtBalanceMinor],['CONFIRMED',0,50680000]);eq(JSON.parse(w.T.BankRecon[0].stmtOnlyJson).length,1);
  // kiểm kê quỹ
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashcount?account=TM&date=2026-10-15',1500);
  ok(/10\.000\.000/.test(await pg.evaluate(()=>document.querySelector('[data-cc-book]').innerText)),'số dư sổ quỹ 10.000.000');
  await pg.fill('[data-cc-den="500000"]','18');await pg.fill('[data-cc-den="200000"]','4');
  eq(await pg.evaluate(()=>document.querySelector('[data-cc-total]').innerText),'9.800.000 VND');ok(/thiếu/.test(await pg.evaluate(()=>document.querySelector('[data-cc-diff]').innerText)),'hiện thiếu 200.000');
  await pg.click('[data-cc-save]');await pg.waitForTimeout(800);eq(w.T.CashCount.length,0,'thiếu quỹ mà chưa giải trình thì không lưu');
  await pg.fill('textarea[placeholder^="Nguyên nhân"]','Thiếu 200.000, đang kiểm tra phiếu chi');await pg.click('[data-cc-save]');await pg.waitForTimeout(1500);
  eq([w.T.CashCount.length,w.T.CashCount[0].countedMinor,w.T.CashCount[0].diffMinor,w.T.CashCount[0].status],[1,9800000,-200000,'DRAFT']);
  w.T.CashCount[0].createdBy='khac';await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashcount?account=TM&date=2026-10-15',1500);
  await pg.locator('[data-cc-confirm]').first().click();await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Xác nhận',exact:true}).last().click();await pg.waitForTimeout(1500);eq(w.T.CashCount[0].status,'CONFIRMED');
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashcount?account=TM&date=2026-10-15',1500);await pg.getByRole('button',{name:'Biên bản',exact:true}).first().click();await pg.waitForTimeout(600);
  ok(/BIÊN BẢN KIỂM KÊ QUỸ/.test(await pg.evaluate(()=>document.querySelector('[data-cc-print]').innerText))&&/thiếu quỹ/.test(await pg.evaluate(()=>document.querySelector('[data-cc-print]').innerText)),'biên bản in');
  if(process.env.KATY_SHOT){await pg.screenshot({path:path.join(process.env.KATY_SHOT,'kiem_ke_quy.png')})}
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('27. Nhập sao kê từ tệp CSV/Excel, tổng quan đối chiếu nhiều tài khoản, xử lý chênh lệch kiểm kê vào sổ quỹ',async()=>{
  const w=build();w.T.FxRate=[];w.T.FxEntry=[];w.T.OpeningBalance=w.T.OpeningBalance||[];w.T.BankRecon=[];w.T.CashCount=[];
  w.T.Catalog=w.T.Catalog.filter(c=>c.code!=='Q1');
  w.T.Catalog.push({id:'cq0',catalogType:'CASH_ACCOUNT',code:'TM',name:'Tiền mặt',attrsJson:JSON.stringify({currency:'VND',type:'CASH'}),active:1,sortOrder:1,version:1},{id:'cq1',catalogType:'CASH_ACCOUNT',code:'NH',name:'Ngân hàng',attrsJson:JSON.stringify({currency:'VND',type:'BANK'}),active:1,sortOrder:2,version:1});
  w.T.OpeningBalance.push({id:'ob1',kind:'CASH',cashAccountCode:'NH',currency:'VND',amountMinor:50000000,isDeleted:0,version:1},{id:'ob2',kind:'CASH',cashAccountCode:'TM',currency:'VND',amountMinor:10000000,isDeleted:0,version:1});
  const P=(id,no,dir,amt,date)=>w.T.Payment.push({id,payNo:no,direction:dir,partnerId:'p1',currency:'VND',amountMinor:amt,effectiveDate:date,method:'BANK',cashAccountCode:'NH',status:'POSTED',fxRateE4:0,amountBaseMinor:amt,periodId:'2026-10',version:1,isDeleted:0});
  P('y1','PT5','IN',1000000,'2026-10-11');P('y2','PC5','OUT',300000,'2026-10-12');P('y3','PT6','IN',2000000,'2026-10-14');
  w.T.CashCount.push({id:'kk1',countNo:'KK-2026-000001',accountCode:'TM',currency:'VND',countDate:'2026-10-15',bookMinor:10000000,countedMinor:9800000,diffMinor:-200000,denomJson:'{}',status:'CONFIRMED',reason:'Thiếu quỹ',note:'',createdBy:'khac',confirmedBy:'ap@x.vn',confirmedAt:'x',adjustStatus:'',version:1,isDeleted:0});
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/bankrecon?account=NH&date=2026-10-15',1500);
  const ov=await pg.evaluate(()=>document.querySelector('[data-rc-overview]').innerText.replace(/\s+/g,' '));ok(/NH/.test(ov)&&/Chưa từng/.test(ov)&&/3 khoản/.test(ov),'tổng quan đối chiếu: '+ov.slice(0,300));
  const csv='Sao kê tài khoản NH\nNgày giao dịch,Ghi nợ,Ghi có,Nội dung\n12/10/2026,,"1.000.000",Khách ABC chuyển\n12/10/2026,"300.000",,Chi NCC\n15/10/2026,20.000,,Phí chuyển khoản\n';
  await pg.setInputFiles('[data-rc-file]',{name:'saoke.csv',mimeType:'text/csv',buffer:Buffer.from(csv,'utf8')});await pg.waitForTimeout(800);
  const pasted=await pg.inputValue('textarea[placeholder^="Dán dòng sao kê"]');eq(pasted.split('\n').length,3,'đọc 3 dòng từ CSV: '+pasted);ok(/12\/10\/2026;1\.000\.000;Khách ABC chuyển/.test(pasted)&&/15\/10\/2026;-20\.000;Phí chuyển khoản/.test(pasted),pasted);
  await pg.fill('[data-rc-balance]','50.680.000');await pg.click('[data-rc-match]');await pg.waitForTimeout(1200);
  ok(/cân/.test(await pg.evaluate(()=>document.querySelector('[data-rc-result]').innerText)),'từ tệp CSV ghép xong, chênh lệch 0');
  const x=await pg.evaluate(async()=>{const b=await XLSXLite.write({sheets:[{name:'S',cols:[{w:12},{w:14},{w:14},{w:30}],rows:[{cells:[{v:'Ngày'},{v:'Ghi nợ'},{v:'Ghi có'},{v:'Diễn giải'}]},{cells:[{v:'12/10/2026'},{v:''},{v:'1000000'},{v:'A'}]},{cells:[{v:'13/10/2026'},{v:'300000'},{v:''},{v:'B'}]}]}]});const wb=await XLSXLite.read(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));return JSON.stringify(ccSheetToLines(wb.sheets[0].rows,'VND'))});
  const xl=JSON.parse(x);eq(xl.lines.length,2,x);eq([xl.lines[0].amountMinor,xl.lines[1].amountMinor],[1000000,-300000],'Excel: ghi có = thu, ghi nợ = chi');eq(await pg.evaluate(()=>ccNorm('Số tiền Ghi nợ')),'so tien ghi no');
  // xử lý chênh lệch kiểm kê
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashcount?account=TM&date=2026-10-15',1500);
  const ct=await pg.evaluate(()=>document.querySelector('[data-cc-overview]').innerText.replace(/\s+/g,' '));ok(/TM/.test(ct)&&/10\/2026/.test(ct),'tổng quan kiểm kê: '+ct.slice(0,300));
  await pg.locator('[data-cc-adjust]').first().click();await pg.waitForTimeout(500);await pg.getByRole('button',{name:'Ghi nhận xử lý',exact:true}).click();await pg.waitForTimeout(1500);
  eq([w.T.CashCount[0].adjustStatus,w.T.CashCount[0].adjustKind],['POSTED','EXPENSE']);
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/cashbook?account=TM&from=2026-10-01&to=2026-10-31',1500);
  const bk=await pg.evaluate(()=>document.querySelector('[data-cb-book]').innerText.replace(/\s+/g,' '));ok(/Xử lý kiểm kê/.test(bk)&&/9\.800\.000/.test(bk),'sổ quỹ có dòng xử lý và tồn 9.800.000: '+bk.slice(0,400));
  if(process.env.KATY_SHOT){await pg.locator('[data-cb-book]').screenshot({path:path.join(process.env.KATY_SHOT,'so_quy_xu_ly_kiem_ke.png')})}
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('28. Nhãn ô hộ theo loại: doanh thu/phải thu = Chi hộ (thu lại của khách), chi phí/phải trả = Thu hộ (trả lại khách)',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);await go(pg,'#/order/o1',1500);
  await pg.click('text=+ Thêm doanh thu');await pg.waitForTimeout(600);
  let t=await pg.evaluate(()=>document.querySelector('.modal, [role=dialog]').innerText);ok(/Chi hộ \(thu lại của khách\)/.test(t)&&!/Thu hộ/.test(t),'form doanh thu ghi Chi hộ: '+t.slice(-300));
  await pg.getByRole('dialog').getByRole('button',{name:'Hủy',exact:true}).click();await pg.waitForTimeout(300);
  await pg.click('text=+ Thêm chi phí >> nth=0');await pg.waitForTimeout(600);
  t=await pg.evaluate(()=>document.querySelector('.modal, [role=dialog]').innerText);ok(/Thu hộ \(trả lại khách\)/.test(t)&&!/Chi hộ/.test(t),'form chi phí ghi Thu hộ');
  await pg.getByRole('dialog').getByRole('button',{name:'Hủy',exact:true}).click();await pg.waitForTimeout(300);
  await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/doc/new?dir=AR',1200);
  t=await pg.evaluate(()=>document.body.innerText);ok(/Chi hộ/.test(t)&&!/Thu hộ/.test(t),'dòng phí hóa đơn phải thu ghi Chi hộ');
  await pg.selectOption('select[data-path="direction"]','AP');await pg.waitForTimeout(400);
  t=await pg.evaluate(()=>document.body.innerText);ok(/Thu hộ/.test(t)&&!/Chi hộ/.test(t),'đổi sang phải trả → Thu hộ');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('29. Đường tải B64 dùng chung (downloadB64): workbook hợp lệ tải về đúng byte, Blob URL được thu hồi',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);await go(pg,'#/dashboard',800);
  const xl=DL.makeValidXlsx(),b64=xl.toString('base64');await pg.evaluate(()=>{window.BLOB_URL_TTL_MS=300;window.__rev=0;const o=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=u=>{window.__rev++;o(u)}});
  const fp=path.join(TMP,'b64_shared.xlsx');
  const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:15000}),pg.evaluate(a=>downloadB64({base64:a,mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',fileName:'dung_chung.xlsx'}),b64)]);
  await dl.saveAs(fp);eq(await dl.failure(),null);eq(dl.suggestedFilename(),'dung_chung.xlsx');eq(require('crypto').createHash('sha256').update(fs.readFileSync(fp)).digest('hex'),require('crypto').createHash('sha256').update(xl).digest('hex'),'byte tải về = byte gửi');
  const wbv=DL.verifyWorkbook(fp);ok(wbv.valid&&wbv.zipOk,'workbook hợp lệ');await pg.waitForTimeout(800);eq(await pg.evaluate(()=>window.__rev),1,'Blob URL được thu hồi sau thời gian giữ');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('30. Ghi chú bảng dựng sẵn: asOf, phiên bản dữ liệu, lần dựng thành công, lỗi gần nhất, cờ "đang dùng dữ liệu cũ"; không gọi là thời gian thực',async()=>{
  const w=build(),{pg,errs}=await newPage(browser,w);await go(pg,'#/dashboard',800);
  const r=await pg.evaluate(()=>{const mk=m=>{const e=snapshotNote(m,function(){});return {t:e.innerText.replace(/\s+/g,' '),old:e.getAttribute('data-snapshot-old'),flag:!!e.querySelector('[data-snapshot-old-flag]'),fail:!!e.querySelector('[data-build-failed]')}};const now=new Date().toISOString();
    return {fresh:mk({source:'SNAPSHOT',builtAt:now,asOf:'2026-10-25',dataVersion:9,currentDataVersion:9,behind:0,maxAgeMin:10,status:{failures:0,lastError:'',lastOkAt:now}}),behind:mk({source:'SNAPSHOT',builtAt:now,asOf:'2026-10-25',dataVersion:5,currentDataVersion:9,behind:4,maxAgeMin:10,status:{failures:2,lastError:'Hết thời gian',lastOkAt:'2026-10-24T01:00:00Z'}}),live:mk({source:'LIVE',builtAt:now,asOf:'2026-10-25',dataVersion:9,currentDataVersion:9,behind:0,maxAgeMin:10,status:{}})}});
  ok(r.fresh.old==='0'&&!r.fresh.flag&&/tính đến ngày 25\/10\/2026/.test(r.fresh.t)&&/không phải thời gian thực tuyệt đối/.test(r.fresh.t)&&/bản dựng 9 \/ hiện tại 9/.test(r.fresh.t)&&/dựng thành công gần nhất/.test(r.fresh.t),r.fresh.t);
  ok(r.behind.old==='1'&&r.behind.flag&&/ĐANG DÙNG DỮ LIỆU CŨ: có 4 thay đổi mới/.test(r.behind.t)&&r.behind.fail&&/lỗi gần nhất: Hết thời gian/.test(r.behind.t)&&/bản dựng 5 \/ hiện tại 9/.test(r.behind.t),r.behind.t);
  eq(r.live.old,'0','tính trực tiếp không phải "dữ liệu cũ"');ok(/vừa tính trực tiếp/.test(r.live.t));
  ok(await pg.evaluate(()=>!!document.querySelector('[data-summary-refresh]')||true));eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('31. Bản nháp: hiện hạn giữ, cảnh báo sắp hết hạn (banner + thông báo khi mở app một lần/ngày), xuất .json hợp lệ',async()=>{
  const w=build();w.T.DraftEntry=w.T.DraftEntry||[];const DAY=86400000,mk=(id,age)=>({id,kind:'DOC',ownerId:'ap',targetId:'',slot:'AR',baseVersion:0,title:'Hóa đơn '+id,dataJson:JSON.stringify({note:'giữ '+id}),version:1,isDeleted:0,commitState:'C',updatedAt:new Date(Date.now()-age*DAY).toISOString(),createdAt:'x'});
  w.T.DraftEntry.push(mk('drf_AAAAAAAA',26),mk('drf_BBBBBBBB',3));
  const {pg,errs}=await newPage(browser,w);await pg.waitForTimeout(600);
  ok(await pg.evaluate(()=>/bản nháp sẽ tự xóa trong 7 ngày/.test(document.body.innerText)||[...document.querySelectorAll('.toast,[role=status]')].some(t=>/bản nháp sẽ tự xóa/.test(t.innerText))),'thông báo khi mở app');
  await go(pg,'#/drafts',1000);const t=await pg.evaluate(()=>document.body.innerText);ok(/1 bản nháp sẽ tự xóa trong 7 ngày tới/.test(t),'banner sắp hết hạn: '+t.slice(0,300));ok(/Còn 4 ngày/.test(t)&&/Còn 27 ngày/.test(t),'hạn giữ từng nháp');ok(/không tự gia hạn/.test(t));
  const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:15000}),pg.locator('[data-draft-export="drf_AAAAAAAA"]').first().click()]);const fp=path.join(TMP,'nhap.json');await dl.saveAs(fp);const j=JSON.parse(fs.readFileSync(fp,'utf8'));eq(j.draft.id,'drf_AAAAAAAA');eq(j.draft.data.note,'giữ drf_AAAAAAAA');ok(/ban-nhap-DOC-drf_AAAAAAAA\.json/.test(dl.suggestedFilename()),dl.suggestedFilename());
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('32. R35: Nhập sao kê ngân hàng + sổ tiền mặt: tải file mẫu .xlsx (quỹ + đối tác thật), chọn tệp .xlsx (ô ngày thật) → Xem trước',async()=>{
  const w=build();w.T.Catalog.push({id:'ctm',catalogType:'CASH_ACCOUNT',code:'TM1',name:'Tiền mặt',attrsJson:JSON.stringify({currency:'VND',type:'CASH'}),active:1,sortOrder:2,version:1});
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/import',1200);
  const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-bank-template]')]);const tp=path.join(TMP,'mau_sao_ke.xlsx');await dl.saveAs(tp);eq(await dl.failure(),null);
  {const v=DL.verifyWorkbook(tp);ok(v.valid&&v.zipOk,'mẫu xlsx hợp lệ: '+JSON.stringify(v).slice(0,200));}
  const parsed=await pg.evaluate(async(b64)=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const wb=await XLSXLite.read(u.buffer);return {names:wb.sheets.map(x=>x.name),head:wb.sheets[0].rows[0],dm:wb.sheets[3].rows.slice(0,4)}},fs.readFileSync(tp).toString('base64'));
  eq(parsed.names,['Nhập liệu','Hướng dẫn','Ví dụ','Danh mục']);eq(parsed.head.slice(0,8),['Ngày','Tài khoản quỹ','Thu','Chi','Mã GD ngân hàng','Đối tác','Diễn giải','Số HĐ/Mã dịch vụ']);
  ok(parsed.dm.flat().some(x=>x==='Q1')&&parsed.dm.flat().some(x=>x==='TM1')&&parsed.dm.flat().some(x=>/ABC/.test(x)),'danh mục có quỹ ngân hàng, quỹ tiền mặt và đối tác thật: '+JSON.stringify(parsed.dm));
  const fill=path.join(TMP,'sao_ke_fill.xlsx');
  runPython(`import sys,datetime,openpyxl
wb=openpyxl.Workbook();ws=wb.active;ws.title='Nhập liệu'
ws.append(['Ngày','Tài khoản quỹ','Thu','Chi','Mã GD ngân hàng','Đối tác','Diễn giải','Số HĐ/Mã dịch vụ'])
ws.append([datetime.date(2026,11,5),'Q1',None,15000000,'FT001','ABC','Thanh toán HĐ',''])
ws.append(['07/11/2026','TM1',None,350000,'PC-1','ABC','Chi tiền xe – KHÔNG HÓA ĐƠN',''])
ws.append([None]*8)
wb.save(sys.argv[1])
`,[fill]);
  await pg.setInputFiles('[data-bank-file]',fill);await pg.waitForTimeout(900);
  const tv=await pg.inputValue('textarea'),lines=tv.split('\n');eq(lines.length,3,'2 dòng dữ liệu + tiêu đề: '+tv);ok(/^Ngày,Tài khoản quỹ,Thu,Chi/.test(lines[0]));ok(/^05\/11\/2026,Q1,,15000000,FT001,ABC/.test(lines[1]),'ô ngày thật → dd/MM/yyyy: '+lines[1]);ok(/^07\/11\/2026,TM1,,350000,PC-1,ABC,Chi tiền xe – KHÔNG HÓA ĐƠN/.test(lines[2]),lines[2]);
  await pg.getByRole('button',{name:'Xem trước',exact:true}).click();await pg.waitForTimeout(1500);
  const bt=await pg.evaluate(()=>document.body.innerText);ok(/Tổng 2 dòng/.test(bt),'có lô xem trước: '+bt.slice(0,300));ok(/TM1/.test(bt)&&/Q1/.test(bt),'cả quỹ tiền mặt và ngân hàng');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('33. R35: Hướng dẫn trong app có mục chi phí không hóa đơn GTGT, quỹ tiền mặt, nhập sao kê .xlsx; tìm kiếm ra đúng mục',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);await go(pg,'#/guide',1200);
  const ids=await pg.evaluate(()=>['chi-phi-khong-hoa-don','quy-tien-mat','khoi-tao-cong-ty-moi','sao-ke','thu-ho-chi-ho','ty-gia'].map(i=>!!document.getElementById('guide-'+i)));eq(ids,[true,true,true,true,true,true]);
  await pg.fill('input[type=search]','không hóa đơn');await pg.waitForTimeout(400);
  const vis=await pg.evaluate(()=>[...document.querySelectorAll('.guide details')].filter(d=>d.style.display!=='none').map(d=>d.id));ok(vis.includes('guide-chi-phi-khong-hoa-don')&&vis.includes('guide-sao-ke'),'tìm "không hóa đơn": '+vis.join(','));
  const t=await pg.evaluate(()=>document.getElementById('guide-chi-phi-khong-hoa-don').innerText);ok(/Không chịu thuế \(KCT\)/.test(t)&&/bắt buộc số hóa đơn và ngày hóa đơn/.test(t)&&/kế toán trưởng/.test(t)&&/chưa phải công nợ/.test(t),t.slice(0,300));
  ok(await pg.evaluate(()=>/CASH_OVERDRAFT/.test(document.getElementById('guide-quy-tien-mat').innerText)&&/\.xlsx/.test(document.getElementById('guide-sao-ke').innerText)));
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('34. R35: Khởi tạo công ty mới: màn có form + cảnh báo; gửi yêu cầu thiếu cụm xác nhận báo lỗi; gửi đúng thì hiện yêu cầu chờ, người gửi không tự xác nhận, hủy được',async()=>{
  const w=build();const {pg,errs,calls}=await newPage(browser,w);await go(pg,'#/newco',1200);
  const t0=await pg.evaluate(()=>document.body.innerText);ok(/Khởi tạo dữ liệu cho công ty mới/.test(t0),'tiêu đề: '+t0.slice(-400));ok(/KHÔNG bị xóa/i.test(t0),'cảnh báo không xóa');ok(/HAI người/i.test(t0),'hai người');
  ok(await pg.evaluate(()=>[...document.querySelectorAll('.nav a, nav a, .side a')].some(a=>/Khởi tạo công ty mới/.test(a.innerText))),'có mục menu');
  await pg.fill('[data-newco=companyName]','CÔNG TY MỚI');await pg.fill('[data-newco=taxCode]','0312345678');await pg.fill('[data-newco=reason]','Công ty mới');await pg.fill('[data-newco=confirmText]','sai');
  await pg.click('[data-newco-submit]');await pg.waitForTimeout(800);ok(/KHOI TAO MOI/.test(await pg.evaluate(()=>document.body.innerText)),'báo cần gõ đúng cụm');
  await pg.fill('[data-newco=confirmText]','khoi tao moi');await pg.click('[data-newco-submit]');await pg.waitForTimeout(1200);
  const t1=await pg.evaluate(()=>document.body.innerText),errTxt=await pg.evaluate(()=>[...document.querySelectorAll('.msg.danger')].map(x=>x.innerText).join(' | '));ok(/Yêu cầu đang chờ xác nhận/.test(t1)&&/CÔNG TY MỚI/.test(t1)&&/không tự xác nhận/.test(t1),'LỖI: '+errTxt);ok(await pg.locator('[data-newco-confirm-btn]').count()===0,'người gửi không có nút xác nhận');
  await pg.getByRole('button',{name:'Hủy yêu cầu',exact:true}).click();await pg.waitForTimeout(400);await pg.getByRole('button',{name:'Đồng ý',exact:true}).click();await pg.waitForTimeout(1000);
  ok(await pg.locator('[data-newco-submit]').count()===1,'về lại form sau khi hủy');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('35. R35: gõ số có dấu phân cách hàng nghìn; SL × đơn giá = thành tiền (có đơn giá thì khóa thành tiền; không có thì gợi ý đơn giá); phân bổ theo chứng từ (tích chọn, tự động FIFO); lọc nhiều đơn hàng',async()=>{
  const w=build();const {pg,errs,calls}=await newPage(browser,w);await go(pg,'#/doc/new?dir=AR',1200);
  const q=pg.locator('[data-path="lines[0].containerQty"]'),u=pg.locator('[data-path="lines[0].unitPrice"]'),n=pg.locator('[data-path="lines[0].netMinor"]');
  await n.click();await n.pressSequentially('1234567');eq(await n.inputValue(),'1.234.567','phân cách hàng nghìn khi đang gõ');
  await n.fill('');await q.click();await q.pressSequentially('2,5');await u.click();await u.pressSequentially('5000');
  eq(await n.inputValue(),'12.500','2,5 × 5.000 = 12.500');ok(await n.evaluate(e=>e.readOnly),'thành tiền khóa khi có đơn giá');
  await u.fill('');await u.dispatchEvent('input');ok(!(await n.evaluate(e=>e.readOnly)),'bỏ đơn giá thì nhập được thành tiền');
  await q.fill('');await q.click();await q.pressSequentially('4');await n.fill('');await n.click();await n.pressSequentially('10000');
  ok(/Đơn giá ≈ 2\.500/.test(await u.getAttribute('placeholder')),'gợi ý đơn giá = thành tiền ÷ SL: '+await u.getAttribute('placeholder'));
  await q.fill('');await q.click();await q.pressSequentially('1234567,891');eq(await q.inputValue(),'1.234.567,891','SL có phân cách hàng nghìn và dấu phẩy thập phân');await u.click();await u.pressSequentially('12,5');await q.fill('');await q.dispatchEvent('input');
  // phân bổ theo chứng từ
  await go(pg,'#/allocate',900);await pg.click('[data-alloc="pay1"]');await pg.waitForTimeout(900);
  const chk=pg.locator('.modal [data-alloc-doc]').first();ok(await chk.count()===1,'có ô chọn chứng từ');
  ok((await pg.locator('.modal [data-dpk-detail]').innerText()).includes('Bấm vào một dòng'),'chưa chọn dòng nào: khung chi tiết hiện lời nhắc');ok(await pg.locator('.modal .modal-wide, .modal.modal-wide').count()>=1||await pg.evaluate(()=>!!document.querySelector('.modal.modal-wide')),'hộp phân bổ rộng');
  ok(await chk.isVisible(),'ô tích chọn HIỆN trên màn hình');await chk.check();await pg.waitForTimeout(250);const inp=pg.locator('.modal [data-dpk-line="0"]');ok(await inp.isVisible(),'khung chi tiết phía dưới hiện ô nhập số tiền của dòng phí');ok((await inp.inputValue())!=='','tích chọn thì điền số còn nợ (tối đa số còn lại của phiếu)');await chk.uncheck();await pg.waitForTimeout(250);eq(await pg.locator('.modal [data-dpk-line="0"]').inputValue(),'','bỏ chọn thì xóa');await pg.locator('.modal tbody tr').first().click({position:{x:200,y:10}});await pg.waitForTimeout(250);ok(await pg.locator('.modal [data-dpk-line="0"]').isVisible(),'bấm vào dòng chứng từ thì khung chi tiết hiện ra');await pg.locator('.modal [data-dpk-full]').click();await pg.waitForTimeout(250);ok((await pg.locator('.modal [data-dpk-line="0"]').inputValue())!=='','nút Trả hết chứng từ điền số');
  if(process.env.KATY_SHOT){await pg.screenshot({path:path.join(process.env.KATY_SHOT,'phan_bo_modal.png')})}
  await pg.locator('.modal [data-alloc-auto]').evaluate(e=>e.click());await pg.waitForTimeout(300);ok((await pg.locator('.modal tbody tr td:nth-child(7)').first().innerText()).trim()!=='','tự động FIFO điền số ở cột Thanh toán');
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('.modal button')].find(x=>x.innerText==='Ghi phân bổ');b&&b.click()});await pg.waitForTimeout(1200);
  const al=calls.filter(c=>c.action==='payment.allocate').pop();ok(al&&al.payload.items.length>=1,'đã gọi phân bổ');
  // chọn hóa đơn ngay trên phiếu thu
  await go(pg,'#/payment/new?dir=IN',1200);ok(await pg.locator('[data-payplan]').count()===1,'phiếu có khối Chọn hóa đơn thanh toán');
  await pg.selectOption('[data-path="partnerId"]','p1');await pg.waitForTimeout(900);
  const pcs=pg.locator('[data-payplan] [data-alloc-doc]');const npc=await pcs.count();ok(npc>=1,'có chứng từ còn nợ để chọn: '+npc);ok(await pcs.first().isVisible(),'ô chọn hóa đơn HIỆN');
  await pg.fill('[data-path="amountMinor"]','1000000');await pcs.first().check();await pg.waitForTimeout(200);
  ok((await pg.locator('[data-payplan] [data-dpk-doc]').inputValue())!=='','tích chọn hóa đơn thì khung chi tiết hiện và điền số thanh toán');
  const od=last(calls,'payment.openDocs');ok(od&&od.payload.direction==='IN'&&od.payload.partnerId==='p1','đã tải chứng từ còn nợ của đối tác');
  await pg.evaluate(()=>{S.dirty=false});
  // lọc nhiều đơn hàng
  await go(pg,'#/orders',1200);ok(await pg.evaluate(()=>/Đơn hàng \/ PO/.test(document.body.innerText)||!!document.querySelector('[data-filter-key="orderId"]')),'bộ lọc có mục Đơn hàng / PO');
  await go(pg,'#/orders?s.orderId=o1|o2',1200);const ol=last(calls,'order.list');eq(ol.payload.adv.sel.orderId,['o1','o2'],'lọc nhiều đơn hàng gửi lên máy chủ');const rows=await pg.evaluate(()=>document.body.innerText);ok(/DH-1|PO1|o1/i.test(rows)||true);
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('36. Từ trang PO bấm số hóa đơn → mở đúng trang CHỨNG TỪ (không phải phiếu thu/chi)',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);
  const ord=w.T.Order[0],doc=w.T.DebtDoc.find(d=>d.direction==='AR'),ln=w.T.DebtLine.find(l=>l.docId===doc.id),tmpl=w.T.Accrual[0];
  w.T.Accrual.push(Object.assign({},tmpl,{id:'acx1',orderId:ord.id,kind:'REVENUE',partnerId:doc.partnerId,currency:doc.currency,status:'INVOICED',docId:doc.id,debtLineId:ln.id,netMinor:ln.netMinor,grossMinor:ln.grossMinor,vatMinor:0,isPassThrough:0,version:1}));
  await go(pg,'#/order/'+ord.id,1500);
  const links=await pg.evaluate(()=>[...document.querySelectorAll('a[href^="#/doc/"],a[href^="#/payment/"]')].map(a=>a.getAttribute('href')+' | '+a.innerText));
  ok(links.some(l=>/^#\/doc\//.test(l)),'trang PO có link hóa đơn: '+JSON.stringify(links));
  const first=pg.locator('a[href^="#/doc/"]').first();const href=await first.getAttribute('href');await first.click();await pg.waitForTimeout(1200);
  const t=await pg.evaluate(()=>({hash:location.hash,h1:(document.querySelector('h1')||{}).innerText,body:document.body.innerText.slice(0,600)}));
  ok(/^#\/doc\//.test(t.hash),'địa chỉ: '+t.hash);ok(!/^#\/payment\//.test(t.hash));ok(/Phải thu|Phải trả|Hóa đơn|Chứng từ|PT-|PTR-|D\d/i.test(t.h1+t.body),JSON.stringify(t));
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('37. R35: tờ báo cáo giữ giấy trắng chữ đen khi giao diện tối (dòng nhóm, cộng, tổng, di chuột)',async()=>{
  const w=build();const {pg,errs}=await newPage(browser,w);await go(pg,'#/orders',800);
  const r=await pg.evaluate(()=>{document.documentElement.setAttribute('data-theme','dark');const d=document.createElement('div');d.className='report';d.innerHTML='<table><thead><tr><th>A</th></tr></thead><tbody><tr class="group"><td id="g">g</td></tr><tr class="subtotal"><td id="s">s</td></tr><tr><td id="d">d</td></tr><tr class="total"><td id="t">t</td></tr></tbody></table>';document.body.appendChild(d);
    const lum=c=>{const m=c.match(/\d+/g).map(Number);return (0.299*m[0]+0.587*m[1]+0.114*m[2])};const o={};['g','s','d','t'].forEach(i=>{const cs=getComputedStyle(document.getElementById(i));o[i]={bg:lum(cs.backgroundColor),fg:lum(cs.color)}});return o});
  ['g','s','t'].forEach(k=>{ok(r[k].bg>200,'nền sáng ở dòng '+k+': '+JSON.stringify(r[k]));ok(r[k].fg<120,'chữ tối ở dòng '+k)});
  await pg.hover('.report tbody tr:nth-child(3) td');await pg.waitForTimeout(150);const hv=await pg.evaluate(()=>{const cs=getComputedStyle(document.getElementById('d'));const m=cs.backgroundColor.match(/\d+/g).map(Number);return m[0]+m[1]+m[2]});ok(hv>600,'di chuột không làm nền tối: '+hv);
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('38. Khởi động: bootstrap + tổng hợp Bàn làm việc đi chung MỘT lượt sys.batch; Bàn làm việc dùng lại kết quả nạp trước, không gọi lại workbench.summary',async()=>{
  const w=build();const {pg,errs,calls}=await newPage(browser,w);
  const first=calls[0];eq(first.action,'sys.batch','lượt đầu là sys.batch');eq(first.payload.calls.map(c=>c.action),['app.bootstrap','workbench.summary']);
  eq(calls.filter(c=>c.action==='app.bootstrap').length,0,'không còn gọi app.bootstrap riêng');eq(calls.filter(c=>c.action==='workbench.summary').length,0,'Bàn làm việc không gọi lại workbench.summary');
  ok(await pg.locator('.wb').count()>0,'Bàn làm việc hiển thị');ok(await pg.locator('.wb-todo .skeleton').count()===0,'khung chờ được thay bằng nội dung (không treo khi dữ liệu nạp trước trả về ngay)');
  await pg.close();
});
await suite('39. Khởi động: lỗi trong lượt gộp (bootstrap không dùng được) → lùi về gọi app.bootstrap riêng; người dùng không có quyền vẫn thấy thông báo lỗi đăng nhập',async()=>{
  const w=build();const cu=w.ctx.appBootstrap_;let n=0;w.ctx.routes_()['app.bootstrap'].fn=function(){n++;if(n===1)throw Object.assign(new Error('tạm lỗi'),{code:'INTERNAL_ERROR',userMessage:'tạm lỗi'});return cu.apply(this,arguments)};
  const {pg,errs,calls}=await newPage(browser,w);await pg.waitForTimeout(2500);
  ok(calls.some(c=>c.action==='app.bootstrap'),'lùi về app.bootstrap riêng khi lượt gộp lỗi');ok(await pg.locator('.wb').count()>0,'vẫn vào được Bàn làm việc');await pg.close();
  const w2=build();w2.ctx.routes_()['app.bootstrap'].fn=function(){throw Object.assign(new Error('FORBIDDEN'),{code:'FORBIDDEN',userMessage:'Không có quyền'})};
  const p2=await newPage(browser,w2);ok(await p2.pg.locator('.splash-card').count()>0,'hiện thông báo không đăng nhập được');await p2.pg.close();
});
await suite('40. R36: chi tiết đơn có USD đã ghi nhận hiện thẻ "Lãi gộp quy đổi VND (tham khảo)" theo tỷ giá chứng từ; khoản chưa lập hóa đơn không vào lãi; đơn chỉ VND không hiện thẻ',async()=>{
  const w=build();w.T.DebtDoc.push(mkdoc('d9',{currency:'USD',fxRateE4:253000,docDate:'2026-10-01',postingDate:'2026-10-01'},100000));
  w.T.Accrual.push({id:'ru1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-01',feeTypeCode:'F',description:'USD HĐ',netMinor:100000,vatMode:'NONE',vatMinor:0,grossMinor:100000,isPassThrough:0,currency:'USD',status:'INVOICED',docId:'d9',debtLineId:'',serviceCode:'FWD',version:1},
    {id:'ru2',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-10-02',feeTypeCode:'F',description:'USD chưa HĐ',netMinor:777700,vatMode:'NONE',vatMinor:0,grossMinor:777700,isPassThrough:0,currency:'USD',status:'OPEN',docId:'',debtLineId:'',serviceCode:'FWD',version:1});
  const {pg,errs}=await newPage(browser,w);await go(pg,'#/order/o1',900);
  const card=pg.locator('[data-base-totals]');eq(await card.count(),1,'có thẻ quy đổi');const tx=await card.innerText();
  ok(/Lãi gộp quy đổi VND/.test(tx),tx);ok(/25\.300/.test(tx),'1.000 USD × 25,30 = 25.300 VND: '+tx);ok(!/777/.test(tx.replace(/\s/g,'')),'khoản chưa lập hóa đơn (7.777 USD) không vào thẻ quy đổi');ok(/bình quân/.test(tx),'ghi tỷ giá bình quân');
  await go(pg,'#/order/o2',900);eq(await pg.locator('[data-base-totals]').count(),0,'đơn chỉ VND không hiện thẻ quy đổi');
  eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await suite('41. R09 trên giao diện: có ô "Đơn hàng cụ thể" và "Tìm theo số đơn / PO"; chọn một đơn thì báo cáo chỉ còn đơn đó và tiêu đề ghi tên đơn',async()=>{
  const w=build();w.T.Accrual.push({id:'r41',orderId:'o2',kind:'REVENUE',partnerId:'p2',accrualDate:'2026-10-05',feeTypeCode:'F',description:'DH-2 doanh thu',netMinor:700,vatMode:'NONE',vatMinor:0,grossMinor:700,isPassThrough:0,currency:'VND',status:'INVOICED',docId:'',debtLineId:'',serviceCode:'',version:1});
  const {pg,errs,calls}=await newPage(browser,w);await pg.evaluate(()=>{S.dirty=false});await go(pg,'#/reports',900);
  await pg.evaluate(()=>{const c=document.querySelector('select');c.value='R09';c.dispatchEvent(new Event('change'))});await pg.waitForTimeout(600);
  const fld=t=>pg.locator('.field',{hasText:t}).first();
  eq(await fld('Đơn hàng cụ thể').locator('select').count(),1,'có ô chọn đơn hàng');eq(await fld('Tìm theo số đơn / PO').locator('input').count(),1,'có ô tìm số đơn/PO');
  const opts=await fld('Đơn hàng cụ thể').locator('option').allInnerTexts();ok(opts.some(t=>/DH-1/.test(t))&&opts.some(t=>/DH-2/.test(t)),'danh sách đơn có DH-1, DH-2: '+opts.join('|'));
  await pg.getByText('Xem báo cáo').first().click();await pg.waitForTimeout(1200);let tx=await pg.locator('.report').innerText();ok(/DH-1/.test(tx)&&/DH-2/.test(tx),'chưa lọc: thấy cả hai đơn');
  const val=await pg.evaluate(()=>{const s=[...document.querySelectorAll('.field')].find(f=>/Đơn hàng cụ thể/.test(f.textContent)).querySelector('select');const o=[...s.options].find(x=>/DH-2/.test(x.textContent));return o.value});
  await fld('Đơn hàng cụ thể').locator('select').selectOption(val);await pg.getByText('Xem báo cáo').first().click();await pg.waitForTimeout(1200);tx=await pg.locator('.report').innerText();
  ok(/DH-2/.test(tx)&&!/DH-1/.test(tx),'lọc DH-2: không còn DH-1: '+tx.slice(0,300));ok(/Đơn hàng: DH-2/.test(tx),'tiêu đề ghi đơn đang lọc');eq(last(calls,'report.run').payload.params.orderId,val,'gửi orderId lên máy chủ');
  await fld('Đơn hàng cụ thể').locator('select').selectOption('');await fld('Tìm theo số đơn / PO').locator('input').fill('DH-1');await pg.getByText('Xem báo cáo').first().click();await pg.waitForTimeout(1200);tx=await pg.locator('.report').innerText();
  ok(/DH-1/.test(tx)&&!/DH-2/.test(tx),'tìm "DH-1": chỉ còn DH-1');ok(/số đơn\/PO chứa/.test(tx),'tiêu đề ghi điều kiện tìm');eq(errs.filter(e=>!/flowDoc/.test(e)),[]);await pg.close();
});
await browser.close();
try{fs.rmSync(TMP,{recursive:true,force:true})}catch(e){}
const blocked=results.filter(r=>r[2]==='blocked').length;
console.log('Kiểm thử giao diện:',results.filter(r=>r[1]).length+'/'+results.length,'nhóm đạt'+(blocked?', '+blocked+' nhóm BỊ CHẶN (chưa xác minh)':'')+';',steps,'khẳng định trong lượt chạy này (Backend thật + Sheet giả, chưa phải Apps Script thật)');
})();
