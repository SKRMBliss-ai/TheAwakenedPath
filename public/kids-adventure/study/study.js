/* ════════════════════════════════════════════════════════════════════════════
   STUDY ISLAND — school things, on the same paper as Art and Piano World.

   Three year groups (Reception & KG, Year 1, Year 2), each a shelf of topics,
   each topic a round of eight questions. Questions are generated rather than
   listed wherever generating them is honest — number bonds, tables, time,
   money — so practice never runs out and never repeats the same eight; the
   reading and phonics topics come from small fixed banks because the words
   matter more than the variety.

   Shared with the rest of the adventure: the paper, the cards, the painted
   tapes, the sound kit, the mute switch. Progress lives in localStorage under
   kja:study and never leaves the device.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var $  = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var TAPES = ['#3880C0','#E06098','#509858','#F89030','#A070C0','#50A8B0','#F0B828'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── helpers ───────────────────────────────────────────────────────────── */
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* Wrong answers a child could plausibly believe, not random noise. */
  function near(correct, lo, hi, n) {
    var out = [], tries = 0;
    while (out.length < (n || 3) && tries++ < 60) {
      var d = pick([-3,-2,-1,1,2,3,5,10]), v = correct + d;
      if (v >= lo && v <= hi && v !== correct && out.indexOf(v) < 0) out.push(v);
    }
    while (out.length < (n || 3)) { var v2 = lo + rnd(hi - lo + 1); if (v2 !== correct && out.indexOf(v2) < 0) out.push(v2); }
    return out;
  }
  function num(q, a, lo, hi, why) {
    return { q: q, opts: shuffle([a].concat(near(a, lo, hi))).map(String), a: String(a), why: why };
  }
  function shapeSVG(kind, colour) {
    var c = colour || '#3880C0';
    var body = {
      circle:   '<circle cx="50" cy="50" r="34" fill="' + c + '"/>',
      square:   '<rect x="18" y="18" width="64" height="64" rx="6" fill="' + c + '"/>',
      triangle: '<path d="M50 14 86 84H14Z" fill="' + c + '"/>',
      rectangle:'<rect x="10" y="28" width="80" height="44" rx="6" fill="' + c + '"/>',
      star:     '<path d="M50 12 61 40l30 2-23 19 8 29-26-16-26 16 8-29-23-19 30-2z" fill="' + c + '"/>',
      oval:     '<ellipse cx="50" cy="50" rx="38" ry="26" fill="' + c + '"/>'
    }[kind];
    return '<svg viewBox="0 0 100 100" class="qshape" role="img" aria-label="a shape">' + body + '</svg>';
  }
  function clockSVG(h, m) {
    var ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
    var hx = 50 + 22 * Math.sin(ha * Math.PI / 180), hy = 50 - 22 * Math.cos(ha * Math.PI / 180);
    var mx = 50 + 32 * Math.sin(ma * Math.PI / 180), my = 50 - 32 * Math.cos(ma * Math.PI / 180);
    var ticks = '';
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180;
      ticks += '<circle cx="' + (50 + 38 * Math.sin(a)).toFixed(1) + '" cy="' + (50 - 38 * Math.cos(a)).toFixed(1) +
               '" r="' + (i % 3 === 0 ? 2.6 : 1.5) + '" fill="#14265E"/>';
    }
    return '<svg viewBox="0 0 100 100" class="qclock" role="img" aria-label="a clock face">' +
      '<circle cx="50" cy="50" r="46" fill="#FFFDF6" stroke="#E7C98A" stroke-width="4"/>' + ticks +
      '<line x1="50" y1="50" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="#14265E" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="50" y1="50" x2="' + mx.toFixed(1) + '" y2="' + my.toFixed(1) + '" stroke="#E06098" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="50" cy="50" r="4" fill="#14265E"/></svg>';
  }
  function coins(list) {
    return '<span class="qcoins">' + list.map(function (c) {
      return '<span class="coin' + (c >= 100 ? ' pound' : '') + '">' + (c >= 100 ? '£' + (c / 100) : c + 'p') + '</span>';
    }).join('') + '</span>';
  }
  function things(emoji, n) {
    var out = '';
    for (var i = 0; i < n; i++) out += emoji;
    return '<span class="qthings">' + out + '</span>';
  }
  function timeWords(h, m) {
    var H = ['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
    var nh = H[h % 12], next = H[(h + 1) % 12];
    if (m === 0)  return nh + " o'clock";
    if (m === 15) return 'quarter past ' + nh;
    if (m === 30) return 'half past ' + nh;
    if (m === 45) return 'quarter to ' + next;
    return nh + ' ' + m;
  }

  /* ── the three year groups ─────────────────────────────────────────────── */
  var PHONICS = [
    { s:'s', words:['sun','sock','sit'], not:['mat','pen','dog'] },
    { s:'m', words:['mat','moon','mum'], not:['sit','top','red'] },
    { s:'t', words:['top','tap','ten'],  not:['sun','bed','log'] },
    { s:'p', words:['pen','pig','pot'],  not:['mat','sun','dig'] },
    { s:'c', words:['cat','cup','cot'],  not:['sit','pen','mud'] },
    { s:'d', words:['dog','dig','dad'],  not:['sun','top','mat'] }
  ];
  var CVC = [
    { w:'cat', e:'🐱' }, { w:'dog', e:'🐶' }, { w:'sun', e:'☀️' }, { w:'bus', e:'🚌' },
    { w:'pig', e:'🐷' }, { w:'hat', e:'🎩' }, { w:'bed', e:'🛏️' }, { w:'fish', e:'🐟' },
    { w:'frog', e:'🐸' }, { w:'star', e:'⭐' }, { w:'moon', e:'🌙' }, { w:'cake', e:'🎂' }
  ];
  var DIGRAPHS = [
    { d:'sh', yes:['ship','shop','fish','brush'], no:['cat','pen','dog','milk'] },
    { d:'ch', yes:['chip','chin','lunch','chair'], no:['sun','frog','bed','tree'] },
    { d:'th', yes:['this','thin','bath','three'], no:['pig','sock','duck','lamp'] },
    { d:'ai', yes:['rain','tail','snail','train'], no:['bell','hand','sock','frog'] },
    { d:'ee', yes:['tree','feet','sheep','green'], no:['sock','hand','pig','duck'] },
    { d:'oo', yes:['moon','boot','spoon','zoo'], no:['bat','leg','sand','desk'] }
  ];
  var EXCEPTION = [
    ['because','becuase','becase'], ['beautiful','beutiful','beautifull'],
    ['friend','freind','frend'], ['people','peaple','pepole'],
    ['because','becoz','becuz'], ['school','skool','scool'],
    ['every','evry','everey'], ['climb','clime','climbe'],
    ['half','haf','halve'], ['Christmas','Cristmas','Christmass']
  ];
  var DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var YEARS = [
    {
      id:'r', name:'Reception & KG', sub:'Ages 4–5', icon:'🧸', colour:'#F89030',
      blurb:'Letters and their sounds, counting what you can see, shapes and first words.',
      topics:[
        { id:'sounds', icon:'🔤', title:'Letters & sounds', tag:'Phonics',
          make:function () {
            var p = pick(PHONICS), w = pick(p.words);
            return { q:'Which word starts with the sound <b>' + p.s + '</b>?',
              opts: shuffle([w].concat(shuffle(p.not).slice(0, 3))), a:w,
              why:'<b>' + w + '</b> starts with ' + p.s + '.' };
          } },
        { id:'count10', icon:'🍎', title:'Counting to 10', tag:'Number',
          make:function () {
            var n = 1 + rnd(10), e = pick(['🍎','⭐','🐟','🎈','🐝','🍓']);
            return { q:'How many can you count?', art: things(e, n),
              opts: shuffle([n].concat(near(n, 1, 12))).map(String), a:String(n),
              why:'There are <b>' + n + '</b>.' };
          } },
        { id:'shapes', icon:'🔺', title:'Shapes', tag:'Shape',
          make:function () {
            var names = ['circle','square','triangle','rectangle','star','oval'], k = pick(names);
            return { q:'What shape is this?', art: shapeSVG(k, pick(TAPES)),
              opts: shuffle([k].concat(shuffle(names.filter(function (n) { return n !== k; })).slice(0, 3))), a:k,
              why:'That is a <b>' + k + '</b>.' };
          } },
        { id:'words', icon:'🐱', title:'First words', tag:'Reading',
          make:function () {
            var c = pick(CVC);
            return { q:'Which word says this?', art:'<span class="qbig">' + c.e + '</span>',
              opts: shuffle([c.w].concat(shuffle(CVC.filter(function (x) { return x.w !== c.w; })).slice(0, 3).map(function (x) { return x.w; }))),
              a:c.w, why:'<b>' + c.w + '</b> — ' + c.e };
          } },
        { id:'more', icon:'⚖️', title:'More or fewer', tag:'Number',
          make:function () {
            var a = 1 + rnd(9), b = 1 + rnd(9);
            while (b === a) b = 1 + rnd(9);
            var big = Math.max(a, b);
            return { q:'Which number is <b>bigger</b>?', opts: shuffle([String(a), String(b)]), a:String(big),
              why:'<b>' + big + '</b> is bigger than ' + Math.min(a, b) + '.' };
          } },
        { id:'order', icon:'🔢', title:'What comes next?', tag:'Number',
          make:function () {
            var s = 1 + rnd(7);
            return num('What comes after <b>' + s + ', ' + (s + 1) + ', ' + (s + 2) + '</b>?', s + 3, 1, 12,
              'Counting on: ' + (s + 2) + ' then <b>' + (s + 3) + '</b>.');
          } }
      ]
    },
    {
      id:'y1', name:'Year 1', sub:'Ages 5–6', icon:'🎒', colour:'#509858',
      blurb:'Number bonds, adding and taking away to 20, counting in steps, digraphs, days and coins.',
      topics:[
        { id:'bonds', icon:'🤝', title:'Number bonds to 10', tag:'Number',
          make:function () {
            var a = rnd(11);
            return num('<b>' + a + '</b> + ? = 10', 10 - a, 0, 10, a + ' + <b>' + (10 - a) + '</b> = 10.');
          } },
        { id:'add20', icon:'➕', title:'Adding to 20', tag:'Number',
          make:function () {
            var a = 2 + rnd(12), b = 1 + rnd(20 - a);
            return num(a + ' + ' + b + ' = ?', a + b, 1, 20, a + ' + ' + b + ' = <b>' + (a + b) + '</b>.');
          } },
        { id:'sub20', icon:'➖', title:'Taking away', tag:'Number',
          make:function () {
            var a = 5 + rnd(16), b = 1 + rnd(a - 1);
            return num(a + ' − ' + b + ' = ?', a - b, 0, 20, a + ' − ' + b + ' = <b>' + (a - b) + '</b>.');
          } },
        { id:'steps', icon:'👣', title:'Counting in 2s, 5s and 10s', tag:'Number',
          make:function () {
            var step = pick([2, 5, 10]), start = step * (1 + rnd(5));
            return num('Count in ' + step + 's: <b>' + start + ', ' + (start + step) + ', ' + (start + step * 2) + '</b>, then?',
              start + step * 3, 0, 100, 'Add ' + step + ' each time → <b>' + (start + step * 3) + '</b>.');
          } },
        { id:'digraph', icon:'🔡', title:'Two letters, one sound', tag:'Phonics',
          make:function () {
            var d = pick(DIGRAPHS), w = pick(d.yes);
            return { q:'Which word has <b>' + d.d + '</b> in it?',
              opts: shuffle([w].concat(shuffle(d.no).slice(0, 3))), a:w,
              why:'<b>' + w + '</b> has ' + d.d + '.' };
          } },
        { id:'days', icon:'📅', title:'Days and months', tag:'Time',
          make:function () {
            if (rnd(2)) {
              var i = rnd(7), d = DAYS[i], nx = DAYS[(i + 1) % 7];
              return { q:'What day comes after <b>' + d + '</b>?',
                opts: shuffle([nx].concat(shuffle(DAYS.filter(function (x) { return x !== nx && x !== d; })).slice(0, 3))),
                a:nx, why:'After ' + d + ' comes <b>' + nx + '</b>.' };
            }
            var j = rnd(12), m = MONTHS[j], mn = MONTHS[(j + 1) % 12];
            return { q:'Which month comes after <b>' + m + '</b>?',
              opts: shuffle([mn].concat(shuffle(MONTHS.filter(function (x) { return x !== mn && x !== m; })).slice(0, 3))),
              a:mn, why:'After ' + m + ' comes <b>' + mn + '</b>.' };
          } },
        { id:'coins1', icon:'🪙', title:'Coins', tag:'Money',
          make:function () {
            var set = pick([[1,1,1],[2,2,1],[5,5],[10,5,1],[20,10],[2,2,2,1],[5,2,2]]);
            var total = set.reduce(function (a, b) { return a + b; }, 0);
            return { q:'How much is this altogether?', art: coins(set),
              opts: shuffle([total].concat(near(total, 1, 60))).map(function (v) { return v + 'p'; }), a: total + 'p',
              why:'That makes <b>' + total + 'p</b>.' };
          } }
      ]
    },
    {
      id:'y2', name:'Year 2', sub:'Ages 6–7', icon:'📚', colour:'#3880C0',
      blurb:'Times tables, two-digit sums, fractions, telling the time, money and tricky spellings.',
      /* Year 2 also has the studio's full Quest: every concept taught properly,
         ten games each, and SATs-style practice. The quick rounds below are for
         five spare minutes; the Quest is for a whole afternoon. */
      quest:{ href:'/kids-adventure/study/year2/', title:'Year 2 Learning Quest',
              blurb:'Every concept with a lesson, a build-up ladder, ten games and SATs practice' },
      topics:[
        { id:'tables', icon:'✖️', title:'2, 5 and 10 times tables', tag:'Number',
          make:function () {
            var t = pick([2, 5, 10]), n = 1 + rnd(12);
            return num(t + ' × ' + n + ' = ?', t * n, 0, 130, t + ' × ' + n + ' = <b>' + (t * n) + '</b>.');
          } },
        { id:'twodigit', icon:'🧮', title:'Two-digit sums', tag:'Number',
          make:function () {
            var a = 11 + rnd(78), b = 1 + rnd(Math.min(40, 99 - a));
            if (rnd(2)) return num(a + ' + ' + b + ' = ?', a + b, 1, 99, a + ' + ' + b + ' = <b>' + (a + b) + '</b>.');
            return num(a + ' − ' + b + ' = ?', a - b, 0, 99, a + ' − ' + b + ' = <b>' + (a - b) + '</b>.');
          } },
        { id:'fractions', icon:'🍕', title:'Halves and quarters', tag:'Fractions',
          make:function () {
            var f = pick([2, 4]), base = f * (1 + rnd(6));
            return num('What is <b>' + (f === 2 ? 'half' : 'a quarter') + '</b> of ' + base + '?', base / f, 0, 60,
              base + ' shared into ' + f + ' is <b>' + (base / f) + '</b>.');
          } },
        { id:'time', icon:'🕐', title:'Telling the time', tag:'Time',
          make:function () {
            var h = 1 + rnd(12), m = pick([0, 15, 30, 45]);
            var right = timeWords(h, m);
            var wrongs = [timeWords(h, pick([0,15,30,45].filter(function (x) { return x !== m; }))),
                          timeWords((h % 12) + 1, m), timeWords((h + 10) % 12 || 12, m)];
            var opts = [right];
            wrongs.forEach(function (w) { if (opts.indexOf(w) < 0) opts.push(w); });
            return { q:'What time does the clock say?', art: clockSVG(h, m),
              opts: shuffle(opts).slice(0, 4), a:right, why:'It is <b>' + right + '</b>.' };
          } },
        { id:'money2', icon:'💰', title:'Money and change', tag:'Money',
          make:function () {
            var price = 5 * (1 + rnd(11)), paid = pick([50, 100]);
            while (paid <= price) paid = 100;
            var change = paid - price;
            return { q:'A sticker costs <b>' + price + 'p</b> and you pay with ' +
                (paid === 100 ? '<b>£1</b>' : '<b>50p</b>') + '. How much change?',
              opts: shuffle([change].concat(near(change, 0, 95))).map(function (v) { return v + 'p'; }),
              a: change + 'p', why: paid + 'p − ' + price + 'p = <b>' + change + 'p</b>.' };
          } },
        { id:'oddeven', icon:'🎲', title:'Odd, even and place value', tag:'Number',
          make:function () {
            var n = 10 + rnd(90);
            if (rnd(2)) {
              return { q:'Is <b>' + n + '</b> odd or even?', opts:['odd','even'], a: n % 2 ? 'odd' : 'even',
                why:'It ends in ' + (n % 10) + ', so it is <b>' + (n % 2 ? 'odd' : 'even') + '</b>.' };
            }
            var tens = Math.floor(n / 10);
            return num('How many <b>tens</b> are in ' + n + '?', tens, 0, 9,
              n + ' is ' + tens + ' tens and ' + (n % 10) + ' ones.');
          } },
        { id:'spelling', icon:'✏️', title:'Tricky spellings', tag:'Writing',
          make:function () {
            var e = pick(EXCEPTION);
            return { q:'Which one is spelled correctly?', opts: shuffle(e), a:e[0],
              why:'<b>' + e[0] + '</b> is the right spelling.' };
          } }
      ]
    }
  ];

  /* ── sound and juice come from the shared kit now ────────────────────── */
  var SND = (window.KJA && window.KJA.sound) || null;
  var JUICE = (window.KJA && window.KJA.juice) || null;
  function yes()   { if (SND) SND.sfx.good(); }
  function nope()  { if (SND) SND.sfx.wrong(); }
  function pop()   { if (SND) { SND.sfx.tap(); SND.haptic(10); } }
  function fanfare() { if (SND) SND.sfx.win(); }

  function toast(t) {
    var el = $('#toast'); if (!el) return;
    el.textContent = t; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2300);
  }
  function confetti(n) { if (JUICE) JUICE.confetti(n); }

  /* ── progress ──────────────────────────────────────────────────────────── */
  var prog = {};
  try { prog = JSON.parse(localStorage.getItem('kja:study') || '{}') || {}; } catch (e) { prog = {}; }
  function save() { try { localStorage.setItem('kja:study', JSON.stringify(prog)); } catch (e) {} }
  function starsOf(yid, tid) { return (prog[yid] && prog[yid][tid]) || 0; }
  function setStars(yid, tid, n) {
    if (!prog[yid]) prog[yid] = {};
    if ((prog[yid][tid] || 0) < n) prog[yid][tid] = n;
    save();
  }
  /* Takes a year id, since that is what every caller has to hand. */
  function yearStars(id) {
    var y = yearById(id);
    if (!y) return 0;
    return y.topics.reduce(function (a, t) { return a + starsOf(id, t.id); }, 0);
  }
  function starRow(n, of) {
    var out = '';
    for (var i = 1; i <= (of || 3); i++) out += i <= n ? '★' : '☆';
    return out;
  }
  function yearById(id) {
    for (var i = 0; i < YEARS.length; i++) if (YEARS[i].id === id) return YEARS[i];
    return null;
  }

  function titleHTML(word) {
    var out = '', j = 0;
    for (var i = 0; i < word.length; i++) {
      var ch = word[i];
      if (ch === ' ') { out += '<span style="width:.34em"></span>'; continue; }
      out += '<span style="color:' + TAPES[j % TAPES.length] + ';--r:' + ((j * 53) % 7 - 3) + 'deg">' + ch + '</span>';
      j++;
    }
    return out;
  }
  function mute() { if (window.KJA && window.KJA.ui) window.KJA.ui.toolbar('#mutebar'); }

  /* ══ THE ISLAND: three year groups to choose from ══════════════════════ */
  function island() {
    if (JOURNEY) JOURNEY.visit.mark('study', 'Study Island');
    $('#study').innerHTML =
      '<header><p class="ptitle"><span class="my">MY</span><span class="pbig">' +
        titleHTML('STUDY ISLAND') + '</span></p>' +
      '<p class="togo">School things, the adventure way — pick your year</p></header>' +
      '<div class="cards yearshelf" style="--per:' + (innerWidth >= 900 ? 3 : 1) + '">' +
      YEARS.map(function (y, i) {
        var got = yearStars(y.id), of = y.topics.length * 3;
        return '<a class="card yearcard" href="/kids-adventure/study/year/?y=' + y.id + '" style="--tilt:' + ((i - 1) * 0.8) + 'deg">' +
          (got >= of ? '<span class="crown">👑</span>' : '') +
          '<span class="tape" style="--c:' + y.colour + '">' + y.name + '</span>' +
          '<div class="frame songface" style="border-color:' + y.colour + '33">' + y.icon + '</div>' +
          '<p class="lvlname">' + y.name + '</p>' +
          '<p class="lvlnote">' + y.sub + ' · ' + y.topics.length + ' topics<br>' + y.blurb + '</p>' +
          '<div class="pbar" aria-hidden="true"><span style="width:' + Math.round(got / of * 100) + '%"></span></div>' +
          '<div class="lvlfoot"><span class="cls"><s>★</s> ' + got + ' / ' + of + ' stars</span>' +
            '<span class="play">Go in →</span></div>' +
        '</a>';
      }).join('') + '</div>' +
      (YEARS.filter(function (y) { return y.quest; }).map(function (y) {
        return '<a class="questcard" href="' + y.quest.href + '">' +
          '<span class="tape" style="--c:' + y.colour + '">' + y.name + ' · the big one</span>' +
          '<span class="qicon">🗺️</span>' +
          '<span class="qtext"><b>' + y.quest.title + '</b><span>' + y.quest.blurb + '</span></span>' +
          '<span class="play">Start the Quest →</span></a>';
      }).join('')) +
      '<h2>What is inside</h2><p class="sub">Every topic is a round of eight questions, and it never asks the same eight twice</p>' +
      '<div class="topicgrid">' + YEARS.map(function (y) {
        return y.topics.map(function (t) {
          return '<span class="topicchip" style="--c:' + y.colour + '">' + t.icon + ' ' + t.title + '</span>';
        }).join('');
      }).join('') + '</div>';
  }

  /* ══ A YEAR: its topics, and a round of eight when one is opened ═══════ */
  var Y = null, T = null, Q = null, qn = 0, right = 0, answered = false;
  var ROUND = 8;
  /* A round now insists on a right answer before it moves on, and moves on by
     itself the moment it gets one:
       tries     wrong attempts on THIS question, which is what decides how
                 much help to offer next
       firstTry  whether this question was right first time — the stars are
                 for that, not for eventually finding it by elimination
       lastQ     the question just finished, kept so a child can go back and
                 look at it after the round has already moved on
       autoT     the pending auto-advance, cancelled if they tap "let me look"
       nudgeT    the "you seem stuck" nudge that draws the eye back to the
                 question if nothing has been tapped for a while */
  var tries = 0, firstTry = true, lastQ = null, autoT = null, nudgeT = null;
  /* the round clears T when it finishes, so "play again" needs the id kept */
  var lastTopicId = '';
  var JOURNEY = (window.KJA && window.KJA.journey) || null;
  /* Getting it wrong should sound like a person, not a machine. */
  var NUDGE = ['Nearly — have another look.', 'Not that one. Try again!',
               'Good try. One of the others!', 'Hmm, not quite — go on, again.',
               'Keep going, you can find it.'];
  var WELL  = ['Yes!', 'That\u2019s it!', 'Spot on!', 'Exactly right!', 'Brilliant!'];

  function yearHome() {
    T = null;
    history.replaceState({}, '', '?y=' + Y.id);
    if (JOURNEY) JOURNEY.visit.mark('study', Y.name + ' · Quick practice', { y: Y.id });
    var got = yearStars(Y.id), of = Y.topics.length * 3;
    /* ── today's three ──────────────────────────────────────────────────
       The same topics, but a different three on the front of the shelf every
       morning, so there is a reason to come back tomorrow that isn't "do more
       of the thing you did yesterday". Ticked once played, and still playable
       again straight away — a child who wants to repeat one should never be
       told no. */
    var done = playedToday(Y.id);
    var pickToday = JOURNEY ? JOURNEY.daily.rotate(Y.topics, 3, Y.id.charCodeAt(0)) : Y.topics.slice(0, 3);
    var allDone = pickToday.every(function (t) { return done.indexOf(t.id) >= 0; });
    var todayHTML =
      '<section class="todaybox">' +
        '<span class="tape" style="--c:' + Y.colour + '">Today\u2019s games</span>' +
        '<p class="todaysub">' + (allDone
          ? 'All three done today \u2014 play any of them again, or pick from the whole shelf below.'
          : 'Three new ones, picked for today. Come back tomorrow for three more.') + '</p>' +
        '<div class="todayrow">' + pickToday.map(function (t, i) {
          var did = done.indexOf(t.id) >= 0;
          return '<button class="todaycard' + (did ? ' did' : '') + '" data-topic="' + t.id + '" ' +
            'style="--c:' + TAPES[i % TAPES.length] + '">' +
            '<span class="tdicon">' + t.icon + '</span>' +
            '<b>' + t.title + '</b>' +
            '<i>' + (did ? '\u2713 played today' : starRow(starsOf(Y.id, t.id))) + '</i></button>';
        }).join('') + '</div>' +
      '</section>';
    $('#study').innerHTML =
      '<header><p class="ptitle"><span class="my">' + Y.sub.toUpperCase() + '</span>' +
        '<span class="pbig">' + titleHTML(Y.name.toUpperCase()) + '</span></p>' +
      '<p class="count">' + got + ' <b>/</b> ' + of + ' stars</p>' +
      '<p class="togo">' + Y.blurb + '</p>' +
      '<div class="trail"><span class="sign">Start</span>' + trail(got, of) + '<span class="sign r">All done</span>' +
        '<span class="peak"></span></div></header>' +
      '<nav class="pills">' + YEARS.map(function (y) {
        return '<a class="pill" style="--c:' + y.colour + '" href="?y=' + y.id + '" ' +
          'aria-selected="' + (y.id === Y.id) + '">' + y.icon + ' ' + y.name + '</a>';
      }).join('') + '</nav>' +
      (Y.quest ? '<a class="questcard" href="' + Y.quest.href + '">' +
          '<span class="tape" style="--c:' + Y.colour + '">The big one</span>' +
          '<span class="qicon">🗺️</span>' +
          '<span class="qtext"><b>' + Y.quest.title + '</b><span>' + Y.quest.blurb + '</span></span>' +
          '<span class="play">Start the Quest →</span></a>' : '') +
      todayHTML +
      '<h2>Quick practice</h2><p class="sub">Five spare minutes? Take a round of eight.</p>' +
      '<div class="cards topicshelf" style="--per:' + (innerWidth >= 980 ? 3 : innerWidth >= 640 ? 2 : 1) + '">' +
      Y.topics.map(function (t, i) {
        var st = starsOf(Y.id, t.id);
        return '<button class="card topiccard" data-topic="' + t.id + '" style="--tilt:' + (((i % 3) - 1) * 0.7) + 'deg">' +
          '<span class="tape" style="--c:' + TAPES[i % TAPES.length] + '">' + t.tag + '</span>' +
          '<span class="ticon">' + t.icon + '</span>' +
          '<p class="lvlname">' + t.title + '</p>' +
          '<div class="lvlfoot"><span class="cls"><s>' + starRow(st) + '</s></span>' +
            '<span class="play">' + (st ? 'Again →' : 'Start →') + '</span></div>' +
        '</button>';
      }).join('') + '</div>';
  }
  function trail(got, of) {
    var beads = 12, lit = Math.round(got / of * beads), W = 600, y = 23, x0 = 30, x1 = W - 30;
    var gap = (x1 - x0) / (beads - 1);
    var s = '<svg viewBox="0 0 ' + W + ' 46" preserveAspectRatio="none" role="img" aria-label="' +
      got + ' of ' + of + ' stars"><path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="#E7D2AC" stroke-width="9" stroke-linecap="round"/>';
    for (var i = 0; i < beads; i++) {
      var cx = x0 + gap * i;
      s += i < lit
        ? '<circle cx="' + cx + '" cy="' + y + '" r="15" fill="' + TAPES[i % TAPES.length] + '" stroke="#fff" stroke-width="3"/>' +
          '<path transform="translate(' + cx + ' ' + y + ') scale(.62)" d="M0-11 3.4-3.5 11.6-3.3 5 2 7.1 10 0 5.3-7.1 10-5 2-11.6-3.3-3.4-3.5Z" fill="#FFE9A8"/>'
        : '<circle cx="' + cx + '" cy="' + y + '" r="11" fill="#FFFCF2" stroke="#E0CFAB" stroke-width="2.5"/>';
    }
    return s + '</svg>';
  }

  function startTopic(id) {
    T = null;
    Y.topics.forEach(function (t) { if (t.id === id) T = t; });
    if (!T) return;
    qn = 0; right = 0; lastQ = null; lastTopicId = id;
    history.replaceState({}, '', '?y=' + Y.id + '&t=' + id);
    /* Nothing celebratory may take the screen from here until the round is
       over — an egg that starts hatching over question four is the surprise
       ruining the thing it was meant to reward. */
    if (JOURNEY) {
      JOURNEY.hold.open();
      JOURNEY.visit.mark('study', Y.name + ' · ' + T.title, { y: Y.id, t: id });
    }
    nextQuestion();
  }
  /* leaving a round early still has to let the held surprises out, or they sit
     in the queue until the page is reloaded */
  function leaveRound() {
    clearTimers();
    if (T && JOURNEY) JOURNEY.hold.release();
    T = null;
  }
  function clearTimers() { clearTimeout(autoT); clearTimeout(nudgeT); autoT = null; nudgeT = null; }

  function nextQuestion() {
    clearTimers();
    answered = false; tries = 0; firstTry = true;
    Q = T.make();
    qn++;
    var pct = Math.round((qn - 1) / ROUND * 100);
    $('#study').innerHTML =
      '<header><p class="qtag" style="--c:' + Y.colour + '">' + Y.name + ' · ' + T.icon + ' ' + T.title + '</p>' +
      '<div class="qbar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<p class="qcount">Question ' + qn + ' of ' + ROUND + ' · ' + starRow(Math.min(3, right ? Math.ceil(right / 3) : 0)) + '</p></header>' +
      '<div class="coach" id="coach"><span class="dyno" aria-hidden="true"></span>' +
        '<div class="says ask" id="says" role="status" aria-live="polite"><b class="qq">' + Q.q + '</b>' +
        (Q.art ? '<span class="qart">' + Q.art + '</span>' : '') + '</div></div>' +
      '<div class="answers" id="answers">' + Q.opts.map(function (o) {
        return '<button class="ans" data-ans="' + String(o).replace(/"/g, '&quot;') + '">' + o + '</button>';
      }).join('') + '</div>' +
      '<div class="controls">' +
        (lastQ ? '<button class="gbtn ghostbtn" data-a="look">◂ My last answer</button>' : '') +
        '<button class="gbtn" style="--c:var(--t6)" data-a="quit">‹ All topics</button></div>';
    if (SND) SND.speak(Q.q + (Q.opts.length <= 4 ? '. Is it ' + Q.opts.join(', or ') + '?' : ''));
    var s = JUICE && JUICE.streak();
    if (s >= 2) JUICE.banner(s + ' in a row! ' + (s >= 5 ? '🔥' : '⭐'));
    armNudge();
  }
  /* A child who has stopped tapping has usually lost the question rather than
     the answer — so the question itself comes back to find them: it wobbles,
     grows, and (if read-aloud is on) asks again. */
  function armNudge(delay) {
    clearTimeout(nudgeT);
    nudgeT = setTimeout(function () {
      if (answered) return;
      var q = $('#says');
      if (q) { q.classList.remove('hunt'); void q.offsetWidth; q.classList.add('hunt'); }
      if (SND) { SND.sfx.tick(); SND.speak(Q.q); }
      armNudge(14000);
    }, delay || 8000);
  }
  /* A wrong answer is no longer the end of the question.

     The round will not move past a question until the child has tapped the
     right answer — a child who is carried past the thing they did not
     understand has learnt nothing, and knows it. So a wrong tap takes that
     option off the table, says something kind, and leaves the question up.
     Help escalates rather than arriving all at once: the second wrong tap
     quietly removes another wrong option, and the third points straight at
     the answer, so nobody can be stuck in front of a question forever.

     The stars are for getting it right FIRST time (`firstTry`), which is what
     keeps "keep trying until it's right" from also meaning "three stars for
     tapping everything". */
  function answer(val, el) {
    if (answered) return;
    var ok = String(val) === String(Q.a);
    var c = $('#coach'), s = $('#says');

    if (!ok) {
      tries++; firstTry = false;
      clearTimeout(nudgeT);
      if (el) { el.classList.add('bad'); el.disabled = true; }
      if (JUICE) JUICE.miss(); else nope();
      if (c) { c.classList.remove('yes','no'); void c.offsetWidth; c.classList.add('no'); }
      if (s) {
        var old = s.querySelector('.why'); if (old) old.remove();
        s.insertAdjacentHTML('beforeend', '<span class="why">' + NUDGE[Math.min(tries - 1, NUDGE.length - 1)] + '</span>');
      }
      /* From the second miss on, the choice narrows: one of the remaining
         wrong answers is taken off the board each time. When only the answer
         and one wrong one are left there is nothing honest left to narrow, so
         that is the moment it simply shows them — a four-option question
         therefore reveals after two misses and a six-option one after three,
         which is the same amount of help either way. */
      if (tries >= 2) {
        var spare = $$('.ans').filter(function (b) {
          return !b.disabled && b.dataset.ans !== String(Q.a);
        });
        if (spare.length > 1) {
          var drop = spare[rnd(spare.length)];
          drop.classList.add('faded'); drop.disabled = true;
          if (SND) SND.sfx.swish();
        } else {
          /* show them. Nobody is left sitting in front of a wall. */
          $$('.ans').forEach(function (b) { if (b.dataset.ans === String(Q.a)) b.classList.add('nudge'); });
          if (s) {
            var o2 = s.querySelector('.why'); if (o2) o2.remove();
            s.insertAdjacentHTML('beforeend', '<span class="why">Here it is — tap the glowing one. ' + (Q.why || '') + '</span>');
          }
          if (SND) SND.speak('Tap the one that is glowing. The answer is ' + Q.a);
        }
      }
      armNudge(12000);
      return;                                        /* the question stays up */
    }

    /* ── right ──────────────────────────────────────────────────────────── */
    answered = true;
    clearTimers();
    if (firstTry) right++;
    $$('.ans').forEach(function (b) {
      b.classList.remove('nudge');
      if (b.dataset.ans === String(Q.a)) b.classList.add('good');
      b.disabled = true;
    });
    if (JUICE) { JUICE.hit(el); JUICE.pop(el, firstTry ? '+1 ★' : 'Got it!', '#2E7A38'); JUICE.burstAt(el, 8); }
    else yes();
    /* the star travels to the jar in the corner, which is the only score a
       child actually watches */
    if (JOURNEY && firstTry) JOURNEY.stars.add(1, el);
    if (c) { c.classList.remove('yes','no'); void c.offsetWidth; c.classList.add('yes'); }
    if (s) {
      var o3 = s.querySelector('.why'); if (o3) o3.remove();
      s.insertAdjacentHTML('beforeend', '<span class="why ok">' +
        (firstTry ? WELL[rnd(WELL.length)] + ' ' : 'Got there! ') + (Q.why || '') + '</span>');
    }
    /* keep it, so the next screen can offer a look back at it */
    lastQ = { q: Q.q, art: Q.art || '', a: Q.a, why: Q.why || '', n: qn, first: firstTry };

    /* ── and move on, by itself ─────────────────────────────────────────
       A child who has just got it right does not want to hunt for a Next
       button; they want the next question. It arrives on its own after a beat
       long enough to see the tick and read the why — and the beat is longer
       when there was something to explain. "Let me look" stops the clock for
       anyone who wants to sit with it. */
    var wait = (Q.why ? 2100 : 1350) + (qn >= ROUND ? 600 : 0);
    var box = $('.controls');
    if (box) box.innerHTML =
      '<button class="gbtn wait" style="--c:var(--t3)" data-a="next">' +
        (qn >= ROUND ? 'See how you did →' : 'Next question →') +
        '<i class="tick" style="--d:' + wait + 'ms"></i></button>' +
      '<button class="gbtn ghostbtn" data-a="stay">⏸ Let me look</button>';
    autoT = setTimeout(function () { autoT = null; advance(); }, wait);
  }
  function advance() { if (qn >= ROUND) finishRound(); else nextQuestion(); }
  /* stop the auto-advance — the child wants to stay with this one */
  function stay() {
    clearTimeout(autoT); autoT = null;
    if (SND) SND.sfx.tap();
    var box = $('.controls');
    if (box) box.innerHTML =
      '<button class="gbtn" style="--c:var(--t3)" data-a="next">' +
        (qn >= ROUND ? 'See how you did →' : 'Next question →') + '</button>' +
      '<button class="gbtn" style="--c:var(--t6)" data-a="quit">‹ All topics</button>';
  }
  /* the look back at the question the round has already left behind */
  function lookBack() {
    if (!lastQ) return;
    if (SND) SND.sfx.page();
    var m = document.createElement('div');
    m.className = 'md lookback';
    m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="My last answer">' +
      '<h3>Question ' + lastQ.n + '</h3>' +
      '<div class="lookq"><b>' + lastQ.q + '</b>' + (lastQ.art ? '<span class="qart">' + lastQ.art + '</span>' : '') + '</div>' +
      '<p class="looka"><span class="tick2">✓</span> ' + lastQ.a + '</p>' +
      (lastQ.why ? '<p class="lookwhy">' + lastQ.why + '</p>' : '') +
      '<p class="lookhow">' + (lastQ.first ? 'You got that one first time. ⭐' : 'You found it — that counts.') + '</p>' +
      '<div class="acts"><div class="grow"><button class="big" data-a="x">Back to the round</button></div></div></div>';
    m.addEventListener('click', function (e) {
      if (e.target === m || (e.target.dataset && e.target.dataset.a === 'x')) m.remove();
    });
    document.body.appendChild(m);
  }
  function finishRound() {
    clearTimers();
    var st = right === ROUND ? 3 : right >= ROUND - 2 ? 2 : right >= ROUND / 2 ? 1 : 0;
    if (st) setStars(Y.id, T.id, st);
    if (st === 3) { if (SND) SND.sfx.win(); confetti(70); }
    else if (st) { if (SND) SND.sfx.levelUp(); confetti(30); }
    else pop();
    if (JUICE) JUICE.resetStreak();
    /* a bonus handful of stars for the round itself, on top of the one per
       question, so finishing is worth more than the sum of its answers */
    if (JOURNEY && st) {
      setTimeout(function () { JOURNEY.stars.add(st * 2, document.querySelector('.coach')); }, 400);
      markPlayedToday(Y.id, T.id);
    }
    $('#study').innerHTML =
      '<header><p class="qtag" style="--c:' + Y.colour + '">' + Y.name + ' · ' + T.icon + ' ' + T.title + '</p></header>' +
      '<div class="coach"><span class="dyno" aria-hidden="true"></span>' +
        '<div class="says"><b>' + right + ' out of ' + ROUND + ' ' + starRow(st) + '</b>' +
        '<span>' + (st === 3 ? 'Every single one. Dyno is amazed.'
                  : st === 2 ? 'So close to all of them — go again for three stars.'
                  : st === 1 ? 'Good going. One more round and those stars will come.'
                  : 'Tricky round. Try it again — nothing is lost.') + '</span></div></div>' +
      '<div class="controls">' +
        '<button class="gbtn" style="--c:var(--t3)" data-a="retry">↺ Play this topic again</button>' +
        '<button class="gbtn" style="--c:var(--t1)" data-a="quit">‹ All topics</button>' +
        '<a class="gbtn" style="--c:var(--t6)" href="/kids-adventure/study/">Study Island</a>' +
      '</div>';
    if (JUICE) JUICE.stamp(document.querySelector('.coach'), st);
    toast(st ? T.title + ' ' + starRow(st) : 'Have another go 🙂');
    /* The round is over — now the surprises are allowed. Everything that was
       queued up mid-round comes out here, one at a time, plus this round's own
       reward. */
    var tid = T.id, tname = T.title;
    if (JOURNEY) {
      if (st === 3) JOURNEY.surprise('Three stars on ' + tname);
      else if (st) JOURNEY.surprise(right + ' out of ' + ROUND + ' on ' + tname);
      JOURNEY.hold.push(function () {
        if (!JUICE) return;
        if (st === 3) JUICE.stickers.earn('study-' + Y.id + '-' + tid, 'Three stars on ' + tname);
        var y2 = yearStars(Y.id), of2 = Y.topics.length * 3;
        if (y2 >= of2) JUICE.stickers.earn('year-' + Y.id, 'Every star in ' + Y.name);
      });
      JOURNEY.hold.release(2600);
    } else if (JUICE) {
      if (st === 3) JUICE.stickers.earn('study-' + Y.id + '-' + tid, 'Three stars on ' + tname);
      var y3 = yearStars(Y.id), of3 = Y.topics.length * 3;
      if (y3 >= of3) JUICE.stickers.earn('year-' + Y.id, 'Every star in ' + Y.name);
    }
    T = null;                                       /* the round is closed */
  }

  /* ── what today's games are ─────────────────────────────────────────────
     A child asked for something new every day. The topics are the same
     topics — what changes is which ones today's shelf puts in front of them,
     and it changes on its own at midnight with no server and nothing to
     download. Anything already played today is marked, so "new" means new. */
  function playedToday(yid) {
    var d = null;
    try { d = JSON.parse(localStorage.getItem('kja:playedday') || 'null'); } catch (e) {}
    if (!d || d.d !== (JOURNEY ? JOURNEY.daily.day() : '')) return [];
    return (d.k || []).filter(function (k) { return k.indexOf(yid + ':') === 0; })
                      .map(function (k) { return k.split(':')[1]; });
  }
  function markPlayedToday(yid, tid) {
    if (!JOURNEY) return;
    var day = JOURNEY.daily.day(), d = null;
    try { d = JSON.parse(localStorage.getItem('kja:playedday') || 'null'); } catch (e) {}
    if (!d || d.d !== day) d = { d: day, k: [] };
    var k = yid + ':' + tid;
    if (d.k.indexOf(k) < 0) d.k.push(k);
    try { localStorage.setItem('kja:playedday', JSON.stringify(d)); } catch (e) {}
  }

  /* ── input ─────────────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var tc = e.target.closest('[data-topic]');
    if (tc) { pop(); startTopic(tc.dataset.topic); return; }
    var an = e.target.closest('.ans');
    if (an) { answer(an.dataset.ans, an); return; }
    var a = (e.target.closest('[data-a]') || {}).dataset;
    if (!a) return;
    if (a.a === 'next')  { clearTimeout(autoT); autoT = null; advance(); }
    if (a.a === 'stay')  { stay(); }
    if (a.a === 'look')  { lookBack(); }
    if (a.a === 'retry') { pop(); leaveRound(); startTopic(lastTopicId); }
    if (a.a === 'quit')  { pop(); leaveRound(); yearHome(); }
  });

  /* ── boot: the island page or a year page ──────────────────────────────── */
  var host = $('#study');
  if (host) {
    mute();
    if (host.dataset.page === 'island') island();
    else {
      var ym = /[?&]y=([a-z0-9]+)/.exec(location.search);
      Y = yearById(ym ? ym[1] : 'r') || YEARS[0];
      var tm = /[?&]t=([a-z0-9]+)/.exec(location.search);
      if (tm) startTopic(tm[1]); else yearHome();
    }
  }
  window.__study = {
    prog: function () { return prog; },
    where: function () { return { year: Y && Y.id, topic: T && T.id, qn: qn, right: right, tries: tries, firstTry: firstTry }; },
    /* the question on screen right now, so the round can be driven from a test */
    current: function () { return Q ? { q: Q.q, a: Q.a, opts: Q.opts.slice() } : null; },
    years: YEARS.map(function (y) { return { id: y.id, topics: y.topics.map(function (t) { return t.id; }) }; }),
    /* used by the question audit: generate one question from any topic */
    make: function (yid, tid) {
      var y = yearById(yid); if (!y) return null;
      for (var i = 0; i < y.topics.length; i++) if (y.topics[i].id === tid) return y.topics[i].make();
      return null;
    }
  };
})();
