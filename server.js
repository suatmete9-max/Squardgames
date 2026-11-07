const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,TZ=+(process.env.TZ_OFFSET||5.5),DB=path.join(process.env.DATA_DIR||__dirname,'data.json'),PUB=path.join(__dirname,'public');
let db={players:{},scores:[],bonus:[],refs:[],msgs:[]};try{db=JSON.parse(fs.readFileSync(DB))}catch{}db.refs=db.refs||[];db.msgs=db.msgs||[];
const save=()=>fs.writeFile(DB,JSON.stringify(db),()=>{});setInterval(save,30000);
const sess={},online={},hits={},regs={},cl={},adm={},tls=require('tls'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const NORM={water:1.5,quiz:1,birds:.12,jewel:.4},CAP=3000;// keep in sync with NRM/CAP in public/app.js. Balances points: similar score per minute in every game, max CAP per game
setInterval(()=>{for(const i in cl)delete cl[i];for(const i in adm)delete adm[i]},36e5);
setInterval(()=>{for(const i in hits)delete hits[i]},60000);setInterval(()=>{for(const i in regs)delete regs[i]},864e5);
const RATE={water:6,quiz:0,birds:80,jewel:30},BASE={water:1500,quiz:0,birds:5000,jewel:3000};
const QF=path.join(__dirname,'data','questions.json');let Q=[];
function loadQ(){try{Q=JSON.parse(fs.readFileSync(QF,'utf8')).filter(x=>x&&x.q&&x.a&&Array.isArray(x.w)&&x.w.length>=3).map((x,i)=>({...x,i,d:[1,2,3].includes(+x.d)?+x.d:2}));console.log('Questions loaded:',Q.length)}catch(e){console.log('questions load failed',e.message)}}
loadQ();fs.watchFile(QF,{interval:2000},loadQ);
setInterval(()=>{const o=Date.now()-36e5;for(const i in sess)if(sess[i].t<o)delete sess[i]},6e5);
const k=(t,p)=>{const L=t+TZ*36e5,d=Math.floor(L/864e5);if(p=='d')return d;if(p=='w')return Math.floor((d+3)/7);const x=new Date(L);return x.getUTCFullYear()*12+x.getUTCMonth()};
const mask=id=>id.slice(0,3)+'••'+id.slice(-2);
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
  const key=crypto.randomBytes(4).toString('hex').toUpperCase();db.players[id]={name:n,c,t:now,kh:sha(key),ref:(b.ref&&db.players[b.ref]&&b.ref!=id&&regs[ip]<=2)?b.ref:''};
  save();return j({id,name:n,country:c,key})}
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
  const c=s.cur;if(!c)return j({e:'noq'},400);s.cur=null;const el=(now-c.t)/1000,ok=+b.c===c.ci&&el<=17;let pts=0,up=0;
  if(ok){pts=30+Math.round(Math.max(0,15-el)*1.7)+(s.level-1)*5;s.score+=pts;s.right++}s.idle=+b.c<0?s.idle+1:0;s.asked++;const over=s.idle>=3;if(over)s.lives=0;else if(s.asked%10==0){s.level++;up=1}
  return j({ok,ci:c.ci,pts,score:s.score,right:s.right,idle:s.idle,level:s.level,up,over:over?1:0})}
 if(p=='ping'){if(db.players[b.id])online[b.id]=now;return j({ok:1})}
 if(p=='online'){const c={};let n=0;for(const id in online){if(now-online[id]>45e3){delete online[id];continue}n++;const cc=db.players[id]?.c||'';if(cc)c[cc]=(c[cc]||0)+1}return j({n,c})}
 if(p=='lb'){const q=u.searchParams,P=['d','w','m'].includes(q.get('p'))?q.get('p'):'d';return j(board(P,Math.min(+q.get('off')||0,1),P=='d'?10:20))}
 if(p=='winners')return j({lw:board('w',1,3),rw:refboard(1,3)});
 if(p=='refboard'){const q=u.searchParams,off=Math.min(+q.get('off')||0,1),me=q.get('id');const K=k(now,'w')-off;return j({rows:refboard(off,10),me:db.refs.filter(x=>x.by==me&&k(x.t,'w')==K).length})}
 if(p=='claim'||p=='support'){const id=String(b.id||'').trim().toUpperCase(),P=db.players[id];if(!P)return j({e:'id'},400);cl[ip]=(cl[ip]||0)+1;if(cl[ip]>6)return j({e:'limit'},429);
  const em=String(b.email||'').trim().slice(0,100);if(!/^\S+@\S+\.\S+$/.test(em))return j({e:'email'},400);
  const ist=new Date(now+19800000).toISOString().replace('T',' ').slice(0,16)+' IST';let sub,body;
  if(p=='claim'){const w=String(b.wallet||'').trim();if(!/^0x[a-fA-F0-9]{40}$/.test(w))return j({e:'wallet'},400);const ty=['weekly','invite'].includes(b.type)?b.type:'weekly';
   sub='SquardGames Prize Claim - '+id;body='Prize type: '+ty+'\nPlayer ID: '+id+'\nName: '+P.name+'\nCountry: '+P.c+'\nWallet (BNB BEP20): '+w+'\nEmail: '+em+'\nTime: '+ist;db.msgs.push({n:db.cn=(db.cn||0)+1,t:now,p,id,nm:P.name,cc:P.c,ty,w,em,st:'pending',note:'',tx:''})}
  else{const m=String(b.msg||'').trim().slice(0,1000);if(m.length<3)return j({e:'msg'},400);sub='SquardGames Support - '+id;body='Player ID: '+id+'\nName: '+P.name+'\nCountry: '+P.c+'\nEmail: '+em+'\nTime: '+ist+'\n\n'+m;db.msgs.push({n:db.cn=(db.cn||0)+1,t:now,p,id,nm:P.name,cc:P.c,em,m,st:'new',note:'',tx:''})}
  if(db.msgs.length>5000)db.msgs.shift();save();const nn=db.cn;mail(sub,body,em).then(ok=>j({ok:1,sent:ok,n:nn}));return}
 if(p=='myclaims'){const id=String(u.searchParams.get('id')||'').toUpperCase();return j(db.msgs.filter(x=>x.id==id&&x.p=='claim').map(x=>({n:x.n,t:x.t,ty:x.ty,st:x.st,note:x.note,tx:x.tx})).reverse())}
 if(p.startsWith('admin/')){const K=process.env.ADMIN_KEY;adm[ip]=adm[ip]||0;if(!K||adm[ip]>=10||String(b.key||'')!==K){if(K)adm[ip]++;return j({e:'no'},403)}
  if(p=='admin/list')return j({claims:db.msgs.filter(x=>x.p=='claim').reverse(),support:db.msgs.filter(x=>x.p=='support').reverse(),players:Object.keys(db.players).length,lw:board('w',1,3,1),cw:board('w',0,3,1),lr:refboard(1,3,1),cr:refboard(0,3,1)});
  if(p=='admin/set'){const x=db.msgs.find(z=>z.n==b.n);if(!x)return j({e:'n'},404);if(['pending','approved','paid','rejected','new','done'].includes(b.st))x.st=b.st;x.note=String(b.note||'').slice(0,300);x.tx=String(b.tx||'').slice(0,120);save();return j({ok:1})}
  return j({e:'404'},404)}
 j({e:'404'},404)}
const ORIGINS=(process.env.ALLOWED_ORIGINS||'https://squardgames.web.app,https://squardgames.firebaseapp.com').split(',').map(s=>s.trim());// website(s) allowed to call this API from another domain (Firebase Hosting)
const MT={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon'};
http.createServer((q,r)=>{const u=new URL(q.url,'http://x'),ip=(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim();
 let cors={};const og=q.headers.origin;if(og&&(ORIGINS.includes(og)||/^http:\/\/localhost(:\d+)?$/.test(og)))cors={'access-control-allow-origin':og,'vary':'Origin','access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,OPTIONS'};
 const j=(o,c=200)=>{r.writeHead(c,{'content-type':'application/json',...cors});r.end(JSON.stringify(o))};
 if(q.method=='OPTIONS'){r.writeHead(204,cors);return r.end()}
 if(u.pathname.startsWith('/api/')){hits[ip]=(hits[ip]||0)+1;if(hits[ip]>240)return j({e:'rate'},429);
  if(q.method!='POST')return api(u,{},ip,j);let b='';q.on('data',d=>{b+=d;if(b.length>5e3)q.destroy()});
  return q.on('end',()=>{try{api(u,JSON.parse(b||'{}'),ip,j)}catch{j({e:'bad'},400)}})}
 let f=path.join(PUB,u.pathname=='/'?'index.html':u.pathname);if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(PUB,'index.html');
 r.writeHead(200,{'content-type':MT[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(r)}).listen(PORT,()=>console.log('SquardGames on '+PORT));
process.on('SIGTERM',()=>{save();setTimeout(()=>process.exit(0),300)});
