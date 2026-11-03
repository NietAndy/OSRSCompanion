const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800}});
await ctx.addInitScript(()=>{window.__n=0;window.osrsWin={titel(){},prijzen:async()=>{window.__n++;return {text:JSON.stringify({data:{"4151":{high:1400000,low:1390000}}})}},discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};localStorage.setItem('osrs-gids-login','skip');
localStorage.setItem('osrs-gids-prijsmeld',JSON.stringify({alerts:[{k:1,id:4151,n:'Abyssal whip',dir:'onder',p:1500000,basis:'mid',on:true}],every:2,auto:true,notif:false,log:[]}))});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(1500);
console.log('every',await p.$eval('#pmEvery',e=>e.value+' opts '+e.options.length));
await p.evaluate(()=>window.OSRSShell.go('ge'));await p.waitForTimeout(1500);
await p.waitForTimeout(10500);console.log('fetches ge',await p.evaluate(()=>window.__n),'auto',await p.$eval('#geAuto',e=>e.checked));
await p.click('#pmNu').catch(()=>{});
await p.evaluate(()=>window.OSRSPrijsmeld.controleer());await p.waitForTimeout(800);
console.log('modal',await p.$$eval('.pm-modal',e=>e.length),(await p.textContent('.pm-card')));
await p.screenshot({path:__dirname+'/uit/modal.png'});
await p.keyboard.press('Escape');console.log('after esc',await p.$$eval('.pm-modal',e=>e.length));
await p.evaluate(()=>window.OSRSShell.go('begrippen'));await p.waitForTimeout(300);
await p.fill('#bgQ','dps');console.log('vis',await p.$$eval('.bg-r:not([hidden])',e=>e.length));
await p.evaluate(()=>window.OSRSShell.go('ge'));await p.waitForTimeout(500);
console.log('annot',await p.$$eval('.bg-t',e=>e.map(x=>x.textContent)));
const t=await p.$('.bg-t');if(t){await t.hover();console.log('pop',await p.textContent('.bg-pop').catch(()=>'none'));}
console.log(errs);await b.close()})()
