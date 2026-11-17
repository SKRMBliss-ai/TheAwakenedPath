// ─────────────────────────────────────────────────────────────────────────────
// Soulful Mantra Studio — the mantra library and the Sadhana Lifetime Pass.
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

export const waLink = (text: string) => `${MANTRA_WHATSAPP}?text=${encodeURIComponent(text)}`;

// ── Lifetime Pass ────────────────────────────────────────────────────────────
export const MANTRA_PASS_ID = 'mantra_lifetime_pass';
/** false switches the buy button off (shows "Opening soon"). */
export const MANTRA_PASS_OPEN = true;
export const MANTRA_PASS_REFUND_DAYS = 7;
/** When the founding price ends (shown after "rises to ₹999"). The backend still
 *  charges the founding price until COURSE_PRICES in functions/index.js is changed. */
export const MANTRA_PRICE_RISE = 'from January 2027';

const PASS_FOUNDING: Record<KidsCurrency, number> = { USD: 4.99, INR: 299 };
const PASS_REGULAR: Record<KidsCurrency, number> = { USD: 11.99, INR: 999 };

export const MANTRA_CURRENCY: KidsCurrency = KIDS_ZOOM_CURRENCY;
export const passPrice = () => formatKidsPrice(PASS_FOUNDING[MANTRA_CURRENCY], MANTRA_CURRENCY);
export const passRegularPrice = () => formatKidsPrice(PASS_REGULAR[MANTRA_CURRENCY], MANTRA_CURRENCY);

// ── Catalogue ────────────────────────────────────────────────────────────────
export type Moment = 'morning' | 'evening' | 'sleep' | 'festival' | 'allday';

export const MOMENTS: { id: Moment; label: string; blurb: string }[] = [
  { id: 'morning', label: 'Morning', blurb: 'Short chants to begin the day' },
  { id: 'evening', label: 'Evening lamp', blurb: 'For the evening diya and winding down' },
  { id: 'sleep', label: 'Before sleep', blurb: 'Slow, soft loops for rest' },
  { id: 'festival', label: 'Festival puja', blurb: 'Diwali, Dhanteras, Chhath, Tulsi Vivah' },
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
  videos: { id: string; label: string }[];
}

export const MANTRAS: Mantra[] = [
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
];

export const DEITIES = Array.from(new Set(MANTRAS.map((m) => m.deity)));
export const findMantra = (slug: string) => MANTRAS.find((m) => m.slug === slug) || null;
export const thumb = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const PASS_INCLUDES = [
  'Every mantra without ads, playing on a loop for as long as you like',
  'Neatly organised playlists: by deity, by time of day (morning, evening lamp, sleep) and by festival',
  'A lyrics and meaning PDF for every mantra: Devanagari, transliteration and plain English',
  'A 21-day and a 40-day sadhana plan you can print',
  'Every mantra we record in future, added to your pass free',
  'Request a mantra: tell us on WhatsApp what you would like recorded next',
];

export const MANTRA_FAQ: { q: string; a: string }[] = [
  {
    q: 'Is the mantra library free?',
    a: 'Yes. Every mantra page, with the Sanskrit text, transliteration, meaning and our YouTube recording, is free to read and listen to. The Sadhana Lifetime Pass is for people who want to play the mantras on a loop without ads, in organised playlists, with the PDFs and the sadhana plans.',
  },
  {
    q: 'What exactly do I get with the Sadhana Lifetime Pass?',
    a: `Every mantra in the library, without ads and playing on a loop, organised into playlists by deity, time of day and festival. Also a lyrics and meaning PDF for each mantra, a printable 21-day and 40-day sadhana plan, and every future mantra at no extra cost. You pay once. There is no subscription.`,
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
    a: `We are a young studio and this is our founding listener price. It goes up for new buyers ${MANTRA_PRICE_RISE}. Anyone who joins now keeps every future mantra free.`,
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
