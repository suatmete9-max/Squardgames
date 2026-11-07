// Roz naye questions: Open Trivia DB (free) + aapki custom files (server/data/custom/<category>.json)
const store=require('./store'),fs=require('fs'),path=require('path'),CATS=require('./categories');
const OTDB={gk:9,science:17,math:19,history:23,geography:22,computer:18};
const dec=s=>Buffer.from(s,'base64').toString('utf8'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchCat(id){const out=[];
 for(let i=0;i<4;i++){try{
  const j=await(await fetch(`https://opentdb.com/api.php?amount=50&category=${id}&type=multiple&encode=base64`)).json();
  for(const x of j.results||[]){const o=x.incorrect_answers.map(dec),a=dec(x.correct_answer),p=Math.floor(Math.random()*4);o.splice(p,0,a);out.push({q:dec(x.question),o,a:p});}
 }catch(e){console.log('fetch fail',id,e.message);}await sleep(6000);}return out;}
function custom(c){try{return JSON.parse(fs.readFileSync(path.join(__dirname,'data','custom',c+'.json'),'utf8'));}catch{return[];}}
function genMath(){const o=[],r=n=>1+Math.floor(Math.random()*n);
 for(let i=0;i<260;i++){let q,a,t=i%5,x=r(40)+2,y=r(20)+2;
  if(t==0){q=`${x} x ${y} = ?`;a=x*y;}else if(t==1){q=`${x*y} / ${y} = ?`;a=x;}else if(t==2){q=`${x*10} ka ${y*5}% = ?`;a=x*10*y*5/100;}
  else if(t==3){q=`${x} + ${y*3} - ${y} = ?`;a=x+y*2;}else{q=`${x} ka square = ?`;a=x*x;}
  a=Math.round(a*100)/100;const ch=new Set([a]);while(ch.size<4)ch.add(Math.max(0,a+(r(9)-5)*(t==4?x:1)||a+7));
  const opts=[...ch].sort(()=>Math.random()-.5);o.push({q,o:opts.map(String),a:opts.indexOf(a)});}
 return o;}
let running=false;
async function run(){if(running)return;running=true;
 for(const c of CATS){const fresh=[...(OTDB[c.id]?await fetchCat(OTDB[c.id]):[]),...custom(c.id),...(c.id==='math'?genMath():[])];
  const old=await store.getQ(c.id),seen=new Set(),all=[];
  for(const x of [...fresh,...old]){if(!x.q||seen.has(x.q))continue;seen.add(x.q);all.push(x);}
  await store.setQ(c.id,all.slice(0,600));console.log('updated',c.id,all.length);}
 running=false;}
module.exports={run};
