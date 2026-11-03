const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(500);
console.log((await p.textContent('#home')).match(/0\/\d+/)[0]);
await p.evaluate(()=>window.OSRSShell.go('quests'));await p.waitForTimeout(500);
console.log(/Mudfoot/.test(await p.textContent('#quests')), /Writing's on the Wall/.test(await p.textContent('#quests')));
await p.evaluate(()=>window.OSRSShell.go('questvolgorde'));await p.waitForTimeout(800);
console.log(/Mudfoot/.test(await p.textContent('#questvolgorde')));
console.log(errs);await b.close()})()
