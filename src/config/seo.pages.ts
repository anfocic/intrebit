// src/config/seo.pages.ts
import type { SEOOverrides } from "./seo";

const title = (page: string) => `intrebit — ${page}`;

export const pageSEO: Record<string, SEOOverrides> = {
    home: {
        title: title("software, built properly."),
        description:
            "Software that works. We build digital infrastructure, interfaces, and systems without corporate BS.",
    },

    services: {
        title: title("Services"),
        description:
            "Custom software development, outsourcing, infrastructure, and consulting — built right, not rushed.",
    },

    about: {
        title: title("About"),
        description:
            "We’re a bunch of millennials who got tired of corporate grind and decided to build software that doesn’t suck.",
    },

    contact: {
        title: title("Contact"),
        description:
            "Got a project? A wild idea? Or just want to complain about corporate life? Let’s talk.",
    },

    blog: {
        title: title("Blog"),
        description: "Thoughts on software, work, and building things that don’t suck.",
    },

    faq: {
        title: title("FAQ"),
        description: "Questions we get asked. Honest answers. No buzzwords.",
    },

    menu: {
        title: title("Pricing"),
        description:
            "We’re not a restaurant — but here’s the real talk on pricing, scope, and how we quote projects.",
    },
};