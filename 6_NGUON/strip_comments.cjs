// Bỏ mọi chú thích JS (// và /* */) bằng bộ phân tích espree (không nhầm với // trong chuỗi, regex, URL). Dùng: node strip_comments.cjs <vào> <ra> [html|js]
const fs=require('fs');
let espree;try{espree=require('espree')}catch(e){espree=require('/opt/node-tools/node_modules/espree')}
function stripJs(code){
  const comments=espree.parse(code,{ecmaVersion:'latest',sourceType:'script',comment:true,range:true}).comments;
  let out='',last=0;
  comments.sort((a,b)=>a.range[0]-b.range[0]).forEach(c=>{out+=code.slice(last,c.range[0]);last=c.range[1]});
  out+=code.slice(last);
  return out.split('\n').map(l=>l.replace(/[ \t]+$/,'')).filter((l,i,a)=>!(l===''&&a[i-1]==='')).join('\n');
}
function check(code){return espree.parse(code,{ecmaVersion:'latest',sourceType:'script',comment:true}).comments.length}
const [,,inp,outp,mode]=process.argv;let src=fs.readFileSync(inp,'utf8'),res;
if(mode==='html'){
  const isJs=a=>!/type\s*=/.test(a)||/type\s*=\s*["']?(text\/javascript|module)/i.test(a);
  res=src.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g,(m,a,body,c)=>isJs(a)&&body.trim()?a+stripJs(body)+c:m);
  res=res.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,a,body,c)=>a+body.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n{3,}/g,'\n\n')+c);
  let left=0;res.replace(/(<script[^>]*>)([\s\S]*?)<\/script>/g,(m,a,b)=>{if(isJs(a)&&b.trim())left+=check(b);return m});
  if(left)throw new Error('còn '+left+' chú thích trong script');
}else{res=stripJs(src);if(check(res))throw new Error('còn chú thích')}
fs.writeFileSync(outp,res);console.log(outp,src.length,'→',res.length);
