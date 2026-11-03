const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','questvolgorde');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>{const s=document.getElementById('questvolgorde');return {hidden:s.hidden,len:s.innerHTML.length,h:s.offsetHeight,disp:getComputedStyle(s).display,parentHidden:s.parentElement.hidden,pid:s.parentElement.id||s.parentElement.className}}));
await p.evaluate(()=>OSRSShell.go('home'));await p.evaluate(()=>OSRSShell.go('questvolgorde'));await p.waitForTimeout(500);
console.log('na opnieuw:',await p.evaluate(()=>{const s=document.getElementById('questvolgorde');return {len:s.innerHTML.length,h:s.offsetHeight}}));
for (const pg of ['me','prijsmeld','dagelijks','map','ge','begrippen','planner','goals','nieuws']){
 const c2=await b.newContext({viewport:{width:1440,height:900}});await c2.addInitScript((pg)=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page',pg);},pg);
 const q=await c2.newPage();await q.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await q.waitForTimeout(2500);
 console.log(pg,await q.evaluate((pg)=>{const s=document.getElementById(pg);return s?{len:s.innerHTML.length,h:s.offsetHeight,hidden:s.hidden}:'geen sectie'},pg));await c2.close();}
console.log(errs);await b.close()})()
