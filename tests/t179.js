const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const mode of ['fout','leeg','lokaal']){const ctx=await b.newContext({viewport:{width:1440,height:800}});
await ctx.addInitScript((mode)=>{window.osrsWin={titel(){},prijzen:async(k)=>k==='reeks'?(mode==='fout'?{error:'De prijs-API reageerde niet (code 429).'}:{text:JSON.stringify({data:[]})}):{text:JSON.stringify({data:{"4151":{high:1420000,low:1400000}}})},discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};
localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');
if(mode==='lokaal'){const h=[];for(let i=0;i<10;i++)h.push({t:Date.now()-i*60000,v:1400000+i*5000});localStorage.setItem('osrs-gids-pm-hist',JSON.stringify({4151:h.reverse()}))}
localStorage.setItem('osrs-gids-prijsmeld',JSON.stringify({alerts:[{k:1,id:4151,n:'Abyssal whip',dir:'onder',p:1300000,basis:'mid',on:true}],every:1,auto:true,notif:false,snd:false,log:[]}))},mode);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(3000);await p.evaluate(()=>window.OSRSShell.go('prijsmeld'));await p.waitForTimeout(1500);
await p.screenshot({path:__dirname+'/uit/s179-'+mode+'.png'});console.log(mode,(await p.textContent('#pmList .pm-spark')).slice(0,140)||'[svg:'+await p.$$eval('#pmList .pm-spark svg',e=>e.length)+']',errs);await ctx.close()}
await b.close()})()
