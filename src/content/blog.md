# Intrebit Launch Series — Writing Pack (Markdown)

Goal: a 3–4 post series that documents “shipping a Rust Axum API to production” with practical learnings.
You will write everything manually; this doc is your structure + checklists + “nice to haves”.

---

## Series map

### Post 1 — Dockerizing a Rust Axum API (without losing your mind)
**Core promise:** “Here’s the Dockerfile + Compose setup that actually runs, and how I debugged the classic traps.”

### Post 2 — Email in production: Lettre + Resend + configuration that won’t bite
**Core promise:** “How I wired SMTP safely, avoided TLS/cert pain, and structured config.”

### Post 3 — Deploying to a VPS: server build flow + Docker Compose as a deploy contract
**Core promise:** “How I shipped it to Hetzner, what commands I use, and how I update safely.”

### Post 4 (optional) — Reverse proxy + HTTPS with Caddy (and what I broke first)
**Core promise:** “Caddyfile patterns that work, gotchas, and how to verify.”

### Post 5 (optional) — Ops/security follow-up: secrets, firewall, and WireGuard for ‘SSH from anywhere’
**Core promise:** “I want travel-friendly SSH without leaving the server wide open.”

---

## Global writing checklist (apply to every post)

### Before you write
- [ ] One sentence: “Who is this for?” (beginner Rust dev? indie hacker? devops-curious?)
- [ ] One sentence: “What will they be able to do after reading?”
- [ ] Pick 1–3 “pain points” this post resolves.
- [ ] Gather 3–6 screenshots/snippets max (don’t overload).

### While writing
- [ ] Use “symptom → cause → fix” at least once.
- [ ] Include one “verification command” section (`curl`, `docker ps`, etc.).
- [ ] Include one “what I’d do differently” paragraph.
- [ ] Keep code blocks short; link to repo for full files.

### After writing
- [ ] Add a “Checklist” section at the end readers can run.
- [ ] Add a “Common errors” mini-FAQ (3 items).
- [ ] Confirm secrets are not present in screenshots/snippets.
- [ ] Confirm all commands work on a clean machine (or clearly mark assumptions).

---

## Repo hygiene + open source packaging (series-wide)

### Must-haves
- [ ] `README.md` explains what the project is and how to run it (local + docker)
- [ ] `.env.example` committed
- [ ] `.env` never committed
- [ ] `.gitignore` includes `.env`, `/target`, and any local IDE folders you don’t want
- [ ] License (MIT/Apache-2.0/etc.)
- [ ] Basic “Architecture” section (tiny diagram is a bonus)

### Nice-to-haves
- [ ] `README.Docker.md` with “build/run/upgrade” commands
- [ ] `Caddyfile.example`
- [ ] `docker-compose.yml` production-ish variant + a dev variant
- [ ] Makefile or `justfile` with common commands
- [ ] GitHub/Codeberg Actions CI: `cargo fmt`, `cargo clippy`, `cargo test`

### “Don’t leak secrets” checklist
- [ ] Rotate any leaked API keys immediately
- [ ] Purge `.env` from git history if it ever reached remote (note this in Post 5 optional)
- [ ] Add a pre-commit hook to prevent committing `.env` (optional)
- [ ] Use secret scanning in repo hosting (if available)

---

## Post 1 template — Dockerizing a Rust Axum API

### Title ideas
- “Dockerizing a Rust Axum API: a path that actually works”
- “Why my container exited (0) with no logs (and how I fixed it)”

### Outline (fill-in)
1. **What I’m building**
    - What endpoints exist (`/health`, `/contact`)
    - What “done” looks like (curl returns 200; container stays up)
2. **First Docker attempt (what went wrong)**
    - Symptom(s): container exits immediately, ports not mapped, logs empty
    - Cause(s): wrong CMD, wrong binary name, build context issues, dummy caching pitfalls
3. **The Dockerfile that worked**
    - Multi-stage build (builder + runtime)
    - Non-root user
    - Why install `ca-certificates`
4. **Compose file (even for one service)**
    - `ports`, `env_file`, `restart`
    - Binding `127.0.0.1:3000:3000` vs `3000:3000` (mention intent)
5. **How I debug Docker quickly**
    - `docker ps -a`
    - `docker logs <container>`
    - `docker run --rm -it ... sh`
    - One tiny rule: “If logs are empty, your process likely never started”
6. **Checklist**
7. **Common errors**

### Must include (checklist)
- [ ] The final Dockerfile (or link + 10–20 line excerpt)
- [ ] The final compose snippet
- [ ] Verification commands:
    - [ ] `docker compose up -d --build`
    - [ ] `curl http://127.0.0.1:3000/health`
- [ ] One troubleshooting section with 2–3 real error messages you hit

### Nice-to-haves
- [ ] Explain BuildKit in one paragraph (what it is, why it shows up)
- [ ] Explain “why Docker on server build is slower but simpler”

---

## Post 2 template — Email in production (Lettre + Resend)

### Outline
1. **What the email flow is**
    - `/contact` → validate payload → send SMTP email
2. **Config structure**
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `ADMIN_EMAIL`, `SMTP_TIMEOUT_SECS`
3. **Lettre transport choices**
    - `tokio1-native-tls` vs `rustls` variants (what you chose and why)
4. **TLS/cert pain (what happened + resolution)**
    - Self-signed cert error story (what it means)
    - Why `ca-certificates` inside runtime image matters
5. **Operational concerns**
    - Timeouts
    - Logging (what you log vs never log)
    - Rate expectations: low volume now, newsletter later
6. **Checklist**
7. **Common errors**

### Must include (checklist)
- [ ] A short “EmailService” snippet showing where secrets are *not* printed
- [ ] A “test email” command or curl to `/contact`
- [ ] A warning box: “Never commit `.env`”
- [ ] Mention: how you store env on server (compose env_file / systemd env / secrets manager later)

### Nice-to-haves
- [ ] Add “future newsletter” considerations: provider limits, deliverability basics, domain auth (mention only; keep short)

---

## Post 3 template — Deploying to a VPS with Docker Compose

### Outline
1. **The deployment goal**
    - From laptop to live service
2. **Server setup assumptions**
    - Ubuntu version, a non-root user, docker installed
3. **Build on server flow (the one you chose)**
    - `git pull`
    - `docker compose build`
    - `docker compose up -d`
    - Why this is “good enough” early on
4. **Automation + release discipline**
    - Tags or main branch
    - Update process that’s safe (and reversible)
5. **Observability basics**
    - `docker compose logs -f`
    - `docker stats` (optional mention)
6. **Checklist**
7. **Common errors**

### Must include (checklist)
- [ ] “Minimal deploy script” example (shell snippet) **without** secrets
- [ ] Rollback strategy:
    - [ ] Keep old image tag OR re-run `git checkout <commit>` + rebuild
- [ ] Mention the cost angle: building uses CPU temporarily; doesn’t permanently raise cost, but may spike load/time

### Nice-to-haves
- [ ] Add a tiny “systemd vs docker” note (why you picked docker since more services coming)
- [ ] Add “server won’t compile locally vs linux binary mismatch” explanation (mac ≠ linux)

---

## Post 4 template — Caddy reverse proxy + HTTPS

### Outline
1. **Why a reverse proxy**
    - TLS termination, nicer domain, optional auth later
2. **DNS prerequisites**
    - `api.intrebit.com` points to server (and “proxied vs DNS-only” if relevant)
3. **The working Caddyfile**
    - `api.intrebit.com { reverse_proxy 127.0.0.1:3000 }`
4. **Mistakes I made**
    - “directive outside site block”
    - “invalid port parsing”
5. **Verification**
    - `curl -v https://api.intrebit.com/health`
    - `sudo ss -tulpn | grep caddy`
6. **Checklist**
7. **Common errors**

### Must include (checklist)
- [ ] Final Caddyfile
- [ ] The 2–3 commands you used:
    - [ ] `sudo caddy fmt --overwrite /etc/caddy/Caddyfile`
    - [ ] `sudo caddy validate --config /etc/caddy/Caddyfile`
    - [ ] `sudo systemctl reload caddy`
- [ ] One “HTTP→HTTPS redirect” check

### Nice-to-haves
- [ ] Mention: binding app to localhost only, proxy exposes it publicly

---

## Post 5 optional — Security + access: firewall + WireGuard for travel SSH

### Topics checklist
- [ ] “I tried IP allowlisting my home IP → broke when I changed networks”
- [ ] Options:
    - [ ] Open SSH to world (with hardening) + fail2ban
    - [ ] Allowlist dynamic IP (pain)
    - [ ] Tailscale (easy)
    - [ ] WireGuard (more DIY, very solid)
- [ ] What you picked and why
- [ ] A realistic “time needed” section

### Nice-to-haves
- [ ] A simple diagram: Laptop ↔ VPN ↔ VPS
- [ ] A rule: SSH only over VPN interface

---

## Content “nice-to-haves” you can sprinkle across the series
- [ ] One ASCII diagram per post (max)
- [ ] A “what I’m not doing yet” section (K8s, full CI/CD, Terraform)
- [ ] A small glossary box: BuildKit, multi-stage build, reverse proxy, TLS
- [ ] A small “cost notes” box (Hetzner plan enough; what scales later)

---

## Consistency checklist across the whole series
- [ ] Same naming everywhere (`intrebit`, `crm`, ports, domains)
- [ ] Same “how to run locally” instructions
- [ ] Keep all “final files” in the repo so posts can link to them
- [ ] End every post with:
    - [ ] “Checklist”
    - [ ] “Common errors”
    - [ ] “Next post teaser”

---

## Your personal writing practice prompts (optional)
Use one per section when you get stuck:
- “What did I expect to happen?”
- “What happened instead?”
- “How did I prove the cause?”
- “What would have prevented it?”
- “What’s the smallest reproducible example?”

---