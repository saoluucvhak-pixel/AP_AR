// Chạy toàn bộ test trong thư mục này bằng Node (không chạy trên Apps Script): node 4_TESTS/run-all.cjs
// Kết quả "đạt" nghĩa là các khẳng định trong từng tệp đúng với dữ liệu giả; KHÔNG chứng minh mã sạch lỗi hay đúng nghiệp vụ trên dữ liệu thật.
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.cjs')).sort((a,b)=>(a.startsWith('reject')?-1:0)-(b.startsWith('reject')?-1:0)||a.localeCompare(b));
let ok=0;const bad=[],blocked=[];
for(const f of files){const r=spawnSync(process.execPath,[path.join(__dirname,f)],{encoding:'utf8',cwd:__dirname});const pass=r.status===0,blk=r.status===3;pass?ok++:(blk?blocked.push(f):bad.push(f));console.log((pass?'✔ ':blk?'⚠ BLOCKED ':'✖ ')+f+(pass?'':'\n'+(r.stdout+r.stderr).split('\n').slice(-12).join('\n')))}
console.log('\n'+ok+'/'+files.length+' tệp test đạt'+(bad.length?'; FAILED: '+bad.join(', '):'')+(blocked.length?'; BLOCKED (chưa xác minh, KHÔNG tính là đạt): '+blocked.join(', '):''));
console.log('Tổng kết: PASSED='+ok+' FAILED='+bad.length+' BLOCKED='+blocked.length);
process.exit(bad.length?1:(blocked.length?3:0));
