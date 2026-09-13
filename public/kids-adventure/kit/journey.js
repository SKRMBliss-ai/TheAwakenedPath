/* ════════════════════════════════════════════════════════════════════════════
   KJA.journey — the things a child carries with them between screens.

   Every screen in the adventure used to keep its own score and forget it the
   moment a child tapped away. Four small pieces fix that, and they live here
   so the map, Art World, Piano World, Study Island and the Year 2 Quest all
   share one memory:

     stars    one jar for the whole journey. Stars earned anywhere fly into it
              and the number on the lid never resets — it is the running total
              of everything a child has ever got right. Tapping the jar opens
              a little "how I'm doing" card.
     buddy    a child picks a favourite character once, and from then on the
              surprises, the confetti, the cheers and the colour of the jar
              are theirs. It is the difference between "well done" and
              "Rex thinks that was brilliant".
     queue    surprises wait their turn. An egg must never hatch over the top
              of a question a child is in the middle of reading, so anything
              celebratory raised during a round is held and released the
              moment the round ends.
     visit    where they were, last time. Any screen calls mark() as a child
              moves through it, and the map shows a "carry on where you left
              off" sign when they come back tomorrow.

   All of it is localStorage on one origin, so it is shared across
   /kids-adventure/* without a server and never leaves the device.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var W = window, K = W.KJA = W.KJA || {};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function getJSON(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  /* ── the buddies ────────────────────────────────────────────────────────
     Four are the watercolour dinosaurs the adventure is already painted with;
     the rest are drawn with emoji, which lets a child who does not want a
     dinosaur still have someone. Each one brings its own colour, its own
     confetti, its own cheers and its own voice, and `sound` names the noise
     it makes when it is pleased. */
  var BUDDIES = [
    { id:'rex',    name:'Rex',      what:'the painting dinosaur', art:'dino-green.webp',  emoji:'🦖',
      col:'#509858', bits:['🌿','🍃','⭐','🦕'], sound:'roar',
      cheers:['Rex stomps with joy!','Rex says that was brilliant!','Rex is doing a happy stomp.','Rex would like a high five. 🖐'] },
    { id:'trixie', name:'Trixie',   what:'the three-horned one',  art:'dino-purple.webp', emoji:'🦕',
      col:'#A070C0', bits:['💜','✨','⭐','🦕'], sound:'growl',
      cheers:['Trixie nods her horns!','Trixie knew you could do it.','Trixie is very proud.','Trixie did a little spin. 💜'] },
    { id:'blue',   name:'Bluebell', what:'the gentle giant',      art:'dino-blue.webp',   emoji:'🦖',
      col:'#3880C0', bits:['💧','💙','⭐','🫧'], sound:'call',
      cheers:['Bluebell hums a happy note.','Bluebell thinks you are clever.','Bluebell splashes with joy!','Bluebell sends you a big blue cheer.'] },
    { id:'swoop',  name:'Swoop',    what:'the sky flyer',         art:'ptero.webp',       emoji:'🪽',
      col:'#50A8B0', bits:['☁️','🪶','⭐','💨'], sound:'chirp',
      cheers:['Swoop loops in the sky!','Swoop screeches — the good kind!','Swoop flew a circle for you.','Swoop is showing off. Again.'] },
    { id:'pip',    name:'Pip',      what:'the helpful robot',     art:null,               emoji:'🤖',
      col:'#F89030', bits:['⚙️','🔶','⭐','💡'], sound:'twinkle',
      cheers:['Pip beeps happily!','Pip computes: excellent.','Pip lights up all its lights.','Pip stores that one in its memory.'] },
    { id:'willow', name:'Willow',   what:'the forest fairy',      art:null,               emoji:'🧚',
      col:'#E06098', bits:['🌸','✨','⭐','🦋'], sound:'twinkle',
      cheers:['Willow sprinkles sparkles!','Willow taps her wand — ding!','Willow is glowing for you.','Willow says that was magic.'] },
    { id:'nova',   name:'Nova',     what:'the space cat',         art:null,               emoji:'🐱',
      col:'#14265E', bits:['🌟','🚀','⭐','🌙'], sound:'spell',
      cheers:['Nova purrs among the stars!','Nova says: stellar.','Nova did a zero-gravity flip.','Nova adds a star to the sky for you.'] },
    { id:'coral',  name:'Coral',    what:'the sea singer',        art:null,               emoji:'🧜',
      col:'#50A8B0', bits:['🐚','🌊','⭐','🐠'], sound:'chime',
      cheers:['Coral sings a bubbly tune!','Coral claps with her fins.','Coral says that was a pearl.','Coral sends a wave of well done.'] }
  ];
  function buddy() {
    var id = get('kja:buddy', '');
    for (var i = 0; i < BUDDIES.length; i++) if (BUDDIES[i].id === id) return BUDDIES[i];
    return null;
  }
  /* Before a child has chosen, everything still works — it just speaks in the
     adventure's own voice instead of a character's. */
  var NEUTRAL = { id:'', name:'Your buddy', what:'', art:'egg.webp', emoji:'🥚', col:'#F0B828',
                  bits:['⭐','✨','🎉','🌟'], sound:'star',
                  cheers:['Brilliant!','Well done!','You did it!','That was great!'] };
  function who() { return buddy() || NEUTRAL; }
  function setBuddy(id) {
    set('kja:buddy', id || '');
    paintJar();
    W.dispatchEvent(new CustomEvent('kja:buddy', { detail: who() }));
    return who();
  }
  function face(b, size) {
    b = b || who();
    var px = size || 44;
    return b.art
      ? '<img src="/kids-adventure/kit/' + b.art + '" alt="' + b.name + '" style="width:' + px + 'px;height:' + px + 'px;object-fit:contain">'
      : '<span style="font-size:' + Math.round(px * 0.8) + 'px;line-height:1">' + b.emoji + '</span>';
  }
  function cheer() {
    var b = who(), c = b.cheers;
    return c[Math.floor(Math.random() * c.length)];
  }
  /* the noise this buddy makes — falls back to a star chime if the kit has no
     voice by that name */
  function buddySound() {
    var S = K.sound; if (!S) return;
    var n = who().sound;
    try { (S.sfx[n] || S.sfx.star)(); } catch (e) { try { S.sfx.star(); } catch (e2) {} }
  }

  /* ── the star jar ───────────────────────────────────────────────────────
     One number, always in the corner, that only ever goes up. A child asked
     for a running total and this is it: stars from Study Island, the Quest,
     Piano World and Art World all land in the same jar, the jar remembers a
     "today" count as well as a lifetime one, and the lid fills up as the
     total climbs so there is something to see even before you read the
     number. */
  var TIERS = [0, 10, 25, 50, 100, 200, 350, 550, 800];
  function total() { return +get('kja:stars', '0') || 0; }
  function todayCount() {
    var d = getJSON('kja:starday', null);
    return (d && d.d === today()) ? (d.n || 0) : 0;
  }
  function tier() {
    var t = total(), i;
    for (i = TIERS.length - 1; i >= 0; i--) if (t >= TIERS[i]) return i;
    return 0;
  }
  function fill() {                                     /* 0–1 through this tier */
    var t = total(), i = tier();
    var lo = TIERS[i], hi = TIERS[i + 1];
    if (hi == null) return 1;
    return Math.max(0, Math.min(1, (t - lo) / (hi - lo)));
  }
  function addStars(n, fromEl) {
    n = Math.max(0, Math.round(n || 0));
    if (!n) return total();
    var before = tier();
    var t = total() + n;
    set('kja:stars', String(t));
    var d = getJSON('kja:starday', null);
    setJSON('kja:starday', { d: today(), n: (d && d.d === today() ? (d.n || 0) : 0) + n });
    flyStars(fromEl, Math.min(n, 6));
    paintJar(true);
    /* crossing a tier is worth a moment, but never one that interrupts:
       it goes through the same queue as everything else celebratory */
    if (tier() > before) {
      var lvl = tier();
      hold.push(function () {
        var S = K.sound; if (S) S.sfx.levelUp();
        if (K.juice) K.juice.confetti(40);
        say('Your star jar levelled up! ' + '⭐'.repeat(Math.min(5, lvl)) + ' ' + t + ' stars.', 2600);
      });
    }
    W.dispatchEvent(new CustomEvent('kja:stars', { detail: { total: t, added: n } }));
    return t;
  }
  /* stars that actually travel from the answer to the jar, because a number
     that just ticks up is not a reward */
  function flyStars(fromEl, n) {
    var jar = document.querySelector('.starjar'); if (!jar) return;
    if (reduce) { jar.classList.add('pulse'); setTimeout(function () { jar.classList.remove('pulse'); }, 400); return; }
    var jb = jar.getBoundingClientRect();
    var sb = fromEl && fromEl.getBoundingClientRect
      ? fromEl.getBoundingClientRect()
      : { left: innerWidth / 2 - 10, top: innerHeight / 2 - 10, width: 20, height: 20 };
    var sx = sb.left + sb.width / 2, sy = sb.top + sb.height / 2;
    var tx = jb.left + jb.width / 2, ty = jb.top + jb.height / 2;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var s = document.createElement('span');
        s.className = 'flystar';
        s.textContent = '⭐';
        s.style.left = sx + 'px'; s.style.top = sy + 'px';
        s.style.setProperty('--tx', (tx - sx).toFixed(0) + 'px');
        s.style.setProperty('--ty', (ty - sy).toFixed(0) + 'px');
        s.style.animationDelay = (i * 0.08) + 's';
        document.body.appendChild(s);
        setTimeout(function () {
          if (s.parentNode) s.parentNode.removeChild(s);
          jar.classList.add('pulse');
          setTimeout(function () { jar.classList.remove('pulse'); }, 360);
        }, 760 + i * 80);
      })(i);
    }
  }
  function jar(opts) {
    opts = opts || {};
    if (document.querySelector('.starjar')) { paintJar(); return; }
    var el = document.createElement('button');
    el.className = 'starjar' + (opts.side === 'left' ? ' left' : '');
    el.type = 'button';
    el.addEventListener('click', function () {
      if (K.sound) K.sound.sfx.pop();
      openCard();
    });
    document.body.appendChild(el);
    paintJar();
  }
  function paintJar(bump) {
    var el = document.querySelector('.starjar'); if (!el) return;
    var b = who(), t = total(), f = fill();
    el.style.setProperty('--jar', b.col);
    el.style.setProperty('--fill', (f * 100).toFixed(0) + '%');
    el.setAttribute('aria-label', t + ' stars collected. Open my progress card.');
    el.innerHTML =
      '<span class="jarglass"><i class="jarfill"></i><em class="jarface">' + b.emoji + '</em></span>' +
      '<span class="jarnum">' + t + '</span>';
    if (bump) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
  }
  /* the "how I'm doing" card behind the jar */
  function openCard() {
    var b = who(), st = (K.juice && K.juice.stickers) ? K.juice.stickers : null;
    var have = st ? st.have().length : 0, all = st ? st.all.length : 0;
    var nextAt = TIERS[tier() + 1];
    var m = document.createElement('div');
    m.className = 'md jarcard';
    m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="My progress">' +
      '<h3>My adventure</h3>' +
      '<div class="jarrow">' + face(b, 64) +
        '<div><b>' + total() + ' stars</b><span>' + todayCount() + ' today' +
        (nextAt ? ' · ' + Math.max(0, nextAt - total()) + ' to the next level' : ' · top level!') + '</span></div></div>' +
      '<div class="jarstats">' +
        '<div><b>' + have + '/' + all + '</b><span>stickers</span></div>' +
        '<div><b>' + ((K.juice && K.juice.bestStreak()) || 0) + '</b><span>best streak</span></div>' +
        '<div><b>' + (getJSON('kja:days', []).length || 1) + '</b><span>days played</span></div>' +
      '</div>' +
      '<div class="acts"><div class="grow">' +
        '<button class="ghost" data-a="buddy">' + (b.id ? 'Change my buddy' : 'Pick a buddy') + '</button>' +
        '<a class="ghost" href="/kids-adventure/stickers/">My stickers</a>' +
        '<button class="big" data-a="x">Keep playing</button>' +
      '</div></div></div>';
    m.addEventListener('click', function (e) {
      var a = e.target.dataset && e.target.dataset.a;
      if (e.target === m || a === 'x') m.remove();
      if (a === 'buddy') { m.remove(); ask(true); }
    });
    document.body.appendChild(m);
  }

  /* ── the buddy picker ───────────────────────────────────────────────────
     Asked once, on the map, and never again unless a child goes looking for
     it. `ask(true)` forces it open from the progress card. */
  function ask(force) {
    if (!force && (buddy() || get('kja:buddyasked', '') === '1')) return false;
    set('kja:buddyasked', '1');
    var cur = buddy();
    var m = document.createElement('div');
    m.className = 'md buddypick';
    m.innerHTML = '<div class="sheet wide" role="dialog" aria-modal="true" aria-label="Choose your buddy">' +
      '<h3>Who is coming with you?</h3>' +
      '<p class="sub">Your buddy cheers you on and brings you surprises.</p>' +
      '<div class="buddies">' + BUDDIES.map(function (b) {
        return '<button class="buddy' + (cur && cur.id === b.id ? ' on' : '') + '" data-b="' + b.id + '"' +
          ' style="--bc:' + b.col + '" aria-pressed="' + !!(cur && cur.id === b.id) + '">' +
          '<span class="bface">' + face(b, 56) + '</span>' +
          '<b>' + b.name + '</b><i>' + b.what + '</i></button>';
      }).join('') + '</div>' +
      '<div class="acts"><div class="grow">' +
        '<button class="ghost" data-a="later">Maybe later</button>' +
      '</div></div></div>';
    m.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-b]') : null;
      if (t) {
        var b = setBuddy(t.dataset.b);
        if (K.sound) { K.sound.sfx.pop(); }
        buddySound();
        if (K.juice) K.juice.confetti(34);
        m.querySelectorAll('.buddy').forEach(function (x) {
          x.classList.toggle('on', x.dataset.b === b.id);
          x.setAttribute('aria-pressed', String(x.dataset.b === b.id));
        });
        setTimeout(function () {
          m.remove();
          say(b.name + ' is coming with you! ' + b.emoji, 2400);
        }, 520);
        return;
      }
      if (e.target === m || (e.target.dataset && e.target.dataset.a === 'later')) m.remove();
    });
    document.body.appendChild(m);
    return true;
  }

  /* ── the surprise queue ─────────────────────────────────────────────────
     A child asked, in as many words, that an egg never start hatching in the
     middle of a question. So anything celebratory that wants the whole screen
     goes through here: while a round is open the surprises pile up, and
     release() plays them one after another once the round is over. */
  var held = [], open = 0;
  var hold = {
    push: function (fn) {
      if (typeof fn !== 'function') return;
      if (open > 0) held.push(fn); else fn();
    },
    /* a round has started — hold everything back from now on */
    open: function () { open++; return open; },
    /* the round is over — let the surprises out, one at a time */
    release: function (gap) {
      open = Math.max(0, open - 1);
      if (open > 0) return 0;
      var list = held.slice(); held = [];
      list.forEach(function (fn, i) {
        setTimeout(function () { try { fn(); } catch (e) {} }, i * (gap || 2400));
      });
      return list.length;
    },
    waiting: function () { return held.length; },
    isOpen:  function () { return open > 0; }
  };

  /* ── a buddy-flavoured surprise ─────────────────────────────────────────
     What a child actually gets when they finish something: their own
     character's confetti, their own character's noise, their own character's
     words. Daily-seeded so the same achievement on a different day is not the
     same moment twice. */
  var GIFTS = [
    { k:'egg',     t:'A mystery egg is hatching!', fn:function () { if (K.sound) K.sound.sfx.hatch(); } },
    { k:'shower',  t:'A star shower!',             fn:function () { if (K.juice) K.juice.confetti(60); if (K.sound) K.sound.sfx.win(); } },
    { k:'cheer',   t:null,                         fn:function () { buddySound(); if (K.juice) K.juice.confetti(30); } },
    { k:'magic',   t:'Magic sparkles for you!',    fn:function () { if (K.sound) K.sound.sfx.spell(); } },
    { k:'stomp',   t:'Here comes a big one!',      fn:function () { if (K.sound) { K.sound.sfx.stomp(3); setTimeout(function () { K.sound.sfx.roar(true); }, 1200); } } }
  ];
  function surprise(why) {
    var b = who(), g = GIFTS[(seed() + held.length) % GIFTS.length];
    hold.push(function () {
      bits(b.bits, 22);
      try { g.fn(); } catch (e) {}
      say('<span class="sface">' + face(b, 34) + '</span>' + (g.t || cheer()) +
          (why ? '<i>' + why + '</i>' : ''), 3000);
    });
  }
  /* the buddy's own confetti: its emoji, falling */
  function bits(glyphs, n) {
    if (reduce) return;
    for (var i = 0; i < (n || 18); i++) {
      var c = document.createElement('span');
      c.className = 'jgift';
      c.textContent = glyphs[i % glyphs.length];
      c.style.left = (Math.random() * 96 + 2) + 'vw';
      c.style.animationDelay = (Math.random() * 0.6).toFixed(2) + 's';
      c.style.fontSize = (16 + Math.random() * 16).toFixed(0) + 'px';
      document.body.appendChild(c);
      setTimeout(function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }(c), 3000);
    }
  }
  /* the small speech ribbon everything here talks through */
  function say(html, ms) {
    var b = document.querySelector('.jsay');
    if (!b) { b = document.createElement('div'); b.className = 'jsay'; document.body.appendChild(b); }
    b.innerHTML = html;
    b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    clearTimeout(say.t);
    say.t = setTimeout(function () { b.classList.remove('on'); }, ms || 2400);
  }

  /* ── which day it is ────────────────────────────────────────────────────
     A stable number per calendar day, so "today's games" and "today's
     surprise" are the same all day and different tomorrow, with no server and
     nothing random to remember. */
  function seed() {
    var d = new Date();
    return (d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate()) >>> 0;
  }
  /* pick n things out of a list for today — the same n all day, a different n
     tomorrow, and it walks the whole list before repeating */
  function rotate(list, n, salt) {
    var L = (list || []).slice(), outp = [], i = 0;
    if (!L.length) return outp;
    var s = (seed() + (salt || 0)) % L.length;
    for (i = 0; i < Math.min(n || 1, L.length); i++) outp.push(L[(s + i) % L.length]);
    return outp;
  }
  /* a deterministic shuffle for today, for when a whole list should be in a
     new order each day rather than trimmed */
  function shuffleToday(list, salt) {
    var L = (list || []).slice(), st = (seed() + (salt || 0)) || 1;
    function rnd() { st = (st * 1103515245 + 12345) & 0x7fffffff; return st / 0x7fffffff; }
    for (var i = L.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = L[i]; L[i] = L[j]; L[j] = t; }
    return L;
  }

  /* ── where they were ────────────────────────────────────────────────────
     Screens call mark() as a child moves. Coming back the next day, the map
     can offer the exact place they stopped instead of the top of the world. */
  function mark(where, label, extra) {
    if (!where) return;
    setJSON('kja:last', {
      where: where, label: label || '', extra: extra || null,
      href: location.pathname + location.search + location.hash,
      at: Date.now()
    });
    var days = getJSON('kja:days', []);
    if (days.indexOf(today()) < 0) { days.push(today()); setJSON('kja:days', days.slice(-400)); }
  }
  function last() { return getJSON('kja:last', null); }
  /* a signpost, not a redirect: nothing in a children's app should move a
     child somewhere they did not tap. */
  function resumeBar(sel, opts) {
    var l = last(); if (!l || !l.href) return false;
    opts = opts || {};
    if (opts.notHere && l.href.replace(/[?#].*$/, '') === location.pathname) return false;
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!host) return false;
    var b = who();
    var mins = Math.round((Date.now() - (l.at || 0)) / 60000);
    var ago = mins < 2 ? 'just now' : mins < 60 ? mins + ' minutes ago'
            : mins < 1500 ? Math.round(mins / 60) + ' hours ago'
            : Math.round(mins / 1440) + ' days ago';
    host.innerHTML = '<a class="resume" href="' + l.href + '">' +
      '<span class="rface">' + face(b, 40) + '</span>' +
      '<span class="rtxt"><b>Carry on where you left off</b><i>' + (l.label || l.where) + ' · ' + ago + '</i></span>' +
      '<span class="rgo">▸</span></a>';
    host.hidden = false;
    return true;
  }

  K.journey = {
    stars: { total: total, today: todayCount, add: addStars, jar: jar, repaint: paintJar,
             tier: tier, fill: fill, card: openCard },
    buddy: { get: who, chosen: buddy, set: setBuddy, all: BUDDIES, ask: ask,
             face: face, cheer: cheer, sound: buddySound },
    surprise: surprise,
    bits: bits,
    say: say,
    hold: hold,
    daily: { seed: seed, day: today, rotate: rotate, shuffle: shuffleToday },
    visit: { mark: mark, last: last, bar: resumeBar }
  };

  /* ── the jar mounts itself ──────────────────────────────────────────────
     Every screen that loads this kit gets the jar, without each one having to
     remember to ask for it — that is the whole point of a total that follows
     a child around. A page that genuinely should not have one (the sticker
     book, which already IS the reward screen) sets data-nojar on <html>. */
  function mount() {
    if (document.documentElement.hasAttribute('data-nojar')) return;
    jar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
