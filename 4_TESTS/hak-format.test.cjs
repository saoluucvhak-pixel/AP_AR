// Kiểm thử áp chuẩn HAK_ACCOUNTING_REPORT_STANDARD (số/ngày/căn lề). Dữ liệu giả, KHÔNG phải Google thật.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
const FMT=fs.readFileSync(path.join(__dirname,'..','6_NGUON','hak-format.js'),'utf8');
const IDX=fs.readFileSync(path.join(__dirname,'..','2_GATEWAY','index.html'),'utf8');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
const mk=()=>{const c=vm.createContext({});vm.runInContext(FMT+';this.H=HAKFormat;',c);return c.H};
const H=mk();
suite('1. Vector của repo chuẩn: nhóm nghìn kiểu VN, thập phân chính xác, làm tròn half-up',()=>{
  eq(H.formatExact('1250000.75',{digits:2}),'1.250.000,75');
  eq(H.formatExact('-0.004',{digits:2}),'0,00','số âm làm tròn về 0 không có dấu trừ');
  eq(H.formatExact('9007199254740993.12',{digits:2}),'9.007.199.254.740.993,12','vượt 2^53 vẫn đúng từng chữ số');
  eq(H.formatExact('2.005',{digits:2}),'2,01');
  eq(H.formatDateISO('2026-10-16'),'16/10/2026');
  assert.throws(()=>H.formatDateISO('2026-02-31'));
  eq(H.alignFor('money'),'right');eq(H.alignFor('date'),'center');eq(H.alignFor('code'),'left');eq(H.alignFor('text'),'left');steps+=4;
});
suite('2. formatMinor tương thích hoàn toàn hàm cũ (so khớp nhiều giá trị, kể cả âm/0/số lớn)',()=>{
  const old=(m,d)=>{const neg=m<0,dg=String(Math.abs(m)).padStart(d+1,'0'),ip=d?dg.slice(0,-d):dg;return (neg?'-':'')+ip.replace(/\B(?=(\d{3})+(?!\d))/g,'.')+(d?','+dg.slice(-d):'')};
  const vals=[0,1,-1,5,-5,99,100,999,1000,-1000,123456,1250000,-9876543,9007199254740991,-9007199254740991];
  for(const d of [0,1,2,3,6])for(const v of vals)eq(H.formatMinor(v,d),old(v,d),v+'/'+d);
  eq(H.formatMinor(1250075,2),'12.500,75');
  assert.throws(()=>H.formatMinor(1.5,2),/không hợp lệ/);assert.throws(()=>H.formatMinor(1,7));assert.throws(()=>H.formatMinor(9007199254740992,0));steps+=3;
});
suite('3. formatDate: rỗng → giá trị thay thế, ngày sai lịch giữ nguyên chuỗi gốc (không bịa ngày)',()=>{
  eq(H.formatDate('2026-10-16','—'),'16/10/2026');eq(H.formatDate('','—'),'—');eq(H.formatDate(null),'');eq(H.formatDate('2026-02-31'),'2026-02-31');eq(H.formatDate('abc','—'),'abc');
});
suite('4. Backend nhúng đúng bản chuẩn (không sửa tay) và formatMinorVn_ dùng chuẩn này',()=>{
  const full=SRC.includes('HAK Accounting & Reporting Standard');
  if(full)ok(SRC.includes(FMT.trim()),'vùng HAKFormat trong Backend.gs trùng nguyên văn src/hak-format.js');
  else{const fn=n=>{const a=FMT.indexOf('function '+n);return FMT.slice(a,FMT.indexOf('\n    }\n',a)+7)};['formatExact','formatDateISO','alignFor'].forEach(n=>ok(SRC.includes(fn(n)),'bản an toàn (đã bỏ chú thích) vẫn chứa nguyên hàm '+n))}
  ok(IDX.includes('var HAKFormat')&&IDX.includes('function formatExact'),'index.html nhúng bản chuẩn');
  ok(!/@@HAK_FORMAT@@/.test(SRC)&&!/@@HAK_FORMAT@@/.test(IDX),'không còn dấu hiệu thay thế');
  const c=vm.createContext({console,Logger:{log(){}}});vm.runInContext(SRC,c);
  eq(c.formatMinorVn_(1250075,2),'12.500,75');eq(c.formatMinorVn_(-5,0),'-5');eq(c.rptDateVn_('2026-10-16'),'16/10/2026');eq(c.rptDateVn_(null),'');
  const d=c.rptDateCell_('2026-10-16');ok(Object.prototype.toString.call(d)==='[object Date]','ngày hợp lệ → ô ngày thật');
  eq(d.getHours(),12,'đặt 12:00 tránh lệch múi giờ');eq(c.rptDateCell_('2026-02-31'),'2026-02-31','ngày sai giữ chuỗi');eq(c.rptDateCell_(null),'');
  eq(c.col_('d','Ngày','date').align,'center');eq(c.col_('m','Tiền','money').align,'right');eq(c.col_('t','Chữ').align,'left');
});
suite('5. Mã số thuế/số hóa đơn là chuỗi: không bị đổi thành số, không bị nhóm nghìn',()=>{
  const c=vm.createContext({console,Logger:{log(){}}});vm.runInContext(SRC,c);
  eq(c.sanitizeCell_('0312345678'),'0312345678');eq(c.sanitizeCell_('00012345'),'00012345');eq(c.sanitizeCell_('=1+1').includes('=1+1'),true);ok(/^['\s]/.test(c.sanitizeCell_('=1+1')),'công thức bị vô hiệu: '+c.sanitizeCell_('=1+1'));
});
console.log('Tổng kiểm tra:',steps);
