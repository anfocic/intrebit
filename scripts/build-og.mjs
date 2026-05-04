import sharp from "sharp";
import {readFileSync, mkdirSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, resolve} from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const fontPath = resolve(root, "public/fonts/space-grotesk/SpaceGrotesk-latin.woff2");
const fontBase64 = readFileSync(fontPath).toString("base64");

const W = 1200;
const H = 630;

const BG = "#071826";
const INK = "#f6f4ef";
const INK_3 = "rgba(246,244,239,0.55)";
const ACCENT = "#e85d2a";
const RULE = "rgba(246,244,239,0.18)";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @font-face {
        font-family: "Space Grotesk";
        font-weight: 400;
        font-style: normal;
        src: url(data:font/woff2;base64,${fontBase64}) format("woff2");
      }
      .display { font-family: "Space Grotesk", sans-serif; fill: ${INK}; }
    </style>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- top rule -->
  <rect x="80" y="80" width="${W - 160}" height="1" fill="${RULE}"/>

  <!-- wordmark + accent dot -->
  <g transform="translate(80, 130)">
    <circle cx="9" cy="9" r="9" fill="${ACCENT}"/>
    <text x="32" y="18" class="display" font-size="28" letter-spacing="-0.2">intrebit</text>
  </g>

  <!-- headline -->
  <g transform="translate(80, 320)">
    <text class="display" font-size="120" letter-spacing="-4" y="0">Software,</text>
    <text class="display" font-size="120" letter-spacing="-4" y="130">built <tspan font-style="italic" fill="${ACCENT}">properly</tspan>.</text>
  </g>

  <!-- bottom rule -->
  <rect x="80" y="${H - 80}" width="${W - 160}" height="1" fill="${RULE}"/>

  <!-- tagline -->
  <text x="80" y="${H - 38}" class="display" font-size="22" fill="${INK_3}" letter-spacing="2">NO BUZZWORDS. NO NONSENSE.</text>

  <!-- url -->
  <text x="${W - 80}" y="${H - 38}" class="display" font-size="22" fill="${INK_3}" letter-spacing="1" text-anchor="end">intrebit.com</text>
</svg>`;

const outDir = resolve(root, "public/og");
mkdirSync(outDir, {recursive: true});

const png = await sharp(Buffer.from(svg)).png({quality: 90}).toBuffer();
writeFileSync(resolve(outDir, "default.png"), png);
console.log(`Wrote ${png.length} bytes -> public/og/default.png`);
