const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-v1',JSON.stringify({lv:{Attack:40,Strength:40,Defence:40,Hitpoints:40,Mining:50},done:{},mini:{}}))});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(1500);
await p.evaluate(()=>window.OSRSShell.go('questvolgorde'));await p.waitForTimeout(400);
await p.click('#questvolgorde li summary');
console.log(await p.textContent('#questvolgorde li details'));
console.log('let op',await p.$$eval('#questvolgorde .qv-why',e=>e.filter(x=>/let op/.test(x.textContent)).length));
await p.screenshot({path:__dirname+'/uit/qv2.png'});console.log(errs);await b.close()})()
