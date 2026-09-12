/* ════════════════════════════════════════════════════════════════════════════
   DYNO'S SONG ADVENTURE — a first-piano game for children.

   Two halves that share one keyboard:

   LEVELS  five steps that teach the basics — find the keys, learn Hot Cross
           Buns note by note, play it against a beat, learn Mary Had a Little
           Lamb, then compose.
   SONGS   the studio's own three pieces, carried over note for note with
           their hands, fingers, beats and lyrics: Dyno My Pet Dinosaur, The
           Clock Song and Yankee Doodle. Each can be learned a part at a time,
           heard a part at a time, or heard as a whole piece — and while it
           plays, the note sounding is highlighted and the score scrolls
           itself to keep it in view.

   No samples and no libraries: the piano is three oscillator partials with a
   soft decay. Nothing about a child leaves the device — progress lives in
   localStorage under kja:piano, shared with the journey screen.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var $  = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var TAPES  = ['#3880C0','#E06098','#509858','#F89030','#A070C0','#50A8B0','#F0B828'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ── theory, in the numbering the studio's own lesson plan uses ──────────
     Key 15 is middle C, so key numbers and note letters are the same fact
     said two ways: 11=F3 … 15=C4 … 19=G4 … 22=C5. Every song and every
     level below is written in key numbers, and the keyboard labels them
     either way depending on the song's own labelStyle. */
  var LETTERS = 'CDEFGAB';
  var SEMI = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  var BLACKAFTER = ['C','D','F','G','A'];
  function letterOf(k) { return LETTERS[(k - 1) % 7]; }
  function semiOf(k) { return 12 * Math.floor((k - 1) / 7) + SEMI[letterOf(k)]; }
  function freqOf(k) { return 261.6256 * Math.pow(2, (semiOf(k) - semiOf(15)) / 12); }
  function blackAfter(k) { return BLACKAFTER.indexOf(letterOf(k)) >= 0; }

  var HANDWORD = { L:'Left hand', R:'Right hand' };
  var FINGERWORD = { 1:'Thumb', 2:'Pointer', 3:'Middle', 4:'Ring', 5:'Little' };

  /* ── the songbook, carried over note for note from the studio's app ───── */
  var SONGS = {
    dyno: {
      id:'dyno', icon:'🦖', title:'Dyno My Pet Dinosaur', sub:'Two hands · four measures',
      unitWord:'Measure', labelStyle:'number', keys:[11,12,13,14,15,16,17,18,19], bpm:92,
      setup:'Left hand: little finger on 11, thumb on 15. Right hand: thumb on 15, little finger on 19.',
      units:[
        { m:1, hand:'L', name:'First four notes', notes:[
          {k:15,f:1,b:1},{k:14,f:2,b:1},{k:13,f:3,b:1},{k:14,f:2,b:1}] },
        { m:2, hand:'R', name:'Up and slide', notes:[
          {k:15,f:1,b:1},{k:16,f:2,b:1},{k:17,f:3,b:1,slide:1}] },
        { m:3, hand:'L', name:'The same as measure 1', notes:[
          {k:15,f:1,b:1},{k:14,f:2,b:1},{k:13,f:3,b:1},{k:14,f:2,b:1}] },
        { m:4, hand:'R', name:'One note, three slides', notes:[
          {k:13,f:3,b:2,slide:3}] }
      ]
    },
    clock: {
      id:'clock', icon:'🕰️', title:'The Clock Song', sub:'Right hand · all seven parts · C, E and G',
      unitWord:'Part', labelStyle:'note', keys:[15,16,17,18,19], bpm:80,
      setup:'Right hand: thumb on C, then D E F G — one finger on each. The song only uses C, E and G.',
      units:[
        { m:1, hand:'R', name:'Grandfather’s clock', pace:'Slow', line:'Grand-fa-ther’s clock goes', notes:[
          {k:15,f:1,b:1,l:'Grand'},{k:15,f:1,b:.5,l:'fa'},{k:15,f:1,b:.5,l:'ther’s'},
          {k:15,f:1,b:1,l:'clock'},{k:15,f:1,b:1,l:'goes'}] },
        { m:2, hand:'R', name:'Tick tock, tick tock', pace:'Slow · two beats each', line:'Tick tock, tick tock, tick tock', notes:[
          {k:17,f:3,b:2,l:'Tick'},{k:15,f:1,b:2,l:'tock'},{k:17,f:3,b:2,l:'tick'},
          {k:15,f:1,b:2,l:'tock'},{k:17,f:3,b:2,l:'tick'},{k:15,f:1,b:2,l:'tock'}] },
        { m:3, hand:'R', name:'Mummy’s kitchen clock', pace:'Medium', line:'Mu-mmy’s ki-tchen clock goes', notes:[
          {k:17,f:3,b:.5,l:'Mu'},{k:17,f:3,b:.5,l:'mmy’s'},{k:17,f:3,b:.5,l:'ki'},
          {k:17,f:3,b:.5,l:'tchen'},{k:17,f:3,b:1,l:'clock'},{k:17,f:3,b:1,l:'goes'}] },
        { m:4, hand:'R', name:'Tick tock tick tock', pace:'Medium · one beat each', line:'Tick tock tick tock, tick tock tick tock', notes:[
          {k:19,f:5,b:1,l:'Tick'},{k:17,f:3,b:1,l:'tock'},{k:19,f:5,b:1,l:'tick'},{k:17,f:3,b:1,l:'tock'},
          {k:19,f:5,b:1,l:'tick'},{k:17,f:3,b:1,l:'tock'},{k:19,f:5,b:1,l:'tick'},{k:17,f:3,b:1,l:'tock'}] },
        { m:5, hand:'R', name:'My little watch', pace:'Fast', line:'My lit-tle watch goes', notes:[
          {k:15,f:1,b:1,l:'My'},{k:15,f:1,b:.5,l:'lit'},{k:15,f:1,b:.5,l:'tle'},
          {k:15,f:1,b:1,l:'watch'},{k:15,f:1,b:1,l:'goes'}] },
        { m:6, hand:'R', name:'Tick tick tick tick', pace:'Fast · half a beat each', line:'Tick tick tick tick, tick tick tick tick', notes:[
          {k:17,f:3,b:.5,l:'Tick'},{k:15,f:1,b:.5,l:'tick'},{k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'},
          {k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'},{k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'}] },
        { m:7, hand:'R', name:'…and STOP!', pace:'Fast, then hold', line:'tick tick tick tick, tick tick tick tick — STOP!', notes:[
          {k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'},{k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'},
          {k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'},{k:17,f:3,b:.5,l:'tick'},{k:15,f:1,b:.5,l:'tick'},
          {k:15,f:1,b:4,l:'STOP!'}] }
      ]
    },
    yankee: {
      id:'yankee', icon:'🎩', title:'Yankee Doodle', sub:'Right hand · four rows · C, D, E and F',
      unitWord:'Row', labelStyle:'note', keys:[15,16,17,18,19], bpm:104,
      setup:'Right hand: thumb on C, then D, E and F — no little finger needed for this tune.',
      units:[
        { m:1, hand:'R', name:'Row 1', pace:'Cheerfully', notes:[
          {k:15,f:1,b:1},{k:15,f:1,b:1},{k:16,f:2,b:1},{k:17,f:3,b:1},
          {k:15,f:1,b:1},{k:17,f:3,b:1},{k:16,f:2,b:2}] },
        { m:2, hand:'R', name:'Row 2', pace:'Cheerfully', notes:[
          {k:15,f:1,b:1},{k:15,f:1,b:1},{k:16,f:2,b:1},{k:17,f:3,b:1},
          {k:15,f:1,b:2},{k:15,f:2,b:1},{k:15,f:4,b:1}] },
        { m:3, hand:'R', name:'Row 3', pace:'Cheerfully', notes:[
          {k:15,f:1,b:1},{k:15,f:1,b:1},{k:16,f:2,b:1},{k:17,f:3,b:1},
          {k:18,f:4,b:1},{k:17,f:3,b:1},{k:16,f:2,b:1},{k:15,f:1,b:1}] },
        { m:4, hand:'R', name:'Row 4', pace:'A whole bar of rest, then hold', notes:[
          {k:15,f:1,b:2,rest:4},{k:15,f:1,b:2}] }
      ]
    }
  };

  /* ── the five levels, written in the same key numbers ─────────────────── */
  var LEVELS = [
    { n:1, name:'Meet the Keys', keys:[15,16,17,18,19], mode:'find',
      brief:'Five white keys, five friends. Find each one and say hello.',
      seq:[{k:15},{k:16},{k:17},{k:18},{k:19},{k:15},{k:17},{k:19}] },
    { n:2, name:'Hot Cross Buns', keys:[15,16,17,18,19], mode:'learn',
      brief:'Your first whole song — three notes only: E, D and C.',
      seq:[{k:17,b:1},{k:16,b:1},{k:15,b:2},{bar:1},
           {k:17,b:1},{k:16,b:1},{k:15,b:2},{bar:1},
           {k:15,b:.5},{k:15,b:.5},{k:15,b:.5},{k:15,b:.5},
           {k:16,b:.5},{k:16,b:.5},{k:16,b:.5},{k:16,b:.5},{bar:1},
           {k:17,b:1},{k:16,b:1},{k:15,b:2}] },
    { n:3, name:'Rhythm & Timing', keys:[15,16,17,18,19], mode:'along', bpm:72,
      brief:'Now with a beat. Press each key as its light comes up.',
      seq:[{k:17,b:1},{k:16,b:1},{k:15,b:2},{bar:1},
           {k:17,b:1},{k:16,b:1},{k:15,b:2},{bar:1},
           {k:17,b:1},{k:16,b:1},{k:15,b:2}] },
    { n:4, name:'Mary Had a Little Lamb', keys:[15,16,17,18,19], mode:'learn',
      brief:'A longer one. Four notes now: E, D, C and G.',
      seq:[{k:17,b:1},{k:16,b:1},{k:15,b:1},{k:16,b:1},
           {k:17,b:1},{k:17,b:1},{k:17,b:2},{bar:1},
           {k:16,b:1},{k:16,b:1},{k:16,b:2},
           {k:17,b:1},{k:19,b:1},{k:19,b:2},{bar:1},
           {k:17,b:1},{k:16,b:1},{k:15,b:1},{k:16,b:1},
           {k:17,b:1},{k:17,b:1},{k:17,b:1},{k:17,b:1},
           {k:16,b:1},{k:16,b:1},{k:17,b:1},{k:16,b:1},{k:15,b:3}] },
    { n:5, name:'Your Own Melody', keys:[15,16,17,18,19,20,21,22], mode:'compose',
      brief:'Eight keys, no rules. Play something nobody has played before.' }
  ];

  /* ── sound: the shared engine (kit/sound.js) does the synthesis now, so a
        note here sounds exactly like a note anywhere else in the adventure ── */
  var SND = (window.KJA && window.KJA.sound) || null;
  var JUICE = (window.KJA && window.KJA.juice) || null;
  function muted() { return SND ? SND.isMuted() : true; }
  function piano(freq, when, dur, vol) { if (SND) SND.piano(freq, when, dur, vol); }
  function oops()  { if (SND) { SND.sfx.wrong(); SND.haptic(26); } }
  function tick(strong) { if (SND) SND.sfx.tick(strong); }
  function chime() { if (SND) SND.sfx.good(); }
  function fanfare() { if (SND) SND.sfx.win(); }
  function blip(f, when, dur, vol, type) { if (SND) SND.osc({ f: f, when: when, dur: dur, vol: vol, type: type }); }

  /* ── progress, shared with Piano World's trail ─────────────────────────── */
  var prog = { done: [], stars: {}, tunes: [], songs: {} };
  try {
    var raw = JSON.parse(localStorage.getItem('kja:piano') || 'null');
    if (Array.isArray(raw)) prog.done = raw;                      /* older format */
    else if (raw && typeof raw === 'object') {
      prog = { done: raw.done || [], stars: raw.stars || {}, tunes: raw.tunes || [], songs: raw.songs || {} };
    }
  } catch (e) {}
  function saveProg() { try { localStorage.setItem('kja:piano', JSON.stringify(prog)); } catch (e) {} }
  function unlocked(n) { return n === 1 || prog.done.indexOf(n - 1) >= 0 || prog.done.indexOf(n) >= 0; }
  function songProg(id) {
    if (!prog.songs[id]) prog.songs[id] = { parts: [], done: false };
    return prog.songs[id];
  }

  /* ── small effects ─────────────────────────────────────────────────────── */
  function toast(t) {
    var el = $('#toast'); el.textContent = t; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }
  function confetti(n) { if (JUICE) JUICE.confetti(n); }
  function sparkAt(el, glyph, colour) { if (JUICE) JUICE.sparkle(el, glyph, colour); }
  /* A run of right notes climbs a scale — the sound of getting better. */
  function goodNote(el) {
    if (JUICE) { JUICE.hit(el); JUICE.burstAt(el, 8); }
  }

  /* ── where we are ──────────────────────────────────────────────────────── */
  var V = { kind:'level', n:1, song:null, part:1 };
  var L = LEVELS[0], S = null, U = null;
  var idx = 0, wrong = 0, playing = false, timers = [], rafId = null;
  var recording = false, mine = [], recStart = 0, alongTimer = null, askedFor = 0;

  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    if (alongTimer) { clearInterval(alongTimer); alongTimer = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    playing = false;
    $$('.nb.playing').forEach(function (n) { n.classList.remove('playing'); });
  }

  /* ── the keyboard, shared by levels and songs ──────────────────────────── */
  function keyLabel(k) {
    if (V.kind === 'song' && S.labelStyle === 'number') return String(k);
    return letterOf(k);
  }
  function keys() { return V.kind === 'song' ? S.keys : L.keys; }
  function keyEl(k) { return $('.wk[data-k="' + k + '"]'); }
  function keyboardHTML() {
    var ks = keys(), h = '<div class="kb" id="kb">';
    ks.forEach(function (k) {
      h += '<button class="wk" data-k="' + k + '" aria-label="Key ' + k + ', note ' + letterOf(k) + '">' +
           keyLabel(k) + '</button>';
    });
    h += '<div class="bks" aria-hidden="true">';
    ks.forEach(function (k, i) {
      if (i < ks.length - 1 && blackAfter(k)) h += '<button class="bk" data-seam="' + i + '" tabindex="-1"></button>';
    });
    return h + '</div></div>';
  }
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

  /* ── playback with a moving highlight ───────────────────────────────────
     One scheduler for "hear this part", "hear the whole piece" and a level's
     Listen. Audio is scheduled on the AudioContext clock (so the tune never
     drifts), while a rAF loop moves the highlight and nudges the score
     sideways so the note sounding stays in view. */
  function playNotes(list, bpm, opts) {
    opts = opts || {};
    clearTimers(); playing = true;
    var beat = 60 / (bpm || 92), a = SND && SND.ctx(), t0 = (a ? a.currentTime : 0) + 0.12, at = 0, sched = [];
    list.forEach(function (n) {
      at += (n.rest || 0) * beat;
      var dur = Math.max(0.28, (n.b || 1) * beat * 0.96);
      piano(freqOf(n.k), t0 - (a ? a.currentTime : 0) + at, dur, 0.21);
      sched.push({ at: at, k: n.k, i: n.i, dur: dur });
      at += (n.b || 1) * beat;
    });
    var total = at + 0.4, cur = -1;
    render_controls(true);
    function frame() {
      var now = (a ? a.currentTime : t0) - t0;
      var i = -1;
      for (var j = 0; j < sched.length; j++) if (now >= sched[j].at - 0.02) i = j;
      if (i !== cur && i >= 0) {
        cur = i;
        highlight(sched[i].i, sched[i].k);
      }
      if (now < total && playing) rafId = requestAnimationFrame(frame);
      else {
        playing = false; rafId = null;
        $$('.nb.playing').forEach(function (n) { n.classList.remove('playing'); });
        render_controls(false);
        if (opts.then) opts.then();
      }
    }
    rafId = requestAnimationFrame(frame);
  }
  /* Light the bubble, tap the key, keep both on screen. */
  function highlight(i, k) {
    $$('.nb.playing').forEach(function (n) { n.classList.remove('playing'); });
    var nb = i != null ? $('.nb[data-i="' + i + '"]') : null;
    if (nb) {
      nb.classList.add('playing');
      var strip = nb.closest('.score, .strip');
      if (strip && strip.scrollWidth > strip.clientWidth + 4) {
        /* Measured from the scroller's own box: a bubble's offsetLeft is
           relative to whatever happens to be positioned above it, which is
           not the scroller, so rects are the only reliable frame here. */
        var sr = strip.getBoundingClientRect(), nr = nb.getBoundingClientRect();
        var want = strip.scrollLeft + (nr.left - sr.left) - strip.clientWidth / 2 + nr.width / 2;
        want = Math.max(0, Math.min(want, strip.scrollWidth - strip.clientWidth));
        if (Math.abs(want - strip.scrollLeft) > 8) {
          strip.scrollTo ? strip.scrollTo({ left: want, behavior: reduce ? 'auto' : 'smooth' })
                         : (strip.scrollLeft = want);
        }
      }
    }
    var el = keyEl(k);
    if (el) { el.classList.add('down'); setTimeout(function () { el.classList.remove('down'); }, 170); }
  }
  function stopPlay() {
    clearTimers();
    render_controls(false);
    say('Stopped', 'Press play whenever you are ready.');
  }
  /* Only the play/stop row changes while a piece runs, so it is redrawn alone
     rather than re-rendering (and scroll-resetting) the whole score. */
  function render_controls(isPlaying) {
    var box = $('#controls'); if (!box) return;
    box.innerHTML = (V.kind === 'song' ? songControls(isPlaying) : levelControls(isPlaying));
  }

  /* ── a song ────────────────────────────────────────────────────────────── */
  function unit() { return S.units[Math.min(V.part, S.units.length) - 1]; }
  function unitNotes(u) { return u.notes; }
  function wholeNotes() {
    var out = [], i = 0;
    S.units.forEach(function (u) {
      u.notes.forEach(function (n) {
        out.push({ k:n.k, b:n.b, rest:n.rest, i:i++ });
      });
    });
    return out;
  }
  function partIndexBase(p) {                      /* first bubble index of a part */
    var i = 0;
    for (var j = 0; j < p - 1; j++) i += S.units[j].notes.length;
    return i;
  }
  function scoreHTML() {
    var i = 0, sp = songProg(S.id);
    return '<div class="score" id="score">' + S.units.map(function (u, ui) {
      var learned = sp.parts.indexOf(u.m) >= 0, here = (ui + 1) === V.part;
      var body = u.notes.map(function (n) {
        var me = i, isNext = here && (me - partIndexBase(V.part)) === idx && !playing;
        i++;
        return '<span class="nb' + (isNext ? ' next' : '') + ((n.b || 1) >= 2 ? ' long' : '') +
          '" data-i="' + me + '">' + letterOf(n.k) +
          (n.l ? '<small>' + n.l + '</small>' : '') + '</span>';
      }).join('');
      return '<div class="bars' + (here ? ' current' : '') + '">' +
        '<span class="barlbl" style="--c:' + TAPES[ui % TAPES.length] + '">' +
          S.unitWord + ' ' + u.m + (learned ? ' ✓' : '') + '</span>' +
        '<div class="barnotes">' + body + '</div>' +
        (u.line ? '<span class="lyricline">' + u.line + '</span>' : '') +
      '</div>';
    }).join('<span class="barsep" aria-hidden="true"></span>') + '</div>';
  }
  function songControls(isPlaying) {
    if (isPlaying) return '<button class="gbtn" style="--c:#E06098" data-a="stop">■ Stop</button>';
    return '<button class="gbtn" style="--c:var(--t7)" data-a="hearpart">▶ Hear this ' + S.unitWord.toLowerCase() + '</button>' +
      '<button class="gbtn" style="--c:var(--t1)" data-a="hearall">▶▶ Hear the whole piece</button>' +
      '<button class="gbtn" style="--c:var(--t6)" data-a="restart">↺ Start again</button>' +
      '<button class="gbtn" style="--c:var(--t5)" data-a="grownups">For grown-ups</button>';
  }
  function songSays() {
    var u = unit(), n = unitNotes(u)[idx];
    if (!n) return { t:'That ' + S.unitWord.toLowerCase() + ' is done! 🎉', s:'Pick the next one, or hear the whole piece.' };
    return {
      t: (u.hand ? HANDWORD[u.hand] + ' · ' : '') + (n.f ? FINGERWORD[n.f] + ' · ' : '') +
         (S.labelStyle === 'number' ? 'Key ' + n.k : letterOf(n.k)),
      s: (n.l ? '“' + n.l + '” — ' : '') + 'press the glowing key' + (n.slide ? ' and slide ' + n.slide + ' along' : '')
    };
  }
  function renderSong() {
    var sp = songProg(S.id), u = unit();
    $('#game').innerHTML =
      '<div class="topbar"><div class="lvlpick">' +
        '<a class="lp" style="--c:var(--t6)" href="?level=1" aria-label="Back to the levels">1–5</a>' +
        Object.keys(SONGS).map(function (id) {
          var s = SONGS[id], d = (prog.songs[id] || {}).done;
          return '<button class="lp wide' + (id === S.id ? '' : '') + '" data-song="' + id + '" ' +
            'aria-current="' + (id === S.id) + '" style="--c:' + TAPES[Object.keys(SONGS).indexOf(id) + 3] + '">' +
            s.icon + (d ? '<small>★★★</small>' : '') + '</button>';
        }).join('') +
      '</div><span class="stars">' + (sp.done ? '★★★' : '☆☆☆') + '</span></div>' +

      '<div class="songhead"><b>' + S.icon + ' ' + S.title + '</b><span>' + S.sub + '</span>' +
        '<span class="setup">' + S.setup + '</span></div>' +

      '<div class="coach" id="coach"><span class="dyno" aria-hidden="true"></span>' +
        '<div class="says" id="says" role="status" aria-live="polite"></div></div>' +

      '<div class="parts">' + S.units.map(function (x, j) {
        return '<button class="part' + (j + 1 === V.part ? ' on' : '') + (sp.parts.indexOf(x.m) >= 0 ? ' done' : '') +
          '" data-part="' + (j + 1) + '" style="--c:' + TAPES[j % TAPES.length] + '">' +
          S.unitWord + ' ' + x.m + '<small>' + x.name + '</small></button>';
      }).join('') + '</div>' +

      scoreHTML() +
      '<div class="kbwrap">' + keyboardHTML() + '</div>' +
      '<div class="controls" id="controls">' + songControls(false) + '</div>';
    var s = songSays(); say(s.t, s.s);
    placeBlacks(); requestAnimationFrame(placeBlacks);
    hint();
  }
  function songPress(k, el) {
    var u = unit(), ns = unitNotes(u), want = ns[idx];
    if (!want) return;
    if (k === want.k) {
      idx++;
      if (el) { el.classList.add('good'); setTimeout(function () { el.classList.remove('good'); }, 200); }
      goodNote(el);
      if (idx >= ns.length) { finishPart(); return; }
      renderScoreOnly();
      var s = songSays(); say('Yes! ' + s.t, s.s, 'yes');
      hint();
    } else {
      wrong++;
      if (JUICE) JUICE.miss(); else oops();
      if (el) { el.classList.add('bad'); setTimeout(function () { el.classList.remove('bad'); }, 260); }
      say('Not that one', (S.labelStyle === 'number' ? 'Key ' + want.k : letterOf(want.k)) +
          ' is the glowing one — try again.', 'no');
      hint();
    }
  }
  function renderScoreOnly() {
    var sc = $('#score'); if (!sc) return;
    var left = sc.scrollLeft;
    sc.outerHTML = scoreHTML();
    var again = $('#score'); if (again) again.scrollLeft = left;
  }
  function finishPart() {
    var sp = songProg(S.id), u = unit();
    if (sp.parts.indexOf(u.m) < 0) sp.parts.push(u.m);
    var all = S.units.every(function (x) { return sp.parts.indexOf(x.m) >= 0; });
    if (all && !sp.done) {
      sp.done = true; saveProg();
      if (SND) SND.sfx.win();
      confetti(70);
      if (JUICE) JUICE.stickers.earn('song-' + S.id, 'You can play ' + S.title);
      toast('You can play ' + S.title + '! ★★★');
      V.part = 1; idx = 0; renderSong();
      say('You played the whole thing 🎉', 'Press ▶▶ to hear it as one piece.', 'yes');
      return;
    }
    saveProg();
    if (SND) SND.sfx.levelUp();
    confetti(34);
    if (JUICE) JUICE.resetStreak();
    var next = V.part < S.units.length ? V.part + 1 : V.part;
    toast(S.unitWord + ' ' + u.m + ' learned!');
    V.part = next; idx = 0; renderSong();
    if (next !== V.part) say('Done!', 'Pick another ' + S.unitWord.toLowerCase() + '.', 'yes');
  }

  /* ── a level ───────────────────────────────────────────────────────────── */
  function notes() { return (L.seq || []).filter(function (s) { return !s.bar; }); }
  function noteAt(i) { return notes()[i]; }
  function starsHTML(n) {
    var got = prog.stars[n] || 0, out = '';
    for (var i = 1; i <= 3; i++) out += i <= got ? '★' : '<i>★</i>';
    return out;
  }
  function stripHTML() {
    if (L.mode === 'compose') {
      if (!mine.length) return '<span style="color:var(--ink2);font-size:17px">Press ● Record, then play anything you like.</span>';
      return mine.map(function (m) { return '<span class="nb done">' + letterOf(m.k) + '</span>'; }).join('');
    }
    var i = -1;
    return L.seq.map(function (s) {
      if (s.bar) return '<span class="nb bar" aria-hidden="true"></span>';
      i++;
      var cls = i < idx ? ' done' : (i === idx && !playing ? ' next' : '');
      return '<span class="nb' + cls + ((s.b || 1) >= 2 ? ' long' : '') + '" data-i="' + i + '">' +
        letterOf(s.k) + '</span>';
    }).join('');
  }
  function levelControls(isPlaying) {
    if (isPlaying) return '<button class="gbtn" style="--c:#E06098" data-a="stop">■ Stop</button>';
    if (L.mode === 'compose') {
      return '<button class="gbtn" style="--c:' + (recording ? '#E06098' : 'var(--t2)') + '" data-a="rec">' +
          (recording ? '■ Stop' : '● Record') + '</button>' +
        '<button class="gbtn" style="--c:var(--t1)" data-a="hear"' + (mine.length ? '' : ' disabled') + '>▶ Play mine</button>' +
        '<button class="gbtn" style="--c:var(--t3)" data-a="keep"' + (mine.length ? '' : ' disabled') + '>Keep it</button>' +
        '<button class="gbtn" style="--c:var(--t6)" data-a="clear"' + (mine.length ? '' : ' disabled') + '>Clear</button>';
    }
    return (L.mode === 'find' ? '' : '<button class="gbtn" style="--c:var(--t7)" data-a="listen">▶ Hear the whole tune</button>') +
      (L.mode === 'along'
        ? '<button class="gbtn" style="--c:var(--t1)" data-a="start">▶ Play along</button>'
        : '<button class="gbtn" style="--c:var(--t1)" data-a="restart">↺ Start again</button>') +
      '<button class="gbtn" style="--c:var(--t6)" data-a="grownups">For grown-ups</button>';
  }
  function tunesHTML() {
    if (L.mode !== 'compose' || !prog.tunes.length) return '';
    return '<div class="mine">' + prog.tunes.map(function (t, i) {
      return '<button data-a="hearsaved" data-i="' + i + '">♪ ' + (t.name || ('Tune ' + (i + 1))) + '</button>';
    }).join('') + '</div>';
  }
  function renderLevel() {
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
        Object.keys(SONGS).map(function (id) {
          var s = SONGS[id], d = (prog.songs[id] || {}).done;
          return '<button class="lp wide" data-song="' + id + '" aria-label="Song: ' + s.title + '" ' +
            'style="--c:' + TAPES[Object.keys(SONGS).indexOf(id) + 3] + '">' + s.icon +
            (d ? '<small>★★★</small>' : '') + '</button>';
        }).join('') +
      '</div><span class="stars" aria-label="stars earned on this level">' + starsHTML(L.n) + '</span></div>' +

      '<div class="coach" id="coach"><span class="dyno" aria-hidden="true"></span>' +
        '<div class="says" id="says" role="status" aria-live="polite"><b>' + L.name + '</b><span>' + L.brief + '</span></div></div>' +

      '<div class="strip" id="strip">' + stripHTML() + '</div>' +
      '<div class="kbwrap">' + keyboardHTML() + '</div>' +
      '<div class="controls" id="controls">' + levelControls(false) + '</div>' + tunesHTML() +
      (pct >= 100 ? winHTML() : '');
    placeBlacks(); requestAnimationFrame(placeBlacks);
    if (L.mode !== 'compose' && L.mode !== 'along') hint();
  }
  function winHTML() {
    var next = LEVELS[L.n], st = prog.stars[L.n] || 0;
    return '<div class="win"><b>' + (st === 3 ? 'Perfect! ' : 'You did it! ') + '★'.repeat(st) + '</b>' +
      '<div class="controls">' +
      (next ? '<button class="gbtn" style="--c:var(--t3)" data-lvl="' + next.n + '">Level ' + next.n + ': ' + next.name + ' →</button>'
            : '<button class="gbtn" style="--c:var(--t3)" data-song="dyno">Now the songs 🦖 →</button>') +
      '<button class="gbtn" style="--c:var(--t1)" data-a="restart">↺ Play it again</button>' +
      '<a class="gbtn" style="--c:var(--t6)" href="/kids-adventure/piano">Back to my journey</a>' +
      '</div></div>';
  }
  function paintStrip() { var s = $('#strip'); if (s) s.innerHTML = stripHTML(); }

  function levelPress(k, el) {
    if (L.mode === 'compose') {
      if (recording) {
        mine.push({ k: k, t: Date.now() - recStart });
        if (mine.length > 32) { recording = false; toast('That is a long tune — stopping there!'); renderLevel(); }
        else paintStrip();
      }
      return;
    }
    var want = noteAt(idx); if (!want) return;
    if (k === want.k) {
      if (L.mode === 'along') {
        if (window.__alongHit) window.__alongHit();
        goodNote(el);
        say('In time!', 'Keep the beat going.', 'yes');
        if (el) { el.classList.add('good'); setTimeout(function () { el.classList.remove('good'); }, 220); }
        return;
      }
      idx++;
      if (el) { el.classList.add('good'); setTimeout(function () { el.classList.remove('good'); }, 200); }
      goodNote(el);
      paintStrip();
      if (idx >= notes().length) { finishLevel(); return; }
      say(L.mode === 'find' ? 'That is ' + letterOf(k) + '! 🎉' : 'Yes!',
          L.mode === 'find' ? 'One more friend to meet.' : 'Next note…', 'yes');
      hint();
    } else {
      wrong++;
      if (JUICE) JUICE.miss(); else oops();
      if (el) { el.classList.add('bad'); setTimeout(function () { el.classList.remove('bad'); }, 260); }
      say('Not that one', 'The glowing key is ' + letterOf(want.k) + ' — try again. Wrong notes are allowed!', 'no');
      hint();
    }
  }
  function finishLevel() {
    clearTimers();
    var st = wrong === 0 ? 3 : (wrong <= 3 ? 2 : 1);
    if ((prog.stars[L.n] || 0) < st) prog.stars[L.n] = st;
    if (prog.done.indexOf(L.n) < 0) prog.done.push(L.n);
    saveProg();
    idx = notes().length;
    if (SND) SND.sfx.levelUp();
    confetti();
    renderLevel();
    if (JUICE) {
      JUICE.stamp($('.win'), st);
      if (st === 3) JUICE.stickers.earn('level-' + L.n, 'Three stars on ' + L.name);
    }
    say(st === 3 ? 'Perfect — not one wrong note!' : 'You played the whole thing!',
        st === 3 ? 'Three stars. Dyno is speechless.' : 'Play it again for more stars.', 'yes');
    toast('Level ' + L.n + ' complete ' + '★'.repeat(st));
  }
  /* level 3: the beat keeps moving whether you do or not */
  function startAlong() {
    clearTimers(); idx = 0; wrong = 0; paintStrip();
    var beat = 60 / (L.bpm || 72), seq = notes(), i = 0, hit = false;
    say('Four ticks, then play', 'Press the key as its light comes up.');
    for (var c = 0; c < 4; c++) timers.push(setTimeout(function (n) { return function () { tick(n === 0); }; }(c), c * beat * 1000));
    function step() {
      if (!hit && i > 0) { wrong++; oops(); say('Missed that one', 'Keep going — the beat waits for nobody!', 'no'); }
      if (i >= seq.length) { clearInterval(alongTimer); alongTimer = null; finishLevel(); return; }
      hit = false; idx = i;
      $$('.wk').forEach(function (el) { el.classList.remove('hint'); });
      var el = keyEl(seq[i].k); if (el) el.classList.add('hint');
      paintStrip(); tick(i % 4 === 0);
      i++;
    }
    timers.push(setTimeout(function () { step(); alongTimer = setInterval(step, beat * 1000 * 1.35); }, 4 * beat * 1000));
    window.__alongHit = function () { hit = true; };
  }

  /* ── shared bits ───────────────────────────────────────────────────────── */
  function say(title, line, mood) {
    var s = $('#says'); if (!s) return;
    s.innerHTML = '<b>' + title + '</b><span>' + (line || '') + '</span>';
    if (SND) SND.speak(title + '. ' + (line || ''));
    var c = $('#coach'); if (!c || !mood) return;
    c.classList.remove('yes', 'no'); void c.offsetWidth; c.classList.add(mood);
  }
  function hint() {
    $$('.wk').forEach(function (el) { el.classList.remove('hint'); });
    if (playing) return;
    var n = V.kind === 'song' ? unitNotes(unit())[idx] : (L.mode === 'compose' ? null : noteAt(idx));
    if (!n) return;
    var el = keyEl(n.k); if (el) el.classList.add('hint');
    if (V.kind === 'level' && L.mode === 'find') say('Can you find ' + letterOf(n.k) + '?', 'It is the glowing one — press it.');
  }
  function press(k, el) {
    piano(freqOf(k));
    if (SND) SND.haptic(10);
    if (el) { el.classList.add('down'); setTimeout(function () { el.classList.remove('down'); }, 130); }
    if (playing) return;
    if (V.kind === 'song') songPress(k, el); else levelPress(k, el);
  }
  function render() { if (V.kind === 'song') renderSong(); else renderLevel(); }

  function grownups() {
    var song = V.kind === 'song';
    var m = document.createElement('div');
    m.className = 'md';
    m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' +
      '<h3>Sitting with your child</h3>' +
      (song ? '<p class="ineed"><b>Hands:</b> ' + S.setup + '</p>' : '') +
      '<ol class="isteps">' +
      (song
        ? '<li>Press ▶▶ <b>Hear the whole piece</b> first. The note playing lights up and the score follows it, so a child can watch the shape of the tune before touching a key.</li>' +
          '<li>Then take one ' + S.unitWord.toLowerCase() + ' at a time. Say it out loud the way the line above the keys says it: hand, finger, key — then let them press.</li>' +
          '<li>A wrong note costs nothing. The glow stays on the right key until they find it.</li>' +
          '<li>Learn every ' + S.unitWord.toLowerCase() + ' and the whole piece is theirs — the tick appears on each one as it is learned.</li>'
        : '<li>Put one finger of their right hand on the glowing key. That key is C — the rest are its neighbours.</li>' +
          '<li>Press ▶ and listen together first, so they hear the tune before they hunt for it.</li>' +
          '<li>Let them press wrong keys. Nothing is lost and nothing beeps angrily.</li>' +
          '<li>One level a sitting is plenty. Stars are for coming back, not for finishing fast.</li>') +
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
    if (JUICE) JUICE.stickers.earn('composer', 'You wrote your own tune');
    if (!prog.stars[5] || prog.stars[5] < 3) prog.stars[5] = 3;
    if (prog.done.indexOf(5) < 0) prog.done.push(5);
    saveProg(); chime(); confetti(); toast('Kept! Dyno will hum it all day.');
    renderLevel();
  }
  function hearRecorded(list) {
    if (!list.length) return;
    var t0 = list[0].t;
    playNotes(list.map(function (m, i) {
      var gap = i ? (m.t - list[i - 1].t) / 1000 : 0;
      return { k: m.k, b: 1, rest: i ? Math.max(0, gap * 1.6 - 1) : 0, i: i };
    }), 92);
  }

  /* ── navigation ────────────────────────────────────────────────────────── */
  function goLevel(n) {
    if (!unlocked(n)) { toast('Finish level ' + (n - 1) + ' first 🙂'); return; }
    clearTimers();
    V = { kind:'level', n:n, song:null, part:1 };
    L = LEVELS[n - 1]; idx = 0; wrong = 0; mine = []; recording = false;
    history.replaceState({}, '', '?level=' + n);
    render();
  }
  function goSong(id, part) {
    if (!SONGS[id]) { goLevel(1); return; }
    clearTimers();
    S = SONGS[id];
    V = { kind:'song', n:0, song:id, part: Math.min(Math.max(part || 1, 1), S.units.length) };
    idx = 0; wrong = 0;
    history.replaceState({}, '', '?song=' + id + (V.part > 1 ? '&part=' + V.part : ''));
    render();
  }
  function fromUrl() {
    var q = location.search;
    var sm = /[?&]song=([a-z]+)/.exec(q);
    if (sm && SONGS[sm[1]]) {
      var pm = /[?&]part=(\d+)/.exec(q);
      goSong(sm[1], pm ? +pm[1] : 1);
      return;
    }
    var lm = /[?&]level=(\d)/.exec(q);
    var n = lm ? +lm[1] : 0;
    if (!n) { for (var i = 1; i <= LEVELS.length; i++) if (prog.done.indexOf(i) < 0) { n = i; break; } }
    if (!n) n = 1;
    n = Math.min(Math.max(n, 1), LEVELS.length);
    if (!unlocked(n)) { askedFor = n; n = 1; }
    goLevel(n);
  }

  /* ── input ─────────────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var wk = e.target.closest('.wk');
    if (wk) { press(+wk.dataset.k, wk); return; }
    if (e.target.closest('.bk')) { blip(233, 0, 0.3, 0.1, 'triangle'); return; }

    var sg = e.target.closest('[data-song]');
    if (sg) { goSong(sg.dataset.song, 1); return; }
    var lvl = e.target.closest('[data-lvl]');
    if (lvl) { goLevel(+lvl.dataset.lvl); return; }
    var pt = e.target.closest('[data-part]');
    if (pt) { clearTimers(); V.part = +pt.dataset.part; idx = 0; wrong = 0; renderSong(); return; }

    var a = (e.target.closest('[data-a]') || {}).dataset;
    if (!a) return;
    if (a.a === 'stop')     stopPlay();
    if (a.a === 'listen')   { say('Listen first 🎧', 'Watch the notes light up as they play.');
                              playNotes(notes().map(function (n, i) { return { k:n.k, b:n.b, i:i }; }), L.bpm || 92,
                                { then: function () { say('Your turn!', 'Follow the glowing key.'); hint(); } }); }
    if (a.a === 'hearpart') { var base = partIndexBase(V.part);
                              say('Hearing ' + S.unitWord.toLowerCase() + ' ' + unit().m, unit().name);
                              playNotes(unitNotes(unit()).map(function (n, i) { return { k:n.k, b:n.b, rest:n.rest, i:base + i }; }),
                                S.bpm, { then: function () { var s = songSays(); say(s.t, s.s); hint(); } }); }
    if (a.a === 'hearall')  { say('The whole piece 🎧', S.title + ' — watch it follow along.');
                              playNotes(wholeNotes(), S.bpm,
                                { then: function () { var s = songSays(); say('That is the whole song.', s.s); hint(); } }); }
    if (a.a === 'restart')  { clearTimers(); idx = 0; wrong = 0; render(); say('From the top', 'Follow the glowing key.'); }
    if (a.a === 'start')    startAlong();
    if (a.a === 'grownups') grownups();
    if (a.a === 'rec') {
      recording = !recording;
      if (recording) { mine = []; recStart = Date.now(); say('Recording 🔴', 'Play anything — I am listening.'); }
      else say('Stopped', mine.length ? 'Press ▶ Play mine to hear it.' : 'Nothing recorded yet — try again.');
      renderLevel();
    }
    if (a.a === 'hear')  hearRecorded(mine);
    if (a.a === 'keep')  keepTune();
    if (a.a === 'clear') { mine = []; renderLevel(); }
    if (a.a === 'hearsaved') hearRecorded(prog.tunes[+a.i].notes || []);
  });

  /* A real keyboard plays too: the note letters, or the digits 1–9. */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var ch = e.key.toLowerCase(), ks = keys(), k = null;
    if (ch === 'escape') { var md = document.querySelector('.md'); if (md) md.remove(); return; }
    if (ch >= '1' && ch <= '9') k = ks[+ch - 1];
    else if ('cdefgab'.indexOf(ch) >= 0) {
      for (var i = 0; i < ks.length; i++) if (letterOf(ks[i]).toLowerCase() === ch) { k = ks[i]; break; }
    }
    if (!k) return;
    e.preventDefault();
    press(k, keyEl(k));
  });

  if (window.KJA && window.KJA.ui) window.KJA.ui.toolbar('#mutebar');

  var rz;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(placeBlacks, 140); });

  window.__piano = {
    prog: function () { return prog; },
    press: press,
    where: function () { return { kind: V.kind, level: V.kind === 'level' ? L.n : 0, song: V.song, part: V.part, idx: idx }; },
    playing: function () { return playing; }
  };
  fromUrl();
  if (askedFor) {
    toast('Level ' + askedFor + ' opens once level ' + (askedFor - 1) + ' is done — starting here instead');
    say('Level ' + askedFor + ' is still closed', 'Finish level ' + (askedFor - 1) + ' and it opens by itself.');
  }
})();
