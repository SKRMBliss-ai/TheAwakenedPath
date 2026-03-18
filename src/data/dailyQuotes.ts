export const DAILY_QUOTES = [
    { author: "Eckhart Tolle", text: "The beginning of freedom is the realization that you are not the thinker." },
    { author: "Thich Nhat Hanh", text: "Smile, breathe, and go slowly." },
    { author: "Rumi", text: "The wound is the place where the Light enters you." },
    { author: "Lao Tzu", text: "Nature does not hurry, yet everything is accomplished." },
    { author: "Ram Dass", text: "The quieter you become, the more you can hear." },
    { author: "Jon Kabat-Zinn", text: "You can't stop the waves, but you can learn to surf." },
    { author: "Eckhart Tolle", text: "Realize deeply that the present moment is all you have." },
    { author: "Dalai Lama", text: "Sleep is the best meditation." },
    { author: "Thich Nhat Hanh", text: "Walk as if you are kissing the Earth with your feet." },
    { author: "Pema Chödrön", text: "Nothing ever goes away until it has taught us what we need to know." },
    { author: "Rumi", text: "Let the silence take you to the core of life." },
    { author: "Marcus Aurelius", text: "You have power over your mind - not outside events. Realize this, and you will find strength." },
    { author: "Eckhart Tolle", text: "Life is the dancer and you are the dance." },
    { author: "Jack Kornfield", text: "To bow to the fact of our life's sorrows and betrayals is to accept them; and from this deep gesture we discover that all life is workable." },
    { author: "Sharon Salzberg", text: "Mindfulness isn't difficult, we just need to remember to do it." },
    { author: "Thich Nhat Hanh", text: "The present moment is filled with joy and happiness. If you are attentive, you will see it." },
    { author: "Alan Watts", text: "Muddy water is best cleared by leaving it alone." },
    { author: "Lao Tzu", text: "When I let go of what I am, I become what I might be." },
    { author: "Eckhart Tolle", text: "Awareness is the greatest agent for change." },
    { author: "Byron Katie", text: "Life is simple. Everything happens for you, not to you." },
    { author: "Rumi", text: "You are not a drop in the ocean. You are the entire ocean, in a drop." },
    { author: "Pema Chödrön", text: "The most fundamental aggression to ourselves, the most fundamental harm we can do to ourselves, is to remain ignorant by not having the courage and the respect to look at ourselves honestly and gently." },
    { author: "Tara Brach", text: "Perhaps the biggest tragedy of our lives is that freedom is possible, yet we can pass our years trapped in the same old patterns." },
    { author: "Mooji", text: "Step into the fire of self-discovery. This fire will not burn you, it will only burn what you are not." },
    { author: "Adyashanti", text: "Enlightenment is a destructive process. It has nothing to do with becoming better or being happier. Enlightenment is the crumbling away of untruth." },
    { author: "Eckhart Tolle", text: "Accept—then act. Whatever the present moment contains, accept it as if you had chosen it." },
    { author: "Thich Nhat Hanh", text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor." },
    { author: "Carl Jung", text: "Who looks outside, dreams; who looks inside, awakes." }
];

export function getDailyQuote() {
    // Determine a unique quote for each day
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return DAILY_QUOTES[daysSinceEpoch % DAILY_QUOTES.length];
}
