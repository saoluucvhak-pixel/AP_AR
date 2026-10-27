// Chẩn đoán độc lập tải xuống. Chạy: node 5_UI_TESTS/download.probe.cjs
// Thoát 0 = PASS (mọi đối chứng tải được, workbook hợp lệ); 3 = BLOCKED (môi trường/loopback chặn, chưa kết luận); 1 = lỗi thực thi. Biến: CHROME_PATH, PYTHON.
// Đây là context ĐỘC LẬP (đối chứng phụ). Đối chứng chính chạy trong chính BrowserContext của trang ứng dụng ở ui.e2e.cjs.
const {chromium}=require('playwright'),fs=require('fs'),os=require('os'),path=require('path'),DL=require('./_download_probe.cjs');
(async()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'katy-dl-')),browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});let ctx=null;
  try{
    console.log('Môi trường:',JSON.stringify(DL.envInfo(browser,require('playwright/package.json').version,tmp)));
    ctx=await browser.newContext({acceptDownloads:!process.env.KATY_SIMULATE_NO_DOWNLOADS});
    const ctl=await DL.controls(ctx,tmp,'[context độc lập] ');console.log(DL.table(ctl));
    const cls=DL.classify(ctl,{ok:true}),blockedAny=ctl.some(x=>x.blocked||!x.ok);
    console.log('Kết luận đối chứng:',blockedAny&&cls==='PASS'?'BLOCKED một phần (có phép đo không chạy được)':DL.VERDICT[cls]);
    process.exitCode=(cls==='PASS'&&!blockedAny)?0:3;
  }finally{if(ctx)try{await ctx.close()}catch(e){}await browser.close();try{fs.rmSync(tmp,{recursive:true,force:true})}catch(e){}}
})().catch(e=>{console.error(e);process.exitCode=1});
