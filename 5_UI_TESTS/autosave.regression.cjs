const fs=require('fs'),vm=require('vm'),path=require('path');
const pre=fs.readFileSync(path.join(__dirname,'ui.e2e.cjs'),'utf8').split('(async()=>{')[0];
const extra=String.raw`
(async()=>{
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
try {
 const w=build(),{pg,errs}=await newPage(browser,w);
 await pg.evaluate(()=>{const old=callServer;window.__draftRequests=[];callServer=e=>e.action==='draft.save'?new Promise((resolve,reject)=>{__draftRequests.push({env:e,release:()=>old(e).then(resolve,reject)})}):old(e)});
 await pg.evaluate(()=>{location.hash='#/doc/new?dir=AR'});
 const field='textarea[data-path="lines[0].description"]';await pg.waitForSelector(field);
 await pg.fill(field,'FIRST');
 await pg.waitForFunction(()=>__draftRequests.length===1);
 await pg.fill(field,'LATEST');await pg.waitForTimeout(1800);
 assert.equal(await pg.evaluate(()=>__draftRequests.length),1,'second autosave must wait for first RPC');
 await pg.evaluate(()=>__draftRequests[0].release());
 await pg.waitForFunction(()=>__draftRequests.length===2);
 assert.equal(await pg.evaluate(()=>__draftRequests[1].env.payload.ifVersion),1);
 await pg.evaluate(()=>__draftRequests[1].release());
 await pg.waitForSelector('[data-draft-saved]');
 await pg.waitForTimeout(100);
 const row=w.T.DraftEntry.find(x=>x.isDeleted!==1);
 assert.equal(row.version,2);assert.ok(row.dataJson.includes('LATEST'));
 console.log('PASS initial input saved; delayed autosaves serialized; latest value and version preserved');
 w.ctx.draftSave_(full,{payload:{id:row.id,kind:'DOC',ifVersion:2,data:{external:true}}});
 await pg.fill(field,'LOCAL UNSAVED');await pg.waitForFunction(()=>__draftRequests.length===3);
 await pg.evaluate(()=>__draftRequests[2].release());await pg.waitForSelector('[data-draft-error]');
 assert.equal(await pg.inputValue(field),'LOCAL UNSAVED');assert.ok(w.T.DraftEntry.find(x=>x.id===row.id).dataJson.includes('external'));
 assert.deepEqual(errs,[]);
 console.log('PASS second-tab version conflict is visible; neither server draft nor local input is silently overwritten');
 await pg.close();
} finally {await browser.close();try{fs.rmSync(TMP,{recursive:true,force:true})}catch(e){}}
})().catch(e=>{console.error(e);process.exitCode=1});
`;
vm.runInNewContext(pre+extra,{require,__dirname,process,console,Buffer,setTimeout},{filename:'autosave-regression.cjs'});
