/* Language: Hindi-speaking desh (IN, PK, NP, BD, LK, AF, BT, MV) = Hinglish, baaki desh = English.
   Player khud bhi badal sakta hai (home par Language select). Original text Hinglish hai, English mein auto-translate hota hai. */
(()=>{
const HI=['IN','PK','NP','BD','LK','AF','BT','MV'];
const D=[
['Duniya bhar ke real players ke saath quiz khelo 🌍','Play quiz with real players from around the world 🌍'],
['🏆 Is hafte ke Top 3 · Prize','🏆 This week’s Top 3 · Prize'],['Poora Leaderboard + Prizes','Full Leaderboard + Prizes'],
['Aapka naam','Your name'],['Country chuno','Choose country'],['State chuno','Choose state'],['Category chuno','Choose category'],['Khelo','Play'],
['Kam players hon toh baaki jagah Bot 🤖 le leta hai (Bot ranking aur prize mein nahi aate)','If few players are online, Bots 🤖 fill the empty seats (Bots are not ranked and win no prizes)'],
['Match ban raha hai...','Finding a match...'],['Real players ka intezar. Koi nahi aaya toh kuch second mein Bots 🤖 judd jayenge.','Waiting for real players. If nobody shows up, Bots 🤖 join in a few seconds.'],
['Message likho...','Type a message...'],['Players se baat karo 👋','Talk to the players 👋'],['Friends ko yeh code do','Share this code with friends'],['Abhi start karo','Start now'],
['Aap pehle se ek game mein ho','You are already in a game'],['Room nahi mila ya full hai','Room not found or full'],['Is category mein abhi questions nahi hain','No questions in this category yet'],
['Anti-cheat: shaq wali activity mili. Aapka score leaderboard mein nahi jayega.','Anti-cheat: suspicious activity detected. Your score will not count on the leaderboard.'],
['Bhai, apne sawal ka jawab do!','Hey, answer your question!'],['Sawal','Question'],[' ki baari','’s turn'],['khatam','complete'],
['▶ Next round khelo','▶ Play next round'],['Doosre players ka intezar...','Waiting for other players...'],['Bahar jao','Exit'],
['Top 10 · prize jeetne ke liye khelo!','Top 10 · play to win prizes!'],['Meri country','My country'],['Mera state','My state'],['Saari categories','All categories'],
['Prize ka real payment tab shuru hoga jab app ki earning hogi. Fair play: ek player, ek account.','Real prize payouts start once the app earns revenue. Fair play: one player, one account.'],
['Abhi koi score nahi. Pehle player bano aur #1 pao! 🚀','No scores yet. Be the first player and take #1! 🚀'],['Aapka ho sakta hai!','Could be yours!'],['Khaali','Empty'],
['Game chhod kar Home jaana hai?','Leave the game and go Home?'],['Naam aur country chuno','Enter your name and choose a country'],
/* games */
['Solo = aap vs Bot 🤖. Duo, Trio, Squad = real players; kam hon toh Bot judd jaate hain (Bot ranking aur prize mein nahi aate)','Solo = you vs a Bot 🤖. Duo, Trio, Squad = real players; Bots join if few are online (Bots are not ranked and win no prizes)'],
['⏱ Time khatam','⏱ Time is up'],['✅ Sahi! +','✅ Correct! +'],['❌ Galat','❌ Wrong'],
['Tube chuno, phir dusre tube par daalo. Same rang ka paani milta hai.','Pick a tube, then pour into another. Same-colour water combines.'],

['Deewar se bahar jao toh doosri taraf nikalte ho! 3 jaan hain. Arrow keys, D-pad ya swipe se chalao.','Go through a wall and you come out on the other side! 3 lives. Use arrow keys, D-pad or swipe.'],
['Paas ke do candy swap karo (tap ya swipe). 3+ same rang match karo!','Swap two neighbouring candies (tap or swipe). Match 3+ of the same colour!'],
['Blocks ko pakad kar grid par chhodo. Poori row ya column bhar jaye toh saaf!','Drag blocks onto the grid. Fill a whole row or column to clear it!'],
['Computer ke saath ya online real players ke saath khelo.','Play with the computer or online with real players.'],['🤖 Computer ke saath','🤖 With the computer'],
['Kam players hon toh Bot 🤖 judd jaate hain.','Bots 🤖 join if few players are online.'],['Online: real players ke saath. Kam hon toh Bot 🤖 judd jaate hain.','Online: play with real players. Bots 🤖 join if few are online.'],
['Players ka intezar...','Waiting for players...'],['Players dhoond rahe hain...','Looking for players...'],

['Bore ho gaye? Koi bhi game khelo 🎮','Bored? Play any game 🎮'],['⬅ Quiz par wapas','⬅ Back to Quiz'],['🔁 Phir khelo','🔁 Play again'],['Phir khelo','Play again'],
['Tap / Space se udo. Keede 🐛 aur berries 🍓 khao, baaz 🦅 se bacho. Bhookh khatam = game over!','Tap / press Space to fly. Eat worms 🐛 and berries 🍓, avoid hawks 🦅. Hunger runs out = game over!'],
['Zameen se takraye!','Hit the ground!'],['Bhookh se behaal! 🥺','Starved! 🥺'],['Baaz ne pakad liya! 🦅','Caught by a hawk! 🦅'],
['Aap = ❌ . Computer = ⭕. Teen ek line banao!','You = ❌ . Computer = ⭕. Make three in a row!'],['Aap jeet gaye! 🎉','You won! 🎉'],['Computer jeet gaya 🤖','Computer won 🤖'],['Jeet ','Won '],['Haar ','Lost '],
['Arrow keys, D-pad ya swipe se chalao. Laal gola khao!','Use arrow keys, D-pad or swipe. Eat the red ball!'],
['Tube chuno, phir dusre tube par daalo. Same rang ka paani milta hai.','Pick a tube, then pour into another. Same-colour water combines.'],
['Upar wali ball uthao aur same rang ya khaali tube mein rakho','Pick the top ball and place it on the same colour or an empty tube'],
['Upar wala stone uthao aur same rang ya khaali tube mein rakho','Pick the top stone and place it on the same colour or an empty tube'],
[' pass! 🎉',' cleared! 🎉'],['Aap = 🔴 Red. Computer ke saath khelo.','You = 🔴 Red. Play against the computer.'],['Kitne players? (Aap + computer 🤖)','How many players? (You + computer 🤖)'],
['6 aaye toh token bahar nikalta hai aur dobara baari milti hai.','Roll a 6 to bring a token out and get another turn.'],['Dusre ka token kaat do to bonus baari!','Capture an opponent’s token for a bonus turn!'],
['Dice phenko, phir apne chamakte token par tap karo.','Roll the dice, then tap your glowing token.'],['🎲 Dice phenko','🎲 Roll dice'],['Aapki baari: dice phenko 🎲','Your turn: roll the dice 🎲'],
['khel raha hai...','is playing...'],[': koi chaal nahi',': no move'],['Chamakte token par tap karo 👆','Tap a glowing token 👆'],[' jeet gaya',' won'],['/4 ghar','/4 home'],['Aap ·','You ·']
].sort((a,b)=>b[0].length-a[0].length);
const lang=()=>{if(localStorage.langManual==='1'&&localStorage.lang)return localStorage.lang;let cc='';try{cc=JSON.parse(localStorage.me||'{}').cc||'';}catch{}
 if(cc)return HI.includes(cc)?'hi':'en';const n=(navigator.language||'').toLowerCase();return/^(hi|ur)|-in$|-pk$/.test(n)?'hi':'en';};
const tr=s=>{let o=s;for(const[a,b]of D)if(o.includes(a))o=o.split(a).join(b);return o;};
window.LANG=lang;window.T=s=>lang()==='en'?tr(String(s)):s;
['alert','confirm'].forEach(k=>{const o=window[k].bind(window);window[k]=m=>o(T(m));});
const done=new WeakMap(),skip=n=>n.parentElement&&n.parentElement.closest('.q,.opt,.cm,.pn,.rn,.lane b,input,textarea,script,style,canvas,#lg');
const run=()=>{if(lang()!=='en')return;document.documentElement.lang='en';const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){if(done.get(n)===n.data||skip(n))continue;const t=tr(n.data);if(t!==n.data)n.data=t;done.set(n,n.data);}
 document.querySelectorAll('[placeholder]').forEach(e=>{const t=tr(e.placeholder);if(t!==e.placeholder)e.placeholder=t;});};
let q=0;new MutationObserver(()=>{if(q)return;q=1;requestAnimationFrame(()=>{q=0;run();});}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener('DOMContentLoaded',run);
})();
