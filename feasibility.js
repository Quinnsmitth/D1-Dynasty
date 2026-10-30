/* FEASIBILITY: can the remaining rosters still fill the lineup? */
/* ================= FEASIBILITY =================
   Can the remaining rosters still fill the remaining weights (one wrestler each, no repeats)? */
function canFinish(rosters,usedW,usedN){
  const rs=rosters.slice().sort((a,b)=>opts(a,usedW,usedN).length-opts(b,usedW,usedN).length);
  if(!rs.length) return true;
  const [r,...rest]=rs;
  for(const c of opts(r,usedW,usedN)){
    usedW.add(c.w);usedN.add(c.n);
    const ok=canFinish(rest,usedW,usedN);
    usedW.delete(c.w);usedN.delete(c.n);
    if(ok) return true;
  }
  return false;
}
function opts(t,usedW,usedN){
  return Object.values(t.cards).filter(c=>!usedW.has(c.w)&&!usedN.has(c.n));
}
let cfg={era:'all',conf:'all',mode:'hard',play:'classic',umode:'hard',uera:'all'};
const MODE=()=>DOM==='uww'?cfg.umode:cfg.mode;
const ERAS=[['all','All eras'],['2000s','2000s (2000–09)'],['2010s','2010s (2010–19)'],['Modern','Modern (2015–26)']];
const UERAS=[['all','All eras','2001\u201325'],['early','2001\u201314','Earlier Worlds'],['modern','Modern','2015\u201325']];
const uIn=(y,e)=>e==='all'||(e==='early'?y<=2014:y>=2015);
const ukey=()=>'lineup-best-uww'+(cfg.umode==='easy'?'-easy':'')+(cfg.uera==='all'?'':'-'+cfg.uera);
const CONFS=[['all','Mixed'],['Big Ten','Big Ten'],['Big 12','Big 12'],['ACC','ACC'],['Pac-12','Pac-12']];
const inPool=(t,e,c)=>DOM==='uww'?uIn(t.y,cfg.uera):inEra(t.y,e)&&(c==='all'||t.conf===c)&&(cfg.mode==='hard'||t.y>=2015);
const poolSize=(e,c)=>TEAMS.filter(t=>inPool(t,e,c)).length;
function pickRosters(){
  const pool=TEAMS.filter(t=>inPool(t,cfg.era,cfg.conf));
  for(let i=0;i<300;i++){
    const rs=shuffle(pool).slice(0,10);
    if(canFinish(rs,new Set(),new Set())) return rs;
  }
  return shuffle(pool).slice(0,10);
}
