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
     music          an optional, very quiet four-chord bed. Off unless asked.
     speak          optional read-aloud for children who cannot read yet.

   Everything is synthesised at runtime: no audio files, nothing to download,
   and it works offline. Mute is shared with every screen through
   localStorage's kja:muted.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var W = window, K = W.KJA = W.KJA || {};

  var ac = null, master = null, comp = null, verb = null, wet = null, ready = false;
  var muted = false, musicOn = false, speechOn = false;
  try { muted   = localStorage.getItem('kja:muted') === '1'; } catch (e) {}
  try { musicOn = localStorage.getItem('kja:music') === '1'; } catch (e) {}
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
    roar:    function () { osc({ f: 150, to: 70, dur: 0.5, vol: 0.18, type: 'sawtooth' });
                           noise({ dur: 0.45, from: 700, to: 220, q: 0.6, vol: 0.08 }); },
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

  /* ── an optional, quiet four-chord bed ─────────────────────────────────── */
  var BED = [[130.81, 196, 261.63, 329.63], [110, 164.81, 261.63, 329.63],
             [87.31, 174.61, 261.63, 349.23], [98, 196, 246.94, 392]];
  var bedTimer = null, bedStep = 0, bedGain = null;
  function bedTick() {
    var a = ctx(); if (!a) return;
    var ch = BED[bedStep % BED.length], t = 0;
    ch.forEach(function (f, i) {
      var o = a.createOscillator(), g = a.createGain();
      o.type = 'triangle'; o.frequency.value = f; o.detune.value = i * 3;
      g.gain.setValueAtTime(0.0001, a.currentTime + t);
      g.gain.linearRampToValueAtTime(0.05, a.currentTime + t + 0.6);
      g.gain.linearRampToValueAtTime(0.0001, a.currentTime + t + 3.6);
      o.connect(g); g.connect(bedGain || master);
      o.start(a.currentTime + t); o.stop(a.currentTime + t + 3.8);
    });
    if (bedStep % 2 === 0) piano(ch[3] * 2, 1.8, 1.2, 0.05);
    bedStep++;
  }
  function musicStart() {
    var a = ctx(); if (!a || bedTimer) return;
    bedGain = a.createGain(); bedGain.gain.value = 0.5;
    bedGain.connect(master);
    if (verb) { var s = a.createGain(); s.gain.value = 0.5; bedGain.connect(s); s.connect(verb); }
    bedStep = 0; bedTick();
    bedTimer = setInterval(bedTick, 3600);
  }
  function musicStop() {
    if (bedTimer) { clearInterval(bedTimer); bedTimer = null; }
    if (bedGain) { try { bedGain.gain.value = 0; } catch (e) {} bedGain = null; }
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

  function haptic(ms) {
    try { if (navigator.vibrate && !muted) navigator.vibrate(ms || 12); } catch (e) {}
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
