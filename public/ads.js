const ADS={hold:false,VIDEO_SRC:'',   // VIDEO_SRC: optional direct video file URL (mp4) shown in the timed 10s break
 fr(el,key,w,h,src){const f=document.createElement('iframe');f.width=w;f.height=h;f.style.border=0;f.scrolling='no';
  f.srcdoc='<body style="margin:0;background:transparent"><script>atOptions={key:"'+key+'",format:"iframe",height:'+h+',width:'+w+',params:{}}<\/script><script src="'+src+'"><\/script>';el.append(f)},
 b300:el=>ADS.fr(el,'3bd88ca46a48e2a360fc0c32f2328725',300,250,'https://www.highrevenueformat.com/3bd88ca46a48e2a360fc0c32f2328725/invoke.js'),
 banner(el){el.innerHTML='';innerWidth>=760?ADS.fr(el,'f07c60d59f8fe464c591fcdc1726a583',728,90,'https://bicea.org/22/f07c60d59f8fe464c591fcdc1726a583'):ADS.fr(el,'740f01194f599a4cd878d26f74ea54e5',320,50,'https://bicea.org/22/740f01194f599a4cd878d26f74ea54e5')},
 js(src,zone){const s=document.createElement('script');if(zone)s.dataset.zone=zone;s.src=src;document.body.appendChild(s)},
 vig(){ADS.js('https://n6wxm.com/vignette.min.js','12206690')},
 // Full-screen overlay: game is paused (ADS.hold) while it is open. Close button top-right after `secs` seconds; auto-closes as a safety net.
 ov(secs,vid){return new Promise(res=>{ADS.hold=true;const d=document.createElement('div');d.className='fs';
  d.innerHTML='<button class=x2 disabled>'+secs+'</button>'+(vid?'<video src="'+vid+'" autoplay muted playsinline loop style="max-width:92vw;max-height:38vh;border-radius:12px"></video>':'')+'<div class=fa></div><div class=fb></div>';
  document.body.append(d);ADS.b300(d.querySelector('.fa'));ADS.banner(d.querySelector('.fb'));
  const b=d.querySelector('.x2');let c=secs,iv,ft;const done=()=>{clearInterval(iv);clearTimeout(ft);d.remove();ADS.hold=false;res()};
  iv=setInterval(()=>{c--;if(c>0)b.textContent=c;else{clearInterval(iv);b.textContent='✕';b.disabled=false}},1000);ft=setTimeout(done,(secs+25)*1000);b.onclick=done})},
 full(){if(Math.random()<.5){ADS.vig();return Promise.resolve()}return ADS.ov(3)},   // random: Monetag vignette or Adsterra overlay
 vbreak(){return ADS.ov(10,ADS.VIDEO_SRC)},                                          // timed 10-second break
 ban2:id=>{if(window.SQApp)return;const e=document.getElementById(id);e&&ADS.banner(e)},   // extra banner in a free area (website only, never in the Android app)
 level:n=>n%2==0?ADS.full():Promise.resolve(),
 lvQuiz:()=>ADS.full(),
 init(){ADS.banner(document.getElementById('adT'));ADS.banner(document.getElementById('adB'))}};

// ===== Android app mode (inside the Play Store app): AdMob through the native bridge, web ad networks switched off =====
if(window.SQApp){let cid=0,freeUntil=0;const cb={};
 window.SQN={done:(id,ok)=>{const f=cb[id];if(f)f(ok)}};
 const call=fn=>new Promise(res=>{const id=++cid;ADS.hold=true;const t=setTimeout(()=>cb[id]&&cb[id](false),25000);
  cb[id]=ok=>{clearTimeout(t);delete cb[id];ADS.hold=false;res(!!ok)};try{fn(id)}catch(e){cb[id](false)}});
 ADS.free=()=>Date.now()<freeUntil;
 ADS.full=()=>ADS.free()?Promise.resolve():call(id=>SQApp.interstitial(id,2));          // game over
 ADS.level=n=>(n%2==0&&!ADS.free())?call(id=>SQApp.interstitial(id,1)):Promise.resolve(); // every 2nd completed level
 ADS.lvQuiz=n=>ADS.level(n);
 ADS.rewarded=()=>call(id=>SQApp.rewarded(id));
 ADS.init=()=>{['adT','adB'].forEach(i=>{const e=document.getElementById(i);e&&e.remove()})};   // banners are native in the app
 ADS.vbreak=()=>{if(document.getElementById('rw'))return;const d=document.createElement('div');d.id='rw';
  d.innerHTML='<span>🎁 Watch a short video → 10 min without ads</span><button class=big id=rwb>▶ Watch</button><button id=rwx>✕</button>';document.body.append(d);
  const rm=()=>d.remove();setTimeout(rm,20000);document.getElementById('rwx').onclick=rm;
  document.getElementById('rwb').onclick=async()=>{rm();if(await ADS.rewarded()){freeUntil=Date.now()+6e5;const t=document.createElement('div');t.id='rw';t.textContent='✅ 10 minutes ad-free!';document.body.append(t);setTimeout(()=>t.remove(),3000)}}};
}
