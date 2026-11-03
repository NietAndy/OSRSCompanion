const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const w of [1568,1920,1100]){const ctx=await b.newContext({viewport:{width:w,height:700}});
await ctx.addInitScript(()=>{window.osrsWin={titel(){},prijzen:async()=>({error:'x'}),discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:true,verplicht:false}),discordStatus:async()=>({id:'1',naam:'NietAndy'}),discordOpen(){},updateInfo:async()=>({})};localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1')});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(1500);await p.evaluate(()=>window.OSRSShell.go('nieuws'));await p.waitForTimeout(400);
await p.screenshot({path:__dirname+'/uit/bar'+w+'.png',clip:{x:0,y:0,width:w,height:70}});console.log(w,errs);await ctx.close()}
await b.close()})()
