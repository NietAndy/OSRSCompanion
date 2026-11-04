/* De app toont een beta-update met een BETA-label, en vraagt eenmalig om opnieuw in te loggen als de rolgegevens ontbreken. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
async function run(naam,antwoord,extra){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript(({antwoord})=>{window.__login=0;window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>{window.__login++;return {ok:true,user:{}}},updateOpen(){},updateInstall:async()=>({ok:true,mode:'herstart'}),onUpdateVoortgang(){return()=>{}},updateCheck:async()=>antwoord};
    localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','home');},{antwoord});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3500);
  const o=await p.evaluate(()=>({bar:document.getElementById('updBar').hidden?'':document.getElementById('updBar').innerText,tag:(document.getElementById('verTag')||{}).textContent||'',beta:!!document.querySelector('#updBar .updbeta')}));
  await extra(p,o);eis(naam+': geen scriptfouten',errs.length===0,errs.join('|'));await ctx.close();}
await run('beta-tester met een beta',{huidig:'0.5.22.3',bouw:'x',betaTester:true,beta:true,nieuwste:'0.5.22.91',url:'https://github.com/NietAndy/OSRSCompanion/releases',install:true,platform:'win32',grootte:80000000,notities:'x'},async(p,o)=>{
  eis('beta-tester: balk met "beta-versie" en label',/beta-versie 0\.5\.22\.91/.test(o.bar)&&o.beta);eis('beta-tester: versieregel noemt Beta-tester',/Beta-tester/.test(o.tag),o.tag);});
await run('gewone gebruiker met een gewone release',{huidig:'0.5.22.3',bouw:'x',betaTester:false,beta:false,nieuwste:'0.5.23',url:'https://github.com/NietAndy/OSRSCompanion/releases',install:true,platform:'win32',grootte:80000000,notities:'x'},async(p,o)=>{
  eis('gewone gebruiker: geen beta-label',/Nieuwe versie 0\.5\.23/.test(o.bar)&&!o.beta);eis('gewone gebruiker: versieregel zonder Beta-tester',!/Beta-tester/.test(o.tag),o.tag);});
await run('rolgegevens ontbreken',{huidig:'0.5.22.3',bouw:'x',betaTester:false,inlogOpnieuw:true,nieuwste:'0.5.22.3',url:'https://github.com/NietAndy/OSRSCompanion/releases',install:true,platform:'win32',grootte:1,notities:''},async(p,o)=>{
  eis('vraag om opnieuw in te loggen verschijnt',/Wil je beta-updates zien/.test(o.bar));
  await p.click('#betaGo');await p.waitForTimeout(800);
  eis('de knop start het inloggen',(await p.evaluate(()=>window.__login))===1);});
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
