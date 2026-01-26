type FooterLink = {
    label: string;
    href: string;
    external?: boolean;
};

export const navLinks = [
    { href: "/services", label: "What we do" },
    { path: "/about", label: "About" },
    { href: "/contact" , label: "Contact" },
    // { path: "/blog", label: "Blog" },
];

export const legalLinks: FooterLink[] = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];