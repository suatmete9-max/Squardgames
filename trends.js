// ===== Google Trends system (no npm packages needed) =====
// - Every few hours it reads Google's public "Trending now" RSS for ~32 countries and merges them into ONE worldwide top list.
// - Serves SEO pages (server-rendered HTML, so Google can index them):
//     /trends                 worldwide top searches today
//     /trends/country/in      top searches of one country
//     /trends/<keyword>       one page per trending keyword (kept 14 days after it stops trending)
//     /sitemap.xml , /robots.txt
// - JSON for the game site widget: /api/trends?limit=10
// Env (all optional): PUBLIC_URL, SITE_URL, TRENDS_EVERY_HOURS (default 3), DATA_DIR, TRENDS_BASE
const fs = require('fs'), path = require('path');

const GEOS = 'US IN GB BR ID JP DE FR MX CA AU IT ES TR RU KR PH PK BD EG NG ZA SA AE TH VN MY SG AR CO PL NL'.split(' ');
const EVERY = (+process.env.TRENDS_EVERY_HOURS || 3) * 36e5;
const FILE = path.join(process.env.DATA_DIR || __dirname, 'trends.json');
const GBASE = (process.env.TRENDS_BASE || 'https://trends.google.com').replace(/\/$/, '');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const KEEP_DAYS = 14, KEEP_MAX = 1500, TOP = 60;

const base = () => (process.env.PUBLIC_URL || process.env.SELF_URL || process.env.RENDER_EXTERNAL_URL || 'https://quizarena-2r54.onrender.com').replace(/\/$/, '');
const site = () => (process.env.SITE_URL || 'https://squardgames.web.app').replace(/\/$/, '');

let S = { updated: 0, items: [], geos: {}, arch: {} }, busy = 0;
try { S = { ...S, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }; } catch {}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt() + ';');
const norm = s => String(s).normalize('NFKC').trim().toLowerCase();
const slugify = s => {
  let x = String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return x == 'country' ? 'country-trend' : x;
};
const url = slug => '/trends/' + encodeURIComponent(slug);
const dec = s => String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').trim();
const tag = (s, t) => { const m = s.match(new RegExp('<' + t + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + t + '>')); return m ? dec(m[1]) : ''; };
const traffic = s => {
  const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 1;
  return Math.max(1, Math.round(parseFloat(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1)));
};
const fmt = n => n >= 1e9 ? (n / 1e9).toFixed(n % 1e9 ? 1 : 0) + 'B+' : n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'M+' : n >= 1e3 ? Math.round(n / 1e3) + 'K+' : n + '+';
const flag = c => c && c.length == 2 ? String.fromCodePoint(...[...c.toUpperCase()].map(x => 127397 + x.charCodeAt())) : '🌍';
let DN; try { DN = new Intl.DisplayNames(['en'], { type: 'region' }); } catch {}
const cname = c => { try { return (DN && DN.of(c)) || c; } catch { return c; } };
const dstr = t => new Date(t).toISOString().slice(0, 10);
const safeUrl = u => /^https?:\/\//i.test(u) ? u : '';

// ---------- fetching ----------
function parse(xml) {
  const out = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const b = m[1], k = tag(b.replace(/<ht:news_item>[\s\S]*?<\/ht:news_item>/g, ''), 'title');
    if (!k) continue;
    const news = [];
    for (const n of b.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)) {
      const u = safeUrl(tag(n[1], 'ht:news_item_url')), t = tag(n[1], 'ht:news_item_title');
      if (u && t) news.push({ t: t.slice(0, 200), u, s: tag(n[1], 'ht:news_item_source').slice(0, 60) });
    }
    out.push({ k, t: traffic(tag(b, 'ht:approx_traffic')), ts: Date.parse(tag(b, 'pubDate')) || 0, img: safeUrl(tag(b, 'ht:picture')), news });
  }
  return out;
}
async function fetchGeo(cc) {
  for (const u of [GBASE + '/trending/rss?geo=' + cc, GBASE + '/trends/trendingsearches/daily/rss?geo=' + cc]) {
    try {
      const r = await fetch(u, { headers: { 'user-agent': UA, accept: 'application/rss+xml,application/xml,text/xml,*/*', 'accept-language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) continue;
      const it = parse(await r.text());
      if (it.length) return it;
    } catch {}
  }
  return null;
}
async function refresh() {
  if (busy) return; busy = 1;
  try {
    const agg = new Map(), geos = {}; let ok = 0;
    for (let i = 0; i < GEOS.length; i += 6) {
      const b = GEOS.slice(i, i + 6), res = await Promise.all(b.map(fetchGeo));
      res.forEach((items, j) => {
        const cc = b[j]; if (!items) return; ok++;
        geos[cc] = items.slice(0, 20).map(x => ({ k: x.k, slug: slugify(x.k), t: x.t })).filter(x => x.slug);
        items.forEach(it => {
          const key = norm(it.k); let e = agg.get(key);
          if (!e) agg.set(key, e = { k: it.k, t: 0, c: [], news: [], img: '', ts: 0 });
          e.t += it.t; e.c.push({ cc, t: it.t });
          it.news.forEach(n => { if (e.news.length < 8 && !e.news.some(z => z.u == n.u)) e.news.push(n); });
          if (!e.img && it.img) e.img = it.img;
          e.ts = Math.max(e.ts, it.ts);
        });
      });
      await sleep(700);
    }
    if (ok < 3) { console.log('Trends: only ' + ok + ' countries answered, keeping old data'); return; }
    const items = [...agg.values()].map(e => ({ ...e, slug: slugify(e.k) })).filter(e => e.slug)
      .sort((a, b) => b.t - a.t || b.c.length - a.c.length).slice(0, 100);
    const now = Date.now(), arch = S.arch || {};
    items.forEach(e => { arch[e.slug] = { ...e, seen: now }; });
    let ks = Object.keys(arch).filter(k => arch[k].seen > now - KEEP_DAYS * 864e5).sort((a, b) => arch[b].seen - arch[a].seen).slice(0, KEEP_MAX), na = {};
    ks.forEach(k => na[k] = arch[k]);
    S = { updated: now, items: items.slice(0, TOP), geos, arch: na };
    fs.writeFile(FILE, JSON.stringify(S), () => {});
    console.log('Trends updated: ' + ok + ' countries, ' + items.length + ' keywords. #1: ' + (items[0] && items[0].k));
  } catch (e) { console.log('Trends refresh failed:', e.message); }
  finally { busy = 0; }
}
function start() {
  const age = Date.now() - S.updated;
  setTimeout(refresh, age > EVERY / 3 ? 4000 : Math.max(4000, EVERY - age));
  setInterval(refresh, EVERY);
  console.log('Trends: auto-update every ' + EVERY / 36e5 + ' h. Pages: ' + base() + '/trends');
}

// ---------- HTML ----------
const CSS = `*{box-sizing:border-box}body{margin:0;font:16px/1.55 system-ui,Segoe UI,Roboto,sans-serif;color:#fff;background:radial-gradient(circle at 10% 0,#5b1bd1aa,transparent 45%),radial-gradient(circle at 95% 35%,#ff2d9555,transparent 40%),#07031a;background-attachment:fixed;min-height:100vh}
.w{max-width:900px;margin:auto;padding:14px}a{color:#ffe14d}h1{font-size:clamp(24px,5vw,34px);line-height:1.2;margin:.4em 0}h2{margin:1.4em 0 .5em;color:#ffd23f}
.top{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:6px 0}.logo{font-weight:800;font-size:22px;text-decoration:none;color:#fff}.logo b{color:#18d0ff}
.btn{display:inline-block;background:linear-gradient(#ffb300,#ff6d00);border:2px solid #ffe082;border-radius:14px;padding:9px 16px;font-weight:700;color:#fff;text-decoration:none;box-shadow:0 0 16px #ff910088}
.cta{margin:18px 0;padding:16px;border-radius:16px;background:linear-gradient(#2a1458,#150a3a);border:2px solid #7c4dff;text-align:center}
ol.l{list-style:none;margin:0;padding:0;counter-reset:n}ol.l li{counter-increment:n;display:flex;gap:12px;align-items:flex-start;padding:11px 12px;margin:8px 0;border-radius:14px;background:#ffffff12;border:1px solid #ffffff22}
ol.l li:before{content:counter(n);min-width:30px;height:30px;border-radius:50%;background:#7c4dff;display:flex;align-items:center;justify-content:center;font-weight:800}
ol.l .k{font-weight:700;font-size:18px;color:#fff;text-decoration:none}ol.l small{display:block;opacity:.78}.tr{color:#5dff7a;font-weight:700}
.chips a{display:inline-block;margin:3px 4px 3px 0;padding:5px 10px;border-radius:999px;background:#2a1a6e;color:#fff;text-decoration:none;font-size:14px}
.news a{display:block;margin:6px 0}.n{opacity:.7;font-size:13px}footer{opacity:.6;font-size:13px;margin:30px 0 10px;text-align:center}img.p{max-width:140px;border-radius:12px;float:right;margin:0 0 8px 12px}`;

function page({ title, desc, path: pth, body, ld, noindex }) {
  const B = base(), cu = B + pth;
  return '<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">'
    + '<title>' + esc(title) + '</title><meta name=description content="' + esc(desc) + '">'
    + (noindex ? '<meta name=robots content=noindex>' : '<meta name=robots content="index,follow,max-snippet:-1,max-image-preview:large">')
    + '<link rel=canonical href="' + esc(cu) + '"><meta property=og:type content=website><meta property=og:title content="' + esc(title) + '"><meta property=og:description content="' + esc(desc) + '"><meta property=og:url content="' + esc(cu) + '"><meta property=og:site_name content=SquardGames>'
    + '<meta name=twitter:card content=summary><meta name=theme-color content=#5b1bd1>'
    + (ld ? '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>' : '')
    + '<style>' + CSS + '</style></head><body><div class=w><div class=top><a class=logo href="' + esc(site()) + '">🎮 Squard<b>Games</b></a><a class=btn href="' + esc(site() + '/?utm_source=trends') + '">▶ Play &amp; Win</a></div>'
    + '<nav class=chips><a href="/trends">🔥 Trending now</a></nav>' + body
    + '<footer>Data: Google Trends public feed, updated automatically every ' + EVERY / 36e5 + ' hours. © SquardGames</footer></div></body></html>';
}
const cta = () => '<div class=cta><b>🎮 Bored of scrolling? Play free games on SquardGames</b><br>Quiz, Jewel, Birds &amp; more — top players win weekly prizes.<br><br><a class=btn href="' + esc(site() + '/?utm_source=trends') + '">▶ Play now</a></div>';
const chipsC = () => '<div class=chips>' + GEOS.filter(c => S.geos[c]).map(c => '<a href="/trends/country/' + c.toLowerCase() + '">' + flag(c) + ' ' + esc(cname(c)) + '</a>').join('') + '</div>';
const ctrs = e => e.c.slice().sort((a, b) => b.t - a.t).map(x => x.cc);

function homePage() {
  const d = dstr(S.updated), top = S.items.slice(0, 50), names = top.slice(0, 5).map(x => x.k).join(', ');
  const li = top.map(e => '<li><div><a class=k href="' + url(e.slug) + '">' + esc(e.k) + '</a><small><span class=tr>' + fmt(e.t) + ' searches</span> · ' + ctrs(e).slice(0, 6).map(flag).join(' ') + (e.c.length > 6 ? ' +' + (e.c.length - 6) : '') + '</small>'
    + (e.news[0] ? '<small>📰 ' + esc(e.news[0].t) + (e.news[0].s ? ' — ' + esc(e.news[0].s) : '') + '</small>' : '') + '</div></li>').join('');
  return page({
    title: 'Google Trends Today (' + d + '): Top Searches Worldwide — ' + (top[0] ? top[0].k : ''),
    desc: 'What is the world searching on Google right now? Live worldwide trending searches for ' + d + ': ' + names + ' and more. Updated automatically.',
    path: '/trends',
    ld: { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Google Trends worldwide ' + d, dateModified: new Date(S.updated).toISOString(), itemListElement: top.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.k, url: base() + url(e.slug) })) },
    body: '<h1>🔥 Google Trends Today: Top Searches Worldwide</h1><p>The most searched keywords on Google right now across ' + Object.keys(S.geos).length + ' countries — ' + esc(d) + '. Ranked by search volume.</p>'
      + '<ol class=l>' + li + '</ol>' + cta() + '<h2>🌍 Trending by country</h2>' + chipsC()
  });
}
function countryPage(cc) {
  const L = S.geos[cc]; if (!L) return null;
  const d = dstr(S.updated), n = cname(cc);
  return page({
    title: 'Trending Searches in ' + n + ' Today (' + d + ') — Google Trends',
    desc: 'Top Google searches in ' + n + ' right now: ' + L.slice(0, 5).map(x => x.k).join(', ') + '. Updated automatically.',
    path: '/trends/country/' + cc.toLowerCase(),
    ld: { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Google Trends ' + n + ' ' + d, itemListElement: L.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.k, url: base() + url(e.slug) })) },
    body: '<h1>' + flag(cc) + ' Trending Searches in ' + esc(n) + '</h1><p>What people in ' + esc(n) + ' are searching on Google today (' + esc(d) + ').</p>'
      + '<ol class=l>' + L.map(e => '<li><div><a class=k href="' + url(e.slug) + '">' + esc(e.k) + '</a><small><span class=tr>' + fmt(e.t) + ' searches</span></small></div></li>').join('') + '</ol>'
      + cta() + '<h2>🌍 Other countries</h2>' + chipsC() + '<p><a href="/trends">← Worldwide trends</a></p>'
  });
}
function kwPage(e, live) {
  const d = dstr(e.seen || S.updated), cs = ctrs(e), others = S.items.filter(x => x.slug != e.slug).slice(0, 10);
  const intro = '“' + e.k + '” ' + (live ? 'is trending on Google right now' : 'was trending on Google on ' + d) + ' with more than ' + fmt(e.t).replace('+', '') + ' searches' + (cs.length ? ', in ' + cs.length + ' ' + (cs.length == 1 ? 'country' : 'countries') + ': ' + cs.slice(0, 8).map(cname).join(', ') + (cs.length > 8 ? ' and more' : '') : '') + '.';
  return page({
    title: e.k + ' — Trending on Google ' + (live ? 'Today' : d) + ' | SquardGames',
    desc: intro.slice(0, 280),
    path: url(e.slug),
    ld: { '@context': 'https://schema.org', '@type': 'WebPage', name: e.k + ' trending', description: intro, dateModified: new Date(e.seen || S.updated).toISOString(), isPartOf: { '@type': 'WebSite', name: 'SquardGames', url: site() } },
    body: '<h1>🔥 ' + esc(e.k) + '</h1>' + (e.img ? '<img class=p src="' + esc(e.img) + '" alt="' + esc(e.k) + '" loading=lazy referrerpolicy=no-referrer>' : '')
      + '<p>' + esc(intro) + '</p>' + (live ? '' : '<p><i>This keyword is no longer in the live top list.</i></p>')
      + (cs.length ? '<h2>🌍 Where it is trending</h2><div class=chips>' + cs.map(c => '<a href="/trends/country/' + c.toLowerCase() + '">' + flag(c) + ' ' + esc(cname(c)) + '</a>').join('') + '</div>' : '')
      + (e.news.length ? '<h2>📰 Latest news about ' + esc(e.k) + '</h2><div class=news>' + e.news.map(n => '<a href="' + esc(n.u) + '" target=_blank rel="nofollow noopener">' + esc(n.t) + '</a><span class=n>' + esc(n.s) + '</span>').join('') + '</div>' : '')
      + cta() + '<h2>More trending searches</h2><ol class=l>' + others.map(x => '<li><div><a class=k href="' + url(x.slug) + '">' + esc(x.k) + '</a><small><span class=tr>' + fmt(x.t) + ' searches</span></small></div></li>').join('') + '</ol><p><a href="/trends">← All worldwide trends</a></p>'
  });
}

// ---------- routes ----------
function handle(q, r, u, j) {
  if (q.method != 'GET' && q.method != 'HEAD') return false;
  const p = u.pathname, ready = S.items.length > 0;
  const html = (h, c = 200) => { r.writeHead(c, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=900', ...(c == 503 ? { 'retry-after': '120' } : {}) }); r.end(h); return true; };
  const wait = () => html(page({ title: 'Trending searches loading…', desc: 'Trending searches are loading, please come back in a minute.', path: '/trends', noindex: 1, body: '<h1>⏳ Loading trends…</h1><p>The first update is running. Refresh in a minute.</p>' }), 503);
  if (p == '/api/trends') {
    const n = Math.max(1, Math.min(100, +u.searchParams.get('limit') || 20));
    j({ updated: S.updated, items: S.items.slice(0, n).map(e => ({ k: e.k, p: encodeURIComponent(e.slug), t: e.t, tr: fmt(e.t), c: ctrs(e).slice(0, 8) })) });
    return true;
  }
  if (p == '/robots.txt') { r.writeHead(200, { 'content-type': 'text/plain' }); r.end('User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ' + base() + '/sitemap.xml\n'); return true; }
  if (p == '/sitemap.xml') {
    const B = base(), U = [[B + '/trends', S.updated]];
    Object.keys(S.geos).forEach(c => U.push([B + '/trends/country/' + c.toLowerCase(), S.updated]));
    Object.values(S.arch).forEach(e => U.push([B + url(e.slug), e.seen]));
    r.writeHead(200, { 'content-type': 'application/xml', 'cache-control': 'public, max-age=3600' });
    r.end('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + U.slice(0, 5000).map(([l, t]) => '<url><loc>' + esc(l) + '</loc><lastmod>' + dstr(t || Date.now()) + '</lastmod></url>').join('') + '</urlset>');
    return true;
  }
  if (p == '/trends' || p == '/trends/') return ready ? html(homePage()) : wait();
  let m = p.match(/^\/trends\/country\/([a-zA-Z]{2})\/?$/);
  if (m) { const h = ready && countryPage(m[1].toUpperCase()); return h ? html(h) : ready ? html(page({ title: 'Not found', desc: 'Not found', path: p, noindex: 1, body: '<h1>No data for this country</h1><p><a href="/trends">← Worldwide trends</a></p>' }), 404) : wait(); }
  m = p.match(/^\/trends\/([^/]+)\/?$/);
  if (m) {
    let s = ''; try { s = decodeURIComponent(m[1]); } catch {}
    const live = S.items.find(x => x.slug == s), e = live || S.arch[s];
    if (e) return html(kwPage(e, !!live));
    return ready ? html(page({ title: 'Trend not found', desc: 'This trend is no longer available.', path: p, noindex: 1, body: '<h1>This trend is no longer available</h1><p><a href="/trends">← See what is trending now</a></p>' }), 404) : wait();
  }
  return false;
}

module.exports = { handle, start, refresh };
