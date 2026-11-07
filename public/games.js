const TH={
 water:{n:'Water Sort',i:'🧪',f:'Fredoka',c:'#2f9bff',bg:'linear-gradient(135deg,#0b2a6a,#1c8ad8)'},
 quiz:{n:'GK Quiz',i:'🧠',f:'Bangers',c:'#ff2d95',bg:'linear-gradient(135deg,#6a0f4d,#e0309a)'},
 birds:{n:'Hungry Birds',i:'🐦',f:'"Press Start 2P"',c:'#3ee05a',bg:'linear-gradient(135deg,#0f6b2a,#35c24a)'},
 jewel:{n:'Jewel Block',i:'💎',f:'Orbitron',c:'#a24dff',bg:'linear-gradient(135deg,#2a0a6a,#7b2bd8)'}};
const G={},wait=ms=>new Promise(r=>setTimeout(r,ms)),R=n=>Math.random()*n|0;

G.water=(el,hud,end,lv)=>{let sc=0,tm=120,sel=-1,tb=[],n=0,pz=0;const C=['#ff3d71','#ffd600','#00e676','#29b6f6','#b388ff','#ff9100','#f06292'];el.className='tubes';
 function lvl(){const k=4+Math.min(3,n/2|0),a=[];for(let i=0;i<k;i++)for(let j=0;j<4;j++)a.push(i);a.sort(()=>Math.random()-.5);
  tb=[];for(let i=0;i<k;i++)tb.push(a.slice(i*4,i*4+4));tb.push([],[]);sel=-1;draw()}
 function draw(){el.innerHTML='';tb.forEach((x,i)=>{const d=document.createElement('div');d.className='tube'+(i==sel?' sel':'');
  x.forEach(c=>{const l=document.createElement('i');l.style.background=C[c];d.append(l)});d.onclick=()=>tap(i);el.append(d)});hud(sc,'⏱ '+tm+' · Lv '+(n+1))}
 async function tap(i){if(pz)return;if(sel<0){if(tb[i].length)sel=i}else{const a=tb[sel],b=tb[i];
  if(i!=sel&&b.length<4&&(!b.length||b.at(-1)==a.at(-1))){const c=a.at(-1);while(a.length&&a.at(-1)==c&&b.length<4)b.push(a.pop());
   if(tb.every(x=>!x.length||x.length==4&&x.every(y=>y==x[0]))){sc+=100+tm;n++;draw();pz=1;await lv(n);pz=0;return lvl()}}sel=-1}draw()}
 let iv;const go=()=>{iv=setInterval(()=>{if(pz||ADS.hold)return;tm--;hud(sc,'⏱ '+tm+' · Lv '+(n+1));if(tm<=0){clearInterval(iv);pz=1;end(sc)}},1000)};go();lvl();const cl=()=>clearInterval(iv);cl.resume=()=>{tm=30;pz=0;go();draw()};return cl};

G.quiz=(el,hud,end,lv,S)=>{let dead=0,iv,pz=0,last=0;el.className='qz';
 const hd=(r,n)=>hud(r.score,'✅'+(r.right||0)+' · Lv '+(r.lv||r.level)+(n?' · Q'+n+'/10':'')+(r.idle?' · ⚠ '+r.idle+'/3':''));
 async function nxt(){const r=await post('qnext',{sid:S(),id:U.id});if(dead)return;if(!r.q){dead=1;return end(0)}
  hd(r,r.n);let tm=15;el.innerHTML=(r.f?'<img class=fgb src="https://flagcdn.com/w160/'+r.f+'.png">':'')+'<div class=qq>'+esc(r.q)+'</div><div class=qt id=qt>⏱ 15</div><div class=bar><i id=br></i></div><div class=qo>'+r.o.map((o,i)=>'<button data-i='+i+'>'+esc(o)+'</button>').join('')+'</div>';
  const bs=[...el.querySelectorAll('.qo button')];bs.forEach(b=>b.onclick=()=>ans(+b.dataset.i,bs));
  iv=setInterval(()=>{if(ADS.hold)return;tm-=.1;const e=document.getElementById('br');if(e)e.style.width=tm/15*100+'%';const qt=document.getElementById('qt');if(qt)qt.textContent='⏱ '+Math.max(0,Math.ceil(tm));if(tm<=0){clearInterval(iv);ans(-1,bs)}},100)}
 async function ans(c,bs){if(dead||pz)return;pz=1;clearInterval(iv);bs.forEach(b=>b.disabled=true);const a=await post('qans',{sid:S(),id:U.id,c});if(dead)return;
  if(a.ci==null){dead=1;return end(0)}last=a.score;
  bs[a.ci]&&bs[a.ci].classList.add('ok');if(c>=0&&c!=a.ci)bs[c].classList.add('no');hd(a);await wait(1200);if(dead)return;
  if(a.over){dead=1;return end(a.score)}
  if(a.up){await ADS.lvQuiz(a.level-1);if(!await cg(a.level-1,a.score)){dead=1;return end(a.score)}}pz=0;nxt()}
 const cg=(l,s)=>new Promise(r=>{el.innerHTML='<div class=qq>🎉 Congratulations!<br>Level '+l+' complete<br>Score: '+s+'</div><div class=qo><button id=cn>▶ Next Level</button><button id=ce2>🚪 Exit</button></div>';document.getElementById('cn').onclick=()=>r(1);document.getElementById('ce2').onclick=()=>r(0)});
 nxt();const cl=()=>{dead=1;clearInterval(iv)};cl.resume=async()=>{const r=await post('qrev',{sid:S(),id:U.id});if(!r.ok){end(last);return}dead=0;pz=0;nxt()};return cl};

G.jewel=(el,hud,end)=>{const N=8,S=[[[1]],[[1,1]],[[1],[1]],[[1,1,1]],[[1],[1],[1]],[[1,1],[1,1]],[[1,1],[1,0]],[[1,1,1],[0,0,1]],[[1,1,1,1]],[[1],[1],[1],[1]],[[1,1,1],[1,1,1],[1,1,1]]],J=['💎','🔷','🟣','🟢','🟠','🔴'];
 let g=Array(N*N).fill(''),sc=0,tray=[],sel=-1,dead=0;
 const nw=()=>{tray=[0,1,2].map(()=>({s:S[R(S.length)],j:J[R(6)]}));sel=-1};
 const fits=(p,r,c)=>p.s.every((row,i)=>row.every((v,k)=>!v||r+i<N&&c+k<N&&!g[(r+i)*N+c+k]));
 const any=p=>{for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(fits(p,r,c))return 1};
 function put(r,c){const p=tray[sel];if(dead||!p||!fits(p,r,c))return;let n=0;
  p.s.forEach((row,i)=>row.forEach((v,k)=>{if(v){g[(r+i)*N+c+k]=p.j;n++}}));sc+=n*10;
  const rows=[],cols=[];for(let i=0;i<N;i++){if([...Array(N)].every((_,k)=>g[i*N+k]))rows.push(i);if([...Array(N)].every((_,k)=>g[k*N+i]))cols.push(i)}
  rows.forEach(i=>{for(let k=0;k<N;k++)g[i*N+k]=''});cols.forEach(i=>{for(let k=0;k<N;k++)g[k*N+i]=''});
  const L=rows.length+cols.length;sc+=L*100*L;tray[sel]=null;sel=-1;if(tray.every(x=>!x))nw();
  draw();if(tray.every(x=>!x||!any(x))){dead=1;end(sc)}}
 function draw(){const jg=document.createElement('div');jg.className='jg';g.forEach((v,i)=>{const d=document.createElement('div');d.className='c';d.textContent=v;d.onclick=()=>put(i/N|0,i%N);jg.append(d)});
  const tr=document.createElement('div');tr.className='tr';tray.forEach((p,i)=>{const d=document.createElement('div');d.className='pc'+(i==sel?' s':'');
   if(p){d.style.gridTemplateColumns='repeat('+p.s[0].length+',22px)';p.s.flat().forEach(v=>{const q=document.createElement('b');q.textContent=v?p.j:'';d.append(q)});d.onclick=()=>{sel=i;draw()}}tr.append(d)});
  el.innerHTML='';el.append(jg,tr);hud(sc,'')}
 nw();draw();const cl=()=>dead=1;cl.resume=()=>{g.fill('');nw();dead=0;draw()};return cl};


G.birds=(el,hud,end,lv)=>{if(typeof Matter=='undefined'){el.textContent='Physics engine failed to load. Check internet.';return()=>{}}
 const{Engine,World,Bodies,Body,Events}=Matter,cv=document.createElement('canvas');cv.width=800;cv.height=450;el.append(cv);const x=cv.getContext('2d');
 const A={x:140,y:330},MAT={glass:{c:'#bfeaff',hp:14,d:.0012},wood:{c:'#c98a43',hp:30,d:.002},stone:{c:'#9aa0a8',hp:70,d:.004}},BC={red:'#e53935',yellow:'#fdd835',black:'#222'};
 let en,sc=0,level=0,q=[],bird=null,drag=0,objs=[],raf,dead=0,fl=0,still=0,fin=0,settle=0,fr=0,used=0,msg='',acc=0,last=performance.now(),busy=0,boom=0,bx=0,by=0;
 const info=()=>'🐦'+(q.length+(bird?1:0))+' Lv'+level,add=b=>{objs.push(b);World.add(en.world,b)};
 const blk=(px,py,w,h,m)=>{const b=Bodies.rectangle(px,py,w,h,{friction:.7,restitution:.05,density:MAT[m].d});b.k='block';b.m=m;b.hp=MAT[m].hp;b.w=w;b.h=h;add(b)};
 const pig=(px,py)=>{const b=Bodies.circle(px,py,17,{friction:.6,restitution:.1,density:.002});b.k='pig';b.hp=16;add(b)};
 function dmg(o,d){if(o.dead)return;o.hp-=d;if(o.hp<=0){o.dead=1;World.remove(en.world,o);objs=objs.filter(z=>z!=o);sc+=o.k=='pig'?500:100;hud(sc,info())}}
 function load(){if(!q.length){bird=null;return}const t=q.shift();bird=Bodies.circle(A.x,A.y,14,{isStatic:true,restitution:.35,friction:.5,density:.006});bird.k='bird';bird.t=t;World.add(en.world,bird);used=0;hud(sc,info())}
 function build(){level++;en=Engine.create();en.positionIterations=10;en.velocityIterations=8;objs=[];fr=0;fin=0;fl=0;bird=null;
  World.add(en.world,Bodies.rectangle(400,435,2000,30,{isStatic:true,friction:.9}));
  const nt=1+(level>2)+(level>5),ms=level<3?['glass','wood']:level<6?['wood','stone']:['stone','wood','glass'],pk=()=>ms[R(ms.length)];let np=0;
  for(let i=0;i<nt;i++){const cx=480+i*125,st=1+(level>3)+(level>7);let y0=420;
   for(let s=0;s<st;s++){blk(cx-30,y0-28,14,56,pk());blk(cx+30,y0-28,14,56,pk());blk(cx,y0-63,86,14,pk());if(s==0||level>5){pig(cx,y0-17);np++}y0-=70}
   if(i>0||level>3){pig(cx,y0-17);np++}}
  const ty=level<3?['red','yellow']:['red','yellow','black'];q=[];for(let i=0;i<Math.min(6,np+2);i++)q.push(ty[i%ty.length]);
  Events.on(en,'collisionStart',e=>e.pairs.forEach(p=>{if(fr<45)return;const a=p.bodyA,b=p.bodyB,sp=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);if(sp<2.5)return;
   [[a,b],[b,a]].forEach(([o,w])=>{if(o.hp!==undefined)dmg(o,(sp-2)*(w.k=='bird'?7:2.2))})}));
  load()}
 function check(){if(!objs.some(o=>o.k=='pig')){sc+=q.length*1000;msg='Level '+level+' Clear!';hud(sc,info());busy=1;
   setTimeout(async()=>{await lv(level);msg='';busy=0;if(!dead)build()},1200)}
  else if(!q.length){dead=1;end(sc)}else load()}
 function ability(){const b=bird,v=b.velocity;if(b.t=='yellow')Body.setVelocity(b,{x:v.x*1.8,y:v.y*1.8});
  else if(b.t=='black'){const c={x:b.position.x,y:b.position.y};objs.slice().forEach(o=>{const dx=o.position.x-c.x,dy=o.position.y-c.y,d=Math.hypot(dx,dy)||1;
   if(d<110){const f=1-d/110;dmg(o,f*80);if(!o.dead)Body.setVelocity(o,{x:o.velocity.x+dx/d*9*f,y:o.velocity.y+dy/d*9*f-2})}});
   World.remove(en.world,b);bird=null;fl=0;fin=1;settle=0;boom=14;bx=c.x;by=c.y}}
 const bd=(px,py,t,r)=>{x.fillStyle=BC[t];x.beginPath();x.arc(px,py,r,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(px+r*.4,py-r*.25,r*.3,0,7);x.arc(px,py-r*.25,r*.25,0,7);x.fill();
  x.fillStyle='#000';x.fillRect(px+r*.35,py-r*.32,2,4);x.fillRect(px-.5,py-r*.32,2,4);x.fillStyle='#ffa000';x.beginPath();x.moveTo(px+r*.6,py);x.lineTo(px+r*1.25,py+r*.2);x.lineTo(px+r*.6,py+r*.45);x.fill()};
 function draw(){const g=x.createLinearGradient(0,0,0,450);g.addColorStop(0,'#4fc3f7');g.addColorStop(1,'#e1f5fe');x.fillStyle=g;x.fillRect(0,0,800,450);
  x.fillStyle='#81c784';x.beginPath();x.ellipse(160,430,330,90,0,0,7);x.fill();x.fillStyle='#43a047';x.fillRect(0,420,800,30);x.fillStyle='#6d4c41';x.fillRect(0,434,800,16);
  x.fillStyle='#5d4037';x.fillRect(A.x-5,A.y+14,10,106);x.fillRect(A.x-18,A.y,8,26);x.fillRect(A.x+10,A.y,8,26);
  q.forEach((t,i)=>bd(50+i*30,405,t,11));
  if(drag&&bird){x.strokeStyle='#3e2723';x.lineWidth=5;x.beginPath();x.moveTo(A.x-14,A.y+4);x.lineTo(bird.position.x,bird.position.y);x.lineTo(A.x+14,A.y+4);x.stroke();
   let px=bird.position.x,py=bird.position.y,vx=(A.x-px)*.2,vy=(A.y-py)*.2;x.fillStyle='#fff';for(let i=0;i<40;i++){px+=vx;py+=vy;vy+=.28;vx*=.995;vy*=.995;if(i%3==0){x.beginPath();x.arc(px,py,3,0,7);x.fill()}}}
  objs.forEach(o=>{x.save();x.translate(o.position.x,o.position.y);x.rotate(o.angle);
   if(o.k=='block'){x.fillStyle=MAT[o.m].c;x.globalAlpha=.45+.55*Math.max(.2,o.hp/MAT[o.m].hp);x.fillRect(-o.w/2,-o.h/2,o.w,o.h);x.globalAlpha=1;x.strokeStyle='#0008';x.strokeRect(-o.w/2,-o.h/2,o.w,o.h)}
   else{x.fillStyle='#7cb342';x.beginPath();x.arc(0,0,17,0,7);x.fill();x.strokeStyle='#33691e';x.lineWidth=2;x.stroke();x.fillStyle='#aed581';x.beginPath();x.ellipse(0,4,9,6,0,0,7);x.fill();
    x.fillStyle='#33691e';x.fillRect(-4,2,3,5);x.fillRect(2,2,3,5);x.fillStyle='#fff';x.beginPath();x.arc(-6,-6,4,0,7);x.arc(6,-6,4,0,7);x.fill();x.fillStyle='#000';x.fillRect(-6,-6,2,3);x.fillRect(5,-6,2,3)}
   x.restore()});
  if(bird)bd(bird.position.x,bird.position.y,bird.t,14);
  x.strokeStyle='#3e2723';x.lineWidth=5;if(!drag){x.beginPath();x.moveTo(A.x-14,A.y+4);x.lineTo(A.x+14,A.y+4);x.stroke()}
  if(boom>0){x.fillStyle='rgba(255,170,0,'+boom/18+')';x.beginPath();x.arc(bx,by,110*(1-boom/14)+10,0,7);x.fill();boom--}
  if(msg){x.fillStyle='#000a';x.fillRect(0,170,800,100);x.fillStyle='#ffe14d';x.font='bold 38px Fredoka';x.textAlign='center';x.fillText(msg,400,232)}}
 function step(now){if(dead)return;raf=requestAnimationFrame(step);if(ADS.hold){last=now;acc=0;draw();return}acc+=Math.min(now-last,50);last=now;
  while(acc>=16.67){acc-=16.67;if(!busy)Engine.update(en,16.67);fr++;
   if(fl){const sp=Math.hypot(bird.velocity.x,bird.velocity.y);still=sp<.4?still+1:0;
    if(still>60||bird.position.x>900||bird.position.x<-80||bird.position.y>520||fr-fl>600){World.remove(en.world,bird);bird=null;fl=0;fin=1;settle=0}}
   else if(fin&&!busy&&++settle>90){fin=0;check()}}
  draw()}
 const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*800/r.width,y:(e.clientY-r.top)*450/r.height}};
 cv.onpointerdown=e=>{if(busy||dead)return;const p=pos(e);if(fl){if(!used&&bird){used=1;ability()}return}
  if(bird&&Math.hypot(p.x-bird.position.x,p.y-bird.position.y)<45){drag=1;cv.setPointerCapture(e.pointerId)}};
 cv.onpointermove=e=>{if(!drag||!bird)return;const p=pos(e);let dx=p.x-A.x,dy=p.y-A.y,d=Math.hypot(dx,dy);if(d>90){dx*=90/d;dy*=90/d}Body.setPosition(bird,{x:A.x+dx,y:A.y+dy})};
 cv.onpointerup=()=>{if(!drag||!bird)return;drag=0;const vx=(A.x-bird.position.x)*.2,vy=(A.y-bird.position.y)*.2;
  if(Math.hypot(vx,vy)<2.5){Body.setPosition(bird,A);return}Body.setStatic(bird,false);Body.setVelocity(bird,{x:vx,y:vy});fl=fr||1;still=0};
 build();raf=requestAnimationFrame(step);const cl=()=>{dead=1;cancelAnimationFrame(raf)};cl.resume=()=>{dead=0;q.push('red','yellow');load();last=performance.now();acc=0;fin=0;raf=requestAnimationFrame(step)};return cl};
