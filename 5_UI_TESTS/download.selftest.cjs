// Tự kiểm bộ chẩn đoán tải xuống: bình thường PASS (thoát 0); giả lập môi trường không cho tải hoặc chặn loopback → BLOCKED (thoát 3), không bao giờ PASS giả; lỗi truy cập loopback không bị quy cho ứng dụng.
const {spawnSync}=require('child_process'),path=require('path'),assert=require('assert'),DL=require('./_download_probe.cjs');let steps=0;const eq=(a,b,m)=>{steps++;assert.strictEqual(a,b,m)},ok=(c,m)=>{steps++;assert.ok(c,m)};
function suite(n,f){try{f();console.log('✔',n)}catch(e){console.log('✖',n,'-',e.message.split('\n')[0]);process.exitCode=1}}
const run=env=>spawnSync(process.execPath,[path.join(__dirname,'download.probe.cjs')],{encoding:'utf8',env:Object.assign({},process.env,env||{})});
suite('1. isNetworkBlocked nhận đúng các lỗi truy cập mạng/loopback',()=>{['page.goto: net::ERR_NETWORK_ACCESS_DENIED at http://127.0.0.1:1/page','net::ERR_CONNECTION_REFUSED','net::ERR_ACCESS_DENIED'].forEach(m=>ok(DL.isNetworkBlocked(new Error(m)),m));ok(!DL.isNetworkBlocked(new Error('Timeout 15000ms exceeded')))});
suite('2. Workbook đối chứng hợp lệ (ZIP CRC + openpyxl) và workbook hỏng bị phát hiện',()=>{
  const fs=require('fs'),os=require('os'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'katy-wb-'));try{
    const good=path.join(tmp,'good.xlsx');fs.writeFileSync(good,DL.makeValidXlsx());const g=DL.verifyWorkbook(good);ok(g.valid&&g.zipOk&&g.entries===5,JSON.stringify(g));if(g.openpyxl==='OK')eq(g.openpyxlInfo.sheets[0],'Doi chung');
    const bad=path.join(tmp,'bad.xlsx');fs.writeFileSync(bad,Buffer.concat([Buffer.from('504b0304140000000800','hex'),Buffer.alloc(40,7)]));const b=DL.verifyWorkbook(bad);ok(!b.valid&&!b.zipOk,'byte ZIP magic + đệm KHÔNG phải workbook: '+JSON.stringify(b).slice(0,200));
    const flip=Buffer.from(DL.makeValidXlsx());flip[100]^=0xFF;fs.writeFileSync(path.join(tmp,'flip.xlsx'),flip);ok(!DL.verifyWorkbook(path.join(tmp,'flip.xlsx')).valid,'sai byte nội dung → CRC/ZIP phát hiện');
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
suite('3. Chạy bình thường: PASS, thoát 0',()=>{const r=run();eq(r.status,0,r.stdout.slice(-400));ok(/Kết luận đối chứng: PASS/.test(r.stdout))});
suite('4. Giả lập không cho tải: BLOCKED (thoát 3), không PASS',()=>{const r=run({KATY_SIMULATE_NO_DOWNLOADS:'1'});eq(r.status,3);ok(/BLOCKED/.test(r.stdout)&&!/Kết luận đối chứng: PASS/.test(r.stdout))});
suite('5. Giả lập chặn truy cập loopback: phép đo HTTP ghi BLOCKED, phép đo setContent vẫn chạy, thoát 3, dọn tài nguyên',()=>{const r=run({KATY_SIMULATE_LOOPBACK_BLOCK:'1'});eq(r.status,3,r.stdout.slice(-500)+r.stderr.slice(-200));ok(/máy chủ loopback[^\n]*BLOCKED/.test(r.stdout),r.stdout);ok(/C\. Blob văn bản nhỏ[^\n]*: OK/.test(r.stdout)&&/E\. Blob XLSX hợp lệ[^\n]*: OK/.test(r.stdout),'đối chứng không cần loopback vẫn chạy');ok(!/Kết luận đối chứng: PASS/.test(r.stdout))});
console.log('Tổng kiểm tra:',steps);
