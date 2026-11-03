/* 0.5.23: voortgang over tijd. Hiscores worden nagemaakt; de tijd wordt verschoven via bewaarde momentopnames. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{
  const namen=["Attack","Defence","Strength","Hitpoints","Ranged","Prayer","Magic","Cooking","Woodcutting","Fletching","Fishing","Firemaking","Crafting","Smithing","Mining","Herblore","Agility","Thieving","Slayer","Farming","Runecraft","Hunter","Construction","Sailing"];
  window.__xp=1000000;
  window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),
    hiscores:async()=>({text:["1,2000,3000000"].concat(namen.map((n,i)=>(i===0?"1,80,"+window.__xp:"1,50,100000"))).join("\n")})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','me');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.fill('#hsName','Tester');
await p.click('#hsGo');await p.waitForTimeout(500);
console.log('1 ophaling:',await p.evaluate(()=>document.querySelector('.hsvoort').innerText));
// eerste momentopname 3 dagen terugzetten, tweede ophaling met meer xp
await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem('osrs-gids-hs-snap'));a[0].t-=3*864e5;localStorage.setItem('osrs-gids-hs-snap',JSON.stringify(a));window.__xp=1300000;});
await p.click('#hsGo');await p.waitForTimeout(500);
console.log('2 ophalingen:',await p.evaluate(()=>({tekst:document.querySelector('.hsvoort').innerText,svg:!!document.querySelector('.hsvoort svg polyline'),n:JSON.parse(localStorage.getItem('osrs-gids-hs-snap')).length})));
// binnen een uur vervangt de vorige
await p.click('#hsGo');await p.waitForTimeout(300);
console.log('aantal na 3e (moet 2 blijven):',await p.evaluate(()=>JSON.parse(localStorage.getItem('osrs-gids-hs-snap')).length));
await p.screenshot({path:'tests/uit/t190.png'});
console.log('fouten:',errs);await b.close()})()
