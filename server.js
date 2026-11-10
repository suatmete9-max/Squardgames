const TR=require('./trends');
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,TZ=+(process.env.TZ_OFFSET||5.5),DB=path.join(process.env.DATA_DIR||__dirname,'data.json'),PUB=path.join(__dirname,'public');
let db={players:{},scores:[],bonus:[],refs:[],msgs:[]};try{db=JSON.parse(fs.readFileSync(DB))}catch{}db.refs=db.refs||[];db.msgs=db.msgs||[];
// ===== Storage: Firebase Firestore (if FIREBASE_SA is set) else local data.json =====
// Whole database is saved as a few JSON chunks in Firestore (collection sq_state), double-buffered so a crash never leaves half-written data.
const SA=(()=>{try{let s=(process.env.FIREBASE_SA||'').trim();if(!s)return null;if(s[0]!='{')s=Buffer.from(s,'base64').toString();return JSON.parse(s)}catch(e){console.log('FIREBASE_SA invalid:',e.message);return null}})();
const FS_BASE=process.env.FIRESTORE_BASE||('https://firestore.googleapis.com/v1/projects/'+(SA?SA.project_id:'x')+'/databases/(default)/documents'),TOKEN_URL=process.env.TOKEN_URL||'https://oauth2.googleapis.com/token',CH=+process.env.FS_CHUNK||250000;
let tok={v:'',exp:0},slot=0,saving=0,dirty=0,ready=!SA,ft=0;
async function token(){if(tok.v&&Date.now()<tok.exp-6e4)return tok.v;const n=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString('base64url'),h=b({alg:'RS256',typ:'JWT'}),c=b({iss:SA.client_email,scope:'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging',aud:TOKEN_URL,iat:n,exp:n+3600}),sig=crypto.createSign('RSA-SHA256').update(h+'.'+c).sign(SA.private_key,'base64url');
 const r=await fetch(TOKEN_URL,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type='+encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')+'&assertion='+h+'.'+c+'.'+sig}),j=await r.json();
 if(!j.access_token)throw new Error('token: '+JSON.stringify(j).slice(0,200));tok={v:j.access_token,exp:Date.now()+(j.expires_in||3600)*1e3};return tok.v}
async function fstore(method,p,body){const r=await fetch(FS_BASE+'/'+p,{method,headers:{authorization:'Bearer '+await token(),'content-type':'application/json'},body:body?JSON.stringify(body):undefined});if(r.status==404)return null;if(!r.ok)throw new Error(method+' '+p+' '+r.status+' '+(await r.text()).slice(0,200));return r.json()}
async function flush(){if(!SA||saving||!dirty||!ready)return;saving=1;dirty=0;
 try{const o=Date.now()-45*864e5,s=JSON.stringify({...db,scores:db.scores.filter(x=>x.t>o),refs:db.refs.filter(x=>x.t>o),bonus:db.bonus.filter(x=>x.t>o)}),parts=[];
  for(let i=0;i<s.length;){let e=Math.min(i+CH,s.length);const c=s.charCodeAt(e-1);if(e<s.length&&c>=0xD800&&c<=0xDBFF)e++;parts.push(s.slice(i,e));i=e}
  const ns=1-slot;for(let i=0;i<parts.length;i++)await fstore('PATCH','sq_state/s'+ns+'_'+i,{fields:{d:{stringValue:parts[i]}}});
  await fstore('PATCH','sq_state/meta',{fields:{slot:{integerValue:String(ns)},n:{integerValue:String(parts.length)},ts:{integerValue:String(Date.now())}}});slot=ns}
 catch(e){dirty=1;console.log('Firestore save failed:',e.message)}saving=0}
async function loadRemote(){const m=await fstore('GET','sq_state/meta');if(!m)return null;slot=+m.fields.slot.integerValue;const n=+m.fields.n.integerValue;let s='';
 for(let i=0;i<n;i++){const d=await fstore('GET','sq_state/s'+slot+'_'+i);if(!d)throw new Error('missing chunk '+i);s+=d.fields.d.stringValue}return JSON.parse(s)}
async function init(){if(!SA){console.log('Storage: local data.json (set FIREBASE_SA to use Firebase)');snap();return}
 for(let a=1;;a++){try{const r=await loadRemote();if(r){db={players:{},scores:[],bonus:[],refs:[],msgs:[],...r};console.log('Storage: Firestore. Loaded players:',Object.keys(db.players).length,'claims/messages:',db.msgs.length)}else{console.log('Storage: Firestore is empty - starting fresh');dirty=1}ready=true;snap();return}
  catch(e){console.log('Firestore load failed (attempt '+a+'):',e.message);await new Promise(r=>setTimeout(r,Math.min(30000,3000*a)))}}}
const save=()=>{if(!SA){fs.writeFile(DB,JSON.stringify(db),()=>{});return}dirty=1;if(!ft)ft=setTimeout(()=>{ft=0;flush()},20000)};
setInterval(()=>{if(SA)flush();else save()},SA?30000:30000);
const sess={},online={},hits={},regs={},cl={},adm={},tls=require('tls'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const PRIZES={game:[17,10,5],invite:[6,5,4]};// weekly prize $ for top 1/2/3 (keep in sync with PZ in public/app.js)
const NORM={water:1.5,quiz:1,birds:.12,jewel:.4},CAP=3000;// keep in sync with NRM/CAP in public/app.js. Balances points: similar score per minute in every game, max CAP per game
setInterval(()=>{for(const i in cl)delete cl[i];for(const i in adm)delete adm[i]},36e5);
setInterval(()=>{for(const i in hits)delete hits[i]},60000);setInterval(()=>{for(const i in regs)delete regs[i]},864e5);
const RATE={water:6,quiz:0,birds:80,jewel:30},BASE={water:1500,quiz:0,birds:5000,jewel:3000};
const QF=path.join(__dirname,'data','questions.json');let Q=[];
function loadQ(){try{Q=JSON.parse(fs.readFileSync(QF,'utf8')).filter(x=>x&&x.q&&x.a&&Array.isArray(x.w)&&x.w.length>=3).map((x,i)=>({...x,i,d:[1,2,3].includes(+x.d)?+x.d:2}));console.log('Questions loaded:',Q.length)}catch(e){console.log('questions load failed',e.message)}}
loadQ();fs.watchFile(QF,{interval:2000},loadQ);
setInterval(()=>{const o=Date.now()-36e5;for(const i in sess)if(sess[i].t<o)delete sess[i]},6e5);
const k=(t,p)=>{const L=t+TZ*36e5,d=Math.floor(L/864e5);if(p=='d')return d;if(p=='w')return Math.floor((d+4)/7);const x=new Date(L);return x.getUTCFullYear()*12+x.getUTCMonth()};
const mask=id=>id.slice(0,3)+'••'+id.slice(-2);
const istDate=t=>new Date(t+TZ*36e5).toISOString().slice(0,10),wkDate=K=>new Date((7*K-4)*864e5).toISOString().slice(0,10),K0=Math.floor((Math.floor(Date.UTC(2026,10,1)/864e5)+4)/7);// first contest week starts Sunday 2026-11-01
function snap(){db.hist=db.hist||{};const cur=k(Date.now(),'w');let ch=0;for(let K=K0;K<cur;K++){if(db.hist[K])continue;db.hist[K]={d:wkDate(K),g:board('w',cur-K,3,1),i:refboard(cur-K,3,1),pz:PRIZES};ch=1}if(ch)save()}
setInterval(()=>{if(ready)snap()},36e5);
async function sendPush(title,body,image,link){db.push=db.push||{};const toks=Object.keys(db.push);if(!SA)return{sent:0,failed:0,e:'FIREBASE_SA not set'};let sent=0,failed=0;
 const url=process.env.FCM_BASE||('https://fcm.googleapis.com/v1/projects/'+SA.project_id+'/messages:send'),tk=await token();
 for(let i=0;i<toks.length;i+=10)await Promise.all(toks.slice(i,i+10).map(async t=>{try{const r=await fetch(url,{method:'POST',headers:{authorization:'Bearer '+tk,'content-type':'application/json'},
  body:JSON.stringify({message:{token:t,notification:{title,body,...(image?{image}:{})},webpush:{notification:{icon:'/icon-192.png',...(image?{image}:{})},fcm_options:{link:link||'/'}}}})});
  if(r.ok)sent++;else{failed++;if(/UNREGISTERED|NOT_FOUND|INVALID_ARGUMENT/.test(await r.text()))delete db.push[t]}}catch{failed++}}));save();return{sent,failed}}
function board(p,off,n,full){const K=k(Date.now(),p)-off,best={},tot={};
 db.scores.forEach(s=>{if(k(s.t,p)!=K)return;const m=best[s.id]=best[s.id]||{};m[s.g]=Math.max(m[s.g]||0,s.s)});
 for(const id in best)tot[id]=Object.values(best[id]).reduce((a,b)=>a+b,0);
 db.bonus.forEach(x=>{if(k(x.t,p)==K)tot[x.id]=(tot[x.id]||0)+x.pts});
 return Object.entries(tot).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([id,s],i)=>{const P=db.players[id]||{};return{r:i+1,id:full?id:mask(id),n:P.name||'?',c:P.c||'',s}})}
function refboard(off,n,full){const K=k(Date.now(),'w')-off,c={};db.refs.forEach(x=>{if(k(x.t,'w')==K)c[x.by]=(c[x.by]||0)+1});
 return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([id,s],i)=>{const P=db.players[id]||{};return{r:i+1,id:full?id:mask(id),n:P.name||'?',c:P.c||'',s}})}
// Direct e-mail via SMTP (Gmail: SMTP_USER + SMTP_PASS = app password). Returns true if sent.
function mail(subject,text,replyTo){return new Promise(res=>{const U=process.env.SMTP_USER,PW=process.env.SMTP_PASS;if(!U||!PW)return res(false);
 const to=process.env.MAIL_TO||'suatmete9@gmail.com',b64=s=>Buffer.from(s).toString('base64');let fin=0;const end=v=>{if(!fin){fin=1;try{sock.destroy()}catch{}res(v)}};
 const msg='From: SquardGames <'+U+'>\r\nTo: '+to+'\r\nReply-To: '+String(replyTo).replace(/[\r\n]/g,'')+'\r\nSubject: =?UTF-8?B?'+b64(subject)+'?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n'+b64(text).replace(/(.{76})/g,'$1\r\n');
 const cmds=['EHLO squardgames','AUTH LOGIN',b64(U),b64(PW),'MAIL FROM:<'+U+'>','RCPT TO:<'+to+'>','DATA',msg+'\r\n.','QUIT'],ex=['220','250','334','334','235','250','250','354','250','221'];let st=0,buf='';
 const sock=tls.connect({host:process.env.SMTP_HOST||'smtp.gmail.com',port:+(process.env.SMTP_PORT||465),rejectUnauthorized:!process.env.SMTP_INSECURE});
 sock.on('data',d=>{buf+=d;const ls=buf.split('\r\n');buf=ls.pop();ls.forEach(l=>{if(!/^\d{3} /.test(l))return;if(l.slice(0,3)!=ex[st])return end(false);if(st==cmds.length)return end(true);sock.write(cmds[st]+'\r\n');st++})});
 sock.on('error',()=>end(false));setTimeout(()=>end(false),15000)})}
function api(u,b,ip,j){const p=u.pathname.slice(5),now=Date.now();
 if(p=='register'){const n=String(b.name||'').replace(/[<>&"'`]/g,'').trim().slice(0,20);if(n.length<2)return j({e:'name'},400);
  regs[ip]=(regs[ip]||0)+1;if(regs[ip]>5)return j({e:'limit'},429);
  const c=/^[A-Z]{2}$/.test(b.country)?b.country:'',id='SQ-'+crypto.randomBytes(3).toString('hex').toUpperCase();
  const key=crypto.randomBytes(4).toString('hex').toUpperCase(),rf=String(b.ref||'').trim().toUpperCase();db.players[id]={name:n,c,t:now,kh:sha(key),rk:key,ref:(rf&&db.players[rf]&&rf!=id&&regs[ip]<=2)?rf:''};
  save();return j({id,name:n,country:c,key})}
 if(p=='reclaim'){const id=String(b.id||'').trim().toUpperCase();if(!/^SQ-[0-9A-F]{6}$/.test(id))return j({e:'bad'},400);const P=db.players[id],kk=String(b.key||'').trim().toUpperCase();// lets the app silently re-create its own account if the server lost its data
  if(P){if(P.kh&&/^[0-9A-F]{8}$/.test(kk)&&sha(kk)!==P.kh)return j({e:'bad'},400);if(!P.kh){const nk=crypto.randomBytes(4).toString('hex').toUpperCase();P.kh=sha(nk);P.rk=nk;save();return j({ok:1,key:nk})}return j({ok:1})}
  regs['r'+ip]=(regs['r'+ip]||0)+1;if(regs['r'+ip]>200)return j({e:'limit'},429);
  const key=/^[0-9A-F]{8}$/.test(kk)?kk:crypto.randomBytes(4).toString('hex').toUpperCase(),n=String(b.name||'').replace(/[<>&"'`]/g,'').trim().slice(0,20);
  db.players[id]={name:n.length<2?'Player':n,c:/^[A-Z]{2}$/.test(b.country)?b.country:'',t:now,kh:sha(key),rk:key,ref:'',re:1};save();return j({ok:1,key,created:1})}
 if(p=='restore'){cl[ip]=(cl[ip]||0)+1;if(cl[ip]>10)return j({e:'limit'},429);const id=String(b.id||'').trim().toUpperCase(),P=db.players[id];
  if(!P||!P.kh||sha(String(b.key||'').trim().toUpperCase())!==P.kh)return j({e:'bad'},400);return j({id,name:P.name,country:P.c})}
 if(p=='start'){if(!db.players[b.id])return j({e:'player'},400);if(!(b.game in RATE))return j({e:'bad'},400);const sid=crypto.randomBytes(8).toString('hex');sess[sid]={id:b.id,g:b.game,t:now,score:0,lives:3,level:1,asked:0,right:0,idle:0,seen:[]};return j({sid})}
 if(p=='score'){const s=sess[b.sid];delete sess[b.sid];if(!s||s.id!=b.id)return j({e:'sess'},400);
  const sec=(now-s.t)/1000,qz=s.g=='quiz',sc=qz?s.score:Math.floor(+b.score);if(!(sc>0)||(!qz&&(sec<5||sc>BASE[s.g]+RATE[s.g]*sec)))return j({e:'rejected'},400);
  const ns=Math.min(CAP,Math.round(sc*NORM[s.g]));db.scores.push({id:s.id,g:s.g,s:ns,t:now});const P=db.players[s.id];if(P&&P.ref&&!P.rok&&ns>0){P.rok=1;db.refs.push({by:P.ref,id:s.id,t:now})}save();return j({ok:1,score:ns})}
 if(p=='qrev'){const s=sess[b.sid];if(!s||s.g!='quiz'||s.id!=b.id||s.rev)return j({ok:0});s.rev=1;s.lives=3;s.idle=0;return j({ok:1})}// second chance (once per session)
 if(p=='qnext'||p=='qans'){const s=sess[b.sid];if(!s||s.g!='quiz'||s.id!=b.id||s.lives<=0)return j({e:'sess'},400);
  if(p=='qnext'){const dd=Math.min(3,1+Math.floor((s.level-1)/2)),hard=Math.random()<.6;let pool=Q.filter(x=>!s.seen.includes(x.i)&&(hard?x.d==dd:x.d<=dd));
   if(!pool.length)pool=Q.filter(x=>!s.seen.includes(x.i));if(!pool.length){s.seen=[];pool=Q}if(!pool.length)return j({e:'noq'},500);
   const x=pool[Math.random()*pool.length|0];s.seen.push(x.i);const o=[x.a,...x.w.slice(0,3)].map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(z=>z.v);
   s.cur={ci:o.indexOf(x.a),t:now};return j({q:x.q,f:x.f||'',o,lv:s.level,right:s.right,idle:s.idle,score:s.score,n:s.asked%10+1})}
  const c=s.cur;if(!c)return j({e:'noq'},400);s.cur=null;const el=(now-c.t)/1000,th=Math.max(0,Math.min(el,+b.th>=0?+b.th:el)),ok=+b.c===c.ci&&el<=25&&th<=11;let pts=0,up=0;
  if(ok){pts=30+Math.round(Math.max(0,10-th)*2.5)+(s.level-1)*5;s.score+=pts;s.right++}s.idle=+b.c<0?s.idle+1:0;s.asked++;const over=s.idle>=3;if(over)s.lives=0;else if(s.asked%10==0){s.level++;up=1}
  return j({ok,ci:c.ci,pts,score:s.score,right:s.right,idle:s.idle,level:s.level,up,over:over?1:0})}
 if(p=='ping'){if(db.players[b.id])online[b.id]=now;return j({ok:1})}
 if(p=='online'){const c={};let n=0;for(const id in online){if(now-online[id]>45e3){delete online[id];continue}n++;const cc=db.players[id]?.c||'';if(cc)c[cc]=(c[cc]||0)+1}return j({n,c})}
 if(p=='lb'){const q=u.searchParams,P=['d','w','m'].includes(q.get('p'))?q.get('p'):'d';return j(board(P,Math.min(+q.get('off')||0,1),P=='d'?10:20))}
 if(p=='winners')return j({lw:board('w',1,3),rw:refboard(1,3)});
 if(p=='refboard'){const q=u.searchParams,off=Math.min(+q.get('off')||0,1),me=q.get('id');const K=k(now,'w')-off;return j({rows:refboard(off,10),me:db.refs.filter(x=>x.by==me&&k(x.t,'w')==K).length})}
 if(p=='claim'||p=='support'){const id=String(b.id||'').trim().toUpperCase().slice(0,20),P=db.players[id]||{name:String(b.nm||'(unknown)').slice(0,30),c:String(b.cc||'').slice(0,2).toUpperCase(),unk:1};if(id.length<3)return j({e:'id'},400);// a message is never blocked just because the server lost the player record
  if(p=='support'&&db.msgs.filter(x=>x.id==id&&x.p=='support'&&now-x.t<36e5).length>=30)return j({ok:1,sent:true,n:0});// silent spam guard, no error shown
  const em=String(b.email||'').trim().slice(0,100);if(!/^\S+@\S+\.\S+$/.test(em))return j({e:'email'},400);
  const ist=new Date(now+19800000).toISOString().replace('T',' ').slice(0,16)+' IST';let sub,body;
  if(p=='claim'){const w=String(b.wallet||'').trim();if(!/^0x[a-fA-F0-9]{40}$/.test(w))return j({e:'wallet'},400);const ty=['weekly','invite'].includes(b.type)?b.type:'weekly',wk=k(now,'w'),dup=db.msgs.find(x=>x.p=='claim'&&k(x.t,'w')==wk&&(x.id==id||String(x.w).toLowerCase()==w.toLowerCase()||String(x.em).toLowerCase()==em.toLowerCase()));
   if(dup)return j({e:'weekly',n:dup.n},400);
   const lw=board('w',1,3,1).find(x=>x.id==id),li=refboard(1,3,1).find(x=>x.id==id),el=lw?'Game top '+lw.r+' (last week)':li?'Invite top '+li.r+' (last week)':'NOT in last week top 3'+(P.unk?' | ⚠ Player ID not found on server (data reset?)':'');
   const rr=ty=='invite'?li:lw,amt=(rr&&PRIZES[ty=='invite'?'invite':'game'][rr.r-1])||0;
   sub='SquardGames Prize Claim - '+id;body='Prize type: '+ty+'\nPlayer ID: '+id+'\nName: '+P.name+'\nCountry: '+P.c+'\nWallet (BNB BEP20): '+w+'\nEmail: '+em+'\nTime: '+ist;db.msgs.push({n:db.cn=(db.cn||0)+1,t:now,p,id,nm:P.name,cc:P.c,ty,w,em,el,amt,wd:(lw||li)?wkDate(k(now,'w')-1):istDate(now),st:'pending',note:'',tx:''})}
  else{const m=String(b.msg||'').trim().slice(0,1000);if(m.length<3)return j({e:'msg'},400);sub='SquardGames Support - '+id;body='Player ID: '+id+'\nName: '+P.name+'\nCountry: '+P.c+'\nEmail: '+em+'\nTime: '+ist+'\n\n'+m;db.msgs.push({n:db.cn=(db.cn||0)+1,t:now,p,id,nm:P.name,cc:P.c,em,m,st:'new',note:'',tx:''})}
  P.em=em;if(db.msgs.length>5000)db.msgs.shift();save();const nn=db.cn;mail(sub,body,em).catch(()=>{});return j({ok:1,sent:true,n:nn})}   // e-mail goes out in the background, player gets an instant reply
 if(p=='paid')return j(db.msgs.filter(x=>x.p=='claim'&&x.st=='paid').sort((a,b)=>String(b.wd||istDate(b.paidAt||b.t)).localeCompare(String(a.wd||istDate(a.paidAt||a.t)))||(b.paidAt||0)-(a.paidAt||0)).slice(0,40).map(x=>({n:x.nm||'Player',c:x.cc||'',a:x.amt||0,d:x.wd||istDate(x.paidAt||x.t),ty:x.ty})));
 if(p=='hist'){snap();const m=r=>r.map(x=>({r:x.r,n:x.n,c:x.c,s:x.s}));return j(Object.values(db.hist||{}).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,12).filter(x=>x.g.length||x.i.length).map(x=>({d:x.d,g:m(x.g),i:m(x.i),pz:x.pz||PRIZES})))}
 if(p=='push'){const t=String(b.token||'');if(t.length<50||t.length>500)return j({e:'bad'},400);db.push=db.push||{};if(!db.push[t]&&Object.keys(db.push).length>=20000)return j({e:'full'},400);db.push[t]={t:now,id:String(b.id||'').slice(0,12)};save();return j({ok:1})}   // public list of paid winners
 if(p=='myclaims'){const id=String(u.searchParams.get('id')||'').toUpperCase();return j(db.msgs.filter(x=>x.id==id&&x.p=='claim').map(x=>({n:x.n,t:x.t,ty:x.ty,st:x.st,note:x.note,tx:x.tx})).reverse())}
 if(p.startsWith('admin/')){const K=process.env.ADMIN_KEY;adm[ip]=adm[ip]||0;if(!K||adm[ip]>=10||String(b.key||'')!==K){if(K)adm[ip]++;return j({e:'no'},403)}
  if(p=='admin/list')return j({claims:db.msgs.filter(x=>x.p=='claim').reverse(),support:db.msgs.filter(x=>x.p=='support').reverse(),prizes:PRIZES,push:Object.keys(db.push||{}).length,hist:Object.values(db.hist||{}).sort((a,b)=>b.d.localeCompare(a.d)),players:Object.keys(db.players).length,lw:board('w',1,3,1),cw:board('w',0,3,1),lr:refboard(1,3,1),cr:refboard(0,3,1)});
  if(p=='admin/set'){const x=db.msgs.find(z=>z.n==b.n);if(!x)return j({e:'n'},404);if(['pending','approved','paid','rejected','new','done'].includes(b.st)){if(b.st=='paid'&&x.st!='paid')x.paidAt=now;x.st=b.st}if(b.amt!==undefined&&b.amt!=='')x.amt=Math.max(0,Math.min(1000,+b.amt||0));x.note=String(b.note||'').slice(0,300);x.tx=String(b.tx||'').slice(0,120);
   if(/^\d{4}-\d{2}-\d{2}$/.test(b.wd||''))x.wd=b.wd;if(b.w!==undefined&&x.p=='claim')x.w=String(b.w).slice(0,60);if(b.em!==undefined)x.em=String(b.em).slice(0,100);if(['weekly','invite'].includes(b.ty))x.ty=b.ty;save();return j({ok:1})}
  if(p=='admin/addwinner'){const id=String(b.id||'').trim().toUpperCase(),P=db.players[id]||{},x={n:db.cn=(db.cn||0)+1,t:now,p:'claim',id:id||'(manual)',nm:String(b.nm||P.name||'Player').slice(0,30),cc:String(b.cc||P.c||'').slice(0,2).toUpperCase(),ty:b.ty=='invite'?'invite':'weekly',w:String(b.w||'').slice(0,60),em:String(b.em||P.em||'').slice(0,100),el:'added by admin',amt:Math.max(0,Math.min(1000,+b.amt||0)),st:'paid',note:'',tx:'',paidAt:now,wd:/^\d{4}-\d{2}-\d{2}$/.test(b.wd||'')?b.wd:istDate(now)};db.msgs.push(x);save();return j({ok:1,n:x.n})}
  if(p=='admin/del'){const i=db.msgs.findIndex(z=>z.n==b.n);if(i<0)return j({e:'n'},404);db.msgs.splice(i,1);save();return j({ok:1})}
  if(p=='admin/player'){const P=db.players[String(b.id||'').toUpperCase()];if(!P)return j({e:'id'},404);if(b.name!==undefined){const n=String(b.name).replace(/[<>&"'`]/g,'').trim().slice(0,20);if(n.length>=2)P.name=n}if(b.c!==undefined)P.c=/^[A-Za-z]{2}$/.test(b.c)?b.c.toUpperCase():'';save();return j({ok:1})}
  if(p=='admin/adjust'){const id=String(b.id||'').toUpperCase();if(!db.players[id])return j({e:'id'},404);const pts=Math.max(-100000,Math.min(100000,Math.round(+b.pts||0)));if(!pts)return j({e:'pts'},400);let t=now;if(/^\d{4}-\d{2}-\d{2}$/.test(b.date||''))t=Date.parse(b.date+'T00:00:00Z')-TZ*36e5+12*36e5;db.bonus.push({id,pts,t,by:'admin'});if(db.hist)delete db.hist[k(t,'w')];snap();save();return j({ok:1})}   // history of that week is rebuilt
  if(p=='admin/delplayer'){const id=String(b.id||'').toUpperCase();if(!db.players[id])return j({e:'id'},404);delete db.players[id];db.scores=db.scores.filter(x=>x.id!=id);db.refs=db.refs.filter(x=>x.by!=id&&x.id!=id);db.bonus=db.bonus.filter(x=>x.id!=id);Object.values(db.hist||{}).forEach(h=>{for(const f of ['g','i']){h[f]=h[f].filter(x=>x.id!=id);h[f].forEach((x,i)=>x.r=i+1)}});save();return j({ok:1})}
  if(p=='admin/notify'){const t=String(b.title||'').slice(0,80),m=String(b.body||'').slice(0,240);if(!t||!m)return j({e:'text'},400);sendPush(t,m,String(b.image||'').slice(0,400),String(b.link||'').slice(0,300)).then(r=>j({ok:1,...r})).catch(e=>j({e:'push',msg:String(e.message).slice(0,120)},500));return}
  if(p=='admin/players'){const q=String(b.q||'').trim().toLowerCase();let dn;try{dn=new Intl.DisplayNames(['en'],{type:'region'})}catch{}
   const wsm={};board('w',0,1e6,1).forEach(r=>wsm[r.id]=r.s);const rows=Object.entries(db.players).map(([id,P])=>{const ms=db.msgs.filter(x=>x.id==id);return{id,name:P.name,c:P.c||'',cn:(dn&&P.c&&dn.of(P.c))||'',t:P.t,ws:wsm[id]||0,rk:P.rk||'',ems:[...new Set([P.em,...ms.map(x=>x.em)].filter(Boolean))],ws2:[...new Set(ms.filter(x=>x.w).map(x=>x.w))].map(w=>w.replace(/[<>&"']/g,'')).join('<br>'),claims:ms.filter(x=>x.p=='claim').length}});
   const hit=rows.filter(r=>!q||[r.id,r.name,r.c,r.cn,...r.ems,r.ws2].join(' ').toLowerCase().includes(q)).sort((a,b)=>b.t-a.t).slice(0,60);return j({rows:hit,total:rows.length})}
  if(p=='admin/resetkey'){const id=String(b.id||'').toUpperCase(),P=db.players[id];if(!P)return j({e:'id'},404);const key=crypto.randomBytes(4).toString('hex').toUpperCase();P.kh=sha(key);P.rk=key;save();return j({ok:1,key})}
  return j({e:'404'},404)}
 j({e:'404'},404)}
const ORIGINS=(process.env.ALLOWED_ORIGINS||'https://squardgames.web.app,https://squardgames.firebaseapp.com').split(',').map(s=>s.trim());// website(s) allowed to call this API from another domain (Firebase Hosting)
const MT={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon'};
http.createServer((q,r)=>{const u=new URL(q.url,'http://x'),ip=(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim();
 let cors={};const og=q.headers.origin;if(og&&(ORIGINS.includes(og)||/^http:\/\/localhost(:\d+)?$/.test(og)))cors={'access-control-allow-origin':og,'vary':'Origin','access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,OPTIONS'};
 const j=(o,c=200)=>{r.writeHead(c,{'content-type':'application/json',...cors});r.end(JSON.stringify(o))};
 if(q.method=='OPTIONS'){r.writeHead(204,cors);return r.end()}
 if(TR.handle(q,r,u,j))return;   // Google Trends pages + /api/trends
 if(u.pathname.startsWith('/api/')){if(!ready)return j({e:'starting'},503);hits[ip]=(hits[ip]||0)+1;if(hits[ip]>240)return j({e:'rate'},429);
  if(q.method!='POST')return api(u,{},ip,j);let b='';q.on('data',d=>{b+=d;if(b.length>5e3)q.destroy()});
  return q.on('end',()=>{try{api(u,JSON.parse(b||'{}'),ip,j)}catch{j({e:'bad'},400)}})}
 let f=path.join(PUB,u.pathname=='/'?'index.html':u.pathname);if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(PUB,'index.html');
 r.writeHead(200,{'content-type':MT[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(r)}).listen(PORT,()=>console.log('SquardGames on '+PORT));
init();TR.start();   // Google Trends: auto-updates itself every few hours
const SELF=process.env.SELF_URL||process.env.RENDER_EXTERNAL_URL;   // Render gives RENDER_EXTERNAL_URL automatically
if(SELF)setInterval(()=>fetch(SELF+'/api/online').catch(()=>{}),10*60*1000),console.log('Keep-alive ping every 10 min ->',SELF);
process.on('SIGTERM',async()=>{try{if(SA){dirty=1;await Promise.race([flush(),new Promise(r=>setTimeout(r,8000))])}else save()}catch{}setTimeout(()=>process.exit(0),300)});
