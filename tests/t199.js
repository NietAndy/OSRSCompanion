/* Pets: elke pet in de lijst heeft een afbeelding. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let fouten=0;const eis=(n,ok,x)=>{console.log((ok?'OK    ':'FOUT  ')+n+(x?' '+x:''));if(!ok)fouten++;};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})};
  localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');localStorage.setItem('osrs-gids-page','pets');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html')+'#pets');await p.waitForTimeout(2500);
const r=await p.evaluate(()=>({n:document.querySelectorAll('#pets details.qc').length,zonder:[...document.querySelectorAll('#pets details.qc')].filter(d=>!d.querySelector('img.pimg')).map(d=>d.getAttribute('data-n'))}));
console.log(JSON.stringify(r));
eis('er staan pets op de pagina',r.n>=70,'n='+r.n);
eis('elke pet heeft een afbeelding',r.zonder.length===0,r.zonder.join(', '));
await p.screenshot({path:'/tmp/claude-0/-home-user-OSRSCompanion/82568623-69e7-5bfc-9ec1-bf3f2fb623ae/scratchpad/t199.png'});
eis('geen scriptfouten',errs.length===0,errs.join('|'));
console.log(fouten?'\n'+fouten+' mislukt':'\nAlles gelukt');await b.close();process.exit(fouten?1:0)})()
