// src/config/seo.pages.ts
import type { SEOOverrides } from "./seo";

/**
 * ✅ Toggle this when you're ready to launch:
 * - true  = only Coming Soon gets indexed
 * - false = all pages get indexed
 */
const PRELAUNCH = true;

/**
 * ✅ Helper: applies prelaunch noindex to any page
 * unless it explicitly overrides noindex.
 */
const prelaunch = (seo: SEOOverrides): SEOOverrides => ({
    ...seo,
    noindex: seo.noindex ?? PRELAUNCH,
});

export const pageSEO: Record<string, SEOOverrides> = {
    // ✅ Coming soon should be indexable even during prelaunch
    comingSoon: {
        title: "Coming Soon",
        description: "Intrebit is launching soon. Get notified when we go live.",
        noindex: false,
    },

    home: prelaunch({
        title: "Home",
        description:
            "Software that works. We build digital infrastructure, interfaces, and systems without corporate BS.",
    }),

    services: prelaunch({
        title: "Services",
        description:
            "Custom software development, outsourcing, infrastructure, and consulting — built right, not rushed.",
    }),

    about: prelaunch({
        title: "About",
        description:
            "We’re a bunch of millennials who got tired of corporate grind and decided to build software that doesn’t suck.",
    }),

    contact: prelaunch({
        title: "Contact",
        description:
            "Got a project? A wild idea? Or just want to complain about corporate life? Let’s talk.",
    }),

    blog: prelaunch({
        title: "Blog",
        description: "Thoughts on software, work, and building things that don’t suck.",
    }),

    faq: prelaunch({
        title: "FAQ",
        description: "Questions we get asked. Honest answers. No buzzwords.",
    }),

    menu: prelaunch({
        title: "Pricing",
        description:
            "We’re not a restaurant — but here’s the real talk on pricing, scope, and how we quote projects.",
    }),
};