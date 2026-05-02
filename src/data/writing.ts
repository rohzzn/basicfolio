export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  category: 'tech' | 'life';
};

export type Thought = {
  text: string;
  date: string;
  displayDate: string;
  category: 'thoughts';
};

export const posts: Post[] = [
  {
    slug: 'first-spring',
    title: 'Second Semester at UC',
    description: 'Reflecting on challenging academics, leadership, and life in Cincinnati during my second semester at the University of Cincinnati.',
    date: '2025-04-28',
    displayDate: 'Apr 2025',
    category: 'life',
  },
  {
    slug: 'uc-experience',
    title: 'First Semester at UC',
    description: 'My experience navigating grad school, new friendships, and adjusting to life in Cincinnati during my first semester.',
    date: '2024-12-31',
    displayDate: 'Dec 2024',
    category: 'life',
  },
  {
    slug: 'variables-exposure',
    title: 'Environment Variables Dont Hide Data',
    description: "That super-secret API key you tucked away in a Vercel environment variable? It might not be as hidden as you think.",
    date: '2024-12-29',
    displayDate: 'Dec 2024',
    category: 'tech',
  },
  {
    slug: 'modern-tech-stacks',
    title: 'Modern Tech Stacks Kill Startups',
    description: 'Why chasing the latest frameworks and tools can kill a startup before it ever ships anything of value.',
    date: '2024-06-10',
    displayDate: 'Jun 2024',
    category: 'tech',
  },
  {
    slug: 'security-article',
    title: 'Your 2FA Is Broken',
    description: 'Two-factor authentication feels safe, but most implementations have critical weaknesses that attackers exploit every day.',
    date: '2024-05-15',
    displayDate: 'May 2024',
    category: 'tech',
  },
  {
    slug: 'boring-performance',
    title: 'Boring Guide to 10x Frontend Performance',
    description: 'The unsexy, practical steps that actually make your frontend fast — no magic, just fundamentals done right.',
    date: '2024-04-15',
    displayDate: 'Apr 2024',
    category: 'tech',
  },
  {
    slug: 'discord-article',
    title: 'How Discord Survived 2024s Biggest Launch',
    description: "A deep dive into how Discord's infrastructure scaled to handle millions of concurrent users during a massive game launch.",
    date: '2024-03-20',
    displayDate: 'Mar 2024',
    category: 'tech',
  },
  {
    slug: 'esports-journey',
    title: 'My Time in Esports',
    description: 'From LAN cafes to online tournaments — my personal journey through competitive gaming and the esports scene.',
    date: '2024-03-08',
    displayDate: 'Mar 2024',
    category: 'life',
  },
  {
    slug: 'chatgpt-interface',
    title: 'Building My Own ChatGPT UI',
    description: 'Why I built a custom ChatGPT interface instead of using the default, and what I learned along the way.',
    date: '2024-01-20',
    displayDate: 'Jan 2024',
    category: 'tech',
  },
  {
    slug: 'ixigo-experience',
    title: 'SDE Intern at Abhibus (Ixigo)',
    description: 'Lessons from my software engineering internship at Abhibus, a subsidiary of Ixigo, India\'s leading travel platform.',
    date: '2023-10-10',
    displayDate: 'Oct 2023',
    category: 'life',
  },
  {
    slug: 'beginners-guide-programming',
    title: 'Beginners Guide for Programming',
    description: 'A practical, no-nonsense starting point for anyone who wants to learn to code but has no idea where to begin.',
    date: '2021-04-28',
    displayDate: 'Apr 2021',
    category: 'tech',
  },
  {
    slug: 'beginners-guide-design',
    title: 'Beginners Guide for Design',
    description: 'The core principles, tools, and resources that helped me go from zero design knowledge to building real products.',
    date: '2021-04-28',
    displayDate: 'Apr 2021',
    category: 'tech',
  },
];

export const thoughts: Thought[] = [
  {
    text: "Less — Shortcuts, Overthinking, Fear, Adding, Postponing\nMore — Living by my principles, Doing, Risk, Subtracting, JUST GETTING S**T DONE",
    date: '2026-03-11',
    displayDate: 'Mar 2026',
    category: 'thoughts',
  },
];
