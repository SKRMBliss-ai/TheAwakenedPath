/* ════════════════════════════════════════════════════════════════════════════
   KJA.songbook — the three pieces, and the little bit of theory they need.

   This used to live inside the song game, which meant the printable practice
   sheet could only re-type the notes and hope they matched. They did not: the
   sheet in a parent's hand had Yankee Doodle ending its first row on a C,
   while the game played a B. So the notes live here now, once, and both the
   game and the printed sheet read them from the same place. Change a note and
   the paper changes with it.

   KEY NUMBERS. Every note is a white-key number, counting up from A0 = 1, so
   key 15 is middle C:

        11=F3  12=G3  13=A3  14=B3  15=C4(middle C)  16=D4 … 19=G4  22=C5

   A note is { k: key, f: finger 1-5, b: beats, l: its word, rest: beats of
   silence first, slide: glissando steps }. A unit (a measure, part or row) is
   { m: its number, hand: L or R, name, pace, line: the words, notes: [...] }.
   ════════════════════════════════════════════════════════════════════════════ */
(function (W) {
  'use strict';

  /* ── theory, in the numbering the studio's own lesson plan uses ────────── */
  var LETTERS = 'CDEFGAB';
  var SEMI = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  var BLACKAFTER = ['C','D','F','G','A'];
  function letterOf(k) { return LETTERS[(k - 1) % 7]; }
  function semiOf(k) { return 12 * Math.floor((k - 1) / 7) + SEMI[letterOf(k)]; }
  function freqOf(k) { return 261.6256 * Math.pow(2, (semiOf(k) - semiOf(15)) / 12); }
  function blackAfter(k) { return BLACKAFTER.indexOf(letterOf(k)) >= 0; }
  /* which octave a child would call it: middle C and the notes above it are
     the "4" octave, the ones below are "3" */
  function octaveOf(k) { return Math.floor((k - 1) / 7) + 1; }
  /* One colour per letter, the whole way through the adventure — the same
     seven on the printed sheet, on the keyboard strip and on the note tiles,
     so a child matches by colour before they can read the letter. */
  var NOTECOL = { C:'#F2879B', D:'#F6A94E', E:'#F4D95A', F:'#8ED08A',
                  G:'#7CC0EA', H:'#B79BE0', A:'#B79BE0', B:'#EE93D6' };
  function colourOf(k) { return NOTECOL[letterOf(k)] || '#DDD'; }

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
    /* ── Yankee Doodle, note for note off the printed sheet ───────────────
       Written out from the practice sheet a parent brought in, which is the
       traditional C-major melody:

         Row 1   C C D E | C E D B
         Row 2   C C D E | C(2) B(2)
         Row 3   C C D E | F E D C
         Row 4   B G A B | C(2) C(2)

       Two things about it are easy to get wrong and were wrong here before.

       The first line ends on B, not C. It is the one note in the row that
       falls BELOW middle C, so on paper it drops to the bass staff — which
       is why it gets mistaken for a C an octave down, or dropped entirely.

       Row 4's B, G and A are all below middle C too (B3, G3, A3), and that
       is the only place in the tune the hand has to move. Rows 1 to 3 sit in
       one position with the thumb on middle C, the thumb reaching down a step
       for the B at the end of rows 1 and 2. Row 4 needs the whole hand to
       shift down so the thumb lands on G — the sheet's own printed fingering
       for this row (thumb on B, with G and A played above it) cannot be done
       with a right hand, since fingers 2 to 5 sit above the thumb, never
       below it. Every other row's fingering is the sheet's exactly. */
    yankee: {
      id:'yankee', icon:'🎩', title:'Yankee Doodle', sub:'Right hand · four rows · G, A and B, then C to F',
      unitWord:'Row', labelStyle:'note', keys:[12,13,14,15,16,17,18], bpm:104,
      setup:'Right hand: thumb on middle C, then D, E and F. For the B at the end of rows 1 and 2, reach the thumb down one white key. Row 4 moves the whole hand down — thumb on G.',
      words:'Yankee Doodle went to town, a-riding on a pony; stuck a feather in his hat and called it macaroni.',
      units:[
        { m:1, hand:'R', name:'went to town', pace:'Cheerfully', line:'Yan-kee Doo-dle went to town, a-', notes:[
          {k:15,f:1,b:1,l:'Yan'},{k:15,f:1,b:1,l:'kee'},{k:16,f:2,b:1,l:'Doo'},{k:17,f:3,b:1,l:'dle'},
          {k:15,f:1,b:1,l:'went'},{k:17,f:3,b:1,l:'to'},{k:16,f:2,b:1,l:'town'},{k:14,f:1,b:1,l:'a'}] },
        { m:2, hand:'R', name:'on a pony', pace:'The last two notes are held for two beats', line:'ri-ding on a po-ny', notes:[
          {k:15,f:1,b:1,l:'ri'},{k:15,f:1,b:1,l:'ding'},{k:16,f:2,b:1,l:'on'},{k:17,f:3,b:1,l:'a'},
          {k:15,f:1,b:2,l:'po'},{k:14,f:1,b:2,l:'ny'}] },
        { m:3, hand:'R', name:'a feather in his hat', pace:'The only row that needs the ring finger, on F', line:'Stuck a feath-er in his hat and', notes:[
          {k:15,f:1,b:1,l:'Stuck'},{k:15,f:1,b:1,l:'a'},{k:16,f:2,b:1,l:'feath'},{k:17,f:3,b:1,l:'er'},
          {k:18,f:4,b:1,l:'in'},{k:17,f:3,b:1,l:'his'},{k:16,f:2,b:1,l:'hat'},{k:15,f:1,b:1,l:'and'}] },
        { m:4, hand:'R', name:'macaroni!', pace:'Move your hand down — thumb on G', shift:'Thumb on G for this row',
          line:'called it mac-a-ro-ni', notes:[
          {k:14,f:3,b:1,l:'called'},{k:12,f:1,b:1,l:'it'},{k:13,f:2,b:1,l:'mac'},{k:14,f:3,b:1,l:'a'},
          {k:15,f:4,b:2,l:'ro'},{k:15,f:4,b:2,l:'ni'}] }
      ]
    }
  };

  /* the whole piece as one flat list, the way both the player and the sheet
     need it */
  function allNotes(song) {
    var out = [], i = 0;
    song.units.forEach(function (u) {
      u.notes.forEach(function (n) {
        out.push({ k:n.k, f:n.f, b:n.b, l:n.l, rest:n.rest, slide:n.slide, i:i++, unit:u.m });
      });
    });
    return out;
  }
  /* the letters a row is made of, which is what a child reads first */
  function rowLetters(u) {
    return u.notes.map(function (n) { return letterOf(n.k); }).join(' ');
  }

  W.KJA = W.KJA || {};
  W.KJA.songbook = {
    SONGS: SONGS,
    LETTERS: LETTERS, NOTECOL: NOTECOL,
    letterOf: letterOf, semiOf: semiOf, freqOf: freqOf,
    blackAfter: blackAfter, octaveOf: octaveOf, colourOf: colourOf,
    allNotes: allNotes, rowLetters: rowLetters,
    list: function () { return Object.keys(SONGS).map(function (k) { return SONGS[k]; }); },
    get: function (id) { return SONGS[id] || null; }
  };
})(window);
