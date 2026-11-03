const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for (const last of [null,'questvolgorde','home']){
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript((last)=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');if(last){for(const k of ['osrs-gids-page','osrs-gids-last','osrs-gids-pagina'])localStorage.setItem(k,last);}},last);
const p=await ctx.newPage();const t0=Date.now();
p.on('console',m=>{});
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'),{waitUntil:'commit'});
for(const ms of [500,1000,2000,3500,6000]){await p.waitForTimeout(ms-(Date.now()-t0)>0?ms-(Date.now()-t0):0);
 const st=await p.evaluate(()=>({cur:window.OSRSShell&&OSRSShell.current(),vis:[...document.querySelectorAll('section')].filter(s=>!s.hidden&&s.offsetHeight>50).map(s=>s.id).slice(0,4),h:document.body?document.body.innerText.length:0})).catch(e=>'eval-busy');
 console.log(last,ms,JSON.stringify(st));}
const perf=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd)}});console.log(last,'perf',perf);
await ctx.close();}
await b.close()})()
