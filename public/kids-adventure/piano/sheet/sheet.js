/* ════════════════════════════════════════════════════════════════════════════
   THE PRACTICE SHEET — one page, on paper, next to the piano.

   A parent brought in a sheet like this for Yankee Doodle and asked for the
   same thing inside the app. The catch is that a hand-made sheet goes stale
   the moment a note changes, and theirs had already drifted from the tune —
   so this one is GENERATED from KJA.songbook, the same notes the game plays.
   If a note ever changes, the paper changes with it. There is no second copy
   to keep in step.

   What a six-year-old needs off a page, in the order they need it:
     the letter        big, and always the same colour for that letter
     which key         a little keyboard with the one key filled in
     which finger      a numbered circle on that key
     how long          "hold 2" and a 1-2 count under the long notes
     the words         so they can sing while they hunt for the key

   It prints on one portrait page. Everything that is screen-only (the back
   link, the print button, the play button) is dropped by the print rules, and
   nothing anywhere is allowed to break across two pages.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var BOOK = (window.KJA && window.KJA.songbook) || null;
  var SND  = (window.KJA && window.KJA.sound) || null;
  var JY   = (window.KJA && window.KJA.journey) || null;
  var host = $('#sheet');
  if (!BOOK) { host.innerHTML = '<p class="sub">The songbook did not load.</p>'; return; }

  var sm = /[?&]song=([a-z]+)/.exec(location.search);
  var song = BOOK.get(sm ? sm[1] : '') || BOOK.list()[0];

  /* ── the seven letters, as a keyboard strip ─────────────────────────────
     Which white keys to draw. A song's own range, widened to whole octaves
     so the black-key groups look like a real piano rather than a fragment. */
  function strip(keys) {
    var lo = Math.min.apply(null, keys), hi = Math.max.apply(null, keys);
    var out = '';
    for (var k = lo; k <= hi; k++) {
      var L = BOOK.letterOf(k);
      out += '<span class="sk" style="--c:' + BOOK.colourOf(k) + '">' +
        (BOOK.blackAfter(k) && k < hi ? '<i class="sbk"></i>' : '') +
        '<b>' + L + '</b></span>';
    }
    return '<div class="skb">' + out + '</div>';
  }

  /* ── one note: a key with a finger on it ────────────────────────────────
     Drawn as a five-white-key window centred on the note, which is how a
     child finds a key in real life — by the black-key pattern around it, not
     by counting from the end of the piano. */
  function miniKeys(k) {
    var from = k - 2, cells = '';
    for (var i = 0; i < 5; i++) {
      var kk = from + i;
      cells += '<span class="mk' + (kk === k ? ' on' : '') + '">' +
        (BOOK.blackAfter(kk) && i < 4 ? '<i></i>' : '') + '</span>';
    }
    return '<span class="mkb">' + cells + '</span>';
  }
  function noteCell(n) {
    var L = BOOK.letterOf(n.k), held = (n.b || 1) >= 2;
    /* --nc is the note's own colour, kept separate from the row's --c so the
       key filled in on the little keyboard matches the letter tile above it.
       Sharing one variable made every key in a row the row's colour, which
       took away the one thing a child who cannot read yet can match on. */
    return '<div class="nc' + (held ? ' held' : '') + '" style="--nc:' + BOOK.colourOf(n.k) + '">' +
      '<b class="nl" style="--c:' + BOOK.colourOf(n.k) + '">' + L + '</b>' +
      (held ? '<span class="hold">hold ' + n.b + '</span>' : '') +
      '<span class="nk">' + miniKeys(n.k) +
        (n.f ? '<s class="fg">' + n.f + '</s>' : '') + '</span>' +
      (n.l ? '<span class="nw">' + n.l + '</span>' : '') +
      (held ? '<span class="count">' + countTo(n.b) + '</span>' : '') +
    '</div>';
  }
  function countTo(b) {
    var out = []; for (var i = 1; i <= Math.round(b); i++) out.push(i);
    return out.join(' – ');
  }

  /* A row splits at the bar line, the way the printed music does. The split
     is by BEATS, not by counting notes: row 2 is C C D E | C(2) B(2), which
     is four notes then two, so halving the note count put the line in the
     middle of the first bar. Four beats fill a bar here, and a row that does
     not divide evenly simply gets no line. */
  function barSplit(notes, perBar) {
    var at = 0;
    for (var i = 0; i < notes.length; i++) {
      at += notes[i].b || 1;
      if (at === perBar) return i + 1;
      if (at > perBar) return 0;                 /* it does not divide — no line */
    }
    return 0;
  }
  function rowHTML(u, i) {
    var beats = u.notes.reduce(function (a, n) { return a + (n.b || 1); }, 0);
    var half = barSplit(u.notes, beats / 2), col = TAPE[i % TAPE.length];
    function run(list) { return list.map(noteCell).join(''); }
    return '<section class="row" style="--c:' + col + '">' +
      '<div class="rhead">' +
        '<h2>' + song.unitWord + ' ' + u.m + '</h2>' +
        '<p class="rl">' + BOOK.rowLetters(u) + '</p>' +
        (u.name ? '<p class="rn">' + u.name + '</p>' : '') +
        (u.shift ? '<p class="rshift">✋ ' + u.shift + '</p>' : '') +
      '</div>' +
      '<div class="rnotes">' + (half
        ? run(u.notes.slice(0, half)) + '<span class="bar" aria-hidden="true"></span>' + run(u.notes.slice(half))
        : run(u.notes)) + '</div>' +
    '</section>';
  }
  var TAPE = ['#E85A70','#3880C0','#2F7A3A','#8A5BC0'];

  function paint() {
    var keys = song.keys || [15,16,17,18,19];
    host.innerHTML =
      '<div class="noprint topline">' +
        '<a class="gbtn" style="--c:var(--t6)" href="/kids-adventure/piano/play/?song=' + song.id + '">‹ Back to the song</a>' +
        '<button class="gbtn" style="--c:var(--t3)" data-a="print">🖨 Print this page</button>' +
        '<button class="gbtn" style="--c:var(--t1)" data-a="hear">▶ Hear it</button>' +
      '</div>' +

      '<header class="shead">' +
        '<p class="kicker">Practice sheet</p>' +
        '<h1>' + song.icon + ' ' + song.title + '</h1>' +
        '<p class="tag">Let’s play together!</p>' +
      '</header>' +

      '<div class="topgrid">' +
        '<section class="find">' +
          '<h2>Find these keys on your piano</h2>' +
          strip(keys) +
          '<p class="findsub">These are the only notes this song uses.</p>' +
        '</section>' +
        '<aside class="signpost">' +
          '<h2>How to practise</h2>' +
          '<ul><li>Play <b>slowly</b>.</li><li>Look at the <b>letters</b>.</li>' +
          '<li>Use the <b>right fingers</b>.</li><li>Have <b>fun!</b> ♥</li></ul>' +
        '</aside>' +
      '</div>' +

      (song.setup ? '<p class="setup"><b>Where your hand goes:</b> ' + song.setup + '</p>' : '') +

      song.units.map(rowHTML).join('') +

      (song.words ? '<p class="words">🎵 ' + song.words + '</p>' : '') +

      '<footer class="sfoot">' +
        '<p class="yay">You can do it!</p>' +
        '<p class="tiny">Practise a little every day. ' + song.title + ', the fun way. ♥</p>' +
      '</footer>' +

      '<p class="fingerkey noprint">Finger numbers: <b>1</b> thumb · <b>2</b> pointer · ' +
        '<b>3</b> middle · <b>4</b> ring · <b>5</b> little</p>';
  }

  /* ── hearing it from the sheet ──────────────────────────────────────────
     A printed sheet cannot tell a child what the tune sounds like, and a
     child who has not heard it cannot tell whether they are playing it
     right. So the screen version plays, and lights each letter as it goes. */
  var playing = false, raf = null;
  function hear() {
    if (playing) { stop(); return; }
    var list = BOOK.allNotes(song), beat = 60 / (song.bpm || 92);
    var a = SND && SND.ctx();
    if (!a) return;
    var t0 = a.currentTime + 0.15, at = 0, sched = [];
    list.forEach(function (n) {
      at += (n.rest || 0) * beat;
      var dur = Math.max(0.3, (n.b || 1) * beat * 0.96);
      SND.piano(BOOK.freqOf(n.k), t0 - a.currentTime + at, dur, 0.22);
      sched.push({ at: at, i: n.i });
      at += (n.b || 1) * beat;
    });
    playing = true;
    var total = at + 0.5, cur = -1;
    var cells = [].slice.call(document.querySelectorAll('.nc'));
    $('[data-a="hear"]').textContent = '■ Stop';
    (function frame() {
      var now = a.currentTime - t0, i = -1;
      for (var j = 0; j < sched.length; j++) if (now >= sched[j].at - 0.02) i = j;
      if (i !== cur && i >= 0) {
        cur = i;
        cells.forEach(function (c) { c.classList.remove('lit'); });
        if (cells[i]) {
          cells[i].classList.add('lit');
          cells[i].scrollIntoView({ block:'nearest', inline:'nearest',
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
      }
      if (now < total && playing) raf = requestAnimationFrame(frame);
      else stop();
    })();
  }
  function stop() {
    playing = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    if (SND && SND.hush) SND.hush();
    document.querySelectorAll('.nc.lit').forEach(function (c) { c.classList.remove('lit'); });
    var b = $('[data-a="hear"]'); if (b) b.textContent = '▶ Hear it';
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]'); if (!t) return;
    if (t.dataset.a === 'print') { stop(); window.print(); }
    if (t.dataset.a === 'hear')  hear();
  });

  paint();
  if (window.KJA && window.KJA.ui) window.KJA.ui.toolbar('#mutebar');
  if (JY) JY.visit.mark('piano', 'Piano · ' + song.title + ' practice sheet', { s: song.id });
  window.__sheet = { song: function () { return song; }, playing: function () { return playing; } };
})();
