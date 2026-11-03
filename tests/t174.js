const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},prijzen:async()=>({error:'x'}),discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1')});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(1200);
await p.evaluate(()=>window.OSRSShell.go('prijsmeld'));await p.waitForTimeout(300);
await p.click('#pmSndTest');await p.selectOption('#pmSndKind','fanfare');await p.fill('#pmVol','30');await p.$eval('#pmVol',e=>e.dispatchEvent(new Event('change')));await p.uncheck('#pmSnd');
console.log(await p.evaluate(()=>JSON.parse(localStorage.getItem('osrs-gids-prijsmeld')).sndKind+' '+JSON.parse(localStorage.getItem('osrs-gids-prijsmeld')).snd+' '+JSON.parse(localStorage.getItem('osrs-gids-prijsmeld')).vol));console.log(errs);await b.close()})()
