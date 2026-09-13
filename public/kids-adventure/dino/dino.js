/* ════════════════════════════════════════════════════════════════════════════
   DINO WORLD — six games for the child who only ever wanted dinosaurs.

   A child asked for "lots of dino games, fun if the child is a dino fan", and
   for the real roars that now live in kit/sfx to be used for something. So
   every game here is built around the recordings rather than decorated with
   them:

     roar     six dinosaurs, six real voices. Hear one, say who made it —
              which is ear training wearing a dinosaur costume.
     hatch    sums crack the egg. Three right answers and it hatches, with the
              knock-knock-knock, the magic and the hatchling's peep.
     tracks   count the footprints, then carry on the pattern — counting in
              2s, 5s and 10s, which is the Year 1 objective.
     feed     leaves or meat? Real herbivores and carnivores, sorted.
     says     Dino Says: a growing run of roars to play back from memory.
     dig      dig for bones on a grid while a heartbeat tells you how close
              you are — hot and cold, played with your ears.

   Everything pays into the same star jar as the rest of the adventure, uses
   the same paper and the same instrument, and holds its surprises until a
   game is over. Progress lives in localStorage under kja:dino.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var SND = (window.KJA && window.KJA.sound) || null;
  var JUICE = (window.KJA && window.KJA.juice) || null;
  var JY = (window.KJA && window.KJA.journey) || null;
  var TAPES = ['#3880C0','#E06098','#509858','#F89030','#A070C0','#50A8B0','#F0B828'];
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sfx(n, arg) { if (SND && SND.sfx[n]) try { SND.sfx[n](arg); } catch (e) {} }
  /* Every game here waits: for a roar to finish, for a fact to be read, for an
     egg to knock. A child who leaves mid-wait would otherwise have the old
     game's next screen thrown over the top of the new one a second later, so
     every delay goes through `later()` and every screen change cancels the
     lot. */
  var timers = [];
  function later(fn, ms) {
    var t = setTimeout(function () {
      var i = timers.indexOf(t); if (i >= 0) timers.splice(i, 1);
      fn();
    }, ms);
    timers.push(t);
    return t;
  }
  function cancelAll() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function say(t) { if (SND) SND.speak(t); }

  /* ── the herd ────────────────────────────────────────────────────────────
     Six dinosaurs, each with one of the real recordings as its voice, and
     each with a fact that is actually true — a child who loves dinosaurs
     will know if it is not. `art` reuses the watercolour sprites the rest of
     the adventure is painted with where there is one. */
  var HERD = [
    { id:'rex',   name:'Tyrannosaurus',  short:'T. rex',  emoji:'🦖', art:'dino-green.webp',
      voice:'roar-big', eats:'meat',   col:'#509858',
      fact:'Its teeth were as long as a banana, and it could bite harder than any land animal ever has.' },
    { id:'tri',   name:'Triceratops',    short:'Trike',   emoji:'🦕', art:'dino-purple.webp',
      voice:'growl',    eats:'plants', col:'#A070C0',
      fact:'Three horns and a bony frill the size of a door — and it only ever ate plants.' },
    { id:'brach', name:'Brachiosaurus',  short:'Brachi',  emoji:'🦕', art:'dino-blue.webp',
      voice:'call',     eats:'plants', col:'#3880C0',
      fact:'Taller than a house, with a neck so long it could eat from the tops of trees.' },
    { id:'ptero', name:'Pteranodon',     short:'Ptero',   emoji:'🪽', art:'ptero.webp',
      voice:'chirp2',   eats:'meat',   col:'#50A8B0',
      fact:'It flew on wings wider than a car is long, and snapped up fish from the sea.' },
    { id:'steg',  name:'Stegosaurus',    short:'Steggy',  emoji:'🦕', art:null,
      voice:'grumble',  eats:'plants', col:'#F89030',
      fact:'Plates down its back and four spikes on its tail — a plant eater with a very good answer.' },
    /* no sprite for this one: the egg-in-a-nest painting reads as an egg, not
       as a chicken-sized hunter, so Compy wears the hatchling emoji */
    { id:'comp',  name:'Compsognathus',  short:'Compy',   emoji:'🐣', art:null,
      voice:'chirp',    eats:'meat',   col:'#E06098',
      fact:'Only the size of a chicken, and one of the very fastest little hunters.' }
  ];
  function herdById(id) { for (var i = 0; i < HERD.length; i++) if (HERD[i].id === id) return HERD[i]; return null; }
  function voiceOf(d) {
    if (!SND) return;
    if (d.voice === 'roar-big') sfx('roar', true);
    else sfx(d.voice);
  }
  function faceOf(d, px) {
    px = px || 64;
    return d.art
      ? '<img src="/kids-adventure/kit/' + d.art + '" alt="' + d.name + '" style="width:' + px + 'px;height:' + px + 'px;object-fit:contain">'
      : '<span class="dface" style="font-size:' + Math.round(px * 0.86) + 'px">' + d.emoji + '</span>';
  }

  /* ── progress ────────────────────────────────────────────────────────── */
  var prog = {};
  try { prog = JSON.parse(localStorage.getItem('kja:dino') || '{}') || {}; } catch (e) { prog = {}; }
  function save() { try { localStorage.setItem('kja:dino', JSON.stringify(prog)); } catch (e) {} }
  function best(id) { return (prog[id] && prog[id].best) || 0; }
  function setBest(id, n) {
    if (!prog[id]) prog[id] = {};
    if ((prog[id].best || 0) < n) prog[id].best = n;
    prog[id].played = (prog[id].played || 0) + 1;
    save();
  }
  function starRow(n, of) {
    var out = '';
    for (var i = 1; i <= (of || 3); i++) out += i <= n ? '★' : '☆';
    return out;
  }

  /* ── the six games ───────────────────────────────────────────────────── */
  var GAMES = [
    { id:'roar',   icon:'🔊', title:'Whose roar?',       tag:'Listening', col:'#3880C0',
      blurb:'Hear a real dinosaur. Say who made that noise.' },
    { id:'hatch',  icon:'🥚', title:'Hatch the egg',     tag:'Number',    col:'#E06098',
      blurb:'Three right answers and the egg cracks open.' },
    { id:'tracks', icon:'👣', title:'Footprint trail',   tag:'Counting',  col:'#509858',
      blurb:'Count the tracks, then carry the pattern on.' },
    { id:'feed',   icon:'🥬', title:'Feed the herd',     tag:'Science',   col:'#F89030',
      blurb:'Leaves or meat? Feed each one the right thing.' },
    { id:'says',   icon:'🧠', title:'Dino Says',         tag:'Memory',    col:'#A070C0',
      blurb:'A run of roars, getting longer. Play it back.' },
    { id:'dig',    icon:'🦴', title:'Dig for bones',     tag:'Hot & cold', col:'#50A8B0',
      blurb:'Listen to the heartbeat. It knows where the bones are.' }
  ];
  function gameById(id) { for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i]; return null; }

  /* ── shared round furniture ───────────────────────────────────────────── */
  var host, G = null, roundScore = 0, roundOf = 0, holding = false, lastId = '';
  function openRound(g, of) {
    G = g; roundScore = 0; roundOf = of; lastId = g.id;
    if (JY && !holding) { JY.hold.open(); holding = true; }
    if (JY) JY.visit.mark('dino', 'Dino World · ' + g.title, { g: g.id });
    history.replaceState({}, '', '?g=' + g.id);
  }
  function closeRound() {
    if (JY && holding) { JY.hold.release(2600); holding = false; }
    G = null;
  }
  function head(g, sub) {
    return '<header><p class="qtag" style="--c:' + (g.col || '#509858') + '">' + g.icon + ' ' + g.title + '</p>' +
      '<p class="qcount">' + sub + '</p></header>';
  }
  /* the little dinosaur who talks to the child through every game */
  function coach(html, extra) {
    return '<div class="coach" id="coach"><span class="dyno" aria-hidden="true"></span>' +
      '<div class="says ask" id="says" role="status" aria-live="polite">' + html + '</div></div>' + (extra || '');
  }
  function good(el, n) {
    roundScore += (n || 1);
    if (JUICE) { JUICE.hit(el); JUICE.pop(el, '+1 ★', '#2E7A38'); JUICE.burstAt(el, 8); }
    if (JY) JY.stars.add(n || 1, el);
    var c = $('#coach'); if (c) { c.classList.remove('yes','no'); void c.offsetWidth; c.classList.add('yes'); }
  }
  function bad() {
    if (JUICE) JUICE.miss(); else sfx('wrong');
    var c = $('#coach'); if (c) { c.classList.remove('yes','no'); void c.offsetWidth; c.classList.add('no'); }
  }
  /* every game ends the same way, so a child always knows where they are */
  function finish(g, score, of, note) {
    cancelAll();
    var st = of ? (score >= of ? 3 : score >= Math.ceil(of * 0.75) ? 2 : score >= Math.ceil(of / 2) ? 1 : 0) : 0;
    setBest(g.id, score);
    if (st === 3) { sfx('win'); if (JUICE) JUICE.confetti(70); }
    else if (st) { sfx('levelUp'); if (JUICE) JUICE.confetti(30); }
    else sfx('pop');
    if (JUICE) JUICE.resetStreak();
    host.innerHTML = head(g, 'All done') +
      coach('<b class="qq">' + score + ' out of ' + of + ' ' + starRow(st) + '</b>' +
        '<span>' + (note || (st === 3 ? 'Every single one. The whole herd is impressed.'
          : st === 2 ? 'So close to all of them — one more go for three stars.'
          : st ? 'Good going. Play it again and those stars will come.'
          : 'Tricky one. Nothing is lost — have another go.')) + '</span>') +
      '<div class="controls">' +
        '<button class="gbtn" style="--c:var(--t3)" data-a="again">↺ Play again</button>' +
        '<button class="gbtn" style="--c:var(--t1)" data-a="home">‹ All dino games</button>' +
        '<a class="gbtn" style="--c:var(--t6)" href="/kids-adventure/">Journey map</a>' +
      '</div>';
    if (JUICE) JUICE.stamp($('.coach'), st);
    if (JY) {
      if (st === 3) {
        JY.surprise('Three stars on ' + g.title);
        JY.hold.push(function () { if (JUICE) JUICE.stickers.earn('dino-' + g.id, 'Three stars on ' + g.title); });
      }
      /* all six games at three stars is the whole world finished */
      var all = GAMES.every(function (x) { return best(x.id) > 0; });
      if (all) JY.hold.push(function () { if (JUICE) JUICE.stickers.earn('dino-world', 'Every game in Dino World'); });
    }
    closeRound();
  }

  /* ══ 1 · WHOSE ROAR? ═══════════════════════════════════════════════════
     Six real recordings against six names. A child who loves dinosaurs will
     learn the voices in one sitting, and what they are really practising is
     listening carefully and holding a sound in mind while they choose. */
  var ROAR_N = 6;
  function gRoar(g, n) {
    n = n || 1;
    if (n > ROAR_N) { finish(g, roundScore, ROAR_N); return; }
    var answer = pick(HERD);
    var others = shuffle(HERD.filter(function (d) { return d.id !== answer.id; })).slice(0, 2);
    var opts = shuffle([answer].concat(others));
    host.innerHTML = head(g, 'Roar ' + n + ' of ' + ROAR_N) +
      coach('<b class="qq">Who made that noise?</b>' +
            '<span>Tap the speaker to hear it again.</span>') +
      '<div class="playrow"><button class="bigplay" data-a="hear" aria-label="Play the roar again">🔊 Hear it again</button></div>' +
      '<div class="dgrid three">' + opts.map(function (d) {
        return '<button class="dcard" data-d="' + d.id + '" style="--c:' + d.col + '">' +
          '<span class="dpic">' + faceOf(d, 74) + '</span><b>' + d.name + '</b><i>' + d.short + '</i></button>';
      }).join('') + '</div>' +
      '<div class="controls"><button class="gbtn" style="--c:var(--t6)" data-a="home">‹ All dino games</button></div>';
    later(function () { voiceOf(answer); }, 420);
    host.dataset.answer = answer.id;
    host.dataset.n = n;
  }
  function roarTap(id, el) {
    var g = gameById('roar'), answer = herdById(host.dataset.answer), n = +host.dataset.n;
    if (!answer || el.disabled) return;
    if (id === answer.id) {
      $$('.dcard').forEach(function (b) { b.disabled = true; if (b.dataset.d === id) b.classList.add('gotit'); });
      good(el);
      $('#says').innerHTML = '<b class="qq">' + answer.name + '! ' + (answer.emoji) + '</b><span>' + answer.fact + '</span>';
      say(answer.name + '. ' + answer.fact);
      later(function () { gRoar(g, n + 1); }, 3200);
    } else {
      el.disabled = true; el.classList.add('nope');
      bad();
      $('#says').innerHTML = '<b class="qq">Not that one — listen again.</b><span>Tap the speaker, then try another.</span>';
      later(function () { voiceOf(answer); }, 300);
    }
  }

  /* ══ 2 · HATCH THE EGG ═════════════════════════════════════════════════
     Three right answers crack it open. The sums are the Year 1 ones — number
     bonds, doubles, one and ten more — and the reward is the hatch sound
     built out of the real recordings: three knocks, the magic, then a
     hatchling's peep. */
  function eggSum() {
    var t = rnd(4), q, a;
    if (t === 0) { var x = 1 + rnd(9); q = x + ' + ? = 10'; a = 10 - x; }
    else if (t === 1) { var d = 1 + rnd(10); q = 'Double ' + d + ' = ?'; a = d * 2; }
    else if (t === 2) { var b = 1 + rnd(19); q = '1 more than ' + b + ' = ?'; a = b + 1; }
    else { var c = 5 + rnd(40); q = '10 more than ' + c + ' = ?'; a = c + 10; }
    var opts = [a], guard = 0;
    while (opts.length < 3 && guard++ < 40) {
      var v = a + pick([-10,-2,-1,1,2,10]);
      if (v > 0 && opts.indexOf(v) < 0) opts.push(v);
    }
    while (opts.length < 3) { var w = 1 + rnd(60); if (opts.indexOf(w) < 0) opts.push(w); }
    return { q: q, a: String(a), opts: shuffle(opts).map(String) };
  }
  var EGG_N = 3;
  function gHatch(g, cracks) {
    cracks = cracks || 0;
    if (cracks >= EGG_N) {
      /* the hatch itself: their real knocks, magic and peep */
      var newborn = pick(HERD);
      host.innerHTML = head(g, 'It is hatching!') +
        '<div class="eggstage done"><div class="egg big">🥚</div></div>' +
        coach('<b class="qq">Something is coming out…</b>');
      sfx('hatch');
      if (JUICE) JUICE.confetti(50);
      later(function () {
        host.innerHTML = head(g, 'Hatched!') +
          '<div class="eggstage"><span class="born">' + faceOf(newborn, 140) + '</span></div>' +
          coach('<b class="qq">A baby ' + newborn.name + '! ' + newborn.emoji + '</b><span>' + newborn.fact + '</span>');
        voiceOf(newborn);
        say('A baby ' + newborn.name + '. ' + newborn.fact);
        if (JUICE) { JUICE.confetti(60); JUICE.burstAt($('.born'), 20); }
        later(function () { finish(g, roundScore, EGG_N, 'You hatched a baby ' + newborn.name + '!'); }, 3600);
      }, 2200);
      return;
    }
    var s = eggSum();
    host.innerHTML = head(g, 'Crack ' + (cracks + 1) + ' of ' + EGG_N) +
      '<div class="eggstage"><div class="egg crack' + cracks + '">🥚</div>' +
        '<div class="cracks">' + [0,1,2].map(function (i) {
          return '<span class="ck' + (i < cracks ? ' on' : '') + '">' + (i < cracks ? '💥' : '·') + '</span>';
        }).join('') + '</div></div>' +
      coach('<b class="qq">' + s.q + '</b><span>Get it right and the egg cracks.</span>') +
      '<div class="answers">' + s.opts.map(function (o) {
        return '<button class="ans" data-ans="' + o + '">' + o + '</button>';
      }).join('') + '</div>' +
      '<div class="controls"><button class="gbtn" style="--c:var(--t6)" data-a="home">‹ All dino games</button></div>';
    host.dataset.answer = s.a;
    host.dataset.n = cracks;
  }
  function hatchTap(val, el) {
    var g = gameById('hatch'), cracks = +host.dataset.n;
    if (el.disabled) return;
    if (val === host.dataset.answer) {
      $$('.ans').forEach(function (b) { b.disabled = true; if (b.dataset.ans === val) b.classList.add('good'); });
      good(el);
      sfx('wood'); if (SND) SND.haptic(20);
      var egg = $('.egg'); if (egg) { egg.classList.add('knock'); }
      later(function () { gHatch(g, cracks + 1); }, 1100);
    } else {
      el.disabled = true; el.classList.add('bad');
      bad();
      /* narrow, then show — the egg will not crack on a wrong answer, and
         nobody is left sitting in front of it */
      var left = $$('.ans').filter(function (b) { return !b.disabled; });
      if (left.length === 1) left[0].classList.add('nudge');
      $('#says').querySelector('span').textContent = left.length === 1
        ? 'Here it is — tap the glowing one.'
        : 'Not that one. The egg is waiting — try again.';
    }
  }

  /* ══ 3 · FOOTPRINT TRAIL ═══════════════════════════════════════════════
     Counting in 2s, 5s and 10s, which is a real Year 1 objective, hidden in
     a set of tracks going off across the page. The child is shown the run so
     far and asked for the next print. */
  var TRACK_N = 6;
  function gTracks(g, n) {
    n = n || 1;
    if (n > TRACK_N) { finish(g, roundScore, TRACK_N); return; }
    var step = pick([2, 2, 5, 10]), from = step * (1 + rnd(4));
    var seen = [], i;
    for (i = 0; i < 4; i++) seen.push(from + step * i);
    var a = from + step * 4;
    var opts = shuffle([a, a + step, a - step, a + 1]).map(String);
    var uniq = []; opts.forEach(function (o) { if (uniq.indexOf(o) < 0) uniq.push(o); });
    host.innerHTML = head(g, 'Trail ' + n + ' of ' + TRACK_N) +
      coach('<b class="qq">Counting in ' + step + 's — what is the next footprint?</b>' +
            '<span>Say the numbers out loud as you follow the tracks.</span>') +
      '<div class="trailrow">' + seen.map(function (v, k) {
        return '<span class="print" style="--k:' + k + '">👣<b>' + v + '</b></span>';
      }).join('') + '<span class="print ghost">👣<b>?</b></span></div>' +
      '<div class="answers">' + uniq.map(function (o) {
        return '<button class="ans" data-ans="' + o + '">' + o + '</button>';
      }).join('') + '</div>' +
      '<div class="controls"><button class="gbtn" style="--c:var(--t6)" data-a="home">‹ All dino games</button></div>';
    host.dataset.answer = String(a);
    host.dataset.n = n;
    host.dataset.step = String(step);
    /* the tracks arrive one at a time, with a footfall each */
    $$('.print').forEach(function (p, k) {
      later(function () { p.classList.add('in'); if (k < seen.length) sfx('stomp'); }, 200 + k * 260);
    });
  }
  function tracksTap(val, el) {
    var g = gameById('tracks'), n = +host.dataset.n;
    if (el.disabled) return;
    if (val === host.dataset.answer) {
      $$('.ans').forEach(function (b) { b.disabled = true; if (b.dataset.ans === val) b.classList.add('good'); });
      var gh = $('.print.ghost'); if (gh) { gh.classList.add('filled'); gh.querySelector('b').textContent = val; }
      good(el);
      later(function () { gTracks(g, n + 1); }, 1500);
    } else {
      el.disabled = true; el.classList.add('bad');
      bad();
      var left = $$('.ans').filter(function (b) { return !b.disabled; });
      if (left.length === 1) left[0].classList.add('nudge');
      $('#says').querySelector('span').textContent = left.length === 1
        ? 'Here it is — tap the glowing one.'
        : 'Not that one. Count on from the last print in ' + host.dataset.step + 's.';
    }
  }

  /* ══ 4 · FEED THE HERD ═════════════════════════════════════════════════
     Plants or meat, with the real animals and the real answers. This is the
     fact every dinosaur fan learns first, and sorting is the skill. */
  var FEED_N = 6;
  function gFeed(g, n) {
    n = n || 1;
    if (n > FEED_N) { finish(g, roundScore, FEED_N); return; }
    var d = pick(HERD);
    host.innerHTML = head(g, 'Dinner ' + n + ' of ' + FEED_N) +
      coach('<b class="qq">What does a ' + d.name + ' eat?</b>' +
            '<span>Look at its teeth and its size. Have a think.</span>') +
      '<div class="feedstage">' + faceOf(d, 150) + '</div>' +
      '<div class="dgrid two">' +
        '<button class="dcard food" data-f="plants" style="--c:#509858"><span class="dpic">🥬</span><b>Leaves</b><i>a plant eater</i></button>' +
        '<button class="dcard food" data-f="meat" style="--c:#E06098"><span class="dpic">🍖</span><b>Meat</b><i>a hunter</i></button>' +
      '</div>' +
      '<div class="controls"><button class="gbtn" style="--c:var(--t6)" data-a="home">‹ All dino games</button></div>';
    host.dataset.answer = d.eats;
    host.dataset.who = d.id;
    host.dataset.n = n;
  }
  function feedTap(f, el) {
    var g = gameById('feed'), d = herdById(host.dataset.who), n = +host.dataset.n;
    if (el.disabled) return;
    $$('.dcard').forEach(function (b) { b.disabled = true; });
    if (f === host.dataset.answer) {
      el.classList.add('gotit');
      good(el);
      voiceOf(d);
      $('#says').innerHTML = '<b class="qq">Yes — ' + (f === 'plants' ? 'leaves!' : 'meat!') + '</b><span>' + d.fact + '</span>';
      say(d.fact);
    } else {
      el.classList.add('nope');
      $$('.dcard').forEach(function (b) { if (b.dataset.f === host.dataset.answer) b.classList.add('gotit'); });
      bad();
      $('#says').innerHTML = '<b class="qq">Actually ' + (host.dataset.answer === 'plants' ? 'leaves' : 'meat') + '.</b><span>' + d.fact + '</span>';
      say(d.fact);
    }
    later(function () { gFeed(g, n + 1); }, 3400);
  }

  /* ══ 5 · DINO SAYS ═════════════════════════════════════════════════════
     A run of roars that grows by one each round, played back by tapping the
     dinosaurs in order. Pure working memory, and the reason to have six
     distinct recordings in the first place. */
  var seq = [], step = 0, showing = false;
  function gSays(g, fresh) {
    if (fresh) { seq = []; }
    seq.push(pick(HERD).id);
    step = 0;
    host.innerHTML = head(g, 'Run of ' + seq.length) +
      coach('<b class="qq">Listen…</b><span>Then tap them in the same order.</span>') +
      '<div class="dgrid three says6">' + HERD.map(function (d) {
        return '<button class="dcard voice" data-s="' + d.id + '" style="--c:' + d.col + '" disabled>' +
          '<span class="dpic">' + faceOf(d, 62) + '</span><b>' + d.short + '</b></button>';
      }).join('') + '</div>' +
      '<div class="controls"><button class="gbtn" style="--c:var(--t1)" data-a="replay">🔊 Play it again</button>' +
        '<button class="gbtn" style="--c:var(--t6)" data-a="home">‹ All dino games</button></div>';
    playSeq();
  }
  function playSeq() {
    if (showing) return;
    showing = true;
    $$('.dcard.voice').forEach(function (b) { b.disabled = true; });
    var i = 0;
    (function nextOne() {
      if (i >= seq.length) {
        showing = false;
        $$('.dcard.voice').forEach(function (b) { b.disabled = false; });
        var sa = $('#says');
        if (sa) sa.innerHTML = '<b class="qq">Your turn!</b><span>Tap them in the same order.</span>';
        return;
      }
      var d = herdById(seq[i]), el = $('.dcard.voice[data-s="' + seq[i] + '"]');
      if (el) { el.classList.add('lit'); later(function () { el.classList.remove('lit'); }, 620); }
      voiceOf(d);
      i++;
      later(nextOne, 1150);
    })();
  }
  function saysTap(id, el) {
    var g = gameById('says');
    if (showing || el.disabled) return;
    var d = herdById(id);
    voiceOf(d);
    el.classList.add('lit');
    later(function () { el.classList.remove('lit'); }, 420);
    if (id === seq[step]) {
      step++;
      if (step >= seq.length) {
        good(el);
        $$('.dcard.voice').forEach(function (b) { b.disabled = true; });
        var sa = $('#says');
        if (sa) sa.innerHTML = '<b class="qq">' + seq.length + ' in a row! 🎉</b><span>Here comes one more…</span>';
        later(function () { gSays(g); }, 1900);
      }
    } else {
      bad();
      $$('.dcard.voice').forEach(function (b) { b.disabled = true; });
      var got = seq.length - 1;
      finish(g, got, Math.max(got, seq.length), got >= 4
        ? 'A run of ' + got + ' roars from memory. That is a lot to hold in your head.'
        : got > 0 ? 'You got ' + got + ' before it slipped. Go again — it gets easier fast.'
        : 'Listen right to the end before you start tapping.');
    }
  }

  /* ══ 6 · DIG FOR BONES ═════════════════════════════════════════════════
     A five-by-five patch of sand with three bones buried in it. Every dig
     plays the heartbeat at a speed that says how close the nearest bone is —
     hot and cold, played entirely with the ears, which is why it needed the
     real heartbeat recording. */
  var GRID = 5, bones = [], dug = [], found = 0;
  function gDig(g, fresh) {
    if (fresh) {
      bones = []; dug = []; found = 0;
      while (bones.length < 3) { var c = rnd(GRID * GRID); if (bones.indexOf(c) < 0) bones.push(c); }
    }
    host.innerHTML = head(g, found + ' of 3 bones · ' + dug.length + ' digs') +
      coach('<b class="qq">Three bones are buried here.</b>' +
            '<span>Dig anywhere. The faster the heartbeat, the closer you are.</span>') +
      '<div class="digyard" id="yard">' + (function () {
        var out = '', i;
        for (i = 0; i < GRID * GRID; i++) {
          var isDug = dug.indexOf(i) >= 0, isBone = bones.indexOf(i) >= 0;
          out += '<button class="sandsq' + (isDug ? (isBone ? ' bone' : ' empty') : '') + '" data-c="' + i + '"' +
            (isDug ? ' disabled' : '') + ' aria-label="Dig here">' +
            (isDug ? (isBone ? '🦴' : '<span class="hole"></span>') : '') + '</button>';
        }
        return out;
      })() + '</div>' +
      '<div class="controls"><button class="gbtn" style="--c:var(--t6)" data-a="home">‹ All dino games</button></div>';
  }
  function dist(a, b) {
    var ax = a % GRID, ay = (a / GRID) | 0, bx = b % GRID, by = (b / GRID) | 0;
    return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
  }
  function digTap(c, el) {
    var g = gameById('dig');
    if (dug.indexOf(c) >= 0) return;
    dug.push(c);
    if (bones.indexOf(c) >= 0) {
      found++;
      el.classList.add('bone'); el.innerHTML = '🦴'; el.disabled = true;
      good(el);
      sfx('star');
      if (found >= 3) {
        /* fewer digs is better: nine or fewer is a perfect dig */
        var score = Math.max(1, 3 - Math.max(0, Math.floor((dug.length - 9) / 4)));
        later(function () {
          finish(g, score, 3, 'All three bones in ' + dug.length + ' digs. ' +
            (dug.length <= 9 ? 'You listened beautifully.' : 'Listen to the heartbeat and you can do it in fewer.'));
        }, 900);
        return;
      }
      $('#says').innerHTML = '<b class="qq">A bone! ' + found + ' of 3.</b><span>Keep listening for the next one.</span>';
      $('.qcount').textContent = found + ' of 3 bones · ' + dug.length + ' digs';
      return;
    }
    el.classList.add('empty'); el.innerHTML = '<span class="hole"></span>'; el.disabled = true;
    /* how close is the nearest bone still buried? */
    var near = 99;
    bones.forEach(function (b) { if (dug.indexOf(b) < 0) near = Math.min(near, dist(c, b)); });
    var beats = near <= 1 ? 5 : near === 2 ? 3 : 2;
    if (SND) {
      /* the recording when we have it, a scaled synth pulse otherwise, so
         "hot" and "cold" are audible either way */
      if (!SND.shot('dino-heartbeat', { vol: 0.4, dur: near <= 1 ? 2.2 : near === 2 ? 1.6 : 1.1,
                                        rate: near <= 1 ? 1.5 : near === 2 ? 1.15 : 0.85, send: 0.12 }))
        SND.sfx.heartbeat(beats);
      SND.haptic(near <= 1 ? [18, 60, 18] : 12);
    }
    $('#says').innerHTML = '<b class="qq">' + (near <= 1 ? 'Very warm! 🔥' : near === 2 ? 'Getting warmer…' : 'Cold over here.') +
      '</b><span>' + (near <= 1 ? 'A bone is right next to that hole.' : 'Listen to the heartbeat and dig again.') + '</span>';
    $('.qcount').textContent = found + ' of 3 bones · ' + dug.length + ' digs';
  }

  /* ══ THE WORLD: six games on a path ════════════════════════════════════
     Today's three sit at the front, the same way Study Island's shelf does,
     so a child who comes back tomorrow finds a different three waiting. */
  function world() {
    cancelAll(); showing = false;
    if (JY) JY.visit.mark('dino', 'Dino World');
    history.replaceState({}, '', location.pathname);
    var done = GAMES.filter(function (g) { return best(g.id) > 0; }).length;
    var todays = JY ? JY.daily.rotate(GAMES, 3, 7) : GAMES.slice(0, 3);
    var b = JY ? JY.buddy.get() : null;
    host.innerHTML =
      '<header><p class="ptitle"><span class="my">DINO</span><span class="pbig">' +
        'WORLD'.split('').map(function (ch, i) {
          return '<span style="color:' + TAPES[i % TAPES.length] + ';--r:' + ((i * 53) % 7 - 3) + 'deg">' + ch + '</span>';
        }).join('') + '</span></p>' +
      '<p class="togo">Six games, six real dinosaur voices — every roar here is a recording, not a beep</p>' +
      '<p class="count">' + done + ' <b>/</b> ' + GAMES.length + ' played</p></header>' +
      '<nav class="pills">' +
        '<a class="pill" style="--c:var(--t4)" href="/kids-adventure/art">🎨 Art World</a>' +
        '<a class="pill" style="--c:var(--t1)" href="/kids-adventure/piano">🎹 Piano World</a>' +
        '<a class="pill" style="--c:var(--t6)" href="/kids-adventure/study/">📚 Study Island</a>' +
        '<a class="pill" style="--c:var(--t3)" href="/kids-adventure/">🗺️ Journey map</a>' +
      '</nav>' +
      '<section class="todaybox">' +
        '<span class="tape" style="--c:#509858">Today’s three</span>' +
        '<p class="todaysub">Three picked for today. Come back tomorrow for three more — or play any of the six below.</p>' +
        '<div class="todayrow">' + todays.map(function (g, i) {
          return '<button class="todaycard" data-g="' + g.id + '" style="--c:' + TAPES[i % TAPES.length] + '">' +
            '<span class="tdicon">' + g.icon + '</span><b>' + g.title + '</b>' +
            '<i>' + (best(g.id) ? 'best ' + best(g.id) : g.tag) + '</i></button>';
        }).join('') + '</div>' +
      '</section>' +
      '<h2>All six games</h2><p class="sub">Every one of them pays into your star jar</p>' +
      '<div class="cards" style="--per:' + (innerWidth >= 980 ? 3 : innerWidth >= 640 ? 2 : 1) + '">' +
      GAMES.map(function (g, i) {
        return '<button class="card topiccard" data-g="' + g.id + '" style="--tilt:' + (((i % 3) - 1) * 0.7) + 'deg">' +
          '<span class="tape" style="--c:' + TAPES[i % TAPES.length] + '">' + g.tag + '</span>' +
          '<span class="ticon">' + g.icon + '</span>' +
          '<p class="lvlname">' + g.title + '</p>' +
          '<p class="lvlnote">' + g.blurb + '</p>' +
          '<div class="lvlfoot"><span class="cls"><s>' + (best(g.id) ? '★ best ' + best(g.id) : '☆') + '</s></span>' +
            '<span class="play">' + (best(g.id) ? 'Again →' : 'Play →') + '</span></div>' +
        '</button>';
      }).join('') + '</div>' +
      '<h2>Meet the herd</h2><p class="sub">Tap any one of them to hear its real voice</p>' +
      '<div class="dgrid three herd">' + HERD.map(function (d) {
        return '<button class="dcard" data-v="' + d.id + '" style="--c:' + d.col + '">' +
          '<span class="dpic">' + faceOf(d, 72) + '</span><b>' + d.name + '</b>' +
          '<i>' + (d.eats === 'plants' ? '🥬 plants' : '🍖 meat') + '</i></button>';
      }).join('') + '</div>' +
      (b && b.id ? '<p class="sub buddyline">' + JY.buddy.face(b, 30) + ' ' + b.name + ' is exploring with you</p>' : '');
    /* the roars this world needs, fetched while the child reads the titles */
    if (SND) SND.preload(['dino-roar','dino-roar-big','dino-growl','dino-call','dino-chirp','dino-chirp2','dino-grumble','dino-heartbeat']);
  }

  function start(id) {
    var g = gameById(id); if (!g) { world(); return; }
    cancelAll(); showing = false;
    closeRound();
    if (id === 'roar')   { openRound(g, ROAR_N);  gRoar(g, 1); }
    if (id === 'hatch')  { openRound(g, EGG_N);   gHatch(g, 0); }
    if (id === 'tracks') { openRound(g, TRACK_N); gTracks(g, 1); }
    if (id === 'feed')   { openRound(g, FEED_N);  gFeed(g, 1); }
    if (id === 'says')   { openRound(g, 0);       gSays(g, true); }
    if (id === 'dig')    { openRound(g, 3);       gDig(g, true); }
  }

  /* ── input ───────────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var gc = t.closest('[data-g]');
    if (gc) { sfx('tap'); start(gc.dataset.g); return; }
    var vc = t.closest('[data-v]');
    if (vc) { var d = herdById(vc.dataset.v); if (d) { voiceOf(d); say(d.name + '. ' + d.fact); } return; }
    var dc = t.closest('.dcard[data-d]');
    if (dc) { roarTap(dc.dataset.d, dc); return; }
    var fc = t.closest('.dcard[data-f]');
    if (fc) { feedTap(fc.dataset.f, fc); return; }
    var sc = t.closest('.dcard[data-s]');
    if (sc) { saysTap(sc.dataset.s, sc); return; }
    var sq = t.closest('.sandsq');
    if (sq) { digTap(+sq.dataset.c, sq); return; }
    var an = t.closest('.ans');
    if (an) {
      if (G && G.id === 'hatch')  hatchTap(an.dataset.ans, an);
      if (G && G.id === 'tracks') tracksTap(an.dataset.ans, an);
      return;
    }
    var a = (t.closest('[data-a]') || {}).dataset;
    if (!a) return;
    if (a.a === 'hear')   { var ans = herdById(host.dataset.answer); if (ans) voiceOf(ans); }
    if (a.a === 'replay') { playSeq(); }
    if (a.a === 'again')  { sfx('tap'); start((G && G.id) || lastId || 'roar'); }
    if (a.a === 'home')   { sfx('tap'); closeRound(); world(); }
  });

  /* ── boot ────────────────────────────────────────────────────────────── */
  host = $('#dino');
  if (host) {
    if (window.KJA && window.KJA.ui) window.KJA.ui.toolbar('#mutebar');
    var m = /[?&]g=([a-z0-9]+)/.exec(location.search);
    if (m && gameById(m[1])) start(m[1]); else world();
  }
  window.__dino = {
    games: GAMES.map(function (g) { return g.id; }),
    herd: HERD.map(function (d) { return { id: d.id, eats: d.eats, voice: d.voice }; }),
    prog: function () { return prog; },
    state: function () { return { game: G && G.id, score: roundScore, of: roundOf,
                                  seq: seq.slice(), step: step, bones: bones.slice(), dug: dug.slice(), found: found }; },
    start: start,
    sum: eggSum
  };
})();
