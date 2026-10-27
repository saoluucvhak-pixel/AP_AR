// Chẩn đoán tải xuống. Mục tiêu: phân biệt lỗi ỨNG DỤNG, lỗi NỘI DUNG tệp, và môi trường/trình duyệt chặn — KHÔNG tắt bảo vệ trình duyệt, KHÔNG bỏ bước tải.
// Nguyên tắc: (1) đối chứng chạy trong CHÍNH BrowserContext của trang ứng dụng (cùng cấu hình/quyền/thư mục đích); context độc lập chỉ là đối chứng PHỤ;
// (2) tệp .xlsx dùng làm đối chứng phải là workbook HỢP LỆ (dựng ở đây, kiểm bằng ZIP CRC + openpyxl độc lập, ghi SHA256/kích thước);
// (3) lỗi truy cập máy chủ loopback (ví dụ net::ERR_NETWORK_ACCESS_DENIED) KHÔNG suy ra ứng dụng lỗi: phép đo đó ghi BLOCKED/UNKNOWN; context và máy chủ luôn được dọn trong finally.
const fs=require('fs'),path=require('path'),os=require('os'),http=require('http'),zlib=require('zlib'),crypto=require('crypto'),{spawnSync}=require('child_process');
const ACCEPT=!process.env.KATY_SIMULATE_NO_DOWNLOADS;
function envInfo(browser,playwrightVersion,tmp){
  let writable=false,err='';try{const f=path.join(tmp,'.w');fs.writeFileSync(f,'x');fs.unlinkSync(f);writable=true}catch(e){err=e.message}
  return {node:process.version,playwright:playwrightVersion,browser:browser.version(),platform:os.platform()+' '+os.release()+' '+os.arch(),tmp,tmpWritable:writable,tmpError:err,acceptDownloads:ACCEPT,separator:path.sep}
}
// ---- Dựng workbook XLSX hợp lệ tối thiểu (ZIP không nén, có CRC đúng) để làm đối chứng nội dung ----
const CRC=(function(){const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
function zipStore(files){
  const parts=[],central=[];let off=0;
  for(const f of files){const name=Buffer.from(f.name,'utf8'),data=Buffer.from(f.data,'utf8'),crc=crc32(data),lh=Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0x21,12);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(data.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(name.length,26);lh.writeUInt16LE(0,28);
    parts.push(lh,name,data);
    const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(0,10);ch.writeUInt16LE(0,12);ch.writeUInt16LE(0x21,14);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(data.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(off,42);
    central.push(ch,name);off+=30+name.length+data.length}
  const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(off,16);
  return Buffer.concat(parts.concat([cd,end]));
}
function makeValidXlsx(){
  const x='<'+'?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return zipStore([
    {name:'[Content_Types].xml',data:x+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'},
    {name:'_rels/.rels',data:x+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
    {name:'xl/workbook.xml',data:x+'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Doi chung" sheetId="1" r:id="rId1"/></sheets></workbook>'},
    {name:'xl/_rels/workbook.xml.rels',data:x+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'},
    {name:'xl/worksheets/sheet1.xml',data:x+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Tiêu đề</t></is></c><c r="B1" t="inlineStr"><is><t>Số</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>dòng 1</t></is></c><c r="B2"><v>12345</v></c></row></sheetData></worksheet>'}]);
}
// ---- Xác minh độc lập: ZIP (CRC từng mục) bằng Node + openpyxl (nếu có Python) ----
function verifyZip(buf){
  const r={zipOk:false,entries:0,error:''};try{
    let end=-1;for(let i=buf.length-22;i>=Math.max(0,buf.length-66000);i--)if(buf.readUInt32LE(i)===0x06054b50){end=i;break}
    if(end<0)throw new Error('không thấy bản ghi kết thúc ZIP');
    const n=buf.readUInt16LE(end+10);let p=buf.readUInt32LE(end+16);
    for(let i=0;i<n;i++){if(buf.readUInt32LE(p)!==0x02014b50)throw new Error('thư mục trung tâm hỏng');
      const method=buf.readUInt16LE(p+10),crc=buf.readUInt32LE(p+16),csize=buf.readUInt32LE(p+20),usize=buf.readUInt32LE(p+24),nl=buf.readUInt16LE(p+28),el=buf.readUInt16LE(p+30),cl=buf.readUInt16LE(p+32),lo=buf.readUInt32LE(p+42),name=buf.slice(p+46,p+46+nl).toString('utf8');
      const ln=buf.readUInt16LE(lo+26),le=buf.readUInt16LE(lo+28),ds=lo+30+ln+le,raw=buf.slice(ds,ds+csize),data=method===0?raw:method===8?zlib.inflateRawSync(raw):null;
      if(!data)throw new Error('phương pháp nén lạ ở '+name);if(data.length!==usize)throw new Error('kích thước giải nén lệch ở '+name);if(crc32(data)!==crc)throw new Error('CRC sai ở '+name);
      p+=46+nl+el+cl}
    r.zipOk=true;r.entries=n}catch(e){r.error=e.message}
  return r;
}
function pythonCandidates(){return process.env.PYTHON?[process.env.PYTHON]:['python3','python','py']}
function verifyOpenpyxl(file){
  const script='import sys,json,openpyxl\nwb=openpyxl.load_workbook(sys.argv[1],data_only=True)\nprint(json.dumps({"sheets":wb.sheetnames,"dims":[ws.dimensions for ws in wb.worksheets]}))\n';let last='';
  for(const exe of pythonCandidates()){const r=spawnSync(exe,['-I','-c',script,file],{encoding:'utf8'});
    if(r.error){last=exe+': '+r.error.message;continue}
    if(r.status===0){try{return {status:'OK',info:JSON.parse(r.stdout.trim().split('\n').pop())}}catch(e){return {status:'FAIL',detail:'đầu ra lạ: '+r.stdout.slice(0,120)}}}
    last=exe+' → mã thoát '+r.status+': '+String(r.stderr||'').split('\n').filter(Boolean).slice(-1)[0];if(/No module named/.test(r.stderr||''))return {status:'BLOCKED',detail:'thiếu openpyxl ('+last+')'};
    return {status:'FAIL',detail:last}}
  return {status:'BLOCKED',detail:'không chạy được Python ('+last+')'};
}
function verifyWorkbook(file){
  const buf=fs.readFileSync(file),z=verifyZip(buf),sha=crypto.createHash('sha256').update(buf).digest('hex'),o=verifyOpenpyxl(file);
  return {file,size:buf.length,sha256:sha,magic:buf.slice(0,2).toString()==='PK',zipOk:z.zipOk,entries:z.entries,zipError:z.error,openpyxl:o.status,openpyxlInfo:o.info||null,openpyxlDetail:o.detail||'',
    valid:z.zipOk&&buf.slice(0,2).toString()==='PK'&&(o.status==='OK'||o.status==='BLOCKED')}; // BLOCKED openpyxl: dựa vào ZIP CRC, ghi rõ chưa xác minh bằng openpyxl
}
async function tryDownload(page,trigger,dest,label,expectBytes){
  const r={label,ok:false,failure:null,file:dest,size:0,suggested:'',url:'',error:'',sha256:'',sha256Expected:expectBytes?crypto.createHash('sha256').update(expectBytes).digest('hex'):'',workbook:null};
  try{
    const [dl]=await Promise.all([page.waitForEvent('download',{timeout:15000}),trigger()]);
    r.suggested=dl.suggestedFilename();r.url=String(dl.url()).slice(0,60);
    try{await dl.saveAs(dest);r.size=fs.statSync(dest).size;r.sha256=crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex')}catch(e){r.error=e.message}
    r.failure=await dl.failure();r.ok=!r.error&&r.failure===null&&r.size>0&&(!expectBytes||r.sha256===r.sha256Expected);
    if(r.ok&&/\.xlsx$/i.test(dest)){r.workbook=verifyWorkbook(dest);if(!r.workbook.valid){r.ok=false;r.error='tệp tải về không phải workbook hợp lệ: '+(r.workbook.zipError||r.workbook.openpyxlDetail)}}
  }catch(e){r.error=e.message}
  return r;
}
// Phép đo bị chặn truy cập (loopback/mạng) không phải lỗi ứng dụng.
function isNetworkBlocked(e){return /ERR_NETWORK_ACCESS_DENIED|ERR_CONNECTION_REFUSED|ERR_BLOCKED_BY|ERR_ACCESS_DENIED|ERR_PROXY/i.test(String(e&&e.message||e))}
const CLICK_BLOB="var u=URL.createObjectURL(new Blob([Uint8Array.from(atob(window.__X),function(c){return c.charCodeAt(0)})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));var a=document.createElement('a');a.href=u;a.download='doi_chung_blob.xlsx';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},60000);";
// Đối chứng A–E. `ctx` = BrowserContext cần dùng (ƯU TIÊN: chính context của trang ứng dụng). `label` ghi rõ context nào.
async function controls(ctx,tmp,tag){
  const xlsx=makeValidXlsx(),out=[],T=tag||'';
  const srv=http.createServer((req,res)=>{
    if(req.url==='/plain.xlsx'){res.writeHead(200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="plain.xlsx"'});return res.end(xlsx)}
    if(req.url==='/plain.csv'){res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="plain.csv"'});return res.end('a,b\n1,2\n')}
    if(req.url==='/page'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end('<a id="a" href="/plain.xlsx" download>tải</a><a id="c" href="/plain.csv" download>csv</a><button id="b">blob</button><script>var X="'+xlsx.toString('base64')+'";window.__X=X;b.onclick=function(){'+CLICK_BLOB+'}<\/script>')}
    res.writeHead(404);res.end();
  });
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));const port=srv.address().port;let pg=null,p2=null,p3=null;
  const blocked=(label,e)=>({label:T+label,ok:false,blocked:true,failure:null,size:0,suggested:'',url:'',error:String(e.message).split('\n')[0]});
  try{
    pg=await ctx.newPage();
    if(process.env.KATY_SIMULATE_LOOPBACK_BLOCK)await pg.route('http://127.0.0.1:*/**',r=>r.abort('accessdenied')); // chỉ để kiểm tra chính bộ chẩn đoán
    let loop=true;try{await pg.goto('http://127.0.0.1:'+port+'/page')}catch(e){if(isNetworkBlocked(e)){loop=false;out.push(blocked('A–B,D. máy chủ loopback http://127.0.0.1 (CHẶN TRUY CẬP — phép đo này BLOCKED/không xác định)',e))}else throw e}
    if(loop){
      out.push(await tryDownload(pg,()=>pg.click('#c'),path.join(tmp,'ctl_plain.csv'),T+'A1. CSV thường qua HTTP (Content-Disposition)'));
      out.push(await tryDownload(pg,()=>pg.click('#a'),path.join(tmp,'ctl_plain.xlsx'),T+'A2. XLSX HỢP LỆ qua HTTP (Content-Disposition)',xlsx));
      out.push(await tryDownload(pg,()=>pg.click('#b'),path.join(tmp,'ctl_blob_http.xlsx'),T+'D. Blob XLSX hợp lệ (cùng byte) trong trang HTTP',xlsx));
    }
    p2=await ctx.newPage();await p2.setContent('<button id="b">blob</button><script>b.onclick=function(){var u=URL.createObjectURL(new Blob(["hello blob"],{type:"text/plain"}));var a=document.createElement("a");a.href=u;a.download="x.txt";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},60000)}<\/script>');
    out.push(await tryDownload(p2,()=>p2.click('#b'),path.join(tmp,'ctl_blob_setcontent.txt'),T+'C. Blob văn bản nhỏ trong trang setContent (blob:null)'));
    p3=await ctx.newPage();await p3.setContent('<button id="bx">x</button>');await p3.evaluate(a=>{window.__X=a.x;document.getElementById('bx').onclick=new Function(a.c)},{x:xlsx.toString('base64'),c:CLICK_BLOB});
    out.push(await tryDownload(p3,()=>p3.click('#bx'),path.join(tmp,'ctl_blob_xlsx_setcontent.xlsx'),T+'E. Blob XLSX hợp lệ trong trang setContent',xlsx));
  }finally{for(const p of [pg,p2,p3])if(p)try{await p.close()}catch(e){}await new Promise(r=>srv.close(r))}
  return out;
}
// F: chính byte workbook do ứng dụng sinh ra. Trước hết KIỂM workbook bằng thư viện độc lập; chỉ khi hợp lệ mới phát lại để so sánh đường tải.
async function controlAppBytes(ctx,tmp,b64,mime,name,tag){
  const bytes=Buffer.from(b64,'base64'),file=path.join(tmp,'ctl_app_src_'+name);fs.writeFileSync(file,bytes);
  const wb=verifyWorkbook(file),res={label:(tag||'')+'F. Byte workbook của ứng dụng phát lại qua Blob trong trang trống',ok:false,failure:null,size:bytes.length,suggested:'',url:'',error:'',workbook:wb};
  if(!wb.valid){res.error='workbook do ứng dụng sinh KHÔNG hợp lệ: '+(wb.zipError||wb.openpyxlDetail);res.appBytesInvalid=true;return res}
  let pg=null;try{pg=await ctx.newPage();await pg.setContent('<button id="b">x</button>');
    await pg.evaluate(a=>{window.__X=a.x;document.getElementById('b').onclick=new Function(a.c.replace('doi_chung_blob.xlsx',a.n))},{x:b64,c:CLICK_BLOB,n:name});
    return Object.assign(await tryDownload(pg,()=>pg.click('#b'),path.join(tmp,'ctl_app_bytes_'+name),res.label,bytes),{workbook:wb});
  }finally{if(pg)try{await pg.close()}catch(e){}}
}
// Phân loại: PASS | APP | APP_BYTES_INVALID | ENV | ENV_CONTENT | UNKNOWN (phép đo đối chứng bị chặn truy cập → BLOCKED, không kết luận)
function classify(ctl,appResult){
  const f=ctl.find(x=>/F\./.test(x.label)),base=ctl.filter(x=>!/F\./.test(x.label));
  if(f&&f.appBytesInvalid)return 'APP_BYTES_INVALID';
  if(base.some(x=>x.blocked))return appResult&&appResult.ok?'PASS':'UNKNOWN';
  if(base.some(x=>!x.ok))return 'ENV';
  if(f&&!f.ok)return 'ENV_CONTENT';
  if(appResult&&appResult.ok)return 'PASS';
  return 'APP';
}
const VERDICT={PASS:'PASS',APP:'FAILED (lỗi ứng dụng/đường tải của ứng dụng)',APP_BYTES_INVALID:'FAILED (workbook do ứng dụng sinh không hợp lệ)',ENV:'BLOCKED (môi trường chặn tải cả đối chứng tối thiểu)',ENV_CONTENT:'BLOCKED (tải được đối chứng nhưng chặn theo nội dung workbook hợp lệ)',UNKNOWN:'BLOCKED (đối chứng không đo được: bị chặn truy cập, chưa kết luận)'};
function table(rows){return rows.map(r=>'   - '+r.label+': '+(r.blocked?'BLOCKED':r.ok?'OK':'THẤT BẠI')+' | failure='+r.failure+' | size='+r.size+(r.sha256?' | sha256='+r.sha256.slice(0,12)+'…':'')+(r.workbook?' | xlsx: zip='+r.workbook.zipOk+' mục='+r.workbook.entries+' openpyxl='+r.workbook.openpyxl:'')+' | suggested='+r.suggested+(r.error?' | lỗi='+r.error.split('\n')[0]:'')).join('\n')}
module.exports={envInfo,controls,controlAppBytes,controlAppBytes:controlAppBytes,classify,table,tryDownload,makeValidXlsx,verifyWorkbook,verifyZip,isNetworkBlocked,VERDICT};
