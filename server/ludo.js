// Online Ludo: real players + bots (Bot 🤖 ke naam se). Server hi dice aur moves tay karta hai (cheat nahi ho sakta).
const {Ludo}=require('../public/ludo-engine.js');
const BN=['Rohan','Ayesha','Sam','Priya','Ali','Maya','Leo','Zara'],SEATS={2:[0,2],3:[0,1,2],4:[0,1,2,3]},TURN=15000;
module.exports=io=>{const games={},queue={};let n=0;
 const meta=g=>g.pl.map(p=>({name:p.name,cc:p.cc,bot:!!p.bot||!!p.auto}));
 const push=(g,last)=>io.to(g.id).emit('ludoState',{snap:g.G.snap(),last,deadline:g.dl,players:meta(g)});
 const kill=g=>{clearTimeout(g.t);clearTimeout(g.wt);for(const k in queue)if(queue[k]===g)delete queue[k];for(const p of g.pl)if(p.sock&&p.sock.lid===g.id)p.sock.lid=null;delete games[g.id];};
 const humans=g=>g.pl.filter(p=>!p.bot&&!p.auto&&!p.gone);
 function start(g){if(g.state!=='wait')return;clearTimeout(g.wt);for(const k in queue)if(queue[k]===g)delete queue[k];
  while(g.pl.length<g.size)g.pl.push({bot:true,name:'Bot '+BN[Math.floor(Math.random()*BN.length)],cc:''});
  g.G=new Ludo(SEATS[g.size]);g.state='play';
  g.pl.forEach((p,i)=>{if(p.sock)p.sock.emit('ludoStart',{players:meta(g),me:SEATS[g.size][i],snap:g.G.snap()});});g.t=setTimeout(()=>act(g),900);}
 function act(g){if(!games[g.id]||g.G.winner>=0)return;clearTimeout(g.t);const p=g.pl[g.G.ti];
  if(p.bot||p.auto){g.dl=0;push(g,null);g.t=setTimeout(()=>step(g),p.bot?900:700);}
  else{g.dl=Date.now()+TURN;push(g,null);g.t=setTimeout(()=>{p.miss=(p.miss||0)+1;if(p.miss>=3)p.auto=true;step(g);},TURN);}}
 function step(g){if(!games[g.id])return;if(g.G.phase==='roll')roll(g);else if(g.G.phase==='pick')move(g,g.G.bot());}
 function roll(g){clearTimeout(g.t);const ev=g.G.roll();if(!ev)return;push(g,{roll:ev});
  if(ev.pass)g.t=setTimeout(()=>act(g),1200);
  else{const p=g.pl[g.G.ti];if(p.bot||p.auto||g.G.mv.length===1)g.t=setTimeout(()=>move(g,p.bot||p.auto?g.G.bot():g.G.mv[0]),900);else act(g);}}
 function move(g,t){clearTimeout(g.t);const ev=g.G.move(t);if(!ev)return;push(g,{move:ev});
  if(g.G.winner>=0){const w=g.G.winner,i=g.G.seats.indexOf(w);io.to(g.id).emit('ludoOver',{winner:w,name:g.pl[i].name,players:meta(g)});g.t=setTimeout(()=>kill(g),5000);return;}
  g.t=setTimeout(()=>act(g),700+Math.abs(ev.to-Math.max(ev.from,0))*130);}
 return s=>{
  s.on('ludoFind',d=>{const size=[2,3,4].includes(d&&d.size)?d.size:4;if(s.lid)return;
   let g=queue[size];if(!g){g=queue[size]={id:'L'+(++n),size,pl:[],state:'wait'};games[g.id]=g;g.wt=setTimeout(()=>start(g),6000);}
   s.lid=g.id;s.join(g.id);g.pl.push({sock:s,sid:s.id,name:String(d.name||'').replace(/[<>&"'`]/g,'').trim().slice(0,16)||'Player',cc:String(d.cc||'').slice(0,2)});
   io.to(g.id).emit('ludoLobby',{size,players:meta(g)});if(g.pl.length>=size)start(g);});
  s.on('ludoRoll',()=>{const g=games[s.lid];if(!g||g.state!=='play'||g.G.phase!=='roll')return;const p=g.pl[g.G.ti];if(p.sid!==s.id)return;p.miss=0;roll(g);});
  s.on('ludoMove',t=>{const g=games[s.lid];if(!g||g.state!=='play'||g.G.phase!=='pick')return;const p=g.pl[g.G.ti];if(p.sid!==s.id)return;p.miss=0;move(g,Number(t));});
  const leave=()=>{const g=games[s.lid];if(!g)return;const i=g.pl.findIndex(p=>p.sid===s.id);s.lid=null;try{s.leave(g.id);}catch{}if(i<0)return;
   if(g.state==='wait'){g.pl.splice(i,1);if(!g.pl.length)return kill(g);io.to(g.id).emit('ludoLobby',{size:g.size,players:meta(g)});}
   else{g.pl[i].auto=true;g.pl[i].gone=true;if(!humans(g).length)kill(g);else if(g.G.ti===i){clearTimeout(g.t);g.t=setTimeout(()=>act(g),300);}}};
  s.on('ludoLeave',leave);s.on('disconnect',leave);};};
