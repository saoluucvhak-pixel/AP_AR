// R36: lãi gộp quy đổi VND (tham khảo) của đơn: chỉ khoản ĐÃ GHI NHẬN, quy đổi theo tỷ giá ĐÃ LƯU trên từng chứng từ (gốc và từng điều chỉnh). Dữ liệu giả, KHÔNG phải Google thật.
const assert=require('assert'),path=require('path'),makeEnv=require('./bench/_env.cjs'),seed=require('./bench/_seed_po.cjs');
const SRCP=process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs');
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.deepStrictEqual(a,b,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',(process.env.FULL?e.stack:e.message.split('\n')[0]));process.exitCode=1}}
function env(){const {ctx}=makeEnv(SRCP);ctx.ensureSchema();const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o),cat=(id,c,d)=>B({id,catalogType:'CURRENCY',code:c,name:c,attrsJson:JSON.stringify({decimals:d}),active:1,sortOrder:1});
  ctx.repoAppend_('Catalog',[cat('c1','VND',0),cat('c2','USD',2)]);ctx.resetMemoDirect_();return ctx}
// khoản phát sinh đã chiếu đến ngày chốt (như accrualAt_ trả về)
const A=(id,kind,cur,net,x)=>Object.assign({id,kind,currency:cur,netMinor:net,status:'INVOICED',isPassThrough:0,docId:'D_'+id},x||{});
const doc=(id,rate,x)=>Object.assign({id,docType:'INVOICE',status:'POSTED',postingDate:'2026-10-01',fxRateE4:rate},x||{});
// ctx giả của accrualCtx_: byAcc (khoản → các chứng từ), docById, revOf, adjBy
function cx(byAcc,adjBy){const docById={};Object.keys(byAcc).forEach(k=>Object.keys(byAcc[k]).forEach(d=>docById[d]=byAcc[k][d]));return {byAcc,docById,revOf:{},adjBy:adjBy||{}}}
const acc=(...a)=>{const m={};a.forEach(x=>m[x.id]=x);return m};
const T0='2026-10-27';
suite('1. USD đã ghi nhận quy đổi theo tỷ giá trên chứng từ; VND giữ nguyên; lãi = doanh thu − chi phí (có %)',()=>{
  const c=env(),r1=A('r1','REVENUE','USD',193000),k1=A('k1','COST','USD',50000),k2=A('k2','COST','VND',40000000);
  const ctx=cx({r1:{D1:doc('D1',253000)},k1:{D2:doc('D2',254000)},k2:{D3:doc('D3',0)}});
  const r=c.orderBaseTotals_([r1,k1,k2],T0,ctx,acc(r1,k1,k2));
  eq(r.revenue,Math.round(1930*25.3),'1.930 USD × 25,30 = 48.829');eq(r.cost,Math.round(500*25.4)+40000000,'500 USD × 25,40 = 12.700 + 40.000.000');
  eq(r.margin,r.revenue-r.cost);eq(r.marginPct,Math.round(r.margin*10000/r.revenue)/100);eq(r.missing,0);eq(r.currency,'VND');
  eq(r.byCurrency.USD.foreign,243000);eq(r.byCurrency.USD.avgRate,Math.round((48829+12700)/(2430)*100)/100,'tỷ giá bình quân USD');ok(r.margin<0,'lỗ nếu doanh thu USD nhỏ hơn chi phí VND');
});
suite('2. Khoản chưa lập hóa đơn / đang lập / đã hủy / thu hộ-chi hộ KHÔNG vào lãi',()=>{
  const c=env(),ok1=A('a','REVENUE','USD',100000),open=A('b','REVENUE','USD',999999,{status:'OPEN'}),inv=A('c','COST','USD',999999,{status:'INVOICING'}),can=A('d','COST','USD',999999,{status:'CANCELLED'}),pt=A('e','REVENUE','USD',999999,{isPassThrough:1});
  const ctx=cx({a:{D1:doc('D1',250000)}});const r=c.orderBaseTotals_([ok1,open,inv,can,pt],T0,ctx,acc(ok1,open,inv,can,pt));
  eq(r.revenue,25000);eq(r.cost,0);eq(r.missing,0,'khoản chưa ghi nhận không bị đếm là thiếu tỷ giá');
});
suite('3. Điều chỉnh sau ghi nhận quy đổi theo tỷ giá của CHÍNH chứng từ điều chỉnh; điều chỉnh sau ngày chốt bị bỏ',()=>{
  const c=env(),stored=A('a','REVENUE','USD',100000),projected=Object.assign({},stored,{netMinor:100000+20000-5000});
  const ctx=cx({a:{D1:doc('D1',250000)}},{a:[{eff:'2026-10-10',net:20000,rate:260000},{eff:'2026-10-15',net:-5000,rate:240000},{eff:'2026-12-01',net:7000,rate:300000}]});
  const r=c.orderBaseTotals_([projected],T0,ctx,{a:stored});eq(r.revenue,25000+5200-1200,'1000×25 + 200×26 − 50×24');
});
suite('4. Đã ghi nhận nhưng chứng từ chưa có tỷ giá → không tính, đếm missing; khoản khác vẫn tính',()=>{
  const c=env(),good=A('g','REVENUE','USD',10000),bad=A('b','REVENUE','USD',99999),adjBad=A('x','COST','USD',1000),ctx=cx({g:{D1:doc('D1',250000)},b:{D2:doc('D2',0)},x:{D3:doc('D3',250000)}},{x:[{eff:'2026-10-05',net:500,rate:0}]});
  const r=c.orderBaseTotals_([good,bad,Object.assign({},adjBad,{netMinor:1500})],T0,ctx,acc(good,bad,adjBad));eq(r.revenue,2500);eq(r.cost,0);eq(r.missing,2,'chứng từ gốc thiếu tỷ giá và điều chỉnh thiếu tỷ giá');
});
suite('5. Phần chia nhiều đơn: chia theo tỷ lệ phần của khoản gốc (tổng các phần = tổng quy đổi của khoản gốc)',()=>{
  const c=env(),parent=A('p','COST','USD',100000,{docId:'D1'}),s1=A('s1','COST','USD',60000,{sharedFrom:'p'}),s2=A('s2','COST','USD',40000,{sharedFrom:'p'}),ctx=cx({p:{D1:doc('D1',253333)}});
  const a=c.orderBaseTotals_([s1],T0,ctx,acc(parent)),b=c.orderBaseTotals_([s2],T0,ctx,acc(parent)),whole=c.orderBaseTotals_([parent],T0,ctx,acc(parent));
  ok(Math.abs(a.cost+b.cost-whole.cost)<=1,'tổng hai phần lệch tối đa 1 đồng do làm tròn: '+(a.cost+b.cost)+' vs '+whole.cost);eq(whole.cost,25333);
});
suite('6. Hóa đơn đã bị đảo (REVERSAL có hiệu lực) hoặc chưa tới ngày ghi nhận: lấy chứng từ còn hiệu lực, không dùng chứng từ đã đảo',()=>{
  const c=env(),a=A('a','REVENUE','USD',100000),ctx=cx({a:{DOLD:doc('DOLD',200000),DNEW:doc('DNEW',250000,{postingDate:'2026-10-20'})}});ctx.revOf.DOLD='2026-10-15';
  const r=c.orderBaseTotals_([a],T0,ctx,acc(a));eq(r.revenue,25000,'dùng tỷ giá của hóa đơn thay thế, không dùng hóa đơn đã đảo');
});
suite('7. Chỉ VND hoặc không có khoản ghi nhận: tổng bằng 0/đúng số VND, không lỗi chia cho 0',()=>{
  const c=env(),v=A('v','REVENUE','VND',5000000),ctx=cx({v:{D1:doc('D1',0)}}),r=c.orderBaseTotals_([v],T0,ctx,acc(v));eq(r.revenue,5000000);eq(r.marginPct,100);
  const e=c.orderBaseTotals_([],T0,cx({}),{});eq([e.revenue,e.cost,e.margin,e.marginPct,e.missing],[0,0,0,null,0]);
});
suite('8. orderGet_ trả baseTotals (dữ liệu mô phỏng 3.000 chứng từ), cùng số liệu từng tiền tệ như trước',()=>{
  const {ctx}=makeEnv(SRCP);seed(ctx,300);const u={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}},ord=ctx.repoValid_('Order')[0];
  const r=ctx.orderGet_(u,{requestId:'x',payload:{id:ord.id}});ok(r.order.baseTotals&&r.order.baseTotals.currency==='VND','có baseTotals');ok(Number.isInteger(r.order.baseTotals.margin));ok(r.order.totals,'totals từng tiền tệ vẫn còn');
});
// ---- R09 và orderTotals theo nguyên tắc "có hóa đơn mới ghi nhận" + phần quy đổi VND (thế giới giả, repo trong bộ nhớ)
const vm=require('vm'),fs=require('fs');
function world(){
  const ctx=vm.createContext({console,Utilities:{getUuid:()=>'u',formatDate:()=>'2026-10-27'},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
  vm.runInContext(fs.readFileSync(SRCP,'utf8'),ctx);
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const sv=JSON.stringify([{code:'FWD',hsdvNo:'N1'}]);
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c1b','CURRENCY','USD',{decimals:2}),cat('g','BUSINESS_GROUP','G1'),cat('s1','SERVICE_CODE','FWD',{department:'Forwarding'}),cat('f','FEE_TYPE','F')],
    Partner:[{id:'p1',shortName:'LHT',legalName:'LHT',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:''}],
    Order:[{id:'o1',orderNo:'DH-1',poNo:'PO1',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-01-01',status:'OPEN',servicesJson:sv,serviceCode:'FWD',hsdvNo:'N1',version:1},
           {id:'o2',orderNo:'DH-2',poNo:'PO2',customerPartnerId:'p1',businessGroupCode:'G1',currency:'VND',orderDate:'2026-01-01',status:'OPEN',servicesJson:sv,serviceCode:'FWD',hsdvNo:'N2',version:1}],
    Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).slice();ctx.repoCommitted_=ctx.repoValid_;
  return {ctx,T};
}
const ac=(id,o,kind,cur,net,status,docId,x)=>Object.assign({id,orderId:o,kind,partnerId:'p1',accrualDate:'2026-10-05',feeTypeCode:'F',description:'x',netMinor:net,vatMode:'NONE',vatMinor:0,grossMinor:net,isPassThrough:0,currency:cur,status,docId:docId||'',debtLineId:'',serviceCode:'FWD',version:1},x||{});
const full={id:'a',email:'a@x.vn',role:'APPROVER',scope:{allPartners:true}};
const ddoc=(id,cur,rate)=>({id,docNo:id.toUpperCase(),direction:'AR',docType:'INVOICE',partnerId:'p1',currency:cur,businessGroupCode:'G1',docDate:'2026-10-01',postingDate:'2026-10-01',status:'POSTED',totalGrossMinor:1,fxRateE4:rate,version:1});
suite('9. orderTotals: chỉ khoản đã lập hóa đơn vào doanh thu/chi phí/lãi; chưa/đang lập hóa đơn chỉ hiện ở cột HĐ',()=>{
  const {ctx}=world(),L=[ac('a','o1','REVENUE','USD',193000,'INVOICED'),ac('b','o1','COST','USD',50000,'INVOICED'),ac('c','o1','REVENUE','USD',777700,'OPEN'),ac('d','o1','COST','USD',111100,'INVOICING'),ac('e','o1','COST','VND',40000000,'INVOICED')];
  const t=ctx.orderTotals(L);eq([t.USD.revenueNet,t.USD.costNet,t.USD.margin,t.USD.marginPct],[193000,50000,143000,74.09]);eq([t.USD.uninvoicedRevenue,t.USD.invoicingCost],[777700,111100]);eq([t.VND.revenueNet,t.VND.costNet,t.VND.margin],[0,40000000,-40000000]);
});
suite('10. R09: cột doanh thu/chi phí/lãi chỉ gồm khoản đã ghi nhận; có phần "Quy đổi VND" theo tỷ giá chứng từ, không tính khoản chưa lập hóa đơn',()=>{
  const {ctx,T}=world();T.DebtDoc.push(ddoc('d1','USD',253000),ddoc('d2','USD',254000));
  T.Accrual.push(ac('a','o1','REVENUE','USD',193000,'INVOICED','d1'),ac('b','o1','COST','USD',50000,'INVOICED','d2'),ac('c','o1','REVENUE','USD',777700,'OPEN'),ac('e','o1','COST','VND',40000000,'INVOICED','d3'));
  const rep=ctx.rep09_(full,'R09',{asOf:'2026-10-27'}),rows=rep.rows;
  const usd=rows.find(r=>r.t==='total'&&r.currency==='USD').cells,vnd=rows.find(r=>r.t==='total'&&r.currency==='VND').cells;
  eq([usd.rev,usd.cost,usd.margin,usd.unRev],[193000,50000,143000,777700],'USD: khoản OPEN không vào doanh thu');eq([vnd.rev,vnd.cost,vnd.margin],[0,40000000,-40000000]);
  const g=rows.findIndex(r=>r.t==='group'&&/Quy đổi VND/.test(r.cells.stt));ok(g>0,'có nhóm quy đổi VND (nhãn ở cột đầu để giao diện hiện được)');ok(rows.filter(r=>r.t==='group').every(r=>r.cells.stt),'mọi dòng nhóm có nhãn ở cột đầu (stt)');
  const tot=rows.slice(g).find(r=>r.t==='total').cells;eq(tot.order,'TỔNG QUY ĐỔI VND');eq(tot.rev,Math.round(1930*25.3));eq(tot.cost,Math.round(500*25.4)+40000000);eq(tot.margin,tot.rev-tot.cost);
  const row=rows.slice(g).find(r=>r.t==='data').cells;eq([row.order,row.rev,row.cost],['DH-1',tot.rev,tot.cost],'một dòng cho đơn/mã dịch vụ, gộp mọi tiền tệ');eq(row.state,'Đủ dữ liệu');
  ok(rows.slice(g).every(r=>r.currency==='VND'),'định dạng số theo VND');ok(rep.notes.some(n=>/Quy đổi VND/.test(n)),'có chú thích');
  const only=ctx.rep09_(full,'R09',{asOf:'2026-10-27',currency:'USD'}).rows;ok(!only.some(r=>/Quy đổi VND/.test(r.cells.stt||'')),'lọc một tiền tệ thì không hiện phần quy đổi');
});
suite('11. R09: chỉ VND thì không có phần quy đổi; chứng từ thiếu tỷ giá được báo ở cột tình trạng, khoản khác vẫn tính',()=>{
  const a=world();a.T.Accrual.push(ac('a','o1','REVENUE','VND',1000,'INVOICED','d1'));ok(!a.ctx.rep09_(full,'R09',{asOf:'2026-10-27'}).rows.some(r=>/Quy đổi VND/.test(r.cells.stt||'')),'đơn chỉ VND không có phần quy đổi');
  const b=world();b.T.DebtDoc.push(ddoc('d1','USD',0),ddoc('d2','USD',250000));b.T.Accrual.push(ac('a','o1','REVENUE','USD',100000,'INVOICED','d1'),ac('b','o2','REVENUE','USD',100000,'INVOICED','d2'));
  const rows=b.ctx.rep09_(full,'R09',{asOf:'2026-10-27'}).rows,g=rows.findIndex(r=>r.t==='group'&&/Quy đổi VND/.test(r.cells.stt)),tot=rows.slice(g).find(r=>r.t==='total').cells;
  eq(tot.rev,25000,'chỉ chứng từ có tỷ giá được tính');ok(/Thiếu tỷ giá: 1/.test(tot.state),tot.state);ok(rows.slice(g).some(r=>r.t==='data'&&r.cells.order==='DH-1'&&/Thiếu tỷ giá/.test(r.cells.state)),'dòng của đơn thiếu tỷ giá được đánh dấu');
});
suite('12. R09: lọc đơn hàng cụ thể (orderId) và tìm theo số đơn/PO (q); lọc theo đơn thì bỏ dòng "Chi phí chung"; tiêu đề ghi đơn đang lọc',()=>{
  const {ctx,T}=world();T.DebtDoc.push(ddoc('d1','USD',253000),ddoc('d2','USD',250000));T.Order[1].poNo='XYZ-77';
  T.Accrual.push(ac('a','o1','REVENUE','USD',193000,'INVOICED','d1'),ac('b','o1','COST','USD',50000,'INVOICED','d1'),ac('c','o2','REVENUE','USD',100000,'INVOICED','d2'),ac('g','','COST','VND',9000,'INVOICED','d3'));
  const run=p=>ctx.rep09_(full,'R09',Object.assign({asOf:'2026-10-27'},p)),names=r=>[...r.rows.filter(x=>x.t==='data'&&x.currency==='USD').map(x=>x.cells.order)]; // [...] đưa về mảng của realm này (dữ liệu từ vm khác prototype)
  eq(names(run({})).sort(),['DH-1','DH-2'],'không lọc: cả hai đơn');ok(run({}).rows.some(x=>x.t==='data'&&x.cells.order==='Chi phí chung'),'không lọc: có chi phí chung');
  const r1=run({orderId:'o1'});eq(names(r1),['DH-1'],'lọc đơn o1');ok(!r1.rows.some(x=>x.cells.order==='Chi phí chung'),'lọc theo đơn: bỏ chi phí chung');eq(r1.rows.find(x=>x.t==='total'&&x.currency==='USD').cells.margin,143000);eq(r1.meta.order,'DH-1 · PO PO1');
  const r2=run({orderId:'o2'});eq(names(r2),['DH-2']);eq(r2.rows.find(x=>x.t==='total'&&x.currency==='USD').cells.rev,100000);
  const q1=run({q:'xyz'});eq(names(q1),['DH-2'],'tìm theo PO, không phân biệt hoa thường');eq(q1.meta.order,'số đơn/PO chứa "xyz"');eq(names(run({q:'dh-1'})),['DH-1'],'tìm theo số đơn');
  eq(names(run({orderId:'o1',q:'xyz'})),[],'hai điều kiện cùng áp dụng (và)');const none=run({orderId:'khong-co'});eq(none.rows.filter(x=>x.t==='data').length,0,'đơn không tồn tại/ngoài phạm vi: rỗng');ok(none.notes.some(n=>/Chưa có đơn hàng/.test(n)));eq(none.meta.order,'(không có trong phạm vi xem)');
  const tot=run({orderId:'o1'}).rows.filter(x=>x.t==='total'&&/QUY ĐỔI/.test(x.cells.order||''))[0];ok(!tot||tot.cells.rev===Math.round(1930*25.3),'phần quy đổi chỉ gồm đơn đã lọc');
});
console.log('Tổng kiểm tra:',steps);
