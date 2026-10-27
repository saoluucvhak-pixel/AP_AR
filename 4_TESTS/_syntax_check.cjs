// Kiểm tra cú pháp bằng parser THẬT (acorn) đã vendored và ghim phiên bản + SHA256, không dùng regex quét thô.
// Parser bỏ qua đúng chuỗi, chú thích, template literal và regex literal; chỉ mã thực thi mới bị đánh giá.
// Mức ngữ pháp (ecmaVersion 2019) là CHÍNH SÁCH bảo thủ của dự án để tránh BigInt `1n`, `??`, `?.`, ngăn cách số `1_000`; nó KHÔNG chứng minh tương thích đầy đủ với Apps Script (chỉ chạy thử trên staging Google mới xác minh runtime).
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const POLICY_ECMA=2019;
function loadParser(){
  if(process.env.KATY_NO_PARSER)return {parser:null,reason:'KATY_NO_PARSER=1 (giả lập thiếu parser để kiểm tra trạng thái BLOCKED)'};
  try{
    const dir=path.join(__dirname,'vendor'),pin=JSON.parse(fs.readFileSync(path.join(dir,'PARSER_PIN.json'),'utf8')),file=path.join(dir,pin.file),buf=fs.readFileSync(file),sha=crypto.createHash('sha256').update(buf).digest('hex');
    if(sha!==pin.sha256)return {parser:null,reason:'SHA256 của '+pin.file+' không khớp bản ghim ('+sha.slice(0,12)+'… ≠ '+pin.sha256.slice(0,12)+'…): không dùng parser không xác minh được'};
    const mod=require(file);if(!mod||typeof mod.parse!=='function')return {parser:null,reason:'tệp parser không có hàm parse'};
    return {parser:mod,name:pin.name+' '+pin.version,sha256:sha};
  }catch(e){return {parser:null,reason:'không nạp được parser vendored: '+e.message}}
}
// Trả về {ok:true} hoặc {ok:false,line,column,message}. Số dòng tính trong chính chuỗi mã truyền vào (bắt đầu từ 1).
function checkPolicy(parser,code,ecma){
  try{parser.parse(code,{ecmaVersion:ecma||POLICY_ECMA,sourceType:'script',locations:true});return {ok:true}}
  catch(e){return {ok:false,line:e.loc?e.loc.line:null,column:e.loc?e.loc.column:null,message:e.message}}
}
module.exports={loadParser,checkPolicy,POLICY_ECMA};
