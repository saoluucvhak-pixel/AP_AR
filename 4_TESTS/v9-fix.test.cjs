// Sửa sau kiểm tra bản 8: chỉ mục tra ID sau khi giao dịch hoàn tất; gửi lại lần lưu nháp mất phản hồi.
const fs=require('fs'),vm=require('vm'),path=require('path');
const pre=fs.readFileSync(path.join(__dirname,'draft-entry.test.cjs'),'utf8').split("suite('1.")[0];
const extra=String.raw`
const find0=ctx.repoFind_;
ctx.repoAppend_('Partner',[base({id:'pz',shortName:'Z',legalName:'Z',isCustomer:1,status:'ACTIVE',commitState:'P',txId:'txz'})]);
reset();eq(find0('Partner','pz'),null,'đang chờ: chưa thấy');
ctx.setOpenTx_('txz','COMMITTED');
ok(ctx.repoValid_('Partner').some(r=>r.id==='pz'),'repoValid thấy sau COMMITTED');ok(ctx.repoFind_('Partner','pz'),'repoFind_ cũng phải thấy (chỉ mục không được cũ)');
ok(ctx.repoCommitted_('Partner').some(r=>r.id==='pz'),'repoCommitted_ cũng thấy');
const id='drf_replay000001';
const r1=C(UA,'draftSave_',{id,kind:'DOC',ifVersion:0,data:{n:1}});eq(r1.version,1);
const r2=C(UA,'draftSave_',{id,kind:'DOC',ifVersion:0,data:{n:1}});eq(r2.version,1,'gửi lại đúng nội dung → thành công, không tạo phiên bản mới');ok(r2.replay);eq(ctx.repoValid_('DraftEntry').filter(x=>x.id===id).length,1);
eq(code(()=>C(UA,'draftSave_',{id,kind:'DOC',ifVersion:0,data:{n:2}})),'VERSION_CONFLICT','nội dung khác với phiên bản cũ vẫn là xung đột thật');
eq(C(UA,'draftGet_',{id}).data.n,1,'nháp không bị ghi đè');
console.log('PASS v9 fixes:',steps,'assertions');
`;
vm.runInNewContext(pre+extra,{require,__dirname,process,console},{filename:'v9-fix.cjs'});
