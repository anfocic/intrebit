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

    // Optional for article pages
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
};

type SiteSEOConfig = {
    siteName: string;
    siteUrl: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultImage: SeoImage;
    twitterHandle?: string;
};

const SITE: SiteSEOConfig = {
    siteName: "Intrebit",
    siteUrl: "https://intrebit.com",
    defaultTitle: "Intrebit",
    defaultDescription:
        "Software development, outsourcing, infrastructure, and consulting — without the corporate BS.",
    defaultImage: {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "Intrebit",
    },
    twitterHandle: "@intrebit",
};

export function buildSEO(url: URL, overrides: SEOOverrides = {}) {
    const pathname = url.pathname ?? "/";
    const canonical =
        overrides.canonical ??
        `${SITE.siteUrl}${pathname === "/" ? "" : pathname}`.replace(/\/$/, "");

    const titleBase = overrides.title ?? SITE.defaultTitle;
    const title =
        overrides.title && overrides.title !== SITE.siteName
            ? `${titleBase} | ${SITE.siteName}`
            : `${SITE.defaultTitle} | ${SITE.siteName}`;

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
        robots,

        article:
            type === "article"
                ? {
                    publishedTime: overrides.publishedTime,
                    modifiedTime: overrides.modifiedTime,
                    author: overrides.author,
                    tags: overrides.tags ?? [],
                }
                : null,

        twitter: {
            card: "summary_large_image",
            handle: SITE.twitterHandle,
        },
    };
}