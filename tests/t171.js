const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},prijzen:async()=>({error:'x'}),discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-goals',JSON.stringify([{id:1,t:'free',k:'Mining 80 halen',d:false}]));});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(1800);
await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(700);
const order=()=>p.$$eval('.cols .hb',e=>e.map(x=>x.dataset.blk).join(','));
console.log('start',await order());
await p.click('#homeEdit');await p.waitForTimeout(200);
console.log('edit',await p.textContent('#homeEdit'),await order(),'');
await p.screenshot({path:__dirname+'/uit/dd1.png'});
// slepen: prijs voor doel
const g=await p.$('[data-blk="prijs"]').then(e=>e.boundingBox());const t=await p.$('[data-blk="doel"]').then(e=>e.boundingBox());await p.mouse.move(g.x+g.width/2,g.y+g.height/2);await p.mouse.down();await p.mouse.move(g.x+g.width/2+20,g.y+g.height/2+20,{steps:3});await p.mouse.move(t.x+10,t.y+t.height/2,{steps:10});await p.screenshot({path:__dirname+'/uit/dd3.png'});await p.mouse.up();await p.waitForTimeout(300);
console.log('na slepen',await order());
// pijltje
await p.click('[data-blk="doel"] [data-hbm="1"]');console.log('na pijltje',await order(),'focus',await p.evaluate(()=>document.activeElement.getAttribute('data-hbm')));
// verberg
await p.click('[data-blk="quests"] [data-hbx]');console.log('na verberg',await order());
await p.click('[data-hbadd="snel"]');console.log('na toevoegen',await order());
await p.reload();await p.waitForTimeout(1500);await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(600);console.log('na reload',await order(),'edit?',await p.textContent('#homeEdit'));
await p.click('#homeEdit');await p.click('#homeReset');console.log('reset',await order());
await p.click('#homeEdit');console.log('klaar',await p.textContent('#homeEdit'));
await p.screenshot({path:__dirname+'/uit/dd2.png'});
console.log(errs);await b.close()})()
