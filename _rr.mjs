import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-TheAwakenedPath/51307a23-3c38-5c9e-a195-6418398cfd96/scratchpad';
const [,,W='1512',H='800',tag='rr']=process.argv;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await (await b.newContext({viewport:{width:+W,height:+H}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
p.on('console',m=>{if(m.type()==='error'&&!/razorpay|fonts\.google|ERR_|chirpy-voice/.test(m.text()))errs.push(m.text().slice(0,160));});
await p.addInitScript(()=>{localStorage.setItem('my-best-every-day',JSON.stringify({state:{onboarded:true,name:'Shaarav',avatarId:'sunny',points:22,pointsByBehaviour:{},completions:{}},version:0}));localStorage.setItem('mindgym.kidsv1.band',JSON.stringify({years:8}));});
await p.goto('http://localhost:5173/mindgymforkidsv1',{waitUntil:'networkidle'});
await p.waitForTimeout(2400);
for (const r of [/Skip welcome/i,/Skip/i]) { const btn=p.getByRole('button',{name:r}).first(); if(await btn.count() && await btn.isVisible().catch(()=>false)){ await btn.click().catch(()=>{}); await p.waitForTimeout(700);} }
const door=p.locator('[data-door="mindheart"]');
if(await door.count()){ await door.click({force:true}); await p.waitForTimeout(900); }
const play=p.getByRole('button',{name:/Play/i}).first();
if(await play.count()){ await play.click({force:true}); await p.waitForTimeout(2200); }
console.log('in room:', await p.locator('.rr-actions').count(), 'errs:', errs.length?errs.join(' | '):'none');
await p.screenshot({path:`${OUT}/${tag}.png`});
await b.close();
