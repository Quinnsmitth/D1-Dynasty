/* STATE: shared globals and small helpers */
/* ================= STATE ================= */
let G=null;
const $=id=>document.getElementById(id);
const show=id=>{document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));$(id).classList.add('on');window.scrollTo(0,0)};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const eraOf=y=>y<=2009?'2000s':y<=2014?'2010s':'Modern';
const inEra=(y,e)=>e==='all'||(e==='2000s'?y<=2009:e==='2010s'?(y>=2010&&y<=2019):y>=2015);
const eraLabel=y=>(cfg.era!=='all'&&inEra(y,cfg.era))?cfg.era:eraOf(y);
