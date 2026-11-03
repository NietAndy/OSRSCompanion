const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{const d=[];for(let i=0;i<48;i++)d.push({timestamp:1e9+i*3600,avgHighPrice:1560000-i*3000+(i%5)*9000,avgLowPrice:1540000-i*3000});
window.osrsWin={titel(){},updateCheck:async()=>({huidig:'0.5.20.1',nieuwste:'0.5.20.1'}),prijzen:async(k)=>k==='reeks'?{text:JSON.stringify({data:d})}:{text:JSON.stringify({data:{"4151":{high:1420000,low:1400000}}})},discordLogin:async()=>({}),discordInfo:async()=>({ingesteld:false})};
localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');
localStorage.setItem('osrs-gids-prijsmeld',JSON.stringify({alerts:[{k:1,id:4151,n:'Abyssal whip',dir:'onder',p:1300000,basis:'mid',on:true}],every:1,auto:true,notif:false,snd:false,log:[]}))});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(4000);
await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(1500);
await p.screenshot({path:__dirname+'/uit/home2.png'});console.log(errs);await b.close()})()
