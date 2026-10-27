const vm=require('vm'),fs=require('fs'),assert=require('assert');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-31'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync((process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs')),'utf8'),ctx);
const doc=(id,o)=>Object.assign({id,docNo:id.toUpperCase(),partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-10-02',postingDate:'2026-10-02',invoiceNo:'',invoiceSerial:'',invoiceDate:'',docType:'INVOICE',totalGrossMinor:0},o);
const line=(id,docId,net,vat,o)=>Object.assign({id,docId,lineNo:1,description:'Phí '+id,feeTypeCode:'F',netMinor:net,vatMinor:vat,grossMinor:net+vat,vatMode:vat?'EXCLUSIVE':'NONE',vatRateBp:vat?1000:null,isPassThrough:0},o);
const T={Partner:[{id:'p1',shortName:'KH',legalName:'Công ty KH',taxCode:'0101'},{id:'p2',shortName:'NCC',legalName:'Công ty NCC',taxCode:''}],
 DebtDoc:[
  doc('d1',{invoiceNo:'A1',invoiceSerial:'C26TAA',invoiceDate:'2026-10-05'}),
  doc('d2',{currency:'USD',invoiceNo:'U1',invoiceDate:'2026-10-06'}),
  doc('d3',{invoiceNo:'A3',invoiceDate:'2026-10-07'}),
  doc('d4',{invoiceNo:'A4',invoiceDate:'2026-10-08',status:'REVERSED'}),
  doc('r4',{docType:'REVERSAL',docDate:'2026-10-20'}),
  doc('a1',{docType:'ADJ_DEC',docDate:'2026-10-21'}),
  doc('dr',{status:'DRAFT',invoiceNo:'DR',invoiceDate:'2026-10-09'}),
  doc('old',{invoiceNo:'OLD',invoiceDate:'2026-09-30'}),
  doc('op',{isOpening:1,invoiceDate:'2026-10-03'}),
  doc('b1',{direction:'AP',partnerId:'p2',invoiceNo:'M1',invoiceSerial:'K26',invoiceDate:'2026-10-10'}),
  doc('b2',{direction:'AP',partnerId:'p2',invoiceNo:'M2',invoiceDate:'2026-10-11'})],
 DebtLine:[
  line('l1a','d1',1000,100),line('l1b','d1',500,0,{lineNo:2}),line('l1c','d1',200,0,{lineNo:3,isPassThrough:1}),
  line('l2','d2',999,99),
  line('l3','d3',300,30,{vatMode:'UNCONFIRMED'}),
  line('l4','d4',400,40),line('lr4','r4',-400,-40,{adjustsLineId:'l4'}),
  line('la1','a1',-50,0,{adjustsLineId:'l1a'}),
  line('ldr','dr',111,11),line('lold','old',222,22),line('lop','op',333,33),
  line('lb1','b1',2000,160,{vatRateBp:800}),line('lb2','b2',700,0)],
 Allocation:[],Payment:[],ServiceFile:[],Config:[],Catalog:[]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const full={id:'u',email:'u@x',role:'ACCOUNTANT',scope:{allPartners:true},displayName:'U'};
const P={asOf:'2026-10-31',from:'2026-10-01',to:'2026-10-31'};
const out=ctx.reportRun_(full,{payload:{code:'R10',params:P}});
const tot=out.rows.filter(r=>r.t==='total')[0].cells;
// 10%: 1000 + (đảo: 400 − 400) ; KCT: 500 ; không tính chi hộ 200, USD, nháp, ngoài kỳ, số dư đầu kỳ, chưa xác nhận, điều chỉnh
assert.strictEqual(tot.net,1500,'doanh số bán ra'); assert.strictEqual(tot.vat,100,'thuế đầu ra');
const rows=out.rows.filter(r=>r.t==='data').map(r=>r.cells);
assert.ok(rows.some(r=>r.invoiceNo==='A1'&&r.form==='C26TAA'&&r.rate==='10%'&&r.taxCode==='0101'),'có dòng A1 đủ ký hiệu, MST, thuế suất');
assert.ok(rows.some(r=>r.rate==='KCT'&&r.net===500),'dòng không chịu thuế'); assert.ok(!rows.some(r=>r.invoiceNo==='DR'||r.invoiceNo==='OLD'||r.invoiceNo==='U1'),'loại nháp, ngoài kỳ, ngoại tệ');
assert.ok(rows.some(r=>/ĐẢO/.test(r.note)&&r.net===-400),'dòng đảo âm'); assert.ok(rows.some(r=>/ĐIỀU CHỈNH/.test(r.note)),'điều chỉnh liệt kê riêng');
assert.ok(rows.some(r=>r.invoiceNo==='A3'&&r.rate==='?'),'chưa xác nhận thuế liệt kê riêng'); assert.strictEqual(out.issueBlockers.length,1,'chặn phát hành bản chốt');
assert.ok(out.notes.some(n=>/ngoại tệ/.test(n))&&out.notes.some(n=>/chưa ghi nhận/.test(n))&&out.notes.some(n=>/chi hộ/.test(n)),'ghi chú loại trừ: '+JSON.stringify(out.notes));
assert.ok(out.rows.some(r=>r.t==='subtotal'&&/10%/.test(r.cells.desc)&&r.cells.net===1000&&r.cells.vat===100),'cộng theo thuế suất');
// mua vào
const inn=ctx.reportRun_(full,{payload:{code:'R11',params:P}}); const ti=inn.rows.filter(r=>r.t==='total')[0].cells;
assert.strictEqual(ti.net,2700,'mua vào'); assert.strictEqual(ti.vat,160); assert.ok(inn.notes.some(n=>/đủ điều kiện khấu trừ/.test(n)),'ghi chú khấu trừ'); assert.ok(inn.notes.some(n=>/chưa có mã số thuế/.test(n)),'ghi chú thiếu MST');
assert.strictEqual(inn.columns[4].label,'Tên người bán'); assert.strictEqual(out.columns[4].label,'Tên người mua');
// quyền theo nhóm: người chỉ nhóm G2 không thấy gì
const g2={id:'g',email:'g@x',role:'ACCOUNTANT',scope:{allPartners:true,businessGroups:['G2']}};
assert.strictEqual(ctx.reportRun_(g2,{payload:{code:'R10',params:P}}).rows.filter(r=>r.t==='data').length,0,'phạm vi nhóm');
// khoảng thời gian sai
try{ctx.reportRun_(full,{payload:{code:'R10',params:{asOf:'2026-10-31',from:'2026-11-01',to:'2026-10-01'}}});assert.fail('x')}catch(e){assert.strictEqual(e.code,'VALIDATION_FAILED')}
console.log('OK R10/R11: bán ra net',tot.net,'vat',tot.vat,'| mua vào net',ti.net,'vat',ti.vat);
