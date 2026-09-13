/* ════════════════════════════════════════════════════════════════════════════
   KJA.juice — the part that makes it feel like a game.

   Small, shared, and deliberately cheap: confetti that bursts from the thing
   you tapped, floating "+1 ★" numbers, a star stamp for a clean round, a
   streak counter that climbs while a child keeps getting it right, and a
   sticker book they are actually playing for.

   Stickers are the watercolour sprites the rest of the adventure is painted
   with, so earning one gives a child a piece of the world itself. They live
   in localStorage under kja:stickers and never leave the device.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var W = window, K = W.KJA = W.KJA || {};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COL = ['#3880C0','#E06098','#509858','#F89030','#A070C0','#50A8B0','#F0B828'];

  /* ── the sticker book ──────────────────────────────────────────────────── */
  var STICKERS = [
    { id:'dino-green',  name:'Rex the painter',  art:'dino-green.webp'  },
    { id:'dino-purple', name:'Trixie',           art:'dino-purple.webp' },
    { id:'dino-blue',   name:'Bluebell',         art:'dino-blue.webp'   },
    { id:'ptero',       name:'Swoop',            art:'ptero.webp'       },
    { id:'egg',         name:'Mystery egg',      art:'egg.webp'         },
    { id:'palette',     name:'Paint palette',    art:'palette.webp'     },
    { id:'brush',       name:'Big brush',        art:'brush.webp'       },
    { id:'pencils',     name:'Pencil pot',       art:'pencils.webp'     },
    { id:'brushpot',    name:'Brush jar',        art:'brushpot.webp'    },
    { id:'tubes',       name:'Paint tubes',      art:'tubes.webp'       },
    { id:'peak',        name:'The summit',       art:'peak.webp'        },
    { id:'mountains',   name:'Far mountains',    art:'mountains.webp'   }
  ];
  var got = [];
  try { got = JSON.parse(localStorage.getItem('kja:stickers') || '[]') || []; } catch (e) { got = []; }
  function saveStickers() { try { localStorage.setItem('kja:stickers', JSON.stringify(got)); } catch (e) {} }

  /* Earning is deterministic from a key, so the same achievement always gives
     the same sticker — a child can aim for one. */
  function stickerFor(key) {
    var h = 0, s = String(key);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return STICKERS[h % STICKERS.length];
  }
  function earn(key, why) {
    var st = stickerFor(key);
    if (got.indexOf(st.id) >= 0) return null;            /* already in the book */
    got.push(st.id); saveStickers();
    showSticker(st, why);
    return st;
  }
  function showSticker(st, why) {
    var s = K.sound;
    if (s) { s.sfx.magic(); s.haptic(30); }
    var m = document.createElement('div');
    m.className = 'md stickerwin';
    m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="New sticker">' +
      '<h3>A new sticker! 🎉</h3>' +
      '<div class="stickerbig"><img src="/kids-adventure/kit/' + st.art + '" alt="' + st.name + '"></div>' +
      '<p class="stickername">' + st.name + '</p>' +
      '<p class="stickerwhy">' + (why || 'Earned on your adventure') + '</p>' +
      '<div class="acts"><div class="grow">' +
        '<a class="ghost" href="/kids-adventure/stickers/">See my book</a>' +
        '<button class="big" data-a="x">Keep playing</button>' +
      '</div></div></div>';
    m.addEventListener('click', function (e) {
      if (e.target === m || (e.target.dataset && e.target.dataset.a === 'x')) m.remove();
    });
    document.body.appendChild(m);
    burstAt(m.querySelector('.stickerbig'), 18);
  }
  function bookHTML() {
    return '<div class="stickerbook">' + STICKERS.map(function (st) {
      var have = got.indexOf(st.id) >= 0;
      return '<div class="sticker' + (have ? ' have' : '') + '" title="' + (have ? st.name : 'Not found yet') + '">' +
        (have ? '<img src="/kids-adventure/kit/' + st.art + '" alt="' + st.name + '">' : '<span>?</span>') +
        '<b>' + (have ? st.name : '· · ·') + '</b></div>';
    }).join('') + '</div>';
  }

  /* ── confetti, bursts and floating numbers ─────────────────────────────── */
  function confetti(n) {
    if (reduce) return;
    for (var i = 0; i < (n || 46); i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = COL[i % COL.length];
      c.style.animationDelay = (Math.random() * 0.5) + 's';
      c.style.borderRadius = i % 3 ? '50%' : '2px';
      c.style.transform = 'rotate(' + (Math.random() * 90 - 45) + 'deg)';
      document.body.appendChild(c);
      setTimeout(function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }(c), 2400);
    }
  }
  /* A burst that comes out of the thing you touched, which is what makes a tap
     feel like it did something. */
  function burstAt(el, n) {
    if (reduce || !el) return;
    var b = el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    for (var i = 0; i < (n || 10); i++) {
      var p = document.createElement('span');
      p.className = 'jbit';
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.background = COL[i % COL.length];
      var a = (Math.PI * 2 * i) / (n || 10) + Math.random() * 0.5, d = 40 + Math.random() * 60;
      p.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
      p.style.setProperty('--dy', (Math.sin(a) * d - 20).toFixed(0) + 'px');
      p.style.borderRadius = i % 2 ? '50%' : '2px';
      document.body.appendChild(p);
      setTimeout(function (el2) { return function () { if (el2.parentNode) el2.parentNode.removeChild(el2); }; }(p), 900);
    }
  }
  function sparkle(el, glyph, colour, n) {
    if (reduce || !el) return;
    var b = el.getBoundingClientRect();
    for (var i = 0; i < (n || 3); i++) {
      var s = document.createElement('span');
      s.className = 'jspark';
      s.textContent = glyph || '✨';
      s.style.color = colour || '#F0B828';
      s.style.left = (b.left + b.width / 2) + 'px';
      s.style.top = (b.top + 10) + 'px';
      s.style.setProperty('--dx', (Math.random() * 70 - 35).toFixed(0) + 'px');
      s.style.animationDelay = (i * 0.06) + 's';
      document.body.appendChild(s);
      setTimeout(function (el2) { return function () { if (el2.parentNode) el2.parentNode.removeChild(el2); }; }(s), 1200);
    }
  }
  function pop(el, text, colour) {
    if (!el) return;
    var b = el.getBoundingClientRect();
    var s = document.createElement('span');
    s.className = 'jpop';
    s.textContent = text;
    s.style.color = colour || '#2E7A38';
    s.style.left = (b.left + b.width / 2) + 'px';
    s.style.top = (b.top + b.height * 0.35) + 'px';
    document.body.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1100);
  }
  /* The stamp that lands when a round is finished. */
  function stamp(host, stars) {
    if (!host) return;
    var d = document.createElement('div');
    d.className = 'jstamp' + (reduce ? ' still' : '');
    d.innerHTML = '<span>' + (stars >= 3 ? '★★★' : stars === 2 ? '★★' : stars === 1 ? '★' : '✧') + '</span>';
    host.appendChild(d);
    if (!reduce) setTimeout(function () { burstAt(d, 14); }, 260);
  }

  /* ── streaks ───────────────────────────────────────────────────────────── */
  var streak = 0, best = 0;
  try { best = +(localStorage.getItem('kja:beststreak') || 0) || 0; } catch (e) {}
  function hit(el) {
    streak++;
    if (streak > best) { best = streak; try { localStorage.setItem('kja:beststreak', String(best)); } catch (e) {} }
    if (K.sound) { K.sound.sfx.streak(streak); K.sound.haptic(14); }
    sparkle(el, streak >= 5 ? '🔥' : '✨', streak >= 5 ? '#F2653D' : '#F0B828', streak >= 3 ? 4 : 2);
    if (streak >= 3) banner(streak + ' in a row! ' + (streak >= 5 ? '🔥' : '⭐'));
    return streak;
  }
  function miss() {
    var had = streak;
    streak = 0;
    if (K.sound) { K.sound.sfx.wrong(); K.sound.haptic(26); }
    return had;
  }
  function banner(text) {
    var b = document.querySelector('.jbanner');
    if (!b) {
      b = document.createElement('div');
      b.className = 'jbanner';
      document.body.appendChild(b);
    }
    b.textContent = text;
    b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    clearTimeout(banner.t);
    banner.t = setTimeout(function () { b.classList.remove('on'); }, 1600);
  }

  /* ── the little toolbar every screen carries ───────────────────────────
     Sound, music and read-aloud in one place, plus the way into the sticker
     book. Music and read-aloud are off until a grown-up turns them on. */
  K.ui = {
    toolbar: function (sel) {
      var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (!host) return;
      var S = K.sound;
      host.className = 'toolbar';
      /* On a phone the four labels wrap into their own paragraph, so there the
         icons carry it and the words live in aria-label instead. */
      function paint() {
        var have = got.length, all = STICKERS.length;
        var tight = matchMedia('(max-width:700px)').matches;
        var m = S && S.isMuted(), mu = S && S.isMusic(), sp = S && S.isSpeech();
        host.innerHTML =
          '<button data-t="mute" aria-pressed="' + !m + '" aria-label="' + (m ? 'Sounds are off' : 'Sounds are on') + '">' +
            (m ? '🔇' : '🔊') + (tight ? '' : (m ? ' Sounds off' : ' Sounds on')) + '</button>' +
          '<button data-t="music" aria-pressed="' + !!mu + '" aria-label="' + (mu ? 'Music is on' : 'Music is off') + '">' +
            '🎵' + (tight ? '' : (mu ? ' Music on' : ' Music off')) + '</button>' +
          '<button data-t="speak" aria-pressed="' + !!sp + '" aria-label="' + (sp ? 'Reading to you' : 'Read to me') + '">' +
            '🔈' + (tight ? '' : (sp ? ' Reading to you' : ' Read to me')) + '</button>' +
          '<a href="/kids-adventure/stickers/" aria-label="' + have + ' of ' + all + ' stickers found">⭐ ' +
            have + '/' + all + '</a>';
      }
      paint();
      var rz;
      addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(paint, 160); });
      host.addEventListener('click', function (e) {
        var b = e.target.closest('[data-t]'); if (!b || !S) return;
        if (b.dataset.t === 'mute')  { S.setMuted(!S.isMuted()); if (!S.isMuted()) S.sfx.pop(); }
        if (b.dataset.t === 'music') { S.setMusic(!S.isMusic()); if (S.isMusic()) S.sfx.chime(); }
        if (b.dataset.t === 'speak') { S.setSpeech(!S.isSpeech()); if (S.isSpeech()) S.speak('I will read things out for you.'); }
        paint();
      });
    }
  };

  K.juice = {
    confetti: confetti, burstAt: burstAt, sparkle: sparkle, pop: pop, stamp: stamp,
    hit: hit, miss: miss, banner: banner,
    streak: function () { return streak; }, bestStreak: function () { return best; },
    resetStreak: function () { streak = 0; },
    stickers: { earn: earn, bookHTML: bookHTML, all: STICKERS, have: function () { return got.slice(); } }
  };
})();
