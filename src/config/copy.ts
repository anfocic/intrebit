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

  services: {
    heading: "Software that<br/>works for <em>you.</em>",
    intro:
      "Instead of focusing on buzzwords and numbers <br/> you don't care about we just do our job.",
  },

  // PLACEHOLDER PROOF — replace every client, problem and number below with
  // real, anonymized facts before this ships. Inventing results contradicts
  // the whole "no nonsense" pitch; only keep what's actually true.
  proof: {
    heading: "What we've <em>shipped.</em>",
    // One slider: left = the story + number (changes per item), right = one
    // visual card at a time, advanced with the chevrons. items stay paired 1:1.
    items: [
      {
        client: "Legal & accounting",
        blurb:
          "A private AI “associate” for small law and accounting firms — it reads every document in a matter, then answers with citations and flags the risks. Runs entirely on the firm's own machine.",
        features: [
          {label: "Runs locally", desc: "Every model runs on the firm's own machine — no cloud, nothing leaves."},
          {label: "Cited answers", desc: "Every answer links back to the exact passage it came from."},
          {label: "Summaries", desc: "A one-page brief per document: parties, terms, dates, obligations."},
          {label: "Risk flags", desc: "Unusual clauses and deadlines graded high/medium/low, with the excerpt."},
        ],
        card: {
          // TODO(fole): MatterRoom MVP hero screenshot
          tag: "",
          title: "MatterRoom",
          href: "#",
          cta: "",
          image: "/demos/matterroom.png",
          imageAlt: "MatterRoom — private AI matter intelligence for small firms",
          ready: false,
        },
      },
      {
        client: "Local service business",
        blurb:
          "Built for a restaurant here — but the same booking site fits any service business: salons, clinics, studios, trades.",
        features: [
          {label: "Online booking", desc: "Customers book themselves in, any hour — no phone tag."},
          {label: "Reminders", desc: "Automatic email and text reminders that cut no-shows."},
          {label: "SEO", desc: "Built to rank, so people actually find you on Google."},
          {label: "Analytics", desc: "Private, cookie-free insight into what's working."},
          {label: "GDPR-friendly", desc: "Privacy-first: no cookie banner, the data stays yours."},
        ],
        card: {
          // href filled in after the demo is deployed to *.pages.dev
          tag: "",
          title: "A booking site, end to end",
          href: "#",
          cta: "Open the demo",
          image: "/demos/restaurant.png",
          imageAlt: "Restaurant booking demo — menu and reservation flow",
          ready: true,
        },
      },
      {
        client: "Small operations team",
        blurb:
          "An inherited tool nobody understood, rebuilt — four disconnected apps wired into one.",
        metric: "5→1",
        metricUnit: "systems",
        outcome: "One place to look instead of five tabs that disagreed.",
        card: {
          // TODO(fole): real screenshot / decide if this internal tool is shown
          tag: "",
          title: "One system, not five",
          href: "#",
          cta: "",
          image: "/demos/ops.png",
          imageAlt: "Rebuilt internal operations tool",
          ready: false,
        },
      },
    ],
  },

  studio: {
    heading: "New <em>shop</em> in town.",
    article: {
      lede:
        "ntrebit started in 2025 in Dublin, after a few years inside a " +
        "corporate environment where shipping had quietly become the smallest " +
        "part of the day. The first client was a local dog grooming salon. The second was a " +
        "Dublin company thirty years in business.\nWe're careful about the next.",
      ledeDropcap: "i",
      closing:
        "When you email us, the person who reads it is usually the person who " +
        "writes the code.",
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
    title: "What's the <em>story?</em>",
    about:
      "Based in Dublin, we build simple software that saves local businesses time and headaches.",
  },

  assurances: {
    label: "How we work",
    items: [
      "Fixed price, agreed before we start.",
      "You own everything from day one.",
      "One reply within a day. Usually faster.",
    ],
  },

  serviceVariants: {
    build: {
      title: "Build something <em>solid.</em>",
      about: "Custom software for the manual, repetitive corners of your business. Fixed price up front, shipped fast, and yours to keep from day one.",
    },
    consult: {
      title: "Honest advice. No strings <em>attached.</em>",
      about: "Before you spend a cent, a straight look at what you've got — what to build, what to buy, and what to skip entirely.",
    },
    automate: {
      title: "Automation that earns its <em>keep.</em>",
      about: "Data entry, reports, the endless follow-ups — the busywork handed to software, so your team can stop doing it by hand.",
    },
  },

  form: {
    email: "hello@intrebit.com",

    fields: {
      name: { label: "Name", placeholder: "Jane Doe" },
      email: { label: "Email", placeholder: "jane@company.com" },
      message: {
        label: "Message",
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

export const header = {
  brand: "intrebit",
  cta: { label: "Start a project", href: "/contact" },
};

export const footer = {
  linkedin: "https://www.linkedin.com/company/intrebit",
  github: "https://github.com/intrebit",
};
