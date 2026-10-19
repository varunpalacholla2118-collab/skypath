'use strict';
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function nav(){let ini=(S.user.name||'User').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();return `<nav class="nav"><div class="brand" onclick="go('dashboard')">✈ SKY<b>PATH</b><small>INTELLIGENT FLIGHT PLANNER</small></div><div class="tabs"><button class="${S.page==='dashboard'?'active':''}" onclick="go('dashboard')">Plan itinerary</button><button class="${S.page==='compare'?'active':''}" onclick="go('compare')">Compare</button><button class="${S.page==='analytics'?'active':''}" onclick="go('analytics')">Analytics</button><button class="${S.page==='history'?'active':''}" onclick="go('history')">History</button><button class="${S.page==='assistant'?'active':''}" onclick="go('assistant')">AI Assistant</button></div><button class="navuser" onclick="document.querySelector('.menu').classList.toggle('open')"><span class="avatar">${esc(ini)}</span>${esc(S.user.name)} ▾</button><div class="menu"><button onclick="go('profile')">👤 My profile</button><button onclick="go('history')">↺ Search history</button><button class="danger" onclick="logout()">↪ Log out</button></div></nav>`}
function planner(){return `<section class="panel"><div class="panelTitle">Plan your itinerary</div><form class="planner" onsubmit="search(event)"><div class="field"><label>FROM</label><select id="from">${airports.map(a=>`<option value="${a[0]}" ${a[0]===S.from?'selected':''}>${a[0]} — ${a[1]}</option>`).join('')}</select></div><button class="swap" type="button" onclick="swapAP()">⇄</button><div class="field"><label>TO</label><select id="to">${airports.map(a=>`<option value="${a[0]}" ${a[0]===S.to?'selected':''}>${a[0]} — ${a[1]}</option>`).join('')}</select></div><div class="field"><label>TRAVEL DATE</label><input id="date" type="date" value="${S.date}" required></div><button class="btn primary searchBtn" type="submit">Search flights →</button></form></section>`}
function hero(){return `<section class="hero"><div class="heroCard"><div class="eyebrow">SMART ROUTE INTELLIGENCE</div><h1>Plan smarter.<br>Fly better.</h1><p>SKYPath combines flight search, route optimization, personalized scoring and explainable recommendations in one focused travel workspace.</p><div class="stats"><div class="stat"><b>${S.results.length||'—'}</b><span>routes found</span></div><div class="stat"><b>${S.selected?score(S.selected)+'/100':'—'}</b><span>SKY Score</span></div><div class="stat"><b>24/7</b><span>planning mode</span></div></div></div><div class="heroCard radar"><div class="radarRing"><i class="dot d1"></i><i class="dot d2"></i><i class="dot d3"></i></div></div></section>`}
function flightCard(x,i){let best=score(x)>=90;return `<article class="flight ${S.selected===x?'selected':''}"><div class="flightTop"><div><div class="route"><b>${x.depart}</b><span>${S.from}</span><span class="arrow">→</span><span>${S.to}</span><b>${x.arrive}</b></div><div class="meta">${x.code} · ${x.legs.length-1} stop${x.legs.length>2?'s':''} · ${dur(x.mins)}</div></div><div style="text-align:right"><div class="price">${fmt(x.cost)}</div>${best?'<span class="badge">BEST OVERALL</span>':''}</div></div><div class="flightBottom"><span class="meta">${x.legs.map(l=>airport(l[0])[1]+' → '+airport(l[1])[1]).join(' · ')}</span><button class="btn ${S.selected===x?'primary':''}" onclick="selectFlight(${i})">${S.selected===x?'Selected':'View route'}</button></div></article>`}
function recommendation(){let x=S.selected||sorted()[0];if(!x)return `<div class="panel recommend"><div class="empty">Search a route to see your Smart Recommendation.</div></div>`;return `<div class="panel recommend"><div class="eyebrow">SMART RECOMMENDATION</div><h2 style="margin:7px 0">Best overall route</h2><div class="score">${score(x)}<small style="font-size:14px;color:var(--muted)">/100</small></div><div class="meter"><i style="width:${score(x)}%"></i></div><div class="reason"><span>Price</span><b>${fmt(x.cost)}</b></div><div class="reason"><span>Journey</span><b>${dur(x.mins)}</b></div><div class="reason"><span>Stops</span><b>${x.legs.length-1}</b></div><div class="reason"><span>Departure</span><b>${x.depart}</b></div><div class="notice">Why this flight? It balances fare, journey time, stops and departure convenience better than the alternatives.</div><button class="btn primary" style="width:100%" onclick="go('compare')">Compare options</button></div>`}
function dashboard(){let arr=sorted();return `<div class="wrap">${hero()}${planner()}<div class="panel"><div class="filters"><b style="margin-right:auto">${arr.length?arr.length+' routes available':'Ready to search'}</b><button class="btn ${S.mode==='recommended'?'active':''}" onclick="mode('recommended')">✦ Recommended</button><button class="btn ${S.mode==='cheapest'?'active':''}" onclick="mode('cheapest')">₹ Cheapest</button><button class="btn ${S.mode==='fastest'?'active':''}" onclick="mode('fastest')">⚡ Fastest</button></div></div><div class="resultsGrid"><div class="panel"><div class="panelTitle">Available routes</div>${arr.length?arr.map((x,i)=>flightCard(x,i)).join(''):'<div class="empty">Choose airports and search to discover direct and connecting routes.</div>'}</div>${recommendation()}</div>${destinations()}</div>`}
function destinations(){return `<div class="panel"><div class="panelTitle">Explore popular destinations</div><div class="cards"><div class="dest"><h3>Goa</h3><p>Beaches · Weekend escape</p><button class="btn" onclick="pickDest('GOI')">Plan →</button></div><div class="dest"><h3>Dubai</h3><p>Skyline · International</p><button class="btn" onclick="pickDest('DXB')">Plan →</button></div><div class="dest"><h3>London</h3><p>Culture · Global city</p><button class="btn" onclick="pickDest('LHR')">Plan →</button></div></div></div>`}
function map(){let x=S.selected||sorted()[0];if(!x)return '';let pts=[[12,70],[34,48],[58,62],[84,38]];let line=pts.slice(0,x.legs.length+1).map((p,i)=>(i?' L':'M')+' '+p[0]+' '+p[1]).join('');return `<div class="panel"><div class="panelTitle">Interactive route map</div><div class="map"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 80 Q25 35 45 62 T100 20" fill="none" stroke="#ffffff10" stroke-width="10"/><path d="${line}" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3 2"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite"/></path>${pts.slice(0,x.legs.length+1).map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="${i===0||i===x.legs.length?'#fbbf24':'#f59e0b'}"/><text x="${p[0]+2}" y="${p[1]-3}" fill="#fcfaf7" font-size="4">${i===0?S.from:i===x.legs.length?S.to:airport(x.legs[i-1][1])[0]}</text>`).join('')}</svg></div></div>`}
function compare(){let arr=sorted();return `<div class="wrap"><div class="panel"><div class="panelTitle">Flight comparison dashboard</div><p class="meta">Compare fare, duration, stops and SKY Score before choosing.</p><div class="compare"><table><thead><tr><th>Route</th><th>Flight</th><th>Price</th><th>Duration</th><th>Stops</th><th>SKY Score</th><th></th></tr></thead><tbody>${arr.map((x,i)=>`<tr><td>${x.depart} ${S.from} → ${S.to} ${x.arrive}</td><td>${x.code}</td><td class="${x.cost===Math.min(...arr.map(y=>y.cost))?'best':''}">${fmt(x.cost)}</td><td>${dur(x.mins)}</td><td>${x.legs.length-1}</td><td class="${score(x)>=score(arr[0])?'best':''}">${score(x)}</td><td><button class="btn" onclick="selectFlight(${i});go('dashboard')">Select</button></td></tr>`).join('')}</tbody></table></div></div>${map()}</div>`}
function analytics(){let total=S.history.length;let avg=total?Math.round(S.history.reduce((a,h)=>a+h.cost,0)/total):0;let recent=S.history.slice(0,7).reverse(),mx=Math.max(1,...recent.map(h=>h.cost)),bars=recent.map(h=>Math.max(8,Math.round(h.cost/mx*100)));return `<div class="wrap"><div class="panel"><div class="panelTitle">Travel analytics</div><div class="analytics"><div class="mini"><b>${total}</b><span>Searches</span></div><div class="mini"><b>${avg?fmt(avg):'—'}</b><span>Average fare viewed</span></div><div class="mini"><b>${S.history[0]?.to||'—'}</b><span>Latest destination</span></div><div class="mini"><b>Best</b><span>Optimization mode</span></div></div><h3>Best fare in your last 7 searches</h3><div class="bar">${bars.map(h=>`<i style="height:${h}%"></i>`).join('')}</div><p class="meta">Built from the searches saved to your account on the SKYPATH server.</p></div></div>`}
function history(){return `<div class="wrap"><div class="panel"><div class="panelTitle">Your flight searches</div>${S.history.length?S.history.map((h,i)=>`<div class="historyItem"><div><b>${h.from} → ${h.to}</b><div class="meta">${h.date} · ${h.mode} · ${h.count} routes · best ${fmt(h.cost)}</div></div><button class="btn" onclick="S.from='${h.from}';S.to='${h.to}';S.date='${h.date}';go('dashboard')">Search again</button></div>`).join(''):'<div class="empty">No searches yet. Your recent route searches will appear here.</div>'}</div></div>`}
function profile(){let p=S.profile;return `<div class="wrap"><div class="panel"><div class="panelTitle">My profile & travel preferences</div><div class="profile"><div class="field"><label>FULL NAME</label><input id="pname" value="${esc(p.name||S.user.name)}"></div><div class="field"><label>EMAIL</label><input value="${esc(S.user.email)}" disabled></div><div class="field"><label>PHONE</label><input id="phone" value="${esc(p.phone||'')}"></div><div class="field"><label>NATIONALITY</label><input id="nationality" value="${esc(p.nationality||'')}"></div><div class="field"><label>PASSPORT</label><input id="passport" value="${esc(p.passport||'')}"></div><div class="field"><label>FREQUENT FLYER ID</label><input id="ff" value="${esc(p.ff||'')}"></div><div class="field"><label>SEAT PREFERENCE</label><select id="seat"><option>Window</option><option ${p.seat==='Aisle'?'selected':''}>Aisle</option><option ${p.seat==='Middle'?'selected':''}>Middle</option></select></div><div class="field"><label>MEAL PREFERENCE</label><select id="meal"><option>Vegetarian</option><option ${p.meal==='Non-vegetarian'?'selected':''}>Non-vegetarian</option><option ${p.meal==='Vegan'?'selected':''}>Vegan</option><option ${p.meal==='Jain'?'selected':''}>Jain</option></select></div><div class="wide"><button class="btn primary" onclick="saveProfile()">Save preferences</button><div class="notice">Preferences can be used by the recommendation engine in future versions.</div></div></div></div></div>`}
function assistant(){return `<div class="wrap"><div class="panel"><div class="panelTitle">✦ SKY AI Travel Assistant</div><p class="meta">Ask for a travel decision in natural language. Example: “Find the cheapest route from Delhi to Goa under ₹7000.”</p><div class="chat" id="chat">${S.chat.length?S.chat.map(m=>`<div class="msg ${m.me?'me':'ai'}">${esc(m.t)}</div>`).join(''):'<div class="msg ai">Hi! I can help you choose between the routes in SKYPath. Tell me your budget, speed preference or stop preference.</div>'}</div><form class="chatbar" onsubmit="ask(event)"><input id="question" placeholder="e.g. Cheapest option under ₹7000" required><button class="btn primary">Ask AI</button></form></div></div>`}
function sorted(){let a=[...S.results];if(S.mode==='cheapest')a.sort((x,y)=>x.cost-y.cost);else if(S.mode==='fastest')a.sort((x,y)=>x.mins-y.mins);else a.sort((x,y)=>score(y)-score(x));return a}
function selectFlight(i){S.selected=sorted()[i];render()}
function mode(m){S.mode=m;S.selected=sorted()[0]||null;render()}
function go(p){S.page=p;render()}
function toast(t){let d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}

let airports=[];
const airport=c=>airports.find(a=>a[0]===c)||[c,c,''];
const fmt=n=>'₹'+n.toLocaleString('en-IN'); const dur=m=>Math.floor(m/60)+'h '+m%60+'m';
let S={ready:false,user:null,page:'dashboard',authMode:'login',authErr:'',authEmail:'',busy:false,
  from:'DEL',to:'GOI',date:new Date().toISOString().slice(0,10),mode:'recommended',
  results:[],selected:null,history:[],profile:{},chat:[]};
const score=x=>x.score;   // computed by the local flight-scoring model, see genFlights()

/* ---------- flight generation + AI assistant (runs locally, no server) ---------- */

const AIRPORTS=[['DEL','Delhi'],['BOM','Mumbai'],['BLR','Bengaluru'],['MAA','Chennai'],['CCU','Kolkata'],['HYD','Hyderabad'],['GOI','Goa'],['COK','Kochi'],['PNQ','Pune'],['JAI','Jaipur'],['IXC','Chandigarh'],['DXB','Dubai'],['SIN','Singapore'],['LHR','London'],['JFK','New York']];
const AIRLINES=['6E','AI','UK','SG','G8','IX','QP'];

function mulberry32(seed){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}}
function strSeed(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h}
function pad2(n){return String(n).padStart(2,'0')}
function fmtTime(totalMins){totalMins=((totalMins%1440)+1440)%1440;return pad2(Math.floor(totalMins/60))+':'+pad2(totalMins%60)}

function genFlights(from,to,date){
  const rand=mulberry32(strSeed(from+'|'+to+'|'+date));
  const others=AIRPORTS.map(a=>a[0]).filter(c=>c!==from&&c!==to);
  const count=4+Math.floor(rand()*4);
  const flights=[];
  for(let i=0;i<count;i++){
    const stopRoll=rand();
    const stops=stopRoll<0.45?0:stopRoll<0.8?1:2;
    const via=[];const pool=[...others];
    for(let s=0;s<stops;s++){const idx=Math.floor(rand()*pool.length);via.push(pool.splice(idx,1)[0]||to)}
    const chain=[from,...via,to];
    const legs=[];for(let s=0;s<chain.length-1;s++)legs.push([chain[s],chain[s+1]]);
    const departMin=240+Math.floor(rand()*1080);
    const baseLegMins=70+Math.floor(rand()*90);
    const layoverMins=stops>0?45+Math.floor(rand()*90)*stops:0;
    const mins=baseLegMins*(stops+1)+layoverMins;
    const arriveMin=departMin+mins;
    const airline=AIRLINES[Math.floor(rand()*AIRLINES.length)];
    const code=airline+(1000+Math.floor(rand()*8999));
    const baseFare=2200+Math.floor(rand()*5200);
    const stopPenaltyDiscount=stops*350;
    const cost=Math.max(1499,Math.round((baseFare-stopPenaltyDiscount+Math.floor(rand()*900))/10)*10);
    const priceScore=Math.max(0,40-(cost-2000)/150);
    const durationScore=Math.max(0,30-(mins-90)/12);
    const stopScore=Math.max(0,20-stops*9);
    const timeScore=departMin>=360&&departMin<=1320?10:4;
    let sc=Math.round(priceScore+durationScore+stopScore+timeScore);
    sc=Math.min(99,Math.max(35,sc));
    flights.push({code,depart:fmtTime(departMin),arrive:fmtTime(arriveMin),mins,cost,legs,score:sc})}
  return flights}

function answerAssistant(q,from,to,results){
  const text=q.toLowerCase();
  if(!results||!results.length)return `I don't have any routes to compare yet for ${from} → ${to}. Search a route on the Plan itinerary tab first, then ask me again.`;
  const budgetMatch=text.match(/(\d[\d,]*)/);
  const budget=budgetMatch?parseInt(budgetMatch[1].replace(/,/g,''),10):null;
  let pool=results;
  if(budget)pool=pool.filter(f=>f.cost<=budget);
  if(!pool.length){
    const cheapest=[...results].sort((a,b)=>a.cost-b.cost)[0];
    return `Nothing under ₹${budget.toLocaleString('en-IN')} on this route. The cheapest option I found is ${cheapest.code} for ₹${cheapest.cost.toLocaleString('en-IN')} (${cheapest.legs.length-1} stop(s), ${Math.floor(cheapest.mins/60)}h ${cheapest.mins%60}m).`}
  let pick,reason;
  if(/fast|quick|short|duration/.test(text)){pick=[...pool].sort((a,b)=>a.mins-b.mins)[0];reason='the fastest journey time'}
  else if(/direct|non.?stop|nonstop/.test(text)){const direct=pool.filter(f=>f.legs.length===1);pick=(direct.length?direct:pool).sort((a,b)=>a.cost-b.cost)[0];reason=direct.length?'a direct flight':'the best option (no direct flights matched)'}
  else if(/cheap|budget|low.?cost|fare/.test(text)){pick=[...pool].sort((a,b)=>a.cost-b.cost)[0];reason='the lowest fare'}
  else if(/stop|layover|connect/.test(text)){pick=[...pool].sort((a,b)=>(a.legs.length-b.legs.length)||(a.cost-b.cost))[0];reason='the fewest stops'}
  else{pick=[...pool].sort((a,b)=>b.score-a.score)[0];reason='the best overall SKY Score'}
  const stops=pick.legs.length-1;
  return `Based on ${reason}, I'd pick ${pick.code}: departs ${pick.depart}, arrives ${pick.arrive}, ${stops===0?'nonstop':stops+' stop(s)'}, ${Math.floor(pick.mins/60)}h ${pick.mins%60}m, for ₹${pick.cost.toLocaleString('en-IN')} (SKY Score ${pick.score}/100).`}

/* ---------- API layer ---------- */

/* =====================================================================
   Local, no-server "backend": everything below runs entirely inside
   this browser tab. There is no network call, no Node process, and
   nothing to start — that's why double-clicking index.html just works.
   Accounts, profiles and search history are saved with localStorage,
   so they stay on this device/browser and persist between visits.
   This is a self-contained demo, not a secure multi-user server: don't
   use a real password here.
   ===================================================================== */

const LS_USERS='skypath_users', LS_SESSION='skypath_session';
function loadUsers(){try{return JSON.parse(localStorage.getItem(LS_USERS))||[]}catch(e){return []}}
function saveUsers(u){localStorage.setItem(LS_USERS,JSON.stringify(u))}
function findUserByEmail(users,email){return users.find(u=>u.email.toLowerCase()===String(email).toLowerCase())}
function nextUserId(users){return users.reduce((m,u)=>Math.max(m,u.id),0)+1}
function publicUser(u){return {id:u.id,name:u.name,email:u.email}}
function apiErr(msg,status){return Object.assign(new Error(msg),{status})}

/* Deterministic, dependency-free password hash (demo-grade, not real
   crypto) so the same password always maps to the same stored value. */
function hashPassword(pw){
  let h=strSeed('skypath-salt::'+pw),rnd=mulberry32(h),out='';
  for(let i=0;i<8;i++)out+=Math.floor(rnd()*0xffffffff).toString(16).padStart(8,'0');
  return out}

function requireSession(){
  const id=Number(localStorage.getItem(LS_SESSION));
  const users=loadUsers();
  const user=id?users.find(u=>u.id===id):null;
  if(!user)throw apiErr('Not signed in.',401);
  return {user,users}}

const lastResults=new Map(); // userId -> {from,to,results}; in-memory only, for the AI assistant

function registerHandler(body){
  const {name,email,password}=body;
  if(!name||!email||!password)throw apiErr('Name, email and password are required.',400);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw apiErr('Enter a valid email address.',400);
  if(String(password).length<8)throw apiErr('Password must be at least 8 characters.',400);
  const users=loadUsers();
  if(findUserByEmail(users,email))throw apiErr('An account with that email already exists.',409);
  const user={id:nextUserId(users),name:String(name).trim(),email:String(email).trim(),passwordHash:hashPassword(password),profile:{},history:[]};
  users.push(user);saveUsers(users);
  localStorage.setItem(LS_SESSION,String(user.id));
  return {user:publicUser(user),profile:user.profile,history:user.history}}

function loginHandler(body){
  const {email,password}=body;
  if(!email||!password)throw apiErr('Enter your email and password.',400);
  const users=loadUsers();
  const user=findUserByEmail(users,email);
  if(!user||hashPassword(password)!==user.passwordHash)throw apiErr('Incorrect email or password.',401);
  localStorage.setItem(LS_SESSION,String(user.id));
  return {user:publicUser(user),profile:user.profile||{},history:user.history||[]}}

function logoutHandler(){localStorage.removeItem(LS_SESSION);return {ok:true}}

function searchHandler(params){
  const {user,users}=requireSession();
  const from=String(params.get('from')||'').toUpperCase();
  const to=String(params.get('to')||'').toUpperCase();
  const date=String(params.get('date')||'');
  if(!from||!to||!date)throw apiErr('from, to and date are required.',400);
  if(!AIRPORTS.some(a=>a[0]===from)||!AIRPORTS.some(a=>a[0]===to))throw apiErr('Unknown airport code.',400);
  if(from===to)throw apiErr('Choose two different airports.',400);
  const results=genFlights(from,to,date);
  lastResults.set(user.id,{from,to,results});
  const best=results.reduce((a,b)=>b.score>a.score?b:a,results[0]);
  user.history=user.history||[];
  user.history.unshift({from,to,date,mode:'recommended',count:results.length,cost:best?best.cost:0});
  user.history=user.history.slice(0,25);
  saveUsers(users);
  return {results,history:user.history}}

function profileHandler(body){
  const {user,users}=requireSession();
  const {name,phone,nationality,passport,ff,seat,meal}=body;
  if(name&&String(name).trim())user.name=String(name).trim();
  user.profile={name:user.name,phone:phone||'',nationality:nationality||'',passport:passport||'',ff:ff||'',seat:seat||'Window',meal:meal||'Vegetarian'};
  saveUsers(users);
  return {user:publicUser(user),profile:user.profile}}

function askHandler(body){
  const {user}=requireSession();
  const {q,from,to}=body;
  if(!q||!String(q).trim())throw apiErr('Ask a question first.',400);
  let cache=lastResults.get(user.id);
  if(!cache||cache.from!==from||cache.to!==to){
    const today=new Date().toISOString().slice(0,10);
    const results=genFlights(from,to,today);
    cache={from,to,results};lastResults.set(user.id,cache)}
  return {reply:answerAssistant(String(q),from,to,cache.results)}}

async function api(path,opts){
  opts=opts||{};
  const [route,qs]=path.split('?');
  const params=new URLSearchParams(qs||'');
  const body=opts.body?Object.fromEntries(new URLSearchParams(String(opts.body))):{};
  try{
    if(route==='/api/airports')return AIRPORTS;
    if(route==='/api/me'){const {user}=requireSession();return {user:publicUser(user),profile:user.profile||{},history:user.history||[]}}
    if(route==='/api/register')return registerHandler(body);
    if(route==='/api/login')return loginHandler(body);
    if(route==='/api/logout')return logoutHandler();
    if(route==='/api/search')return searchHandler(params);
    if(route==='/api/profile')return profileHandler(body);
    if(route==='/api/ask')return askHandler(body);
    throw apiErr('Not found.',404)
  }catch(e){if(typeof e.status==='number')throw e;throw apiErr(e.message||'Something went wrong.',500)}}
const post=(path,obj)=>api(path,{method:'POST',body:new URLSearchParams(obj)});
function applySession(d){S.user=d.user;S.profile=d.profile||{};S.history=d.history||[]}
function fail(err){if(err.status===401&&S.user){S.user=null;S.results=[];S.selected=null;S.authMode='login';S.authErr='Your session expired — please sign in again.';render();return}toast(err.message)}
const $=id=>document.getElementById(id);

/* ---------- auth ---------- */
function auth(){const reg=S.authMode==='register';
return `<div class="auth"><div class="authCard"><div class="brand">✈ SKY<b>PATH</b><small>INTELLIGENT FLIGHT PLANNER</small></div>
<div class="filters" style="margin:20px 0 4px"><button type="button" class="btn ${!reg?'active':''}" style="flex:1" onclick="setAuth('login')">Log in</button><button type="button" class="btn ${reg?'active':''}" style="flex:1" onclick="setAuth('register')">Create account</button></div>
<h1>${reg?'Create your account.':'Welcome back.'}</h1>
<p class="meta">${reg?'Sign up to search routes, save your history and manage your travel profile.':'Log in to continue planning your journeys.'}</p>
<form onsubmit="submitAuth(event)" novalidate>
${reg?'<input id="name" placeholder="Full name" autocomplete="name">':''}
<input id="email" type="email" placeholder="Email address" autocomplete="username" value="${esc(S.authEmail)}">
<input id="password" type="password" placeholder="${reg?'Password (min 8 characters)':'Password'}" autocomplete="${reg?'new-password':'current-password'}">
${reg?'<input id="password2" type="password" placeholder="Confirm password" autocomplete="new-password">':''}
<div id="authErr" style="color:var(--danger,#ef4444);min-height:18px;font-size:13px">${esc(S.authErr)}</div>
<button class="btn primary" id="authBtn">${reg?'Create account →':'Log in →'}</button></form>
<p class="meta">Accounts are stored on the SKYPATH C server, with salted, stretched password hashes — never in plain text.</p></div></div>`}
function setAuth(m){S.authMode=m;S.authErr='';render()}
function authError(m){S.authErr=m;const e=$('authErr');if(e)e.textContent=m}
async function submitAuth(e){e.preventDefault();if(S.busy)return;
  const reg=S.authMode==='register',email=$('email').value.trim(),password=$('password').value;
  S.authEmail=email;
  if(!email||!password)return authError('Enter your email and password.');
  let payload={email,password};
  if(reg){const name=$('name').value.trim();
    if(!name)return authError('Enter your full name.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return authError('Enter a valid email address.');
    if(password.length<8)return authError('Password must be at least 8 characters.');
    if(password!==$('password2').value)return authError("Passwords don't match.");
    payload={name,email,password}}
  S.busy=true;$('authBtn').disabled=true;
  try{const d=await post(reg?'/api/register':'/api/login',payload);
    applySession(d);S.page='dashboard';S.authErr='';S.authEmail='';S.busy=false;render();
    toast(reg?'Account created — welcome aboard!':'Welcome back, '+S.user.name)}
  catch(err){S.busy=false;const b=$('authBtn');if(b)b.disabled=false;authError(err.message)}}
async function logout(){try{await post('/api/logout',{})}catch(e){}
  S.user=null;S.results=[];S.selected=null;S.history=[];S.profile={};S.chat=[];S.page='dashboard';S.authMode='login';S.authErr='';render()}

/* ---------- planner actions ---------- */
function swapAP(){const f=$('from').value,t=$('to').value,d=$('date').value;S.from=t;S.to=f;S.date=d||S.date;S.results=[];S.selected=null;render()}
function pickDest(c){const f=$('from');if(f)S.from=f.value;S.to=c;S.results=[];S.selected=null;render()}
async function search(e){e.preventDefault();
  const from=$('from').value,to=$('to').value,date=$('date').value;
  if(from===to){toast('Choose different airports');return}
  S.from=from;S.to=to;S.date=date;
  try{const d=await api('/api/search?'+new URLSearchParams({from,to,date}));
    S.results=d.results;S.history=d.history;S.mode='recommended';S.selected=sorted()[0]||null;render();
    toast(S.results.length?S.results.length+' route(s) found':'No routes found for this pair')}
  catch(err){fail(err)}}

/* ---------- profile ---------- */
async function saveProfile(){
  const f=id=>$(id).value;
  try{const d=await post('/api/profile',{name:f('pname'),phone:f('phone'),nationality:f('nationality'),passport:f('passport'),ff:f('ff'),seat:f('seat'),meal:f('meal')});
    S.user=d.user;S.profile=d.profile;toast('Profile saved successfully');render()}
  catch(err){fail(err)}}

/* ---------- assistant ---------- */
async function ask(e){e.preventDefault();const q=$('question').value.trim();if(!q)return;
  S.chat.push({me:true,t:q});render();
  try{const d=await post('/api/ask',{q,from:S.from,to:S.to});
    S.chat.push({me:false,t:'['+S.from+' → '+S.to+'] '+d.reply})}
  catch(err){if(err.status===401){fail(err);return}S.chat.push({me:false,t:err.message})}
  render();setTimeout(()=>{const c=$('chat');if(c)c.scrollTop=99999},20)}

/* ---------- render + boot ---------- */
function render(){
  const app=$('app');
  if(!S.ready){app.innerHTML='<div class="empty">Loading…</div>';return}
  if(!airports.length){app.innerHTML='<div class="empty"><h2>Could not load SKYPATH</h2><p class="meta">Something stopped the app from starting. Try reloading the page.</p><button class="btn primary" onclick="boot()">Retry</button></div>';return}
  if(!S.user){app.innerHTML=auth();return}
  let body=S.page==='compare'?compare():S.page==='assistant'?assistant():S.page==='analytics'?analytics():S.page==='history'?history():S.page==='profile'?profile():dashboard();
  app.innerHTML=nav()+body}
async function boot(){
  try{airports=await api('/api/airports')}catch(e){airports=[]}
  if(airports.length){try{applySession(await api('/api/me'))}catch(e){}}
  S.ready=true;render()}
boot();
