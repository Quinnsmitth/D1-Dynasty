/* CONFIG: active dataset, weight classes, domain switching */
let TEAMS=COLL;
TEAMS.forEach(t=>{t.id=t.y+'|'+t.team});
const WC=[125,133,141,149,157,165,174,184,197,285],WU=[57,61,65,70,74,79,86,92,97,125],WU8=[57,61,65,70,74,86,97,125];
let W=WC,DOM='ncaa';
function setDomain(d){DOM=d;TEAMS=d==='uww'?UWWT:COLL;W=d==='uww'?(cfg.uera==='early'?WU8:WU):WC}
const BASE={1:86,2:80,3:76,4:73,5:71,6:69,7:67,8:65,0:60};
