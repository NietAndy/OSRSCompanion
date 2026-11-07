/* Meldingen: weeksamenvatting en "Je kunt weer iets doen". */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const basis=()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');};
// 1. weeksamenvatting
let ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(basis);
await ctx.addInitScript(()=>{if(localStorage.getItem('osrs-gids-hs-snap'))return;const nu=Date.now(),D=864e5;
  localStorage.setItem('osrs-gids-hs-snap',JSON.stringify([{t:nu-8*D,n:'Tester',xp:{Overall:9e6,Mining:1000000,Fishing:500000},c:nu-8*D},{t:nu-3600000,n:'Tester',xp:{Overall:9.24e6,Mining:1240000,Fishing:500500},c:nu-60000}]));});
let p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(7500);
const t1=await p.evaluate(()=>{const t=document.getElementById('weekToast');return t?t.innerText.replace(/\n/g,' '):''});
eis('de weeksamenvatting verschijnt met totaal en skill',/Deze week heb je 240\.500 xp gewonnen, het meest in Mining\./.test(t1),t1.slice(0,90));
await p.screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t204-week.png'});
await p.reload();await p.waitForTimeout(7500);
eis('een tweede keer binnen een week komt hij niet terug',await p.evaluate(()=>!document.getElementById('weekToast')));
eis('geen scriptfouten (week)',errs.length===0,errs.join('|'));
await ctx.close();
// 2. je kunt weer iets doen
ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(basis);
p=await ctx.newPage();const errs2=[];p.on('pageerror',e=>errs2.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3500);
eis('bij de eerste keer geen melding (alleen onthouden)',await p.evaluate(()=>!document.getElementById('opendoenToast')&&!!localStorage.getItem('osrs-gids-open-gezien')));
await p.evaluate(()=>{window.OSRSQuest.keys.forEach(k=>window.OSRSQuest.setLevel(k,99));});
await p.waitForTimeout(3500);
const t2=await p.evaluate(()=>{const t=document.getElementById('opendoenToast');return t?t.innerText.replace(/\n/g,' '):''});
eis('na hogere levels komt de melding Je kunt weer iets doen',/Met je nieuwe levels kun je nu starten met /.test(t2),t2.slice(0,120));
await p.screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t204-open.png'});
await p.click('#opendoenToast .btn:not(.ghost)');await p.waitForTimeout(400);
eis('de knop opent Quests',await p.evaluate(()=>!document.getElementById('quests').hidden));
await p.evaluate(()=>{window.OSRSQuest.keys.forEach(k=>window.OSRSQuest.setLevel(k,99));});await p.waitForTimeout(3000);
eis('zonder nieuwe quests geen tweede melding',await p.evaluate(()=>!document.getElementById('opendoenToast')));
eis('geen scriptfouten (open)',errs2.length===0,errs2.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
