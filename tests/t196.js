/* Voortgang over tijd (#17): twee keer kort na elkaar ophalen, met en zonder verandering in je xp. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{
  const namen=["Attack","Defence","Strength","Hitpoints","Ranged","Prayer","Magic","Cooking","Woodcutting","Fletching","Fishing","Firemaking","Crafting","Smithing","Mining","Herblore","Agility","Thieving","Slayer","Farming","Runecraft","Hunter","Construction","Sailing"];
  window.__xp=1000000;
  window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),hiscores:async()=>({text:["1,2000,3000000"].concat(namen.map((n,i)=>(i===0?"1,80,"+window.__xp:"1,50,100000"))).join("\n")})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','me');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.fill('#hsName','Tester');
const info=()=>p.evaluate(()=>({tekst:document.querySelector('.hsvoort')?document.querySelector('.hsvoort').innerText:'',n:JSON.parse(localStorage.getItem('osrs-gids-hs-snap')||'[]').length,rijen:[...document.querySelectorAll('.hsvoort tbody tr')].map(r=>r.innerText.replace(/\s+/g,' '))}));
const haal=async()=>{await p.click('#hsGo');await p.waitForTimeout(400);return info();};
let r=await haal();
eis('eerste ophaling: één momentopname, met de uitleg over uitloggen',r.n===1&&/uitlogt in het spel/.test(r.tekst)&&/Eén momentopname/.test(r.tekst));
r=await haal();
eis('tweede keer met dezelfde xp: geen nieuwe momentopname, melding dat er niets bij is gekomen',r.n===1,r.tekst.slice(0,120).replace(/\n/g,' '));
await p.evaluate(()=>{window.__xp=1050000});
r=await haal();
eis('tweede keer met meer xp binnen een minuut: twee momentopnames en de winst is meteen zichtbaar',r.n===2&&r.rijen.length===1&&/\+50\.000/.test(r.rijen[0]),r.rijen[0]);
eis('per dag en 99-schatting zijn nog "–" en de tekst legt uit waarom',/–/.test(r.rijen[0])&&/minstens een uur/.test(r.tekst),r.rijen[0]);
r=await haal();
eis('daarna weer dezelfde xp: nog steeds twee momentopnames',r.n===2);
// de eerste momentopname 3 uur terugzetten: nu is er genoeg tijd voor per dag en 99
await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem('osrs-gids-hs-snap'));a.forEach(x=>{x.t-=3*3600000});localStorage.setItem('osrs-gids-hs-snap',JSON.stringify(a));});
await p.evaluate(()=>{window.__xp=1090000});
r=await haal();
eis('na ruim een uur: per dag en 99-schatting verschijnen',r.n===3&&/\d/.test(r.rijen[0].split(' ')[2])&&/dagen|uur/.test(r.rijen[0]),r.rijen[0]);
await p.screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t196.png'});
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
