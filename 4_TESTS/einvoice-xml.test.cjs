// Đọc XML hóa đơn điện tử (TT78): trường chính, thuế, nhiều dòng, USD, chiết khấu, namespace, lỗi.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const ctx=vm.createContext({console});vm.runInContext(fs.readFileSync(path.join(__dirname,'..','6_NGUON','einvoice-xml.js'),'utf8')+';this.E=EInvoiceXml',ctx);
let steps=0;const eq=(a,b,m)=>{steps++;assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m)},ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',String(e.message).split('\n')[0]);process.exitCode=1}}
const rd=f=>fs.readFileSync(path.join(__dirname,'fixtures',f),'utf8');
suite('1. Hóa đơn bán VND: đầu hóa đơn, hai bên, dòng, thuế KCT/8%, bỏ dòng ghi chú, MCCQT',()=>{
  const r=ctx.E.parse(rd('hdon_ban_tt78.xml'));ok(r.ok,r.error);const i=r.invoice;
  eq([i.form,i.serial,i.number,i.date,i.currency],['1','C26TAA','123','2026-10-05','VND']);eq([i.seller.tax,i.buyer.tax,i.buyer.name],['0312345678','0101234567-001','CÔNG TY ABC']);
  eq(i.lines.length,2,'bỏ dòng TChat=4 (ghi chú)');eq(i.lines[0].name,'Cước vận chuyển hàng từ Cát Lái đi An Thới & phí','giải mã &amp;');eq([i.lines[0].netText,i.lines[0].vat.text,i.lines[0].vat.mode],['10000000','8','EXCLUSIVE']);eq([i.lines[1].netText,i.lines[1].vat.mode],['1500000','NONE']);
  eq(i.totals,{net:11500000,vat:800000,gross:12300000});eq(i.mccqt,'ABCDEF123456');eq(r.warnings,[]);
});
suite('2. Hóa đơn USD có namespace và dòng chiết khấu: giữ 2 số lẻ, cảnh báo dòng âm',()=>{
  const r=ctx.E.parse(rd('hdon_mua_usd_chiet_khau.xml'));ok(r.ok,r.error);const i=r.invoice;eq(i.currency,'USD');eq(i.lines[0].netText,'1250.50');eq(i.lines[0].vat,{mode:'EXCLUSIVE',text:'0',pct:0});
  ok(i.lines[1].isDiscount&&i.lines[1].net===-50,'dòng chiết khấu thành số âm');ok(r.warnings.some(w=>/chiết khấu/.test(w)));
});
suite('3. Thuế suất các dạng: 10%, 5, KCT, KKKNT, trống',()=>{
  eq(ctx.E.vatOf('10%'),{mode:'EXCLUSIVE',text:'10',pct:10});eq(ctx.E.vatOf('5').pct,5);eq(ctx.E.vatOf('KCT').mode,'NONE');eq(ctx.E.vatOf('KKKNT').mode,'NONE');eq(ctx.E.vatOf('').mode,'UNCONFIRMED');eq(ctx.E.vatOf('8,5%').pct,8.5);
});
suite('4. Lỗi: không phải XML, không phải hóa đơn, thiếu thẻ, tổng lệch',()=>{
  ok(!ctx.E.parse('<HDon><DLHDon>').ok);ok(/Thông tư 78/.test(ctx.E.parse('<foo/>').error));ok(!ctx.E.parse('xin chào').ok);
  const bad=rd('hdon_ban_tt78.xml').replace('<TgTCThue>11500000','<TgTCThue>9999');const r=ctx.E.parse(bad);ok(r.ok&&r.warnings.some(w=>/khác/.test(w)),'cảnh báo tổng lệch');
  ok(ctx.E.parse('<HDon><DLHDon><TTChung><SHDon>1</SHDon></TTChung></DLHDon></HDon>').ok===false,'thiếu NDHDon');
});
suite('5. CDATA, thuộc tính, dòng rỗng; số tiền có dấu phẩy',()=>{
  const x='<?xml version="1.0"?><HDon><DLHDon Id="d"><TTChung><KHMSHDon>1</KHMSHDon><KHHDon>A</KHHDon><SHDon>9</SHDon><NLap>2026-10-01</NLap><DVTTe>VND</DVTTe></TTChung><NDHDon><NBan><Ten><![CDATA[CT <A> & B]]></Ten><MST>1</MST></NBan><NMua><Ten>X</Ten><MST>2</MST></NMua><DSHHDVu><HHDVu><TChat>1</TChat><THHDVu>Hàng</THHDVu><ThTien>1,234,000</ThTien><TSuat>10%</TSuat></HHDVu></DSHHDVu></NDHDon></DLHDon></HDon>';
  const r=ctx.E.parse(x);ok(r.ok);eq(r.invoice.seller.name,'CT <A> & B');eq(r.invoice.lines[0].netText,'1234000');
});
console.log('Kiểm thử đọc XML hóa đơn điện tử:',steps,'khẳng định');
