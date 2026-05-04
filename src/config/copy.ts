/**
 * Central copy file. All marketing/UI strings live here.
 * Components import from this file — never hardcode user-facing copy.
 *
 * `<em>...</em>` segments inside headings are rendered as italic + accent.
 * `<br/>` line breaks are honoured.
 */

export const home = {
  hero: {
    title: "Software,<br/>built <em>properly</em>.",
    tagline: "No buzzwords. No nonsense.",
    lead:
      "We're a small studio handling the technical work small and " +
      "mid-sized businesses don't have the headcount for.",
    ctaPrimary: { label: "Tell us what's broken", href: "/contact" },
    ctaSecondary: { label: "Read the work", href: "/#work" },
  },

  stats: {
    items: [
      {
        stat: "1 day",
        label: "to first reply",
        sub: "Real answer — not an auto-responder.",
      },
      {
        stat: "4 weeks",
        label: "average to ship",
        sub: "From signed scope to live in production.",
      },
      {
        stat: "Fixed",
        label: "price, signed up front",
        sub: "No hourly meter. No surprise invoices.",
      },
      {
        stat: "100%",
        label: "yours from day one",
        sub: "Code, accounts, hosting — all in your name.",
      },
    ],
  },

  services: {
    heading: "Three jobs.<br/>Done properly.",
    intro:
      "We don't do everything. We do these three, and we do them " +
      "for teams who'd rather hire a small studio that ships than " +
      "a big one that PowerPoints.",
  },

  work: {
    heading: "Work in <em>motion</em>.",
    values: {
      heading: "How we work.",
      points: [
        {
          title: "Direct line.",
          body: "No PMs, no account managers, no agency layers. You talk to whoever's writing the code.",
        },
        {
          title: "We say no.",
          body: "If a feature is wrong, we'll tell you. We're building with you, not selling to you.",
        },
        {
          title: "You own it.",
          body: "Code, infra, accounts, credentials. All yours from day one. No lock-in.",
        },
      ],
    },
    items: [
      {
        n: "01",
        status: "Shipped",
        client: "news-portal",
        kind: "Full-stack product",
        year: "2026",
        blurb:
          "Astro 6 SSR, Hono API, Postgres. Deployed on Cloudflare. Open source.",
        href: "https://github.com/anfocic/news-portal",
        external: true,
      },
      {
        n: "02",
        status: "Ongoing",
        client: "Client work",
        kind: "Cleaning up old code",
        year: "2025 — now",
        blurb:
          "Untangling years of legacy code piece by piece. Same product, faster and easier to change.",
        href: null,
        external: false,
      },
      {
        n: "03",
        status: "Building",
        client: "intrebit",
        kind: "Multi-agent ops platform",
        year: "2026",
        blurb:
          "Rust backend, TypeScript agents, native iOS. Our own stack, in active development.",
        href: null,
        external: false,
      },
    ],
  },

  studio: {
    heading: "New <em>shop</em> in town.",
    article: {
      lede:
        "ntrebit started in 2025 in Dublin, after a few years inside a " +
        "corporate environment where shipping had quietly become the smallest " +
        "part of the day. The first client was my mom. The second was a " +
        "Dublin company thirty years in business. We're particular about the next.",
      ledeDropcap: "i",
      closing:
        "When you email us, the person who reads it is the person who " +
        "writes the code. Sometimes my wife.",
    },
  },

  cta: {
    heading: "Got a problem<br/><em>worth solving?</em>",
    button: { label: "Tell us about it", href: "/contact" },
  },
};

export const contact = {
  hero: {
    title: "No sales team.<br/>We don't pitch.<br/><em>We build.</em>",
  },

  form: {
    email: "hello@intrebit.com",

    fields: {
      name: { label: "Name", placeholder: "Jane Doe" },
      email: { label: "Email", placeholder: "jane@company.com" },
      message: {
        label: "What's the story?",
        placeholder: "A few sentences on what you need.",
      },
    },

    submit: "Send message",

    success: {
      label: "✓ Message sent",
      titleStart: "Got it,",
      titleEnd: "<em>We'll be in touch.</em>",
      body: "We'll reply to {email} within a day. Usually faster.",
      again: "← Send another",
    },
  },

  faq: {
    heading: "Things people<br/><em>usually ask.</em>",
    items: [
      [
        "How long does it take to build a product?",
        "From a week up to a month. Unless it's a huge project.",
      ],
      ["What does this cost?", "Depends how much do you want to spend."],
      [
        "Who happens when we're done?",
        "You get the code and we take your money. Jokes aside, we're here for you.",
      ],
      ["Where are you based?", "Dublin mostly, Zagreb occassionally."],
      [
        "Do you take over existing work?",
        "Often, yes. Send a description of what's there and we'll see.",
      ],
    ],
  },
};

export const services = {
  hero: {
    title: "Build it once.",
    titleLine2: "Keep it working.",
    subtitle: "You run the business. We build the software that keeps up.",
    cta: { label: "Get in touch", href: "/contact" },
  },

  grid: {
    title: "What we do",
    items: [
      {
        title: "Build",
        description: "Custom software built for how you actually work.",
        details:
          "Websites, internal tools, customer portals, mobile apps. We handle the architecture, the code, and the deployment.",
      },
      {
        title: "Fix",
        description: "Broken systems, slow sites, inherited messes.",
        details:
          "Something's not working and nobody knows why? We dig in, find the root cause, and make it reliable.",
      },
      {
        title: "Automate",
        description: "Turn repetitive tasks into background processes.",
        details:
          "Data entry, report generation, invoice handling—if you're doing it twice a week, we can probably make it run itself.",
      },
    ],
  },

  cta: {
    heading: "Let's figure out what you need.",
    body: "We'll get back to you within a day.",
    button: { label: "Talk to us", href: "/contact" },
  },
};

export const header = {
  brand: "intrebit",
  cta: { label: "Start a project", href: "/contact" },
};

export const footer = {
  linkedin: "https://www.linkedin.com/company/intrebit",
  github: "https://github.com/intrebit",
};
