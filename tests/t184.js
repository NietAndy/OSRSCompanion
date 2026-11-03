const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.addInitScript(()=>{window.__hs=0;window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),
 hiscores:async()=>{window.__hs++;let t="1,2000,5000000\n";for(let i=0;i<24;i++)t+="1000,70,800000\n";return {text:t+"1,1,1\n".repeat(30)}}};
 localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');
 localStorage.setItem('osrs-gids-checklist',JSON.stringify({timers:{herb:Date.now()+30*60000,bird:Date.now()-1000},ping:{bird:1}}));});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
console.log('menu:',await p.$$eval('.nv[data-go="dagelijks"]',e=>e.map(x=>x.textContent)));
await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(800);
const blk=await p.$$eval('.pn',e=>e.filter(x=>/Timers/.test(x.querySelector('h3')?.textContent||'')).map(x=>x.innerText));console.log('home:',blk);
console.log('E',errs);await p.evaluate(()=>window.OSRSTimers.test());await p.waitForTimeout(300);
console.log('toast:',await p.textContent('.tm-toast'));
await p.screenshot({path:__dirname+'/uit/s184.png'});
await p.evaluate(()=>window.OSRSShell.go('dagelijks'));await p.waitForTimeout(500);
console.log('snd box:',await p.$$eval('#clSnd',e=>e.length));
await p.evaluate(()=>window.OSRSShell.go('me'));await p.waitForTimeout(300);
await p.fill('#hsName','Zezima');await p.click('#hsGo');await p.waitForTimeout(500);
console.log('hs:',await p.textContent('.hsnote'));
console.log(errs);await b.close()})()
