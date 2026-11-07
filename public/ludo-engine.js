/* Ludo engine: server (Node) aur browser dono mein chalta hai. */
(function(root){
const TR=[],P=(r,c)=>TR.push([r,c]);
for(let c=1;c<=5;c++)P(6,c);for(let r=5;r>=0;r--)P(r,6);P(0,7);P(0,8);for(let r=1;r<=5;r++)P(r,8);for(let c=9;c<=14;c++)P(6,c);P(7,14);P(8,14);
for(let c=13;c>=9;c--)P(8,c);for(let r=9;r<=14;r++)P(r,8);P(14,7);P(14,6);for(let r=13;r>=9;r--)P(r,6);for(let c=5;c>=0;c--)P(8,c);P(7,0);P(6,0);
const ST=[0,13,26,39],SAFE=[0,8,13,21,26,34,39,47];
const HM=[[1,2,3,4,5].map(c=>[7,c]),[1,2,3,4,5].map(r=>[r,7]),[13,12,11,10,9].map(c=>[7,c]),[13,12,11,10,9].map(r=>[r,7])];
const BS=[[[2,2],[2,4],[4,2],[4,4]],[[2,10],[2,12],[4,10],[4,12]],[[10,10],[10,12],[12,10],[12,12]],[[10,2],[10,4],[12,2],[12,4]]];
const ab=(k,p)=>(ST[k]+p)%52,cellAt=(k,p)=>p<=50?TR[ab(k,p)]:p<=55?HM[k][p-51]:[7,7];
class Ludo{
 constructor(seats){this.seats=seats;this.tk=[0,1,2,3].map(()=>[-1,-1,-1,-1]);this.ti=0;this.dice=0;this.phase='roll';this.mv=[];this.winner=-1;}
 get cur(){return this.seats[this.ti];}
 movable(k,d){return[0,1,2,3].filter(t=>{const p=this.tk[k][t];return p<0?d===6:p+d<=56;});}
 next(){this.ti=(this.ti+1)%this.seats.length;this.phase='roll';this.mv=[];}
 roll(){if(this.phase!=='roll'||this.winner>=0)return null;this.dice=1+Math.floor(Math.random()*6);this.mv=this.movable(this.cur,this.dice);
  if(!this.mv.length){const ev={dice:this.dice,pass:true,pl:this.cur};this.next();return ev;}
  this.phase='pick';return{dice:this.dice,pass:false,pl:this.cur,mv:this.mv};}
 move(t){if(this.phase!=='pick'||!this.mv.includes(t))return null;const k=this.cur,d=this.dice,from=this.tk[k][t],p=from<0?0:from+d,cap=[];this.tk[k][t]=p;
  if(p<=50){const a=ab(k,p);if(!SAFE.includes(a))this.seats.forEach(o=>{if(o!==k)this.tk[o].forEach((q,i)=>{if(q>=0&&q<=50&&ab(o,q)===a){this.tk[o][i]=-1;cap.push([o,i]);}});});}
  const won=this.tk[k].every(q=>q===56);if(won)this.winner=k;const extra=!won&&(d===6||cap.length>0||p===56);
  const ev={pl:k,t,from,to:p,cap,extra,won};
  if(won)this.phase='over';else if(extra){this.phase='roll';this.mv=[];}else this.next();return ev;}
 bot(){const k=this.cur,d=this.dice;let best=this.mv[0],bs=-1;
  for(const t of this.mv){const p=this.tk[k][t],np=p<0?0:p+d;let s=np;if(p<0)s+=30;if(np===56)s+=60;
   if(np<=50){const a=ab(k,np);if(!SAFE.includes(a)&&this.seats.some(o=>o!==k&&this.tk[o].some(q=>q>=0&&q<=50&&ab(o,q)===a)))s+=80;if(SAFE.includes(a))s+=10;}
   if(s>bs){bs=s;best=t;}}return best;}
 snap(){return{seats:this.seats,tk:this.tk,ti:this.ti,dice:this.dice,phase:this.phase,mv:this.mv,winner:this.winner};}
}
const API={Ludo,TR,ST,SAFE,HM,BS,cellAt};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.LudoEngine=API;
})(typeof window!=='undefined'?window:this);
