/**
 * The Inner Journey School curriculum — Level 1 (Grounding / Connecting /
 * Continuing) and the Level 2 twelve-week meditation course.
 *
 * These lessons live in the Skool classroom, not in Mind Gym, so nothing here
 * can be observed as watched the way an in-app video can. Completion is
 * therefore a MANUAL tick, stored in its own record
 * (users/{uid}/progress/innerJourney), and the lesson opens in the classroom
 * in a new tab.
 *
 * Generated from the Inner Journey source so the titles and classroom links
 * stay verbatim — do not hand-edit the lesson lists.
 */

export interface SchoolLesson {
  /** Stable id, used as the completion key. */
  id: string;
  title: string;
  /** The classroom URL — these lessons are external. */
  href: string;
}

export interface SchoolStage {
  key: string;
  /** Short label for the track segment. */
  label: string;
  /** Full name, shown in the drawer. */
  title: string;
  lessons: SchoolLesson[];
}

export const SCHOOL_CURRICULUM: SchoolStage[] = [
  {
    key: 'ij-s1',
    label: 'Grounding',
    title: 'Level 1 · Stage 1 — Grounding',
    lessons: [
      { id: 'ij-s1-01', title: 'Orientation: The Path Begins Here', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=4df161eb267d448291b5cc4b21688605' },
      { id: 'ij-s1-02', title: 'Your 30-Day Path: Please Watch', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=da2b4074ea664a45ad15728ed3fa7aed' },
      { id: 'ij-s1-03', title: 'How to use the Course Features', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=3d98d61243664b04a7a82f8b205168f2' },
      { id: 'ij-s1-04', title: 'L1: What actually is Meditation?', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=39929f55dd63427b99799e6ebb78cc64' },
      { id: 'ij-s1-05', title: 'L2: Why a Formal Position Matters', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=fba3031121874ee381d91bd351ee1f05' },
      { id: 'ij-s1-06', title: 'L3: The 6 Meditation Asanas', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=b7baa9a287f641b19a297c60014c21e7' },
      { id: 'ij-s1-07', title: 'L4: How To Choose Your Position', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=031601fbd304492db545e698dbe559f3' },
      { id: 'ij-s1-08', title: 'L5: Kneeling stool & zafu', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=4dbdd311d2a348e595d34a74270300d4' },
      { id: 'ij-s1-09', title: 'L6: 3 Hand Positions (Mudras)', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=8bbf2fcfa9eb475998bb46237dac0288' },
      { id: 'ij-s1-10', title: 'L7: Setting up Your Sacred Space', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=e7955f1c59064dfea03a5cb77bfcbe29' },
      { id: 'ij-s1-11', title: 'L8: Correct Breathing', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=36e83dbb5ba74645b34ac2df4f30e883' },
      { id: 'ij-s1-12', title: 'L9: "So-Hum" Meditation Explained', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=93099ccd2e6d4613901fa677575f6b12' },
      { id: 'ij-s1-13', title: 'L10: 21 repetitions of "OM"', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=5a6849b92ee248b6814109966c8f6e2c' },
      { id: 'ij-s1-14', title: 'L11: Guided So-Hum Meditation', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=fe2e84903e3042bfad9df4798d1f298c' },
    ],
  },
  {
    key: 'ij-s2',
    label: 'Connecting',
    title: 'Level 1 · Stage 2 — Connecting',
    lessons: [
      { id: 'ij-s2-01', title: 'L12: Gather - Flow - Merge', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=fd162deb0a9a4ce6993bccbc8391ec0b' },
      { id: 'ij-s2-02', title: 'L13: Mastering Distractions', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=e074ee75646a4c1faf9e364b3e897069' },
      { id: 'ij-s2-03', title: 'L14: Connecting With the Divine', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=8651e7920644418da948e7101ed57be1' },
      { id: 'ij-s2-04', title: 'L15: Nature and the Higher Self', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=ae70f8e08d1c428093c65215a2d3e088' },
      { id: 'ij-s2-05', title: 'L16: Meditation on a Divine Form', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=a145669c7db44a819d4d7b8c3d202879' },
      { id: 'ij-s2-06', title: 'L17: Connecting with Gurus & Spirit Guides', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=331538e1137d4728ad36f1ac6e018e48' },
      { id: 'ij-s2-07', title: 'L18: Pranayama (Nadi Shodhana)', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=82951119f0c74ce087f53b55e89c88d5' },
      { id: 'ij-s2-08', title: 'L19: Guided Divine Meditation', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=a9b98c596a574ddc95809c70f8c66740' },
    ],
  },
  {
    key: 'ij-s3',
    label: 'Continuing',
    title: 'Level 1 · Stage 3 — Continuing',
    lessons: [
      { id: 'ij-s3-01', title: 'L20: Inner Communion Through Prayer', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=9710d0dc7bf34f5f89fcf5bb61a7c0ca' },
      { id: 'ij-s3-02', title: 'L21: How To Advance in Meditation', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=cc6d72eae88e4f1baa02a94bac8c2018' },
      { id: 'ij-s3-03', title: 'L22: What is "Open Awareness"?', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=346ead6bcbf14a88a52319df6d39c211' },
      { id: 'ij-s3-04', title: 'L23: Circle Method (Guided)', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=f9ac4d50096e4c4bb3a80adbb724cbbc' },
      { id: 'ij-s3-05', title: 'L24: Guided Open-Awareness Meditation', href: 'https://www.skool.com/inner-journey-school/classroom/7dc1b586?md=d8da091260644f32a75d8ee181e6394b' },
    ],
  },
  {
    key: 'ij-l2',
    label: '12-week course',
    title: 'Level 2 · 12-Week Meditation Course',
    lessons: [
      { id: 'ij-l2-01', title: 'Start here: Course introduction', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=4af3393575474949a1b99639bea8e13a' },
      { id: 'ij-l2-02', title: 'Week 1 — Tibetan Colour', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=dd87f8acf1b6497ebf7153c983cd6721' },
      { id: 'ij-l2-03', title: 'Week 2 — Tibetan Colour', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=8e1dcfa592d84d149bddff4e1faa6175' },
      { id: 'ij-l2-04', title: 'Week 3 — Tibetan Colour', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=808dda3c2915447fbefd93acc9fc8491' },
      { id: 'ij-l2-05', title: 'Week 4 — Trataka', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=8336410252d14cad858a3133d35e2d53' },
      { id: 'ij-l2-06', title: 'Week 5 — Trataka', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=8660b34c290140a899a65270ea28b058' },
      { id: 'ij-l2-07', title: 'Week 6 — Trataka', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=ab9ae5a808914d678e761463c1ae3146' },
      { id: 'ij-l2-08', title: 'Week 7 — Anapana', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=b7583b8aaf8e499b89ffaa469c1ba1ab' },
      { id: 'ij-l2-09', title: 'Week 8 — Anapana', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=fb49938d4b2a445f8f92e8ca81080b25' },
      { id: 'ij-l2-10', title: 'Week 9 — Anapana', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=b808ca72478f47a18a88a8c45e237747' },
      { id: 'ij-l2-11', title: 'Week 10 — Self-Enquiry', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=4d76c5c858f64114befdc0b294674733' },
      { id: 'ij-l2-12', title: 'Week 11 — Self-Enquiry', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=479e336770a14bf28c5326d319beb303' },
      { id: 'ij-l2-13', title: 'Week 12 — Self-Enquiry', href: 'https://www.skool.com/inner-journey-school/classroom/b8642523?md=e9021fe63aa44c4bbafccbb41c19d2fa' },
    ],
  },
];

/** Every School lesson id, for quick membership tests. */
export const SCHOOL_LESSON_IDS = new Set<string>(
  SCHOOL_CURRICULUM.flatMap((s) => s.lessons.map((l) => l.id)),
);
