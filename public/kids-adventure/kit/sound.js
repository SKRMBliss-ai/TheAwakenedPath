/* ════════════════════════════════════════════════════════════════════════════
   KJA.sound — one voice for the whole adventure.

   Every screen used to carry its own little synth, and they all sounded thin:
   two oscillators, no room, no dynamics. This is a single engine loaded by the
   map, Art World, Piano World, the song game and Study Island, so a tap sounds
   the same everywhere and the piano finally sounds like an instrument:

     master chain   notes → per-note filter → master gain → soft compressor
                    → speakers, with a parallel convolution reverb send, so
                    chords glue instead of clipping and every note has a room.
     piano          six partials, slightly inharmonic, each decaying at its own
                    rate, a lowpass that closes as the note dies, and an 8ms
                    hammer transient. Small random detune and level per press
                    so a repeated note never machine-guns.
     sfx            taps, pops, page turns, splats, ticks, roars, sparkles,
                    a gentle wrong-answer (never a buzzer) and three sizes of
                    celebration.
     streak         each correct answer in a row plays the next note up a
                    pentatonic run — the sound of getting better.
     music          a slow, quiet story bed — eight bars of warm chords with
                    an occasional high bell. On by default; ducks under piano
                    notes through its own gain stage so the two never fight.
     samples        the real recorded dinosaur roars, growls, chirps and the
                    magic twinkles, loaded on first use (never on page load)
                    and layered over the synth voices so a roar has a throat
                    and a hatch has sparkle.
     speak          optional read-aloud for children who cannot read yet.

   Everything but the sample kit is synthesised at runtime, so the whole
   adventure still makes sound offline and before a single byte of audio has
   downloaded — the recordings only ever improve a sound that already works.
   Mute is shared with every screen through localStorage's kja:muted.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var W = window, K = W.KJA = W.KJA || {};

  var ac = null, master = null, comp = null, verb = null, wet = null, ready = false;
  var muted = false, musicOn = false, speechOn = false;
  try { muted   = localStorage.getItem('kja:muted') === '1'; } catch (e) {}
  /* Music plays by default; turning it off is remembered, so only an explicit
     '0' silences it. Read-aloud stays opt-in — a voice talking over a child
     who can already read is an interruption, not a feature. */
  var musicPref = null;
  try { musicPref = localStorage.getItem('kja:music'); } catch (e) {}
  musicOn = musicPref === null ? true : musicPref === '1';
  try { speechOn = localStorage.getItem('kja:speak') === '1'; } catch (e) {}

  function ctx() {
    try {
      if (!ac) {
        var C = W.AudioContext || W.webkitAudioContext;
        if (!C) return null;
        ac = new C();
        build();
      }
      if (ac.state === 'suspended' && ac.resume) ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  /* A room, made out of noise: exponentially decaying stereo noise is a
     perfectly good impulse response and costs nothing to ship. */
  function impulse(seconds, decay) {
    var n = Math.floor(ac.sampleRate * seconds), buf = ac.createBuffer(2, n, ac.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < n; i++) {
        var t = i / n;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (1 - t * 0.2);
      }
    }
    return buf;
  }
  function build() {
    master = ac.createGain(); master.gain.value = 0.9;
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 20; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ac.destination);
    try {
      verb = ac.createConvolver(); verb.buffer = impulse(2.1, 2.4);
      wet = ac.createGain(); wet.gain.value = 0.2;
      verb.connect(wet); wet.connect(comp);
    } catch (e) { verb = null; }
    ready = true;
  }
  function out(node, send) {
    node.connect(master);
    if (verb && send !== 0) {
      var s = ac.createGain(); s.gain.value = send == null ? 0.22 : send;
      node.connect(s); s.connect(verb);
    }
  }
  function noiseBuf(dur) {
    var n = Math.max(1, Math.floor(ac.sampleRate * dur)), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    return b;
  }
  function noise(o) {
    var a = ctx(); if (!a || muted) return;
    o = o || {};
    var t = a.currentTime + (o.when || 0), dur = o.dur || 0.2;
    var src = a.createBufferSource(); src.buffer = noiseBuf(dur);
    var f = a.createBiquadFilter();
    f.type = o.type || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.from || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), t + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol == null ? 0.12 : o.vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); out(g, o.send);
    src.start(t); src.stop(t + dur + 0.02);
  }
  function osc(o) {
    var a = ctx(); if (!a || muted) return;
    var t = a.currentTime + (o.when || 0), dur = o.dur || 0.4;
    var x = a.createOscillator(), g = a.createGain();
    x.type = o.type || 'sine';
    x.frequency.setValueAtTime(o.f, t);
    if (o.to) x.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur * (o.bend || 1));
    if (o.detune) x.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol == null ? 0.16 : o.vol, t + (o.attack || 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    x.connect(g); out(g, o.send);
    x.start(t); x.stop(t + dur + 0.04);
  }

  /* ── the recorded kit ──────────────────────────────────────────────────
     Ten real recordings (dinosaurs and magic) live next to this file. They are
     fetched the first time something asks for one and never on page load, so
     a child on a phone pays for a roar only if they meet a dinosaur. Until a
     sample has arrived — and forever, if the network never answers — the
     synth voice underneath carries the sound on its own. */
  var BASE = (function () {
    try {
      var el = document.currentScript;
      if (!el) {
        var all = document.getElementsByTagName('script');
        for (var i = all.length - 1; i >= 0; i--)
          if (/kit\/sound\.js/.test(all[i].src || '')) { el = all[i]; break; }
      }
      if (el && el.src) return el.src.replace(/[^/]*$/, '') + 'sfx/';
    } catch (e) {}
    return '/kids-adventure/kit/sfx/';
  })();
  var bank = {}, banked = {};
  function sample(name) {
    var a = ctx(); if (!a) return null;
    if (banked[name] !== undefined) return banked[name];
    if (bank[name]) return null;                        /* already in flight */
    bank[name] = 1;
    try {
      fetch(BASE + name + '.mp3').then(function (r) {
        if (!r.ok) throw 0;
        return r.arrayBuffer();
      }).then(function (b) {
        return new Promise(function (res, rej) {
          var d = a.decodeAudioData(b, res, rej);
          if (d && d.then) d.then(res, rej);            /* promise-style decode */
        });
      }).then(function (buf) { banked[name] = buf; }, function () { banked[name] = null; });
    } catch (e) { banked[name] = null; }
    return null;
  }
  /* Ask for a sample and play it if it has already arrived. Returns true when
     the recording sounded, so a caller can decide how loud to make the synth
     layer underneath it. */
  function shot(name, o) {
    var a = ctx(); if (!a || muted) return false;
    var buf = sample(name);
    if (!buf) return false;
    o = o || {};
    var t = a.currentTime + (o.when || 0);
    var src = a.createBufferSource(); src.buffer = buf;
    src.playbackRate.value = o.rate || 1;
    var g = a.createGain();
    var v = o.vol == null ? 0.5 : o.vol;
    var len = (o.dur || buf.duration) / (o.rate || 1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (o.attack || 0.01));
    if (o.dur && o.dur < buf.duration) {                /* fade the tail, no click */
      g.gain.setValueAtTime(v, t + Math.max(0, len - 0.25));
      g.gain.linearRampToValueAtTime(0.0001, t + len);
    }
    var node = g;
    if (o.lp) {
      var f = a.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = 0.7;
      g.connect(f); node = f;
    }
    src.connect(g); out(node, o.send);
    src.start(t, o.from || 0);
    src.stop(t + len + 0.05);
    return true;
  }
  /* Warm the bank for a screen that is about to need it (Dino World asks for
     its roars while the child is still reading the title). */
  function preload(names) {
    (names || []).forEach(function (n) { sample(n); });
  }

  /* ── the piano ─────────────────────────────────────────────────────────── */
  var PARTIAL = [
    { m: 1,     a: 1.00, d: 1.00 }, { m: 2.001, a: 0.44, d: 0.72 },
    { m: 3.003, a: 0.21, d: 0.54 }, { m: 4.007, a: 0.11, d: 0.40 },
    { m: 5.011, a: 0.06, d: 0.30 }, { m: 6.02,  a: 0.035, d: 0.24 }
  ];
  function piano(freq, when, dur, vol) {
    var a = ctx(); if (!a || muted) return;
    var t = a.currentTime + (when || 0), D = dur || 1.05, V = (vol == null ? 0.24 : vol);
    V *= 0.94 + Math.random() * 0.12;                     /* touch varies */
    var body = a.createGain(); body.gain.value = 1;
    var lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(Math.min(5200, freq * 9 + 900), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(500, freq * 2.2), t + D * 0.9);
    body.connect(lp); out(lp);

    PARTIAL.forEach(function (p) {
      var o = a.createOscillator(), g = a.createGain();
      o.type = p.m === 1 ? 'triangle' : 'sine';
      o.frequency.value = freq * p.m;
      o.detune.value = (Math.random() * 8 - 4);
      var pd = Math.max(0.16, D * p.d);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(V * p.a, t + 0.006);
      g.gain.exponentialRampToValueAtTime(V * p.a * 0.3, t + Math.min(0.16, pd * 0.2));
      g.gain.exponentialRampToValueAtTime(0.0001, t + pd);
      o.connect(g); g.connect(body);
      o.start(t); o.stop(t + pd + 0.05);
    });
    noise({ when: when || 0, dur: 0.03, from: freq * 6, to: freq * 2, q: 0.9, vol: V * 0.3, send: 0.08 });
    duck();
  }
  function chord(freqs, when, dur, vol) {
    (freqs || []).forEach(function (f, i) { piano(f, (when || 0) + i * 0.012, dur || 1.4, (vol || 0.2)); });
  }

  /* ── the effects kit ───────────────────────────────────────────────────── */
  var SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  var sfx = {
    tap:     function () { osc({ f: 1150, to: 780, dur: 0.05, vol: 0.1, type: 'triangle', send: 0.1 });
                           noise({ dur: 0.03, from: 2400, to: 900, vol: 0.05, send: 0.06 }); },
    pop:     function () { osc({ f: 520, to: 980, dur: 0.14, vol: 0.16, type: 'sine', bend: 0.6 }); },
    swish:   function () { noise({ dur: 0.24, from: 3400, to: 620, q: 0.7, vol: 0.1 }); },
    page:    function () { noise({ dur: 0.2, from: 3000, to: 700, q: 0.8, vol: 0.1 });
                           osc({ f: 240, dur: 0.1, vol: 0.05, type: 'triangle' }); },
    tick:    function (strong) { noise({ dur: 0.035, from: strong ? 2200 : 1700, q: 3, vol: strong ? 0.12 : 0.07, send: 0.05 });
                                 osc({ f: strong ? 1500 : 1180, dur: 0.03, vol: strong ? 0.07 : 0.04, type: 'square', send: 0 }); },
    wrong:   function () {                              /* a shrug, never a buzzer */
               osc({ f: 392, to: 330, dur: 0.16, vol: 0.11, type: 'triangle' });
               osc({ f: 294, to: 247, dur: 0.26, vol: 0.1, when: 0.1, type: 'triangle' }); },
    splat:   function (p) { osc({ f: (p || 380) * 1.3, to: (p || 380) * 0.32, dur: 0.26, vol: 0.2, type: 'sine' });
                            noise({ dur: 0.16, from: 1900, to: 480, vol: 0.09 }); },
    /* A real throat, with the old synth roar left underneath it: the sample
       gives the rasp, the sawtooth gives the chest, and if the recording has
       not downloaded yet the child still hears a dinosaur. */
    roar:    function (big) {
               var got = shot(big ? 'dino-roar-big' : 'dino-roar', { vol: big ? 0.62 : 0.5, dur: big ? 2.6 : 2.0, send: 0.3 });
               osc({ f: big ? 120 : 150, to: big ? 55 : 70, dur: big ? 0.7 : 0.5, vol: got ? 0.07 : 0.18, type: 'sawtooth' });
               if (!got) noise({ dur: 0.45, from: 700, to: 220, q: 0.6, vol: 0.08 });
               haptic(big ? [24, 40, 24] : 20);
             },
    growl:   function () {
               var got = shot('dino-growl', { vol: 0.42, dur: 1.8, send: 0.24 });
               if (!got) { osc({ f: 110, to: 78, dur: 0.6, vol: 0.13, type: 'sawtooth' });
                           noise({ dur: 0.55, from: 400, to: 160, q: 0.8, vol: 0.06 }); }
             },
    grumble: function () {
               if (!shot('dino-grumble', { vol: 0.34, dur: 1.6, lp: 2200, send: 0.2 }))
                 osc({ f: 90, to: 70, dur: 0.8, vol: 0.1, type: 'triangle' });
             },
    /* the little ones — a hatchling's peep, used for taps in Dino World */
    chirp:   function (alt) {
               if (!shot(alt ? 'dino-chirp2' : 'dino-chirp', { vol: 0.4, dur: 1.1, send: 0.22, rate: 0.96 + Math.random() * 0.12 }))
                 osc({ f: 900, to: 1500, dur: 0.14, vol: 0.1, type: 'triangle', bend: 0.5 });
             },
    call:    function () {
               if (!shot('dino-call', { vol: 0.45, dur: 2.2, send: 0.3 }))
                 osc({ f: 300, to: 520, dur: 0.7, vol: 0.12, type: 'sawtooth', bend: 0.4 });
             },
    /* the slow thud under a "here it comes" moment — an egg about to hatch,
       or a footprint getting closer */
    heartbeat: function (beats) {
               var n = beats || 4, i;
               if (shot('dino-heartbeat', { vol: 0.4, dur: Math.min(9, n * 1.1), send: 0.16 })) return;
               for (i = 0; i < n; i++) {
                 osc({ f: 62, to: 44, dur: 0.22, vol: 0.16, type: 'sine', when: i * 1.05 });
                 osc({ f: 58, to: 40, dur: 0.18, vol: 0.1, type: 'sine', when: i * 1.05 + 0.3 });
               }
             },
    twinkle: function () {
               var got = shot('magic-twinkle', { vol: 0.42, dur: 2.2, send: 0.34 });
               [1318.5, 1760, 2093].forEach(function (f, i) { piano(f, i * 0.06, 0.6, got ? 0.06 : 0.13); });
             },
    spell:   function () {
               var got = shot('magic-spell', { vol: 0.44, dur: 3.0, send: 0.36 });
               if (!got) { osc({ f: 440, to: 1760, dur: 0.8, vol: 0.11, type: 'sine' });
                           noise({ dur: 0.7, from: 1200, to: 8000, q: 0.6, vol: 0.05 }); }
             },
    /* an egg cracking open: three knocks, then the magic, then a peep */
    hatch:   function () {
               sfx.wood(); 
               osc({ f: 220, to: 160, dur: 0.1, vol: 0.13, type: 'square', when: 0.22, send: 0.12 });
               osc({ f: 260, to: 180, dur: 0.12, vol: 0.14, type: 'square', when: 0.44, send: 0.12 });
               noise({ dur: 0.3, from: 2600, to: 500, q: 1.2, vol: 0.1, when: 0.6 });
               setTimeout(function () { sfx.twinkle(); }, 700);
               setTimeout(function () { sfx.chirp(Math.random() < 0.5); }, 1300);
             },
    /* heavy feet, for a dinosaur walking across the screen */
    stomp:   function (n) {
               var k = n || 1, i;
               for (i = 0; i < k; i++) {
                 osc({ f: 74, to: 40, dur: 0.26, vol: 0.2, type: 'sine', when: i * 0.42 });
                 noise({ dur: 0.2, from: 320, to: 90, q: 0.8, vol: 0.1, when: i * 0.42 });
               }
               haptic(18);
             },
    water:   function () { noise({ dur: 0.5, from: 800, to: 200, q: 0.7, vol: 0.09 });
                           osc({ f: 160, dur: 0.35, vol: 0.06, type: 'sine' }); },
    wood:    function () { osc({ f: 200, to: 150, dur: 0.12, vol: 0.16, type: 'square', send: 0.12 });
                           noise({ dur: 0.1, from: 900, to: 260, q: 2, vol: 0.1 }); },
    star:    function () { [1046.5, 1318.5, 1568].forEach(function (f, i) { piano(f, i * 0.055, 0.7, 0.15); });
                           noise({ dur: 0.35, from: 6000, to: 2200, q: 0.8, vol: 0.05, when: 0.04 }); },
    magic:   function () { osc({ f: 440, to: 1760, dur: 0.6, vol: 0.1, type: 'sine' });
                           noise({ dur: 0.5, from: 1200, to: 7000, q: 0.6, vol: 0.045 }); },
    chime:   function () { chord([523.25, 659.25, 783.99], 0, 1.3, 0.17); },
    /* three sizes of "well done", so a round, a level and a whole song each
       land differently */
    good:    function () { piano(659.25, 0, 0.6, 0.2); piano(987.77, 0.06, 0.7, 0.14); },
    levelUp: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { piano(f, i * 0.09, 1.2, 0.2); });
                           osc({ f: 130, dur: 0.5, vol: 0.1, type: 'triangle' });
                           noise({ dur: 0.6, from: 5000, to: 1500, q: 0.7, vol: 0.05, when: 0.3 }); },
    win:     function () { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { piano(f, i * 0.085, 1.3, 0.19); });
                           chord([523.25, 659.25, 783.99, 1046.5], 0.5, 1.9, 0.16);
                           noise({ dur: 1.1, from: 6000, to: 900, q: 0.5, vol: 0.05, when: 0.45 });
                           osc({ f: 110, dur: 0.8, vol: 0.1, type: 'triangle', when: 0.45 }); },
    /* the sound of a run of right answers */
    streak:  function (n) {
               var i = Math.max(0, Math.min(SCALE.length - 1, (n || 1) - 1));
               piano(SCALE[i], 0, 0.55, 0.18);
               if (n >= 3) noise({ dur: 0.25, from: 5200, to: 2400, q: 0.9, vol: 0.04, when: 0.03 });
             },
    count:   function (n) { osc({ f: 660 + n * 40, dur: 0.2, vol: 0.12, type: 'sine' }); }
  };

  /* ── the story bed ──────────────────────────────────────────────────────
     Eight slow bars in A minor / C major — the harmony a bedtime story is told
     over. Each bar is six seconds, so the music moves about as fast as a page
     turn rather than a game loop; nothing in it is percussive, and a single
     high bell rings every few bars so the loop never quite feels like a loop.
     It is deliberately dull on its own. That is the job: it should be the
     thing a child stops noticing, not the thing they listen to.

     The chain is bed voices → bedGain (how loud the music is) → duckGain (how
     far out of the way it is right now) → master. Keeping volume and ducking
     on separate stages is what makes the duck measurable: an earlier version
     rode them both on one node, so the bed's own fades and the duck's ramps
     overwrote each other and the level you read back was whichever had
     scheduled last. */
  var BED = [
    [110.00, 164.81, 261.63, 329.63],   /* Am      */
    [130.81, 196.00, 261.63, 392.00],   /* C        */
    [ 98.00, 146.83, 246.94, 349.23],   /* G/F#m7   */
    [116.54, 174.61, 233.08, 293.66],   /* Bb-ish   */
    [110.00, 164.81, 261.63, 329.63],   /* Am       */
    [ 87.31, 174.61, 261.63, 349.23],   /* F        */
    [ 98.00, 196.00, 246.94, 392.00],   /* G        */
    [110.00, 164.81, 220.00, 329.63]    /* Am (open)*/
  ];
  var BELL = [659.25, 783.99, 880, 1046.5, 1318.5];
  var BAR = 6.0;
  var bedTimer = null, bedStep = 0, bedGain = null, duckGain = null, duckTo = null;
  var BED_VOL = 0.5;

  /* Any piano note pushes the music down and lets it drift back once the
     playing stops — a child straining to hear a single note should not have to
     hear it through a chord. */
  function duck() {
    if (!duckGain || !ac) return;
    var g = duckGain.gain, t = ac.currentTime;
    try {
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0.22, t + 0.05);
    } catch (e) {}
    clearTimeout(duckTo);
    duckTo = setTimeout(function () {
      if (!duckGain || !ac) return;
      try {
        var gg = duckGain.gain, tt = ac.currentTime;
        gg.cancelScheduledValues(tt);
        gg.setValueAtTime(gg.value, tt);
        gg.linearRampToValueAtTime(1, tt + 1.8);
      } catch (e) {}
    }, 900);
  }
  function bedTick() {
    var a = ctx(); if (!a || !bedGain) return;
    var ch = BED[bedStep % BED.length], t0 = a.currentTime;
    ch.forEach(function (f, i) {
      var o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4;                 /* a little width */
      lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 0.6;
      /* long swell in, long fade out, overlapping the next bar so the bed
         never has a seam you could tap your foot to */
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(i === 0 ? 0.055 : 0.036, t0 + 2.2);
      g.gain.linearRampToValueAtTime(0.0001, t0 + BAR + 1.4);
      o.connect(g); g.connect(lp); lp.connect(bedGain);
      o.start(t0); o.stop(t0 + BAR + 1.6);
    });
    /* one soft bell, not every bar — the ear stops predicting it */
    if (bedStep % 3 === 1) {
      var bf = BELL[(bedStep / 3 | 0) % BELL.length];
      bell(bf, 2.4, 0.042);
      bell(bf * 1.5, 3.1, 0.022);
    }
    bedStep++;
  }
  /* a bell that lives inside the bed, so it ducks with it */
  function bell(freq, when, vol) {
    var a = ctx(); if (!a || !bedGain) return;
    var t = a.currentTime + when;
    [1, 2.76, 5.4].forEach(function (m, i) {
      var o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = freq * m;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol / (i + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / (i + 1));
      o.connect(g); g.connect(bedGain);
      o.start(t); o.stop(t + 2.8);
    });
  }
  function musicStart() {
    var a = ctx(); if (!a || bedTimer) return;
    duckGain = a.createGain(); duckGain.gain.value = 1;
    duckGain.connect(master);
    if (verb) { var s = a.createGain(); s.gain.value = 0.6; duckGain.connect(s); s.connect(verb); }
    bedGain = a.createGain();
    /* fade the music in over four seconds — arriving on a page should not
       feel like someone switching a radio on */
    bedGain.gain.setValueAtTime(0.0001, a.currentTime);
    bedGain.gain.linearRampToValueAtTime(BED_VOL, a.currentTime + 4);
    bedGain.connect(duckGain);
    bedStep = 0; bedTick();
    bedTimer = setInterval(bedTick, BAR * 1000);
  }
  function musicStop() {
    if (bedTimer) { clearInterval(bedTimer); bedTimer = null; }
    clearTimeout(duckTo);
    var g = bedGain, d = duckGain;
    bedGain = null; duckGain = null;
    if (g && ac) {                                    /* fade out, don't cut */
      try {
        var t = ac.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.0001, t + 0.9);
      } catch (e) { try { g.gain.value = 0; } catch (e2) {} }
      setTimeout(function () { try { g.disconnect(); if (d) d.disconnect(); } catch (e) {} }, 1400);
    }
  }

  /* ── read-aloud, for children who cannot read the question yet ─────────── */
  function speak(text) {
    if (!speechOn || muted || !text) return;
    try {
      var sy = W.speechSynthesis; if (!sy) return;
      sy.cancel();
      var u = new W.SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      u.rate = 0.92; u.pitch = 1.15; u.volume = 0.95; u.lang = 'en-GB';
      var vs = sy.getVoices() || [], pref = null;
      for (var i = 0; i < vs.length; i++) if (/en-GB|en_GB/.test(vs[i].lang)) { pref = vs[i]; break; }
      if (pref) u.voice = pref;
      sy.speak(u);
    } catch (e) {}
  }

  /* A buzz before the child has touched anything is refused by the browser
     and logs a warning every time — which happens for real whenever a screen
     plays a sound on arrival, such as Dino World's opening roar. So the first
     gesture arms it, and until then a buzz is simply skipped. */
  var touched = false;
  (function () {
    var arm = function () {
      touched = true;
      document.removeEventListener('pointerdown', arm, true);
      document.removeEventListener('keydown', arm, true);
    };
    document.addEventListener('pointerdown', arm, true);
    document.addEventListener('keydown', arm, true);
  })();
  function haptic(ms) {
    if (!touched || muted) return;
    try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) {}
  }

  K.sound = {
    ctx: ctx,
    piano: piano,
    chord: chord,
    sfx: sfx,
    noise: noise,
    osc: osc,
    speak: speak,
    haptic: haptic,
    /* the recorded kit */
    shot: shot,
    preload: preload,
    isMuted:  function () { return muted; },
    setMuted: function (v) {
      muted = !!v;
      try { localStorage.setItem('kja:muted', muted ? '1' : '0'); } catch (e) {}
      if (muted) musicStop(); else if (musicOn) musicStart();
      return muted;
    },
    isMusic:  function () { return musicOn; },
    setMusic: function (v) {
      musicOn = !!v;
      try { localStorage.setItem('kja:music', musicOn ? '1' : '0'); } catch (e) {}
      if (musicOn && !muted) musicStart(); else musicStop();
      return musicOn;
    },
    /* the bed's two stages, read separately so the duck can be measured
       rather than assumed: level is how loud the music is, duckLevel is how
       far out of the way it currently is (1 = not at all). */
    bedLevel:  function () { return bedGain ? bedGain.gain.value : null; },
    duckLevel: function () { return duckGain ? duckGain.gain.value : null; },
    isSpeech: function () { return speechOn; },
    setSpeech: function (v) {
      speechOn = !!v;
      try { localStorage.setItem('kja:speak', speechOn ? '1' : '0'); } catch (e) {}
      if (!speechOn) { try { W.speechSynthesis.cancel(); } catch (e) {} }
      return speechOn;
    }
  };

  /* The browser only lets sound start after a gesture, so the bed waits for
     the first touch rather than failing silently on load. */
  if (musicOn) {
    var kick = function () {
      document.removeEventListener('pointerdown', kick, true);
      document.removeEventListener('keydown', kick, true);
      if (musicOn && !muted) musicStart();
    };
    document.addEventListener('pointerdown', kick, true);
    document.addEventListener('keydown', kick, true);
  }
})();
