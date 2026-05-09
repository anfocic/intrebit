export const services = [
  {
    id: "build",
    n: "S/01",
    title: "Build",
    outcome: "Ship what your team needs.",
    forWho: "Solo founder, small agency, fill this later",
    examples: [
      "Customer portals & member areas",
      "Internal dashboards & admin tools",
      "Marketing sites that convert",
      "Booking, billing & subscription flows",
    ],
    timeline: "4–10 weeks",
    from: "from €8k",
  },
  {
    id: "fix",
    n: "S/02",
    title: "Fix",
    outcome: "Make slow, broken, fragile reliable.",
    forWho:
      "Teams stuck with a product nobody understands, or losing customers to bugs.",
    examples: [
      "Performance audits & speed-ups",
      "Reliability & uptime fixes",
      "Security reviews",
      "Rescue projects from previous vendors",
    ],
    timeline: "1–4 weeks",
    from: "from €3k",
  },
  {
    id: "automate",
    n: "S/03",
    title: "Automate",
    outcome: "Boring work runs itself.",
    forWho:
      "Teams drowning in manual reports, copy-paste, and tools that won't talk.",
    examples: [
      "Invoicing, reporting & reconciliation",
      "CRM ↔ tooling integrations",
      "Lead routing & data syncs",
      "Scheduled jobs that actually work",
    ],
    timeline: "2–6 weeks",
    from: "from €5k",
  },
];

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Work" },
  { href: "/#studio", label: "Studio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const legalLinks: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
