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
    vite: {
        server: {
            hmr: true,
        },
        logLevel: "info",
    },
});