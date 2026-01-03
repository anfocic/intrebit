// src/config/seo.pages.ts
import type { SEOOverrides } from "./seo";

export const pageSEO: Record<string, SEOOverrides> = {
    home: {
        title: "Home",
        description:
            "Software that works. We build digital infrastructure, interfaces, and systems without corporate BS.",
    },

    services: {
        title: "Services",
        description:
            "Custom software development, outsourcing, infrastructure, and consulting — built right, not rushed.",
    },

    about: {
        title: "About",
        description:
            "We’re a bunch of millennials who got tired of corporate grind and decided to build software that doesn’t suck.",
    },

    contact: {
        title: "Contact",
        description:
            "Got a project? A wild idea? Or just want to complain about corporate life? Let’s talk.",
    },

    blog: {
        title: "Blog",
        description:
            "Thoughts on software, work, and building things that don’t suck.",
    },

    faq: {
        title: "FAQ",
        description:
            "Questions we get asked. Honest answers. No buzzwords.",
    },

    menu: {
        title: "Pricing",
        description:
            "We’re not a restaurant — but here’s the real talk on pricing, scope, and how we quote projects.",
    },

    comingSoon: {
        title: "Coming Soon",
        description:
            "Intrebit is launching soon. Get notified when we go live.",
        noindex: true,
    },
};