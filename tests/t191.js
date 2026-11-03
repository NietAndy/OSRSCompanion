/* Quest-volgorde: een quest afvinken kan nu ook op deze pagina en blijft in sync met het tabblad Quests. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','questvolgorde');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
const info=()=>p.evaluate(()=>({vinkjes:document.querySelectorAll('#questvolgorde .qv-cb').length,gedaan:Object.keys(window.OSRSQuest.get().done).length,sum:document.querySelector('#questvolgorde .qv-sum').innerText}));
const voor=await info();console.log('voor:',voor);
const naam=await p.evaluate(()=>document.querySelector('#questvolgorde .qv-cb').getAttribute('data-q'));
await p.locator('#questvolgorde .qv-cb').first().click();await p.waitForTimeout(500);
const na=await info();console.log('na afvinken van',naam,':',na);
console.log('state:',await p.evaluate((n)=>!!window.OSRSQuest.get().done[n],naam),' staat nog in lijst:',await p.evaluate((n)=>[...document.querySelectorAll('#questvolgorde .qv-cb')].some(c=>c.getAttribute('data-q')===n),naam));
// het tabblad Quests moet hem ook als gedaan tonen
await p.evaluate(()=>OSRSShell.go('quests'));await p.waitForTimeout(500);
console.log('bij Quests aangevinkt:',await p.evaluate((n)=>{const cbs=[...document.querySelectorAll('#qList .dn-cb')];const q=window.QUESTS||QUESTS;const i=q.findIndex(x=>x.n===n);const c=cbs.find(x=>+x.getAttribute('data-i')===i);return c?c.checked:'niet gevonden'},naam));
console.log('fouten:',errs);await b.close()})()
