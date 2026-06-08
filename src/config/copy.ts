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
    lead:
      "We're a small studio handling technical work for small and " +
      "mid-sized businesses.",
    ctaPrimary: { label: "Get in touch", href: "/contact" },
    ctaSecondary: { label: "See what we do", href: "/#services" },
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
    heading: "Software that<br/>works for <em>you.</em>",
    intro:
      "Instead of focusing on buzzwords and numbers <br/> you don't care about we just do our job.",
  },

  studio: {
    heading: "New <em>shop</em> in town.",
    article: {
      lede:
        "ntrebit started in 2025 in Dublin, after a few years inside a " +
        "corporate environment where shipping had quietly become the smallest " +
        "part of the day. The first client was a local dog grooming salon. The second was a " +
        "Dublin company thirty years in business.\nWe're particular about the next.",
      ledeDropcap: "i",
      closing:
        "When you email us, the person who reads it is the person who " +
        "writes the code. Sometimes my wife.",
    },
  },
};

export const about = {
  hero: {
    title: "About <em>intrebit</em>.",
    lead:
      "We build software for small and mid-sized teams who'd rather " +
      "hire a studio that ships than an agency that PowerPoints.",
  },

  sections: [
    {
      heading: "Background",
      body: [
        "Edit this paragraph in src/config/copy.ts. Brief background — " +
          "where we've worked, what we've built, the kind of problem we " +
          "keep getting hired to solve.",
      ],
    },
    {
      heading: "How we work",
      body: [
        "Fixed price, signed up front. No hourly meter, no surprise invoices.",
        "Code, accounts and hosting are in your name from day one — if " +
          "we stop working together tomorrow, nothing breaks.",
        "One reply within a day. Usually faster.",
      ],
    },
    {
      heading: "What we won't do",
      body: [
        "Vendor lock-in. Pixel-perfect Figma redraws of bad ideas. " +
          "Three-month discovery phases. Anything that ends with the word " +
          "'transformation'.",
      ],
    },
  ],

  cta: {
    heading: "Got something <em>worth building?</em>",
    button: { label: "Tell me about it", href: "/contact" },
  },
};

export const contact = {
  hero: {
    title:
      "If you made it this far,<br/>might as well <em>send us a message.</em>",
  },

  pageHero: {
    title: "What do <em>you</em> need?",
    about:
      "Based in Dublin, we build simple software that saves local businesses time and headaches.<br/> <em>No sales team. No buzzwords. No nonsense.</em>",
  },

  serviceVariants: {
    build: {
      title: "Build something <em>solid.</em>",
      about: "Tools, dashboards, and portals that cut manual work. Scoped clearly, priced properly, shipped fast. You own it from day one.",
    },
    consult: {
      title: "Honest advice. No strings <em>attached.</em>",
      about: "A one-off review of your systems, roadmap, and bottlenecks. We tell you what to build, what to buy, and what to leave alone.",
    },
    automate: {
      title: "Automation that earns its <em>keep.</em>",
      about: "Practical AI and workflow automation that reduce admin, save time, and don't add more mess.",
    },
  },

  form: {
    email: "hello@intrebit.com",

    fields: {
      name: { label: "Name", placeholder: "Jane Doe" },
      email: { label: "Email", placeholder: "jane@company.com" },
      message: {
        label: "What's the story?",
        placeholder:
          "In a few sentences, tell us what's slowing your business down.",
      },
    },

    submit: "Send",

    success: {
      label: "✓ Message sent",
      titleStart: "Got it,",
      titleEnd: "<em>We'll be in touch.</em>",
      body: "We'll reply to {email} within a day. Usually faster.",
      again: "← Send another",
    },
  },
};

export const services = {
  hero: {
    title: "Build it once.",
    titleLine2: "Keep it working.",
    subtitle:
      "Websites, web apps, mobile apps — you name it. We also join existing teams and bring AI where it helps.",
    cta: { label: "Get in touch", href: "/contact" },
  },

  grid: {
    title: "What we do",
    items: [
      {
        title: "Build",
        description: "Custom software for the parts of your business that still feel too manual.",
        details:
          "From landing pages to full platforms. We also rescue inherited messes and make slow, broken things reliable again.",
      },
      {
        title: "Consult",
        description:
          "One-off honest advice before you spend money on software.",
        details:
          "Architecture reviews, stack choices, second opinions, roadmaps — straight talk for teams that want to move faster.",
      },
      {
        title: "AI",
        description: "Integration and education where it actually helps.",
        details:
          "Automating workflows, connecting tools, and teaching your team to use AI day-to-day. No buzzwords, just results.",
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
