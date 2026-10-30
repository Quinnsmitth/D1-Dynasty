/* RESULTS: grading, results screen, copy lineup */
const GRADES=[[180,'A+'],[163,'A'],[148,'A-'],[134,'B+'],[120,'B'],[106,'B-'],[94,'C+'],[81,'C'],[69,'C-'],[56,'D+'],[44,'D'],[31,'D-'],[0,'F']];
function gradeOf(s){if(DOM==='uww')s=s*245/250*10/W.length;for(const [t,g] of GRADES)if(s>=t)return g;return 'F'}
function ord(n){const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])}
function showResults(R){
  const g=gradeOf(R.score),T={A:['Dynasty','National title contender'],B:['Strong team','Top-ten caliber'],C:['Middle of the pack','Room to grow'],D:['Rebuilding year','Back to the practice room'],F:['Rebuilding year','Back to the practice room']}[g[0]];
  const Md=cfg.mode[0].toUpperCase()+cfg.mode.slice(1);$('rLabel').textContent=T[1]+' · '+(DOM==='uww'?'Freestyle '+cfg.umode[0].toUpperCase()+cfg.umode.slice(1)+' mode':G.daily?'Daily '+G.daily.key+' · '+Md:Md+' mode');$('kAAl').textContent=DOM==='uww'?'Medalists':'All-Americans';$('rSecLabel').textContent=DOM==='uww'?'World Championships':'NCAA Championships';$('gradeNote').textContent=DOM==='uww'?"Team grade · World Championship team points from your 10 wrestlers' finishes":"Team grade · NCAA team points from your 10 wrestlers' finishes";$('rPtsNote').textContent=DOM==='uww'?'Points = a team-style score for each wrestler\'s world championship finish (gold 25, silver 20, bronze 15, 5th 10, 7th 7).':'Points = NCAA placement points plus the typical advancement and bonus points for that finish.';$('rTitle').textContent=T[0];
  const rc=$('rCoach');if(G&&G.coach){rc.style.display='block';rc.innerHTML='';rc.append(document.createTextNode('Head coach: '+G.coach.n+' ('+G.coach.y+' '+G.coach.team+')'))}else rc.style.display='none';$('rGrade').textContent=gradeOf(R.score);$('rGrade').dataset.g=gradeOf(R.score)[0];$('kScore').textContent=R.score;$('kAA').textContent=`${R.aa}/${W.length}`;
  const tb=$('tbody');tb.innerHTML='';
  R.res.forEach(r=>{
    const cls=r.place===1?'c':(DOM==='uww'?(r.place>0&&r.place<=3):r.place<=8)?'a':'x';
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${r.c.w}</td><td class="n"><span></span><small></small></td><td class="fin ${cls}">${DOM==='uww'?uplace(r.place)[0]:(r.place>2&&r.place<=8?'AA '+FINISH[r.place]:FINISH[r.place])}</td><td style="text-align:right">${r.pts.toFixed(1)}</td>`;
    tr.querySelector('span').innerHTML=crest(r.c.t.team,22);tr.querySelector('span').append(document.createTextNode(r.c.n));addMarks(tr.querySelector('span'),r.c);tr.querySelector('small').textContent=`${r.c.t.y} ${r.c.t.team} · ${place(r.c.pl)[0].toLowerCase()} ${DOM==='uww'?'at Worlds':'that year'}`;
    tb.appendChild(tr);
  });
  const shown=G.daily?G.seq.slice(0,G.ptr):G.shown;
  let A=null;if(G.daily){try{A=analyzeDraft(shown,G.picks)}catch(e){}}
  const acc=$('rAcc');
  if(A&&A.best.lineup.length===10){
    const n=A.right.filter(Boolean).length;R.acc={n,pct:A.pct,perfect:A.best.v};
    acc.style.display='block';$('accBig').textContent=n+' / 10';
    $('accSub').textContent=`picks matched the best possible draft from the rosters you were shown. Your lineup scored ${A.mine.toFixed(1)} of a possible ${A.best.v.toFixed(1)} (${A.pct}%).`;
    const rows=[...tb.querySelectorAll('tr')];
    G.picks.forEach((c,i)=>{const tr=rows.find(r=>r.firstChild.textContent==String(c.w));if(!tr)return;const sp=document.createElement('span');sp.className='mk '+(A.right[i]?'ok':'no');sp.textContent=A.right[i]?'✓':'✗';sp.title=A.right[i]?'In a best possible lineup':'Not in any best possible lineup';tr.querySelector('.n span').append(sp)});
    const bl=$('bestList');bl.innerHTML='';
    A.best.lineup.slice().sort((x,y)=>x.w-y.w).forEach(c=>{const d=document.createElement('div');d.className='bl';d.innerHTML=`<span class="bw">${c.w}</span><span class="bn"></span><span class="bf"></span>`;d.querySelector('.bn').innerHTML=crest(c.t.team,20);d.querySelector('.bn').append(document.createTextNode(c.n+' · '+c.t.y+' '+c.t.team));d.querySelector('.bf').textContent=place(c.pl)[0];bl.appendChild(d)});
  }else{acc.style.display='none'}
  if(G.daily){
    const k=G.daily.key,m=G.daily.mode;
    store.set(dKey('done-'+k,m),JSON.stringify({score:R.score,grade:gradeOf(R.score),right:R.acc?R.acc.n:0,pct:R.acc?R.acc.pct:0}));
    try{localStorage.removeItem(dKey('state-'+k,m))}catch(e){}
    $('again').style.display='none';
  }else{
    $('again').style.display='';
    const bk=DOM==='uww'?ukey():'lineup-best-'+cfg.mode,prev=parseFloat(store.get(bk)||'0');if(R.score>prev)store.set(bk,String(R.score));
  }
  G.summary=R;
if (typeof window.saveDraftResult === 'function') {
  void window.saveDraftResult(R);
}  
show('results');
}
function copyLineup(){
  const lines=G.picks.map(c=>`${c.w}: ${c.n} (${c.t.y} ${c.t.team}, ${place(c.pl)[0].toLowerCase()})`);
  const R=G.summary,txt=`D1 Dynasty (${G.daily?'Daily '+G.daily.key+' · ':''}${DOM==='uww'?'Freestyle '+cfg.umode:cfg.mode} mode)\n${lines.join('\n')}${G&&G.coach?'\nCoach: '+G.coach.n+' ('+G.coach.y+' '+G.coach.team+')':''}\n${DOM==='uww'?'World Championship':'NCAA'} team score ${R.score} pts (grade ${gradeOf(R.score)})${R.acc?'\nDraft accuracy: '+R.acc.n+'/10 picks right, '+R.acc.pct+'% of perfect':''}`;
  try{navigator.clipboard.writeText(txt).then(()=>{$('copy').textContent='Copied!';setTimeout(()=>$('copy').textContent='Copy my lineup',1500)}).catch(()=>{$('copy').textContent='Copy not available'})}catch(e){$('copy').textContent='Copy not available'}
}
