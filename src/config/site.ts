export interface LinkProps {
    label:string,
    href:string,
    className?:string,
}

export const servicesLinks: LinkProps[] = [
    {label: 'Bespoke Software', href: '/services#development'},
    {label: 'Outsourcing', href: '/services#outsourcing'},
    {label: 'Infrastructure', href: '/services#infrastructure'},
    {label: 'Consulting', href: '/services#consulting'},
]

export const companyLinks: LinkProps[] = [
    {label: 'About Us', href: '/about'},
    {label: 'Contact', href: '/contact'},
    {label: 'Home', href: '/home'},
]

export const site = {
    mode: "coming-soon" as "coming-soon" | "full",
    // mode: "full" as "coming-soon" | "full",
};