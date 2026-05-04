import {fileURLToPath} from "node:url";
import {defineConfig} from "astro/config";
import sitemap from "@astrojs/sitemap";

const SITE_URL = "https://intrebit.com";

export default defineConfig({
    site: SITE_URL,
    output: "static",
    trailingSlash: "never",
    integrations: [
        sitemap(),
    ],
    build: {
        inlineStylesheets: "never",
    },
    vite: {
        server: {
            hmr: true,
        },
        logLevel: "info",
        build: {
            assetsInlineLimit: 0,
        },
    },
});
