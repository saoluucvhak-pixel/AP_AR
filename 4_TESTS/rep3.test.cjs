const vm=require('vm'),fs=require('fs'),assert=require('assert');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(fs.readFileSync(SRC,'utf8'),ctx);
const doc=(id,o)=>Object.assign({id,docNo:id.toUpperCase(),partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-02-01',postingDate:'2026-02-01',statementPeriod:'2026-02',docType:'INVOICE',batchLabel:'B1',totalGrossMinor:0},o);
const line=(id,docId,gross,o)=>Object.assign({id,docId,lineNo:1,description:'Phí '+id,feeTypeCode:'F',netMinor:gross,vatMode:'NONE',vatMinor:0,grossMinor:gross,isPassThrough:0,containerQty:null,shipmentRefId:'',serviceFileId:''},o);
const T={
 Partner:[{id:'p1',shortName:'ABC',legalName:'ABC Co',taxCode:'1',status:'ACTIVE'}],
 DebtDoc:[doc('d1',{}),doc('d2',{businessGroupCode:'G2'}),doc('d4',{status:'REVERSED'}),
  doc('r4',{docType:'REVERSAL',docDate:'2026-04-01',postingDate:'2026-04-01',reversesDocId:'d4'}),
  doc('a1',{docType:'ADJ_DEC',docDate:'2026-03-01'}),doc('dr',{status:'DRAFT',businessGroupCode:'G2',totalGrossMinor:50})],
 DebtLine:[line('l1','d1',100),line('l2','d2',900),line('l4','d4',200),line('lr4','r4',-200,{adjustsLineId:'l4'}),line('la1','a1',-30,{adjustsLineId:'l1'})],
 Allocation:[{id:'al1',paymentId:'x1',debtLineId:'l1',docId:'d1',partnerId:'p1',amountMinor:100,effectiveDate:'2026-03-10',status:'POSTED'}],
 Payment:[{id:'x1',payNo:'PH-1',direction:'IN',partnerId:'p1',cashAccountCode:'B',status:'POSTED',effectiveDate:'2026-03-01',amountMinor:500,currency:'VND'}],
 ShipmentRef:[],Config:[],ServiceFile:[],Catalog:[]};
ctx.repoValid_=t=>(T[t]||[]).slice();
const U={id:'u',email:'u@x',role:'ACCOUNTANT',scope:{allPartners:true}};
const totals=(rep,label)=>rep.rows.filter(r=>r.t==='total'&&(!label||new RegExp(label).test(Object.values(r.cells).join('|')))).map(r=>r.cells);
const r1=(asOf,g)=>ctx.rep01_(U,'R01',{asOf,group:g});
const r2=(asOf)=>ctx.rep02_(U,'R02',{asOf});
const r4=(asOf)=>ctx.rep04_(U,'R04',{asOf,partnerId:'p1',direction:'AR'});
const r7=(asOf)=>ctx.rep07_(U,'R07',{asOf});
for (const [asOf,expOut] of [['2026-03-15',1070],['2026-10-25',870]]) {
  const o1=totals(r1(asOf),'TỔNG PHẢI THU')[0].out, o2=totals(r2(asOf))[0].out, o4=totals(r4(asOf))[0].out;
  assert.strictEqual(o1,expOut,'R01 '+asOf); assert.strictEqual(o2,expOut,'R02 '+asOf+' (R01='+o1+')'); assert.strictEqual(o4,expOut,'R04 '+asOf+' (R01='+o1+')');
}
// R02: chứng từ đã đảo xong (về 0) bị ẩn, nhưng còn hiện khi ngày chốt trước ngày đảo
const hasDoc=(rep,no)=>rep.rows.some(r=>r.cells.docNo===no);
assert.ok(hasDoc(r2('2026-03-15'),'D4'),'D4 hiện trước ngày đảo');
assert.ok(!hasDoc(r2('2026-10-25'),'D4'),'D4 ẩn sau ngày đảo');
// R07: chỉ dòng còn nợ dương; số thừa/ứng trước ghi chú
const rep7=r7('2026-10-25'); const t7=totals(rep7,'TỔNG PHẢI THU')[0];
assert.strictEqual(t7.total,900,'R07 tổng còn nợ dương');
assert.ok(rep7.notes.some(n=>/thanh toán thừa 30/.test(n)&&/chưa phân bổ 400/.test(n)),'R07 ghi chú số thừa: '+JSON.stringify(rep7.notes));
// R01: khoản chờ ghi nhận theo bộ lọc nhóm
const pend=(rep)=>rep.notes.filter(n=>/Chờ ghi nhận/.test(n));
assert.strictEqual(pend(r1('2026-10-25')).length,1,'R01 không lọc nhóm: có khoản chờ');
assert.strictEqual(pend(r1('2026-10-25','G1')).length,0,'R01 nhóm G1: không có khoản chờ của G2');
console.log('OK R01=R02=R04 tại 2 ngày chốt; R07 =',t7.total,'| notes R07:',rep7.notes.filter(n=>/chưa trừ/.test(n)).join(' '));
