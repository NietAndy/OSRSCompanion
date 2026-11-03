const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});
await ctx.addInitScript(()=>{window.__bug=[];window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),logLees:async()=>({regels:[]}),
 bugMeld:async(m)=>{window.__bug.push(m);return window.__bug.length>1?{error:"Je hebt net een melding gestuurd. Wacht twee minuten voor de volgende."}:{ok:true}}};
 localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.evaluate(()=>window.OSRSShell.go('over'));await p.waitForTimeout(400);
await p.click('#ovMeld');await p.waitForTimeout(300);
await p.click('#bmGo');console.log('leeg:',await p.textContent('#bmUit'));
await p.fill('#bmTi','Grafiek blijft leeg');await p.fill('#bmTx','Bij Prijzen zie ik geen grafiek bij Coal.');
await p.screenshot({path:__dirname+'/uit/s186.png'});
await p.click('#bmGo');await p.waitForTimeout(300);
console.log('na:',await p.textContent('.bm-card'),JSON.stringify(await p.evaluate(()=>window.__bug)));
await p.click('#bmOk');
await p.click('#ovMeld');await p.fill('#bmTi','Nog een');await p.fill('#bmTx','tweede melding test');await p.click('#bmGo');await p.waitForTimeout(300);
console.log('2e:',await p.textContent('#bmUit'));
console.log(errs);await b.close()})()
