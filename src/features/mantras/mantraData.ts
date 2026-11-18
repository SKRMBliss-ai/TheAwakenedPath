// ─────────────────────────────────────────────────────────────────────────────
// Soulful Mantra Studio — the mantra library and the Mantra Pass.
//
// ONE place for the catalogue and the price. Every entry here is a chant that
// is published on our own YouTube channel (@SoulfulMantraStudio); do not list a
// mantra until its recording is live. The texts are traditional, the meanings
// and notes are written by us.
//
// TODO(owner): read each Sanskrit text against the recording before launch and
// correct any line that differs from what is sung.
//
// Price: charged by the backend from COURSE_PRICES / COURSE_PRICES_INR in
// functions/index.js (id mantra_lifetime_pass). Change BOTH places together.
// ─────────────────────────────────────────────────────────────────────────────

import { KIDS_ZOOM_CURRENCY, formatKidsPrice, type KidsCurrency } from '../landing/kidsPricing';

export const MANTRA_BASE_URL = 'https://www.skrmblissai.in/mantras';
export const MANTRA_CHANNEL_URL = 'https://www.youtube.com/@SoulfulMantraStudio';
export const MANTRA_SUBSCRIBE_URL = `${MANTRA_CHANNEL_URL}?sub_confirmation=1`;
export const MANTRA_WHATSAPP = 'https://wa.me/918217581238';
/** Soulful Mantra Studio WhatsApp group (community, new-mantra alerts). */
export const MANTRA_WHATSAPP_GROUP = 'https://chat.whatsapp.com/Cqh9hajKSS3DeE4AdXcvfj';

export const waLink = (text: string) => `${MANTRA_WHATSAPP}?text=${encodeURIComponent(text)}`;

// ── Mantra Pass ────────────────────────────────────────────────────────────
export const MANTRA_PASS_ID = 'mantra_lifetime_pass';
/** false switches the buy button off (shows "Opening soon"). */
export const MANTRA_PASS_OPEN = true;
export const MANTRA_PASS_REFUND_DAYS = 7;

// Mantra Pass price. Keep in sync with catalog.ts and COURSE_PRICES in functions/index.js.
const PASS_FOUNDING: Record<KidsCurrency, number> = { USD: 14.99, INR: 999 };

export const MANTRA_CURRENCY: KidsCurrency = KIDS_ZOOM_CURRENCY;
export const passPrice = () => formatKidsPrice(PASS_FOUNDING[MANTRA_CURRENCY], MANTRA_CURRENCY);

// One mantra on its own, as a downloadable mp3. Same price for every mantra.
// Keep in sync with MANTRA_SONG_SLUGS and the price tables in functions/index.js.
const SINGLE_PRICE: Record<KidsCurrency, number> = { USD: 14.99, INR: 899 };
export const singlePrice = () => formatKidsPrice(SINGLE_PRICE[MANTRA_CURRENCY], MANTRA_CURRENCY);
/** Product id the backend knows a single mantra by. */
export const singleId = (slug: string) => `mantra_song_${slug}`;
/** Aartis are songs and are only available through the Mantra Pass. */
const NOT_SOLD_SINGLY = new Set(['ganesha-aarti', 'tulsi-aarti', 'saraswati-mantra']);
export const soldSingly = (slug: string) => !NOT_SOLD_SINGLY.has(slug);

// ── Catalogue ────────────────────────────────────────────────────────────────
export type Moment = 'morning' | 'evening' | 'sleep' | 'festival' | 'allday';

export const MOMENTS: { id: Moment; label: string; blurb: string }[] = [
  { id: 'morning', label: 'Morning', blurb: 'Short chants to begin the day' },
  { id: 'evening', label: 'Evening lamp', blurb: 'For the evening diya and winding down' },
  { id: 'sleep', label: 'Before sleep', blurb: 'Slow, soft loops for rest' },
  { id: 'festival', label: 'Festival puja', blurb: 'Diwali, Dhanteras, Chhath, Navratri, Tulsi Vivah' },
  { id: 'allday', label: 'Play all day', blurb: 'One and two hour continuous jaap' },
];

export interface Mantra {
  slug: string;
  name: string;
  deity: string;
  /** One line for the card. */
  blurb: string;
  devanagari: string[];
  transliteration: string[];
  meaning: string;
  /** Key words, in the order they are sung. */
  words: [string, string][];
  when: string;
  moments: Moment[];
  /** Occasions this chant is traditionally used for. */
  occasions: string[];
  /** Our own recordings on YouTube. The first one is embedded on the page. */
  videos?: { id: string; label: string }[];
  /** Optional cover image path for cards/detail when no YouTube video is set */
  cover?: string;
  /** Master single-chant audio in /Mantras/<slug>.mp3 */
  audioUrl?: string;
}

export const getMantraAudioUrl = (slug: string) => `/Mantras/${slug}.mp3`;

const BASE_MANTRAS: Mantra[] = [
  {
    slug: 'karagre-vasate-lakshmi',
    name: 'Karagre Vasate Lakshmi',
    deity: 'Lakshmi',
    blurb: 'The first prayer of the day, said while looking at your open palms.',
    devanagari: ['कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती ।', 'करमूले तु गोविन्दः प्रभाते करदर्शनम् ॥'],
    transliteration: ['Karāgre vasate Lakṣmīḥ, karamadhye Sarasvatī', 'Karamūle tu Govindaḥ, prabhāte karadarśanam'],
    meaning:
      'Lakshmi lives at the tips of my fingers, Saraswati in the middle of my palm, and Govinda at its base. So in the morning I look at my own hands.',
    words: [
      ['karāgre', 'at the fingertips'],
      ['vasate', 'dwells'],
      ['karamadhye', 'in the middle of the hand'],
      ['karamūle', 'at the base of the hand'],
      ['prabhāte', 'in the early morning'],
      ['karadarśanam', 'looking at the hands'],
    ],
    when: 'On waking, before you get out of bed. Hold your palms together like an open book, say the verse once or three times, then touch your palms to your eyes. Our recording is made for a 40-day morning practice.',
    moments: ['morning'],
    occasions: ['Daily morning', '40-day sadhana'],
    videos: [{ id: 'MhzZcNfvXq8', label: 'Morning prayer for 40 days' }],
  },
  {
    slug: 'om-gan-ganapataye-namah',
    name: 'Om Gan Ganapataye Namah',
    deity: 'Ganesha',
    blurb: 'The short Ganesha mantra chanted before any new beginning.',
    devanagari: ['ॐ गं गणपतये नमः ॥'],
    transliteration: ['Oṁ gaṁ Gaṇapataye namaḥ'],
    meaning: 'Om. I bow to Ganapati, lord of all beginnings. “Gam” is the seed sound of Ganesha.',
    words: [
      ['oṁ', 'the primal sound'],
      ['gaṁ', 'seed syllable of Ganesha'],
      ['Gaṇapataye', 'to Ganapati, leader of the ganas'],
      ['namaḥ', 'I bow'],
    ],
    when: 'At the start of a puja, a journey, an exam or any new work. One mala (108 repetitions) is the usual count. In Diwali puja it is chanted first, before the Lakshmi mantras.',
    moments: ['morning', 'festival', 'allday'],
    occasions: ['Diwali', 'Ganesh Chaturthi', 'New beginnings'],
    videos: [
      { id: '2Y4DuaNWnd4', label: '108 times, with meaning' },
      { id: 'TqrxqPQv6cA', label: '2 hour jaap' },
    ],
  },
  {
    slug: 'mahalakshmi-mantra',
    name: 'Mahalakshmi Mantra',
    deity: 'Lakshmi',
    blurb: 'The seed mantra of Mahalakshmi, chanted on Diwali evening.',
    devanagari: ['ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः ॥'],
    transliteration: ['Oṁ śrīṁ hrīṁ śrīṁ Mahālakṣmyai namaḥ'],
    meaning: 'Om. With the seed sounds Shreem and Hreem, I bow to Mahalakshmi, the goddess of abundance and grace.',
    words: [
      ['śrīṁ', 'seed syllable of Lakshmi'],
      ['hrīṁ', 'seed syllable of the divine mother'],
      ['Mahālakṣmyai', 'to Mahalakshmi'],
      ['namaḥ', 'I bow'],
    ],
    when: 'In the evening after lighting a diya, especially on Fridays and on Diwali night during Lakshmi puja. Chant 108 times with a mala, or simply listen.',
    moments: ['evening', 'festival'],
    occasions: ['Diwali', 'Fridays', 'Lakshmi puja'],
    videos: [{ id: 'DoBtwZAINMI', label: '108 times' }],
  },
  {
    slug: 'kubera-mantra',
    name: 'Kubera Mantra',
    deity: 'Kubera',
    blurb: 'The prayer to Kubera, keeper of wealth, chanted on Dhanteras.',
    devanagari: ['ॐ यक्षाय कुबेराय वैश्रवणाय', 'धनधान्याधिपतये', 'धनधान्यसमृद्धिं मे देहि दापय स्वाहा ॥'],
    transliteration: ['Oṁ yakṣāya Kuberāya Vaiśravaṇāya', 'dhanadhānyādhipataye', 'dhanadhānyasamṛddhiṁ me dehi dāpaya svāhā'],
    meaning:
      'Om. To Kubera, lord of the yakshas and son of Vishrava, master of wealth and grain: grant me plenty of both, and let it be given.',
    words: [
      ['yakṣāya', 'to the yaksha'],
      ['Vaiśravaṇāya', 'to the son of Vishrava'],
      ['dhana-dhānya', 'wealth and grain'],
      ['adhipataye', 'to the lord of'],
      ['samṛddhiṁ', 'abundance'],
      ['me dehi', 'give to me'],
    ],
    when: 'On Dhanteras and Diwali, alongside Lakshmi puja, and on any day you begin a new account or business. Chant 108 times facing north, the direction associated with Kubera.',
    moments: ['festival', 'allday'],
    occasions: ['Dhanteras', 'Diwali'],
    videos: [
      { id: 'r5AF6WVvvlc', label: '108 times, with meaning' },
      { id: 'kvSOUqSBqKA', label: '1 hour jaap' },
    ],
  },
  {
    slug: 'kubera-ashtalakshmi-mantra',
    name: 'Kubera Ashtalakshmi Mantra',
    deity: 'Kubera',
    blurb: 'Kubera and the eight forms of Lakshmi, invoked together.',
    devanagari: ['ॐ ह्रीं श्रीं क्रीं श्रीं कुबेराय', 'अष्टलक्ष्मी मम गृहे धनं पूरय पूरय नमः ॥'],
    transliteration: ['Oṁ hrīṁ śrīṁ krīṁ śrīṁ Kuberāya', 'Aṣṭalakṣmī mama gṛhe dhanaṁ pūraya pūraya namaḥ'],
    meaning:
      'Om. With the seed sounds Hreem, Shreem and Kreem, I bow to Kubera and the eight Lakshmis. Fill my home with prosperity.',
    words: [
      ['Kuberāya', 'to Kubera'],
      ['Aṣṭalakṣmī', 'the eight forms of Lakshmi'],
      ['mama gṛhe', 'in my home'],
      ['dhanaṁ', 'wealth'],
      ['pūraya pūraya', 'fill, fill'],
    ],
    when: 'On Dhanteras evening and through the five days of Diwali. Light a diya, sit comfortably and chant along with a mala, or play it softly in the puja room.',
    moments: ['evening', 'festival', 'allday'],
    occasions: ['Dhanteras', 'Diwali'],
    videos: [
      { id: 'DbKRBQObkEE', label: '108 times' },
      { id: 'eZAGs8YwkE4', label: '1 hour jaap' },
    ],
  },
  {
    slug: 'dhanvantari-mantra',
    name: 'Dhanvantari Mantra',
    deity: 'Dhanvantari',
    blurb: 'A short prayer to Dhanvantari, the divine physician.',
    devanagari: ['ॐ नमो भगवते धन्वन्तरये नमः ॥'],
    transliteration: ['Oṁ namo bhagavate Dhanvantaraye namaḥ'],
    meaning: 'Om. I bow to Lord Dhanvantari, who rose from the ocean carrying the pot of nectar and is honoured as the source of Ayurveda.',
    words: [
      ['namo', 'salutations'],
      ['bhagavate', 'to the blessed lord'],
      ['Dhanvantaraye', 'to Dhanvantari'],
      ['namaḥ', 'I bow'],
    ],
    when: 'Traditionally chanted on Dhanteras (Dhanvantari Jayanti), and as a prayer for health for yourself or someone you love. Our long version is slow and soft, so many listeners play it at bedtime.',
    moments: ['sleep', 'festival', 'allday'],
    occasions: ['Dhanteras', 'Prayer for health'],
    videos: [
      { id: 'TBVN9xse9Ik', label: '2 hour soft chant' },
      { id: 'M5N-8-cSPNI', label: 'Extended chant' },
    ],
  },
  {
    slug: 'om-suryaya-namah',
    name: 'Om Suryaya Namah',
    deity: 'Surya',
    blurb: 'The simplest salutation to the Sun.',
    devanagari: ['ॐ सूर्याय नमः ॥'],
    transliteration: ['Oṁ Sūryāya namaḥ'],
    meaning: 'Om. I bow to Surya, the Sun, giver of light and life.',
    words: [
      ['Sūryāya', 'to Surya, the Sun'],
      ['namaḥ', 'I bow'],
    ],
    when: 'At sunrise, facing east, or while offering water to the Sun. During Chhath Puja it is chanted through both the evening and the morning arghya.',
    moments: ['morning', 'festival', 'allday'],
    occasions: ['Chhath Puja', 'Sundays', 'Sunrise'],
    videos: [
      { id: 'SJ1R0fY-he8', label: '2 hour jaap' },
      { id: 'zDNVRusqaZc', label: 'Chhath Puja chant' },
    ],
  },
  {
    slug: 'surya-arghya-mantra',
    name: 'Surya Arghya Mantra',
    deity: 'Surya',
    blurb: 'The verse said while pouring water to the Sun.',
    devanagari: ['एहि सूर्य सहस्रांशो तेजोराशे जगत्पते ।', 'अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर ॥'],
    transliteration: ['Ehi Sūrya sahasrāṁśo tejorāśe jagatpate', 'Anukampaya māṁ bhaktyā gṛhāṇārghyaṁ Divākara'],
    meaning:
      'Come, O Sun of a thousand rays, treasury of light, lord of the world. Be kind to me, and accept this water I offer with devotion, O maker of the day.',
    words: [
      ['ehi', 'come'],
      ['sahasrāṁśo', 'of a thousand rays'],
      ['tejorāśe', 'heap of radiance'],
      ['jagatpate', 'lord of the world'],
      ['anukampaya', 'have compassion'],
      ['gṛhāṇa arghyaṁ', 'accept this offering of water'],
    ],
    when: 'While offering arghya: stand facing the Sun, hold the vessel at chest height and pour slowly as you say the verse. Used at the Sandhya and Usha arghya of Chhath Puja.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Chhath Puja', 'Daily arghya'],
    videos: [{ id: 'Wuqfbe89wIc', label: 'With lyrics and meaning' }],
  },
  {
    slug: 'om-adityaya-namah',
    name: 'Om Adityaya Namah',
    deity: 'Surya',
    blurb: 'The easiest arghya mantra, one line with every pour of water.',
    devanagari: ['ॐ आदित्याय नमः ।', 'इदम् अर्घ्यं समर्पयामि ॥'],
    transliteration: ['Oṁ Ādityāya namaḥ', 'Idam arghyaṁ samarpayāmi'],
    meaning: 'Om. I bow to Aditya, the Sun, son of Aditi. I offer this water.',
    words: [
      ['Ādityāya', 'to Aditya, the Sun'],
      ['idam', 'this'],
      ['arghyaṁ', 'offering of water'],
      ['samarpayāmi', 'I offer'],
    ],
    when: 'With each pour of water during arghya. Easy enough for children and first-timers to say along with the family at Chhath Puja.',
    moments: ['morning', 'festival'],
    occasions: ['Chhath Puja', 'Daily arghya'],
    videos: [{ id: 'FTBcjTZyT8Q', label: 'Chhath arghya chant' }],
  },
  {
    slug: 'tulsi-mantra',
    name: 'Tulsi Mantra',
    deity: 'Tulsi Mata',
    blurb: 'Chanted while offering water to the Tulsi plant each morning.',
    devanagari: ['महाप्रसाद जननी सर्व सौभाग्यवर्धिनी ।', 'आधि व्याधि हरा नित्यं तुलसी त्वं नमोऽस्तुते ॥'],
    transliteration: ['Mahāprasāda jananī sarva saubhāgyavardhinī', 'Ādhi vyādhi harā nityaṁ Tulasī tvaṁ namo’stute'],
    meaning:
      'Mother of the great blessing, you who increase all good fortune and always take away troubles of mind and body: Tulsi, I bow to you.',
    words: [
      ['mahāprasāda jananī', 'mother of the great blessing'],
      ['saubhāgya-vardhinī', 'who increases good fortune'],
      ['ādhi', 'troubles of the mind'],
      ['vyādhi', 'troubles of the body'],
      ['namo’stute', 'salutations to you'],
    ],
    when: 'In the morning as you pour water at the Tulsi plant and walk around it, and in the evening when you light a diya beside it. Sung on Tulsi Vivah.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Tulsi Vivah', 'Daily Tulsi puja'],
    videos: [{ id: 'ZdtFPeqSUyE', label: '1 hour chant' }],
  },
  {
    slug: 'saraswati-mantra',
    name: 'Saraswati Vandana & Mantra',
    deity: 'Saraswati',
    blurb: 'For wisdom, memory, clear speech, exams, study, and creative arts.',
    devanagari: [
      'ॐ ऐं सरस्वत्यै नमः ।',
      'श्वेत पद्म पर विराजे माँ, ज्ञान की ज्योति जगाए माँ ।',
      'वीणा की मधुर ध्वनि में, शांति बसे हर मन में ॥',
    ],
    transliteration: [
      'Om Aiṁ Sarasvatyai Namaḥ',
      'Śveta padma para virāje māṁ, jñāna kī jyoti jagāe māṁ',
      'Vīṇā kī madhura dhvani meṁ, śānti base hara mana meṁ',
    ],
    meaning:
      'Salutations to Mother Saraswati, the embodiment of wisdom. Seated upon a pure white lotus, she awakens the light of knowledge within us. In the sweet melodies of her veena, deep peace settles into every heart.',
    words: [
      ['aiṁ', 'the sacred bija seed syllable of wisdom and Saraswati'],
      ['sarasvatyai namaḥ', 'reverence to Mother Saraswati'],
      ['śveta padma', 'pure white lotus of purity and clarity'],
      ['jñāna kī jyoti', 'the guiding flame of understanding and learning'],
      ['vīṇā', 'the veena expressing harmony and creative expression'],
      ['śānti', 'inner stillness and calm'],
    ],
    when: 'Every morning before study or creative work, during exam preparation, music/art practice, and on Vasant Panchami.',
    moments: ['morning', 'allday'],
    occasions: ['Vasant Panchami', 'Exams & Studies', 'Daily Morning Puja', 'Creative practice'],
    audioUrl: '/Mantras/saraswati-mantra.mp3',
  },
  {
    slug: 'shiva-mantra',
    name: 'Shiva Dhyan Mantra',
    deity: 'Shiva',
    blurb: 'The eternal five-syllable Panchakshari chant for silence, courage, and inner stillness.',
    devanagari: ['ॐ नमः शिवाय ॥', 'ॐ नमः शिवाय ॥'],
    transliteration: ['Om Namaḥ Śivāya', 'Om Namaḥ Śivāya'],
    meaning:
      'I bow to Lord Shiva, the eternal, silent witness of consciousness residing within the heart of every being.',
    words: [
      ['om', 'the cosmic vibration of pure existence'],
      ['namaḥ', 'I bow, surrender of ego'],
      ['śivāya', 'to Shiva, the auspicious and pure one'],
    ],
    when: 'At sunrise, sunset (sandhya), during evening meditation, on Mondays, Pradosham, and Maha Shivratri.',
    moments: ['morning', 'evening', 'sleep', 'allday'],
    occasions: ['Maha Shivratri', 'Pradosha Vrat', 'Shravan Somwar', 'Daily Meditation'],
    audioUrl: '/Mantras/shiva-mantra.mp3',
  },
  {
    slug: 'uma-maheshwara-mantra',
    name: 'Uma Maheshwara Mantra',
    deity: 'Shiva & Parvati',
    blurb: 'Chanted for marital harmony, compassionate family life, and unity of strength and grace.',
    devanagari: ['ॐ उमामहेश्वराभ्यां नमः ॥', 'ॐ उमामहेश्वराभ्यां नमः ॥'],
    transliteration: ['Om Umā-Maheśvarābhyāṁ Namaḥ', 'Om Umā-Maheśvarābhyāṁ Namaḥ'],
    meaning:
      'Salutations to the divine united couple — Mother Uma (Parvati) and Lord Maheshwara (Shiva) — embodying love, mutual reverence, and household harmony.',
    words: [
      ['umā', 'Mother Parvati, embodiment of Shakti, devotion, and compassion'],
      ['maheśvara', 'the supreme Lord Shiva, transcendent stillness and protector'],
      ['ābhyām', 'to both together as one inseparable union'],
      ['namaḥ', 'reverent prostrations'],
    ],
    when: 'In the morning or evening for family harmony, on Karwa Chauth, Hartalika Teej, and Pradosham.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Karwa Chauth', 'Hartalika Teej', 'Pradosha Vrat', 'Family Harmony'],
    audioUrl: '/Mantras/uma-maheshwara-mantra.mp3',
  },
  {
    slug: 'maha-sudarshana-mantra',
    name: 'Maha Sudarshana Dhanvantari Mantra',
    deity: 'Vishnu',
    blurb: 'For spiritual protection, deep healing, relief from fear, and physical and mental recovery.',
    devanagari: [
      'ॐ नमो भगवते महासुदर्शनाय ।',
      'वासुदेवाय धन्वन्तरये अमृतकलशहस्ताय ।',
      'सर्वभयविनाशाय सर्वरोगनिवारणाय ।',
      'त्रिलोकनाथाय श्रीमहाविष्णवे नमः ॥',
    ],
    transliteration: [
      'Om Namo Bhagavate Mahāsudarśanāya',
      'Vāsudevāya Dhanvantaraye amṛtakalaśahastāya',
      'Sarvabhayavināśāya sarvaroganivāraṇāya',
      'Trilokanāthāya Śrī-Mahāviṣṇave Namaḥ',
    ],
    meaning:
      'Reverence to the Supreme Divine Lord holding the great Sudarshana wheel of protection, to Vasudeva-Dhanvantari carrying the vessel of nectar in his hands, who removes all fear and dispels all illness, Lord of the three realms, Sri Maha Vishnu.',
    words: [
      ['mahā-sudarśanāya', 'to the bearer of the great disc of light and protection'],
      ['dhanvantaraye', 'to Dhanvantari, the celestial healer'],
      ['amṛta-kalaśa-hastāya', 'holding the chalice of divine life-giving nectar'],
      ['sarva-bhaya-vināśāya', 'destroyer of all inner and outer fear'],
      ['sarva-roga-nivāraṇāya', 'healer and remover of all illness and imbalance'],
      ['śrī-mahāviṣṇave namaḥ', 'prostrations to the all-pervading protector Vishnu'],
    ],
    when: 'In the morning during healing prayers, when feeling anxious or unwell, and on Ekadashi.',
    moments: ['morning', 'sleep', 'allday'],
    occasions: ['Dhanteras', 'Ekadashi', 'Healing & Recovery', 'Spiritual Protection'],
    audioUrl: '/Mantras/maha-sudarshana-mantra.mp3',
  },
  {
    slug: 'ganesha-aarti',
    name: 'Ganesha Aarti (Jai Ganesh Deva)',
    deity: 'Ganesha',
    blurb: 'The joyful evening prayer to Ganapati, removing obstacles and welcoming light into the home.',
    devanagari: [
      'ॐ गं गणपतये नमः ।',
      'जय गणेश देवा, जय गणेश देवा, मंगलकारी गणपति देवा ।',
      'विघ्न विनाशक गणपति देवा, प्रथम पूज्य गणपति देवा ॥',
      'मन में शांति, हृदय में श्रद्धा, जीवन में शुभ ज्योति जगाओ ॥',
    ],
    transliteration: [
      'Om Gaṁ Gaṇapataye Namaḥ',
      'Jaya Gaṇeśa devā, jaya Gaṇeśa devā, maṅgalakārī Gaṇapati devā',
      'Vighna vināśaka Gaṇapati devā, prathama pūjya Gaṇapati devā',
      'Mana meṁ śānti, hṛdaya meṁ śraddhā, jīvana meṁ śubha jyoti jagāo',
    ],
    meaning:
      'Victory to Lord Ganesha, the bringer of auspiciousness, destroyer of obstacles, first to be honoured in every prayer. Pour your grace upon us, bring calm to the mind, faith in the heart, and awaken the auspicious light in our lives.',
    words: [
      ['maṅgalakārī', 'creator of good fortune and auspicious beginnings'],
      ['vighna vināśaka', 'dispeller of hurdles, blocks and doubt'],
      ['prathama pūjya', 'first to be worshipped before any undertaking'],
      ['śubha jyoti', 'auspicious inner flame of wisdom and joy'],
    ],
    when: 'Sung during daily evening aarti, before starting any new venture, and on Ganesh Chaturthi.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Ganesh Chaturthi', 'Diwali Puja', 'Housewarming (Griha Pravesh)', 'Evening Aarti'],
    audioUrl: '/Mantras/ganesha-aarti.mp3',
  },
  {
    slug: 'tulsi-aarti',
    name: 'Tulsi Aarti (Jaya Tulasi Mata)',
    deity: 'Tulsi Mata',
    blurb: 'Devotional evening aarti sung with the brass diya at the sacred holy basil plant.',
    devanagari: [
      'जय तुलसी माता, मैया जय तुलसी माता ।',
      'सब जग की सुखदाता, सबकी वरमाता ॥',
      'महाप्रसाद जननी सर्व सौभाग्यवर्धिनी ।',
      'आधि व्याधि हरा नित्यं तुलसी त्वं नमोऽस्तुते ॥',
    ],
    transliteration: [
      'Jaya Tulasī mātā, maiyā jaya Tulasī mātā',
      'Saba jaga kī sukhadātā, sabakī varamātā',
      'Mahāprasāda jananī sarva saubhāgyavardhinī',
      'Ādhi vyādhi harā nityaṁ Tulasī tvaṁ namo’stute',
    ],
    meaning:
      'Victory to Mother Tulsi, who bestows peace on all the world. Mother of the great blessing, enhancer of all fortune, reliever of sorrow and sickness: Mother Tulsi, we bow to you.',
    words: [
      ['sukhadātā', 'giver of peace, well-being and contentment'],
      ['varamātā', 'mother who grants auspicious boons'],
      ['mahāprasāda jananī', 'giver of divine grace and healing sanctity'],
      ['saubhāgyavardhinī', 'she who multiplies blessing and family prosperity'],
    ],
    when: 'At twilight when lighting the diya in front of the Tulsi plant, and throughout the holy month of Kartik.',
    moments: ['evening', 'festival'],
    occasions: ['Tulsi Vivah', 'Kartik Maas', 'Devutthana Ekadashi', 'Evening Diya'],
    audioUrl: '/Mantras/tulsi-aarti.mp3',
  },
  {
    slug: 'shailaputri-mantra',
    name: 'Maa Shailaputri Navratri Mantra',
    deity: 'Durga',
    blurb: 'The first form of Navadurga, daughter of the Himalayas, for grounding and unshakeable inner strength.',
    devanagari: ['ॐ देवी शैलपुत्र्यै नमः ॥', 'ॐ देवी शैलपुत्र्यै नमः ॥'],
    transliteration: ['Om Devī Śailaputryai Namaḥ', 'Om Devī Śailaputryai Namaḥ'],
    meaning:
      'Salutations to Goddess Shailaputri, the daughter of the mountain, who sits upon the bull holding the trident and lotus, blessing the seeker with rooted strength and firm purpose.',
    words: [
      ['śaila', 'the mountain / rock, steadfast and immovable'],
      ['putrī', 'daughter — born of the earth and heights of contemplation'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 1 of Chaitra and Sharadiya Navratri, or whenever you need steady grounding, calm determination, and stability.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Navratri Day 1', 'Ghatasthapana', 'Cultivating Inner Stability', 'Durga Puja'],
    audioUrl: '/Mantras/shailaputri-mantra.mp3',
  },
  {
    slug: 'navratri-day2-brahmacharini',
    name: 'Maa Brahmacharini Navratri Mantra',
    deity: 'Durga',
    blurb: 'The second form of Navadurga, for discipline, patience and steady devotion.',
    devanagari: ['ॐ देवी ब्रह्मचारिण्यै नमः ॥', 'ॐ देवी ब्रह्मचारिण्यै नमः ॥'],
    transliteration: ['Om Devī Brahmacāriṇyai Namaḥ', 'Om Devī Brahmacāriṇyai Namaḥ'],
    meaning:
      'Salutations to Goddess Brahmacharini, who walks the path of devotion and quiet discipline, blessing the seeker with patience and steadiness.',
    words: [
      ['brahmacāriṇī', 'she who walks the path of devotion and quiet austerity'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 2 of Chaitra and Sharadiya Navratri, or whenever you need discipline and patience.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri Day 2', 'Durga Puja'],
    audioUrl: '/Mantras/navratri-day2-brahmacharini.mp3',
  },
  {
    slug: 'navratri-day5-skandamata',
    name: 'Maa Skandamata Navratri Mantra',
    deity: 'Durga',
    blurb: 'The fifth form of Navadurga, the mother of Skanda, for motherly strength and peace.',
    devanagari: ['ॐ देवी स्कन्दमातायै नमः ॥', 'ॐ देवी स्कन्दमातायै नमः ॥'],
    transliteration: ['Om Devī Skandamātāyai Namaḥ', 'Om Devī Skandamātāyai Namaḥ'],
    meaning:
      'Salutations to Goddess Skandamata, the mother of Skanda, who holds her child in her lap and blesses the seeker with strength, care and peace.',
    words: [
      ['skandamātā', 'the mother of Skanda (Kartikeya), the nurturing and protecting mother'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 5 of Chaitra and Sharadiya Navratri, or whenever you need motherly strength and peace.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri Day 5', 'Durga Puja'],
    audioUrl: '/Mantras/navratri-day5-skandamata.mp3',
  },
  {
    slug: 'navratri-day6-katyayani',
    name: 'Maa Katyayani Navratri Mantra',
    deity: 'Durga',
    blurb: 'The sixth form of Navadurga, for clarity and courage.',
    devanagari: ['ॐ देवी कात्यायन्यै नमः ॥', 'ॐ देवी कात्यायन्यै नमः ॥'],
    transliteration: ['Om Devī Kātyāyanyai Namaḥ', 'Om Devī Kātyāyanyai Namaḥ'],
    meaning:
      'Salutations to Goddess Katyayani, the fierce and graceful warrior form of Durga, who gives the seeker clarity of mind and courage.',
    words: [
      ['kātyāyanī', 'the form of the Goddess born to the sage Katyayana'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 6 of Chaitra and Sharadiya Navratri, or whenever you need clarity and courage.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri Day 6', 'Durga Puja'],
    audioUrl: '/Mantras/navratri-day6-katyayani.mp3',
  },
  {
    slug: 'navratri-day7-kalaratri',
    name: 'Maa Kalaratri Navratri Mantra',
    deity: 'Durga',
    blurb: 'The seventh form of Navadurga, for fearlessness and protection.',
    devanagari: ['ॐ देवी कालरात्र्यै नमः ॥', 'ॐ देवी कालरात्र्यै नमः ॥'],
    transliteration: ['Om Devī Kālarātryai Namaḥ', 'Om Devī Kālarātryai Namaḥ'],
    meaning:
      'Salutations to Goddess Kalaratri, who dispels the darkness of fear and ignorance and protects those who take refuge in her.',
    words: [
      ['kālarātrī', 'the dark night that ends fear and ignorance'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 7 of Chaitra and Sharadiya Navratri, or whenever you need fearlessness and protection.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri Day 7', 'Durga Puja'],
    audioUrl: '/Mantras/navratri-day7-kalaratri.mp3',
  },
  {
    slug: 'navratri-day8-mahagauri',
    name: 'Maa Mahagauri Navratri Mantra',
    deity: 'Durga',
    blurb: 'The eighth form of Navadurga, for purity and serenity.',
    devanagari: ['ॐ देवी महागौर्यै नमः ॥', 'ॐ देवी महागौर्यै नमः ॥'],
    transliteration: ['Om Devī Mahāgauryai Namaḥ', 'Om Devī Mahāgauryai Namaḥ'],
    meaning:
      'Salutations to Goddess Mahagauri, radiant and serene, who washes away impurity and blesses the seeker with calm and peace.',
    words: [
      ['mahāgaurī', 'the radiant, fair and pure great Gauri'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 8 of Chaitra and Sharadiya Navratri, or whenever you need purity and serenity.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri Day 8', 'Durga Puja'],
    audioUrl: '/Mantras/navratri-day8-mahagauri.mp3',
  },
  {
    slug: 'navratri-day9-siddhidatri',
    name: 'Maa Siddhidatri Navratri Mantra',
    deity: 'Durga',
    blurb: 'The ninth form of Navadurga, for blessings and fulfilment.',
    devanagari: ['ॐ देवी सिद्धिदात्र्यै नमः ॥', 'ॐ देवी सिद्धिदात्र्यै नमः ॥'],
    transliteration: ['Om Devī Siddhidātryai Namaḥ', 'Om Devī Siddhidātryai Namaḥ'],
    meaning:
      'Salutations to Goddess Siddhidatri, the giver of fulfilment, who blesses the seeker with wisdom and the completion of sincere effort.',
    words: [
      ['siddhidātrī', 'the giver of siddhis, fulfilment and spiritual accomplishment'],
      ['devyai namaḥ', 'reverence to the Goddess'],
    ],
    when: 'Day 9 of Chaitra and Sharadiya Navratri, or whenever you need blessings and fulfilment.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri Day 9', 'Durga Puja'],
    audioUrl: '/Mantras/navratri-day9-siddhidatri.mp3',
  },
  {
    slug: 'durga-yam-devi-sarvabhuteshu',
    name: 'Ya Devi Sarvabhuteshu',
    deity: 'Durga',
    blurb: 'The well-loved verse that bows to the Goddess dwelling in every being as strength.',
    devanagari: ['या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता ।', 'नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥'],
    transliteration: ['Yā devī sarvabhūteṣu śaktirūpeṇa saṁsthitā', 'Namastasyai namastasyai namastasyai namo namaḥ'],
    meaning:
      'To the Goddess who lives in all beings in the form of Shakti, inner strength: I bow to her, and bow again and again.',
    words: [
      ['sarvabhūteṣu', 'in all beings'],
      ['śaktirūpeṇa', 'in the form of strength'],
      ['saṁsthitā', 'who dwells, who is established'],
      ['namastasyai', 'bowing to her'],
    ],
    when: 'During Navratri, in the morning or evening, or any time you need to remember your own strength.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Navratri', 'Durga Puja', 'Inner strength'],
    audioUrl: '/Mantras/durga-yam-devi-sarvabhuteshu.mp3',
  },
  {
    slug: 'durga-sarvamangala-mangalye',
    name: 'Sarvamangala Mangalye',
    deity: 'Durga',
    blurb: 'A short verse of refuge to the Goddess, said in Durga puja and at the start of auspicious work.',
    devanagari: ['सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।', 'शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥'],
    transliteration: ['Sarvamaṅgalamāṅgalye śive sarvārthasādhike', 'Śaraṇye tryambake gauri nārāyaṇi namo’stu te'],
    meaning:
      'O auspicious one, the blessing within everything that is blessed, who fulfils every purpose, giver of refuge, three-eyed Gauri, Narayani: I bow to you.',
    words: [
      ['sarvamaṅgala', 'all that is auspicious'],
      ['sarvārthasādhike', 'she who accomplishes every purpose'],
      ['śaraṇye', 'giver of refuge'],
      ['namo’stu te', 'I bow to you'],
    ],
    when: 'During Navratri and Durga puja, at the start of anything important, or when you want to feel held.',
    moments: ['morning', 'festival'],
    occasions: ['Navratri', 'Durga Puja', 'New beginnings'],
    audioUrl: '/Mantras/durga-sarvamangala-mangalye.mp3',
  },
  {
    slug: 'lokah-samastah-sukhino',
    name: 'Lokah Samastah Sukhino Bhavantu',
    deity: 'Peace',
    blurb: 'The universal prayer for the happiness and freedom of all beings.',
    devanagari: ['लोकाः समस्ताः सुखिनो भवन्तु ॥'],
    transliteration: ['Lokāḥ samastāḥ sukhino bhavantu'],
    meaning: 'May all beings, in all the worlds, be happy and free.',
    words: [
      ['lokāḥ', 'worlds, beings'],
      ['samastāḥ', 'all, everyone'],
      ['sukhinaḥ', 'happy'],
      ['bhavantu', 'may they be'],
    ],
    when: 'At the close of a sitting, in the evening, or before sleep. A good chant for peace, for the world and for those you love.',
    moments: ['evening', 'sleep', 'allday'],
    occasions: ['World peace', 'Evening prayer', 'Close of practice'],
    audioUrl: '/Mantras/lokah-samastah-sukhino.mp3',
  },
  {
    slug: 'jai-ram-shiv-ram-guru-ram',
    name: 'Jai Ram Shiv Ram Guru Ram',
    deity: 'Rama',
    blurb: 'A simple, joyful chant for Thursday, the day of the Guru.',
    devanagari: ['जय राम शिव राम गुरु राम ॥'],
    transliteration: ['Jaya Rāma, Śiva Rāma, Guru Rāma'],
    meaning: 'Glory to Rama, seen as Shiva and as the Guru: one divine presence in the deity and in the teacher.',
    words: [
      ['jaya', 'glory, victory'],
      ['Rāma', 'the one who delights, the name of the divine'],
      ['Śiva', 'the auspicious one'],
      ['Guru', 'the teacher, the remover of darkness'],
    ],
    when: 'On Thursdays, the day of the Guru, in the morning or evening. Easy to chant along with a mala.',
    moments: ['morning', 'evening', 'allday'],
    occasions: ['Thursday', 'Guru Purnima', 'Daily chant'],
    audioUrl: '/Mantras/jai-ram-shiv-ram-guru-ram-1.mp3',
  },
  {
    slug: 'durga-mangalamayi-maa',
    name: 'Mangalmayi Maa',
    deity: 'Durga',
    blurb: 'A short devotional chant to the auspicious, compassionate Mother.',
    devanagari: ['मंगलमयी माँ, शुभदायिनी माँ, करुणामयी माँ ।', 'शरणम् शरणम् ॥'],
    transliteration: ['Maṅgalamayī māṁ, śubhadāyinī māṁ, karuṇāmayī māṁ', 'Śaraṇam śaraṇam'],
    meaning:
      'Auspicious Mother, giver of blessings, Mother full of compassion: I take refuge in you, I take refuge.',
    words: [
      ['maṅgalamayī', 'full of auspiciousness'],
      ['śubhadāyinī', 'giver of what is good'],
      ['karuṇāmayī', 'full of compassion'],
      ['śaraṇam', 'refuge'],
    ],
    when: 'During Navratri and Durga puja, in the morning or evening, or whenever you want to feel held.',
    moments: ['morning', 'evening', 'festival'],
    occasions: ['Navratri', 'Durga Puja', 'Seeking refuge'],
    audioUrl: '/Mantras/durga-mangalamayi-maa.mp3',
  },
  {
    slug: 'tulsi-mantra-singing',
    name: 'Tulsi Pranam (sung)',
    deity: 'Tulsi Mata',
    blurb: 'The verse of salutation to Mother Tulsi, sung softly.',
    devanagari: ['महाप्रसाद जननी । सर्व सौभाग्यवर्धिनी ।', 'आधि व्याधि हरा नित्यं । तुलसी त्वं नमोऽस्तुते ॥'],
    transliteration: ['Mahāprasāda jananī, sarva saubhāgyavardhinī', 'Ādhi vyādhi harā nityaṁ, Tulasī tvaṁ namo’stute'],
    meaning:
      'Mother of the great blessing, increaser of all good fortune, who always takes away worry and sickness: Tulsi, I bow to you.',
    words: [
      ['mahāprasāda jananī', 'mother of the great blessing'],
      ['saubhāgyavardhinī', 'one who increases good fortune'],
      ['ādhi vyādhi', 'worry of the mind and illness of the body'],
      ['namo’stute', 'I bow to you'],
    ],
    when: 'At twilight when you light the diya beside the Tulsi plant, and through the month of Kartik.',
    moments: ['evening', 'festival'],
    occasions: ['Tulsi Vivah', 'Kartik Maas', 'Evening Diya'],
    audioUrl: '/Mantras/tulsi-mantra-singing.mp3',
  },
  {
    slug: 'sharad-purnima-mantra',
    name: 'Sharad Purnima Mahalakshmi Mantra',
    deity: 'Lakshmi',
    blurb: 'A short Mahalakshmi chant for the full-moon night of Sharad Purnima.',
    devanagari: ['ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः ॥'],
    transliteration: ['Oṁ śrīṁ hrīṁ śrīṁ Mahālakṣmyai namaḥ'],
    meaning: 'Om. With the seed sounds Shreem and Hreem, I bow to Mahalakshmi, the goddess of abundance and grace.',
    words: [
      ['śrīṁ', 'seed syllable of Lakshmi'],
      ['hrīṁ', 'seed syllable of the divine mother'],
      ['Mahālakṣmyai', 'to Mahalakshmi'],
      ['namaḥ', 'I bow'],
    ],
    when: 'On the night of Sharad Purnima, under the full moon, with a lit diya. Chant with a mala, or simply listen.',
    moments: ['evening', 'festival'],
    occasions: ['Sharad Purnima', 'Kojagari Lakshmi Puja'],
    audioUrl: '/Mantras/sharad-purnima-mantra.wav',
  },
];

/** A second recording of a mantra we already have, in a different melody. Same text and meaning. */
const variant = (of: string, over: Partial<Mantra> & { slug: string; name: string; blurb: string }): Mantra => {
  const base = BASE_MANTRAS.find((m) => m.slug === of);
  if (!base) throw new Error(`variant of unknown mantra: ${of}`);
  // The YouTube video belongs to the original recording, so it is not carried over.
  return { ...base, videos: undefined, ...over };
};

export const MANTRAS: Mantra[] = [
  ...BASE_MANTRAS,
  variant('mahalakshmi-mantra', {
    slug: 'mahalakshmi-mantra-v2', name: 'Mahalakshmi Mantra (second melody)',
    blurb: 'A longer, slower melody of the Mahalakshmi seed mantra.', audioUrl: '/Mantras/mahalakshmi-mantra-take2.mp3',
  }),
  variant('uma-maheshwara-mantra', {
    slug: 'uma-maheshwara-mantra-v2', name: 'Uma Maheshwara Mantra (second melody)',
    blurb: 'A second, longer melody for family harmony and the unity of strength and grace.', audioUrl: '/Mantras/uma-maheshwara-mantra-take2.mp3',
  }),
  variant('om-suryaya-namah', {
    slug: 'om-suryaya-namah-short', name: 'Om Suryaya Namah (short version)',
    blurb: 'A short version of the Surya chant, for a quick morning offering.', audioUrl: '/Mantras/om-suryaya-namah-short.mp3',
  }),
  variant('jai-ram-shiv-ram-guru-ram', {
    slug: 'jai-ram-shiv-ram-guru-ram-v2', name: 'Jai Ram Shiv Ram Guru Ram (second melody)',
    blurb: 'A second melody of the Thursday chant for the Guru.', audioUrl: '/Mantras/jai-ram-shiv-ram-guru-ram-2.mp3',
  }),
  variant('kubera-ashtalakshmi-mantra', {
    slug: 'kubera-ashtalakshmi-mantra-v2', name: 'Kubera Ashtalakshmi Mantra (second melody)',
    blurb: 'A second melody of the Kubera Ashtalakshmi mantra for prosperity at home.', audioUrl: '/Mantras/kubera-lakshmi-ganesha.mp3',
  }),
  variant('kubera-mantra', {
    slug: 'kubera-mantra-female', name: 'Kubera Mantra (female voice)',
    blurb: 'The Kubera mantra for prosperity, sung in a female voice.', audioUrl: '/Mantras/kubera-mantra-female.mp3',
  }),
];

// Cover pictures (text-free, one deity each). Mantras not listed keep the studio emblem.
const COVER_DIR = '/marketing/mantras/covers/';
const COVERS: Record<string, string> = {
  'om-gan-ganapataye-namah': 'om-gan-ganapataye-namah',
  'ganesha-aarti': 'ganesha-aarti',
  'mahalakshmi-mantra': 'lakshmi-lotus-coins',
  'mahalakshmi-mantra-v2': 'lakshmi-lotus-coins',
  'sharad-purnima-mantra': 'lakshmi-lotus-coins',
  'kubera-mantra': 'kubera-gold-pot',
  'kubera-mantra-female': 'kubera-gold-pot',
  'kubera-ashtalakshmi-mantra': 'lakshmi-eight-lotuses',
  'kubera-ashtalakshmi-mantra-v2': 'lakshmi-eight-lotuses',
  'dhanvantari-mantra': 'dhanvantari-nectar-kalash',
  'maha-sudarshana-mantra': 'vishnu-sudarshana',
  'om-suryaya-namah': 'surya-rising-sun',
  'om-suryaya-namah-short': 'surya-rising-sun',
  'om-adityaya-namah': 'surya-rising-sun',
  'surya-arghya-mantra': 'surya-arghya-water-offering',
  'tulsi-mantra': 'tulsi-vrindavan-diya',
  'tulsi-aarti': 'tulsi-vrindavan-diya',
  'tulsi-mantra-singing': 'tulsi-vrindavan-diya',
  'saraswati-mantra': 'saraswati-veena',
  'shiva-mantra': 'shiva-meditation-ganga',
  'uma-maheshwara-mantra': 'shiva-parvati-together',
  'uma-maheshwara-mantra-v2': 'shiva-parvati-together',
  'shailaputri-mantra': 'shailaputri-bull',
  'navratri-day2-brahmacharini': 'brahmacharini-japa-mala',
  'navratri-day5-skandamata': 'skandamata-infant-skanda',
  'navratri-day6-katyayani': 'katyayani-lion-sword-lotus',
  'navratri-day7-kalaratri': 'kalaratri-protective',
  'navratri-day8-mahagauri': 'mahagauri-white-bull',
  'navratri-day9-siddhidatri': 'siddhidatri-lotus',
  'durga-yam-devi-sarvabhuteshu': 'durga-lion',
  'durga-sarvamangala-mangalye': 'durga-lion',
  'durga-mangalamayi-maa': 'durga-lion',
};
MANTRAS.forEach((m) => { const c = COVERS[m.slug]; if (c && !m.cover) m.cover = `${COVER_DIR}${c}.webp`; });

export const DEITIES = Array.from(new Set(MANTRAS.map((m) => m.deity)));
export const findMantra = (slug: string) => MANTRAS.find((m) => m.slug === slug) || null;
export const thumb = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const PASS_INCLUDES = [
  'Every mantra and all meditation music, without ads, playing on a loop for as long as you like',
  'Neatly organised playlists: by deity, by time of day (morning, evening lamp, sleep), by festival and by mood',
  'A mala counter that counts every repetition as the chant plays, with a soft bell at each mala',
  'A 21 or 40 day sankalp tracker with a daily target and your streak',
  'Puja sequences for Diwali, Dhanteras, Chhath and more, played in order from one press',
  'A sleep timer and lock-screen controls',
  'Every mantra we record in future, added to your pass free',
  'Request a mantra: tell us on WhatsApp what you would like recorded next',
  'Listening only: the pass does not include mp3 downloads, which are sold one mantra at a time',
];

export const MANTRA_FAQ: { q: string; a: string }[] = [
  {
    q: 'Can I buy just one mantra?',
    a: `Yes. Every mantra except the aartis can be bought on its own as an mp3 for ${singlePrice()}, from that mantra's page. You keep the file, and you choose its length: after you pay, message us on WhatsApp with the length you want (for example 10 minutes, 30 minutes or an hour) and we send it to you. One custom length comes with each purchase. The Mantra Pass at ${passPrice()} is different: it lets you listen to the whole library in the app, with the practice tools, but it does not include downloads.`,
  },
  {
    q: 'Is the mantra library free?',
    a: 'Yes. Every mantra page, with the Sanskrit text, transliteration, meaning and our YouTube recording, is free to read and listen to. The Mantra Pass is for people who want to practise with the mantras: a mala counter, a sankalp tracker, puja sequences, a sleep timer, and loop and playlists.',
  },
  {
    q: 'What exactly do I get with the Mantra Pass?',
    a: `Every mantra in the library, on a loop or in playlists by deity, time of day and festival. Also a mala counter, a 21 or 40 day sankalp tracker, puja sequences for the festivals, a sleep timer and lock-screen controls, and every future mantra at no extra cost. Your counts are saved on the device you use. You pay once. There is no subscription.`,
  },
  {
    q: 'How do I get access after paying?',
    a: 'After payment we email your access link to the address you give at checkout, usually the same day and always within 24 hours. If it has not arrived, message us on WhatsApp and we will send it straight away.',
  },
  {
    q: 'Can I get a refund?',
    a: `Yes. If the pass is not right for you, tell us within ${MANTRA_PASS_REFUND_DAYS} days by email or WhatsApp and we refund you in full.`,
  },
  {
    q: 'Why is the price lower now?',
    a: 'Every future mantra we record is included in your pass at no extra cost. You pay once.',
  },
  {
    q: 'I am new to mantras. Where do I start?',
    a: 'Start with one short mantra, such as Om Gan Ganapataye Namah, and chant or listen to it at the same time every day for 21 days. You do not need initiation, a mala or perfect pronunciation to begin. Sincerity and regularity matter most.',
  },
  {
    q: 'Do mantras cure illness?',
    a: 'No. Mantra chanting is a devotional and contemplative practice. Many people find it steadying, but it is not medical treatment and we make no health claims. Please see a doctor for any health concern.',
  },
];
