// Firebase Firestore agar FIREBASE_SERVICE_ACCOUNT set hai, warna local JSON files
const fs=require('fs'),path=require('path');
let db=null;
if(process.env.FIREBASE_SERVICE_ACCOUNT){const a=require('firebase-admin');
 a.initializeApp({credential:a.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});db=a.firestore();}
const F=p=>path.join(__dirname,'data',p);
const rd=(p,d)=>{try{return JSON.parse(fs.readFileSync(F(p),'utf8'))}catch{return d}};
module.exports={
 async getQ(c){if(db){const s=await db.collection('questions').doc(c).get();if(s.exists)return s.data().list;}return rd('questions.json',{})[c]||[];},
 async setQ(c,list){if(db)await db.collection('questions').doc(c).set({list,updated:Date.now()});
  else{const a=rd('questions.json',{});a[c]=list;fs.writeFileSync(F('questions.json'),JSON.stringify(a));}},
 async addScore(e){if(db)await db.collection('scores').add(e);
  else{const a=rd('scores.json',[]);a.push(e);fs.writeFileSync(F('scores.json'),JSON.stringify(a));}},
 async recent(ms){const t=Date.now()-ms;
  if(db){const s=await db.collection('scores').where('ts','>=',t).get();return s.docs.map(d=>d.data());}
  return rd('scores.json',[]).filter(e=>e.ts>=t);}
};
