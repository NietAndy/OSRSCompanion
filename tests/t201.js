/* Prijsgrafiek (0.5.23.1): standaard één lijn met de gemiddelde prijs, hoog en laag via een vakje; het beste moment blijft staan. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:1500},timezoneId:'Europe/Amsterdam'});
await ctx.addInitScript(()=>{
 const now=Math.floor(Date.now()/3600)*3600;const data=[];for(let i=0;i<336;i++){const t=now-(336-i)*3600;const h=new Date(t*1000).getHours();const f=(h>=4&&h<=6)?-0.02:(h>=19&&h<=21)?0.02:0;const base=1400000*(1+f)+i*100;data.push({timestamp:t,avgHighPrice:Math.round(base*1.003),avgLowPrice:Math.round(base*0.997),highPriceVolume:50,lowPriceVolume:50});}
 window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),icoon:async()=>({error:'x'}),
  prijzen:async(k)=>k==='reeks'?{text:JSON.stringify({data})}:{text:JSON.stringify({data:{"4151":{high:1406000,low:1398000}}})}};
 localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.evaluate(()=>window.OSRSShell.go('ge'));await p.waitForTimeout(800);
await p.fill('#geSearch','Abyssal whip');await p.waitForTimeout(500);
await p.click('.gchart');await p.waitForTimeout(2000);
const lijnen=()=>p.evaluate(()=>[...document.querySelectorAll('.gsvg path')].filter(x=>x.getAttribute('stroke')&&x.getAttribute('fill')==='none').length);
eis('standaard één lijn in de grafiek',await lijnen()===1);
eis('het vakje Toon ook hoog en laag staat er en staat uit',await p.evaluate(()=>{const c=document.getElementById('gcHL');return !!c&&!c.checked}));
eis('de uitleg noemt de gemiddelde prijs',/het midden van hoog en laag/.test(await p.textContent('.gleg')));
await p.locator('.gcw').screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t201-een-lijn.png'});
await p.check('#gcHL');await p.waitForTimeout(500);
eis('met het vakje aan: twee lijnen (hoog en laag)',await lijnen()===2);
eis('de uitleg noemt hoog en laag',/wat kopers betalen/.test(await p.textContent('.gleg')));
await p.locator('.gcw').screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t201-twee-lijnen.png'});
await p.uncheck('#gcHL');await p.waitForTimeout(500);
eis('vakje weer uit: weer één lijn',await lijnen()===1);
// de keuze wordt onthouden
await p.check('#gcHL');await p.waitForTimeout(300);
eis('de keuze wordt bewaard',await p.evaluate(()=>localStorage.getItem('osrs-gids-chart-hl'))==='1');
eis('de analyse (Prijsinzicht) staat er nog',await p.evaluate(()=>!!document.querySelector('.pz h4')&&/Prijsinzicht/.test(document.querySelector('.pz h4').textContent)));
eis('het beste moment om te kopen en te verkopen staat er nog',/Kopen: meestal het goedkoopst/.test(await p.textContent('.pz-mw')));
await p.hover('.gsvg',{position:{x:300,y:80}});
eis('bij het aanwijzen staat de prijs erbij',/prijs [\d.]+/.test(await p.textContent('#gcro')),(await p.textContent('#gcro')).slice(0,90));
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
