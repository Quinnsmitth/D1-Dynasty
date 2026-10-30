/* DAILY: daily mode + best-possible-draft analysis */
/* ================= DAILY + DRAFT ANALYSIS ================= */
function nyNow(){
  try{const f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});const o={};f.formatToParts(new Date()).forEach(p=>o[p.type]=p.value);return o}
  catch(e){const d=new Date().toISOString();return {year:d.slice(0,4),month:d.slice(5,7),day:d.slice(8,10),hour:'0',minute:'0',second:'0'}}
}
const dailyKey=()=>window.DAILY_DATE||(()=>{const o=nyNow();return o.year+'-'+o.month+'-'+o.day})();
function untilReset(){const o=nyNow(),sec=86400-(+o.hour*3600+ +o.minute*60+ +o.second);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return h+'h '+m+'m'}
function hash32(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DAILY_LEN=12;
/* Early rosters may be incomplete; roster p (0-based) must have at least p+1 weights (and 10 from the 10th roster on).
   That guarantees a legal pick no matter what you did before, so a daily draft can never dead-end. */
const dailyMinW=p=>p<5?5:p>=9?10:p+1;
/* Easy/Medium daily: prefer rosters with one clear standout (one champion or runner-up, nobody else in the top 3). */
const standout=t=>{const top=Object.values(t.cards).filter(c=>c.pl>=1&&c.pl<=3);return top.length===1&&top[0].pl<=2};
function buildDaily(mode,key){
  const rnd=mulberry(hash32('d1dynasty|'+key+'|'+mode+'|v2'));
  const pool=TEAMS.filter(t=>!t.nd&&(mode==='hard'||t.y>=2015)).sort((a,b)=>a.id<b.id?-1:1);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const seq=[],names=new Set(),used=new Set(),stW=new Set();
  for(let p=0;p<DAILY_LEN;p++){
    const ok=t=>!used.has(t.id)&&Object.keys(t.cards).length>=dailyMinW(p)&&!Object.values(t.cards).some(c=>names.has(c.n));
    const sw=t=>Object.values(t.cards).find(c=>c.pl>=1&&c.pl<=3).w;
    const t=(mode!=='hard'&&(pool.find(t=>ok(t)&&standout(t)&&!stW.has(sw(t)))||pool.find(t=>ok(t)&&standout(t))))||pool.find(ok);
    if(!t)break;
    if(mode!=='hard'&&standout(t))stW.add(sw(t));
    used.add(t.id);Object.values(t.cards).forEach(c=>names.add(c.n));seq.push(t);
  }
  return seq;
}
const dKey=(k,m)=>'dd-'+k+'-'+m;
function dailyResult(m){try{const r=store.get(dKey('done-'+dailyKey(),m));return r?JSON.parse(r):null}catch(e){return null}}
function saveDaily(){
  if(!G||!G.daily)return;
  store.set(dKey('state-'+G.daily.key,G.daily.mode),JSON.stringify({ptr:G.ptr,picks:G.picks.map(c=>c?c.id:null),rr:G.rr,coach:G.coach,rv:G.rv,rev:[...(G.rev||[])]}));
}
const ptsOf=c=>c.pts!=null?c.pts:TOT(c.pl>0?c.pl:9);
function bestLineup(rosters,forced){
  const L=rosters.length,NEG=-1e9;
  const layers=[];let cur=new Array(1024).fill(null);cur[0]={v:0};
  for(let r=0;r<L;r++){
    const nxt=new Array(1024).fill(null);
    const f=forced&&forced.r===r?forced.c:null;
    for(let m=0;m<1024;m++){const st=cur[m];if(!st)continue;
      if(!f&&(!nxt[m]||st.v>nxt[m].v))nxt[m]={v:st.v,prev:m,card:null};
      for(let wi=0;wi<10;wi++){if(m>>wi&1)continue;const c=rosters[r].cards[W[wi]];if(!c)continue;if(f&&c!==f)continue;
        const nm=m|1<<wi,v=st.v+ptsOf(c);if(!nxt[nm]||v>nxt[nm].v)nxt[nm]={v,prev:m,card:c}}}
    layers.push(nxt);cur=nxt;
  }
  if(!cur[1023])return {v:NEG,lineup:[]};
  const lineup=[];let m=1023;
  for(let r=L-1;r>=0;r--){const st=layers[r][m];if(st.card)lineup.push(st.card);m=st.prev}
  lineup.reverse();return {v:cur[1023].v,lineup};
}
function analyzeDraft(shown,picks){
  const best=bestLineup(shown,null);
  const right=picks.map(c=>{const r=shown.indexOf(c.t);if(r<0)return false;return bestLineup(shown,{r,c}).v>=best.v-1e-9});
  const mine=picks.reduce((a,c)=>a+ptsOf(c),0);
  return {best,right,mine,pct:best.v>0?Math.round(mine/best.v*100):100};
}
