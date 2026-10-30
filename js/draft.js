/* DRAFT: draft screen, picks, re-rolls */
/* ================= DRAFT ================= */
function start(){
  clearInterval(G&&G.tick);clearTimeout(G&&G.tout);
  setDomain(cfg.play==='uww'?'uww':'ncaa');
  if(cfg.play==='uww'&&UWWT.filter(t=>uIn(t.y,cfg.uera)).length<12)return;
  if(cfg.play==='daily'){
    if(dailyResult(cfg.mode)){renderHome();return}
    const key=dailyKey(),seq=buildDaily(cfg.mode,key);
    G={daily:{key,mode:cfg.mode},seq,ptr:0,shown:[],rv:cfg.mode==='hard'?1:cfg.mode==='medium'?2:0,rev:new Set(),rr:0,coach:null,i:0,cur:null,seen:new Set(),drawing:false,picks:Array(10).fill(null),usedW:new Set(),usedN:new Set()};
    try{const st=JSON.parse(store.get(dKey('state-'+key,cfg.mode))||'null');
      if(st){const okIds=new Set(seq.slice(0,st.ptr).map(t=>t.id));if(st.picks.some(id=>id&&!okIds.has((CARDS[id]||{t:{}}).t.id)))throw 0;
        G.ptr=st.ptr;G.rr=0;G.coach=st.coach;if(st.rv!=null)G.rv=st.rv;G.rev=new Set(st.rev||[]);
        st.picks.forEach((id,i)=>{const c=id&&CARDS[id];if(c){G.picks[i]=c;G.usedW.add(c.w);G.usedN.add(c.n);G.i++}});
        G.shown=seq.slice(0,G.ptr);G.seen=new Set(G.shown.map(t=>t.id))}}catch(e){}
    show('draft');beginDraw();return;
  }
  G={rr:(DOM==='uww'||cfg.mode!=='hard')?2:1,coach:null,i:0,cur:null,seen:new Set(),shown:[],drawing:false,picks:Array(W.length).fill(null),usedW:new Set(),usedN:new Set()};
  show('draft');beginDraw();
}
/* pick the next team at random: it must offer enough wrestlers at weights you still need */
function drawTeam(){
  if(G.daily)return G.seq[Math.min(G.ptr,G.seq.length-1)];
  const open=W.filter(w=>!G.usedW.has(w)).length;
  const pool=shuffle(TEAMS.filter(t=>inPool(t,cfg.era,cfg.conf)&&!G.seen.has(t.id)));
  for(let need=Math.min(3,open);need>=1;need--){
    const t=pool.find(t=>opts(t,G.usedW,G.usedN).length>=need);
    if(t) return t;
  }
  return pool[0]||TEAMS[0];
}
function beginDraw(){
  G.drawing=true;G.cur=null;
  const next=drawTeam();G.seen.add(next.id);if(!G.shown.includes(next))G.shown.push(next);
  const el=$('draw'),nm=$('drawName'),bar=$('drawBar');
  el.style.display='block';bar.style.animation='none';void bar.offsetWidth;bar.style.animation='drawfill 2.25s linear forwards';
  const pool=G.daily?G.seq:TEAMS.filter(t=>inPool(t,cfg.era,cfg.conf));
  G.tick=setInterval(()=>{const r=pool[Math.floor(Math.random()*pool.length)];nm.textContent=r.y+' '+r.team},80);
  renderDraft();
  G.tout=setTimeout(()=>{clearInterval(G.tick);G.drawing=false;G.cur=next;el.style.display='none';renderDraft();window.scrollTo(0,0)},2250);
}
function renderDraft(){
  const t=G.cur;
  $('pickN').textContent=G.i+1;$('pickT').textContent=W.length;$('rrN').textContent=G.rr;$('reroll').style.display=G.daily?'none':'';const off=G.rr<=0||G.drawing;$('reroll').disabled=off;$('reroll').style.opacity=off?.45:1;
  $('eraPill').textContent=t?(DOM==='uww'?'Worlds':eraLabel(t.y)):'';$('legend').textContent=DOM==='uww'?'Weights are in kg. '+(cfg.umode==='easy'?'Each wrestler\'s World Championship finish is shown on his card.':'A wrestler\'s World Championship finish is shown after you pick him.')+' Rosters only list wrestlers whose results were found.':'Medium and Easy modes show season wins, pins and bonus % (a dash means no stats were found). Easy mode also shows each wrestler\'s NCAA finish; otherwise it is revealed after you pick him.';
  const board=$('board');board.innerHTML='';
  W.forEach((wt,i)=>{
    const c=G.picks[i],d=document.createElement('div');d.className='slot';
    d.innerHTML=c
      ?`<span class="wt">${wt}</span><div class="who"><b></b><small></small></div>${badge(c.pl)}`
      :`<span class="wt">${wt}</span><div class="who"><span class="empty">Open</span></div>`;
    if(c){const bb=d.querySelector('b');bb.innerHTML=crest(c.t.team,22);bb.append(document.createTextNode(c.n));addMarks(bb,c);d.querySelector('small').textContent=`${c.t.y} ${c.t.team}`}
    board.appendChild(d);
  });
  if(cfg.mode==='hard'&&DOM!=='uww'){
    const d=document.createElement('div');d.className='slot coachslot';d.style.gridColumn='1/-1';
    const k=G.coach;
    d.innerHTML=k?`<span class="wt cw">COACH</span><div class="who"><b></b><small></small></div>`:`<span class="wt cw">COACH</span><div class="who"><span class="empty">Open</span></div>`;
    if(k){const bb=d.querySelector('b');bb.innerHTML=crest(k.team,22);bb.append(document.createTextNode(k.n));d.querySelector('small').textContent=`${k.y} ${k.team}${coachBits(k.n)?' · '+coachBits(k.n):''}`}
    board.appendChild(d);
  }
  $('rhead').style.display=t?'block':'none';$('roster').style.display=t?'grid':'none';
  if(!t)return;
  $('rhead').innerHTML=`<div class="y">${DOM==='uww'?t.y+' WORLD CHAMPIONSHIPS · MEN\'S FREESTYLE':t.y+' NCAA CHAMPIONSHIPS · '+t.conf.toUpperCase()}</div><h2 class="hd">${crest(t.team,48)}<span>${t.team}</span></h2><p>${t.fin!=null?`Team finish: ${ord(+t.fin)||t.fin}${t.pts!=null?' · '+t.pts+' points':''}. `:''}${DOM==='uww'?'Each wrestler\'s world championship finish':'Each wrestler\'s individual NCAA finish'}${(DOM==='uww'&&cfg.umode==='easy')?' is shown on each card (Easy mode).':' is revealed after you pick him.'}</p>`+(COACH[t.id]?`<p class="coachline">Head coach: <b></b><small style="display:block;color:var(--mute)"></small></p>`:'')+((cfg.mode==='hard'&&DOM!=='uww'&&!G.coach&&COACH[t.id])?`<button class="btn ghost" id="takeCoach" style="margin-top:8px;font-size:1rem">Take as your coach</button>`:'')+((G.daily&&G.rv>0&&!G.rev.has(t.id))?`<button class="btn ghost" id="revealBtn" style="margin-top:8px;font-size:1rem">Reveal placements (${G.rv} left)</button>`:'')+((G.daily&&G.rev&&G.rev.has(t.id)&&cfg.mode!=='easy')?`<p class="coachline" style="color:var(--mute)!important">Placements revealed for this roster.</p>`:'');
  if(COACH[t.id]){const cl=$('rhead').querySelector('.coachline');cl.querySelector('b').textContent=COACH[t.id];cl.querySelector('small').textContent=coachBits(COACH[t.id])}
  const rb=$('revealBtn');if(rb)rb.onclick=()=>{if(G.drawing||G.rv<=0||G.rev.has(t.id))return;G.rv--;G.rev.add(t.id);saveDaily();renderDraft()};
  const tc=$('takeCoach');if(tc)tc.onclick=()=>{if(G.drawing||G.coach)return;G.coach={n:COACH[t.id],team:t.team,y:t.y};if(G.daily){G.ptr++;saveDaily()}beginDraw()};
  const ros=$('roster');ros.innerHTML='';
  W.forEach(w=>{
    const c=t.cards[w],b=document.createElement('button');
    if(!c){
      b.className='rw vac';b.disabled=true;
      b.innerHTML=`<span class="wt">${w}</span><div class="who"><b style="color:#51608a">No entry</b><small>${DOM==='uww'?'No wrestler on file at this weight':'Not in this team\'s NCAA lineup'}</small></div>`;
      ros.appendChild(b);return;
    }
    let reason='';
    if(G.usedW.has(w)) reason=`You already have a ${w} lb wrestler`;
    else if(G.usedN.has(c.n)) reason='Already on your team';

    b.className='rw';
    b.disabled=!!reason;
    const st=(v,k,suf)=>c.est[k]?'—':`${v}${suf||''}`;
    b.innerHTML=`<span class="wt">${w}</span>
      <div class="who"><b></b><small>${t.team} · ${t.y}</small>${((DOM==='uww'&&cfg.umode==='easy')||(DOM!=='uww'&&(cfg.mode==='easy'||(G.rev&&G.rev.has(t.id)))))?badge(c.pl):''}</div>
      ${(cfg.mode==='hard'||DOM==='uww')?'':`<div class="stats">
        <div class="st"><b>${st(c.wins,'w')}</b><span>Wins</span></div>
        <div class="st"><b>${st(c.pins,'p')}</b><span>Pins</span></div>
        <div class="st"><b>${st(c.bonus,'b','%')}</b><span>Bonus</span></div>
      </div>`}${reason?`<div class="why">${reason}</div>`:''}`;
    b.querySelector('b').textContent=c.n;
    b.onclick=()=>pick(c);
    ros.appendChild(b);
  });
}
function reroll(){
  if(G.rr<=0||G.drawing)return;
  G.rr--;if(G.daily){G.ptr++;saveDaily()}beginDraw();
}
function pick(c){
  if(G.drawing)return;
  G.picks[W.indexOf(c.w)]=c;G.usedW.add(c.w);G.usedN.add(c.n);G.i++;
  if(G.daily){G.ptr++;saveDaily()}
  if(G.i>=W.length){simulate();return}
  beginDraw();
}
