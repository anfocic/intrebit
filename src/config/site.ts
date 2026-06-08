export const services = [
  {
    id: "build",
    title: "Build",
    outcome: "Custom software for the parts of your business that still feel too manual.",
    href: "/contact",
  },
  {
    id: "consult",
    title: "Consult",
    outcome: "One-off honest advice before you spend money on software.",
    href: "/contact",
  },
  {
    id: "automate",
    title: "Automate",
    outcome: "Integration and education where it actually helps.",
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

  { href: "/#studio", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

export const legalLinks: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
