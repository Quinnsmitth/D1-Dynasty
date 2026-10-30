/* HOME: settings and the home screen */
/* ================= HOME ================= */
function renderHome(){
  setDomain(cfg.play==='uww'?'uww':'ncaa');
  const mk=(el,list,key,other)=>{
    el.innerHTML='';
    list.forEach(([v,label])=>{
      const n=key==='era'?TEAMS.filter(t=>inEra(t.y,v)&&(cfg.conf==='all'||t.conf===cfg.conf)).length:poolSize(cfg.era,v);
      const b=document.createElement('button');
      b.className='chip'+(cfg[key]===v?' sel':'');
      b.disabled=n<12;
      b.innerHTML=`${label}<small>${n} team-seasons</small>`;
      b.onclick=()=>{cfg[key]=v;if(key==='era'&&v!=='Modern')cfg.mode='hard';renderHome()};
      el.appendChild(b);
    });
  };
  const pc=$('playChips');pc.innerHTML='';
  [['classic','Classic','Random rosters every time'],['uww','Freestyle','Men\'s freestyle Worlds · countries as teams'],['daily','Daily','']].forEach(([v,l,sub])=>{
    if(v==='daily'){const br=document.createElement('div');br.style.cssText='flex-basis:100%;height:0';pc.appendChild(br)}
    const b=document.createElement('button');b.className='chip'+(cfg.play===v?' sel':'');b.innerHTML=sub?`${l}<small>${sub}</small>`:l;
    b.onclick=()=>{cfg.play=v;renderHome()};pc.appendChild(b)});
  const daily=cfg.play==='daily',uww=cfg.play==='uww';
  $('diffWrap').style.display='block';
  $('playNote').textContent=uww?'Freestyle: build a 10-man freestyle team from country lineups at the World Championships (2001\u20132025, any country with a top-5 finisher and 4+ wrestlers on file). Older weight classes are grouped into the nearest modern one. Weights 57\u2013125 kg.':daily?'Daily: everyone gets the same preset rosters today. You can play each difficulty once per day (new rosters at midnight Eastern). Reveal placements for a roster: 1 time in Hard, 2 in Medium.':'Classic: a fresh random draft every time, as many as you like.';
  $('eraWrap').style.display=daily?'none':'block';
  const mm=$('modeChips');mm.innerHTML='';
  (uww?[['hard','Hard','Finishes hidden until picked'],['easy','Easy','Finishes shown before you pick']]:[['hard','Hard','No stats · no finishes'],['medium','Medium','Wins · pins · bonus %'],['easy','Easy','Stats + NCAA finish shown']]).forEach(([v,l,sub])=>{
    const b=document.createElement('button');b.className='chip'+((uww?cfg.umode:cfg.mode)===v?' sel':'');b.innerHTML=`${l}<small>${sub}</small>`;
    b.disabled=!uww&&!daily&&v!=='hard'&&cfg.era!=='Modern';
    b.onclick=()=>{if(uww)cfg.umode=v;else cfg.mode=v;renderHome()};mm.appendChild(b)});
  $('modeNote').textContent={hard:'Hard: names, weights and team results only. A wrestler\'s finish stays hidden until you pick him. '+(daily?'No re-rolls in the daily, but you get a head-coach slot: take a coach instead of a wrestler to skip a roster. Daily Hard draws from every era.':'You get 1 re-roll plus a head-coach slot: take a coach instead of a wrestler to skip a roster. Works for every era.'),medium:'Medium: adds each wrestler\'s season wins, pins and bonus %. Finishes stay hidden. '+(daily?'No re-rolls in the daily. ':'2 re-rolls. ')+'Modern era (2015–26) only.',easy:'Easy: shows season stats and the wrestler\'s NCAA finish before you pick. '+(daily?'No re-rolls in the daily. ':'2 re-rolls. ')+'Modern era (2015–26) only.'}[cfg.mode];
  if(uww)$('modeNote').textContent={hard:'Hard: you see each wrestler\'s name and weight only. His World Championship finish is revealed after you pick him. 2 re-rolls.',easy:'Easy: every wrestler\'s World Championship finish (gold, silver, bronze or place) is shown before you pick. 2 re-rolls.'}[cfg.umode];
  if(uww){const ec=$('eraChips');ec.innerHTML='';UERAS.forEach(([v,l,sub])=>{const n=UWWT.filter(t=>uIn(t.y,v)).length;const b=document.createElement('button');b.className='chip'+(cfg.uera===v?' sel':'');b.disabled=n<12;b.innerHTML=`${l}<small>${sub} \u00b7 ${n} lineups</small>`;b.onclick=()=>{cfg.uera=v;renderHome()};ec.appendChild(b)})}
  else mk($('eraChips'),ERAS,'era');
  const dd=$('dailyDone'),sb=$('start');
  if(uww){
    dd.style.display='none';sb.style.display='block';sb.textContent='Start Freestyle draft';
    $('poolNote').textContent=`${UWWT.filter(t=>uIn(t.y,cfg.uera)).length} country-lineups in this pool. A draft needs at least 12.${cfg.uera==='early'?' Earlier Worlds had 8 weight classes (no 79 or 92 kg), so this era is an 8-man lineup.':''}`;
    const best=store.get(ukey());$('best').innerHTML=best?`Best Freestyle ${cfg.umode} score: <b>${best}</b>`:'Build your first Freestyle lineup to set a best score';
  }else if(daily){
    const done=dailyResult(cfg.mode),M=cfg.mode[0].toUpperCase()+cfg.mode.slice(1);
    $('poolNote').textContent=`Daily ${M} · ${dailyKey()} · ${DAILY_LEN} preset rosters`;
    if(done){dd.style.display='block';dd.innerHTML=`<b>You've played today's ${M} daily.</b><br>${done.grade} · ${done.score} pts · ${done.right}/10 picks right · ${done.pct}% of a perfect draft<br><small>Next daily in ${untilReset()}</small>`;sb.style.display='none'}
    else{dd.style.display='none';sb.style.display='block';sb.textContent=store.get(dKey('state-'+dailyKey(),cfg.mode))?'Resume today\'s daily':'Start today\'s daily'}
    $('best').innerHTML='';
  }else{
    dd.style.display='none';sb.style.display='block';sb.textContent='Start the draft';
    $('poolNote').textContent=`${poolSize(cfg.era,cfg.conf)} team-seasons in this pool. A draft needs at least 12.`;
    const best=store.get('lineup-best-'+cfg.mode);
    $('best').innerHTML=best?`Best ${cfg.mode} mode score: <b>${best}</b>`:'Build your first lineup to set a best score';
  }
}
