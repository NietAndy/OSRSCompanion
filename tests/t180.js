const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1300}});
await ctx.addInitScript(()=>{
 const now=Math.floor(Date.now()/1000);const data=[];for(let i=0;i<48;i++){const base=1400000+Math.sin(i/6)*30000+i*1500;data.push({timestamp:now-(48-i)*3600,avgHighPrice:Math.round(base+4000),avgLowPrice:Math.round(base-4000),highPriceVolume:300+i,lowPriceVolume:250});}
 window.__ic=[];
 window.osrsWin={titel(){},discordInfo:async()=>({ingesteld:false}),discordLogin:async()=>({}),
  icoon:async(n)=>{window.__ic.push(n);return {url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='}},
  prijzen:async(k,a)=>k==='reeks'?{text:JSON.stringify({data})}:{text:JSON.stringify({data:{"4151":{high:1406000,low:1398000}}})}};
 localStorage.setItem('osrs-gids-login','skip');localStorage.setItem('osrs-gids-tour','1');});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../app/index.html'));await p.waitForTimeout(2500);
await p.evaluate(()=>window.OSRSShell.go('ge'));await p.waitForTimeout(800);
await p.fill('#geSearch','Abyssal whip');await p.waitForTimeout(500);
await p.click('.gchart');await p.waitForTimeout(1500);
const t=await p.textContent('.pz');console.log(t.slice(0,600));
console.log('ic fallback',await p.evaluate(()=>{const i=document.createElement('div');i.innerHTML=window.OSRS_IC('Zzz item',24);document.body.appendChild(i);const im=i.firstChild;im.src='file:///nonexist.png';return new Promise(r=>setTimeout(()=>r([window.__ic,im.src.slice(0,20)]),800));}));
await p.locator('.gcw').screenshot({path:__dirname+'/uit/s180.png'});
console.log(errs);await b.close()})()
