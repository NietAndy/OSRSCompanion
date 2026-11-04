/* Officiele kaarticonen: bank, altaar, aambeeld en winkels krijgen het wiki-icoon, onbekende soorten blijven een stip. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{
  const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  window.__gevraagd=[];
  window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),icoon:async(n)=>{window.__gevraagd.push(n);return {url:PNG};}};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','map');
  localStorage.setItem('osrs-gids-mapui',JSON.stringify({poi:{bank:true,altaar:true,aambeeld:true,winkel:true}}));
});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3000);
// in Lumbridge/Varrock kijken: zoom in op een plek met bank
const r=await p.evaluate(()=>({kic:document.querySelectorAll('.kic').length,ok:document.querySelectorAll('.kic.ok').length,cirkels:document.querySelectorAll('path.leaflet-interactive').length,gevraagd:[...new Set(window.__gevraagd)].sort()}));
console.log(JSON.stringify(r));
eis('er staan icoon-markers op de kaart',r.kic>0,'kic='+r.kic);
eis('de iconen zijn geladen (stip wordt icoon)',r.ok>0,'ok='+r.ok);
eis('alleen de gecontroleerde namen worden opgevraagd',r.gevraagd.length>0&&r.gevraagd.every(n=>/ icon$/.test(n)),r.gevraagd.join(', '));
await p.screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t197.png'});
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
