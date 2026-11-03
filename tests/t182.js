const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({timezoneId:'Europe/Amsterdam'});
await ctx.addInitScript(()=>{localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({})}});
const p=await ctx.newPage();await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(()=>{const now=Math.floor(Date.now()/3600000)*3600;const data=[];for(let i=0;i<336;i++){const t=now-(336-i)*3600;const h=new Date(t*1000).getHours();const f=(h>=4&&h<=6)?-0.02:(h>=19&&h<=21)?0.02:0;const base=1400000*(1+f);data.push({timestamp:t,avgHighPrice:Math.round(base+4000),avgLowPrice:Math.round(base-4000)});}
const m=window.OSRSMoment(data);return {koop:m.koop,verk:m.verk,uren:m.uren.map(v=>Math.round(v*1000)/10)}})));await b.close()})()
