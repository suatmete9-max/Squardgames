// Question bank builder: har category ke liye 200+ alag questions (tables + formulas se). Chalao: npm run questions
const fs=require('fs'),path=require('path');
const sh=a=>[...a].sort(()=>Math.random()-.5),R=n=>Math.floor(Math.random()*n),gcd=(a,b)=>b?gcd(b,a%b):a;
const P=s=>s.split(';').map(x=>x.trim()).filter(Boolean).map(x=>x.split('|').map(y=>y.trim()));
const uniq=(a,n)=>sh(a).slice(0,n);
function mk(q,ans,pool){const d=sh([...new Set(pool)].filter(x=>x!==ans)).slice(0,3),o=sh([ans,...d]);return{q,o:o.map(String),a:o.indexOf(String(ans))};}
function numQ(q,ans,sp,u=''){sp=sp||Math.max(1,Math.round(Math.abs(ans)*.12));const s=new Set([ans]);let g=0;
 while(s.size<4&&g++<80){const v=Math.round((ans+(1+R(3))*sp*(R(2)?1:-1))*100)/100;if(v!==ans&&(ans<0||v>=0))s.add(v);}
 let k=1;while(s.size<4)s.add(ans+sp*(++k)*3);const o=sh([...s]);return{q,o:o.map(v=>v+u),a:o.indexOf(ans)};}
function pair(list,fq,rq,out,extra=[]){const A=list.map(x=>x[0]),B=list.map(x=>x[1]);
 list.forEach(([a,b])=>{if(fq)out.push(mk(fq(a),b,[...B,...extra]));if(rq&&B.filter(x=>x===b).length===1)out.push(mk(rq(b),a,A));});}
const H=s=>s.split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const[q,a,...w]=x.split('|');return mk(q,a,[a,...w]);});
const fmt=(c,p)=>p===0?`${c}`:p===1?`${c}x`:`${c}x^${p}`;
const B={};

// ---------- GK ----------
{const o=[];
pair(P(`Telephone|Alexander Graham Bell;Practical electric light bulb|Thomas Edison;Radio (wireless telegraphy)|Guglielmo Marconi;Penicillin|Alexander Fleming;Dynamite|Alfred Nobel;Printing press with movable type|Johannes Gutenberg;Mechanical television|John Logie Baird;Powered aeroplane|Wright brothers;Theory of relativity|Albert Einstein;Law of gravitation|Isaac Newton;Theory of evolution|Charles Darwin;Smallpox vaccine|Edward Jenner;Rabies vaccine|Louis Pasteur;X-rays|Wilhelm Röntgen;Radium and polonium|Marie Curie;Periodic table|Dmitri Mendeleev;Electric battery|Alessandro Volta;Electromagnetic induction|Michael Faraday;Electron|J. J. Thomson;Neutron|James Chadwick;Atomic nucleus|Ernest Rutherford;Morse code|Samuel Morse;World Wide Web|Tim Berners-Lee;Polio vaccine|Jonas Salk;Insulin|Frederick Banting;DNA double helix model|Watson and Crick;Quantum theory|Max Planck;Uncertainty principle|Werner Heisenberg;Laws of planetary motion|Johannes Kepler;Heliocentric theory|Nicolaus Copernicus;Cinematograph|Lumière brothers;Analytical Engine (computer concept)|Charles Babbage;Cotton gin|Eli Whitney;Spinning jenny|James Hargreaves;Stethoscope|René Laennec;Lightning rod|Benjamin Franklin;Modern atomic theory|John Dalton;Naming of the cell|Robert Hooke;First observation of bacteria|Antonie van Leeuwenhoek;Circulation of blood|William Harvey;Raman effect|C. V. Raman;Missile Man of India|A. P. J. Abdul Kalam;Father of Indian space programme|Vikram Sarabhai;Father of Indian nuclear programme|Homi J. Bhabha;Green Revolution in India|M. S. Swaminathan;White Revolution in India|Verghese Kurien;Crescograph|J. C. Bose`),
 a=>`Who is associated with "${a}"?`,b=>`"${b}" is associated with which of these?`,o);
pair(P(`Hamlet|William Shakespeare;Pride and Prejudice|Jane Austen;Oliver Twist|Charles Dickens;Wuthering Heights|Emily Brontë;Jane Eyre|Charlotte Brontë;1984|George Orwell;The Old Man and the Sea|Ernest Hemingway;Moby-Dick|Herman Melville;War and Peace|Leo Tolstoy;Crime and Punishment|Fyodor Dostoevsky;Don Quixote|Miguel de Cervantes;The Odyssey|Homer;The Divine Comedy|Dante Alighieri;Paradise Lost|John Milton;Gitanjali|Rabindranath Tagore;Godan|Premchand;The Discovery of India|Jawaharlal Nehru;Wings of Fire|A. P. J. Abdul Kalam;Malgudi Days|R. K. Narayan;The God of Small Things|Arundhati Roy;Midnight's Children|Salman Rushdie;Train to Pakistan|Khushwant Singh;Anandamath|Bankim Chandra Chattopadhyay;Arthashastra|Kautilya;Meghaduta|Kalidasa;Ramcharitmanas|Tulsidas;Kamayani|Jaishankar Prasad;Madhushala|Harivansh Rai Bachchan;Harry Potter|J. K. Rowling;The Hobbit|J. R. R. Tolkien;Frankenstein|Mary Shelley;Dracula|Bram Stoker;Treasure Island|Robert Louis Stevenson;Gulliver's Travels|Jonathan Swift;Robinson Crusoe|Daniel Defoe;Alice's Adventures in Wonderland|Lewis Carroll;The Jungle Book|Rudyard Kipling;Ulysses|James Joyce;The Great Gatsby|F. Scott Fitzgerald;To Kill a Mockingbird|Harper Lee;Les Misérables|Victor Hugo;Faust|Johann Wolfgang von Goethe;The Republic|Plato;Ramayana|Valmiki;Mahabharata|Ved Vyasa;Das Kapital|Karl Marx;On the Origin of Species|Charles Darwin;A Brief History of Time|Stephen Hawking;The Prince|Niccolò Machiavelli;My Experiments with Truth|Mahatma Gandhi;The Alchemist|Paulo Coelho;Things Fall Apart|Chinua Achebe;Heart of Darkness|Joseph Conrad`),
 a=>`Who wrote "${a}"?`,b=>`Which of these books was written by ${b}?`,o);
pair(P(`India|Indian Rupee;Pakistan|Pakistani Rupee;Nepal|Nepalese Rupee;Sri Lanka|Sri Lankan Rupee;United States|US Dollar;Canada|Canadian Dollar;Australia|Australian Dollar;United Kingdom|Pound sterling;Egypt|Egyptian Pound;Japan|Yen;China|Yuan (Renminbi);Russia|Russian Ruble;Switzerland|Swiss Franc;Saudi Arabia|Saudi Riyal;Qatar|Qatari Riyal;UAE|UAE Dirham;Bangladesh|Taka;Thailand|Baht;Malaysia|Ringgit;Indonesia|Rupiah;Vietnam|Dong;South Korea|Won;Philippines|Philippine Peso;Mexico|Mexican Peso;Brazil|Real;South Africa|Rand;Nigeria|Naira;Kenya|Kenyan Shilling;Turkey|Turkish Lira;Iran|Iranian Rial;Israel|Shekel;Poland|Zloty;Sweden|Swedish Krona;Norway|Norwegian Krone;Czech Republic|Koruna;Hungary|Forint;Ukraine|Hryvnia;Kuwait|Kuwaiti Dinar;Afghanistan|Afghani;Myanmar|Kyat;Cambodia|Riel;Laos|Kip;Bhutan|Ngultrum;Maldives|Rufiyaa;Mongolia|Tugrik;Kazakhstan|Tenge;Ghana|Cedi;Ethiopia|Birr;Peru|Sol;Germany|Euro`),
 a=>`What is the currency of ${a}?`,b=>`Which country uses the ${b}?`,o);
B.gk=o;}

// ---------- Science ----------
{const o=[];
pair(P(`Hydrogen|H;Helium|He;Lithium|Li;Beryllium|Be;Boron|B;Carbon|C;Nitrogen|N;Oxygen|O;Fluorine|F;Neon|Ne;Sodium|Na;Magnesium|Mg;Aluminium|Al;Silicon|Si;Phosphorus|P;Sulphur|S;Chlorine|Cl;Argon|Ar;Potassium|K;Calcium|Ca;Titanium|Ti;Chromium|Cr;Manganese|Mn;Iron|Fe;Cobalt|Co;Nickel|Ni;Copper|Cu;Zinc|Zn;Arsenic|As;Bromine|Br;Krypton|Kr;Silver|Ag;Tin|Sn;Iodine|I;Xenon|Xe;Barium|Ba;Tungsten|W;Platinum|Pt;Gold|Au;Mercury|Hg;Lead|Pb;Uranium|U;Radium|Ra;Radon|Rn;Plutonium|Pu;Antimony|Sb;Cadmium|Cd`),
 a=>`What is the chemical symbol of ${a}?`,b=>`Which element has the symbol "${b}"?`,o);
pair(P(`Force|Newton;Energy|Joule;Power|Watt;Pressure|Pascal;Frequency|Hertz;Electric charge|Coulomb;Electric current|Ampere;Potential difference|Volt;Electrical resistance|Ohm;Capacitance|Farad;Inductance|Henry;Magnetic flux density|Tesla;Magnetic flux|Weber;Luminous intensity|Candela;Amount of substance|Mole;Temperature|Kelvin;Radioactivity|Becquerel;Electrical conductance|Siemens;Mass|Kilogram;Length|Metre;Time|Second;Work|Joule`),
 a=>`What is the SI unit of ${a.toLowerCase()}?`,b=>`${b} is the SI unit of which quantity?`,o);
pair(P(`Water|H2O;Table salt|NaCl;Baking soda|NaHCO3;Marble (limestone)|CaCO3;Quicklime|CaO;Slaked lime|Ca(OH)2;Ammonia|NH3;Methane|CH4;Carbon dioxide|CO2;Hydrochloric acid|HCl;Sulphuric acid|H2SO4;Nitric acid|HNO3;Caustic soda|NaOH;Glucose|C6H12O6;Ozone|O3;Hydrogen peroxide|H2O2;Laughing gas|N2O`),
 a=>`What is the chemical formula of ${a}?`,b=>`Which substance has the formula ${b}?`,o);
['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'].forEach((p,i,a)=>o.push(mk(`Which planet is number ${i+1} from the Sun?`,p,a)));
pair(P(`Whale|Mammal;Bat|Mammal;Frog|Amphibian;Snake|Reptile;Shark|Fish;Penguin|Bird;Dolphin|Mammal;Crocodile|Reptile;Salamander|Amphibian;Tortoise|Reptile`),a=>`To which class does the ${a.toLowerCase()} belong?`,null,o,['Mammal','Bird','Reptile','Amphibian','Fish','Insect']);
pair(P(`Bauxite|Aluminium;Haematite|Iron;Cinnabar|Mercury;Galena|Lead;Malachite|Copper;Cassiterite|Tin;Zinc blende|Zinc;Pitchblende|Uranium;Rutile|Titanium`),
 a=>`${a} is an ore of which metal?`,b=>`Which of these is an ore of ${b.toLowerCase()}?`,o);
B.science=o;}

// ---------- Math (formula se) ----------
{const o=[],r=n=>1+R(n);
for(let i=0;i<400;i++){const t=i%14,x=r(40)+2,y=r(20)+2,z=r(30)+1;let q,a,sp;
 if(t==0){q=`${x} × ${y} = ?`;a=x*y;}else if(t==1){q=`${x*y} ÷ ${y} = ?`;a=x;}else if(t==2){q=`${x*10} का ${y*5}% = ?`;a=x*10*y*5/100;}
 else if(t==3){q=`${x} + ${y*3} − ${y} = ?`;a=x+y*2;}else if(t==4){q=`${x} का square = ?`;a=x*x;}else if(t==5){q=`√${x*x} = ?`;a=x;}
 else if(t==6){const g=r(9)+1,m=r(6)+1,n=m+1+r(5);q=`HCF of ${g*m} and ${g*n}?`;a=g*gcd(m,n);}
 else if(t==7){const m=r(9)+1,n=r(9)+1;q=`LCM of ${m} and ${n}?`;a=m*n/gcd(m,n);}
 else if(t==8){const P_=(r(9))*1000,Rr=r(10)+1,T=r(5);q=`Simple interest on ₹${P_} at ${Rr}% per year for ${T} years?`;a=P_*Rr*T/100;}
 else if(t==9){q=`Rectangle: length ${x} cm, breadth ${y} cm. Area (cm²)?`;a=x*y;}else if(t==10){q=`Rectangle: length ${x} cm, breadth ${y} cm. Perimeter (cm)?`;a=2*(x+y);}
 else if(t==11){const m=r(20);q=`Average of ${m}, ${m+4}, ${m+8}, ${m+12}?`;a=m+6;}
 else if(t==12){const s=r(9)+1,c=r(30);q=`Solve: ${s}x + ${c} = ${s*x+c}. x = ?`;a=x;}
 else{const sp_=r(20)*5,tm=r(8);q=`A car runs at ${sp_} km/h for ${tm} hours. Distance covered (km)?`;a=sp_*tm;}
 o.push(numQ(q,Math.round(a*100)/100));}
B.math=o;}

// ---------- English ----------
{const o=[];
pair(P(`happy|joyful;big|huge;small|tiny;fast|rapid;smart|intelligent;brave|courageous;angry|furious;begin|commence;end|conclude;help|assist;buy|purchase;hard|difficult;rich|wealthy;strong|powerful;calm|peaceful;quiet|silent;sad|sorrowful;tired|exhausted;honest|truthful;funny|humorous;beautiful|gorgeous;old|ancient;start|initiate;show|display;look|observe;choose|select;tell|inform;keep|retain;stop|cease;hurry|hasten;enemy|foe;friend|companion;danger|peril;reply|respond;gift|present;wish|desire;ask|inquire;trip|journey;cold|chilly;cheap|inexpensive;error|mistake`),
 a=>`Choose the synonym of "${a}".`,b=>`Which word means the same as "${b}"?`,o);
pair(P(`hot|cold;up|down;day|night;good|bad;love|hate;light|dark;young|old;rich|poor;strong|weak;happy|sad;fast|slow;hard|soft;early|late;full|empty;open|close;win|lose;true|false;arrive|depart;accept|reject;victory|defeat;ancient|modern;brave|cowardly;expand|contract;increase|decrease;inside|outside;above|below;wide|narrow;thick|thin;sweet|bitter;clean|dirty;dry|wet;give|take;laugh|weep;buy|sell;remember|forget;maximum|minimum;optimist|pessimist;generous|stingy;humble|arrogant;temporary|permanent;present|absent;wise|foolish;safe|dangerous;smooth|rough`),
 a=>`Choose the antonym of "${a}".`,b=>`Which word is the opposite of "${b}"?`,o);
const V=P(`go|went|gone;eat|ate|eaten;see|saw|seen;take|took|taken;write|wrote|written;speak|spoke|spoken;break|broke|broken;drink|drank|drunk;sing|sang|sung;swim|swam|swum;begin|began|begun;ring|rang|rung;drive|drove|driven;give|gave|given;know|knew|known;grow|grew|grown;throw|threw|thrown;fly|flew|flown;draw|drew|drawn;choose|chose|chosen;wear|wore|worn;tear|tore|torn;forget|forgot|forgotten;hide|hid|hidden;ride|rode|ridden;rise|rose|risen;shake|shook|shaken;steal|stole|stolen;freeze|froze|frozen;bite|bit|bitten`);
V.forEach(([a,b,c])=>{o.push(mk(`Past tense of "${a}"?`,b,V.map(v=>v[1])));o.push(mk(`Past participle of "${a}"?`,c,V.map(v=>v[2])));});
pair(P(`child|children;man|men;woman|women;tooth|teeth;foot|feet;mouse|mice;goose|geese;person|people;ox|oxen;leaf|leaves;knife|knives;wolf|wolves;life|lives;half|halves;cactus|cacti;crisis|crises;analysis|analyses;phenomenon|phenomena;datum|data;criterion|criteria`),
 a=>`Plural of "${a}"?`,b=>`Singular of "${b}"?`,o);
pair(P(`A person who loves books|Bibliophile;Study of birds|Ornithology;Fear of heights|Acrophobia;One who knows everything|Omniscient;Government by the people|Democracy;Life story written by oneself|Autobiography;A person who walks in sleep|Somnambulist;Killing of a king|Regicide;A place where birds are kept|Aviary;A medicine that relieves pain|Analgesic;One who cannot read or write|Illiterate;That which cannot be read|Illegible;Fear of water|Hydrophobia;Rule by a few|Oligarchy;Speaking to oneself|Soliloquy;A doctor who treats children|Paediatrician;Study of the origin of words|Etymology;One who lives alone away from society|Hermit;One who hates mankind|Misanthrope;Government by one person|Autocracy;Belief in many gods|Polytheism;Present everywhere|Omnipresent;Incapable of being corrected|Incorrigible;A man who has lost his wife|Widower;Fear of closed spaces|Claustrophobia`),
 a=>`One-word substitution: ${a}`,null,o);
B.english=o;}

// ---------- History ----------
{const o=[],ev=P(`did Columbus reach the Americas|1492;did Vasco da Gama reach Calicut|1498;was the First Battle of Panipat fought|1526;was the Battle of Haldighati fought|1576;was the Battle of Plassey fought|1757;was the Battle of Buxar fought|1764;was the American Declaration of Independence adopted|1776;did the French Revolution begin|1789;was the Battle of Waterloo fought|1815;did the Revolt of 1857 begin|1857;was the Indian National Congress founded|1885;was Bengal first partitioned|1905;did World War I begin|1914;did the Russian Revolution take place|1917;did the Jallianwala Bagh massacre occur|1919;was the Non-Cooperation Movement launched|1920;did the Chauri Chaura incident occur|1922;did the Dandi March take place|1930;did World War II begin|1939;was the Quit India Movement launched|1942;did World War II end|1945;was the United Nations founded|1945;did India become independent|1947;was Mahatma Gandhi assassinated|1948;did the Indian Constitution come into force|1950;did Hillary and Tenzing first climb Mount Everest|1953;did Yuri Gagarin become the first human in space|1961;did the Sino-Indian War take place|1962;did Neil Armstrong walk on the Moon|1969;was Bangladesh liberated|1971;did the Berlin Wall fall|1989;did the Soviet Union dissolve|1991;did the Kargil War take place|1999;did the Suez Canal open|1869;did the first railway run in India|1853;was the East India Company founded|1600;was the Magna Carta signed|1215;was the Battle of Hastings fought|1066;was the Third Battle of Panipat fought|1761;did Aurangzeb die|1707;was the Delhi Sultanate established|1206;was the Second Battle of Panipat fought|1556;was the Gandhi–Irwin Pact signed|1931;was the Government of India Act passed|1935;did the Cabinet Mission arrive in India|1946;did the Lahore Congress demand Purna Swaraj|1929;did Tagore win the Nobel Prize|1913;was the shift of the capital from Calcutta to Delhi announced|1911;was the Rowlatt Act passed|1919;was the Treaty of Versailles signed|1919;did the Wright brothers make their first powered flight|1903;did the Titanic sink|1912;did the Wall Street Crash happen|1929;did India conduct the Pokhran-II tests|1998;was the Emergency declared in India|1975;did the Bhopal gas tragedy occur|1984;was Indira Gandhi assassinated|1984;was Rajiv Gandhi assassinated|1991;was Chandrayaan-1 launched|2008;was Aryabhata, India's first satellite, launched|1975;was Mangalyaan launched|2013;did the 9/11 attacks occur|2001;did the Chernobyl disaster occur|1986;was Hiroshima bombed|1945;was Bhagat Singh hanged|1931;did the Chipko Movement begin|1973;was the Right to Information Act passed|2005;was GST introduced in India|2017;was demonetisation announced in India|2016;did the Battle of Kannauj between Humayun and Sher Shah take place|1540;was Shivaji crowned Chhatrapati|1674;was the Brahmo Samaj founded|1828;was Sati abolished in British India|1829`);
ev.forEach(([a,b])=>o.push(numQ(`In which year ${a}?`,+b,4)));
const pp=P(`Mahatma Gandhi|Led the Dandi (Salt) March;Jawaharlal Nehru|First Prime Minister of India;Sardar Vallabhbhai Patel|Integrated the princely states;Dr. B. R. Ambedkar|Chairman of the Constitution Drafting Committee;Dr. Rajendra Prasad|First President of India;Subhas Chandra Bose|Organised the Indian National Army;Bhagat Singh|Revolutionary hanged in 1931;Rani Lakshmibai|Queen of Jhansi in the Revolt of 1857;Mangal Pandey|Sepoy of Barrackpore in 1857;Bal Gangadhar Tilak|Lokmanya;Lala Lajpat Rai|Punjab Kesari;Gopal Krishna Gokhale|Political guru of Gandhi;Dadabhai Naoroji|Grand Old Man of India;Sarojini Naidu|Nightingale of India;Rabindranath Tagore|First Asian Nobel laureate in Literature;Raja Ram Mohan Roy|Founder of Brahmo Samaj;Swami Vivekananda|Spoke at the 1893 Parliament of Religions, Chicago;Dayananda Saraswati|Founder of Arya Samaj;Jyotirao Phule|Founder of Satyashodhak Samaj;Maulana Abul Kalam Azad|First Education Minister of India;Lal Bahadur Shastri|Gave the slogan Jai Jawan Jai Kisan;Indira Gandhi|First woman Prime Minister of India;Mother Teresa|Founder of Missionaries of Charity;Sher Shah Suri|Rebuilt the Grand Trunk Road;Akbar|Founder of Din-i-Ilahi;Babur|Founder of the Mughal Empire;Shivaji|Founder of the Maratha Empire;Tipu Sultan|Tiger of Mysore;Maharaja Ranjit Singh|Lion of Punjab;Gautama Buddha|Founder of Buddhism;Mahavira|24th Tirthankara of Jainism;Guru Nanak|Founder of Sikhism;Lord Dalhousie|Introduced the Doctrine of Lapse;Lord Curzon|Partitioned Bengal in 1905;Lord Mountbatten|Last Viceroy of India;Lord William Bentinck|Abolished Sati;Robert Clive|Won the Battle of Plassey;Warren Hastings|First Governor-General of Bengal;Napoleon Bonaparte|Defeated at Waterloo;George Washington|First President of the USA;Abraham Lincoln|Issued the Emancipation Proclamation;Martin Luther King Jr.|Delivered the 'I Have a Dream' speech;Nelson Mandela|First Black President of South Africa;Winston Churchill|British PM during most of World War II;Adolf Hitler|Nazi dictator of Germany;Joseph Stalin|Soviet leader during World War II;Mao Zedong|Founder of the People's Republic of China;Christopher Columbus|Reached the Americas in 1492;Vasco da Gama|Found the sea route to India;Marco Polo|Venetian traveller to China;Ferdinand Magellan|Led the first voyage around the world;Julius Caesar|Roman dictator assassinated in 44 BC;Genghis Khan|Founder of the Mongol Empire;Queen Victoria|Empress of India from 1876;Kautilya|Author of the Arthashastra;Ashoka|Emperor who embraced Buddhism after the Kalinga war`);
pair(pp,a=>`${a} is best known as:`,b=>`Which person matches: "${b}"?`,o);
pair(P(`Chandragupta Maurya|Maurya;Samudragupta|Gupta;Kanishka|Kushan;Pulakeshin II|Chalukya;Rajaraja I|Chola;Krishnadevaraya|Vijayanagara;Alauddin Khilji|Khilji;Muhammad bin Tughlaq|Tughlaq;Ibrahim Lodi|Lodi;Akbar|Mughal;Qutb-ud-din Aibak|Slave (Mamluk);Mahendravarman I|Pallava;Chandragupta II|Gupta;Ashoka|Maurya;Shah Jahan|Mughal;Balban|Slave (Mamluk);Firoz Shah Tughlaq|Tughlaq;Sher Shah Suri|Sur`),a=>`${a} belonged to which dynasty?`,null,o);
B.history=o;}

// ---------- Geography ----------
{const o=[];
pair(P(`Afghanistan|Kabul;Argentina|Buenos Aires;Australia|Canberra;Austria|Vienna;Bangladesh|Dhaka;Belgium|Brussels;Brazil|Brasília;Canada|Ottawa;Chile|Santiago;China|Beijing;Colombia|Bogotá;Cuba|Havana;Denmark|Copenhagen;Egypt|Cairo;Finland|Helsinki;France|Paris;Germany|Berlin;Greece|Athens;Hungary|Budapest;India|New Delhi;Indonesia|Jakarta;Iran|Tehran;Iraq|Baghdad;Ireland|Dublin;Italy|Rome;Japan|Tokyo;Kenya|Nairobi;Malaysia|Kuala Lumpur;Mexico|Mexico City;Nepal|Kathmandu;Netherlands|Amsterdam;New Zealand|Wellington;Nigeria|Abuja;Norway|Oslo;Pakistan|Islamabad;Peru|Lima;Philippines|Manila;Poland|Warsaw;Portugal|Lisbon;Russia|Moscow;Saudi Arabia|Riyadh;South Korea|Seoul;Spain|Madrid;Sweden|Stockholm;Switzerland|Bern;Thailand|Bangkok;Turkey|Ankara;Ukraine|Kyiv;United Kingdom|London;United States|Washington, D.C.;Vietnam|Hanoi;Zimbabwe|Harare;Ethiopia|Addis Ababa;Ghana|Accra;Morocco|Rabat;Algeria|Algiers;Tunisia|Tunis;Libya|Tripoli;Sudan|Khartoum;Tanzania|Dodoma;Uganda|Kampala;Zambia|Lusaka;Angola|Luanda;Senegal|Dakar;Cameroon|Yaoundé;Ecuador|Quito;Venezuela|Caracas;Uruguay|Montevideo;Paraguay|Asunción;Costa Rica|San José;Panama|Panama City;Jamaica|Kingston;Iceland|Reykjavik;Croatia|Zagreb;Serbia|Belgrade;Romania|Bucharest;Bulgaria|Sofia;Czech Republic|Prague;Slovakia|Bratislava;Slovenia|Ljubljana;Estonia|Tallinn;Latvia|Riga;Lithuania|Vilnius;Belarus|Minsk;Georgia|Tbilisi;Armenia|Yerevan;Azerbaijan|Baku;Kazakhstan|Astana;Uzbekistan|Tashkent;Mongolia|Ulaanbaatar;Myanmar|Naypyidaw;Cambodia|Phnom Penh;Laos|Vientiane;Singapore|Singapore;Bhutan|Thimphu;Maldives|Malé;Qatar|Doha;Kuwait|Kuwait City;UAE|Abu Dhabi;Oman|Muscat;Jordan|Amman;Lebanon|Beirut;Syria|Damascus;Yemen|Sanaa;Madagascar|Antananarivo;Mozambique|Maputo;Namibia|Windhoek;Botswana|Gaborone;Cyprus|Nicosia;Malta|Valletta;Albania|Tirana;North Macedonia|Skopje;Bosnia and Herzegovina|Sarajevo`),
 a=>`What is the capital of ${a}?`,b=>`${b} is the capital of which country?`,o);
B.geography=o;}

// ---------- Computer ----------
{const o=[];
pair(P(`CPU|Central Processing Unit;RAM|Random Access Memory;ROM|Read Only Memory;HTML|HyperText Markup Language;CSS|Cascading Style Sheets;HTTP|HyperText Transfer Protocol;HTTPS|HyperText Transfer Protocol Secure;URL|Uniform Resource Locator;USB|Universal Serial Bus;LAN|Local Area Network;WAN|Wide Area Network;DNS|Domain Name System;IP|Internet Protocol;FTP|File Transfer Protocol;SMTP|Simple Mail Transfer Protocol;GUI|Graphical User Interface;OS|Operating System;BIOS|Basic Input Output System;SQL|Structured Query Language;PDF|Portable Document Format;JPEG|Joint Photographic Experts Group;GIF|Graphics Interchange Format;PNG|Portable Network Graphics;SSD|Solid State Drive;HDD|Hard Disk Drive;GPU|Graphics Processing Unit;ISP|Internet Service Provider;VPN|Virtual Private Network;AI|Artificial Intelligence;IoT|Internet of Things;API|Application Programming Interface;IDE|Integrated Development Environment;XML|eXtensible Markup Language;JSON|JavaScript Object Notation;SEO|Search Engine Optimization;GPS|Global Positioning System;ATM|Automated Teller Machine;PIN|Personal Identification Number;OCR|Optical Character Recognition;LED|Light Emitting Diode;LCD|Liquid Crystal Display;DVD|Digital Versatile Disc;VGA|Video Graphics Array;HDMI|High-Definition Multimedia Interface;NIC|Network Interface Card;MAC|Media Access Control;DHCP|Dynamic Host Configuration Protocol;TCP|Transmission Control Protocol;UDP|User Datagram Protocol;SSL|Secure Sockets Layer;ASCII|American Standard Code for Information Interchange;ALU|Arithmetic Logic Unit;DBMS|Database Management System;RISC|Reduced Instruction Set Computer;CD|Compact Disc;WWW|World Wide Web`),
 a=>`What is the full form of ${a}?`,b=>`Which abbreviation stands for "${b}"?`,o);
pair(P(`Python|Guido van Rossum;C|Dennis Ritchie;C++|Bjarne Stroustrup;Java|James Gosling;JavaScript|Brendan Eich;PHP|Rasmus Lerdorf;Linux kernel|Linus Torvalds;Ruby|Yukihiro Matsumoto;Pascal|Niklaus Wirth;Perl|Larry Wall`),a=>`Who created ${a}?`,b=>`${b} created which of these?`,o);
const bits=n=>n.toString(2);
for(const n of uniq([...Array(58).keys()].map(i=>i+5),30)){const w=[n+1,n-1,n+2,n^1,n+4].filter(v=>v>0&&v!==n).map(bits);o.push(mk(`Binary equivalent of decimal ${n}?`,bits(n),[bits(n),...w]));}
for(const n of uniq([...Array(58).keys()].map(i=>i+5),30))o.push(numQ(`Decimal value of binary ${bits(n)}?`,n,3));
for(let n=2;n<=21;n++)o.push(numQ(`How many bits are there in ${n} bytes?`,n*8,8));
B.computer=o;}

// ---------- Class 10 ----------
{const o=[];
const qp=[];for(let a=1;a<=9;a++)for(let b=a+1;b<=9;b++)qp.push([a,b]);const qs=qp.map(([a,b])=>`${a} and ${b}`);
uniq(qp,25).forEach(([a,b])=>o.push(mk(`Roots of x² − ${a+b}x + ${a*b} = 0 are:`,`${a} and ${b}`,qs)));
const ap=[];for(let a=2;a<=20;a+=2)for(let d=2;d<=9;d++)ap.push([a,d,5+R(10)]);
uniq(ap,30).forEach(([a,d,n])=>o.push(numQ(`In an AP, first term = ${a} and common difference = ${d}. Find the ${n}th term.`,a+(n-1)*d,d)));
pair(P(`sin 30°|1/2;cos 60°|1/2;tan 45°|1;sin 90°|1;cos 0°|1;sin 0°|0;cos 90°|0;tan 30°|1/√3;sin 60°|√3/2;cos 30°|√3/2;sin 45°|1/√2;tan 60°|√3;cos 45°|1/√2;cot 45°|1;sec 0°|1;cosec 90°|1;tan 0°|0;cot 90°|0;sec 60°|2;cosec 30°|2;cosec 45°|√2;sec 45°|√2`),
 a=>`Value of ${a}?`,null,o,['0','1','1/2','√3/2','1/√2','1/√3','√3','2','√2']);
const cy=[];for(const r of [7,14,21])for(let h=1;h<=10;h++)cy.push([r,h]);
uniq(cy,30).forEach(([r,h])=>o.push(numQ(`Volume of a cylinder: radius ${r} cm, height ${h} cm (π = 22/7), in cm³?`,22/7*r*r*h,Math.round(22/7*r*r*h*.1))));
for(let k=1;k<=7;k++)o.push(numQ(`Area of a circle of radius ${7*k} cm (π = 22/7), in cm²?`,22/7*49*k*k,Math.round(154*k*k*.15)));
for(let k=1;k<=10;k++)o.push(numQ(`Circumference of a circle of radius ${7*k} cm (π = 22/7), in cm?`,44*k,6));
for(let h=1;h<=10;h++)o.push(numQ(`Curved surface area of a cylinder: radius 7 cm, height ${h} cm (π = 22/7), in cm²?`,44*h,Math.max(8,h*5)));
const pr=[];for(let r=1;r<=9;r++)for(let b=1;b<=9;b++)if(r!==b){const g=gcd(r,r+b);pr.push([r,b,`${r/g}/${(r+b)/g}`]);}
const prs=pr.map(x=>x[2]);uniq(pr,25).forEach(([r,b,s])=>o.push(mk(`A bag has ${r} red and ${b} blue balls. Probability of drawing a red ball?`,s,prs)));
pair(P(`Lemon juice|Acidic;Vinegar|Acidic;Milk of magnesia|Basic;Baking soda solution|Basic;Pure water|Neutral;Gastric juice|Acidic;Soap solution|Basic;Tomato juice|Acidic;Sodium hydroxide solution|Basic;Ammonia solution|Basic;Common salt solution|Neutral;Orange juice|Acidic;Curd|Acidic;Washing soda solution|Basic;Sugar solution|Neutral;Black coffee|Acidic`),
 a=>`What is the nature of ${a.toLowerCase()}?`,null,o,['Acidic','Basic','Neutral','Amphoteric']);
const oh=[];for(let i=1;i<=9;i++)for(let r=2;r<=20;r+=2)oh.push([i,r]);
uniq(oh,25).forEach(([i,r])=>o.push(numQ(`A current of ${i} A flows through a resistor of ${r} Ω. Potential difference (V)?`,i*r,Math.max(2,i*2))));
pair(P(`Concave mirror|Shaving mirrors and torch reflectors;Convex mirror|Rear-view mirrors of vehicles;Concave lens|Correcting myopia;Convex lens|Correcting hypermetropia;Plane mirror|Forms a virtual image of the same size;Glass prism|Splits white light into a spectrum`),
 a=>`${a}: which is its use or property?`,b=>`"${b}" relates to which device?`,o);
const tri=[[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25],[12,16,20],[15,20,25],[20,21,29],[10,24,26]];
for(const [dx,dy,h] of tri)for(let s=0;s<3;s++){const a=R(6),b=R(6);o.push(numQ(`Distance between points (${a}, ${b}) and (${a+dx}, ${b+dy})?`,h,2));}
for(let i=0;i<25;i++){const a=2*R(5),c=2*R(5)+2,b=2*R(5)+1,d=2*R(5)+3,ans=`(${(a+c)/2}, ${(b+d)/2})`;
 const pool=[ans,`(${(a+c)/2+1}, ${(b+d)/2})`,`(${(a+c)/2}, ${(b+d)/2+1})`,`(${(a+c)/2+2}, ${(b+d)/2-1})`,`(${a+c}, ${b+d})`];
 o.push(mk(`Midpoint of (${a}, ${b}) and (${c}, ${d})?`,ans,pool));}
B.class10=o;}

// ---------- Class 11 ----------
{const o=[];
const kv=[];for(let u=0;u<=20;u+=2)for(let a=1;a<=9;a++)kv.push([u,a,1+R(10)]);
uniq(kv,30).forEach(([u,a,t])=>o.push(numQ(`A body moving at ${u} m/s accelerates at ${a} m/s² for ${t} s. Final velocity (m/s)?`,u+a*t,a+1)));
const ks=[];for(const a of [2,4,6,8,10])for(let t=1;t<=10;t++)ks.push([a,t]);
uniq(ks,20).forEach(([a,t])=>o.push(numQ(`A body starts from rest with acceleration ${a} m/s². Distance covered in ${t} s (m)?`,a*t*t/2,Math.max(3,a*t))));
for(const [F,d] of uniq(Array.from({length:60},()=>[2+R(19),1+R(10)]).filter((x,i,a)=>a.findIndex(y=>y[0]===x[0]&&y[1]===x[1])===i),15))o.push(numQ(`Work done by a force of ${F} N moving a body ${d} m along the force (J)?`,F*d,Math.max(2,Math.round(F*d*.15))));
const ke=[];for(let m=2;m<=20;m+=2)for(let v=1;v<=10;v++)ke.push([m,v]);
uniq(ke,20).forEach(([m,v])=>o.push(numQ(`Kinetic energy of a ${m} kg body moving at ${v} m/s (J)?`,m*v*v/2,Math.max(3,Math.round(m*v*v/10)))));
const comp=[['water',18],['carbon dioxide',44],['oxygen (O₂)',32],['methane',16],['ammonia',17],['sulphuric acid',98],['nitrogen (N₂)',28],['calcium carbonate',100],['sodium hydroxide',40]],mo=[];
for(const [n,M] of comp)for(let k=1;k<=5;k++)mo.push([n,M,k]);
uniq(mo,30).forEach(([n,M,k])=>o.push(numQ(`How many moles are in ${k*M} g of ${n}? (Molar mass = ${M} g/mol)`,k,1)));
const cm=[];for(let n=5;n<=10;n++)for(let r=2;r<=n-2;r++)cm.push([n,r]);
const f=n=>n<2?1:n*f(n-1);
uniq(cm,25).forEach(([n,r])=>o.push(numQ(`Value of ${n}C${r}?`,f(n)/(f(r)*f(n-r)),Math.max(2,Math.round(f(n)/(f(r)*f(n-r))*.15)))));
for(const [n,r] of uniq([[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[5,3],[6,3],[7,3],[4,3],[8,3],[9,3],[10,2],[10,3],[6,4]],15))o.push(numQ(`Value of ${n}P${r}?`,f(n)/f(n-r),Math.max(3,Math.round(f(n)/f(n-r)*.15))));
for(let k=1;k<=10;k++)o.push(numQ(`Value of log₂(${2**k})?`,k,1));
const st=[];for(let a=10;a<=40;a+=5)for(let b=10;b<=40;b+=5)for(let c=2;c<=8;c+=3)st.push([a,b,c]);
uniq(st,20).forEach(([a,b,c])=>o.push(numQ(`If n(A) = ${a}, n(B) = ${b} and n(A∩B) = ${c}, then n(A∪B) = ?`,a+b-c,3)));
pair(P(`Mitochondria|Powerhouse of the cell (ATP production);Ribosome|Protein synthesis;Nucleus|Controls cell activities and stores DNA;Golgi apparatus|Packaging and secretion of materials;Lysosome|Digestion of waste (suicide bag);Chloroplast|Photosynthesis;Endoplasmic reticulum|Transport of materials inside the cell;Vacuole|Storage of water and nutrients;Cell wall|Gives shape and protection to plant cells;Centriole|Forms spindle during cell division;Cell membrane|Selectively permeable boundary of the cell`),
 a=>`Main function of the ${a.toLowerCase()}?`,b=>`Which cell part: ${b}?`,o);
B.class11=o;}

// ---------- Class 12 ----------
{const o=[];
pair(P(`sin x|cos x;cos x|−sin x;tan x|sec²x;cot x|−cosec²x;sec x|sec x tan x;cosec x|−cosec x cot x;eˣ|eˣ;ln x|1/x;xⁿ|n xⁿ⁻¹;aˣ|aˣ ln a;sin⁻¹x|1/√(1−x²);tan⁻¹x|1/(1+x²);√x|1/(2√x);1/x|−1/x²`),a=>`d/dx of ${a} = ?`,null,o);
const dv=[];for(let k=2;k<=9;k++)for(let n=2;n<=9;n++)dv.push([k,n]);
uniq(dv,40).forEach(([k,n])=>o.push(mk(`Differentiate ${k}x^${n} with respect to x.`,fmt(k*n,n-1),[fmt(k*n,n-1),fmt(k,n-1),fmt(k*n,n),fmt(k*(n+1),n-1),fmt(k*n,n-2>=0?n-2:0)])));
pair(P(`sin x|−cos x + C;cos x|sin x + C;eˣ|eˣ + C;1/x|ln|x| + C;sec²x|tan x + C;cosec²x|−cot x + C;1/(1+x²)|tan⁻¹x + C;1/√(1−x²)|sin⁻¹x + C;aˣ|aˣ/ln a + C;sec x tan x|sec x + C`),a=>`∫ ${a} dx = ?`,null,o);
const ig=[];for(let n=1;n<=6;n++)for(let m=1;m<=4;m++)ig.push([n,m]);
ig.forEach(([n,m])=>o.push(mk(`∫ ${fmt((n+1)*m,n)} dx = ?`,fmt(m,n+1)+' + C',[fmt(m,n+1)+' + C',fmt((n+1)*m,n+1)+' + C',fmt(m,n)+' + C',fmt(m+1,n+1)+' + C'])));
const dt=[];for(let a=1;a<=9;a++)for(let b=1;b<=5;b++)for(let c=1;c<=5;c++){const d=1+R(9);dt.push([a,b,c,d]);}
uniq(dt,30).forEach(([a,b,c,d])=>o.push(numQ(`Determinant of the matrix [[${a}, ${b}], [${c}, ${d}]] = ?`,a*d-b*c,3)));
const cp=[];for(let a=1;a<=8;a++)for(let b=a+1;b<=9;b++)cp.push([a,b]);
uniq(cp,15).forEach(([a,b])=>o.push(numQ(`Capacitors of ${a} µF and ${b} µF are connected in parallel. Equivalent capacitance (µF)?`,a+b,2)));
pair(P(`Coulomb's law|Charles-Augustin de Coulomb;Lenz's law|Heinrich Lenz;Gauss's law|Carl Friedrich Gauss;Ohm's law|Georg Ohm;Snell's law|Willebrord Snell;Huygens' principle|Christiaan Huygens;Photoelectric effect (explanation)|Albert Einstein;Atomic model with quantised orbits|Niels Bohr;Matter waves|Louis de Broglie;Gold foil experiment|Ernest Rutherford;Prediction of electromagnetic waves|James Clerk Maxwell;Uncertainty principle|Werner Heisenberg`),
 a=>`${a} is associated with which scientist?`,b=>`${b} is credited with:`,o);
for(let i=0;i<30;i++){const v=()=>1+R(6);const [a,b,c,d,e,f_]=[v(),v(),v(),v(),v(),v()];o.push(numQ(`Dot product of (${a}, ${b}, ${c}) and (${d}, ${e}, ${f_}) = ?`,a*d+b*e+c*f_,4));}
for(const [x,y,h] of [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[12,16,20],[15,20,25],[9,40,41],[20,21,29]])o.push(numQ(`Magnitude of the vector ${x}i + ${y}j?`,h,2));
for(let n=3;n<=22;n++)o.push(numQ(`How many terms are in the expansion of (a + b)^${n}?`,n+1,1));
B.class12=o;}

// ---------- NEET ----------
{const o=[];
pair(P(`Vitamin A|Night blindness;Vitamin B1 (Thiamine)|Beriberi;Vitamin B3 (Niacin)|Pellagra;Vitamin B12|Pernicious anaemia;Vitamin C|Scurvy;Vitamin D|Rickets;Vitamin K|Delayed blood clotting;Vitamin B2 (Riboflavin)|Cheilosis and angular stomatitis`),a=>`Deficiency of ${a} causes:`,b=>`${b} is caused by deficiency of:`,o);
pair(P(`Insulin|Pancreas;Thyroxine|Thyroid gland;Adrenaline|Adrenal medulla;Growth hormone|Anterior pituitary;Testosterone|Testes;Oestrogen|Ovaries;Melatonin|Pineal gland;Parathormone|Parathyroid gland`),a=>`${a} is secreted by:`,b=>`Which hormone is secreted by: ${b}?`,o);
pair(P(`Malaria|Plasmodium;Tuberculosis|Mycobacterium tuberculosis;Cholera|Vibrio cholerae;Typhoid|Salmonella typhi;Polio|Poliovirus;Dengue|Dengue virus;AIDS|HIV;Ringworm|Fungi;Amoebiasis|Entamoeba histolytica;Tetanus|Clostridium tetani;Diphtheria|Corynebacterium diphtheriae;Leprosy|Mycobacterium leprae;Influenza|Influenza virus;Plague|Yersinia pestis;Kala-azar|Leishmania donovani;Sleeping sickness|Trypanosoma;Filariasis|Wuchereria bancrofti;Hepatitis B|Hepatitis B virus;Pneumonia|Streptococcus pneumoniae;Whooping cough|Bordetella pertussis`),a=>`Causative agent of ${a}?`,b=>`${b} causes which disease?`,o);
pair(P(`Pepsin|Protein digestion in the stomach;Amylase|Digestion of starch;Lipase|Digestion of fats;Trypsin|Protein digestion in the small intestine;Lactase|Digestion of lactose;Catalase|Breaks down hydrogen peroxide;Maltase|Digestion of maltose;DNA ligase|Joins DNA fragments;Helicase|Unwinds the DNA double helix;DNA polymerase|Synthesises new DNA strands`),a=>`Function of the enzyme ${a}?`,b=>`Which enzyme: ${b}?`,o);
pair(P(`Auxin|Cell elongation;Gibberellin|Stem elongation and seed germination;Cytokinin|Promotes cell division;Ethylene|Fruit ripening;Abscisic acid|Seed dormancy and stress response`),a=>`Main role of the plant hormone ${a.toLowerCase()}?`,b=>`Which plant hormone: ${b}?`,o);
pair(P(`Gregor Mendel|Laws of inheritance;Watson and Crick|DNA double helix model;Thomas Hunt Morgan|Chromosome theory using fruit fly;Hugo de Vries|Mutation theory;Robert Hooke|Discovered cells in cork;Schleiden and Schwann|Cell theory;Louis Pasteur|Germ theory of disease;Hershey and Chase|DNA is the genetic material;Alexander Fleming|Discovered penicillin;Frederick Griffith|Transformation experiment in bacteria;Beadle and Tatum|One gene–one enzyme hypothesis;Carl Linnaeus|Binomial nomenclature`),a=>`${a} are known for:`,b=>`Who is known for: ${b}?`,o);
P(`Human|46;Dog|78;Cat|38;Fruit fly|8;Garden pea|14;Maize|20;Rice|24;Onion|16;Frog|26;Horse|64;Chimpanzee|48;Mosquito|6;Rat|42`).forEach(([a,b])=>o.push(numQ(`Diploid chromosome number of ${a.toLowerCase()}?`,+b,4)));
pair(P(`Xylem|Transports water and minerals;Phloem|Transports food;Stomata|Gas exchange and transpiration;Root hair|Absorbs water from soil;Anther|Produces pollen grains;Stigma|Receives pollen;Ovule|Develops into seed;Ovary|Develops into fruit;Cambium|Secondary growth;Chloroplast|Site of photosynthesis;Pollen grain|Male gametophyte`),a=>`Function of the ${a.toLowerCase()}?`,b=>`Which plant part: ${b}?`,o);
pair(P(`Porifera|Sponge;Cnidaria|Hydra;Platyhelminthes|Tapeworm;Nematoda|Roundworm;Annelida|Earthworm;Arthropoda|Cockroach;Mollusca|Snail;Echinodermata|Starfish;Chordata|Human`),a=>`An example of phylum ${a}:`,b=>`${b} belongs to which phylum?`,o);
pair(P(`Kidney|Filters blood and forms urine;Liver|Produces bile;Lungs|Gas exchange;Heart|Pumps blood;Pancreas|Produces insulin and digestive enzymes;Stomach|Begins protein digestion;Small intestine|Absorbs digested nutrients;Large intestine|Absorbs water;Spleen|Filters blood and destroys old RBCs;Gall bladder|Stores bile;Skin|Protection and temperature regulation;Brain|Control centre of the nervous system`),a=>`Main function of the ${a.toLowerCase()}?`,b=>`Which organ: ${b}?`,o);
B.neet=o;}

// ---------- Engineering ----------
{const o=[];
const hx=[];for(let i=16;i<=255;i++)hx.push(i);
uniq(hx,30).forEach(n=>o.push(numQ(`Decimal value of hexadecimal ${n.toString(16).toUpperCase()}?`,n,Math.max(2,Math.round(n*.06)))));
uniq([...Array(56).keys()].map(i=>i+8),15).forEach(n=>o.push(numQ(`Decimal value of octal ${n.toString(8)}?`,n,3)));
const sr=[];for(let a=5;a<=50;a+=5)for(let b=a+5;b<=50;b+=5)sr.push([a,b]);
uniq(sr,25).forEach(([a,b])=>o.push(numQ(`Resistors of ${a} Ω and ${b} Ω are in series. Equivalent resistance (Ω)?`,a+b,5)));
for(let r=4;r<=42;r+=2)if(o.length<10000&&r<=42)o.push(numQ(`Two identical resistors of ${r} Ω are connected in parallel. Equivalent resistance (Ω)?`,r/2,Math.max(1,Math.round(r*.15))));
const pw=[];for(const v of [12,24,110,220,230])for(let i=1;i<=8;i++)pw.push([v,i]);
uniq(pw,20).forEach(([v,i])=>o.push(numQ(`A device on ${v} V draws ${i} A. Power consumed (W)?`,v*i,Math.max(5,Math.round(v*i*.1)))));
const fm=[];for(let m=2;m<=20;m+=2)for(let a=1;a<=9;a++)fm.push([m,a]);
uniq(fm,20).forEach(([m,a])=>o.push(numQ(`Force needed to accelerate ${m} kg at ${a} m/s² (N)?`,m*a,Math.max(2,Math.round(m*a*.15)))));
const pe=[];for(let A=2;A<=10;A+=1)for(const p of [5,10,20])pe.push([A,p]);
uniq(pe,15).forEach(([A,p])=>o.push(numQ(`A force of ${A*p} N acts on an area of ${A} m². Pressure (Pa)?`,p,3)));
const G={AND:(a,b)=>a&b,OR:(a,b)=>a|b,NAND:(a,b)=>+!(a&b),NOR:(a,b)=>+!(a|b),XOR:(a,b)=>a^b,XNOR:(a,b)=>+!(a^b)};
for(const g in G)for(const a of [0,1])for(const b of [0,1])o.push({q:`Output of a ${g} gate when A = ${a} and B = ${b}?`,o:['0','1'],a:G[g](a,b)});
pair(P(`Binary search|O(log n);Linear search|O(n);Bubble sort (worst case)|O(n²);Merge sort|O(n log n);Quick sort (average case)|O(n log n);Hash table lookup (average)|O(1);Heap insertion|O(log n);Selection sort (worst case)|O(n²);Insertion sort (best case)|O(n);Array access by index|O(1)`),
 a=>`Time complexity of ${a}?`,null,o,['O(1)','O(log n)','O(n)','O(n log n)','O(n²)','O(2ⁿ)']);
pair(P(`Pauli exclusion principle|Wolfgang Pauli;Hund's rule|Friedrich Hund;Le Chatelier's principle|Henri Le Chatelier;Avogadro's law|Amedeo Avogadro;Boyle's law|Robert Boyle;Charles's law|Jacques Charles;Gay-Lussac's law|Joseph Louis Gay-Lussac;Hess's law|Germain Hess;Raoult's law|François-Marie Raoult;Henry's law|William Henry;Graham's law of diffusion|Thomas Graham;Bernoulli's principle|Daniel Bernoulli;Archimedes' principle|Archimedes;Newton's law of cooling|Isaac Newton;Kirchhoff's laws|Gustav Kirchhoff;Hooke's law of elasticity|Robert Hooke`),
 a=>`Who formulated ${a}?`,b=>`${b} is credited with which law or principle?`,o);
B.engineering=o;}

// ---------- CBSE ----------
{const o=[];
pair(P(`Arunachal Pradesh|Itanagar;Assam|Dispur;Bihar|Patna;Chhattisgarh|Raipur;Goa|Panaji;Gujarat|Gandhinagar;Haryana|Chandigarh;Himachal Pradesh|Shimla;Jharkhand|Ranchi;Karnataka|Bengaluru;Kerala|Thiruvananthapuram;Madhya Pradesh|Bhopal;Maharashtra|Mumbai;Manipur|Imphal;Meghalaya|Shillong;Mizoram|Aizawl;Nagaland|Kohima;Odisha|Bhubaneswar;Punjab|Chandigarh;Rajasthan|Jaipur;Sikkim|Gangtok;Tamil Nadu|Chennai;Telangana|Hyderabad;Tripura|Agartala;Uttar Pradesh|Lucknow;Uttarakhand|Dehradun;West Bengal|Kolkata;Delhi|New Delhi;Puducherry|Puducherry;Andaman and Nicobar Islands|Port Blair;Lakshadweep|Kavaratti;Ladakh|Leh`),
 a=>`What is the capital of ${a}?`,b=>`${b} is the capital of which Indian state/UT?`,o);
pair(P(`Article 14|Equality before law;Article 15|Prohibition of discrimination;Article 17|Abolition of untouchability;Article 19|Freedom of speech and expression;Article 21|Right to life and personal liberty;Article 21A|Right to education;Article 23|Prohibition of trafficking and forced labour;Article 24|Prohibition of child labour in hazardous work;Article 32|Right to constitutional remedies;Article 51A|Fundamental duties;Article 324|Election Commission;Article 352|National Emergency;Article 356|President's Rule in states;Article 368|Amendment of the Constitution;Article 280|Finance Commission;Article 124|Establishment of the Supreme Court`),
 a=>`${a} of the Indian Constitution deals with:`,b=>`Which article deals with: ${b}?`,o);
pair(P(`Reserve Bank of India|Mumbai;ISRO|Bengaluru;Supreme Court of India|New Delhi;SEBI|Mumbai;NABARD|Mumbai;DRDO|New Delhi;Election Commission of India|New Delhi;BARC|Mumbai;Indian Institute of Science|Bengaluru`),a=>`Headquarters of ${a}?`,null,o);
pair(P(`National animal of India|Tiger;National bird of India|Indian peacock;National flower of India|Lotus;National fruit of India|Mango;National tree of India|Banyan`),a=>`${a}?`,b=>`${b} is the ______ of India.`,o);
o.push(...H(`Maximum strength of the Rajya Sabha?|250|245|300|552;Number of elected seats in the Lok Sabha?|543|545|552|250;Minimum voting age in India?|18 years|21 years|25 years|16 years;Term of the President of India?|5 years|4 years|6 years|7 years;Minimum age to become President of India?|35 years|25 years|30 years|40 years;Minimum age to contest Lok Sabha elections?|25 years|18 years|30 years|35 years;Who chairs the Rajya Sabha?|Vice-President|Prime Minister|Speaker|President;Who appoints the Governor of a state?|President|Chief Minister|Prime Minister|Chief Justice;Number of Fundamental Rights in India?|6|7|5|9;Number of Fundamental Duties in India?|11|10|9|12;The Constitution of India came into force on?|26 January 1950|15 August 1947|26 November 1949|2 October 1950;Longest river in India?|Ganga|Godavari|Brahmaputra|Yamuna;Highest peak in India?|Kangchenjunga|Mount Everest|K2|Nanda Devi;Largest Indian state by area?|Rajasthan|Madhya Pradesh|Maharashtra|Uttar Pradesh;Smallest Indian state by area?|Goa|Sikkim|Tripura|Manipur;Most populous Indian state?|Uttar Pradesh|Maharashtra|Bihar|West Bengal;Standard Meridian of India?|82.5° E|75° E|90° E|68° E;Southernmost point of India?|Indira Point|Kanyakumari|Cape Comorin|Port Blair;Largest hot desert in India?|Thar|Gobi|Sahara|Kutch;Largest coastal lagoon in India?|Chilika|Vembanad|Pulicat|Wular;Through how many Indian states does the Tropic of Cancer pass?|8|6|10|5;First Education Minister of India?|Maulana Abul Kalam Azad|Dr. S. Radhakrishnan|Jawaharlal Nehru|Zakir Husain;Father of the Indian Constitution?|Dr. B. R. Ambedkar|Mahatma Gandhi|Jawaharlal Nehru|Sardar Patel;National Song of India was written by?|Bankim Chandra Chattopadhyay|Rabindranath Tagore|Muhammad Iqbal|Sarojini Naidu;National Anthem of India was written by?|Rabindranath Tagore|Bankim Chandra Chattopadhyay|Muhammad Iqbal|Premchand;National aquatic animal of India?|Ganges river dolphin|Blue whale|Olive ridley turtle|Gharial;First woman Prime Minister of India?|Indira Gandhi|Sarojini Naidu|Sucheta Kripalani|Pratibha Patil;First President of India?|Dr. Rajendra Prasad|Dr. S. Radhakrishnan|Dr. Zakir Husain|Jawaharlal Nehru;Term of the Lok Sabha (unless dissolved)?|5 years|4 years|6 years|3 years`));
pair(P(`Ganga|Varanasi;Yamuna|Agra;Godavari|Nashik;Sabarmati|Ahmedabad;Gomti|Lucknow;Hooghly|Kolkata;Tapti|Surat;Musi|Hyderabad;Krishna|Vijayawada;Mahanadi|Cuttack;Brahmaputra|Guwahati;Jhelum|Srinagar;Narmada|Bharuch;Cauvery|Tiruchirappalli`),
 a=>`Which of these cities lies on the banks of the river ${a}?`,b=>`Which river flows by ${b}?`,o);
pair(P(`Bhakra Nangal Dam|Sutlej;Hirakud Dam|Mahanadi;Tehri Dam|Bhagirathi;Sardar Sarovar Dam|Narmada;Nagarjuna Sagar Dam|Krishna;Mettur Dam|Cauvery;Idukki Dam|Periyar`),a=>`${a} is built on which river?`,b=>`Which dam is built on the river ${b}?`,o);
pair(P(`Jim Corbett National Park|Uttarakhand;Kaziranga National Park|Assam;Gir National Park|Gujarat;Ranthambore National Park|Rajasthan;Sundarbans National Park|West Bengal;Periyar National Park|Kerala;Bandipur National Park|Karnataka;Kanha National Park|Madhya Pradesh;Bandhavgarh National Park|Madhya Pradesh;Keoladeo National Park|Rajasthan;Hemis National Park|Ladakh`),
 a=>`In which state/UT is ${a} located?`,b=>`Which national park is in ${b}?`,o);
pair(P(`Kathak|Uttar Pradesh;Bharatanatyam|Tamil Nadu;Kathakali|Kerala;Kuchipudi|Andhra Pradesh;Odissi|Odisha;Manipuri|Manipur;Sattriya|Assam`),a=>`The classical dance ${a} is associated with which state?`,b=>`Which classical dance belongs to ${b}?`,o);
B.cbse=o;}

function fin(name,arr){const seen=new Set(),out=[];
 for(const x of arr){if(!x||seen.has(x.q)||x.o.length<2||new Set(x.o).size!==x.o.length||x.a<0||x.a>=x.o.length)continue;seen.add(x.q);out.push(x);}
 if(out.length<200)console.error('KAM:',name,out.length);return sh(out);}
const out={};for(const k in B)out[k]=fin(k,B[k]);
module.exports=out;
if(require.main===module){fs.writeFileSync(path.join(__dirname,'data','questions.json'),JSON.stringify(out));for(const k in out)console.log(k.padEnd(12),out[k].length);}
