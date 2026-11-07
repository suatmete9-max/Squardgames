// Usage: node tools/add-questions.js new-questions.txt   (or .json)   |   node tools/add-questions.js --count
const fs=require('fs'),path=require('path'),F=path.join(__dirname,'..','data','questions.json'),arg=process.argv[2];
const cur=JSON.parse(fs.readFileSync(F,'utf8'));
if(!arg||arg=='--count'){console.log('Total questions:',cur.length);process.exit()}
const raw=fs.readFileSync(arg,'utf8');let add=[];
if(arg.endsWith('.json'))add=JSON.parse(raw);
else raw.split(/\r?\n/).forEach(l=>{l=l.trim();if(!l||l[0]=='#')return;const p=l.split('|').map(s=>s.trim());if(p.length>=5)add.push({q:p[0],a:p[1],w:[p[2],p[3],p[4]],d:+p[5]||2})});
const seen=new Set(cur.map(x=>x.q.toLowerCase()));let n=0,bad=0;
add.forEach(x=>{if(!x||!x.q||!x.a||!Array.isArray(x.w)||x.w.length<3||x.w.includes(x.a)||seen.has(x.q.toLowerCase())){bad++;return}
 seen.add(x.q.toLowerCase());cur.push({q:x.q,a:x.a,w:x.w.slice(0,3),d:[1,2,3].includes(+x.d)?+x.d:2,...(x.f?{f:x.f}:{})});n++});
fs.writeFileSync(F,JSON.stringify(cur));console.log('Added',n,'| skipped',bad,'(duplicate/invalid) | total',cur.length);
console.log('Running server picks them up automatically within a few seconds. On Render: redeploy after this.');
