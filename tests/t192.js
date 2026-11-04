/* Miniquests staan open onder de Quests-lijst en delen hun opslag met de eisen van quests en Levels en account (#12). */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','quests');
 if(!sessionStorage.getItem('klaar')){sessionStorage.setItem('klaar','1');localStorage.setItem('osrs-gids-minis',JSON.stringify({"Bear Your Soul":true}));}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
const info=()=>p.evaluate(()=>({open:document.querySelector('details.acct').open,samenvatting:document.getElementById('mqSum').textContent,rijen:document.querySelectorAll('#mqList .mq-row').length,stateMini:Object.keys(window.OSRSQuest.get().mini),oud:localStorage.getItem('osrs-gids-minis'),abyssBijLevels:(()=>{const c=document.querySelector('#mini input[data-m="Enter the Abyss"]');return c&&c.checked})()}));
console.log('start (oud vinkje Bear Your Soul overgenomen):',await info());
await p.locator('#mqList input[aria-label="Enter the Abyss gedaan"]').check();await p.waitForTimeout(500);
console.log('na afvinken Enter the Abyss:',await info());
const temple=await p.evaluate(()=>window.OSRSQuest.evalAll().find(q=>q.n==='Temple of the Eye'));
console.log('Temple of the Eye mist nu Enter the Abyss?',JSON.stringify(temple.miss).includes('Enter the Abyss'));
await p.fill('#qSearch','abyss');await p.waitForTimeout(600);
console.log('zoeken op abyss:',await p.evaluate(()=>[...document.querySelectorAll('#mqList .mq-row .mq-n')].map(x=>x.textContent)));
await p.screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t192.png'});
console.log('fouten:',errs);await b.close()})()
