/* MAIN: event wiring and first render */
let quitT=null;
$('quit').onclick=()=>{
  const b=$('quit');
  if(b.dataset.arm!=='1'){b.dataset.arm='1';b.innerHTML='Quit? <b>Yes</b>';clearTimeout(quitT);quitT=setTimeout(()=>{b.dataset.arm='';b.textContent='Menu'},3000);return}
  clearTimeout(quitT);b.dataset.arm='';b.textContent='Menu';
  if(G){clearInterval(G.tick);clearTimeout(G.tout);G.drawing=false}
  $('draw').style.display='none';renderHome();show('home');
};
$('start').onclick=start;$('reroll').onclick=reroll;$('again').onclick=start;$('menu').onclick=()=>{renderHome();show('home')};$('copy').onclick=copyLineup;
renderHome();
