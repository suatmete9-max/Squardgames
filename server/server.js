const express=require('express'),http=require('http'),{Server}=require('socket.io'),cron=require('node-cron');
const {Country,State}=require('country-state-city'),store=require('./store'),upd=require('./updater'),CATS=require('./categories');
const app=express(),srv=http.createServer(app),io=new Server(srv,{cors:{origin:'*'}});
app.use((q,r,n)=>{r.setHeader('Access-Control-Allow-Origin','*');n();});
app.use(express.static(__dirname+'/../public'));
const Q={};const loadQ=async()=>{for(const c of CATS)Q[c.id]=await store.getQ(c.id);};
const PERIOD={day:864e5,week:6048e5,month:2592e6};
app.get('/ping',(q,r)=>r.send('ok'));
app.get('/api/categories',(q,r)=>r.json(CATS));
app.get('/api/countries',(q,r)=>r.json(Country.getAllCountries().map(c=>({code:c.isoCode,name:c.name}))));
app.get('/api/states/:c',(q,r)=>r.json(State.getStatesOfCountry(q.params.c).map(s=>s.name)));
app.get('/api/leaderboard',async(q,r)=>{const{cat,period='week',country,state}=q.query;
 const rows=(await store.recent(PERIOD[period]||PERIOD.week)).filter(e=>(!cat||e.cat===cat)&&(!country||e.country===country)&&(!state||e.state===state));
 const m={};for(const e of rows){const u=m[e.uid]||(m[e.uid]={name:e.name,country:e.country,cc:e.cc,state:e.state,score:0});u.score+=e.score;}
 r.json(Object.values(m).sort((a,b)=>b.score-a.score).slice(0,10));});
app.get('/admin/update',(q,r)=>{if(!process.env.ADMIN_KEY||q.query.key!==process.env.ADMIN_KEY)return r.sendStatus(403);
 upd.run().then(loadQ);r.send('update started');});
cron.schedule('5 0 * * *',()=>upd.run().then(loadQ));

const rooms={},queues={},COLS=['#e5383b','#2a9d4f','#f4b400','#2f6fed'],TIME=15;
const EXAM=new Set(['class10','class11','class12','neet','engineering','cbse']),RS=r=>EXAM.has(r.cat)?20:10;
const BOTS=['Rohan','Ayesha','Sam','Priya','Ali','Maya','Leo','Zara'];
const uidRoom={};const code=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const pub=r=>({id:r.id,size:r.size,cat:r.cat,players:r.players.filter(p=>!p.gone).map(p=>({name:p.name,country:p.country,cc:p.cc,col:p.col,score:p.score,bot:p.bot}))});
function newRoom(size,cat,priv){const id=code();return rooms[id]={id,size,cat,priv,players:[],turn:-1,round:1,qn:0,used:new Set(),state:'wait',dec:{}};}
function addP(r,p){p.col=COLS[r.players.length%4];p.score=0;p.saved=0;if(p.uid)uidRoom[p.uid]=r.id;r.players.push(p);if(p.sock)p.sock.join(r.id);io.to(r.id).emit('lobby',pub(r));}
function fill(r){while(r.players.length<r.size)addP(r,{bot:true,name:'Bot '+BOTS[Math.floor(Math.random()*BOTS.length)],country:'',cc:''});}
function kill(r){for(const p of r.players)if(p.uid&&uidRoom[p.uid]===r.id)delete uidRoom[p.uid];[r.timer,r.bt,r.wt,r.dt,r.endt,...(r.bts||[])].forEach(clearTimeout);for(const k in queues)if(queues[k]===r)delete queues[k];
 for(const p of r.players)if(p.sock&&p.sock.rid===r.id)p.sock.rid=null;delete rooms[r.id];}
function start(r){if(r.state!=='wait')return;clearTimeout(r.wt);fill(r);r.state='play';
 for(const k in queues)if(queues[k]===r)delete queues[k];io.to(r.id).emit('start',pub(r));setTimeout(()=>next(r),1500);}
function next(r){if(!rooms[r.id])return;if(r.qn>=RS(r))return roundEnd(r);
 const pool=Q[r.cat]||[];if(!pool.length){io.to(r.id).emit('err','Is category mein abhi questions nahi hain');io.to(r.id).emit('left');return kill(r);}
 if(r.used.size>=pool.length)r.used.clear();
 r.qn++;let i,t=0;do{i=Math.floor(Math.random()*pool.length);}while(r.used.has(i)&&++t<50);
 r.used.add(i);r.q=pool[i];r.t0=Date.now();r.got=new Map();
 io.to(r.id).emit('q',{q:r.q.q,o:r.q.o,time:TIME,round:r.round,qn:r.qn,max:RS(r)});
 r.bts=r.players.filter(p=>p.bot&&!p.gone).map(p=>setTimeout(()=>submit(r,p,Math.random()<.65?r.q.a:Math.floor(Math.random()*4)),1500+Math.random()*7000));
 r.timer=setTimeout(()=>endQ(r),(TIME+.5)*1000);}
function checkAll(r){if(r.q&&r.players.every(p=>p.gone||r.got.has(p))){clearTimeout(r.timer);clearTimeout(r.endt);r.endt=setTimeout(()=>endQ(r),1300);}}
// har player ka jawab sirf usi ko dikhta hai ('mine'); baaki ko sirf score badalta dikhta hai
function submit(r,p,ch){if(!r.q||p.gone||r.got.has(p))return;const el=Date.now()-r.t0,ok=ch===r.q.a;r.got.set(p,ch);
 p.ans=(p.ans||0)+1;p.tsum=(p.tsum||0)+el;if(ok)p.right=(p.right||0)+1;if(!p.bot)p.missed=0;
 const gain=ok?10+Math.max(0,Math.ceil(TIME-el/1000)):0;p.score+=gain;
 if(!p.bot&&p.sock)p.sock.emit('mine',{choice:ch,answer:r.q.a,ok,gain});
 io.to(r.id).emit('scores',pub(r).players);checkAll(r);}
function endQ(r){if(!r.q)return;[r.timer,r.endt,...(r.bts||[])].forEach(clearTimeout);
 for(const p of r.players)if(!p.gone&&!r.got.has(p)){p.ans=(p.ans||0)+1;p.tsum=(p.tsum||0)+TIME*1000;
  if(!p.bot){p.missed=(p.missed||0)+1;if(p.sock)p.sock.emit('mine',{choice:-1,answer:r.q.a,ok:false,gain:0});}}
 io.to(r.id).emit('qEnd',{answer:r.q.a,players:pub(r).players});r.q=null;setTimeout(()=>next(r),1700);}
function roundEnd(r){r.state='between';r.dec={};
 for(const p of r.players){if(p.ans>=8&&p.right/p.ans>=.95&&p.tsum/p.ans<1500&&!p.cheat){p.cheat=true;if(p.sock)p.sock.emit('warn','Anti-cheat: shaq wali activity mili. Aapka score leaderboard mein nahi jayega.');}
  if(!p.bot&&p.uid&&!p.cheat){const g=p.score-p.saved;p.saved=p.score;
  if(g>0&&g<=RS(r)*30)store.addScore({uid:p.uid,name:p.name,country:p.country,cc:p.cc,state:p.state,cat:r.cat,score:g,ts:Date.now()}).catch(console.log);}}
 io.to(r.id).emit('roundEnd',{round:r.round,players:pub(r).players});r.dt=setTimeout(()=>decide(r),60000);}
function maybeDecide(r){if(r.state!=='between')return;
 if(r.players.filter(p=>!p.bot&&!p.gone).every(p=>p.sid in r.dec))decide(r);}
function decide(r){if(r.state!=='between')return;clearTimeout(r.dt);
 for(const p of r.players)if(!p.bot&&!p.gone&&(r.dec[p.sid]===false||(r.dec[p.sid]!==true&&(p.missed||0)>=3))){delete uidRoom[p.uid];p.gone=true;p.sock.emit('left');p.sock.leave(r.id);p.sock.rid=null;}
 r.players=r.players.filter(p=>!p.gone);if(!r.players.some(p=>!p.bot))return kill(r);
 r.players.forEach((p,i)=>p.col=COLS[i%4]);r.round++;r.qn=0;r.turn=-1;r.state='play';
 io.to(r.id).emit('start',pub(r));setTimeout(()=>next(r),1500);}
const clean=(d,s)=>({sock:s,sid:s.id,uid:String(d.uid||s.id).slice(0,40),name:String(d.name||'').replace(/[<>&"'`]/g,'').trim().slice(0,16)||'Player',
 country:String(d.country||'').slice(0,60),cc:String(d.cc||'').slice(0,2),state:String(d.state||'').slice(0,60),bot:false});
const ludo=require('./ludo')(io);
io.on('connection',s=>{ludo(s);
 s.onAny&&s.onAny(()=>{const n=Date.now();s.rl=(s.rl||[]).filter(t=>n-t<1000);s.rl.push(n);if(s.rl.length>25)s.disconnect(true);});
 const busy=d=>{const u=String((d&&d.uid)||s.id).slice(0,40);return uidRoom[u]&&rooms[uidRoom[u]];};
 s.emit('online',io.engine.clientsCount);
 s.on('find',d=>{const size=[1,2,3,4].includes(d.size)?d.size:2,cat=CATS.some(c=>c.id===d.cat)?d.cat:'gk';if(s.rid)return;if(busy(d))return s.emit('err','Aap pehle se ek game mein ho');let r;
  if(size===1)r=newRoom(2,cat);else{const k=size+cat;r=queues[k]||(queues[k]=newRoom(size,cat));}
  s.rid=r.id;addP(r,clean(d,s));if(r.players.length>=size)start(r);else if(!r.wt)r.wt=setTimeout(()=>start(r),6000);});
 s.on('create',d=>{if(s.rid)return;if(busy(d))return s.emit('err','Aap pehle se ek game mein ho');const r=newRoom([2,3,4].includes(d.size)?d.size:4,CATS.some(c=>c.id===d.cat)?d.cat:'gk',true);s.rid=r.id;addP(r,clean(d,s));s.emit('code',r.id);});
 s.on('join',d=>{const r=rooms[String(d.code||'').toUpperCase()];if(s.rid)return;if(busy(d))return s.emit('err','Aap pehle se ek game mein ho');
  if(!r||r.state!=='wait'||r.players.length>=r.size)return s.emit('err','Room nahi mila ya full hai');s.rid=r.id;addP(r,clean(d,s));s.emit('code',r.id);});
 s.on('startPrivate',()=>{const r=rooms[s.rid];if(r&&r.priv&&r.players[0].sid===s.id)start(r);});
 s.on('answer',i=>{const r=rooms[s.rid];if(!r||!r.q)return;const p=r.players.find(x=>x.sid===s.id);if(!p||p.gone||r.got.has(p))return;i=Number(i);if(!(i>=0&&i<=3))return;
  const el=Date.now()-r.t0;if(el<400){p.sus=(p.sus||0)+1;if(p.sus>=3&&!p.cheat){p.cheat=true;s.emit('warn','Anti-cheat: shaq wali activity mili. Aapka score leaderboard mein nahi jayega.');}if(el<250)return s.emit('retry');}
  submit(r,p,i);});
 s.on('cont',()=>{const r=rooms[s.rid];if(r&&r.state==='between'){r.dec[s.id]=true;maybeDecide(r);}});
 s.on('quit',()=>{const r=rooms[s.rid];if(!r)return;const p=r.players.find(x=>x.sid===s.id);if(!p)return;
  p.gone=true;r.dec[s.id]=false;delete uidRoom[p.uid];s.leave(r.id);s.rid=null;s.emit('left');
  if(!r.players.some(x=>!x.bot&&!x.gone))return kill(r);maybeDecide(r);});
 s.on('leave',()=>{const r=rooms[s.rid];if(!r)return;const p=r.players.find(x=>x.sid===s.id);if(!p)return;
  if(r.state==='wait'){r.players=r.players.filter(x=>x!==p);r.players.forEach((x,i)=>x.col=COLS[i%4]);io.to(r.id).emit('lobby',pub(r));}
  else{p.gone=true;r.dec[s.id]=false;checkAll(r);}
  delete uidRoom[p.uid];s.leave(r.id);s.rid=null;if(!r.players.some(x=>!x.bot&&!x.gone))return kill(r);maybeDecide(r);});
 s.on('chat',m=>{const r=rooms[s.rid];if(!r)return;const now=Date.now();if(now-(s.lc||0)<700)return;s.lc=now;
  const p=r.players.find(x=>x.sid===s.id);if(!p||p.gone)return;const t=String(m||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,100);if(!t||/https?:|www\.|\.(com|net|org|in|xyz)\b/i.test(t)||(s.lt===t&&now-(s.lt2||0)<5000))return;s.lt=t;s.lt2=now;
  io.to(r.id).emit('chat',{name:p.name,cc:p.cc,col:p.col,t});});
 s.on('disconnect',()=>{const r=rooms[s.rid];if(!r)return;const p=r.players.find(x=>x.sid===s.id);if(!p)return;
  if(r.state==='wait'){r.players=r.players.filter(x=>x!==p);r.players.forEach((x,i)=>x.col=COLS[i%4]);io.to(r.id).emit('lobby',pub(r));}
  else{p.gone=true;delete uidRoom[p.uid];checkAll(r);}
  if(!r.players.some(x=>!x.bot&&!x.gone))return kill(r);maybeDecide(r);});
});
setInterval(()=>io.emit('online',io.engine.clientsCount),5000);
loadQ().then(()=>srv.listen(process.env.PORT||3000,()=>console.log('QuizArena chal raha hai')));
