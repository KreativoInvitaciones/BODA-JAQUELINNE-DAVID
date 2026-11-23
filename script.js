'use strict';
const RSVP_PHONE = '524621299639';
const WEDDING_DATE = '2027-01-02T13:00:00-06:00';
const BY = id => document.getElementById(id);
const opening = BY('opening'), content = BY('content'), sparkleLayer = BY('sparkles');
let alreadyOpen = false;
BY('openInvitation').addEventListener('click', e => {
  if (alreadyOpen) return;
  alreadyOpen = true;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width/2, y=rect.top+rect.height/2;
  for (let i=0;i<27;i++) {
    const s=document.createElement('span');
    const angle=Math.PI*2*i/27;
    const distance=90+Math.random()*145;
    s.className='sparkle';
    s.textContent=i%3===0?'✧':'✦';
    s.style.setProperty('--x',x+'px');s.style.setProperty('--y',y+'px');
    s.style.setProperty('--dx',Math.cos(angle)*distance+'px');
    s.style.setProperty('--dy',Math.sin(angle)*distance+'px');
    s.style.setProperty('--s',(10+Math.random()*19)+'px');
    sparkleLayer.append(s);
  }
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 680;
  window.setTimeout(()=>{opening.remove();content.classList.remove('hidden');content.focus({preventScroll:true});window.scrollTo(0,0);sparkleLayer.innerHTML='';},delay);
});
function tick(){const remaining=Math.max(0,new Date(WEDDING_DATE).getTime()-Date.now()); const d=Math.floor(remaining/86400000),h=Math.floor(remaining/3600000)%24,m=Math.floor(remaining/60000)%60,s=Math.floor(remaining/1000)%60;[['days',d],['hours',h],['minutes',m],['seconds',s]].forEach(([id,v])=>{BY(id).textContent=String(v).padStart(2,'0')});}
tick();setInterval(tick,1000);
const counts={adults:1,children:0};
function refreshCounts(){ BY('adultsCount').value=counts.adults; BY('adultsCount').textContent=counts.adults;BY('childrenCount').value=counts.children;BY('childrenCount').textContent=counts.children;BY('totalCount').textContent=counts.adults+counts.children;}
document.querySelectorAll('[data-counter]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.counter,step=Number(btn.dataset.step);counts[key]=Math.min(20,Math.max(0,counts[key]+step));refreshCounts();}));
const attendanceRadios=[...document.querySelectorAll('input[name="attendance"]')];
attendanceRadios.forEach(r=>r.addEventListener('change',()=>{const yes=document.querySelector('input[name="attendance"]:checked').value==='yes';BY('guestCounts').hidden=!yes;document.querySelectorAll('.attendance-option').forEach(l=>l.classList.toggle('selected',l.querySelector('input').checked));BY('formError').hidden=true;}));
BY('rsvpForm').addEventListener('submit',event=>{
  event.preventDefault();
  const name=BY('guestName').value.trim().replace(/\s+/g,' ');
  const yes=document.querySelector('input[name="attendance"]:checked').value==='yes';
  const error=BY('formError');error.hidden=true;
  if(!name){error.textContent='Por favor escribe tu nombre para enviar tu respuesta.';error.hidden=false;BY('guestName').focus();return;}
  if(yes&&counts.adults+counts.children===0){error.textContent='Indica al menos un asistente, adulto o niño.';error.hidden=false;return;}
  const message=yes?`Hola, confirmo mi asistencia a la boda de Jaquelinne y David.\n\nNombre: ${name}\nAdultos: ${counts.adults}\nNiños: ${counts.children}\nTotal de asistentes: ${counts.adults+counts.children}\n\n¡Muchas gracias!`:`Hola, soy ${name}. Lamento informarles que no podré asistir a la boda de Jaquelinne y David. Les deseo un día maravilloso.`;
  window.location.href=`https://wa.me/${RSVP_PHONE}?text=${encodeURIComponent(message)}`;
});
const calendarContent=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kreativo Invitaciones//ES','BEGIN:VEVENT','UID:jaquelinne-david-20270102@kreativoinvitaciones','DTSTAMP:20261123T120000Z','DTSTART:20270102T190000Z','DTEND:20270103T000000Z','SUMMARY:Boda de Jaquelinne y David','DESCRIPTION:Ceremonia 1:00 p. m. Iglesia del Señor de la Misericordia. Recepción 3:00 p. m. Hacienda Los Tabachines.','LOCATION:Corralejo de Hidalgo, Pénjamo, Guanajuato, México','END:VEVENT','END:VCALENDAR'].join('\r\n');
const calendarUrl=URL.createObjectURL(new Blob([calendarContent],{type:'text/calendar;charset=utf-8'}));BY('saveCalendar').href=calendarUrl;
