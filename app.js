// Simple demo script for Car Rental And Leasing Software
const btn = document.getElementById('btn');
const out = document.getElementById('out');
let c = 0;
btn.addEventListener('click', ()=>{
  c++;
  out.textContent = 'Siz '+c+' marta bosdingiz.';
});
