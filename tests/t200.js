/* Itemicoontjes: namen met afwijkende hoofdletters en pets wijzen naar het juiste wiki-bestand. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext();
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2000);
const r=await p.evaluate(()=>({a:window.OSRS_IC('3rd age amulet'),b:window.OSRS_IC('Pet kraken'),c:window.OSRS_IC("Zulrah's scales"),n:Object.keys(window.OSRS_ICON_ALIAS).length}));
eis('3rd age amulet -> 3rd_Age_amulet.png',/images\/3rd_Age_amulet\.png/.test(r.a),r.a.slice(0,140));
eis('Pet kraken -> Pet_Kraken.png',/images\/Pet_Kraken\.png/.test(r.b));
eis('gewone namen blijven zoals ze waren',/images\/Zulrah's_scales\.png/.test(r.c));
eis('minstens 300 aliassen',r.n>=300,String(r.n));
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
