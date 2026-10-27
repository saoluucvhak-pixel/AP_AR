// R34: bản nháp nhập liệu — hạn giữ 30 ngày (chính sách hiện hữu) được HIỂN THỊ, cảnh báo trước khi hết hạn (7 ngày), xuất được, dọn đúng nháp quá hạn, nháp không mất khi lưu chính thất bại.
const assert=require('assert'),path=require('path');
const makeEnv=require('./bench/_env.cjs'),SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),crypto=require('crypto');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const U={id:'u1',email:'u1@x.vn',displayName:'U1',role:'APPROVER',scope:{allPartners:true}},V={id:'u2',email:'u2@x.vn',displayName:'U2',role:'APPROVER',scope:{allPartners:true}};
const DAY=86400000;
function env(){const e=makeEnv(SRCP),{ctx}=e;ctx.sha256Hex_=s=>crypto.createHash('sha256').update(String(s)).digest('hex');['DraftEntry','Config','Catalog','Partner','DebtDoc','DebtLine','SysTx','AuditLog','Payment','Order','Accrual','Period'].forEach(t=>ctx.repoSheet_(t));return e}
function save(ctx,u,id,ageDays,title){const r=ctx.draftSave_(u,{payload:{id,kind:'DOC',slot:'AR',title:title||id,data:{a:1,note:'nội dung '+id}}});const row=ctx.repoReadAll_('DraftEntry').find(x=>x.id===id);ctx.repoWriteRow_('DraftEntry',row._row,Object.assign({},row,{updatedAt:new Date(Date.now()-ageDays*DAY).toISOString()}));return r}
suite('1. Hạn giữ hiển thị: daysLeft/expiring theo 30 ngày kể từ lần lưu cuối; danh sách báo số sắp hết hạn, thời hạn và ngưỡng cảnh báo; chỉ tính nháp của chính người dùng',()=>{
  const {ctx}=env();save(ctx,U,'drf_AAAAAAAA',1);save(ctx,U,'drf_BBBBBBBB',25);save(ctx,U,'drf_CCCCCCCC',29.5);save(ctx,V,'drf_DDDDDDDD',28);
  const l=ctx.draftList_(U,{payload:{}}),by={};l.items.forEach(x=>by[x.id]=x);
  eq(by.drf_AAAAAAAA.daysLeft,29);eq(by.drf_AAAAAAAA.expiring,false);eq(by.drf_BBBBBBBB.daysLeft,5);eq(by.drf_BBBBBBBB.expiring,true);ok(by.drf_CCCCCCCC.daysLeft<=1&&by.drf_CCCCCCCC.expiring,'còn <1 ngày: '+by.drf_CCCCCCCC.daysLeft);
  eq(l.retentionDays,30);eq(l.warnDays,7);eq(l.expiringCount,2,'chỉ tính nháp của U1');eq(ctx.draftList_(V,{payload:{}}).expiringCount,1);ok(!by.drf_DDDDDDDD,'không thấy nháp người khác');
});
suite('2. app.bootstrap báo số nháp sắp hết hạn của chính người dùng (để giao diện cảnh báo một lần mỗi ngày)',()=>{
  const {ctx}=env();save(ctx,U,'drf_AAAAAAAA',26);save(ctx,V,'drf_BBBBBBBB',2);ctx.resetMemoDirect_();
  const b=ctx.appBootstrap_(U,{payload:{}});eq(b.user.draftExpiring,1);eq(b.user.draftWarnDays,7);ctx.resetMemoDirect_();eq(ctx.appBootstrap_(V,{payload:{}}).user.draftExpiring,0);
});
suite('3. Xuất nháp: draft.get trả đủ nội dung để xuất; người khác không đọc được nháp của mình',()=>{
  const {ctx}=env();save(ctx,U,'drf_AAAAAAAA',20,'Hóa đơn A');const g=ctx.draftGet_(U,{payload:{id:'drf_AAAAAAAA'}});eq(g.data.note,'nội dung drf_AAAAAAAA');eq(g.title,'Hóa đơn A');ok(g.daysLeft===10);
  eq((()=>{try{ctx.draftGet_(V,{payload:{id:'drf_AAAAAAAA'}});return 'OK'}catch(x){return x.code}})(),'NOT_FOUND');
});
suite('4. Dọn nháp theo chính sách: chỉ xóa nháp quá 30 ngày; nháp 29 ngày và nháp người khác còn mới giữ nguyên; chạy lại (trigger trùng) không đổi',()=>{
  const {ctx}=env();save(ctx,U,'drf_OLD00001',31);save(ctx,U,'drf_OLD00002',45);save(ctx,U,'drf_EDGE0001',29);save(ctx,V,'drf_NEW00001',3);
  eq(ctx.draftPurge_(),2);const alive=ctx.repoValid_('DraftEntry').map(x=>x.id).sort();eq(alive.join(','),'drf_EDGE0001,drf_NEW00001');eq(ctx.draftPurge_(),0,'chạy trùng không xóa thêm');eq(ctx.draftPurge_(),0);
  const gone=ctx.repoReadAll_('DraftEntry').find(x=>x.id==='drf_OLD00001');eq(gone.isDeleted,1);eq(gone.dataJson,'');
  eq(ctx.draftList_(U,{payload:{}}).items.length,1);
});
suite('5. Lưu chính THẤT BẠI thì nháp không bị xóa; lưu lại nháp tính lại 30 ngày (không tự gia hạn khi không có thao tác của người dùng)',()=>{
  const {ctx}=env();save(ctx,U,'drf_AAAAAAAA',27);let code='OK';try{ctx.dispatch_(U,'doc.save',{requestId:'rq1',payload:{draftId:'drf_AAAAAAAA',draftVersion:1,direction:'AR'}})}catch(x){code=x.code}ok(code!=='OK','doc.save sai dữ liệu bị từ chối: '+code);
  const row=ctx.repoValid_('DraftEntry').find(x=>x.id==='drf_AAAAAAAA');ok(row&&row.isDeleted!==1&&row.dataJson!=='','nháp còn nguyên sau khi lưu chính thất bại');ok(ctx.draftList_(U,{payload:{}}).items[0].daysLeft<=3,'chưa tự gia hạn');
  const s2=ctx.draftSave_(U,{payload:{id:'drf_AAAAAAAA',kind:'DOC',slot:'AR',title:'x',data:{a:2},ifVersion:row.version}});ok(s2.version>row.version);eq(ctx.draftList_(U,{payload:{}}).items[0].daysLeft,30,'lưu lại → tính lại 30 ngày');
});
console.log('Tổng kiểm tra:',steps);
