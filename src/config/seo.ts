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
    contact: {
        title: title("Contact"),
        description:
            "Got a project? A wild idea? Or just want to complain about corporate life? Let’s talk.",
    },
};

// src/config/seo.ts

export type SeoImage = {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
};

export type SEOOverrides = {
    title?: string;
    description?: string;
    canonical?: string;
    image?: SeoImage;
    type?: "website" | "article";
    robots?: string;
    noindex?: boolean;
};

type SiteSEOConfig = {
    siteName: string;
    siteUrl: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultImage: SeoImage;
};

const SITE: SiteSEOConfig = {
    siteName: "intrebit",
    siteUrl: "https://intrebit.com",
    defaultTitle: "intrebit",
    defaultDescription:
        "Software development, outsourcing, infrastructure, and consulting — without the corporate BS.",
    defaultImage: {
        url: "",
        width: 1200,
        height: 630,
        alt: "Intrebit",
    },
};

export function buildSEO(url: URL, overrides: SEOOverrides = {}) {
    const pathname = url.pathname ?? "/";
    const canonical =
        overrides.canonical ??
        `${SITE.siteUrl}${pathname === "/" ? "" : pathname}`.replace(/\/$/, "");

    const title = overrides.title ?? SITE.defaultTitle;

    const description = overrides.description ?? SITE.defaultDescription;
    const type = overrides.type ?? "website";

    const image = {
        ...SITE.defaultImage,
        ...(overrides.image ?? {}),
        url: (overrides.image?.url ?? SITE.defaultImage.url).startsWith("http")
            ? overrides.image?.url ?? SITE.defaultImage.url
            : `${SITE.siteUrl}${overrides.image?.url ?? SITE.defaultImage.url}`,
    };

    const noindex =
        overrides.noindex === true || overrides.robots?.includes("noindex");

    const robots =
        overrides.robots ??
        (noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    return {
        site: SITE,
        canonical,
        title,
        description,
        type,
        image,
        robots
    };
}