import { Mic, Activity, Bell, Sparkles } from 'lucide-react';

const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:v=|\/)([\w-]{11})/);
    return match ? match[1] : url;
};

export const CHAPTERS = [
    {
        id: 'observer',
        num: 'I',
        subtitle: 'You Are Not Your Mind',
        desc: 'Witness the voice in your head and discover the gap of awareness behind it.',
        icon: Mic,
        color: '#5EC4B0',
        parts: [
            { id: '1.1', title: 'Stop Overthinking', youtubeId: extractYouTubeId('https://www.youtube.com/watch?v=S79_XZAaBII'), duration: '14:32' },
            { id: '1.2a', title: "You Are Not Your Thoughts (Here's Proof)", youtubeId: 'CyByxCxMZLk', duration: '11:45' },
            { id: '1.2b', title: 'Is Thinking a Disease?', youtubeId: 'N17onqQSQEc', duration: '10:20' },
            { id: '1.3', title: 'Freeing Yourself from Your Mind', youtubeId: extractYouTubeId('https://www.youtube.com/watch?v=A5DmCojZxno'), duration: '13:20' },
            { id: '1.4a', title: 'The Origin of Fear', youtubeId: extractYouTubeId('https://www.youtube.com/watch?v=DpVYPFKcTJ8'), duration: '10:15' },
            { id: '1.4b', title: 'Suppressed Emotions', youtubeId: extractYouTubeId('https://www.youtube.com/watch?v=YfNH_Gl-H-s'), duration: '12:08' },
            { id: '1.5a', title: 'STOP Your Mind From Lying to You', youtubeId: 'DpVYPFKcTJ8', duration: '15:40' },
        ]
    },
    {
        id: 'consciousness',
        num: 'II',
        subtitle: 'The Way Out of Pain',
        desc: 'Discover how consciousness itself dissolves suffering when you stop identifying with the mind.',
        icon: Activity,
        color: '#3D8B7A',
        parts: [
            { id: '2.1', title: 'Stop Fighting Reality', youtubeId: extractYouTubeId('https://www.youtube.com/watch?v=hHJAoVYARqw'), duration: '12:10' },
            { id: '2.2', title: 'How to Accept an Awful Moment', youtubeId: '73WJo3-4TxE', duration: '9:45' },
            { id: '2.3', title: 'The "Watcher" Technique: Secret to Instant Peace', youtubeId: '3B9ZtrIOaBs', duration: '11:30' },
            { id: '2.4', title: 'The Pain Body: Trapped Emotional Energy', youtubeId: 'dxyTsA2JIRI', duration: '13:20' },
            { id: '2.5', title: 'Why Pain Gets Louder Before It Heals', youtubeId: 'c_nGfqdvBZk', duration: '10:55' },
            { id: '2.6', title: 'Pain Gets LOUDER Before Healing: 4 Steps to Dissolve It', youtubeId: '-UstwEMF93c', duration: '8:40' },
            { id: '2.7', title: 'Why You Still Suffer Even When Life Is "Fine"', youtubeId: 'FpiRpv_0wUU', duration: '14:15' },
            { id: '2.8', title: "The Anxiety Trap: 90% Of Your Fear Isn't Real", youtubeId: 'T_2cqBcySfs', duration: '12:00' },
            { id: '2.9', title: 'Addicted to Your Own Suffering?', youtubeId: 'YfNH_Gl-H-s', duration: '11:00' },
            { id: '2.10', title: 'Consciousness: The Way Out of Pain (Ch. 2 Finale)', youtubeId: 'hHJAoVYARqw', duration: '16:30' },
        ]
    },
    {
        id: 'now',
        num: 'III',
        subtitle: 'Moving Deeply into the Now',
        desc: 'Learn to dissolve the illusion of time and enter the only moment that ever exists.',
        icon: Bell,
        color: '#C4A8C8',
        parts: [
            { id: '3.1', title: 'Stop Thinking & Start LIVING', youtubeId: extractYouTubeId('https://www.youtube.com/watch?v=MAHHfa2thto'), duration: '15:20' },
            { id: '3.2', title: 'Coming Soon', youtubeId: '', duration: '--:--' },
            { id: '3.3', title: 'Coming Soon', youtubeId: '', duration: '--:--' },
            { id: '3.4', title: 'Coming Soon', youtubeId: '', duration: '--:--' },
        ]
    },
    {
        id: 'mind-strategies',
        num: 'IV',
        subtitle: 'Mind Strategies for Avoiding Now',
        desc: 'Understand how the egoic mind continually seeks to escape the present moment.',
        icon: Sparkles, // Or another icon
        color: '#A9CBB7',
        parts: [
            { id: '4.1', title: 'Loss of Now: The Core Delusion', youtubeId: 'FLLZ4EQofQY', duration: '--:--' },
            { id: '4.2', title: 'Ordinary Unconsciousness', youtubeId: 'Ro-gAvnjNj8', duration: '--:--' },
            { id: '4.3', title: 'What Are You Searching For?', youtubeId: 'C7T7b0XFS0I', duration: '--:--' },
            { id: '4.4', title: 'Dissolving Ordinary Unconsciousness', youtubeId: 'V7yITPggtTs', duration: '--:--' },
            { id: '4.5', title: 'Freedom from Unhappiness', youtubeId: 'ahf_93U8as0', duration: '--:--' },
            { id: '4.6', title: 'Wherever You Are, Be There Totally', youtubeId: 'dAVLVCAktnQ', duration: '--:--' },
        ]
    },
    {
        id: 'bonus',
        num: 'Bonus',
        subtitle: 'Bonus Sections & Practice',
        desc: 'Deepen your journey with advanced insights and guided practice tools.',
        icon: Sparkles,
        color: '#ABCEC9',
        parts: [
            { id: 'B1', title: 'Why do we forget who we are?', youtubeId: 'zKvSH7H1qo4', duration: '5:24' },
            { id: 'B2', title: 'Stop Overthinking', youtubeId: 'S79_XZAaBII', duration: '14:32' },
            { id: 'B3', title: 'A Short Meditation', youtubeId: '-Z6akljf7mc', duration: '14:00' },
        ]
    },
];

export const TOTAL_PARTS = CHAPTERS.reduce((sum, ch) => sum + ch.parts.length, 0);
export const MAIN_PARTS_COUNT = CHAPTERS.filter(ch => ch.id !== 'bonus').reduce((sum, ch) => sum + ch.parts.length, 0);
