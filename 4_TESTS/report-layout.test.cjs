// Mẫu báo cáo PDF/Excel: bố cục (reportLayout_), dự báo dòng tiền R12, áp bố cục lên Sheets giả. Dữ liệu giả; KHÔNG kiểm được hiển thị thật của Google Sheets/PDF.
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const SRC=fs.readFileSync(process.env.BACKEND_SRC||path.join(__dirname,'..','1_BACKEND','Backend.gs'),'utf8');
const J=x=>JSON.stringify(x);
function world(today){
  const ctx=vm.createContext({console,Logger:{log(){}},Utilities:{getUuid:()=>'u'+Math.random(),formatDate:(d)=>d&&d.toISOString?d.toISOString().slice(0,10):today},LockService:{},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})}});
  vm.runInContext(SRC,ctx);ctx.todayVn_=()=>today;
  const cat=(id,type,c,a)=>({id,catalogType:type,code:c,name:c,attrsJson:JSON.stringify(a||{}),active:1,sortOrder:1,version:1});
  const T={Catalog:[cat('c1','CURRENCY','VND',{decimals:0}),cat('c1b','CURRENCY','USD',{decimals:2}),cat('g','BUSINESS_GROUP','G1'),cat('f','FEE_TYPE','F'),cat('fp','FEE_TYPE','PASS_THROUGH'),cat('s1','SERVICE_CODE','FWD'),cat('q','CASH_ACCOUNT','Q1',{currency:'VND',type:'BANK'})],
   Partner:[{id:'p1',shortName:'ABC',legalName:'ABC',isCustomer:1,isSupplier:1,status:'ACTIVE',scopeTags:'',taxCode:'',version:1}],
   Order:[],Accrual:[],AccrualSplit:[],DebtDoc:[],DebtLine:[],Allocation:[],Payment:[],Period:[],OpeningBalance:[],ImportBatch:[],ImportRow:[],ServiceFile:[],ShipmentRef:[],Followup:[],
   Config:[{id:'ledgerStartDate',value:'2026-01-01'}]};
  ctx.repoValid_=t=>(T[t]||[]).filter(x=>x.isDeleted!==1);ctx.repoCommitted_=t=>(T[t]||[]).slice();ctx.repoFind_=(t,id)=>(T[t]||[]).find(x=>x.id===id)||null;
  let n=0;
  ctx.runTx_=(user,meta,build)=>{const ins=[],upd=[];const tx={user,now:'T',find:(t,id)=>(T[t]||[]).find(x=>x.id===id)||null,rows:t=>(T[t]||[]).slice(),
    insert:(t,o)=>{const r=Object.assign({id:t+'_'+(++n),version:1,createdBy:user.id,createdAt:today+'T03:00:00.000Z'},o);ins.push([t,r]);return r},
    update:(t,id,p)=>{const b=(T[t]||[]).find(x=>x.id===id);if(!b)throw Object.assign(new Error('NF'),{code:'NOT_FOUND'});upd.push([t,id,p]);return Object.assign({},b,p)},nextSeq:k=>++n};
    const built=build(tx);ins.forEach(([t,r])=>(T[t]=T[t]||[]).push(r));upd.forEach(([t,id,p])=>Object.assign(T[t].find(x=>x.id===id),p,{updatedAt:today+'T03:00:00.000Z'}));return built&&built.result};
  return {ctx,T};
}


const full={id:'ap',email:'ap@x.vn',displayName:'Kế toán trưởng',role:'APPROVER',scope:{allPartners:true}};
let steps=0;const ok=(c,m)=>{steps++;assert.ok(c,m)},eq=(a,b,m)=>{steps++;assert.strictEqual(J(a),J(b),m)};
function suite(name,fn){try{fn();console.log('✔',name)}catch(e){console.log('✖',name,'-',e.message.split('\n').slice(0,6).join(' | '));process.exitCode=1}}
const mkdoc=(id,o,gross)=>Object.assign({id,docNo:id.toUpperCase(),direction:'AR',docType:'INVOICE',partnerId:'p1',currency:'VND',businessGroupCode:'G1',docDate:'2026-09-10',postingDate:'2026-09-10',status:'POSTED',totalGrossMinor:gross,isOpening:0,dueDate:'',expectedPayDate:'',createdAt:'2026-09-10T03:00:00.000Z',createdBy:'c',version:1,warningsJson:''},o||{});
const mkline=(id,doc,gross)=>({id,docId:doc,lineNo:1,feeTypeCode:'F',description:'x',netMinor:gross,grossMinor:gross,vatMinor:0,vatMode:'NONE'});
function seed(w){
  w.T.Catalog.push({id:'cx',catalogType:'CURRENCY',code:'USD',name:'USD',attrsJson:'{"decimals":2}',active:1,sortOrder:2,version:1});
  const D=[mkdoc('a1',{dueDate:'2026-10-20'},1000),mkdoc('a2',{dueDate:'2026-10-30'},2000),mkdoc('a3',{dueDate:'2026-12-31'},4000),mkdoc('a4',{},800),mkdoc('p1',{direction:'AP',dueDate:'2026-10-27'},1500),mkdoc('p2',{direction:'AP',dueDate:'2026-11-20',expectedPayDate:'2026-10-26'},500),mkdoc('u1',{currency:'USD',dueDate:'2026-11-10'},25000)];
  D.forEach(d=>{w.T.DebtDoc.push(d);w.T.DebtLine.push(mkline('l_'+d.id,d.id,d.totalGrossMinor))});
}
const rowOf=(rep,cur,prefix)=>rep.rows.find(r=>r.currency===cur&&String(r.cells.bucket).indexOf(prefix)===0);
suite('1. R12 dự báo dòng tiền: nhóm thời hạn, lũy kế, chưa xác định hạn, ngày dự kiến ưu tiên, từng tiền tệ',()=>{
  const w=world('2026-10-25');seed(w);w.ctx.repoReadAll_=()=>[];
  const rep=w.ctx.rep12_(full,'R12',{asOf:'2026-10-25'});
  let r=rowOf(rep,'VND','Quá hạn');eq([r.cells.ar,r.cells.ap,r.cells.net,r.cells.cum],[1000,0,1000,1000],'a1 hạn 20/10 đã quá hạn');
  r=rowOf(rep,'VND','Trong 7 ngày');eq([r.cells.ar,r.cells.ap,r.cells.net,r.cells.cum,r.cells.cnt],[2000,2000,0,1000,3],'a2 hạn 30/10; p1 hạn 27/10; p2 dùng NGÀY DỰ KIẾN 26/10 thay cho hạn 20/11');
  eq(rowOf(rep,'VND','15 – 30'),undefined,'p2 không còn rơi vào nhóm theo hạn');
  r=rowOf(rep,'VND','61 – 90');eq([r.cells.ar,r.cells.cum],[4000,5000]);
  r=rowOf(rep,'VND','TỔNG CÓ HẠN');eq([r.cells.ar,r.cells.ap,r.cells.net],[7000,2000,5000]);eq(r.t,'total');
  r=rowOf(rep,'VND','Chưa xác định hạn');eq([r.cells.ar,r.cells.cum],[800,null],'chưa xác định hạn: có số, KHÔNG nằm trong lũy kế');
  r=rowOf(rep,'USD','15 – 30');eq([r.cells.ar,r.cells.net],[25000,25000],'USD tách riêng, không cộng với VND');
  eq(rep.rows.filter(x=>x.currency==='USD'&&x.t==='data').length,1);
  ok(rep.notes.some(n=>/KHÔNG tính vào lũy kế/.test(n)),'ghi chú nói rõ chưa xác định hạn');
  const only=w.ctx.rep12_(full,'R12',{asOf:'2026-10-25',currency:'USD'});ok(only.rows.every(x=>x.currency==='USD'),'lọc theo tiền tệ');
  const past=w.ctx.rep12_(full,'R12',{asOf:'2026-11-05'});eq(rowOf(past,'VND','Quá hạn').cells.ar,3000,'ngày chốt 05/11: a1 và a2 đều quá hạn');
});
suite('1b. R12: tiền chưa phân bổ được trừ riêng; chia theo tuần; đầu vào sai bị từ chối',()=>{
  const w=world('2026-10-25');seed(w);w.ctx.repoReadAll_=()=>[];
  w.T.Payment.push({id:'in1',payNo:'PH1',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:3000,effectiveDate:'2026-10-20',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1},{id:'out1',payNo:'PC1',direction:'OUT',partnerId:'p1',currency:'VND',amountMinor:500,effectiveDate:'2026-10-21',method:'BANK',cashAccountCode:'Q1',status:'POSTED',version:1},{id:'dr',payNo:'',direction:'IN',partnerId:'p1',currency:'VND',amountMinor:999,effectiveDate:'2026-10-21',method:'BANK',cashAccountCode:'Q1',status:'DRAFT',version:1});
  const rep=w.ctx.rep12_(full,'R12',{asOf:'2026-10-25'});
  let r=rowOf(rep,'VND','Trừ: tiền khách');eq([r.cells.ar,r.cells.net],[-3000,-3000]);
  r=rowOf(rep,'VND','Trừ: tiền đã chi');eq([r.cells.ap,r.cells.net],[-500,500]);
  r=rowOf(rep,'VND','DỰ KIẾN SAU BÙ TRỪ');eq([r.cells.ar,r.cells.ap,r.cells.net],[4000,1500,2500],'7.000−3.000 và 2.000−500; phiếu nháp không tính');eq(r.t,'total');
  eq(rowOf(rep,'VND','TỔNG CÓ HẠN').cells.ar,7000,'tổng có hạn không đổi');
  const g=w.ctx.rep12_(full,'R12',{asOf:'2026-10-25',group:'G1'});ok(!rowOf(g,'VND','DỰ KIẾN SAU BÙ TRỪ'),'lọc theo nhóm: không trừ tiền chưa phân bổ');ok(g.notes.some(n=>/không trừ tiền chưa phân bổ/.test(n)));
  const wk=w.ctx.rep12_(full,'R12',{asOf:'2026-10-25',granularity:'WEEK'});
  r=rowOf(wk,'VND','Tuần 1');eq([r.cells.ar,r.cells.ap],[2000,2000],'a2, p1, p2 đều trong 7 ngày');ok(rowOf(wk,'VND','61 – 90'));eq(rowOf(wk,'USD','Tuần 3').cells.ar,25000,'u1 còn 16 ngày → tuần 3');
  let code='OK';try{w.ctx.rep12_(full,'R12',{asOf:'2026-10-25',granularity:'MONTH'})}catch(e){code=e.code}eq(code,'VALIDATION_FAILED');
});
const L=(w,code,params,label)=>{w.ctx.repoReadAll_=()=>[];const rep=w.ctx.reportRun_(full,{payload:{code,params}});return {rep,L:w.ctx.reportLayout_(rep,label||'BẢN NHÁP – CHƯA CHỐT')}};
suite('2. Bố cục: khối tiêu đề, gộp ô, hàng tiêu đề đóng băng, số là số, định dạng theo tiền tệ',()=>{
  const w=world('2026-10-25');seed(w);w.T.Config.push({id:'entity.name',value:'CÔNG TY TNHH GLOBAL MULTI LOGISTICS'},{id:'entity.address',value:'Đà Nẵng'},{id:'entity.taxCode',value:'0400000000'},{id:'entity.phone',value:'0236 000 000'});
  const {rep,L:lay}=L(w,'R12',{asOf:'2026-10-25'});
  const nc=rep.columns.length;
  ok(lay.rows.every(r=>r.cells.length===nc),'mọi hàng đủ '+nc+' ô');
  ok(lay.merges.every(m=>m[1]>=1&&m[1]+m[3]-1<=nc&&m[0]>=1&&m[0]+m[2]-1<=lay.rows.length),'ô gộp nằm trong bảng');
  const kinds=lay.rows.map(r=>r.kind);eq(kinds.slice(0,4),['mast1','mast2','header','band'],'băng tiêu đề gọn: 2 hàng + tiêu đề cột, điều kiện lọc ở thân');
  eq(kinds.filter(k=>k==='header').length,1,'một hàng tiêu đề cột');eq(lay.frozenRows,3,'chỉ đóng băng/lặp 3 hàng (băng tiêu đề + tiêu đề cột)');eq(lay.headerRow,3);
  ok(lay.rows[0].cells.includes('DỰ BÁO DÒNG TIỀN THU – CHI THEO HẠN THANH TOÁN'),'tên báo cáo ở hàng 1');
  ok(lay.rows[0].cells.includes('BẢN NHÁP – CHƯA CHỐT'),'nhãn nháp/chốt nằm trong băng lặp mọi trang');
  ok(/CÔNG TY TNHH GLOBAL MULTI LOGISTICS/.test(lay.rows[0].cells[0])&&/0400000000/.test(lay.rows[1].cells[0])&&/0236 000 000/.test(lay.rows[1].cells[0]),'đủ thông tin doanh nghiệp');
  ok(lay.rows[1].cells.some(c=>/GML-RPT-12 · Ngày chốt 25\/10\/2026/.test(c)),'mã mẫu và ngày chốt ở hàng 2');
  ok(/Ngày chốt: 25\/10\/2026/.test(lay.rows[3].cells[0])&&/Cơ sở ngày/.test(lay.rows[3].cells[0]),'điều kiện báo cáo ở thân (trang đầu): '+lay.rows[3].cells[0]);
  const frozenH=lay.rows.slice(0,3).reduce((a,r)=>a+r.height,0);ok(frozenH<=100,'băng lặp cao '+frozenH+'px (trước đây ~170px)');
  // Bản xuất phải GIỐNG màn hình: màn hình không có khối TÓM TẮT (lặp lại các dòng tổng) nên bản xuất cũng không có
  ok(!kinds.includes('summaryHead')&&!kinds.includes('summary'),'không có khối TÓM TẮT: bản xuất giống màn hình');eq(lay.firstData,lay.headerRow+2,'dữ liệu liền sau băng điều kiện, không chen khối nào');
  const data=lay.rows.filter(r=>r.kind==='data'||r.kind==='total');
  data.forEach(r=>{ok(typeof r.cells[2]==='number'&&typeof r.cells[3]==='number','số tiền là số: '+J(r.cells))});
  const usd=lay.rows.find(r=>r.kind==='data'&&r.cells[1]==='USD');eq(usd.cells[2],250,'USD chia 100');ok(/0\.00/.test(usd.fmts[2]),'USD hiển thị 2 số lẻ: '+usd.fmts[2]);
  const vnd=lay.rows.find(r=>r.kind==='data'&&r.cells[1]==='VND');ok(!/\.00/.test(vnd.fmts[2])&&/\[Red\]/.test(vnd.fmts[2]),'VND không số lẻ, số âm đỏ');
  ok(lay.widths.every(x=>x>=50&&x<=300),'độ rộng cột hợp lý '+lay.widths);
  eq(kinds[kinds.length-1],'footer');ok(/R12/.test(lay.rows[lay.rows.length-1].cells[0]),'chân trang ghi mã báo cáo');
  eq(lay.headerRow,lay.frozenRows);ok(lay.lastData>=lay.firstData);
  const h=lay.help.map(x=>x.join(' ')).join('\n');ok(/Không cộng chéo|không cộng chéo/.test(h)&&/Ngày chốt/.test(h),'trang hướng dẫn đọc');
  // ô văn bản bắt đầu bằng = + - @ bị vô hiệu hóa (chống chèn công thức)
  const w2=world('2026-10-25');seed(w2);w2.T.DebtDoc.find(d=>d.id==='a1').statusNote='=HYPERLINK("x")';
  const l2=L(w2,'R02',{asOf:'2026-10-25'}).L;ok(!l2.rows.some(r=>r.cells.some(c=>typeof c==='string'&&/^=/.test(c))),'không có ô bắt đầu bằng "="');
});
suite('3. Biên bản (R06) có chữ ký hai bên; báo cáo thường có người lập/kiểm tra/duyệt; ngày hiển thị dd/MM/yyyy',()=>{
  const w=world('2026-10-25');seed(w);
  const {L:l6}=L(w,'R06',{asOf:'2026-10-25',partnerId:'p1'},'BẢN CHỐT');
  const sig=l6.rows.find(r=>r.kind==='sig');ok(sig&&/BÊN A/.test(sig.cells.join('|'))&&/BÊN B/.test(sig.cells.join('|')),'chữ ký hai bên: '+J(sig&&sig.cells));
  ok(l6.rows.some(r=>r.kind==='sigSpace'&&r.height>=48),'chừa chỗ ký');
  const {L:l2}=L(w,'R02',{asOf:'2026-10-25'});ok(l2.rows.every(r=>r.kind!=='data'||r.cells.every(c=>!/^\d{4}-\d{2}-\d{2}$/.test(String(c)))),'ngày không còn dạng ISO');
  ok(L(w,'R12',{asOf:'2026-10-25'},'BẢN CHỐT RPT-x').L.rows[0].cells.includes('BẢN CHỐT RPT-x'),'nhãn trạng thái (nháp/chốt) hiển thị');
  const n6=L(w,'R06',{asOf:'2026-10-25',partnerId:'p1'}).L;eq(n6.frozenRows,0,'biên bản (bảng hẹp) không đóng băng');eq(n6.rows.slice(0,5).map(r=>r.kind),['company','contact','title','subtitle','status']);
});
suite('4. Áp bố cục lên Sheets giả: đủ ô, gộp ô, đóng băng, trang hướng dẫn, không ném lỗi',()=>{
  const w=world('2026-10-25');seed(w);w.ctx.repoReadAll_=()=>[];
  const calls=[];let maxCols=26,maxRows=1000;
  const mkRange=(r,c,nr,nc)=>{const o=new Proxy({},{get(_,k){if(k==='_info')return {r,c,nr,nc};return (...a)=>{calls.push([k,r,c,nr,nc,a]);return o}}});return o};
  const mkSheet=n=>({n,getMaxColumns:()=>maxCols,getMaxRows:()=>maxRows,deleteColumns:(a,b)=>{calls.push(['deleteColumns',a,b]);maxCols-=b},insertRowsAfter:()=>{},getRange:(r,c,nr=1,nc=1)=>mkRange(r,c,nr,nc),setName:x=>{calls.push(['setName',x])},setHiddenGridlines:()=>{},setRowHeight:(r,h)=>{calls.push(['setRowHeight',r,h])},setColumnWidth:(c,wd)=>{calls.push(['setColumnWidth',c,wd])},setFrozenRows:n=>{calls.push(['setFrozenRows',n])},setTabColor:()=>{},insertImage:()=>({})});
  const sheets=[mkSheet('Sheet1')];
  w.ctx.SpreadsheetApp={create:()=>({getSheets:()=>sheets,getId:()=>'id',insertSheet:n=>{const s=mkSheet(n);sheets.push(s);return s}}),flush(){},BorderStyle:{SOLID:1,SOLID_MEDIUM:2}};
  const rep=w.ctx.reportRun_(full,{payload:{code:'R12',params:{asOf:'2026-10-25'}}});const built=w.ctx.buildReportSheet_(rep,'BẢN NHÁP');
  const L=built.layout,sv=calls.find(c=>c[0]==='setValues'&&c[3]===L.rows.length);ok(sv,'ghi toàn bộ '+L.rows.length+' hàng một lần');eq(sv[5][0].length,L.rows.length);
  eq(calls.filter(c=>c[0]==='merge').length,L.merges.length,'mọi ô gộp được áp');
  eq(calls.find(c=>c[0]==='setFrozenRows')[1],L.frozenRows);eq(calls.filter(c=>c[0]==='setColumnWidth').length>=L.nc,true);
  ok(calls.some(c=>c[0]==='setName'&&c[1]==='R12'),'tên trang là mã báo cáo');ok(sheets.length===2&&sheets[1].n==='Hướng dẫn đọc','có trang Hướng dẫn đọc');
  ok(calls.some(c=>c[0]==='setBackground'&&c[5][0]==='#1f3a5f'),'tiêu đề bảng nền xanh đậm');
});
suite('2b. Dòng nhóm trong bản xuất: nhãn lấy từ ô đầu tiên có chữ (ở cột nào cũng được), gộp ô suốt chiều ngang, căn giữa như màn hình',()=>{
  const w=world('2026-10-25');seed(w);const rep=w.ctx.reportRun_(full,{payload:{code:'R12',params:{asOf:'2026-10-25'}}});
  const cols=rep.columns,fake=Object.assign({},rep,{rows:[{t:'group',cells:{[cols[cols.length-1].key]:'NHÃN Ở CỘT CUỐI'},currency:''},{t:'group',cells:{[cols[0].key]:'NHÃN Ở CỘT ĐẦU'},currency:''}]});
  const lay=w.ctx.reportLayout_(fake,'BẢN NHÁP'),g=lay.rows.filter(r=>r.kind==='group');eq(g.length,2);g.forEach(r=>{eq(r.cells.filter(x=>x!=='').length,1,'chỉ một ô có chữ');eq(r.cells[0]!=='',true,'chữ nằm ở ô đầu (ô gộp giữ giá trị ô trái trên)')});
  eq(g[0].cells[0],'NHÃN Ở CỘT CUỐI');eq(g[1].cells[0],'NHÃN Ở CỘT ĐẦU');
  g.forEach(r=>{const idx=lay.rows.indexOf(r)+1;ok(lay.merges.some(m=>m[0]===idx&&m[1]===1&&m[2]===1&&m[3]===cols.length),'gộp ô toàn dòng')});
});
console.log('Kiểm thử mẫu báo cáo:',steps,'khẳng định (dữ liệu giả, chưa xuất thật từ Google)');
