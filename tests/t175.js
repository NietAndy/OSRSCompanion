const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},prijzen:async()=>({error:'x'}),discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-v1',JSON.stringify({lv:{Attack:70,Strength:70,Defence:70,Hitpoints:70,Mining:50},done:{"Rune Mysteries":1},mini:{}}))});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(1500);
for(const n of (process.argv[2]||'home').split(',')){await p.evaluate(n=>window.OSRSShell.go(n),n);await p.waitForTimeout(700);await p.screenshot({path:__dirname+'/uit/s_'+n+'.png'});}
console.log(errs);await b.close()})()
