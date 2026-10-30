/* SIMULATION: bouts, tournament, point values */
/* ================= SIMULATION ================= */
const winP=(a,b)=>1/(1+Math.exp(-(a-b)/6.5));
const PTS={F:6,TF:5,MD:4,D:3};
function bout(c,opp){
  const p=winP(c.rating,opp);
  if(Math.random()<p){
    const bp=clamp(c.bonus/100+(c.rating-opp)/100*.6-.05,.08,.92);
    let t='D';
    if(Math.random()<bp){
      const share=clamp((c.pins/Math.max(c.wins,1))/Math.max(c.bonus/100,.1),.25,.7);
      t=Math.random()<share?'F':(Math.random()<.4?'TF':'MD');
    }
    return {win:true,t};
  }
  const r=Math.random(),bp=clamp(.3+(opp-c.rating)/100*.6,.1,.7);
  const t=r<bp?(Math.random()<.2?'F':(Math.random()<.4?'TF':'MD')):'D';
  return {win:false,t};
}
const EASE=8;
const TIERS={low:62,mid:73,high:82,elite:89};
const SCHEDULE=[['Lock Haven','low'],['Binghamton','low'],['Navy','low'],['Virginia Tech','mid'],['Michigan','mid'],['Northwestern','mid'],['NC State','mid'],['Wisconsin','mid'],['Iowa','high'],['Ohio State','high'],['Nebraska','high'],['Cornell','high'],['Penn State','elite'],['Oklahoma State','elite'],['Iowa State','elite']];
function runDual(team,tier){
  let me=0,them=0;
  for(const c of team){const opp=Math.max(48,TIERS[tier]-EASE+gauss()*5.5),r=bout(c,opp);if(r.win)me+=PTS[r.t];else them+=PTS[r.t]}
  if(me===them){if(Math.random()<.5)me++;else them++}
  return {me,them};
}
const FINISH={1:'Champion',2:'Runner-up',3:'3rd',4:'4th',5:'5th',6:'6th',7:'7th',8:'8th',9:'No place'};
const PLACE_PTS={1:16,2:12,3:10,4:9,5:7,6:6,7:4,8:3,9:0};
function adv(c,opp,round){
  const win=Math.random()<winP(c.rating,opp);let pts=0;
  if(win){
    const bp=clamp(c.bonus/100*(1-.1*round)+(c.rating-opp)/100*.4-.05,.05,.9);
    if(Math.random()<bp){
      const share=clamp((c.pins/Math.max(c.wins,1))/Math.max(c.bonus/100,.1),.25,.7);
      pts=Math.random()<share?1.5:(Math.random()<.45?1:.5);
    }
    pts+=1;
  }
  return {win,pts};
}
function tournament(c){
  let pts=0;const champOpp=[68,75,83,89,92];const o=i=>Math.max(46,champOpp[i]-EASE+gauss()*5);let lostAt=-1;
  for(let r=0;r<5;r++){const x=adv(c,o(r),r);pts+=x.pts;if(!x.win){lostAt=r;break}}
  if(lostAt===-1) return {place:1,pts:pts+PLACE_PTS[1]};
  if(lostAt===4) return {place:2,pts:pts+PLACE_PTS[2]};
  const cons=mu=>{const x=adv(c,Math.max(46,mu-EASE+gauss()*5),3);pts+=x.pts*.5;return x.win};
  if(lostAt===3){
    if(cons(82)) return cons(84)?{place:3,pts:pts+PLACE_PTS[3]}:{place:4,pts:pts+PLACE_PTS[4]};
    return cons(80)?{place:5,pts:pts+PLACE_PTS[5]}:{place:6,pts:pts+PLACE_PTS[6]};
  }
  if(lostAt<=1){if(!cons(70))return {place:9,pts};if(Math.random()<.5&&!cons(72))return {place:9,pts}}
  if(!cons(77)) return {place:9,pts};
  if(cons(82)) return cons(78)?{place:5,pts:pts+PLACE_PTS[5]}:{place:6,pts:pts+PLACE_PTS[6]};
  return cons(74)?{place:7,pts:pts+PLACE_PTS[7]}:{place:8,pts:pts+PLACE_PTS[8]};
}
const RIVALS=['Oklahoma State','Nebraska','Iowa','Ohio State','Cornell','Michigan','Arizona State','Virginia Tech','Minnesota','NC State','Missouri','Northwestern'];
/* typical advancement + bonus points earned by wrestlers at each finish (calibrated against real team totals) */
const EXTRA={1:8.5,2:7.5,3:7,4:6,5:5.5,6:4.5,7:3.5,8:3,9:1.5};
const TOT=pl=>PLACE_PTS[pl]+EXTRA[pl];
function simulate(){
  if(DOM==='uww'){const res=G.picks.map(c=>({c,place:c.pl,pts:c.pts}));showResults({res,score:res.reduce((a,r)=>a+r.pts,0),aa:res.filter(r=>r.place>=1&&r.place<=3).length});return}
  const res=G.picks.map(c=>{const pl=c.pl>0?c.pl:9;return {c,place:pl,pts:TOT(pl)}});
  const score=res.reduce((a,r)=>a+r.pts,0);
  showResults({res,score,aa:res.filter(r=>r.place<=8).length});
}
