# intrebit frontend

Astro marketing site for `intrebit.com`.

## Repo Relationship

This is its own git repo. In the shared local workspace it usually sits beside
the separate backend repo at `../backend`.

The site itself is static, but public browser scripts currently talk to the
deployed API at `https://api.intrebit.com/public`.

## Stack

- Astro 5
- TypeScript
- `@astrojs/sitemap`
- Cloudflare Pages

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run deploy
```

## Notes

- Contact form and analytics scripts live under `public/scripts/`.
