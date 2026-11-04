/* Wekelijkse controle: Daddy's Home is nu een quest, en nieuwe items staan in de lijst. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','quests');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
const r=await p.evaluate(()=>({q:QUESTS.filter(x=>x.n==="Daddy's Home").map(x=>[x.n,x.qp,x.f]),mini:document.querySelector('#mqSum')?document.querySelector('#mqSum').textContent:'',ge:GE_ALL.some(g=>g[1]==='Obligator (uncharged)'),n:GE_ALL.length,ids:new Set(GE_ALL.map(g=>g[0])).size}));
console.log(JSON.stringify(r));
eis("Daddy's Home staat bij de quests, 1 QP, members",r.q.length===1&&r.q[0][1]===1&&r.q[0][2]===0);
eis('miniquests: 23 in de lijst',/van 23 gedaan/.test(r.mini),r.mini);
eis('nieuw item Obligator (uncharged) staat in de itemlijst',r.ge);
eis('geen dubbele ids in de itemlijst',r.n===r.ids,r.n+' / '+r.ids);
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
