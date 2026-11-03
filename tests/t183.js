const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1500},timezoneId:'Europe/Amsterdam'});
await ctx.addInitScript(()=>{
 const now=Math.floor(Date.now()/3600)*3600;const data=[];for(let i=0;i<336;i++){const t=now-(336-i)*3600;const h=new Date(t*1000).getHours();const f=(h>=4&&h<=6)?-0.02:(h>=19&&h<=21)?0.02:0;const base=1400000*(1+f);data.push({timestamp:t,avgHighPrice:Math.round(base+4000),avgLowPrice:Math.round(base-4000),highPriceVolume:300,lowPriceVolume:250});}
 window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),icoon:async()=>({error:'x'}),
  prijzen:async(k,a)=>k==='reeks'?{text:JSON.stringify({data})}:{text:JSON.stringify({data:{"4151":{high:1406000,low:1398000}}})}};
 localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');
 localStorage.setItem('osrs-gids-prijsmeld',JSON.stringify({alerts:[{k:1,id:4151,n:'Abyssal whip',dir:'onder',p:1300000,basis:'mid',on:true}],every:1,auto:true,notif:false,snd:false,log:[]}));});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.evaluate(()=>window.OSRSShell.go('home'));await p.waitForTimeout(2000);
await p.locator('.pm-home').screenshot({path:__dirname+'/uit/s183.png'});console.log('HOME:',await p.textContent('.pm-best'));
await p.evaluate(()=>window.OSRSShell.go('ge'));await p.waitForTimeout(800);
await p.fill('#geSearch','Abyssal whip');await p.waitForTimeout(500);
await p.click('.gchart');await p.waitForTimeout(2000);
console.log('GE:',(await p.textContent('.pz-mw')).slice(0,400));
await p.locator('.pz').screenshot({path:__dirname+'/uit/s181.png'});
console.log(errs);await b.close()})()
