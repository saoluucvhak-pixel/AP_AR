// R34: lỗi giữa giao dịch / gửi lại / phục hồi / bộ kích hoạt chạy trùng cho các bảng và thao tác MỚI (chuyển quỹ, mua/bán ngoại tệ, kiểm kê, đối chiếu).
// Engine giao dịch thật + Sheet giả. Khẳng định: không bản ghi tài chính nhân đôi; giao dịch dừng trước commit được hoàn tác; dừng sau commit được hoàn tất đúng một lần; nháp không bị dọn khi lưu chính chưa thành công.
const assert=require('assert'),path=require('path');
const makeEnv=require('./bench/_env.cjs'),SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const crypto=require('crypto');
function env(){
  const e=makeEnv(SRCP),{ctx,dbs}=e;ctx.sha256Hex_=s=>crypto.createHash('sha256').update(String(s)).digest('hex');ctx.todayVn_=()=>'2026-10-25';
  ['Catalog','Partner','Payment','Period','Config','FxRate','OpeningBalance','CashTransfer','CashExchange','BankRecon','CashCount','SysTx','AuditLog','DraftEntry','AppUser'].forEach(t=>ctx.repoSheet_(t));
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o),cat=(id,type,c,a)=>B({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1});
  ctx.repoAppend_('Catalog',[cat('c1','CURRENCY','VND',{decimals:0}),cat('c2','CURRENCY','USD',{decimals:2}),cat('q1','CASH_ACCOUNT','QU',{currency:'USD',type:'CASH'}),cat('q2','CASH_ACCOUNT','QU2',{currency:'USD',type:'CASH'}),cat('q3','CASH_ACCOUNT','TM',{currency:'VND',type:'CASH'}),cat('q4','CASH_ACCOUNT','NH',{currency:'VND',type:'BANK'})]);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'})]);
  ctx.repoAppend_('Partner',[B({id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:0,status:'ACTIVE'})]);
  ctx.repoAppend_('Payment',[B({id:'y1',payNo:'PT1',direction:'IN',partnerId:'p1',currency:'USD',amountMinor:100000,effectiveDate:'2026-10-10',method:'BANK',cashAccountCode:'QU',status:'POSTED',fxRateE4:250000000,amountBaseMinor:25000000,periodId:'2026-10'}),
    B({id:'y2',payNo:'PT2',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:5000000,effectiveDate:'2026-10-10',method:'CASH',cashAccountCode:'TM',status:'POSTED',fxRateE4:0,amountBaseMinor:5000000,periodId:'2026-10'})]);
  return e;
}
const U1={id:'u1',email:'u1@x.vn',role:'APPROVER',scope:{allPartners:true}},U2={id:'u2',email:'u2@x.vn',role:'APPROVER',scope:{allPartners:true}};
const rowsOf=(e,t)=>{const s=e.dbs.main[t]||e.dbs.aud[t];if(!s)return[];const cols=e.ctx.parseCols_(t),out=[];for(let r=2;r<=s.getLastRow();r++){const o={};cols.forEach((c,i)=>{o[c.name]=s.cells[r+','+(i+1)]});out.push(o)}return out};
const sys=(e,req)=>rowsOf(e,'SysTx').find(x=>x.requestId===req);
const call=(f,u,rq,p,fail)=>{try{return {ok:true,r:f(u,{requestId:rq,payload:p,failAt:fail})}}catch(x){return {ok:false,e:x}}};
const XFER={fromAccount:'QU',toAccount:'QU2',amountMinor:40000,effectiveDate:'2026-10-12'};
const pooled=e=>e.ctx.fxPoolRun_(null,'2026-10-31');
suite('1. Lập phiếu: gửi lại cùng requestId trả kết quả cũ (không tạo hai phiếu); cùng requestId khác nội dung bị từ chối',()=>{
  const e=env(),a=call(e.ctx.xferSave_,U1,'rq1',XFER);ok(a.ok&&a.r.id);eq(rowsOf(e,'CashTransfer').length,1);const b=call(e.ctx.xferSave_,U1,'rq1',XFER);ok(b.ok);eq(b.r.id,a.r.id);eq(rowsOf(e,'CashTransfer').length,1,'không nhân đôi');
  const c=call(e.ctx.xferSave_,U1,'rq1',Object.assign({},XFER,{amountMinor:1}));ok(!c.ok&&c.e.code==='IDEMPOTENCY_MISMATCH',c.e&&c.e.code);eq(rowsOf(e,'CashTransfer').length,1);
});
suite('2. Ghi nhận phiếu chuyển quỹ dừng SAU commit → phục hồi hoàn tất đúng một lần; phục hồi/trigger chạy trùng không đổi gì; quỹ chỉ tính một lần',()=>{
  const e=env(),s=call(e.ctx.xferSave_,U1,'rq1',XFER);const id=s.r.id;
  const p=call(e.ctx.xferPost_,U2,'rqP',{id},'AFTER_COMMIT');ok(!p.ok&&/FAILPOINT:AFTER_COMMIT/.test(p.e.message));eq(sys(e,'rqP').status,'COMMITTED');
  const o=e.ctx.recoverStale_(0);eq(o.finalized,1);eq(sys(e,'rqP').status,'FINALIZED');eq(rowsOf(e,'CashTransfer')[0].status,'POSTED');
  e.ctx.recoverStale_(0);e.ctx.recoverStale_(0);eq(rowsOf(e,'CashTransfer').length,1);eq(rowsOf(e,'CashTransfer')[0].status,'POSTED');
  const again=call(e.ctx.xferPost_,U2,'rqP',{id});ok(again.ok,'gửi lại cùng requestId trả kết quả cũ');e.ctx.resetMemoDirect_();const pool=pooled(e);eq(pool.accounts.QU.balF,60000);eq(pool.accounts.QU2.balF,40000,'chỉ chuyển một lần');eq(pool.accounts.QU.events.filter(x=>x.direction==='XOUT').length,1);
  eq(rowsOf(e,'AuditLog').filter(a=>a.action==='transfer.post').length,1,'nhật ký đúng một dòng');
});
suite('3. Dừng TRƯỚC commit (AFTER_PLAN/AFTER_INSERT/AFTER_UPDATE) → hoàn tác: phiếu vẫn nháp, quỹ không đổi; lập lại bằng requestId mới thành công',()=>{
  for(const fp of ['AFTER_PLAN','AFTER_INSERT','AFTER_UPDATE']){
    const e=env(),s=call(e.ctx.xferSave_,U1,'rq1',XFER),id=s.r.id,rq='rqP_'+fp;const p=call(e.ctx.xferPost_,U2,rq,{id},fp);ok(!p.ok,fp);
    const o=e.ctx.recoverStale_(0);eq(o.rolledBack,1,fp);eq(sys(e,rq).status,'ROLLED_BACK');eq(rowsOf(e,'CashTransfer')[0].status,'DRAFT',fp+': phiếu vẫn là nháp');e.ctx.resetMemoDirect_();eq(pooled(e).accounts.QU2.balF,0,fp+': quỹ nhận chưa có');
    const retry=call(e.ctx.xferPost_,U2,rq,{id});ok(!retry.ok&&retry.e.code==='REQUEST_FAILED','requestId đã hủy bị từ chối rõ ràng');
    const fresh=call(e.ctx.xferPost_,U2,rq+'_2',{id});ok(fresh.ok,fp+': requestId mới ghi nhận được');eq(rowsOf(e,'CashTransfer')[0].status,'POSTED');
  }
});
suite('4. Mua/bán ngoại tệ, kiểm kê, đối chiếu: dừng sau commit rồi phục hồi → đúng một bản ghi/hiệu lực',()=>{
  const e=env();const ex=call(e.ctx.exchSave_,U1,'e1',{kind:'SELL',foreignAccount:'QU',baseAccount:'TM',foreignMinor:30000,baseMinor:7600000,effectiveDate:'2026-10-12'});ok(ex.ok,ex.e&&(ex.e.message+JSON.stringify(ex.e.fields)));
  const p=call(e.ctx.exchPost_,U2,'e2',{id:ex.r.id},'AFTER_COMMIT');ok(!p.ok);e.ctx.recoverStale_(0);e.ctx.recoverStale_(0);const row=rowsOf(e,'CashExchange')[0];eq(row.status,'POSTED');eq(row.costBaseMinor,7500000,'30 USD... 300,00 USD × 25.000 = 7.500.000');eq(row.diffMinor,100000);
  e.ctx.resetMemoDirect_();eq(pooled(e).accounts.QU.balF,70000,'bán trừ quỹ đúng một lần');
  const k2=call(e.ctx.countSave_,U1,'k1b',{account:'TM',countDate:'2026-10-15',countedMinor:12600000});ok(k2.ok);eq(k2.r.diffMinor,0);
  const c=call(e.ctx.countConfirm_,U2,'k2',{id:k2.r.id},'AFTER_COMMIT');ok(!c.ok);e.ctx.recoverStale_(0);eq(rowsOf(e,'CashCount')[0].status,'CONFIRMED');eq(rowsOf(e,'CashCount').length,1);
  const r1=call(e.ctx.bankReconSave_,U2,'r1',{account:'TM',stmtDate:'2026-10-20',stmtBalanceMinor:12600000,cleared:[],stmtOnly:[],confirm:false},'AFTER_INSERT');ok(!r1.ok);e.ctx.recoverStale_(0);eq(rowsOf(e,'BankRecon').filter(x=>x.commitState!=='A').length,0,'đối chiếu dừng giữa chừng không để lại bản ghi hợp lệ');
});
console.log('Tổng kiểm tra:',steps);
