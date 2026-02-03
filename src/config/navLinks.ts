type FooterLink = {
    label: string;
    href: string;
    external?: boolean;
};

export const navLinks = [
    { href: "/services", label: "Services" },
    // { href: "/about", label: "About" },
    { href: "/contact" , label: "Contact" },
];

export const legalLinks: FooterLink[] = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];