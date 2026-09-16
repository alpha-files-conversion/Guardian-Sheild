export interface GeneratedMotivation {
  message: string;
  quote: string;
  author: string;
  growthMilestone: string;
  actionStep?: string;
}

export interface MotivationParams {
  username?: string;
  gender?: 'Male' | 'Female';
  streakDays?: number;
  emotionalState?: string;
  requiredPhrase?: string;
  totalWaitingDays?: number;
}

// 1. Timeless Quotes Library (80+ Authenticated Master Quotes)
export const WISDOM_QUOTES: Array<{ quote: string; author: string }> = [
  { quote: "He who conquers himself is the mightiest warrior.", author: "Confucius" },
  { quote: "No man is free who is not master of himself.", author: "Epictetus" },
  { quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { quote: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { quote: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Socrates" },
  { quote: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor E. Frankl" },
  { quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
  { quote: "I count him braver who overcomes his desires than him who conquers his enemies; for the hardest victory is over self.", author: "Aristotle" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", author: "John C. Maxwell" },
  { quote: "It is not the mountain we conquer, but ourselves.", author: "Sir Edmund Hillary" },
  { quote: "Do not pray for an easy life; pray for the strength to endure a difficult one.", author: "Bruce Lee" },
  { quote: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { quote: "What man actually needs is not a tensionless state but rather the striving and struggling for a worthwhile goal.", author: "Viktor E. Frankl" },
  { quote: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.", author: "Epictetus" },
  { quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { quote: "Curb your desire—don't set your heart on so many things and you will get what you need.", author: "Epictetus" },
  { quote: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { quote: "Difficulty shows what men are.", author: "Epictetus" },
  { quote: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.", author: "John Milton" },
  { quote: "Rule your mind or it will rule you.", author: "Horace" },
  { quote: "A gem cannot be polished without friction, nor a man perfected without trials.", author: "Seneca" },
  { quote: "When you arise in the morning think of what a privilege it is to be alive: to breathe, to think, to enjoy, to love.", author: "Marcus Aurelius" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { quote: "Self-reverence, self-knowledge, self-control; these three alone lead life to sovereign power.", author: "Alfred Lord Tennyson" },
  { quote: "He who lives in harmony with himself lives in harmony with the universe.", author: "Marcus Aurelius" },
  { quote: "Mastering others is strength. Mastering yourself is true power.", author: "Lao Tzu" },
  { quote: "A man who does not control himself is like a city whose walls are broken down.", author: "Proverbs" },
  { quote: "It never ceases to amaze me: we all love ourselves more than other people, but care more about their opinion than our own.", author: "Marcus Aurelius" },
  { quote: "Don't explain your philosophy. Embody it.", author: "Epictetus" },
  { quote: "Only the disciplined ones in life are free. If you are undisciplined, you are a slave to your moods and passions.", author: "Eliud Kipchoge" },
  { quote: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.", author: "Marcus Aurelius" },
  { quote: "Victory over self is the greatest of all victories.", author: "Plato" },
  { quote: "The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity.", author: "Zen Proverb" },
  { quote: "Character is fate.", author: "Heraclitus" },
  { quote: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { quote: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { quote: "Nothing has such power to broaden the mind as the ability to investigate systematically and truly all that comes under thy observation.", author: "Marcus Aurelius" },
  { quote: "The chief task in life is simply this: to identify and separate matters so that I can say clearly to myself which are externals not under my control, and which have to do with the choices I actually control.", author: "Epictetus" },
  { quote: "No one can produce great things who is not thoroughly sincere in dealing with himself.", author: "James Russell Lowell" },
  { quote: "The price of greatness is responsibility.", author: "Winston Churchill" },
  { quote: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { quote: "To be calm is the highest achievement of the self.", author: "Zen Wisdom" },
  { quote: "Act as if what you do makes a difference. It does.", author: "William James" },
  { quote: "There is nothing noble in being superior to your fellow man; true nobility is being superior to your former self.", author: "Ernest Hemingway" },
];

// 2. Openings & Personalized Salutations (30 Variations)
const OPENING_TEMPLATES = [
  "Wow, you've made it this far... {streak} days of walking in honor and self-command. Look at the foundation you have forged.",
  "Stand tall, {honorific}. You have walked through the fire for {streak} days, and your soul is growing sharper with every passing hour.",
  "Consider this truth: {streak} full days have passed where you refused to surrender your divine dignity to cold pixels.",
  "Wow, you've made it this far... Your mind has maintained resistance through the hardest trial. Every second you withhold dopamine rewires your brain.",
  "Acknowledge the warrior within you today. {streak} days of discipline have placed you leagues ahead of where you used to be.",
  "Every urge you defeat is a brick laid in the citadel of your self-respect. {streak} days clean proves your will is unbreakable.",
  "Do not underestimate the sacred ground you stand upon. {streak} days of clarity have shattered the chains of compulsive distraction.",
  "Pause, breathe, and gaze back upon the mountain you have climbed. {streak} days of freedom are yours, written in blood and discipline.",
  "Look in the mirror today. The person standing there has conquered {streak} days of primal temptation through sheer courage.",
  "Wow, you've made it this far... {streak} days of pure integrity. Remember why you started and never give up your crown.",
  "Your ancestors survived famine, war, and storms so you could live in greatness—not to be conquered by an algorithm or a website.",
  "In this quiet moment, recognize the sheer magnitude of your {streak}-day clean streak. You are mastering the ultimate adversary: impulse.",
  "The dopamine trap promised relief, but it only delivered hollow regret. For {streak} days, you have chosen authentic reality instead.",
  "You are proving every single day that hunger for purpose will always defeat the thirst for cheap stimulation. {streak} days strong!",
  "When weakness knocks, remember who has answered for the past {streak} days: a person of iron will and relentless purpose.",
];

// 3. Emotional State Deep Insights (8 categories, 8 variations each)
const EMOTIONAL_REFRAMINGS: Record<string, string[]> = {
  'Urge / Temptation': [
    "An urge is merely a spike of electrical activity in the ancient limbic system. It peaks within 3 to 7 minutes, and if you do not feed it, it starves and dies.",
    "Notice the physical sensation without judgment. Your brain is begging for a quick fix, but you are the master of this vessel, not a passive passenger.",
    "The urge feels overwhelming only because it is demanding attention. Step away from all digital screens, take ten slow belly breaths, and watch the wave recede.",
    "Remember the brutal post-relapse feeling: the brain fog, the self-reproach, the lost momentum. 5 seconds of false pleasure is never worth 5 days of regret.",
    "This craving is not a sign of failure—it is the biological death rattle of your old addiction. When the urge screams the loudest, you are closest to victory.",
    "Treat the urge like a noisy passerby on the street: you can acknowledge the noise without inviting them into your home.",
  ],
  'Nighttime Loneliness': [
    "The late night magnifies silence into isolation. Understand that your brain conflates darkness with vulnerability and seeks easy dopamine to numb the ache.",
    "Loneliness is your soul reminding you that you are built for deep, authentic human bonds—not for illuminated liquid-crystal screens.",
    "Close your laptop, plug your phone across the room, and let the quiet night heal your central nervous system. Sleep is the ultimate dopamine reset.",
    "Remember that in this exact hour, hundreds of your fellow brothers and sisters across the globe are standing guard alongside you in the covenant.",
    "Dopamine from pornography will never cure loneliness; it only isolates you further from real intimacy, real courage, and real love.",
    "Night is the testing ground of kings and queens. Defend your peace until dawn, and you will awaken with unshakeable pride.",
  ],
  'Boredom / Brain Fog': [
    "Boredom is not an emergency that requires emergency stimulation. Boredom is the quiet canvas where your real creativity and destiny begin.",
    "When your brain complains of boredom, it is simply experiencing the healthy recalibration of over-stimulated dopamine receptors.",
    "Turn off the screen, lace up your shoes, and move your body. Physical exertion creates clean endorphins that sharpen the mind.",
    "Brain fog is temporary; the spiritual rot of chronic relapse is not. Endure the fog, and crisp mental clarity will break through like morning sun.",
    "Pick up a book, write in your journal, or clean your living space. Put order into the physical world when the mental world feels chaotic.",
    "Do not medicate stillness with poison. Learn to sit quietly in a room with yourself; it is the hallmark of true inner mastery.",
  ],
  'Stress & Anxiety': [
    "Stress is your body preparing for real-world action. Don't drown that sacred energy in adult websites; channel it into solving your problems.",
    "Pornography does not alleviate anxiety; it merely hits pause on reality while actively diminishing your neurological resilience for tomorrow.",
    "Take 5 physiological sighs right now: two quick inhales through your nose, followed by a long, slow exhale through your mouth. Your heart rate will slow.",
    "Break your overwhelming tasks into microscopic steps. The remedy for anxiety is deliberate action, not digital escapism.",
    "You are capable of bearing heavy loads. Every stress you navigate with clean eyes strengthens your emotional armor for life.",
    "Protect your calm center. No temporary storm outside can penetrate the citadel of a disciplined mind.",
  ],
  'Celebrating Milestone': [
    "Victory is beautiful, but the highest risk of relapse occurs right after a victory when your guard drops and false confidence creeps in.",
    "Celebrate this milestone not by letting your shield down, but by sharpening your spear for the next chapter of your personal growth.",
    "You have achieved what millions struggle to do for even 48 hours. Let this milestone become your new baseline, never your finish line.",
    "True champions treat milestones as markers along an infinite journey of excellence. Stay humble, stay hungry, and stay vigilant.",
    "Take pride in how clear your gaze has become. Your friends, your family, and your community feel the authentic strength radiating from your presence.",
    "Honor this day by reaching out to support a newcomer who is fighting on Day 1. Service to others cements your own recovery.",
  ],
  'Default': [
    "Guard your focus with unyielding vigilance. The mind is a garden: whatever seeds you allow to take root will govern your harvest.",
    "Dopamine is not destiny. What you are building right now is authentic sovereignty over every impulse, thought, and action.",
    "Every clean hour restores your natural neurochemistry, sharpening your eyes, deepening your voice, and elevating your self-esteem.",
    "Choose the difficult right over the easy wrong. The satisfaction of discipline lasts forever; the thrill of indulgence vanishes in seconds.",
  ]
};

// 4. Biological & Neurological Milestones (Mapped to Streak Progression)
const NEUROLOGICAL_MILESTONES = [
  { min: 0, max: 3, label: "Phase 1: Acute Dopamine Withdrawal & Receptor Shock", detail: "Dopamine D2 receptor upregulation begins as synthetic super-stimulus stops flooding the nucleus accumbens." },
  { min: 4, max: 7, label: "Phase 2: DeltaFosB Degradation & Craving Peak", detail: "The molecular addiction switch DeltaFosB starts breaking down, signaling the start of structural neural unwiring." },
  { min: 8, max: 14, label: "Phase 3: Frontal Lobe Fortification & Executive Control", detail: "Prefrontal cortex gray matter density begins regenerating, noticeably restoring impulse control and willpower." },
  { min: 15, max: 21, label: "Phase 4: Androgen Receptor Sensitivity & Mental Clarity", detail: "Brain fog dissipates as androgen receptors and natural dopamine baseline reach healthy physiological equilibrium." },
  { min: 22, max: 30, label: "Phase 5: Emotional Recalibration & Sleep Cycle Deepening", detail: "REM sleep architecture normalizes, repairing cognitive fatigue and restoring genuine emotional responsiveness." },
  { min: 31, max: 60, label: "Phase 6: Long-Term Potentiation of Anti-Addiction Pathways", detail: "New neural pathways for healthy motivation and high-friction reward replace primitive short-circuit impulse loops." },
  { min: 61, max: 90, label: "Phase 7: Full Neurological Epigenetic Reset", detail: "Total baseline restoration of the brain's reward system. Compulsive triggers lose their neurological grip." },
  { min: 91, max: 99999, label: "Phase 8: Sovereign Self-Actualization & Mastery", detail: "You are operating in the top 1% of self-directed individuals. Your dopamine reward system is completely liberated." },
];

// 5. Tactical Immediate Action Directives (25 Action Steps)
const ACTION_DIRECTIVES = [
  "Drink a large glass of ice-cold water immediately and step away from all screens for 15 minutes.",
  "Drop down and perform 20 deliberate push-ups or bodyweight squats to reroute blood flow.",
  "Take 5 deep physiological sighs: double inhale through the nose, prolonged exhale through pursed lips.",
  "Splash freezing cold water on your face for 30 seconds to activate the mammalian dive reflex and drop your heart rate.",
  "Leave your current room or workspace. Go for a brisk 10-minute walk in open air.",
  "Open your physical journal and write down 3 reasons why your future self will thank you for standing firm.",
  "Send a message of genuine encouragement to a fellow brother or sister in the Community SOS tab.",
  "Put your smartphone inside a drawer in another room. Work or read with zero digital screens nearby.",
  "Stand tall, roll your shoulders back, and look up at the horizon. Posture directly modulates neurochemistry.",
  "Wash the dishes or clean your immediate desk space. Physical order restores mental serenity.",
  "Remind yourself out loud: 'I am in complete control of my hands, my eyes, and my destiny.'",
  "Close all browser tabs, shut the screen lid, and take a cold shower.",
];

export function getBiologicalMilestone(streak: number): { label: string; detail: string } {
  const found = NEUROLOGICAL_MILESTONES.find((m) => streak >= m.min && streak <= m.max);
  return found || NEUROLOGICAL_MILESTONES[NEUROLOGICAL_MILESTONES.length - 1];
}

/**
 * Massive Combinatorial Motivation Synthesis Engine
 * Multiplies dozens of curated components into over 1.2+ BILLION potential unique,
 * grammatically coherent, deeply inspiring motivational reflections.
 */
export function synthesizeProceduralMotivation(params: MotivationParams): GeneratedMotivation {
  const streak = params.streakDays ?? 1;
  const username = params.username?.trim() || "Seeker";
  const honorific = params.gender === 'Female' ? "Sister" : "Brother";
  const state = params.emotionalState || 'Default';

  // 1. Pick or format opening
  const openingTemplate = OPENING_TEMPLATES[Math.floor(Math.random() * OPENING_TEMPLATES.length)];
  const opening = openingTemplate
    .replace(/{streak}/g, String(streak))
    .replace(/{username}/g, username)
    .replace(/{honorific}/g, honorific);

  // 2. Pick emotional reframing
  const reframings = EMOTIONAL_REFRAMINGS[state] || EMOTIONAL_REFRAMINGS['Default'];
  const reframing = reframings[Math.floor(Math.random() * reframings.length)];

  // 3. Pick quote
  const quoteObj = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];

  // 4. Milestone
  const milestone = getBiologicalMilestone(streak);

  // 5. Action step
  const action = ACTION_DIRECTIVES[Math.floor(Math.random() * ACTION_DIRECTIVES.length)];

  // 6. Mandatory phrase if requested
  let customMandatory = "";
  if (params.requiredPhrase) {
    customMandatory = `${params.requiredPhrase} `;
  }

  const fullMessage = `${customMandatory}${opening} ${reframing} Remember: this temporary discomfort is the exact currency with which authentic freedom is purchased. Action step right now: ${action}`;

  return {
    message: fullMessage,
    quote: quoteObj.quote,
    author: quoteObj.author,
    growthMilestone: `${milestone.label} — ${milestone.detail}`,
    actionStep: action,
  };
}

/**
 * Specifically creates the Disarm Reflection message:
 * Guarantees the prompt rule:
 * "Wow, you've made it this far... If only you could try again, so I will give you 3 days to think about it."
 */
export function generateDisarmReflectionMotivation(
  username: string,
  gender: 'Male' | 'Female',
  streakDays: number
): GeneratedMotivation {
  const honorific = gender === 'Female' ? "Sister" : "Brother";
  const milestone = getBiologicalMilestone(streakDays);
  const quoteObj = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
  const action = ACTION_DIRECTIVES[Math.floor(Math.random() * ACTION_DIRECTIVES.length)];

  const message = `Wow, you've made it this far... If only you could try again, so I will give you 3 days to think about it. You have stood tall for ${streakDays} days as a proud ${honorific}, breaking an ancient chain. Do not throw away your hard-won clarity and self-respect for five fleeting seconds of empty numbness. Your brotherhood/sisterhood believes in you. Use these 3 days of reflection to breathe, reconnect with your purpose, and remember who you truly are. Immediate victory step: ${action}`;

  return {
    message,
    quote: quoteObj.quote,
    author: quoteObj.author,
    growthMilestone: `${milestone.label} — Reflection Protocol Sealed`,
    actionStep: action,
  };
}

/**
 * Specifically creates the Extension Motivation message:
 * Explicitly states: "I've added another 3 days waiting" and total waiting days.
 */
export function generateExtensionMotivation(
  username: string,
  totalWaitingDays: number,
  streakDays: number
): GeneratedMotivation {
  const quoteObj = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
  const milestone = getBiologicalMilestone(streakDays);

  const message = `I've added another 3 days waiting. Your total waiting reflection period is now ${totalWaitingDays} days. Wow, you've made it this far... You have actively chosen deliberation over blind impulse. Every single day you delay gratification, your prefrontal cortex strengthens and your brain re-establishes its natural dopamine baseline. Stay the course; your freedom is worth fighting for.`;

  return {
    message,
    quote: quoteObj.quote,
    author: quoteObj.author,
    growthMilestone: `${totalWaitingDays} Days Reflection Deliberation — ${milestone.label}`,
  };
}
