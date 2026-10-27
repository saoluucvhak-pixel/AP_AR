// Biểu mẫu Excel nhập hàng loạt: đủ cột khớp mã nguồn nhập, ghi/đọc .xlsx tự kiểm (không phụ thuộc thư viện ngoài).
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const SRC=path.join(__dirname,'..','6_NGUON');
const ctx=vm.createContext({console,TextEncoder,TextDecoder,CompressionStream,DecompressionStream,Response,Uint8Array,DataView});
vm.runInContext(fs.readFileSync(path.join(SRC,'xlsx-lite.js'),'utf8')+';this.XL=XLSXLite;'+fs.readFileSync(path.join(SRC,'bulk-template.js'),'utf8')+';this.SPEC=BULK_SPEC;',ctx);
const be=fs.readFileSync(path.join(SRC,'Backend.gs'),'utf8');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m)};
async function suite(n,f){try{await f();console.log('✔',n)}catch(e){console.log('✖',n,'-',String(e.message).split('\n')[0]);process.exitCode=1}}
const lists={feeTypes:[{code:'F',name:'Phí'}],groups:[{code:'G1',name:'N1'}],currencies:[{code:'VND'},{code:'USD'}],serviceCodes:[{code:'FWD',name:'Fwd'}],partners:['ABC'],orders:['DH-1']};
(async()=>{
await suite('1. Mọi cột của biểu mẫu đều được mã nguồn nhập hàng loạt xử lý (không lệch cột)',()=>{
  const body=(a,b)=>be.slice(be.indexOf('function '+a),be.indexOf('function '+b));const regionOf={INV_AR:body('invBulkBuild_','docBulkPreview_'),INV_AP:body('invBulkBuild_','docBulkPreview_'),REVENUE:body('bulkBuild_','orderBulkPreview_'),COST:body('bulkBuild_','orderBulkPreview_')};
  Object.keys(ctx.SPEC.SPEC).forEach(k=>{ctx.SPEC.SPEC[k].cols.forEach(c=>{ok(new RegExp('\\.'+c.k+'\\b').test(regionOf[k]),k+': mã nguồn nhập không đọc cột '+c.k)})});
  eq(ctx.SPEC.SPEC.INV_AR.cols.length,23);eq(ctx.SPEC.SPEC.INV_AP.cols.length,23);eq(ctx.SPEC.SPEC.REVENUE.cols.length,12);eq(ctx.SPEC.SPEC.COST.cols.length,12);
  Object.keys(ctx.SPEC.SPEC).forEach(k=>{const s=ctx.SPEC.SPEC[k];s.examples.forEach(e=>ok(e.length===s.cols.length,k+': dòng ví dụ phải đủ '+s.cols.length+' cột, có '+e.length))});
});
await suite('2. Tạo 4 biểu mẫu: 4 sheet, tiêu đề đúng, danh sách chọn lấy từ danh mục, đọc lại được',async()=>{
  for(const k of Object.keys(ctx.SPEC.SPEC)){
    const b=await ctx.SPEC.build(k,lists),wb=await ctx.XL.read(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));
    eq(wb.sheets.map(s=>s.name),['Nhập liệu','Hướng dẫn','Ví dụ','Danh mục'],k);
    const sp=ctx.SPEC.SPEC[k];eq(wb.sheets[0].rows[3],sp.cols.map(c=>c.t),k+': dòng tiêu đề');ok(/BIỂU MẪU/.test(wb.sheets[0].rows[0][0]));
    ok(wb.sheets[1].rows.some(r=>r[1]==='Diễn giải'||r[1]==='Mã dịch vụ'),'có giải thích cột');eq(wb.sheets[2].rows.length,2+sp.examples.length,'sheet ví dụ');
    const dm=wb.sheets[3].rows.map(r=>r.join('|')).join('\n');ok(/Phí\|F\|G1\|N1\|VND\|FWD\|Fwd/.test(dm),k+': danh mục');ok(/ABC/.test(dm)&&/DH-1/.test(dm));
  }
});
await suite('3. Tệp .xlsx do Excel/openpyxl tạo: đọc chuỗi dùng chung, số, ô ngày thật → dd/MM/yyyy',async()=>{
  const os=require('os'),{spawnSync}=require('child_process'),tmpd=fs.mkdtempSync(path.join(os.tmpdir(),'katy-bt-')),f=path.join(tmpd,'bt_excel.xlsx');
  const py=`import sys,openpyxl,datetime;wb=openpyxl.Workbook();ws=wb.active;ws.append(['Chữ',1234.5,datetime.date(2026,10,6),1000000]);wb.save(sys.argv[1])`;
  let made=false;for(const exe of (process.env.PYTHON?[process.env.PYTHON]:['python3','python','py'])){const r=spawnSync(exe,['-I','-',f],{input:py,encoding:'utf8'});if(!r.error&&r.status===0){made=true;break}}
  if(!made){try{fs.rmSync(tmpd,{recursive:true,force:true})}catch(e){}console.log('  ⚠ BỊ CHẶN (chưa xác minh phần này): không chạy được Python/openpyxl — đặt biến PYTHON hoặc cài openpyxl');return}
  const b=fs.readFileSync(f),wb=await ctx.XL.read(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));
  eq(wb.sheets[0].rows[0],['Chữ','1234.5','06/10/2026','1000000']);
  try{fs.rmSync(tmpd,{recursive:true,force:true})}catch(e){}
});
await suite('4. Tệp hỏng/không phải xlsx báo lỗi rõ ràng',async()=>{let m='';try{await ctx.XL.read(new Uint8Array([1,2,3,4]).buffer)}catch(e){m=e.message}ok(/xlsx/.test(m),m)});
console.log('Kiểm thử biểu mẫu Excel nhập hàng loạt:',steps,'khẳng định');
})();
