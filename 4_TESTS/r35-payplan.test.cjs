// R35: chọn hóa đơn/chứng từ thanh toán ngay trên phiếu thu/chi (kế hoạch phân bổ theo chứng từ); khi ghi nhận tự phân bổ; không làm hỏng việc ghi nhận khi chứng từ đã hết nợ. Dữ liệu giả.
const assert=require('assert'),path=require('path'),fs=require('fs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
const code=f=>{try{f();return 'OK'}catch(e){return e.code||e.message}};
const head=fs.readFileSync(path.join(__dirname,'fx-pool.test.cjs'),'utf8'),w5=head.indexOf('function world5()'),cut=head.indexOf('\n',w5)+1;
const mod={};new Function('require','__dirname','process','module','console',head.slice(0,cut).replace(/function suite\(name,fn\)\{[^\n]*\n/,'function suite(){}\n').concat('\nmodule.exports={mk,save,payIn,OUT,pay,world2,RATE,U,U2,rid};'))(require,__dirname,process,mod,console);
const H=mod.exports;
const SV=(c,o)=>H.save(c,H.payIn(o));
suite('1. payment.openDocs: chứng từ còn nợ của đối tác theo chiều/tiền tệ, xếp theo ngày; thiếu tham số thì rỗng',()=>{
  const {c}=H.world2();const r=c.paymentOpenDocs_(H.U,{payload:{direction:'IN',partnerId:'p1',currency:'USD'}});eq(r.items.length,1);eq(r.items[0].docId,'d1');eq(r.items[0].outstandingMinor,100000);eq(r.items[0].docNo,'D1');
  eq(c.paymentOpenDocs_(H.U,{payload:{direction:'OUT',partnerId:'p1',currency:'USD'}}).items.length,0,'p1 không có phải trả');eq(c.paymentOpenDocs_(H.U,{payload:{}}).items.length,0);
});
suite('2. Lưu phiếu kèm kế hoạch: hợp lệ được lưu; vượt số phiếu / vượt số còn nợ / sai đối tác / trùng chứng từ / số không hợp lệ bị từ chối; sửa phiếu giữ kế hoạch nếu không gửi lại',()=>{
  const {T,c}=H.world2(),plan=[{docId:'d1',amountMinor:60000}];
  const r=SV(c,{amountMinor:60000,allocPlan:plan});eq(JSON.parse(T.Payment.find(x=>x.id===r.id).allocPlanJson).length,1);
  eq(code(()=>SV(c,{amountMinor:50000,allocPlan:plan})),'VALIDATION_FAILED','tổng vượt số tiền phiếu');eq(code(()=>SV(c,{amountMinor:200000,allocPlan:[{docId:'d1',amountMinor:100001}]})),'VALIDATION_FAILED','vượt số còn nợ');
  eq(code(()=>SV(c,{amountMinor:200000,allocPlan:[{docId:'d2',amountMinor:10}]})),'VALIDATION_FAILED','chứng từ của đối tác khác/chiều khác');eq(code(()=>SV(c,{amountMinor:200000,allocPlan:[{docId:'d1',amountMinor:1},{docId:'d1',amountMinor:2}]})),'VALIDATION_FAILED','trùng');
  eq(code(()=>SV(c,{amountMinor:200000,allocPlan:[{docId:'d1',amountMinor:0}]})),'VALIDATION_FAILED');eq(code(()=>SV(c,{amountMinor:200000,allocPlan:[{docId:'khong-co',amountMinor:5}]})),'VALIDATION_FAILED');
  c.paymentSave_(H.U,{requestId:H.rid(),payload:Object.assign(H.payIn({amountMinor:60000}),{id:r.id,ifVersion:r.version})});ok(!!T.Payment.find(x=>x.id===r.id).allocPlanJson,'không gửi allocPlan = giữ nguyên');
  c.paymentSave_(H.U,{requestId:H.rid(),payload:Object.assign(H.payIn({amountMinor:60000,allocPlan:[]}),{id:r.id,ifVersion:T.Payment.find(x=>x.id===r.id).version})});eq(T.Payment.find(x=>x.id===r.id).allocPlanJson,'','gửi [] = xóa kế hoạch');
  const g=(()=>{const q=SV(c,{amountMinor:60000,allocPlan:plan});return c.paymentGet_(H.U,{payload:{id:q.id}})})();eq(g.payment.allocPlan[0].docNo,'D1');eq(g.payment.allocPlan[0].amountMinor,60000);
});
suite('3. Ghi nhận phiếu: tự phân bổ theo kế hoạch (đúng chứng từ, đúng số), xóa kế hoạch, phần còn lại chưa phân bổ',()=>{
  const {T,c}=H.world2();const r=SV(c,{amountMinor:80000,allocPlan:[{docId:'d1',amountMinor:60000}]});const p=T.Payment.find(x=>x.id===r.id);p.payNo='PT-1';p.status='APPROVED';p.approvedBy='x';
  const res=c.payPost_(H.U,{requestId:H.rid(),payload:{id:p.id}});eq(res.status,'POSTED');eq(res.alloc.applied,true);eq(res.alloc.allocatedMinor,60000);
  eq(T.Allocation.length,1);eq(T.Allocation[0].docId,'d1');eq(T.Allocation[0].amountMinor,60000);eq(T.Allocation[0].paymentId,p.id);eq(T.Payment.find(x=>x.id===p.id).allocPlanJson,'');
  const g=c.paymentGet_(H.U,{payload:{id:p.id}});eq(g.payment.allocatedMinor,60000);eq(g.payment.unallocatedMinor,20000);
});
suite('4. Chứng từ đã hết nợ lúc ghi nhận: phiếu VẪN ghi nhận, báo lý do, không phân bổ',()=>{
  const {T,c}=H.world2();const a=SV(c,{amountMinor:100000,allocPlan:[{docId:'d1',amountMinor:100000}]}),b=SV(c,{amountMinor:50000,allocPlan:[{docId:'d1',amountMinor:50000}]});
  const post=id=>{const p=T.Payment.find(x=>x.id===id);p.payNo='PT-'+id.slice(-3);p.status='APPROVED';p.approvedBy='x';return c.payPost_(H.U,{requestId:H.rid(),payload:{id}})};
  eq(post(a.id).alloc.applied,true);const rb=post(b.id);eq(rb.status,'POSTED');eq(rb.alloc.applied,false);ok(/không còn nợ|phân bổ tay/i.test(rb.alloc.message),rb.alloc.message);eq(T.Payment.find(x=>x.id===b.id).status,'POSTED');eq(T.Allocation.length,1,'chỉ phiếu đầu có phân bổ');
});
suite('5. Phiếu không có kế hoạch ghi nhận như cũ (alloc = null)',()=>{
  const {T,c}=H.world2();const r=SV(c,{amountMinor:1000});const p=T.Payment.find(x=>x.id===r.id);p.payNo='PT-9';p.status='APPROVED';p.approvedBy='x';eq(c.payPost_(H.U,{requestId:H.rid(),payload:{id:p.id}}).alloc,null);eq(T.Allocation.length,0);
});
console.log('Tổng kiểm tra:',steps);
