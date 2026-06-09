const SITE_URL = "https://intrebit.com";
const SITE_NAME = "intrebit";
const SITE_EMAIL = "hello@intrebit.com";

// Base Organization schema (used across all pages)
export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/favicons/apple-touch-icon.png`,
    "email": SITE_EMAIL,
    "sameAs": [
        "https://www.linkedin.com/company/intrebit"
    ]
};

// Homepage schemas
export const homeSchemas = [
    organizationSchema,
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": "Small team. High quality. Done right.",
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME
        }
    },
    {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Services",
        "itemListElement": [
            {
                "@type": "Service",
                "position": 1,
                "name": "Development",
                "description": "Custom software built for your workflow — websites, apps, portals and internal tools.",
                "provider": {
                    "@type": "Organization",
                    "name": SITE_NAME
                }
            },
            {
                "@type": "Service",
                "position": 2,
                "name": "Consulting",
                "description": "We analyze how your business works, find the bottlenecks, and tell you what's worth fixing.",
                "provider": {
                    "@type": "Organization",
                    "name": SITE_NAME
                }
            },
            {
                "@type": "Service",
                "position": 3,
                "name": "Automation",
                "description": "That repetitive task eating your week? We can make it run itself. Invoices, reports, data entry.",
                "provider": {
                    "@type": "Organization",
                    "name": SITE_NAME
                }
            }
        ]
    }
];

// Contact page schema
export const contactSchemas = [
    organizationSchema,
    {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact intrebit",
        "description": "Get in touch with intrebit",
        "url": `${SITE_URL}/contact`,
        "mainEntity": {
            "@type": "Organization",
            "name": SITE_NAME,
            "email": SITE_EMAIL,
            "url": SITE_URL
        }
    }
];