// Không được khai báo trùng tên hàm cấp cao trong Backend.gs / Gateway.gs (JavaScript âm thầm lấy bản khai báo sau → hỏng hành vi mà không báo lỗi).
const fs=require('fs'),path=require('path');let bad=[];
for(const f of ['1_BACKEND/Backend.gs','2_GATEWAY/Gateway.gs']){
  const seen={};fs.readFileSync(path.join(__dirname,'..',f),'utf8').split('\n').forEach((l,i)=>{const m=/^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/.exec(l);if(m){if(seen[m[1]])bad.push(f+': '+m[1]+' dòng '+seen[m[1]]+' và '+(i+1));else seen[m[1]]=i+1}});
}
if(bad.length){console.log('✖ trùng tên hàm:\n'+bad.join('\n'));process.exit(1)}console.log('OK dupfn: không có hàm khai báo trùng tên');
