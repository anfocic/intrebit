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

## Admin auth (dashboard)

`/dashboard` and `/api/stats/*` are gated by a single-admin session cookie.
Everything else on the site stays public.

Server env (set in Cloudflare Pages project settings → Variables):

| Var | Value |
|---|---|
| `ADMIN_USERNAME` | pick one |
| `ADMIN_PASSWORD_HASH` | argon2id PHC string from `npm run hash-password` |
| `SESSION_SECRET` | `openssl rand -hex 32` |

Generate the password hash locally:

```bash
npm run hash-password
```

It prompts twice, then prints an `$argon2id$...` PHC string. Paste that as
`ADMIN_PASSWORD_HASH` in the Pages dashboard. The plaintext is never stored.

The session cookie is HttpOnly + SameSite=Lax + Path=/, signed with HMAC-SHA256
over a 30-day expiry, and `Secure` is set when `NODE_ENV=production` or
`ENVIRONMENT=production`. Login is rate-limited to 5 attempts per IP per 15 min
in process memory — across multiple Worker isolates a determined attacker could
exceed this; treat it as a friction layer, not a hard guarantee.
