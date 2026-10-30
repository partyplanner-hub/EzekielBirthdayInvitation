(function () {
  'use strict';

  /* ---- Edit these to change the event ---- */
  var EVENT = {
    babyName: 'Ezekiel Joshua',
    start: '2026-11-15T17:00:00+08:00',   // Philippine Time (UTC+8)
    durationHours: 4,
    venue: 'Via Salina Lagoon Exclusive Resort, Koronadal City, South Cotabato'
  };

  var doc = document;
  doc.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Countdown ---- */
  var countdown = doc.getElementById('countdown');
  var startTime = new Date(EVENT.start).getTime();

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function updateCountdown() {
    var diff = Math.max(0, startTime - Date.now());
    var parts = {
      days: Math.floor(diff / 864e5),
      hours: Math.floor(diff / 36e5) % 24,
      minutes: Math.floor(diff / 6e4) % 60,
      seconds: Math.floor(diff / 1e3) % 60
    };
    Object.keys(parts).forEach(function (unit) {
      var el = countdown.querySelector('[data-u="' + unit + '"]');
      if (el) el.textContent = pad(parts[unit]);
    });
  }
  if (countdown) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ---- Scroll progress: little car on the race bar ---- */
  var progressFill = doc.getElementById('progressFill');
  var progressCar = doc.getElementById('progressCar');

  function updateMotion() {
    var page = doc.documentElement;
    var scrollable = page.scrollHeight - window.innerHeight;
    var percent = scrollable > 0 ? (window.pageYOffset / scrollable) * 100 : 0;
    progressFill.style.width = percent + '%';
    progressCar.style.left = percent + '%';

  }
  window.addEventListener('scroll', updateMotion, { passive: true });
  window.addEventListener('resize', updateMotion);
  updateMotion();

  /* ---- Photo lightbox (zoom, X to close, arrows/swipe to browse) ---- */
  var lightbox = doc.getElementById('lightbox');
  var photoLinks = [].slice.call(doc.querySelectorAll('[data-lightbox]'));
  var lightboxImage = lightbox.querySelector('img');
  var lightboxCaption = lightbox.querySelector('figcaption');
  var currentPhoto = 0;

  function showPhoto(index) {
    currentPhoto = (index + photoLinks.length) % photoLinks.length;
    lightboxImage.src = photoLinks[currentPhoto].getAttribute('href');
    lightboxImage.alt = photoLinks[currentPhoto].dataset.caption || '';
    lightboxCaption.textContent = photoLinks[currentPhoto].dataset.caption || '';
  }
  function openLightbox(index) {
    showPhoto(index);
    lightbox.hidden = false;
    doc.body.style.overflow = 'hidden';
    lightbox.querySelector('.lb-close').focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    doc.body.style.overflow = '';
  }
  photoLinks.forEach(function (link, index) {
    link.addEventListener('click', function (event) { event.preventDefault(); openLightbox(index); });
  });
  lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lb-prev').addEventListener('click', function () { showPhoto(currentPhoto - 1); });
  lightbox.querySelector('.lb-next').addEventListener('click', function () { showPhoto(currentPhoto + 1); });
  lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
  doc.addEventListener('keydown', function (event) {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
    if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
  });
  var swipeStartX = null;
  lightbox.addEventListener('touchstart', function (event) { swipeStartX = event.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (event) {
    if (swipeStartX === null) return;
    var distance = event.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(distance) > 50) showPhoto(currentPhoto + (distance < 0 ? 1 : -1));
    swipeStartX = null;
  });

  /* ---- Tap a car to honk ---- */
  var audioContext = null;
  function beep() {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      var oscillator = audioContext.createOscillator();
      var volume = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 420;
      volume.gain.value = 0.05;
      oscillator.connect(volume);
      volume.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
    } catch (e) { /* sound is optional */ }
  }
  doc.addEventListener('click', function (event) {
    var car = event.target.closest('.drive, .rcar');
    if (!car) return;
    var bubble = doc.createElement('span');
    bubble.className = 'honk';
    bubble.textContent = 'BEEP BEEP!';
    bubble.style.left = event.clientX + 'px';
    bubble.style.top = (event.clientY - 30) + 'px';
    doc.body.appendChild(bubble);
    setTimeout(function () { bubble.remove(); }, 1000);
    beep();
  });

  /* ---- Reveal on scroll ---- */
  var revealItems = [].slice.call(doc.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- RSVP: traffic light turns green + confetti ---- */
  var rsvpBtn = doc.getElementById('rsvpBtn');
  var rsvpCard = doc.getElementById('rsvpCard');
  var rsvpThanks = doc.getElementById('rsvpThanks');
  var confettiColors = ['#e63946', '#ffc233', '#2f80ed', '#2fbf71'];

  if (rsvpBtn) {
    rsvpBtn.addEventListener('click', function () {
      if (rsvpCard.classList.contains('confirmed')) return;
      rsvpCard.classList.add('confirmed');
      rsvpBtn.setAttribute('aria-expanded', 'true');
      rsvpThanks.setAttribute('aria-hidden', 'false');
      if (reduceMotion) return;
      for (var i = 0; i < 16; i++) {
        var piece = doc.createElement('span');
        piece.className = 'burst';
        piece.style.setProperty('--x', (Math.random() * 360 - 180) + 'px');
        piece.style.setProperty('--c', confettiColors[i % confettiColors.length]);
        piece.style.animationDelay = (i * 0.05) + 's';
        rsvpCard.appendChild(piece);
        setTimeout(function (el) { el.remove(); }, 2400, piece);
      }
    });
  }

  /* ---- Add to calendar (.ics) ---- */
  var calendarBtn = doc.getElementById('addToCal');
  function toIcsDate(date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }

  if (calendarBtn) {
    calendarBtn.addEventListener('click', function () {
      var start = new Date(EVENT.start);
      var end = new Date(start.getTime() + EVENT.durationHours * 36e5);
      var lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cars Birthday Invitation//EN',
        'BEGIN:VEVENT',
        'UID:first-birthday-cars@invitation',
        'DTSTAMP:' + toIcsDate(new Date()),
        'DTSTART:' + toIcsDate(start),
        'DTEND:' + toIcsDate(end),
        'SUMMARY:' + EVENT.babyName + '\'s Onederful Year (1st Birthday)',
        'LOCATION:' + EVENT.venue.replace(/,/g, '\\,'),
        'DESCRIPTION:Start your engines! The race to ONE.',
        'END:VEVENT', 'END:VCALENDAR'
      ];
      var link = doc.createElement('a');
      link.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
      link.download = 'first-birthday.ics';
      doc.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
})();
