export const services = [
  {
    id: "build",
    title: "Build",
    outcome: "Custom software for work that still feels too manual.",
    href: "/contact",
  },
  {
    id: "consult",
    title: "Consult",
    outcome: "Honest advice before you spend a cent on software.",
    href: "/contact",
  },
  {
    id: "automate",
    title: "Automate",
    outcome: "Automation for the dirty work nobody likes to do.",
    href: "/contact",
  },
];

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const navLinks = [
  { href: "/#services", label: "Services" },
  // { href: "/#work", label: "Work" }, // hidden until the work section is finished
  { href: "/#studio", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

export const legalLinks: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
