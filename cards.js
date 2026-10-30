/* CARDS: build wrestler cards, crests, flags, award markers */
/* ================= BUILD CARDS ================= */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const seeded=s=>(hash(s)%10007)/10007;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
for(const t of TEAMS){
  t.cards={};
  for(const [w,n,pl] of t.r){
    const id=t.id+'|'+n;
    const star=(STAR[n]||0)*(pl===1?1:pl===2?.6:pl<=4&&pl>0?.4:.2);
    const rating=BASE[pl]+star+(seeded(id+'r')-.5)*5;
    const wins0=clamp(Math.round(24+(rating-70)*.45+(seeded(id+'a')-.5)*6),14,41);
    const pr=clamp(.08+(rating-70)*.011+(seeded(id+'b')-.5)*.08,.04,.5);
    const bo0=Math.round(clamp(38+(rating-70)*2.1+(seeded(id+'c')-.5)*12,22,95));
    const v=V[id]||{};
    const wins=v.w??wins0, bonus=v.b??bo0;
    const pins=v.p??Math.min(Math.round(wins*pr),Math.round(wins*bonus/100));
    t.cards[w]={id,w,n,pl,t,rating,wins,pins,bonus,est:{w:v.w==null,p:v.p==null,b:v.b==null}};
  }
}
const CREST={"Air Force":["AFA","#003087","#C0C4C8"],"American":["AU","#C8102E","#FFFFFF"],"Appalachian State":["APP","#222222","#FFCC00"],"Arizona State":["ASU","#8C1D40","#FFC627"],"Army":["ARMY","#1A1A1A","#D4BF91"],"Binghamton":["BING","#005A43","#FFFFFF"],"Bloomsburg":["BLM","#861F41","#FFC72C"],"Boise State":["BSU","#0033A0","#D64309"],"Bucknell":["BUCK","#003087","#E87722"],"Cal Poly":["CP","#154734","#C99700"],"Cal State Bakersfield":["CSUB","#003594","#FFC72C"],"Cal State Fullerton":["CSUF","#00274C","#FF7900"],"Campbell":["CAMP","#F56E00","#000000"],"Central Michigan":["CMU","#6A0032","#FFC82E"],"Chattanooga":["UTC","#00386B","#E0AA0F"],"Clarion":["CLAR","#002D62","#CBA052"],"Columbia":["CU","#9BCBEB","#0A2A5E"],"Cornell":["CORN","#B31B1B","#FFFFFF"],"Drexel":["DREX","#07294D","#FFC600"],"Duke":["DUKE","#001A57","#FFFFFF"],"Eastern Michigan":["EMU","#006633","#FFFFFF"],"Edinboro":["EDIN","#CE1126","#FFFFFF"],"Fresno State":["FRES","#DB0032","#002E6D"],"Harvard":["HARV","#A51C30","#FFFFFF"],"Hofstra":["HOF","#003591","#FFC72C"],"Illinois":["ILL","#E84A27","#13294B"],"Indiana":["IND","#990000","#FFFFFF"],"Iowa":["IOWA","#111111","#FFCD00"],"Iowa State":["ISU","#C8102E","#F1BE48"],"James Madison":["JMU","#450084","#CBB677"],"Kent State":["KENT","#002664","#EAAB00"],"Lehigh":["LEH","#502D0E","#FFFFFF"],"Little Rock":["UALR","#6F2C3F","#C0C4C8"],"Lock Haven":["LHU","#C8102E","#FFFFFF"],"Maryland":["MD","#E03A3E","#FFD520"],"Michigan":["MICH","#00274C","#FFCB05"],"Michigan State":["MSU","#18453B","#FFFFFF"],"Minnesota":["MINN","#7A0019","#FFCC33"],"Missouri":["MIZZ","#111111","#F1B82D"],"NC State":["NCSU","#CC0000","#FFFFFF"],"Navy":["NAVY","#00205B","#C5B783"],"Nebraska":["NEB","#E41C38","#FFFFFF"],"North Carolina":["UNC","#7BAFD4","#13294B"],"North Dakota State":["NDSU","#0A5640","#FFC72C"],"Northern Colorado":["UNCO","#13294B","#F1B82D"],"Northern Illinois":["NIU","#BA0C2F","#000000"],"Northern Iowa":["UNI","#4B116F","#FFCC00"],"Northwestern":["NU","#4E2A84","#FFFFFF"],"Ohio":["OHIO","#00694E","#FFFFFF"],"Ohio State":["OSU","#BB0000","#FFFFFF"],"Oklahoma":["OU","#841617","#FDF9D8"],"Oklahoma State":["OKST","#FF7300","#000000"],"Old Dominion":["ODU","#003057","#9AA5AE"],"Oregon":["ORE","#154733","#FEE123"],"Oregon State":["ORST","#DC4405","#000000"],"Penn":["PENN","#011F5B","#C8102E"],"Penn State":["PSU","#041E42","#FFFFFF"],"Pittsburgh":["PITT","#003594","#FFB81C"],"Princeton":["PRIN","#E87722","#000000"],"Purdue":["PUR","#111111","#CEB888"],"Rider":["RID","#A6192E","#FFFFFF"],"Rutgers":["RUTG","#CC0033","#FFFFFF"],"South Dakota State":["SDSU","#0033A0","#FFD100"],"Stanford":["STAN","#8C1515","#FFFFFF"],"The Citadel":["CIT","#3E6BB0","#FFFFFF"],"UC Davis":["UCD","#022851","#FFBF00"],"Virginia":["UVA","#232D4B","#E57200"],"Virginia Tech":["VT","#861F41","#E87722"],"West Virginia":["WVU","#002855","#EAAA00"],"Wisconsin":["WIS","#C5050C","#FFFFFF"],"Wyoming":["WYO","#492F24","#FFC425"],"Boston College":["BC","#8A100B","#B29D6C"]};
function crest(team,size){
  if(DOM==='uww')return `<span class="crest flag" style="width:${size}px;height:${size}px;font-size:${Math.round(size*.62)}px" aria-hidden="true">${FLAG[team]||'🏳️'}</span>`;
  const c=CREST[team]||[(team||'?').slice(0,3).toUpperCase(),'#334','#fff'],f=Math.round(size*(c[0].length>3?.30:c[0].length>2?.36:.44));
  return `<span class="crest" style="width:${size}px;height:${size}px;font-size:${f}px;background:${c[1]};color:${c[2]};border-color:${c[2]}" aria-hidden="true">${c[0]}</span>`;
}
const UPTS={1:25,2:20,3:15,5:10,7:7};
const upts=r=>r>0?(UPTS[r]??(r<=8?7:r<=16?4:2)):1;
UWWT.forEach(t=>{t.id=t.y+'|'+t.team;t.cards={};for(const [w,n,pl] of t.r){t.cards[w]={id:t.id+'|'+n,w,n,pl,t,pts:upts(pl),rating:0,wins:0,pins:0,bonus:0,est:{w:true,p:true,b:true}}}});
const FLAG={"Armenia":"🇦🇲","Azerbaijan":"🇦🇿","Canada":"🇨🇦","Japan":"🇯🇵","Great Britain":"🇬🇧","Uzbekistan":"🇺🇿","Ukraine":"🇺🇦","Puerto Rico":"🇵🇷","Venezuela":"🇻🇪","France":"🇫🇷","Belarus":"🇧🇾","Greece":"🇬🇷","North Macedonia":"🇲🇰","Serbia":"🇷🇸","Slovakia":"🇸🇰","Georgia":"🇬🇪","Romania":"🇷🇴","Cuba":"🇨🇺","North Korea":"🇰🇵","India":"🇮🇳","Mongolia":"🇲🇳","Hungary":"🇭🇺","Moldova":"🇲🇩","China":"🇨🇳","Kyrgyzstan":"🇰🇬","Tajikistan":"🇹🇯","Poland":"🇵🇱","Kazakhstan":"🇰🇿","Bahrain":"🇧🇭","Turkey":"🇹🇷","Russia":"🇷🇺","South Korea":"🇰🇷","Bulgaria":"🇧🇬","Italy":"🇮🇹","Germany":"🇩🇪","Iran":"🇮🇷","USA":"🇺🇸"};
const HODGE=new Set(['2000|Iowa State|Cael Sanderson','2001|Iowa State|Cael Sanderson','2002|Iowa State|Cael Sanderson','2003|Arizona State|Eric Larkin','2005|Oklahoma State|Steve Mocco','2006|Missouri|Ben Askren','2007|Missouri|Ben Askren','2008|Iowa|Brent Metcalf','2009|Northwestern|Jake Herbert','2010|Minnesota|Jayson Ness','2011|Nebraska|Jordan Burroughs','2012|Penn State|David Taylor','2013|Cornell|Kyle Dake','2014|Penn State|David Taylor','2015|Ohio State|Logan Stieber','2016|Oklahoma State|Alex Dieringer','2017|Penn State|Zain Retherford','2018|Penn State|Zain Retherford','2019|Penn State|Bo Nickal','2021|Iowa|Spencer Lee','2021|Minnesota|Gable Steveson','2022|Minnesota|Gable Steveson','2023|Michigan|Mason Parris','2024|Penn State|Aaron Brooks','2025|Oklahoma State|Wyatt Hendrickson','2026|Penn State|Mitchell Mesenbrink']);
const hodge=c=>DOM!=='uww'&&HODGE.has(c.t.y+'|'+c.t.team+'|'+c.n);
const TROPHY=()=>{const s=document.createElement('span');s.className='hodge';s.textContent='\u{1F3C6}';s.title='Dan Hodge Trophy winner';return s};
const PINS=new Set(['2013|Cornell|Kyle Dake','2014|Indiana|Taylor Walsh','2015|Bucknell|Joe Stolfi','2016|Navy|Mathew Miller','2017|Cornell|Gabe Dean','2018|Hofstra|Mike Hughes','2019|Central Michigan|Matt Stencel','2022|Air Force|Wyatt Hendrickson','2025|Lehigh|Kelvin Griffin']);
const TECHS=new Set(['2012|Edinboro|Chris Honeycutt','2012|Buffalo|Mark Lewandowski','2014|Oklahoma State|Chris Perry','2015|Illinois|Isaiah Martinez','2016|Illinois|Isaiah Martinez','2017|Virginia|Jack Mueller','2018|Lock Haven|Kyle Shoop','2019|Lock Haven|Kyle Shoop','2022|Rutgers|Sebastian Rivera','2023|Franklin & Marshall|Mason Leiphart','2025|Penn State|Mitchell Mesenbrink','2026|Iowa State|Yonger Bastida']);
const MARK=(txt,tip)=>{const s=document.createElement('span');s.className='hodge';s.textContent=txt;s.title=tip;return s};
const addMarks=(el,c)=>{if(DOM==='uww')return;const k=c.t.y+'|'+c.t.team+'|'+c.n;if(HODGE.has(k))el.append(TROPHY());if(PINS.has(k))el.append(MARK('\u{1F4CC}','Most pins in Division I that season'));if(TECHS.has(k))el.append(MARK('\u274C','Most tech falls in Division I that season'))};
const CARDS={};COLL.concat(UWWT).forEach(t=>Object.values(t.cards).forEach(c=>{CARDS[c.id]=c}));
const SCHOOL=t=>t.team;
const uplace=pl=>pl===1?['Gold','p1']:pl===2?['Silver','p2']:pl===3?['Bronze','p3']:pl>0?[pl+(pl%100>=11&&pl%100<=13?'th':['th','st','nd','rd'][pl%10]||'th'),'aa']:['Did not place','dnp'];
const place=pl=>DOM==='uww'?uplace(pl):pl===1?['Champion','p1']:pl===2?['Runner-up','p2']:pl===3?['3rd place','p3']:pl>=4?['AA · '+pl+'th','aa']:['Did not place','dnp'];
const badge=pl=>{const [t,c]=place(pl);return `<span class="badge ${c}">${t}</span>`};
