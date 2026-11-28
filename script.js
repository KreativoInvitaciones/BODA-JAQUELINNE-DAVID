'use strict';
const RSVP_PHONE = '524621299639';
const WEDDING_DATE = '2027-01-02T13:00:00-06:00';
const BY = id => document.getElementById(id);
const opening = BY('opening');
const envelope = BY('envelope');
const content = BY('content');
const music = BY('bgMusic');
const musicToggle = BY('musicToggle');
let alreadyOpen = false;

BY('openInvitation').addEventListener('click', () => {
  if (alreadyOpen) return;
  alreadyOpen = true;

  // La invitación queda detrás de la portada desde el primer instante.
  // Solo se desvanece la portada; el sobre permanece estático.
  content.classList.remove('hidden');
  window.scrollTo(0, 0);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) opening.classList.add('is-fading');

  // El audio debe iniciarse dentro del gesto del usuario en iOS/Safari.
  try {
    music.volume = 0.55;
    const started = music.play();
    if (started && typeof started.then === 'function') {
      started.then(() => {
        musicToggle.classList.remove('is-paused');
        musicToggle.setAttribute('aria-label', 'Pausar música');
      }).catch(() => {
        musicToggle.classList.add('is-paused');
        musicToggle.setAttribute('aria-label', 'Reproducir música');
      });
    }
  } catch (err) {
    musicToggle.classList.add('is-paused');
    musicToggle.setAttribute('aria-label', 'Reproducir música');
  }

  window.setTimeout(() => {
    opening.remove();
    content.focus({preventScroll: true});
    musicToggle.classList.remove('hidden');
  }, reducedMotion ? 0 : 1800);
});

musicToggle.addEventListener('click', async () => {
  if (music.paused) {
    try {
      await music.play();
      musicToggle.classList.remove('is-paused');
      musicToggle.setAttribute('aria-label', 'Pausar música');
    } catch (err) {}
  } else {
    music.pause();
    musicToggle.classList.add('is-paused');
    musicToggle.setAttribute('aria-label', 'Reproducir música');
  }
});

function tick() {
  const remaining = Math.max(0, new Date(WEDDING_DATE).getTime() - Date.now());
  const d = Math.floor(remaining / 86400000);
  const h = Math.floor(remaining / 3600000) % 24;
  const m = Math.floor(remaining / 60000) % 60;
  const s = Math.floor(remaining / 1000) % 60;
  [['days', d], ['hours', h], ['minutes', m], ['seconds', s]].forEach(([id, v]) => {
    const node = BY(id);
    if (node) node.textContent = String(v).padStart(2, '0');
  });
}

tick();
setInterval(tick, 1000);

const counts = { adults: 1, children: 0 };
function refreshCounts() {
  BY('adultsCount').textContent = counts.adults;
  BY('childrenCount').textContent = counts.children;
  BY('totalCount').textContent = counts.adults + counts.children;
}

document.querySelectorAll('[data-counter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.counter;
    const step = Number(btn.dataset.step);
    counts[key] = Math.min(20, Math.max(0, counts[key] + step));
    if (key === 'adults' && counts.adults === 0 && counts.children === 0) counts.adults = 1;
    refreshCounts();
  });
});

const attendanceOptions = [...document.querySelectorAll('.attendance-option')];
const attendanceRadios = [...document.querySelectorAll('input[name="attendance"]')];
attendanceRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const yes = document.querySelector('input[name="attendance"]:checked').value === 'yes';
    BY('guestCounts').hidden = !yes;
    attendanceOptions.forEach(option => option.classList.toggle('selected', option.querySelector('input').checked));
    BY('formError').hidden = true;
  });
});

BY('rsvpForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = BY('guestName').value.trim().replace(/\s+/g, ' ');
  const yes = document.querySelector('input[name="attendance"]:checked').value === 'yes';
  const error = BY('formError');
  error.hidden = true;

  if (!name) {
    error.textContent = 'Por favor escribe tu nombre para enviar tu respuesta.';
    error.hidden = false;
    BY('guestName').focus();
    return;
  }
  if (yes && counts.adults + counts.children === 0) {
    error.textContent = 'Indica al menos un asistente, adulto o niño.';
    error.hidden = false;
    return;
  }

  const message = yes
    ? `Hola, confirmo mi asistencia a la boda de Jaquelinne y David.\n\nNombre: ${name}\nAdultos: ${counts.adults}\nNiños: ${counts.children}\nTotal de asistentes: ${counts.adults + counts.children}\n\n¡Muchas gracias!`
    : `Hola, soy ${name}. Lamento informarles que no podré asistir a la boda de Jaquelinne y David. Les deseo un día maravilloso.`;

  window.location.href = `https://wa.me/${RSVP_PHONE}?text=${encodeURIComponent(message)}`;
});

const calendarContent = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Kreativo Invitaciones//ES',
  'BEGIN:VEVENT',
  'UID:jaquelinne-david-20270102@kreativoinvitaciones',
  'DTSTAMP:20261123T120000Z',
  'DTSTART:20270102T190000Z',
  'DTEND:20270103T000000Z',
  'SUMMARY:Boda de Jaquelinne y David',
  'DESCRIPTION:Ceremonia 1:00 p. m. Iglesia del Señor de la Misericordia. Recepción 3:00 p. m. Hacienda Los Tabachines.',
  'LOCATION:Corralejo de Hidalgo, Pénjamo, Guanajuato, México',
  'END:VEVENT',
  'END:VCALENDAR'
].join('\r\n');

const calendarUrl = URL.createObjectURL(new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' }));
BY('saveCalendar').href = calendarUrl;
refreshCounts();

// Copiar el número de evento sin alterar la imagen del código de barras.
const giftCopyButton = BY('copyGiftCode');
giftCopyButton.addEventListener('click', async () => {
  const giftNumber = '51962230';
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(giftNumber);
    } else {
      const input = document.createElement('textarea');
      input.value = giftNumber;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) throw new Error('No se pudo copiar');
    }
    BY('giftCopyFeedback').textContent = 'Número copiado';
  } catch (err) {
    BY('giftCopyFeedback').textContent = 'Número de evento: 51962230';
  }
});
