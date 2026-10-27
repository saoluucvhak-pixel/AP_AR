const vm=require('vm'),fs=require('fs'),assert=require('assert');
const SRC=process.env.SRC||(process.env.BACKEND_SRC||require('path').join(__dirname,'..','1_BACKEND','Backend.gs'));
const src=fs.readFileSync(SRC,'utf8');
const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-25'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
vm.runInContext(src,ctx);
const doc=(id,o)=>{const d=Object.assign({id,docNo:id.toUpperCase(),partnerId:'p1',direction:'AR',currency:'VND',status:'POSTED',isOpening:0,businessGroupCode:'G1',docDate:'2026-02-01',postingDate:'2026-02-01',statementPeriod:'2026-02',docType:'INVOICE'},o);if(o.docDate&&!o.postingDate)d.postingDate=o.docDate;return d};
const line=(id,docId,gross,o)=>Object.assign({id,docId,lineNo:1,description:'Phí '+id,netMinor:gross,vatMode:'NONE',vatMinor:0,grossMinor:gross,isPassThrough:0,containerQty:null,shipmentRefId:'',lotNote:''},o);
const T={
 Partner:[{id:'p1',shortName:'ABC',legalName:'ABC Co',taxCode:'1',status:'ACTIVE'}],
 DebtDoc:[doc('d1',{postingDate:'2026-02-10'}),doc('d2',{businessGroupCode:'G2'}),
  doc('d4',{status:'REVERSED'}),doc('r4',{docType:'REVERSAL',docDate:'2026-04-01',postingDate:'2026-04-01',statementPeriod:'',reversesDocId:'d4'}),
  doc('a1',{docType:'ADJ_DEC',docDate:'2026-03-01',statementPeriod:''}),doc('a2',{docType:'ADJ_INC',docDate:'2026-12-01',statementPeriod:''}),
  doc('d5',{docDate:'2026-12-05',postingDate:'2026-12-05'})],
 DebtLine:[line('l1','d1',100),line('l2','d2',900),line('l4','d4',200),line('lr4','r4',-200,{adjustsLineId:'l4'}),
  line('la1','a1',-30,{adjustsLineId:'l1'}),line('la2','a2',50,{adjustsLineId:'l1'}),line('l5','d5',777)],
 ShipmentRef:[],Allocation:[],Config:[],
 Payment:[{id:'x1',payNo:'PH-1',direction:'IN',partnerId:'p1',cashAccountCode:'BANK1',status:'POSTED',effectiveDate:'2026-03-01',amountMinor:500,currency:'VND'}],
 Order:[{id:'o1',orderNo:'DH1',customerPartnerId:'p1',poNo:'PO1',orderDate:'2026-02-01',businessGroupCode:'G1',currency:'VND',serviceFileId:'',status:'OPEN'}],
 ServiceFile:[],AccrualSplit:[],
 Accrual:[
  {id:'c1',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-02-05',netMinor:1000,vatMinor:100,grossMinor:1100,currency:'VND',status:'INVOICED',docId:'d1'},
  {id:'c2',orderId:'o1',kind:'COST',partnerId:'p1',accrualDate:'2026-03-01',netMinor:400,vatMinor:40,grossMinor:440,currency:'VND',status:'OPEN',docId:''},
  {id:'c3',orderId:'o1',kind:'REVENUE',partnerId:'p1',accrualDate:'2026-11-01',netMinor:500,vatMinor:0,grossMinor:500,currency:'VND',status:'OPEN',docId:''}]};
ctx.repoValid_=t=>(T[t]||[]).slice();ctx.repoCommitted_=ctx.repoValid_;
const full={id:'u',email:'u@x',role:'ACCOUNTANT',scope:{allPartners:true}};
const tot=(rep)=>rep.rows.filter(r=>r.t==='total').pop().cells;
// ---- R05
const r5=(asOf)=>ctx.rep05_(full,'R05',{partnerId:'p1',statementPeriod:'2026-02',direction:'AR',currency:'VND',asOf});
// d1 100 + d2 900 + d4 200 + đảo d4 (-200) + điều chỉnh giảm (-30); a2 (+50, 01/12) và d5 (777, 05/12) sau ngày chốt 25/10 nên không tính
assert.strictEqual(tot(r5('2026-10-25')).total,970,'R05 tại 25/10');
assert.strictEqual(tot(r5('2027-01-01')).total,970+50+777,'R05 tại 01/01/2027');
// tại 15/03/2026: đảo d4 (01/04) chưa xảy ra => 100+900+200-30
assert.strictEqual(tot(r5('2026-03-15')).total,1170,'R05 tại 15/03');
assert.ok(r5('2026-10-25').rows.some(r=>/Đảo/.test(r.cells.desc||'')),'có dòng đảo');
assert.ok(r5('2026-10-25').rows.some(r=>/Điều chỉnh/.test(r.cells.desc||'')),'có dòng điều chỉnh');
// ---- R09
const r9=(asOf)=>{const rep=ctx.rep09_(full,'R09',{asOf});return rep.rows.filter(r=>r.t==='data')[0].cells};
let c=r9('2026-10-25');
assert.deepStrictEqual([c.rev,c.cost,c.unRev,c.unCost],[1000,0,0,440],'R09 tại 25/10: chi phí c2 chưa lập hóa đơn → chưa vào chi phí ghi nhận, nằm ở cột chưa nhận HĐ');
c=r9('2026-02-07'); // hóa đơn ghi nhận 10/02 chưa xảy ra
assert.deepStrictEqual([c.rev,c.cost,c.unRev,c.unCost],[0,0,1100,0],'R09 tại 07/02: hóa đơn chưa ghi nhận → doanh thu chưa vào, còn ở cột chưa lập HĐ');
c=r9('2026-12-31');
assert.deepStrictEqual([c.rev,c.cost],[1000,0],'R09 tại 31/12: chỉ khoản đã lập hóa đơn (c3 và c2 chưa lập HĐ không vào)');
assert.ok(ctx.rep09_(full,'R09',{asOf:'2026-10-25'}).columns.some(x=>/đã gồm thuế/.test(x.label)),'nhãn cột');
// ---- R06
const rep6=ctx.rep06_(full,'R06',{partnerId:'p1',from:'2026-01-01',to:'2026-10-25',asOf:'2026-10-25'});
const items=rep6.rows.map(r=>r.cells.item);
const un=rep6.rows.find(r=>/chưa phân bổ/.test(r.cells.item||''));
const closing=rep6.rows.find(r=>/^Dư cuối kỳ/.test(r.cells.item||'')).cells.amount;
const net=rep6.rows.find(r=>/sau khi trừ ứng trước/.test(r.cells.item||''));
assert.ok(un&&un.cells.amount===-500,'R06 có dòng ứng trước -500');
assert.strictEqual(net.cells.amount,closing-500,'R06 dư sau khi trừ ứng trước');
console.log('OK R05 =',tot(r5('2026-10-25')).total,'| R09 =',JSON.stringify(r9('2026-10-25')),'| R06 closing',closing,'sau ứng trước',net.cells.amount);
