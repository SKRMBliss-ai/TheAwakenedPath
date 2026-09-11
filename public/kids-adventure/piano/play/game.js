/* ════════════════════════════════════════════════════════════════════════════
   DYNO'S SONG ADVENTURE — a first-piano game for children.

   Five levels that actually teach: find the five white keys, learn Hot Cross
   Buns note by note, play it against a beat, learn Mary Had a Little Lamb,
   then compose. No samples and no libraries — the piano is three oscillator
   partials with a soft decay, the songs are public-domain nursery tunes kept
   inside one five-key hand position so a child never has to move, and the
   stars earned here are the same stars Piano World's trail reads back.

   Nothing about a child leaves the device: progress lives in localStorage
   under kja:piano, shared with the journey screen.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var $  = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var TAPES  = ['#3880C0','#E06098','#509858','#F89030','#A070C0','#50A8B0','#F0B828'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FREQ = { C:261.63, D:293.66, E:329.63, F:349.23, G:392.00, A:440.00, B:493.88, C2:523.25 };
  var NAME = { C:'C', D:'D', E:'E', F:'F', G:'G', A:'A', B:'B', C2:'C' };
  var WHITE5 = ['C','D','E','F','G'];
  var WHITE8 = ['C','D','E','F','G','A','B','C2'];

  var LEVELS = [
    { n:1, name:'Meet the Keys', keys:WHITE5, mode:'find',
      brief:'Five white keys, five friends. Find each one and say hello.',
      seq:[{k:'C'},{k:'D'},{k:'E'},{k:'F'},{k:'G'},{k:'C'},{k:'E'},{k:'G'}] },
    { n:2, name:'Hot Cross Buns', keys:WHITE5, mode:'learn',
      brief:'Your first whole song — three notes only: E, D and C.',
      seq:[{k:'E',d:1},{k:'D',d:1},{k:'C',d:2},{bar:1},
           {k:'E',d:1},{k:'D',d:1},{k:'C',d:2},{bar:1},
           {k:'C',d:.5},{k:'C',d:.5},{k:'C',d:.5},{k:'C',d:.5},
           {k:'D',d:.5},{k:'D',d:.5},{k:'D',d:.5},{k:'D',d:.5},{bar:1},
           {k:'E',d:1},{k:'D',d:1},{k:'C',d:2}] },
    { n:3, name:'Rhythm & Timing', keys:WHITE5, mode:'along', bpm:72,
      brief:'Now with a beat. Press each key as its light comes up.',
      seq:[{k:'E',d:1},{k:'D',d:1},{k:'C',d:2},{bar:1},
           {k:'E',d:1},{k:'D',d:1},{k:'C',d:2},{bar:1},
           {k:'E',d:1},{k:'D',d:1},{k:'C',d:2}] },
    { n:4, name:'Mary Had a Little Lamb', keys:WHITE5, mode:'learn',
      brief:'A longer one. Four notes now: E, D, C and G.',
      seq:[{k:'E',d:1},{k:'D',d:1},{k:'C',d:1},{k:'D',d:1},
           {k:'E',d:1},{k:'E',d:1},{k:'E',d:2},{bar:1},
           {k:'D',d:1},{k:'D',d:1},{k:'D',d:2},
           {k:'E',d:1},{k:'G',d:1},{k:'G',d:2},{bar:1},
           {k:'E',d:1},{k:'D',d:1},{k:'C',d:1},{k:'D',d:1},
           {k:'E',d:1},{k:'E',d:1},{k:'E',d:1},{k:'E',d:1},
           {k:'D',d:1},{k:'D',d:1},{k:'E',d:1},{k:'D',d:1},{k:'C',d:3}] },
    { n:5, name:'Your Own Melody', keys:WHITE8, mode:'compose',
      brief:'Eight keys, no rules. Play something nobody has played before.' }
  ];

  /* ── sound ─────────────────────────────────────────────────────────────── */
  var ac = null, muted = false;
  try { muted = localStorage.getItem('kja:muted') === '1'; } catch (e) {}
  function actx() {
    try {
      if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
      if (ac.state === 'suspended' && ac.resume) ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function piano(freq, when, dur, vol) {
    var a = actx(); if (!a || muted) return;
    var t = a.currentTime + (when || 0), D = dur || 0.95, V = vol || 0.22;
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(V, t + 0.008);
    g.gain.exponentialRampToValueAtTime(V * 0.32, t + 0.14);
    g.gain.exponentialRampToValueAtTime(0.0001, t + D);
    g.connect(a.destination);
    [[1, 1, 'triangle'], [2, 0.3, 'sine'], [3, 0.07, 'sine']].forEach(function (p) {
      var o = a.createOscillator(), gg = a.createGain();
      o.type = p[2]; o.frequency.value = freq * p[0]; gg.gain.value = p[1];
      o.connect(gg); gg.connect(g); o.start(t); o.stop(t + D + 0.05);
    });
  }
  function blip(f, when, dur, vol, type) {
    var a = actx(); if (!a || muted) return;
    var t = a.currentTime + (when || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + (dur || 0.2) + 0.04);
  }
  function oops()  { blip(196, 0, 0.22, 0.12, 'triangle'); blip(155, 0.09, 0.26, 0.09, 'triangle'); }
  function tick(strong) { blip(strong ? 1560 : 1150, 0, 0.05, strong ? 0.11 : 0.06, 'square'); }
  function chime() { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { piano(f, i * 0.1, 1.05, 0.18); }); }
  function fanfare() {
    [[523.25,0],[659.25,.12],[783.99,.24],[1046.5,.36],[783.99,.54],[1046.5,.64]]
      .forEach(function (p) { piano(p[0], p[1], 1.25, 0.2); });
  }

  /* ── progress, shared with Piano World's trail ─────────────────────────── */
  var prog = { done: [], stars: {}, tunes: [] };
  try {
    var raw = JSON.parse(localStorage.getItem('kja:piano') || 'null');
    if (Array.isArray(raw)) prog.done = raw;                      /* older format */
    else if (raw && typeof raw === 'object') {
      prog = { done: raw.done || [], stars: raw.stars || {}, tunes: raw.tunes || [] };
    }
  } catch (e) {}
  function saveProg() { try { localStorage.setItem('kja:piano', JSON.stringify(prog)); } catch (e) {} }
  function unlocked(n) { return n === 1 || prog.done.indexOf(n - 1) >= 0 || prog.done.indexOf(n) >= 0; }

  /* ── small effects ─────────────────────────────────────────────────────── */
  function toast(t) {
    var el = $('#toast'); el.textContent = t; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
  function confetti() {
    if (reduce) return;
    for (var i = 0; i < 46; i++) {
      var c = document.createElement('div');
      c.className = 'confetti'; c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = TAPES[i % TAPES.length];
      c.style.animationDelay = (Math.random() * 0.5) + 's';
      c.style.borderRadius = i % 2 ? '50%' : '2px';
      document.body.appendChild(c);
      setTimeout(function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; }(c), 2400);
    }
  }
  function sparkAt(el, glyph, colour) {
    if (reduce || !el) return;
    var b = el.getBoundingClientRect();
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.className = 'spark2'; s.textContent = glyph; s.style.color = colour;
      s.style.left = (b.left + b.width / 2) + 'px';
      s.style.top = (b.top + 12) + 'px';
      s.style.setProperty('--dx', (Math.random() * 70 - 35).toFixed(0) + 'px');
      s.style.animationDelay = (i * 0.06) + 's';
      document.body.appendChild(s);
      setTimeout(function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; }(s), 1200);
    }
  }

  /* ── state ─────────────────────────────────────────────────────────────── */
  var L, idx = 0, wrong = 0, playing = false, timers = [], recording = false, mine = [], recStart = 0;
  var alongTimer = null, alongDue = 0;

  var askedFor = 0;
  function levelFromUrl() {
    var m = /[?&]level=(\d)/.exec(location.search);
    var n = m ? +m[1] : 0;
    if (!n) { for (var i = 1; i <= LEVELS.length; i++) if (prog.done.indexOf(i) < 0) { n = i; break; } }
    if (!n) n = 1;
    n = Math.min(Math.max(n, 1), LEVELS.length);
    if (!unlocked(n)) { askedFor = n; n = 1; }
    return LEVELS[n - 1];
  }
  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    if (alongTimer) { clearInterval(alongTimer); alongTimer = null; }
    playing = false;
  }
  function notes() { return (L.seq || []).filter(function (s) { return !s.bar; }); }
  function noteAt(i) { return notes()[i]; }

  /* ── drawing ───────────────────────────────────────────────────────────── */
  function starsHTML(n) {
    var got = prog.stars[n] || 0, out = '';
    for (var i = 1; i <= 3; i++) out += i <= got ? '★' : '<i>★</i>';
    return out;
  }
  function stripHTML() {
    if (L.mode === 'compose') {
      if (!mine.length) return '<span style="color:var(--ink2);font-size:17px">Press ● Record, then play anything you like.</span>';
      return mine.map(function (m, i) {
        return '<span class="nb' + (i < 99 ? ' done' : '') + '">' + NAME[m.k] + '</span>';
      }).join('');
    }
    var i = -1;
    return L.seq.map(function (s) {
      if (s.bar) return '<span class="nb bar" aria-hidden="true"></span>';
      i++;
      var cls = i < idx ? ' done' : (i === idx ? ' next' : '');
      return '<span class="nb' + cls + ((s.d || 1) >= 2 ? ' long' : '') + '">' + NAME[s.k] + '</span>';
    }).join('');
  }
  function keyboardHTML() {
    var ks = L.keys, blacks = ks.length > 5 ? [0, 1, 3, 4, 5] : [0, 1, 3];
    var h = '<div class="kb" id="kb">';
    ks.forEach(function (k) {
      h += '<button class="wk" data-k="' + k + '" aria-label="Note ' + NAME[k] + '">' + NAME[k] + '</button>';
    });
    h += '<div class="bks" aria-hidden="true">';
    blacks.forEach(function (i) {
      h += '<button class="bk" data-seam="' + i + '" tabindex="-1"></button>';
    });
    return h + '</div></div>';
  }
  function controlsHTML() {
    if (L.mode === 'compose') {
      return '<div class="controls">' +
        '<button class="gbtn" style="--c:' + (recording ? '#E06098' : 'var(--t2)') + '" data-a="rec">' +
          (recording ? '■ Stop' : '● Record') + '</button>' +
        '<button class="gbtn" style="--c:var(--t1)" data-a="hear"' + (mine.length ? '' : ' disabled') + '>▶ Play mine</button>' +
        '<button class="gbtn" style="--c:var(--t3)" data-a="keep"' + (mine.length ? '' : ' disabled') + '>Keep it</button>' +
        '<button class="gbtn" style="--c:var(--t6)" data-a="clear"' + (mine.length ? '' : ' disabled') + '>Clear</button>' +
        '</div>' + tunesHTML();
    }
    return '<div class="controls">' +
      (L.mode === 'find' ? '' : '<button class="gbtn" style="--c:var(--t7)" data-a="listen">🔊 Listen</button>') +
      (L.mode === 'along'
        ? '<button class="gbtn" style="--c:var(--t1)" data-a="start">▶ Play along</button>'
        : '<button class="gbtn" style="--c:var(--t1)" data-a="restart">↺ Start again</button>') +
      '<button class="gbtn" style="--c:var(--t6)" data-a="grownups">For grown-ups</button>' +
      '</div>';
  }
  function tunesHTML() {
    if (!prog.tunes.length) return '';
    return '<div class="mine">' + prog.tunes.map(function (t, i) {
      return '<button data-a="hearsaved" data-i="' + i + '">♪ ' + (t.name || ('Tune ' + (i + 1))) + '</button>';
    }).join('') + '</div>';
  }
  function render() {
    var pct = L.mode === 'compose' ? 0 : Math.round(idx / Math.max(notes().length, 1) * 100);
    $('#game').innerHTML =
      '<div class="topbar"><div class="lvlpick">' +
        LEVELS.map(function (x) {
          var ok = unlocked(x.n), st = prog.stars[x.n] || 0;
          return '<button class="lp' + (ok ? '' : ' locked') + '" data-lvl="' + x.n + '" ' +
            'aria-current="' + (x.n === L.n) + '" style="--c:' + TAPES[(x.n - 1) % TAPES.length] + '" ' +
            'aria-label="Level ' + x.n + (ok ? '' : ' — locked') + '">' + (ok ? x.n : '🔒') +
            (st ? '<small>' + '★'.repeat(st) + '</small>' : '') + '</button>';
        }).join('') +
      '</div><span class="stars" aria-label="stars earned on this level">' + starsHTML(L.n) + '</span></div>' +

      '<div class="coach" id="coach"><span class="dyno" aria-hidden="true"></span>' +
        '<div class="says" id="says" role="status" aria-live="polite"><b>' + L.name + '</b><span>' + L.brief + '</span></div></div>' +

      '<div class="strip" id="strip">' + stripHTML() + '</div>' +
      '<div class="kbwrap">' + keyboardHTML() + '</div>' +
      controlsHTML() +
      (pct >= 100 ? winHTML() : '');
    placeBlacks();
    requestAnimationFrame(placeBlacks);
    if (L.mode !== 'compose' && L.mode !== 'along') hint();
  }
  function winHTML() {
    var next = LEVELS[L.n], st = prog.stars[L.n] || 0;
    return '<div class="win"><b>' + (st === 3 ? 'Perfect! ' : 'You did it! ') + '★'.repeat(st) + '</b>' +
      '<div class="controls">' +
      (next ? '<button class="gbtn" style="--c:var(--t3)" data-lvl="' + next.n + '">Level ' + next.n + ': ' + next.name + ' →</button>' : '') +
      '<button class="gbtn" style="--c:var(--t1)" data-a="restart">↺ Play it again</button>' +
      '<a class="gbtn" style="--c:var(--t6)" href="/kids-adventure/piano">Back to my journey</a>' +
      '</div></div>';
  }
  function say(title, line, mood) {
    var s = $('#says'); if (!s) return;
    s.innerHTML = '<b>' + title + '</b><span>' + (line || '') + '</span>';
    var c = $('#coach'); if (!c || !mood) return;
    c.classList.remove('yes', 'no'); void c.offsetWidth; c.classList.add(mood);
  }
  function keyEl(k) { return $('.wk[data-k="' + k + '"]'); }
  function hint() {
    $$('.wk').forEach(function (el) { el.classList.remove('hint'); });
    if (L.mode === 'compose' || playing) return;
    var n = noteAt(idx); if (!n) return;
    var el = keyEl(n.k); if (el) el.classList.add('hint');
    if (L.mode === 'find') say('Can you find ' + NAME[n.k] + '?', 'It is the glowing one — press it.');
  }
  function paintStrip() { var s = $('#strip'); if (s) s.innerHTML = stripHTML(); }
  /* The white keys are centred and capped in width, so the seam a black key
     sits on is only knowable after layout. */
  function placeBlacks() {
    var kb = $('#kb'); if (!kb) return;
    var ws = $$('.wk'), kbb = kb.getBoundingClientRect();
    $$('.bk').forEach(function (bk) {
      var i = +bk.dataset.seam, a = ws[i], b = ws[i + 1];
      if (!a || !b) { bk.style.display = 'none'; return; }
      var ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      bk.style.display = 'block';
      bk.style.left = ((ar.right + br.left) / 2 - kbb.left - bk.offsetWidth / 2) + 'px';
    });
  }

  /* ── playing the tune for the child ────────────────────────────────────── */
  function listen() {
    clearTimers(); playing = true;
    $$('.wk').forEach(function (el) { el.classList.remove('hint'); });
    say('Listen first 🎧', 'Watch which keys light up.');
    var t = 0, beat = 60 / (L.bpm || 92);
    notes().forEach(function (n) {
      var el = keyEl(n.k), when = t;
      piano(FREQ[n.k], when, Math.max(0.5, (n.d || 1) * beat * 0.95), 0.2);
      timers.push(setTimeout(function () {
        if (el) { el.classList.add('down'); setTimeout(function () { el.classList.remove('down'); }, 160); }
      }, when * 1000));
      t += (n.d || 1) * beat;
    });
    timers.push(setTimeout(function () {
      playing = false;
      say('Your turn!', L.mode === 'along' ? 'Press ▶ Play along when you are ready.' : 'Follow the glowing key.');
      hint();
    }, t * 1000 + 260));
  }

  /* ── level 3: the beat keeps moving whether you do or not ──────────────── */
  function startAlong() {
    clearTimers(); idx = 0; wrong = 0; paintStrip();
    var beat = 60 / (L.bpm || 72), seq = notes(), i = 0, hit = false, started = Date.now() + 4 * beat * 1000;
    say('Four ticks, then play', 'Press the key as its light comes up.');
    for (var c = 0; c < 4; c++) timers.push(setTimeout(function (n) { return function () { tick(n === 0); }; }(c), c * beat * 1000));
    function step() {
      if (!hit && i > 0) { wrong++; oops(); say('Missed that one', 'Keep going — the beat waits for nobody!', 'no'); }
      if (i >= seq.length) {
        clearInterval(alongTimer); alongTimer = null;
        finish(); return;
      }
      hit = false; idx = i;
      $$('.wk').forEach(function (el) { el.classList.remove('hint'); });
      var el = keyEl(seq[i].k); if (el) el.classList.add('hint');
      paintStrip(); tick(i % 4 === 0);
      alongDue = Date.now();
      i++;
    }
    timers.push(setTimeout(function () {
      step();
      alongTimer = setInterval(step, beat * 1000 * 1.35);
    }, 4 * beat * 1000));
    window.__alongHit = function () { hit = true; };
  }

  /* ── a key was pressed ─────────────────────────────────────────────────── */
  function press(k, el) {
    piano(FREQ[k]);
    if (el) { el.classList.add('down'); setTimeout(function () { el.classList.remove('down'); }, 130); }

    if (L.mode === 'compose') {
      if (recording) {
        mine.push({ k: k, t: Date.now() - recStart });
        if (mine.length > 32) { recording = false; toast('That is a long tune — stopping there!'); render(); }
        else paintStrip();
      }
      return;
    }
    if (playing) return;

    var want = noteAt(idx);
    if (!want) return;

    if (k === want.k) {
      if (L.mode === 'along') {
        if (window.__alongHit) window.__alongHit();
        sparkAt(el, '♪', '#3880C0');
        say('In time!', 'Keep the beat going.', 'yes');
        if (el) { el.classList.add('good'); setTimeout(function () { el.classList.remove('good'); }, 220); }
        return;
      }
      idx++;
      if (el) { el.classList.add('good'); setTimeout(function () { el.classList.remove('good'); }, 200); }
      sparkAt(el, '♪', '#509858');
      paintStrip();
      if (idx >= notes().length) { finish(); return; }
      say(L.mode === 'find' ? 'That is ' + NAME[k] + '! 🎉' : 'Yes!', L.mode === 'find' ? 'One more friend to meet.' : 'Next note…', 'yes');
      hint();
    } else {
      wrong++;
      oops();
      if (el) { el.classList.add('bad'); setTimeout(function () { el.classList.remove('bad'); }, 260); }
      say('Not that one', 'The glowing key is ' + NAME[want.k] + ' — try again. Wrong notes are allowed!', 'no');
      hint();
    }
  }

  function finish() {
    clearTimers();
    var st = wrong === 0 ? 3 : (wrong <= 3 ? 2 : 1);
    if ((prog.stars[L.n] || 0) < st) prog.stars[L.n] = st;
    if (prog.done.indexOf(L.n) < 0) prog.done.push(L.n);
    saveProg();
    idx = notes().length;
    fanfare(); confetti();
    render();
    say(st === 3 ? 'Perfect — not one wrong note!' : 'You played the whole thing!',
        st === 3 ? 'Three stars. Dyno is speechless.' : 'Play it again for more stars.', 'yes');
    toast('Level ' + L.n + ' complete ' + '★'.repeat(st));
  }

  function grownups() {
    var m = document.createElement('div');
    m.className = 'md';
    m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' +
      '<h3>Sitting with your child</h3>' +
      '<ol class="isteps">' +
      '<li>Put one finger of their right hand on the glowing key. That key is C — the rest are its neighbours.</li>' +
      '<li>Press 🔊 Listen together first, so they hear the tune before they hunt for it.</li>' +
      '<li>Let them press wrong keys. Nothing is lost, nothing beeps angrily, and the glow stays until they find it.</li>' +
      '<li>One level a sitting is plenty. Stars are for coming back, not for finishing fast.</li>' +
      '<li>On a real piano, C is the white key just left of the two black keys. Same song, same fingers.</li>' +
      '</ol>' +
      '<div class="acts"><div class="grow"><button class="ghost" data-a="x">Got it</button></div></div></div>';
    m.addEventListener('click', function (e) {
      if (e.target === m || (e.target.dataset && e.target.dataset.a === 'x')) m.remove();
    });
    document.body.appendChild(m);
  }

  function keepTune() {
    var name = prompt('Name your tune', 'My tune ' + (prog.tunes.length + 1));
    if (name === null) return;
    prog.tunes.push({ name: (name || '').slice(0, 24) || ('Tune ' + (prog.tunes.length + 1)), notes: mine.slice() });
    if (prog.stars[5] < 3 || !prog.stars[5]) prog.stars[5] = 3;
    if (prog.done.indexOf(5) < 0) prog.done.push(5);
    saveProg(); chime(); confetti(); toast('Kept! Dyno will hum it all day.');
    render();
  }
  function hearTune(list) {
    clearTimers(); playing = true;
    var t0 = list.length ? list[0].t : 0;
    list.forEach(function (m) {
      var when = Math.max(0, (m.t - t0) / 1000);
      piano(FREQ[m.k], when, 0.9, 0.21);
      var el = keyEl(m.k);
      timers.push(setTimeout(function () {
        if (el) { el.classList.add('down'); setTimeout(function () { el.classList.remove('down'); }, 150); }
      }, when * 1000));
    });
    var end = list.length ? (list[list.length - 1].t - t0) / 1000 + 1 : 0.6;
    timers.push(setTimeout(function () { playing = false; }, end * 1000));
  }

  function go(n) {
    if (!unlocked(n)) { toast('Finish level ' + (n - 1) + ' first 🙂'); return; }
    clearTimers();
    L = LEVELS[n - 1]; idx = 0; wrong = 0; mine = []; recording = false;
    history.replaceState({}, '', '?level=' + n);
    render();
  }

  /* ── input ─────────────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var wk = e.target.closest('.wk');
    if (wk) { press(wk.dataset.k, wk); return; }
    if (e.target.closest('.bk')) { blip(233, 0, 0.3, 0.1, 'triangle'); return; }

    var lvl = e.target.closest('[data-lvl]');
    if (lvl) { go(+lvl.dataset.lvl); return; }

    var a = (e.target.closest('[data-a]') || {}).dataset;
    if (!a) return;
    if (a.a === 'listen')  listen();
    if (a.a === 'restart') { clearTimers(); idx = 0; wrong = 0; render(); say('From the top', 'Follow the glowing key.'); }
    if (a.a === 'start')   startAlong();
    if (a.a === 'grownups') grownups();
    if (a.a === 'rec') {
      recording = !recording;
      if (recording) { mine = []; recStart = Date.now(); say('Recording 🔴', 'Play anything — I am listening.'); }
      else say('Stopped', mine.length ? 'Press ▶ Play mine to hear it.' : 'Nothing recorded yet — try again.');
      render();
    }
    if (a.a === 'hear')  hearTune(mine);
    if (a.a === 'keep')  keepTune();
    if (a.a === 'clear') { mine = []; render(); }
    if (a.a === 'hearsaved') hearTune(prog.tunes[+a.i].notes || []);
  });

  /* A real keyboard plays too: C D E F G A B, or the digits 1–8. */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = null, ch = e.key.toLowerCase();
    if ('cdefgab'.indexOf(ch) >= 0) k = ch.toUpperCase();
    if (ch >= '1' && ch <= '8') k = L.keys[+ch - 1];
    if (ch === 'escape') { var md = document.querySelector('.md'); if (md) md.remove(); }
    if (!k || L.keys.indexOf(k) < 0) {
      if (k === 'C' && L.keys.indexOf('C2') >= 0) k = 'C';
      else return;
    }
    e.preventDefault();
    press(k, keyEl(k));
  });

  var rz;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(placeBlacks, 140); });

  var mb = $('#mute');
  function paintMute() {
    mb.textContent = muted ? '🔇 Sounds off' : '🔊 Sounds on';
    mb.setAttribute('aria-pressed', muted ? 'true' : 'false');
  }
  mb.addEventListener('click', function () {
    muted = !muted;
    try { localStorage.setItem('kja:muted', muted ? '1' : '0'); } catch (e) {}
    paintMute(); if (!muted) piano(523.25, 0, 0.5, 0.18);
  });
  paintMute();

  window.__piano = { prog: function () { return prog; }, press: press, level: function () { return L.n; } };
  go(levelFromUrl().n);
  if (askedFor) {
    toast('Level ' + askedFor + ' opens once level ' + (askedFor - 1) + ' is done — starting here instead');
    say('Level ' + askedFor + ' is still closed', 'Finish level ' + (askedFor - 1) + ' and it opens by itself.');
  }
})();
