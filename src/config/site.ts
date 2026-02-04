export const services = [
    {
        id: "development",
        title: "Development",
        description:
            "Custom software built for your workflow — websites, apps, portals and internal tools.",
        icon: `
      <path d="M10 7 5 12l5 5"/>
      <path d="M14 7 19 12l-5 5"/>
    `,
    },
    {
        id: "consulting",
        title: "Consulting",
        description: "We analyze how your business works, find the bottlenecks, and tell you what's worth fixing.",
        icon: `
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    `,
    },
    {
        id: "automation",
        title: "Automation",
        description:
            "Repetitive task eating your week?  We can make it run itself. Invoices, reports, data entry.",
        icon: `
      <path d="M12 2v4"/>
      <path d="M12 18v4"/>
      <path d="M4.93 4.93l2.83 2.83"/>
      <path d="M16.24 16.24l2.83 2.83"/>
      <path d="M2 12h4"/>
      <path d="M18 12h4"/>
      <path d="M4.93 19.07l2.83-2.83"/>
      <path d="M16.24 7.76l2.83-2.83"/>
    `,
    },
];

type FooterLink = {
    label: string;
    href: string;
    external?: boolean;
};

export const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/contact" , label: "Contact" },
];

export const legalLinks: FooterLink[] = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];