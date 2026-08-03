/* Temporary M0 catalog — direct TypeScript port of New-Design/assets/js/data.js.
   Replaced by Supabase queries in M2; the deterministic generators move to
   scripts/generate-seed.ts in M1. Keep semantics identical (>>>0 hash). */

export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface Subcategory {
  slug: string
  name: string
  desc: string
}

export interface Category {
  slug: string
  name: string
  icon: string
  tint: string
  tintInk: string
  desc: string
  subs: Subcategory[]
}

export interface Topic {
  slug: string
  name: string
  level: Level
  mins: number
  lessons: number
  desc: string
  /* Database id — set by the live catalog (M2+), absent in mock data. */
  id?: number
}

export interface Unit {
  unit: string
  items: { title: string; mins: number; id?: number }[]
}

export interface TopicContext {
  cat: Category
  sub: Subcategory
  topic: Topic
}

export interface FlatLesson {
  title: string
  mins: number
  unit: string
  unitIndex: number
  /* Database id — set by the live catalog (M2+), absent in mock data. */
  id?: number
}

export const CATEGORIES: Category[] = [
  {
    slug: 'programming', name: 'Programming', icon: 'code', tint: '#E9EDFB', tintInk: '#2B50D8',
    desc: 'From your first HTML tag to shipping a production API. Every track is a sequence, so you always know what comes next.',
    subs: [
      { slug: 'html-css', name: 'HTML & CSS', desc: 'Markup, layout, and responsive design fundamentals.' },
      { slug: 'javascript', name: 'JavaScript', desc: 'The language of the browser, from basics to patterns.' },
      { slug: 'python', name: 'Python', desc: 'Scripting, automation, and data work.' },
      { slug: 'react', name: 'React', desc: 'Component-driven interfaces with modern React.' },
      { slug: 'nodejs', name: 'Node.js', desc: 'APIs, servers, and tooling in JavaScript.' },
      { slug: 'cs-fundamentals', name: 'CS Fundamentals', desc: 'Data structures, algorithms, and how computers think.' },
    ],
  },
  {
    slug: 'design', name: 'Design', icon: 'palette', tint: '#FBE9F1', tintInk: '#BE185D',
    desc: 'UI principles, typography, and end-to-end product design taught through real interface work.',
    subs: [
      { slug: 'ui-design', name: 'UI Design', desc: 'Layout, hierarchy, and visual systems.' },
      { slug: 'ux-research', name: 'UX Research', desc: 'Learning what users actually need.' },
      { slug: 'design-systems', name: 'Design Systems', desc: 'Tokens, components, and governance.' },
      { slug: 'typography', name: 'Typography', desc: 'Type choice, pairing, and setting.' },
    ],
  },
  {
    slug: 'marketing', name: 'Marketing', icon: 'megaphone', tint: '#FDEEDC', tintInk: '#C2410C',
    desc: 'Growth, SEO, and campaigns that actually move numbers — with the analytics to prove it.',
    subs: [
      { slug: 'seo', name: 'SEO', desc: 'Ranking for the searches that matter.' },
      { slug: 'content-marketing', name: 'Content Marketing', desc: 'Writing that earns attention.' },
      { slug: 'email-marketing', name: 'Email Marketing', desc: 'Lifecycle and campaign email.' },
      { slug: 'analytics', name: 'Analytics', desc: 'Measuring what works.' },
    ],
  },
  {
    slug: 'business', name: 'Business', icon: 'briefcase', tint: '#EDEBFA', tintInk: '#5B3FC0',
    desc: 'Strategy, operations, and leadership fundamentals for people building or running teams.',
    subs: [
      { slug: 'strategy', name: 'Strategy', desc: 'Positioning and decision frameworks.' },
      { slug: 'operations', name: 'Operations', desc: 'Making the machine run smoothly.' },
      { slug: 'leadership', name: 'Leadership', desc: 'Managing people and yourself.' },
      { slug: 'product-management', name: 'Product Management', desc: 'Shipping the right thing.' },
    ],
  },
  {
    slug: 'finance', name: 'Finance', icon: 'dollar', tint: '#E2F2E9', tintInk: '#187A4B',
    desc: 'Personal finance, investing, and financial planning — explained without the jargon.',
    subs: [
      { slug: 'personal-finance', name: 'Personal Finance', desc: 'Budgets, saving, and debt.' },
      { slug: 'investing', name: 'Investing', desc: 'Markets, portfolios, and risk.' },
      { slug: 'financial-modeling', name: 'Financial Modeling', desc: 'Spreadsheets that answer questions.' },
    ],
  },
  {
    slug: 'ai-ml', name: 'AI & Machine Learning', icon: 'brain', tint: '#FFF0CC', tintInk: '#9A6A00',
    desc: 'From your first model to production ML pipelines, with hands-on labs at every step.',
    subs: [
      { slug: 'ml-foundations', name: 'ML Foundations', desc: 'Core concepts and first models.' },
      { slug: 'deep-learning', name: 'Deep Learning', desc: 'Neural networks in practice.' },
      { slug: 'nlp', name: 'NLP', desc: 'Working with language data.' },
      { slug: 'prompt-engineering', name: 'Prompt Engineering', desc: 'Getting the most from LLMs.' },
    ],
  },
  {
    slug: 'languages', name: 'Languages', icon: 'globe', tint: '#DFF3F1', tintInk: '#0F766E',
    desc: 'Conversational fluency across seven languages, structured for steady daily practice.',
    subs: [
      { slug: 'spanish', name: 'Spanish', desc: 'From hola to conversation.' },
      { slug: 'french', name: 'French', desc: 'Everyday French, step by step.' },
      { slug: 'japanese', name: 'Japanese', desc: 'Kana, kanji, and conversation.' },
    ],
  },
  {
    slug: 'personal-growth', name: 'Personal Growth', icon: 'sparkles', tint: '#FBE9E7', tintInk: '#C2453A',
    desc: 'Communication, focus, and habit-building skills that compound across everything else you learn.',
    subs: [
      { slug: 'communication', name: 'Communication', desc: 'Writing and speaking clearly.' },
      { slug: 'productivity', name: 'Productivity', desc: 'Focus, systems, and habits.' },
      { slug: 'public-speaking', name: 'Public Speaking', desc: 'Presenting without the panic.' },
    ],
  },
]

const TOPICS: Record<string, Topic[]> = {
  'html-css': [
    { slug: 'intro-to-html', name: 'Introduction to HTML', level: 'beginner', mins: 100, lessons: 9, desc: 'Semantic markup, document structure, and accessibility basics.' },
    { slug: 'css-flexbox-mastery', name: 'CSS Flexbox Mastery', level: 'beginner', mins: 130, lessons: 10, desc: 'Build responsive layouts with confidence using flex containers.' },
    { slug: 'css-grid-layouts', name: 'CSS Grid Layouts', level: 'intermediate', mins: 150, lessons: 11, desc: 'Two-dimensional layout for real page architecture.' },
    { slug: 'responsive-design', name: 'Responsive Design', level: 'intermediate', mins: 170, lessons: 12, desc: 'Fluid grids, media queries, and mobile-first thinking.' },
  ],
  javascript: [
    { slug: 'javascript-basics', name: 'JavaScript Basics', level: 'beginner', mins: 200, lessons: 13, desc: 'Variables, functions, and control flow for total beginners.' },
    { slug: 'dom-essentials', name: 'DOM Essentials', level: 'beginner', mins: 160, lessons: 11, desc: 'Select, change, and listen to the page from JavaScript.' },
    { slug: 'async-javascript', name: 'Async JavaScript', level: 'intermediate', mins: 190, lessons: 12, desc: 'Promises, async/await, and talking to APIs.' },
    { slug: 'es-modules-tooling', name: 'ES Modules & Tooling', level: 'intermediate', mins: 140, lessons: 9, desc: 'Imports, bundlers, and a modern project setup.' },
    { slug: 'testing-javascript', name: 'Testing JavaScript', level: 'intermediate', mins: 170, lessons: 10, desc: 'Unit tests that catch bugs before your users do.' },
    { slug: 'javascript-patterns', name: 'JavaScript Patterns', level: 'advanced', mins: 220, lessons: 13, desc: 'Closures, composition, and the shapes of maintainable code.' },
  ],
  python: [
    { slug: 'python-for-beginners', name: 'Python for Beginners', level: 'beginner', mins: 230, lessons: 14, desc: 'Syntax, data types, and your first automation scripts.' },
    { slug: 'python-data-work', name: 'Working with Data in Python', level: 'intermediate', mins: 210, lessons: 12, desc: 'Files, CSVs, and pandas fundamentals.' },
    { slug: 'python-automation', name: 'Practical Automation', level: 'intermediate', mins: 180, lessons: 11, desc: 'Scripts that do your boring work for you.' },
  ],
  react: [
    { slug: 'react-fundamentals', name: 'React Fundamentals', level: 'intermediate', mins: 345, lessons: 22, desc: 'Components, props, and state in a modern React workflow.' },
    { slug: 'react-hooks-deep-dive', name: 'Hooks Deep Dive', level: 'advanced', mins: 260, lessons: 15, desc: 'useEffect, custom hooks, and the rules behind them.' },
    { slug: 'react-router-apps', name: 'Multi-page Apps with Router', level: 'intermediate', mins: 190, lessons: 12, desc: 'Client-side routing done properly.' },
  ],
  nodejs: [
    { slug: 'node-essentials', name: 'Node.js Essentials', level: 'intermediate', mins: 270, lessons: 18, desc: 'Build a REST API with Express and connect it to a database.' },
    { slug: 'node-auth', name: 'Authentication in Node', level: 'advanced', mins: 200, lessons: 12, desc: 'Sessions, tokens, and keeping users safe.' },
  ],
  'cs-fundamentals': [
    { slug: 'data-structures-algorithms', name: 'Data Structures & Algorithms', level: 'advanced', mins: 425, lessons: 26, desc: 'Arrays to graphs, with interview-style practice problems.' },
    { slug: 'how-computers-work', name: 'How Computers Work', level: 'beginner', mins: 150, lessons: 10, desc: 'Bits, memory, and CPUs — the machine under your code.' },
  ],
}

const LESSONS: Record<string, Unit[]> = {
  'javascript-basics': [
    {
      unit: 'Getting started',
      items: [
        { title: 'What is JavaScript?', mins: 6 },
        { title: 'Setting up your environment', mins: 8 },
        { title: 'Your first script', mins: 10 },
      ],
    },
    {
      unit: 'Variables & data types',
      items: [
        { title: 'let, const & var', mins: 12 },
        { title: 'Strings & numbers', mins: 14 },
        { title: 'Arrays & objects', mins: 18 },
        { title: 'Type coercion gotchas', mins: 10 },
      ],
    },
    {
      unit: 'Functions & scope',
      items: [
        { title: 'Declaring functions', mins: 15 },
        { title: 'Arrow functions', mins: 12 },
        { title: 'Scope & closures', mins: 20 },
      ],
    },
    {
      unit: 'Control flow',
      items: [
        { title: 'if / else & switch', mins: 14 },
        { title: 'for & while loops', mins: 16 },
        { title: 'Debugging in DevTools', mins: 16 },
      ],
    },
  ],
}

/* ---------- deterministic generators ---------- */

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

function genTopics(sub: Subcategory): Topic[] {
  const patterns = [
    { pre: '', post: ' Foundations', level: 'beginner' as Level, desc: 'Start from zero and build a working base in ' },
    { pre: 'Practical ', post: '', level: 'intermediate' as Level, desc: 'Hands-on projects that put real reps into ' },
    { pre: '', post: ' in Depth', level: 'advanced' as Level, desc: 'The edge cases, trade-offs, and expert techniques of ' },
    { pre: '', post: ' Projects Studio', level: 'intermediate' as Level, desc: 'Portfolio-ready builds applying ' },
  ]
  const suffixes = ['foundations', 'practical', 'in-depth', 'studio']
  return patterns.map((p, i) => {
    const h = hash(sub.slug + i)
    return {
      slug: `${sub.slug}-${suffixes[i]}`,
      name: p.pre + sub.name + p.post,
      level: p.level,
      mins: 90 + (h % 14) * 15,
      lessons: 8 + (h % 6),
      desc: p.desc + sub.name + '.',
    }
  })
}

function genLessons(topic: Topic): Unit[] {
  const units = ['Orientation', 'Core concepts', 'In practice', 'Putting it together']
  const stems = ['Overview & setup', 'Key ideas', 'Guided walkthrough', 'Common mistakes', 'Exercise: apply it', 'Review & next steps']
  const per = Math.max(2, Math.round(topic.lessons / units.length))
  const out: Unit[] = []
  let n = 0
  for (let u = 0; u < units.length && n < topic.lessons; u++) {
    const items: Unit['items'] = []
    for (let i = 0; i < per && n < topic.lessons; i++, n++) {
      const h = hash(topic.slug + n)
      items.push({ title: stems[(u + i) % stems.length] + (u > 0 ? ` — part ${u + 1}` : ''), mins: 6 + (h % 12) })
    }
    out.push({ unit: units[u], items })
  }
  return out
}

/* ---------- lookup API ---------- */

export function getCategory(slug: string): Category | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null
}

export function findSub(subSlug: string): { cat: Category; sub: Subcategory } | null {
  for (const cat of CATEGORIES) {
    const sub = cat.subs.find((s) => s.slug === subSlug)
    if (sub) return { cat, sub }
  }
  return null
}

export function topicsFor(subSlug: string): Topic[] {
  const list = TOPICS[subSlug]
  if (list) return list
  const ctx = findSub(subSlug)
  return ctx ? genTopics(ctx.sub) : []
}

export function findTopic(topicSlug: string): TopicContext | null {
  for (const cat of CATEGORIES) {
    for (const sub of cat.subs) {
      const topic = topicsFor(sub.slug).find((t) => t.slug === topicSlug)
      if (topic) return { cat, sub, topic }
    }
  }
  return null
}

export function lessonsFor(topic: Topic): Unit[] {
  return LESSONS[topic.slug] ?? genLessons(topic)
}

export function flatLessons(topic: Topic): FlatLesson[] {
  const out: FlatLesson[] = []
  lessonsFor(topic).forEach((u, ui) => {
    u.items.forEach((l) => out.push({ title: l.title, mins: l.mins, unit: u.unit, unitIndex: ui }))
  })
  return out
}

export function topicCounts(catSlug: string): { topics: number; mins: number } {
  const cat = getCategory(catSlug)
  if (!cat) return { topics: 0, mins: 0 }
  let topics = 0
  let mins = 0
  for (const s of cat.subs) {
    for (const t of topicsFor(s.slug)) {
      topics++
      mins += t.mins
    }
  }
  return { topics, mins }
}

export function allTopics(): TopicContext[] {
  const out: TopicContext[] = []
  for (const cat of CATEGORIES) {
    for (const sub of cat.subs) {
      for (const topic of topicsFor(sub.slug)) out.push({ cat, sub, topic })
    }
  }
  return out
}
