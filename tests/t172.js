const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write']});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false}),discordOpen(){window.__dc=1}};localStorage.setItem('osrs-gids-login','skip');
if(!localStorage.getItem('osrs-gids-v1'))localStorage.setItem('osrs-gids-v1',JSON.stringify({lv:{Mining:50,Attack:40,Fishing:30},done:{"The Ides of Milk":1,"Learning the Routing":1,"Sheep Herder":1},mini:{}}))});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3500);
console.log('tour',await p.$$eval('.tour-modal',e=>e.length),await p.textContent('.tour-card h2'));
await p.click('[data-t=volg]');console.log(await p.textContent('.tour-n'));
await p.screenshot({path:__dirname+'/uit/tour.png'});
await p.keyboard.press('Escape');console.log('tour weg',await p.$$eval('.tour-modal',e=>e.length),await p.evaluate(()=>localStorage.getItem('osrs-gids-tour')));
await p.evaluate(()=>window.OSRSShell.go('questvolgorde'));await p.waitForTimeout(500);
console.log((await p.textContent('#questvolgorde')).slice(0,900));
await p.screenshot({path:__dirname+'/uit/qv.png',fullPage:false});
await p.evaluate(()=>window.OSRSShell.go('over'));await p.waitForTimeout(300);
await p.click('#ovMeld');await p.waitForTimeout(1200);console.log('meld',await p.textContent('#ovMeldT'),await p.evaluate(()=>window.__dc),(await p.evaluate(()=>navigator.clipboard.readText())).slice(0,120));
await p.click('#ovBk');await p.waitForTimeout(500);console.log('bk',await p.textContent('#ovT'));
await p.evaluate(()=>window.OSRSShell.go('logboek'));await p.waitForTimeout(500);console.log('lgMeld',await p.$$eval('#lgMeld',e=>e.length));
console.log(errs);await b.close()})()
