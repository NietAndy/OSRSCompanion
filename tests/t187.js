const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),logLees:async()=>({regels:[],versie:"0.5.22"}),
 updateCheck:async()=>({huidig:"0.5.22",nieuwste:"0.5.22"}),bugMeld:async()=>({ok:true})};
 localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3500);
await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(400);
console.log(await p.textContent('.hoek'));
await p.click('#hkUpd');await p.waitForTimeout(500);console.log('na upd:',await p.textContent('.hoek'));
await p.screenshot({path:__dirname+'/uit/s187.png'});
await p.click('#hkMeld');await p.waitForTimeout(300);console.log('form:',await p.$$eval('.bm-modal',e=>e.length));
console.log(errs);await b.close()})()
