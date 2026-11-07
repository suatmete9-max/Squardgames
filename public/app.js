const $=s=>document.querySelector(s),API=(window.SQ_API||'')+'/api/';
const L={
en:{home:'Home',back:'Back',play:'Play',lb:'Leaderboard',d:'Daily Top 10',w:'Weekly',m:'Monthly',lw:'Last Week',lm:'Last Month',on:'online',sc:'Score',over:'Game Over',again:'Play Again',nm:'Your name',ct:'Country',go:'Start',inv:'Invite & Win $5 weekly',cp:'Copy invite link',cd:'Copied!',claim:'Claim Prize',pz:'Prizes',sup:'Support',wl:'Wallet address (BNB BEP20)',em:'Your email',send:'Send',win:'Winners',id:'Your Player ID',rules:'Weekly prizes: 1st $7, 2nd $5, 3rd $5. Rank = total of your best score in every game (max 3000 per game).',nw:'No players yet',pl:'Player',rf:'Invites',pid:'Player ID',msg:'Your message',tp:'Prize type',rr:'Invite prize: weekly top 3 inviters win $5 / $4 / $4 (separate from game score; an invite counts after your friend plays one game).'},
ur:{home:'ہوم',back:'واپس',play:'کھیلیں',lb:'لیڈر بورڈ',d:'روزانہ ٹاپ 10',w:'ہفتہ وار',m:'ماہانہ',lw:'پچھلا ہفتہ',lm:'پچھلا مہینہ',on:'آن لائن',sc:'اسکور',over:'گیم ختم',again:'دوبارہ کھیلیں',nm:'آپ کا نام',ct:'ملک',go:'شروع کریں',inv:'دعوت دیں اور ہفتہ وار $5 جیتیں',cp:'دعوتی لنک کاپی کریں',cd:'کاپی ہو گیا!',claim:'انعام کلیم کریں',pz:'انعامات',sup:'سپورٹ',wl:'والٹ ایڈریس (BNB BEP20)',em:'آپ کی ای میل',send:'بھیجیں',win:'فاتحین',id:'آپ کی پلیئر آئی ڈی',rules:'ہفتہ وار انعام: پہلا $7، دوسرا $5، تیسرا $5۔ رینک = ہر گیم کے بہترین اسکور کا مجموعہ (ہر گیم زیادہ سے زیادہ 3000)۔',nw:'ابھی کوئی پلیئر نہیں',pl:'پلیئر'},
hn:{home:'Home',back:'Back',play:'Khelo',lb:'Leaderboard',d:'Daily Top 10',w:'Weekly',m:'Monthly',lw:'Pichla Hafta',lm:'Pichla Mahina',on:'online',sc:'Score',over:'Game Khatam',again:'Phir Khelo',nm:'Aapka naam',ct:'Country',go:'Shuru Karo',inv:'Invite karo, weekly $5 jeeto',cp:'Invite link copy karo',cd:'Copy ho gaya!',claim:'Prize Claim Karo',pz:'Prizes',sup:'Support',wl:'Wallet address (BNB BEP20)',em:'Aapki email',send:'Bhejo',win:'Winners',id:'Aapki Player ID',rules:'Weekly prize: 1st $7, 2nd $5, 3rd $5. Rank = har game ke best score ka total (har game max 3000).',nw:'Abhi koi player nahi',pl:'Player'},
hi:{home:'होम',back:'वापस',play:'खेलें',lb:'लीडरबोर्ड',d:'दैनिक टॉप 10',w:'साप्ताहिक',m:'मासिक',lw:'पिछला सप्ताह',lm:'पिछला महीना',on:'ऑनलाइन',sc:'स्कोर',over:'गेम खत्म',again:'फिर खेलें',nm:'आपका नाम',ct:'देश',go:'शुरू करें',inv:'इनवाइट करें, साप्ताहिक $5 जीतें',cp:'इनवाइट लिंक कॉपी करें',cd:'कॉपी हो गया!',claim:'इनाम क्लेम करें',pz:'इनाम',sup:'सपोर्ट',wl:'वॉलेट एड्रेस (BNB BEP20)',em:'आपका ईमेल',send:'भेजें',win:'विजेता',id:'आपकी प्लेयर आईडी',rules:'साप्ताहिक इनाम: 1st $7, 2nd $5, 3rd $5। रैंक = हर गेम के बेस्ट स्कोर का कुल (हर गेम अधिकतम 3000)।',nw:'अभी कोई प्लेयर नहीं',pl:'प्लेयर'}};
const LN={en:'English',ur:'اردو',hn:'Hinglish',hi:'हिन्दी'},MAIL='suatmete9@gmail.com';
let lang=localStorage.sq_l||'en',U=JSON.parse(localStorage.sq_u||'null'),stop=null,sid=null,cur='',tab='d';
const t=k=>L[lang][k]||L.en[k]||k,fe=c=>c?String.fromCodePoint(...[...c.toUpperCase()].map(x=>127397+x.charCodeAt())):'🌍',flag=c=>c?'<img class=fg alt="'+c+'" src="https://flagcdn.com/w40/'+c.toLowerCase()+'.png">':'🌍';
const CC='PK IN BD US GB AE SA CA AU DE FR TR ID MY EG NG ZA BR MX RU CN JP KR PH NP LK AF IR IQ QA KW OM IT ES NL SE NO BE CH PL UA TH VN SG KE MA DZ'.split(' ');
const cn=c=>{try{return new Intl.DisplayNames([lang=='ur'?'ur':lang=='hi'?'hi':'en'],{type:'region'}).of(c)}catch{return c}};
const mask=id=>id.slice(0,3)+'••'+id.slice(-2),esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt()+';');
const post=(u,d)=>fetch(API+u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).catch(()=>({}));
const get=u=>fetch(API+u).then(r=>r.json()).catch(()=>({}));
const app=$('#app'),modal=h=>{const m=document.createElement('div');m.className='md';m.innerHTML='<div class=bx><button class=x>✕</button>'+h+'</div>';m.querySelector('.x').onclick=()=>m.remove();document.body.append(m);return m};
const cOpts=sel=>CC.map(c=>'<option value='+c+(c==sel?' selected':'')+'>'+fe(c)+' '+cn(c)+'</option>').join('');

function route(){rt++;app.className=SAFE?'safe':'';const h=location.hash.slice(2).split('/');stop&&stop();stop=null;
 $('#bh').textContent='🏠 '+t('home');$('#bb').textContent='⬅ '+t('back');document.documentElement.dir=lang=='ur'?'rtl':'ltr';
 if(!U)return reg();if(h[0]=='g'&&TH[h[1]])play(h[1]);else if(h[0]=='lb')lb();else home();slot()}
function slot(){if(window.SQApp){SQApp.nativeAd(!/^#\/(g|lb)/.test(location.hash));return}
 const d=document.createElement('div');d.className='ad adm';app.append(d);ADS.b300(d)}   // extra ad in the free area below the page content (never inside gameplay)
function reg(){const ref=new URLSearchParams(location.search).get('ref')||'';
 const m=modal('<h2>SquardGames</h2><input id=rn maxlength=20 placeholder="'+t('nm')+'"><select id=rc>'+cOpts('')+'</select><button class=big id=rg>'+t('go')+'</button><p><a href=# id=rs style="color:#ffe14d">🔑 Already have a Player ID? Restore</a></p>');m.querySelector('.x').remove();
 fetch('https://ipapi.co/json/').then(r=>r.json()).then(d=>{if(d.country_code&&CC.includes(d.country_code))$('#rc').value=d.country_code}).catch(()=>{});
 $('#rg').onclick=async()=>{const r=await post('register',{name:$('#rn').value,country:$('#rc').value,ref});if(r.id){U=r;localStorage.sq_u=JSON.stringify(U);m.remove();history.replaceState(0,'','/');keyModal(true)}else alert(r.e=='limit'?'Too many sign-ups from this network today':'Error - check your internet and try again')}
 $('#rs').onclick=e=>{e.preventDefault();restoreModal()}}
function keyModal(first){const m=modal('<h2>🔑 '+t('id')+'</h2><p>Player ID:<br><b style="font-size:24px">'+U.id+'</b></p>'+(U.key?'<p>Recovery key:<br><b style="font-size:24px">'+U.key+'</b></p><p style="font-size:13px">Take a screenshot or write both down. If you change phone or clear data, enter them to get your account (and prizes) back.</p>':'<p style="font-size:13px">This older account has no recovery key.</p>')+'<div class=row><button id=kc>Copy</button><button class=big id=ko>OK</button></div>');
 const cl=()=>{m.remove();first&&route()};m.querySelector('.x').onclick=cl;$('#ko').onclick=cl;$('#kc').onclick=()=>navigator.clipboard.writeText('Player ID: '+U.id+(U.key?'\nKey: '+U.key:''))}
function restoreModal(){const m=modal('<h2>🔑 Restore</h2><input id=ri placeholder="Player ID (SQ-XXXXXX)"><input id=rk placeholder="Recovery key"><button class=big id=rr>OK</button><p id=re></p>');
 $('#rr').onclick=async()=>{const k=$('#rk').value.trim().toUpperCase(),r=await post('restore',{id:$('#ri').value,key:k});if(r.id){U={...r,key:k};localStorage.sq_u=JSON.stringify(U);document.querySelectorAll('.md').forEach(x=>x.remove());history.replaceState(0,'','/');route()}else $('#re').textContent='Wrong ID or key'}}

const NRM={water:1.5,quiz:1,birds:.12,jewel:.4},CAP=3000;// keep in sync with server.js
const NT=[['$','#2e7d32','#66bb6a'],['₹','#e65100','#ffb74d'],['€','#1565c0','#64b5f6'],['£','#6a1b9a','#ba68c8'],['¥','#c62828','#ef5350'],['د.إ','#00695c','#4db6ac']].map(a=>'<i class=nt style="--a:'+a[1]+';--b:'+a[2]+'">'+a[0]+'</i>').join('')+'<span class=cm>💵💰🪙</span>';
const APP_PRIZES=false;// Play Store build: cash prizes hidden unless you set this true (check Google Play real-money contest policy first)
const SAFE=!!window.SQApp&&!APP_PRIZES;
let rt=0;
function home(){app.innerHTML='<div class=grid>'+Object.entries(TH).map(([k,v])=>'<a class=card href="#/g/'+k+'" style="--c:'+v.c+';--bg:'+v.bg+';--f:'+v.f+'"><span class=ic>'+v.i+'</span><b>'+v.n+'</b><i class=chv>›</i></a>').join('')+'</div>'
 +'<a class=gold href="#/lb">🏆 '+t('lb')+' »</a><button class="inv nb" id=iv>🎁 '+(SAFE?'Invite friends':t('inv'))+' ›</button><div class=winb>'+(SAFE?'<b>TOP PLAYERS</b><small>Play More • Climb the Leaderboard</small>':'<b>WIN BIG!</b><small>Play More • Get Rewards</small>')+'</div>'
 +'<div class=pid>👤 '+t('id')+': <b>'+U.id+'</b> | '+flag(U.country)+' '+esc(U.name)+'</div><div class=row id=fl></div><div class=row><button id=bk>🔑 Backup ID</button></div>';
 $('#iv').onclick=()=>{navigator.clipboard.writeText(location.origin+'/?ref='+U.id);$('#iv').textContent='✅ '+t('cd')};$('#bk').onclick=()=>keyModal(false);showOn()}
async function play(g){const v=TH[g],my=rt;cur=g;app.innerHTML='<div class=gm style="--c:'+v.c+';--bg:'+v.bg+';--f:'+v.f+'"><h2 style="margin:4px">'+v.i+' '+v.n+'</h2><div class=hud><span id=hs></span><span id=hi></span></div><div id=gb></div></div>';
 const hud=(s,i)=>{$('#hs')&&($('#hs').textContent=t('sc')+': '+Math.min(CAP,Math.round(s*(NRM[g]||1))));$('#hi')&&($('#hi').textContent=i||'')};
 const r=await post('start',{id:U.id,game:g});if(my!=rt)return;
 if(!r.sid){if(r.e=='player'){localStorage.removeItem('sq_u');U=null;alert('The server was reset and no longer knows this Player ID. Please restore your ID (Player ID + key) or create a new one.');return route()}
  $('#gb').innerHTML='<p>⏳ '+(r.e?'Game server problem ('+r.e+')':'Server is waking up or unreachable')+'.<br>Wait a minute, then <button class=big onclick="route()">Retry</button></p>';return}
 sid=r.sid;
 let sc2=0;stop=G[g]($('#gb'),hud,async sc=>{if(window.SQApp&&!sc2&&sc>0&&stop&&stop.resume&&await askSC()){sc2=1;return stop.resume()}const r=await post('score',{sid,id:U.id,score:sc});over(r.score!=null?r.score:sc)},n=>ADS.level(n),()=>sid)}
function askSC(){return new Promise(res=>{const m=modal('<h2>'+t('over')+'</h2><p>🎬 Watch a short video for a second chance?</p><div class=row><button class=big id=sy>▶ Watch</button><button id=sn>No thanks</button></div>');m.querySelector('.x').remove();
 $('#sy').onclick=async()=>{m.remove();res(await ADS.rewarded())};$('#sn').onclick=()=>{m.remove();res(false)}})}
function over(sc){const m=modal('<h2>'+t('over')+'</h2><div class=big1>'+sc+'</div><div class=row><button class=big id=ag>'+t('again')+'</button><button id=hm>🏠</button></div>');
 m.querySelector('.x').onclick=()=>m.remove();$('#ag').onclick=()=>{m.remove();route()};$('#hm').onclick=()=>{m.remove();location.hash='#/'};ADS.full()}
async function lb(){const T={d:['d',0],w:['w',0],lw:['w',1],rf:['rf',0]},pr=a=>a.map((v,i)=>'<p><span>'+['1st','2nd','3rd','4th','5th'][i]+'</span><b>$'+v+'</b></p>').join('');
 app.innerHTML='<div class=lbt><span>🏆</span><h1>'+t('lb')+'</h1><span>🏆</span></div><div class=cash>'+NT+'</div><div class="row tabs" id=tb></div><div id=tt></div>'
 +'<div class=pzs><div class="pz wk"><h3>⭐ '+t('w')+' '+t('pz')+'</h3><div>🏆</div>'+pr([7,5,5])+'</div><div class="pz rf"><h3>🎁 '+t('rf')+' '+t('pz')+' ('+t('w')+')</h3>'+pr([5,4,4])+'</div></div>'
 +'<div class=ribbon>🪙 '+t('rules')+'<br>'+t('rr')+'</div><div class=row><button class=big id=cl>💰 '+t('claim')+'</button><button id=mc>📋 My claims</button><button class=big2 id=su>🎧 '+t('sup')+'</button></div><h2 class=wh>'+t('win')+'</h2><div id=wn></div>';
 $('#tb').innerHTML=Object.keys(T).map(k=>'<button data-k='+k+(k==tab?' class=on':'')+'>'+t(k=='rf'?'rf':k)+'</button>').join('');
 const tbl=(rows,col)=>rows.length?'<div class=tbl><div class=th><span>#</span><span>'+t('pl')+'</span><b style="text-align:right">'+(col||t('sc'))+'</b></div>'+rows.map(r=>'<div class="tr2 r'+Math.min(r.r,4)+(r.id==mask(U.id)?' me':'')+'"><span>'+(r.r<=3?['🥇','🥈','🥉'][r.r-1]:r.r)+'</span><span>'+flag(r.c)+' '+esc(r.n)+'</span><b>'+r.s+'</b></div>').join('')+'</div>':'<p style="text-align:center">'+t('nw')+'</p>';
 const load=async()=>{const[p,o]=T[tab];if(p=='rf'){const r=await get('refboard?off=0&id='+U.id);$('#tt').innerHTML=tbl(r.rows||[],t('rf'))+'<p style="text-align:center">'+t('rf')+': <b>'+(r.me||0)+'</b></p>'}else $('#tt').innerHTML=tbl(await get('lb?p='+p+'&off='+o))};
 $('#tb').onclick=e=>{if(e.target.dataset.k){tab=e.target.dataset.k;[...$('#tb').children].forEach(b=>b.className=b.dataset.k==tab?'on':'');load()}};
 load();const w=await get('winners');$('#wn').innerHTML='<b>'+t('lw')+'</b>'+tbl(w.lw||[])+'<br><b>'+t('rf')+' ('+t('lw')+')</b>'+tbl(w.rw||[],t('rf'));
 const er=r=>({id:'Invalid Player ID',wallet:'Invalid BEP20 wallet (0x...)',email:'Invalid email',msg:'Please write a message',limit:'Too many requests, try later'}[r.e]||'Error'),
  gm=(s,b)=>'https://mail.google.com/mail/?view=cm&fs=1&to='+MAIL+'&su='+encodeURIComponent(s)+'&body='+encodeURIComponent(b),
  fin=(r,s,b)=>$('#cm').innerHTML=!r.ok?er(r):r.sent?'✅ Sent! We will contact you by email.'+(r.n?' Claim #'+r.n+' - track it in My claims.':''):'✅ Saved. <a target=_blank href="'+gm(s,b)+'">Click here to also send it by Gmail</a>';
 $('#mc').onclick=async()=>{const c=await get('myclaims?id='+U.id),S={pending:'⏳ Pending',approved:'✅ Approved - payment soon',paid:'💸 Paid',rejected:'❌ Rejected'};
  modal('<h2>📋 My claims</h2>'+(c.length?c.map(x=>'<p>#'+x.n+' · '+x.ty+' · '+new Date(x.t+19800000).toISOString().slice(0,10)+'<br><b>'+(S[x.st]||x.st)+'</b>'+(x.note?'<br>'+esc(x.note):'')+(x.tx?'<br><small>TX: '+esc(x.tx)+'</small>':'')+'</p>').join(''):'<p>No claims yet</p>'))};
 $('#su').onclick=()=>{modal('<h2>'+t('sup')+'</h2><input id=sp value="'+U.id+'" placeholder="'+t('pid')+'"><input id=se type=email placeholder="'+t('em')+'"><textarea id=sm placeholder="'+t('msg')+'"></textarea><button class=big id=ss>'+t('send')+'</button><p id=cm></p>');
  $('#ss').onclick=async()=>{const d={id:$('#sp').value,email:$('#se').value,msg:$('#sm').value};fin(await post('support',d),'SquardGames Support - '+d.id,'Player ID: '+d.id+'\nEmail: '+d.email+'\n\n'+d.msg)}};
 $('#cl').onclick=()=>{modal('<h2>'+t('claim')+'</h2><select id=ct2><option value=weekly>'+t('w')+'</option><option value=invite>'+t('rf')+'</option></select><input id=cp2 value="'+U.id+'" placeholder="'+t('pid')+'"><input id=cw placeholder="'+t('wl')+'"><input id=ce type=email placeholder="'+t('em')+'"><button class=big id=cs>'+t('send')+'</button><p id=cm></p>');
  $('#cs').onclick=async()=>{const d={id:$('#cp2').value,type:$('#ct2').value,wallet:$('#cw').value,email:$('#ce').value};
   fin(await post('claim',d),'SquardGames Prize Claim - '+d.id,'Prize type: '+d.type+'\nPlayer ID: '+d.id+'\nWallet (BNB BEP20): '+d.wallet+'\nEmail: '+d.email)}}}
async function showOn(){const o=await get('online'),n=o.n||0;$('#on').textContent=n+' '+t('on');
 const f=$('#fl');if(f)f.innerHTML=Object.entries(o.c||{}).map(([c,k])=>'<span class=pill style="background:#2a1a6e;color:#fff">'+flag(c)+' '+k+'</span>').join('')}
$('#lg').innerHTML=Object.entries(LN).map(([k,v])=>'<option value='+k+(k==lang?' selected':'')+'>'+v+'</option>').join('');
$('#lg').onchange=e=>{lang=e.target.value;localStorage.sq_l=lang;route()};
$('#bh').onclick=()=>location.hash='#/';$('#bb').onclick=()=>history.length>1?history.back():location.hash='#/';
addEventListener('hashchange',route);ADS.init();route();
setInterval(()=>{if(U){post('ping',{id:U.id});showOn()}},20000);if(U)post('ping',{id:U.id});

// Timed video-ad breaks while playing: after 2, 5, 15, 30 minutes of play, then every 10-15 minutes
{let pt=0,bi=0;const GAPS=window.SQApp?[5]:[2,5,15,30],nx=()=>(bi<GAPS.length?GAPS[bi]:10+R(6))*60;let need=nx();
 setInterval(()=>{if(!U||document.hidden||ADS.hold||!location.hash.startsWith('#/g/'))return;if(++pt>=need){pt=0;bi++;need=nx();ADS.vbreak()}},1000)}
