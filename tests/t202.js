/* Quest-volgorde (#9): een quest afvinken kan op die pagina zelf, en de pagina schuift mee. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.evaluate(()=>window.OSRSShell.go('questvolgorde'));await p.waitForTimeout(800);
const gedaan=()=>p.evaluate(()=>{const m=document.querySelector('#questvolgorde .qv-sum b');return m?+m.textContent:-1});
const n0=await gedaan();
const eerste=await p.evaluate(()=>{const c=document.querySelector('#questvolgorde .qv-cb');return c?c.getAttribute('data-q'):null});
eis('er staan vinkjes bij de quests',!!eerste,String(eerste));
await p.locator('#questvolgorde .qv-cb').first().click();await p.waitForTimeout(500);
eis('het aantal gedaan gaat omhoog',await gedaan()===n0+1,n0+' -> '+await gedaan());
eis('de quest staat nu ook als gedaan bij Quests',await p.evaluate(n=>!!window.OSRSQuest.get().done[n],eerste));
eis('de afgevinkte quest staat niet meer in de lijst',await p.evaluate(n=>![...document.querySelectorAll('#questvolgorde .qv-cb')].some(c=>c.getAttribute('data-q')===n),eerste));
await p.locator('#questvolgorde ol').first().screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t202.png'});
eis('klikken op het vinkje klapt de quest niet open',await p.evaluate(()=>!document.querySelector('#questvolgorde ol > li > details[open]')));
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
