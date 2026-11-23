// @ts-nocheck
/* eslint-disable */
/**
 * Mind Gym Daily — the adult daily session as one self-contained engine.
 *
 * Ported from the playable prototype that was tested screen by screen. It
 * builds its own DOM inside `root`, keeps a person's history on THIS device
 * (localStorage), and gets everything that needs the network from the host:
 *   guide(input)  -> structured guide JSON from /api/mind-guide (or null)
 *   reply(input)  -> a short follow-up sentence (or null)
 *   speak(text)   -> read aloud with the app's own voice
 *   onMore()      -> open the rest of the practice library
 * With no guide, it falls back to a careful built-in set, so it always works.
 * Speech input uses the browser's own recognition where it exists.
 *
 * Deliberately not React: it is a small state machine over a handful of
 * screens, and was verified as is. Mount with mountDailyPractice().
 */
export interface DailyOptions {
  guide?: (input: any) => Promise<any>;
  reply?: (input: any) => Promise<string | null>;
  speak?: (text: string) => void;
  onMore?: () => void;
  onBack?: () => void;
  /** The host app shows the back link and sound button in its own top bar. */
  hostControls?: boolean;
}

export function mountDailyPractice(root: HTMLElement, opts: DailyOptions = {}): () => void {
root.innerHTML='<main class="md-app"></main><div class="toast" role="status" hidden></div>';
const app=root.querySelector('.md-app');const toastEl=root.querySelector('.toast');
const KEY='mind-gym-daily-v2';
const dayKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
/* Three example stars so the sky isn't empty on first open; the sky is labelled as an example until the first real session. */
let S=load()||{stars:['clear','cloudy','foggy'],streak:3,lastDone:null,mission:null,missionDay:null,missionTried:{},history:[],example:true};
S.history=S.history||[];

/* ---------- adapters: the host app supplies the AI guide, voice and dictation ---------- */
let TTS=opts.speak||null;
let DICT=null;
const MIC={box:null,btn:null,live:null,on:false,rec:null};
const SR=(typeof window!=='undefined')&&(window.SpeechRecognition||window.webkitSpeechRecognition);
if(SR){DICT={
  start(box,live){const r=new SR();MIC.rec=r;r.lang=navigator.language||'en-IN';r.continuous=true;r.interimResults=true;const base=box.value.trim();
   r.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;t=t.replace(/\s+/g,' ').trim();box.value=base&&t?base+' '+t:base||t;box.dispatchEvent(new Event('input'));if(live)live.textContent=''};
   r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed')toast('Microphone is off. You can type instead.')};
   r.onend=()=>{MIC.on=false;MIC.rec=null;if(MIC.btn){MIC.btn.classList.remove('on');MIC.btn.lastChild.textContent='Speak instead'}};
   r.start();MIC.on=true;MIC.btn.classList.add('on');MIC.btn.lastChild.textContent='Listening\u2026 tap to stop'},
  stop(){try{MIC.rec&&MIC.rec.stop()}catch(e){}}
}}
function micFor(box){const wrap=h('<div style="display:flex;flex-direction:column;gap:6px"><button class="mic" type="button">'+ICON.mic+'<span>Speak instead</span></button><p class="live" aria-live="polite"></p></div>');const btn=wrap.querySelector('.mic'),live=wrap.querySelector('.live');btn.hidden=!DICT;
 btn.onclick=()=>{if(!DICT)return;if(MIC.on&&MIC.btn===btn){DICT.stop();return}if(MIC.on)DICT.stop();MIC.box=box;MIC.btn=btn;MIC.live=live;try{DICT.start(box,live)}catch(e){toast('Couldn\u2019t start listening. Try again, or type.')}};return wrap}
function remember(entry){S.history.unshift(entry);S.history=S.history.slice(0,20);save()}

/* ---------- sound ---------- */
const readSound=()=>{try{return localStorage.getItem('mg-daily-sound')!=='off'}catch(e){return true}};
let ac=null,soundOn=readSound();
const setSound=v=>{soundOn=v;try{localStorage.setItem('mg-daily-sound',v?'on':'off')}catch(e){}window.dispatchEvent(new CustomEvent('mg-daily-sound'))};
const onSoundEvt=()=>{soundOn=readSound()};window.addEventListener('mg-daily-sound',onSoundEvt);
function tone(f,d,type,g){if(!soundOn)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const t=ac.currentTime,o=ac.createOscillator(),v=ac.createGain();o.type=type||'sine';o.frequency.value=f;v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g||.07,t+.02);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(ac.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
const chime=()=>{tone(784,.6);setTimeout(()=>tone(1175,.8),110)};
const soft=()=>tone(330,.35,'triangle',.05);
const twinkle=()=>{[1047,1319,1568,2093].forEach((f,i)=>setTimeout(()=>tone(f,1.4,'sine',.04),i*160))};
const shredSound=()=>{if(!soundOn)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const len=ac.sampleRate*.7,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len)*.35;const s=ac.createBufferSource(),f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;s.buffer=buf;s.connect(f);f.connect(ac.destination);s.start()}catch(e){}};

/* ---------- helpers ---------- */
const h=(html)=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let toastT;function toast(m){const t=toastEl;t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},2600)}
const fmtDay=k=>{try{const d=new Date(k+'T12:00:00');const diff=Math.round((Date.now()-d)/864e5);return diff<=0?'today':diff===1?'yesterday':diff<7?diff+' days ago':d.toLocaleDateString(undefined,{day:'numeric',month:'short'})}catch(e){return k}};
const ICON={
 x:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 sound:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
 mute:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
 play:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
 star:'<svg width="20" height="20" viewBox="0 0 24 24" fill="#5A2414"><path d="M12 2l2.6 6.6L21 9.3l-5 4.3 1.6 6.8L12 16.9 6.4 20.4 8 13.6 3 9.3l6.4-.7z"/></svg>',
 breath:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8.5" stroke-dasharray="3 3"/></svg>',
 leaf:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-13 15-14-1 9-6 15-14 15"/><path d="M5 19l8-8"/></svg>',
 jar:'<svg width="38" height="38" viewBox="0 0 40 40" fill="none" stroke="#A9C2F5" stroke-width="2.2"><rect x="10" y="6" width="20" height="5" rx="2"/><path d="M11 11h18v20a4 4 0 01-4 4H15a4 4 0 01-4-4z"/><path d="M14 22h12" stroke-dasharray="2 3"/></svg>',
 cloud:'<svg width="42" height="38" viewBox="0 0 44 40" fill="none" stroke="#F3A28E" stroke-width="2.2" stroke-linejoin="round"><path d="M12 30h22a7 7 0 000-14 10 10 0 00-19-2 8 8 0 00-3 16z"/></svg>',
 mic:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
 speaker:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7"/></svg>'
};
const WX={
 clear:{label:'Clear',sub:'Light and steady',color:'#F5C46B',line:'Lovely. Let’s train while it’s easy, so it’s there when it’s hard.',svg:'<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="6.5"/><path d="M20 5v4M20 31v4M5 20h4M31 20h4M9.4 9.4l2.8 2.8M27.8 27.8l2.8 2.8M9.4 30.6l2.8-2.8M27.8 12.2l2.8-2.8"/></svg>'},
 cloudy:{label:'Cloudy',sub:'A bit heavy',color:'#A9C2F5',line:'Thanks for noticing. A few gentle minutes can lift the edge off.',svg:'<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 29h17a6 6 0 000-12 8.5 8.5 0 00-16-1.5A7 7 0 0012 29z"/></svg>'},
 foggy:{label:'Foggy',sub:'Scattered, busy',color:'#B9C1DA',line:'Busy minds benefit the most. Let’s clear a little space.',svg:'<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14h20M12 20h22M6 26h22M14 32h16"/></svg>'},
 stormy:{label:'Stormy',sub:'Upset or anxious',color:'#F3A28E',line:'You showed up anyway. That matters. We’ll go slowly.',svg:'<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 25h17a6 6 0 000-12 8.5 8.5 0 00-16-1.5A7 7 0 0012 25z"/><path d="M21 25l-4 6h5l-3 5"/></svg>'}
};

/* ---------- today's learning (used when someone is all good, and as the fallback) ---------- */
const SORT=[
 {text:'My friend hasn’t replied for two days.',kind:'fact',why:'That’s what the screen shows. The reason isn’t known yet.'},
 {text:'She must be upset with me.',kind:'story',why:'A guess about her mind. There are a dozen other reasons.'},
 {text:'I said “um” four times in the meeting.',kind:'fact',why:'A recording would show exactly that.'},
 {text:'They all think I’m not good enough.',kind:'story',why:'Nobody can see inside every mind. That’s the story layer.'},
 {text:'The deadline moved to Thursday.',kind:'fact',why:'A date in a calendar. Pure fact.'},
 {text:'If I get this wrong, everything falls apart.',kind:'story',why:'A prediction dressed up as a certainty.'}
];
const STREAM=['I’m behind on everything','What if they say no?','I should have said something','Why did I say that?','Not good enough yet','Too much to do','They didn’t invite me','What if I fail?'];
const REFRAME={parts:[{t:'I',fixed:true},{t:'always',opts:['sometimes','today'],why:'<b>All-or-nothing words</b> like “always” and “never” make one moment feel like your whole life.'},{t:'mess things up',opts:['make mistakes','get some things wrong'],why:'<b>Labels</b> hit harder than descriptions. Describe what happened instead.'},{t:'at work',fixed:true}],endings:['and I’m learning from them.','like everyone does.','and I can fix this one.']};
const MISSIONS=['Next time your mind tells a story about someone, quietly say to yourself: “that’s a story.”','Before you reply to one message today, take one slow breath first.','Catch one “always” or “never” in your head today and swap it for “sometimes.”'];

/* ---------- the guide: Claude when available, a careful fallback otherwise ---------- */
const PATTERNS=[[/\b(should|must|have to|ought)\b/i,'Should statements','Rules for yourself that turn every slip into failure.'],[/\b(always|never|everyone|nobody|everything|nothing)\b/i,'All-or-nothing','One moment gets stretched into “every time”.'],[/\b(they think|she thinks|he thinks|must think|judg|hate me|upset with me|annoyed)\b/i,'Mind reading','Guessing what others think, then treating the guess as fact.'],[/\b(what if|going to fail|will go wrong|disaster|ruin)\b/i,'Fortune telling','Predicting the worst ending before it has happened.'],[/\b(compar|better than me|than everyone|behind everyone)\b/i,'Comparison','Measuring your inside against someone else’s outside.'],[/\b(stupid|useless|failure|idiot|not good enough|loser)\b/i,'Labelling','A whole-person verdict from one moment.']];
function fallbackGuide(topic,weather){const m=PATTERNS.find(p=>p[0].test(topic))||[null,'Overthinking loop','The mind replays the same worry, hoping to solve it by going round again.'];
 const first=(topic.split(/[.!?\n]/)[0]||topic).trim().slice(0,90);
 return {crisis:/\b(kill myself|end my life|suicid|hurt myself|self.harm|don.t want to live)\b/i.test(topic),reflection:'That sounds like a lot to carry. Thank you for putting it into words — that alone takes some of its power away.',pattern:{name:m[1],explain:m[2]},question:'If a close friend told you this, what would you gently say to them?',
  cards:SORT.slice(0,4),streamThoughts:STREAM.slice(0,4),harsh:first||'I’m not handling this well.',rewrites:['This is hard, and I’m doing my best with it.','One difficult moment isn’t the whole story of me.','I can take one small step on this today.'],missions:MISSIONS.slice(0,2)}}
async function askGuide(topic,weather,followUp){
 if(!opts.guide)return fallbackGuide(topic,weather);
 try{const r=await opts.guide({topic,weather,followUp,history:S.history.slice(0,6).map(e=>({date:e.date,topic:e.topic,pattern:e.pattern,rewrite:e.rewrite,mission:e.mission,feeling:e.feeling,tried:S.missionTried[e.date]||''}))});
  if(!r)throw 0;if(r.crisis)return Object.assign(fallbackGuide(topic,weather),{crisis:true});
  const fb=fallbackGuide(topic,weather);['streamThoughts','rewrites','missions'].forEach(k=>{if(!Array.isArray(r[k])||!r[k].length)r[k]=fb[k]});r.pattern=r.pattern&&r.pattern.name?r.pattern:fb.pattern;r.harsh=r.harsh||fb.harsh;r.question=r.question||fb.question;r.ai=true;return r}
 catch(e){return fallbackGuide(topic,weather)}}

/* ---------- session flow ---------- */
let run=null;
function startRun(only){run={only:only||null,i:0,mode:null,weather:'clear',topic:'',followUp:null,guide:null,guideP:null,sortOk:0,sortN:0,letGo:0,reframe:null,mission:null,steps:only?[only]:['checkin','share']};go()}
function setPath(mode){run.mode=mode;run.steps=mode==='personal'?['checkin','share','guide','breathe','sort','shred','rewrite','mission']:['checkin','share','breathe','sort','stream','reframe','mission']}
function go(){if(MIC.on&&DICT)DICT.stop();const id=run.steps[run.i];app.innerHTML='';app.appendChild(SCREENS[id]());scrollTo(0,0)}
function next(){run.i++;if(run.i>=run.steps.length){if(run.only){toast(run.only==='breathe'?'Nicely done. Come back any time.':'Lighter already.');home()}else finish()}else go()}
function topBar(){const n=run.mode?run.steps.length:8;const bar=run.only?'<div class="spacer"></div>':'<div class="bar" aria-hidden="true">'+Array.from({length:n},(_,k)=>'<i class="'+(k<=run.i?'on':'')+'"></i>').join('')+'</div>';
 const el=h('<div class="top"><button class="iconbtn" aria-label="Leave and go home">'+ICON.x+'</button>'+bar+'<button class="iconbtn" aria-label="Sound on or off">'+(soundOn?ICON.sound:ICON.mute)+'</button></div>');
 el.children[0].onclick=home;el.lastElementChild.onclick=e=>{setSound(!soundOn);e.currentTarget.innerHTML=soundOn?ICON.sound:ICON.mute;if(soundOn)chime()};return el}
const SCREENS={};

SCREENS.checkin=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 s.appendChild(h('<div><p class="eyebrow">Notice</p><h2>What’s the weather in your mind?</h2><p class="lede">No right answer. Just notice.</p></div>'));
 const g=h('<div class="weather" role="group" aria-label="Mind weather"></div>');const reply=h('<p class="reply"></p>');const cta=h('<button class="cta" disabled>Continue</button>');
 Object.keys(WX).forEach(k=>{const w=WX[k];const b=h('<button class="wx" aria-pressed="false">'+w.svg+'<b>'+w.label+'</b><span>'+w.sub+'</span></button>');b.onclick=()=>{g.querySelectorAll('.wx').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');run.weather=k;reply.textContent=w.line;cta.disabled=false;soft()};g.appendChild(b)});
 cta.onclick=next;s.append(g,reply,h('<div class="spacer"></div>'),cta);return s};

SCREENS.share=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 s.appendChild(h('<div><p class="eyebrow">Your space</p><h2>What’s on your mind today?</h2><p class="lede">The thought that keeps coming back. Type it or say it, the way you’d tell a friend.</p></div>'));
 const last=S.history.find(e=>e.topic);
 if(last){const m=h('<div class="memory"><p style="font-size:15px">Last time ('+fmtDay(last.date)+') you talked about <b></b>. How is that now?</p><div class="trio"><button aria-pressed="false">Better</button><button aria-pressed="false">The same</button><button aria-pressed="false">Harder</button></div></div>');m.querySelector('b').textContent='“'+last.topic+'”';
  m.querySelectorAll('.trio button').forEach(b=>b.onclick=()=>{m.querySelectorAll('.trio button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');run.followUp=b.textContent.toLowerCase();soft();if(run.followUp==='better')toast('That’s your practice working.')});s.appendChild(m)}
 const ta=h('<textarea class="box" id="share-text" aria-label="What is on your mind" placeholder="e.g. My manager went quiet after my presentation and I keep thinking I’ve messed up."></textarea>');
 const chips=h('<div class="chips" aria-label="Or start from a topic"></div>');['Work pressure','A relationship','Self-doubt','Worry about the future','Comparing myself','Feeling stuck'].forEach(c=>{const b=h('<button class="chip"></button>');b.textContent=c;b.onclick=()=>{ta.value=(ta.value?ta.value+' ':'')+c+': ';ta.focus();cta.disabled=false;soft()};chips.appendChild(b)});
 const cta=h('<button class="cta" disabled>Help me with this</button>');ta.oninput=()=>{cta.disabled=ta.value.trim().length<3};
 cta.onclick=()=>{run.topic=ta.value.trim();setPath('personal');run.guideP=askGuide(run.topic,WX[run.weather].label,run.followUp);chime();next()};
 const good=h('<button class="ghost">Nothing specific — you choose for me</button>');good.onclick=()=>{setPath('learning');soft();next()};
 s.append(ta,micFor(ta),chips,h('<p class="note">Your words are sent securely to shape today’s practice around you. Your history stays on this device only.</p>'),h('<div class="spacer"></div>'),cta,good);return s};

SCREENS.guide=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 s.appendChild(h('<div><p class="eyebrow">Your guide</p><h2>Let’s look at it together</h2></div>'));
 const you=h('<div class="guide" style="justify-content:flex-end"><div class="bubble2 you"></div></div>');you.firstElementChild.textContent=run.topic;s.appendChild(you);
 const g=h('<div class="guide"><div class="avatar" aria-hidden="true">'+ICON.star+'</div><div class="bubble2"><span class="dots" aria-label="Your guide is reading"><i></i><i></i><i></i></span></div></div>');s.appendChild(g);
 const tail=h('<div style="display:flex;flex-direction:column;gap:12px"></div>');s.appendChild(tail);
 const cta=h('<button class="cta" hidden>Let’s work on it</button>');cta.onclick=next;s.append(h('<div class="spacer"></div>'),cta);
 run.guideP.then(G=>{run.guide=G;const b=g.querySelector('.bubble2');
  if(G.crisis){b.innerHTML='';b.append(h('<p>I’m really glad you told me. What you’re feeling matters, and you deserve support from a real person right now.</p>'));
   tail.appendChild(h('<div class="help"><p class="eyebrow" style="color:var(--rose)">Talk to someone now</p><p>Tele-MANAS (India), free, any time:</p><p class="num">14416</p><p class="muted" style="font-size:14px">or 1-800-891-4416. If you are in immediate danger, call <b style="color:var(--mist)">112</b>. Outside India, contact your local emergency number.</p></div>'));
   cta.textContent='Breathe with me for a minute';cta.hidden=false;run.steps=['checkin','share','guide','breathe'];return}
  b.innerHTML='';const p=h('<p></p>');p.textContent=G.reflection;b.appendChild(p);
  const pat=h('<div style="margin-top:12px"><span class="pattern"></span><p class="muted" style="font-size:14px;margin-top:6px"></p></div>');pat.querySelector('.pattern').textContent='Pattern: '+G.pattern.name;pat.querySelector('p').textContent=G.pattern.explain;b.appendChild(pat);
  const q=h('<p style="margin-top:12px;font-weight:700"></p>');q.textContent=G.question;b.appendChild(q);
  if(TTS){const l=h('<button class="chip" style="margin-top:12px;display:inline-flex;gap:6px;align-items:center">'+ICON.speaker+' Listen</button>');l.onclick=()=>{TTS(G.reflection+' '+G.question)};b.appendChild(l)}
  const ans=h('<textarea class="box" id="guide-answer" style="min-height:80px" aria-label="Your answer" placeholder="Answer in a line, if you like"></textarea>');
  const send=h('<button class="ghost">Send</button>');const skip=h('<button class="ghost" style="border:0;color:var(--mist-2);min-height:40px">Skip to the exercises</button>');
  skip.onclick=next;
  send.onclick=async()=>{const a=ans.value.trim();if(!a){ans.focus();return}send.disabled=true;ans.disabled=true;skip.hidden=true;if(MIC.on&&DICT)DICT.stop();am.remove();const yb=h('<div class="guide" style="justify-content:flex-end"><div class="bubble2 you"></div></div>');yb.firstElementChild.textContent=a;tail.insertBefore(yb,ans);ans.remove();send.remove();
   const rb=h('<div class="guide"><div class="avatar" aria-hidden="true">'+ICON.star+'</div><div class="bubble2"><span class="dots"><i></i><i></i><i></i></span></div></div>');tail.appendChild(rb);const out=rb.querySelector('.bubble2');
   const fallback='That’s a wise answer. Notice how much kinder it is than what your mind was telling you. Let’s train that voice now.';
   if(opts.reply){try{const t=await opts.reply({topic:run.topic,reflection:G.reflection,question:G.question,pattern:G.pattern.name,answer:a});out.textContent=t||fallback}catch(e){out.textContent=fallback}}else out.textContent=fallback;
   cta.hidden=false;chime()};
  const am=micFor(ans);tail.append(ans,am,send,skip);cta.hidden=true;
  const showCta=()=>{cta.hidden=false};skip.addEventListener('click',showCta)});
 return s};

SCREENS.breathe=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 s.appendChild(h('<div><p class="eyebrow">Paced breathing</p><h2>Three slow breaths</h2><p class="lede">In for four, out for six.</p></div>'));
 const wrap=h('<div class="orbwrap"><svg viewBox="0 0 250 250"><circle cx="125" cy="125" r="117" fill="none" stroke="#E1DDEA" stroke-width="8"/><circle class="ring" cx="125" cy="125" r="117" fill="none" stroke="#C25B3F" stroke-width="8" stroke-linecap="round" stroke-dasharray="735" stroke-dashoffset="735" transform="rotate(-90 125 125)" style="transition:stroke-dashoffset .6s"/></svg><div class="orb"><b>4</b></div></div>');
 const phase=h('<p class="phase">Tap start when ready</p>');const cta=h('<button class="cta">'+ICON.play+' Start</button>');s.append(wrap,phase,h('<div class="spacer"></div>'),cta);
 let timer=null,rounds=0,started=false;const orb=wrap.querySelector('.orb'),num=orb.querySelector('b'),ring=wrap.querySelector('.ring');
 function count(n,cb){num.textContent=n;let k=n;timer=setInterval(()=>{k--;if(k<=0){clearInterval(timer);cb()}else num.textContent=k},1000)}
 function cycle(){if(!s.isConnected)return;phase.textContent='Breathe in';orb.style.transitionDuration='4s';orb.style.transform='scale(1)';tone(392,3.8,'sine',.03);
  count(4,()=>{phase.textContent='Breathe out';orb.style.transitionDuration='6s';orb.style.transform='scale(.62)';tone(294,5.8,'sine',.03);
   count(6,()=>{rounds++;ring.style.strokeDashoffset=String(735-735*rounds/3);if(rounds<3)cycle();else{phase.textContent='Settled.';num.textContent='✓';chime();cta.disabled=false;cta.textContent='Continue';cta.onclick=next}})})}
 cta.onclick=()=>{if(started)return;started=true;cta.disabled=true;cta.textContent='Breathing…';cycle()};
 const skip=h('<button class="ghost">I’m settled, skip</button>');skip.onclick=()=>{clearInterval(timer);next()};s.appendChild(skip);s.appendChild(h('<p class="whyline"><b>Why it works.</b> A longer exhale than inhale slows the heart rate and shifts the body towards its calming (parasympathetic) state.</p>'));return s};

SCREENS.sort=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 const cards=(run.guide&&run.guide.cards)||SORT;run.sortN=cards.length;
 s.appendChild(h('<div><p class="eyebrow">Cognitive reframing</p><h2>Fact, or interpretation?</h2><p class="lede">'+(run.mode==='personal'?'These come from what you shared. ':'')+'Drag up if it’s an interpretation, down if it’s a fact a camera would record.</p></div>'));
 const field=h('<div class="field"><div class="bin" data-k="story">'+ICON.cloud+'<div><b>Interpretation</b><br><span>What the mind adds</span></div></div><div class="tcard" tabindex="0"><small>Thought 1 of '+cards.length+'</small><span class="tx"></span></div><div class="bin" data-k="fact">'+ICON.jar+'<div><b>Fact</b><br><span>What a camera would record</span></div></div></div>');
 const pair=h('<div class="pair"><button data-k="story">Interpretation</button><button data-k="fact">Fact</button></div>');
 const nextBtn=h('<button class="cta" hidden>Next thought</button>');const pips=h('<div class="pips" aria-hidden="true">'+cards.map(()=>'<i></i>').join('')+'</div>');
 s.append(field,pair,nextBtn,pips,h('<p class="whyline"><b>Why it works.</b> Separating what happened from what the mind adds is the core skill of cognitive behavioural therapy (CBT).</p>'));
 const card=field.querySelector('.tcard'),bins=[...field.querySelectorAll('.bin')];let i=0,locked=false;
 function show(){card.className='tcard';card.innerHTML='<small>Thought '+(i+1)+' of '+cards.length+'</small><span class="tx"></span>';card.querySelector('.tx').textContent=cards[i].text;card.style.transform='none';pair.hidden=false;nextBtn.hidden=true;locked=false}
 function judge(k){if(locked||i>=cards.length)return;locked=true;const c=cards[i],ok=k===c.kind;if(ok)run.sortOk++;pips.children[i].className=ok?'ok':'no';
  card.style.transform='none';card.classList.add(ok?'ok':'no');const v=h('<span class="verdict"></span>');v.innerHTML='<b style="color:'+(ok?'#16694F':'#A23D27')+'">'+(ok?'Correct — '+(c.kind==='fact'?'a fact':'an interpretation')+'.':'This one is '+(c.kind==='fact'?'a fact':'an interpretation')+'.')+'</b> ';v.appendChild(document.createTextNode(c.why||''));card.appendChild(v);
  ok?chime():soft();pair.hidden=true;nextBtn.hidden=false;nextBtn.textContent=i<cards.length-1?'Next thought':'Continue';nextBtn.focus()}
 nextBtn.onclick=()=>{i++;if(i<cards.length)show();else next()};
 pair.querySelectorAll('button').forEach(b=>b.onclick=()=>judge(b.dataset.k));
 let sy=0,sx=0,drag=false;
 card.addEventListener('pointerdown',e=>{if(locked)return;drag=true;sy=e.clientY;sx=e.clientX;card.classList.add('drag');card.setPointerCapture(e.pointerId)});
 card.addEventListener('pointermove',e=>{if(!drag)return;const dy=e.clientY-sy,dx=e.clientX-sx;card.style.transform='translate('+dx*.3+'px,'+dy+'px) rotate('+dx*.04+'deg)';const r=card.getBoundingClientRect();bins.forEach(b=>{const q=b.getBoundingClientRect();b.classList.toggle('hot',r.bottom>q.top+10&&r.top<q.bottom-10)})});
 const end=()=>{if(!drag)return;drag=false;card.classList.remove('drag');const hot=bins.find(b=>b.classList.contains('hot'));bins.forEach(b=>b.classList.remove('hot'));if(hot)judge(hot.dataset.k);else card.style.transform='none'};
 card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
 card.addEventListener('keydown',e=>{if(e.key==='ArrowUp')judge('story');if(e.key==='ArrowDown')judge('fact')});
 show();return s};

SCREENS.stream=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 const list=(run.guide&&run.guide.streamThoughts)||STREAM;
 s.appendChild(h('<div><p class="eyebrow">Defusion</p><h2>Leaves on the stream</h2><p class="lede">Press and hold a thought until it settles on a leaf. Then let it float away. You don’t have to argue with it.</p></div>'));
 const river=h('<div class="river" aria-label="A stream with thoughts floating by"></div>');const cnt=h('<div class="count"><span class="muted">Thoughts let go</span><b>0</b></div>');
 const cta=h('<button class="cta" disabled>Let go of 4 to continue</button>');cta.onclick=()=>{clearInterval(spawnT);next()};s.append(river,cnt,h('<p class="whyline"><b>Why it works.</b> From acceptance and commitment therapy (ACT): you watch a thought pass instead of arguing with it or obeying it.</p>'),h('<div class="spacer"></div>'),cta);
 let k=0,n=0,spawnT=null;
 function spawn(){if(!river.isConnected){if(spawnT)clearInterval(spawnT);return}const b=h('<div class="bubble" role="button" tabindex="0"></div>');b.textContent=list[k++%list.length];b.style.top=(14+Math.random()*230)+'px';river.appendChild(b);
  const w=river.clientWidth,dur=11000+Math.random()*4000,t0=performance.now();let held=false,raf;
  const move=t=>{if(!b.isConnected)return;if(!held){const p=(t-t0)/dur;b.style.transform='translateX('+(-b.offsetWidth+(w+b.offsetWidth)*p)+'px)';if(p>=1){b.remove();return}}raf=requestAnimationFrame(move)};raf=requestAnimationFrame(move);
  let ht=null;const start=e=>{if(b.classList.contains('leaf'))return;e.preventDefault();held=true;const h0=performance.now();ht=setInterval(()=>{const hold=Math.min(1,(performance.now()-h0)/800);b.style.setProperty('--p',(hold*360)+'deg');if(hold>=1){clearInterval(ht);release()}},30)};
  const stop=()=>{if(b.classList.contains('leaf'))return;clearInterval(ht);held=false;b.style.setProperty('--p','0deg')};
  function release(){cancelAnimationFrame(raf);b.classList.add('leaf');const cur=b.style.transform;b.style.transform=cur+' translate(90px,40px) rotate(9deg)';b.style.opacity='0';n++;cnt.querySelector('b').textContent=n;chime();if(n>=4){cta.disabled=false;cta.textContent='Continue'}run.letGo=n;setTimeout(()=>b.remove(),3300)}
  b.addEventListener('pointerdown',start);b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop);
  b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();release()}})}
 setTimeout(spawn,60);spawnT=setInterval(spawn,2300);return s};

SCREENS.shred=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 const harsh=(run.guide&&run.guide.harsh)||'I’m not good enough.';
 s.appendChild(h('<div><p class="eyebrow">Release</p><h2>Discard the thought</h2><p class="lede">This thought has had enough of your attention. Drag it down into the shredder.</p></div>'));
 const zone=h('<div class="shredzone"><div class="paper" tabindex="0" aria-label="Your harsh thought. Drag it into the shredder, or press Enter."></div><div class="shredder">Drop it here</div></div>');
 const paper=zone.querySelector('.paper');paper.textContent='“'+harsh+'”';
 const msg=h('<p class="reply" aria-live="polite"></p>');const btn=h('<button class="ghost">Shred it for me</button>');const cta=h('<button class="cta" hidden>Continue</button>');cta.onclick=next;
 s.append(zone,msg,h('<p class="whyline"><b>Why it works.</b> In studies at Ohio State University, people who physically threw away a written thought relied on it less afterwards.</p>'),h('<div class="spacer"></div>'),btn,cta);
 let sy=0,drag=false,done=false;
 function shred(){if(done)return;done=true;btn.hidden=true;shredSound();const zr=zone.getBoundingClientRect(),sh=zone.querySelector('.shredder').getBoundingClientRect();const slotY=sh.top-zr.top+16;
  paper.style.transition='transform 1.1s ease-in,clip-path 1.1s ease-in';paper.style.transform='translateY('+(slotY-10)+'px)';paper.style.clipPath='inset(0 0 100% 0)';
  setTimeout(()=>{for(let k=0;k<14;k++){const st=h('<div class="strip"></div>');const x=14+k*((zr.width-60)/14);st.style.left=x+'px';st.style.top=(slotY+40)+'px';st.style.height=(30+Math.random()*30)+'px';zone.appendChild(st);st.animate([{transform:'translateY(0) rotate(0)',opacity:1},{transform:'translateY('+(40+Math.random()*40)+'px) rotate('+(Math.random()*60-30)+'deg)',opacity:0}],{duration:1200+Math.random()*500,easing:'ease-in',fill:'forwards'})}
   for(let k=0;k<18;k++){const sp=h('<div class="spark"></div>');sp.style.left=(zr.width/2+Math.random()*120-60)+'px';sp.style.top=slotY+'px';zone.appendChild(sp);sp.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+(Math.random()*240-120)+'px,'+(-140-Math.random()*160)+'px) scale(.3)',opacity:0}],{duration:1400+Math.random()*700,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'})}
   twinkle();msg.textContent='Gone. You decide which thoughts get to stay.';cta.hidden=false},900)}
 btn.onclick=shred;paper.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();shred()}});
 paper.addEventListener('pointerdown',e=>{if(done)return;drag=true;sy=e.clientY;paper.classList.add('drag');paper.setPointerCapture(e.pointerId)});
 paper.addEventListener('pointermove',e=>{if(!drag)return;const dy=Math.max(0,e.clientY-sy);paper.style.transform='translateY('+dy+'px) rotate('+(dy*.02)+'deg)'});
 const end=e=>{if(!drag)return;drag=false;paper.classList.remove('drag');const dy=e.clientY-sy;if(dy>120)shred();else{paper.style.transition='transform .35s';paper.style.transform='none';setTimeout(()=>paper.style.transition='',360)}};
 paper.addEventListener('pointerup',end);paper.addEventListener('pointercancel',end);return s};

SCREENS.rewrite=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());const G=run.guide||fallbackGuide(run.topic,'');
 s.appendChild(h('<div><p class="eyebrow">Self-compassion</p><h2>Say it in a way that’s true and kind</h2></div>'));
 const before=h('<p class="before"></p>');before.textContent=G.harsh;s.appendChild(before);
 const opts=h('<div class="opts" role="group" aria-label="Kinder versions"></div>');const cta=h('<button class="cta" disabled>This is my sentence</button>');
 const own=h('<textarea class="box" id="own-rewrite" style="min-height:80px" aria-label="Write your own kinder sentence" placeholder="Or write your own kinder version"></textarea>');
 let pick=null;G.rewrites.forEach(r=>{const b=h('<button class="opt" aria-pressed="false"></button>');b.textContent=r;b.onclick=()=>{opts.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');pick=r;own.value='';cta.disabled=false;chime()};opts.appendChild(b)});
 own.oninput=()=>{if(own.value.trim()){pick=own.value.trim();opts.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-pressed','false'));cta.disabled=false}else{pick=null;cta.disabled=true}};
 const confirmBox=h('<div style="display:flex;flex-direction:column;gap:12px"><div class="panel"><p class="eyebrow" style="color:var(--sky)">Read it once, slowly</p><p class="sentence" style="font-size:22px;margin-top:6px"></p></div><button class="cta">Continue</button></div>');
 confirmBox.querySelector('.cta').onclick=next;
 cta.onclick=()=>{run.reframe=pick;confirmBox.querySelector('.sentence').textContent='“'+pick+'”';opts.querySelectorAll('.opt').forEach(x=>x.disabled=true);own.disabled=true;twinkle();cta.replaceWith(confirmBox)};
 s.append(opts,own,h('<p class="whyline"><b>Why it works.</b> Research on self-compassion links a kinder inner voice to more resilience and steadier motivation, not less drive.</p>'),h('<div class="spacer"></div>'),cta);return s};

SCREENS.reframe=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 s.appendChild(h('<div><p class="eyebrow">Self-compassion</p><h2>Speak to yourself like a friend</h2><p class="lede">Tap each glowing word and choose something truer.</p></div>'));
 const box=h('<div class="panel"><p class="sentence"></p></div>');const sent=box.firstElementChild;const why=h('<p class="why" hidden></p>');const opts=h('<div class="opts" aria-live="polite"></div>');
 const cta=h('<button class="cta" hidden>Continue</button>');cta.onclick=next;const chosen=REFRAME.parts.map(p=>p.fixed?p.t:null);let ending=null;
 function render(){sent.innerHTML='';REFRAME.parts.forEach((p,i)=>{if(p.fixed){sent.append(p.t+' ');return}const w=h('<button class="word'+(chosen[i]?' fixed':'')+'"></button>');w.textContent=chosen[i]||p.t;w.onclick=()=>pick(i);sent.append(w,' ')});
  if(ending){const e=h('<span style="color:var(--mint)"></span>');e.textContent=ending;sent.append(e)}else sent.append('…');
  const done=REFRAME.parts.every((p,i)=>p.fixed||chosen[i]);
  if(done&&!ending){opts.innerHTML='<p class="muted" style="font-size:14px">Last step: finish it kindly.</p>';REFRAME.endings.forEach(e=>{const o=h('<button class="opt"></button>');o.textContent='…'+e;o.onclick=()=>{ending=e;twinkle();render()};opts.appendChild(o)})}
  if(ending){opts.innerHTML='';why.hidden=false;why.innerHTML='<b>Before:</b> <span class="before">I always mess things up at work.</span><br>Read your new sentence once, slowly. That’s the rep.';cta.hidden=false;run.reframe=sent.textContent.trim()}}
 function pick(i){const p=REFRAME.parts[i];why.hidden=false;why.innerHTML=p.why;opts.innerHTML='';p.opts.forEach(o=>{const b=h('<button class="opt"></button>');b.textContent=o;b.onclick=()=>{chosen[i]=o;chime();opts.innerHTML='';render()};opts.appendChild(b)})}
 render();s.append(box,why,opts,h('<div class="spacer"></div>'),cta);return s};

SCREENS.mission=()=>{const s=h('<section class="screen"></section>');s.appendChild(topBar());
 const list=(run.guide&&run.guide.missions&&run.guide.missions.length?run.guide.missions:MISSIONS);let m=0;
 s.appendChild(h('<div><p class="eyebrow">Practice in real life</p><h2>One small commitment</h2><p class="lede">Change happens out there, one repetition at a time.</p></div>'));
 const box=h('<div class="mission"><p class="eyebrow">'+(run.mode==='personal'?'Made for what you shared':'Today’s mission')+'</p><p class="big"></p></div>');const big=box.querySelector('.big');big.textContent=list[0];
 const other=h('<button class="ghost">Show me a different one</button>');other.onclick=()=>{m=(m+1)%list.length;big.textContent=list[m];soft()};
 const cta=h('<button class="cta">I’ll try it</button>');cta.onclick=()=>{run.mission=list[m];S.mission=list[m];S.missionDay=dayKey();next()};
 s.append(box,list.length>1?other:h('<span></span>'),h('<div class="spacer"></div>'),cta);return s};

/* ---------- reward: a new star ---------- */
/* Seven steps from the valley to the summit; the eighth session starts the next ascent. */
const PATH=[[46,178],[92,166],[132,170],[170,150],[204,128],[238,104],[268,78]];
const SUMMIT=[292,52];
const ASCENTS=['The Foothills','The Ridge','The High Pass','The Summit'];
function skyEl(igniteLast){const n=S.stars.length,ch=Math.floor((n-1)/7),inCh=n-ch*7;
 let svg='<svg viewBox="0 0 360 200" role="img" aria-label="Your path: day '+n+', step '+inCh+' of 7 on '+ASCENTS[ch%4]+'">'
 +'<defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9D3EA"/><stop offset="1" stop-color="#F6DDD0"/></linearGradient></defs>'
 +'<rect width="360" height="200" fill="url(#dawn)"/><circle cx="300" cy="44" r="18" fill="#F2B48F" opacity=".9"/>'
 +'<path d="M0 200 L70 92 L120 140 L190 58 L250 120 L292 52 L360 120 L360 200Z" fill="#B7B1CF"/>'
 +'<path d="M0 200 L40 150 L96 176 L150 128 L214 160 L270 112 L360 168 L360 200Z" fill="#8F89B0"/>'
 +'<path d="M0 200 L0 182 L80 170 L150 184 L230 168 L300 178 L360 170 L360 200Z" fill="#6E6992"/>'
 +'<path d="M286 52 L286 30" stroke="#25233A" stroke-width="2"/><path d="M286 30 L302 36 L286 42Z" fill="'+(inCh===7?'#C25B3F':'#FFFFFF')+'"/>';
 let d='M'+PATH[0][0]+' '+PATH[0][1];for(let k=1;k<PATH.length;k++)d+=' L'+PATH[k][0]+' '+PATH[k][1];d+=' L'+SUMMIT[0]+' '+SUMMIT[1];
 svg+='<path d="'+d+'" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-dasharray="4 5" stroke-linecap="round" opacity=".9"/>';
 for(let k=1;k<inCh;k++){const a=PATH[k-1],b=PATH[k];svg+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#C25B3F" stroke-width="3" stroke-linecap="round" class="'+(igniteLast&&k===inCh-1?'drawline':'')+'"/>'}
 PATH.forEach((p,k)=>{const done=k<inCh,isNew=igniteLast&&k===inCh-1;
  svg+=done?'<g class="star-on'+(isNew?' ignite':'')+'"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#C25B3F"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="#FFFFFF"/></g>'
   :(k===inCh?'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="7" fill="#FFFFFF" stroke="#C25B3F" stroke-width="2.5"/>':'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#FFFFFF" opacity=".85"/>')});
 svg+='</svg>';return h('<div class="skycard"><span class="tag">'+(S.example?'Example path':'Your path \u00b7 day '+n)+'</span>'+svg+'<span class="tag2">'+ASCENTS[ch%4]+' \u00b7 step '+inCh+' of 7</span></div>')}
function finish(){const first=S.lastDone!==dayKey();if(first){if(S.example){S.example=false;S.stars=[];S.streak=0}S.stars.push(run.weather||'clear');S.streak=(S.streak||0)+1;S.lastDone=dayKey()}
 remember({date:dayKey(),weather:run.weather,topic:run.mode==='personal'?run.topic.slice(0,70):'',pattern:run.guide?run.guide.pattern.name:'',rewrite:run.reframe||'',mission:run.mission||'',feeling:run.followUp||''});save();
 const s=h('<section class="screen"></section>');const n=S.stars.length,inCh=n-Math.floor((n-1)/7)*7;
 s.appendChild(h('<div style="text-align:center;padding-top:10px"><p class="eyebrow">Session complete</p><h1 style="margin-top:6px">'+(inCh===7?'You reached the top of '+ASCENTS[Math.floor((n-1)/7)%4]+'.':'One step higher.')+'</h1></div>'));
 s.appendChild(skyEl(true));
 s.appendChild(h('<div class="stats"><div class="stat"><b>'+S.streak+'</b><span>days in a row</span></div><div class="stat"><b>'+run.sortOk+'/'+(run.sortN||0)+'</b><span>stories spotted</span></div><div class="stat"><b>'+(run.mode==='personal'?'1':run.letGo)+'</b><span>'+(run.mode==='personal'?'thought discarded':'thoughts let go')+'</span></div><div class="stat"><b style="font-size:19px;line-height:1.25">'+(run.guide&&run.guide.pattern?esc(run.guide.pattern.name):'Kinder self-talk')+'</b><span>'+(run.guide?'pattern you caught':'skill trained')+'</span></div></div>'));
 if(run.reframe){const q=h('<div class="panel"><p class="eyebrow" style="color:var(--sky)">Your new sentence</p><p style="font-family:var(--display);font-size:21px;font-weight:500;margin-top:6px"></p></div>');q.lastChild.textContent='“'+run.reframe+'”';s.appendChild(q)}
 s.appendChild(h('<div class="panel"><p class="eyebrow">Tomorrow</p><h3>Your guide will ask how it went</h3><p class="muted" style="font-size:14px">and whether you tried your mission.</p></div>'));
 const cta=h('<button class="cta">See you tomorrow</button>');cta.onclick=home;s.appendChild(cta);run=null;app.innerHTML='';app.appendChild(s);scrollTo(0,0);twinkle()}

/* ---------- home ---------- */
const greet=()=>{const hr=new Date().getHours();return hr<12?'Good morning':hr<18?'Good afternoon':'Good evening'};
function home(){run=null;const done=S.lastDone===dayKey();const s=h('<section class="screen"></section>');
 const top=h('<div class="top">'+(opts.onBack?'<button class="backlink" type="button">‹ All sanctuaries</button>':'<span class="brand">Mind <b>Gym</b></span>')+'<div class="spacer"></div><button class="iconbtn" aria-label="Sound on or off">'+(soundOn?ICON.sound:ICON.mute)+'</button></div>');
 if(opts.onBack)top.firstChild.onclick=opts.onBack;
 top.lastChild.onclick=e=>{setSound(!soundOn);e.currentTarget.innerHTML=soundOn?ICON.sound:ICON.mute;if(soundOn)chime()};if(!opts.hostControls)s.appendChild(top);
 s.appendChild(h('<div><h1>'+greet()+'.</h1><p class="lede">'+(done?'You’ve trained today. You’re one step higher.':'Five minutes, one step up.')+'</p></div>'));
 s.appendChild(skyEl(false));
 if(S.mission&&S.missionDay&&S.missionDay!==dayKey()&&!S.missionTried[S.missionDay]){const f=h('<div class="mission"><p class="eyebrow">Your last mission</p><p style="font-size:16px"></p><div class="pair"><button class="opt" style="text-align:center">I tried it</button><button class="opt" style="text-align:center">Not yet</button></div></div>');f.children[1].textContent=S.mission;
  f.querySelectorAll('button').forEach((b,k)=>b.onclick=()=>{S.missionTried[S.missionDay]=k===0?'yes':'no';save();toast(k===0?'That’s the real training. Well done.':'No problem. It’ll come round again.');k===0?twinkle():soft();home()});s.appendChild(f)}
 const last=S.history.find(e=>e.topic);
 const t=h('<div class="today"><p class="eyebrow">'+(done?'Done for today':'Today’s session · 5 min')+'</p><h2>'+(done?'Come back tomorrow':'What’s on your mind?')+'</h2><p class="muted" style="font-size:15px">'+(last&&!done?'Last time: “'+esc(last.topic)+'”. Your guide will ask how it’s going.':'Bring what’s weighing on you, or let your guide choose today’s practice.')+'</p><button class="cta">'+(done?'Practise again':ICON.play+' Start')+'</button></div>');
 t.querySelector('.cta').onclick=()=>{chime();startRun()};s.appendChild(t);
 const wk=h('<div><p class="eyebrow" style="color:var(--mist-2)">This week</p><div class="week" style="margin-top:8px"></div></div>');const tdy=(new Date().getDay()+6)%7;
 ['M','T','W','T','F','S','S'].forEach((d,i)=>{const past=i<tdy&&i>=tdy-Math.min(S.streak-(done?1:0),7);wk.lastChild.appendChild(h('<div><span>'+d+'</span><i class="'+(i===tdy?(done?'done':'now'):(past?'done':''))+'"></i></div>'))});s.appendChild(wk);
 s.appendChild(h('<p class="eyebrow" style="color:var(--mist-2)">For hard moments</p>'));
 const tools=h('<div class="tools"><button class="tool">'+ICON.breath+'<b>Calm in 60 seconds</b><span>Three slow breaths</span></button><button class="tool">'+ICON.leaf+'<b>Let a thought go</b><span>Leaves on the stream</span></button></div>');
 tools.children[0].onclick=()=>startRun('breathe');tools.children[1].onclick=()=>startRun('stream');s.appendChild(tools);
 if(opts.onMore){const m=h('<button class="ghost" style="margin-top:4px">More practices</button>');m.onclick=opts.onMore;s.appendChild(m)}
 s.appendChild(h('<p class="note" style="text-align:center;padding-top:6px">A fresh practice every day, shaped around you. Not a substitute for professional care.</p>'));
 /* Wide screens: [greeting + start card | tall path], then the rest full width. Phones keep the original single-column order. */
 {const k=[...s.children];const top=k[0],greet=k[1],sky=k[2];const todayEl=s.querySelector('.today');const mission=s.querySelector('.mission');
  const main=h('<div class="g-main"></div>');if(mission)main.appendChild(mission);main.appendChild(todayEl);
  const rest=h('<div class="g-rest"></div>');k.slice(3).forEach(x=>{if(x!==mission&&x!==todayEl)rest.appendChild(x)});
  greet.classList.add('g-greet');sky.classList.add('g-sky');
  const cols=h('<div class="hcols"></div>');cols.append(greet,sky,main,rest);s.appendChild(cols);s.classList.add('home')}
 app.innerHTML='';app.appendChild(s);scrollTo(0,0)}
home();
return()=>{window.removeEventListener('mg-daily-sound',onSoundEvt);if(MIC.on&&DICT)DICT.stop();clearTimeout(toastT);root.innerHTML=''};
}
