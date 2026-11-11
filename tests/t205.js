/* 0.5.24: nieuwe quests van week twee, routes van vier nieuwe quests, quest-xp van oudere quests. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','quests');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const Q=n=>QUESTS.find(x=>x.n===n);const R=window.OSRS_ROUTES||{};
  const nieuw=["The Birds and the Wasps","A Shell of a Friend","Mudfoot's Big Adventure","The Writing's on the Wall"];
  const xp=["Demon Slayer","Romeo & Juliet","Shield of Arrav","Ernest the Chicken","Prince Ali Rescue","Black Knights' Fortress","Pirate's Treasure","Rune Mysteries","The Corsair Curse","Below Ice Mountain","Clock Tower","Family Crest","Lost City","Merlin's Crystal","Sheep Herder","Tale of the Righteous","Throne of Miscellania","Troll Stronghold"];
  return {n:QUESTS.length,nieuw:nieuw.map(n=>[n,!!Q(n),(R[n]||[]).length,Q(n)&&Q(n).rw&&Q(n).rw.length>10]),
    xpZonder:xp.filter(n=>!Q(n)||!/XP/.test(Q(n).rw||'')),shell:Q("A Shell of a Friend"),
    stappenOk:nieuw.every(n=>(R[n]||[]).every(s=>s.length>=5&&typeof s[0]==='number'&&typeof s[3]==='string'))};});
console.log(JSON.stringify(r.nieuw),r.n);
eis('alle 4 nieuwe quests staan in de lijst met beloning',r.nieuw.every(x=>x[1]&&x[3]));
eis('alle 4 nieuwe quests hebben een route',r.nieuw.every(x=>x[2]>=5),JSON.stringify(r.nieuw.map(x=>x[2])));
eis('alle stappen hebben x, y, tekst en de quest-naam',r.stappenOk);
eis('alle 18 oudere quests noemen nu XP in de beloning',r.xpZonder.length===0,r.xpZonder.join(','));
eis('A Shell of a Friend vraagt Priest in Peril en Druidic Ritual',JSON.stringify(r.shell.pre||r.shell.req||r.shell)!==undefined&&/Priest in Peril/.test(JSON.stringify(r.shell))&&/Druidic Ritual/.test(JSON.stringify(r.shell)));
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
