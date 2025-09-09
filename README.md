# Moodmatch

Aplikasi dating dengan OTP login (email whitelisted), onboarding singkat, halaman Matches, dan opsional Chat via feature flag.

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind
- Prisma ORM (SQLite/Postgres)
- JWT cookie untuk session (OTP verify)
- PM2 + Nginx (deploy)

## Status
- Branch **main** = stabil untuk deploy.
- Fitur **Chat** disiapkan di branch feature terpisah dan diaktifkan via flag.

---

## Quick Start

\\\ash
npm i
npx prisma generate
npm run dev
\\\

Default URL: http://localhost:3000

### Environment Variables

Buat **.env.local** (dev):

\\\
NODE_ENV=development
TZ=Asia/Jakarta

# DB (pilih salah satu)
DATABASE_URL="file:./dev.db"
# DATABASE_URL="postgresql://user:pass@localhost:5432/moodmacth?schema=public"

# JWT secret (wajib untuk OTP)
NEXTAUTH_SECRET=dev-secret

# Feature flags
NEXT_PUBLIC_FEATURE_CHAT=off
\\\

> **Flag**: set \NEXT_PUBLIC_FEATURE_CHAT=on\ untuk menampilkan link/section Chat di UI.  
> Route \/chat\ bisa dites langsung via URL meski flag off (kalau route-nya sudah dibuat), tapi link nav disembunyikan.

### Prisma

\\\ash
npx prisma generate
npx prisma migrate status
# dev migrate (opsional):
# npx prisma migrate dev -n "init"
# seed (opsional):
# npx prisma db seed
\\\

---

## Scripts

- \
pm run dev\ – dev server
- \
pm run build\ – production build
- \
pm start\ – next start

---

## Workflow & Guardrails

- Kerja di **feature branch** (contoh: \eature/chat-ui\).
- **Scope guard** opsional: commit hanya pada path fitur (scripts/guard-changes.js + .husky/pre-commit dengan \ALLOW_PATHS\).
- Proteksi \main\ (PR only, Code Owners, build check).

**Konvensi:**
- Branch: \eature/<nama-fitur>\, \hotfix/<judul>\
- Stabil sementara: \stabilize-YYYYMMDD\
- Tag rilis: \stable-YYYYMMDD-HHMM\

---

## Deploy (ringkas)

Di server:
\\\ash
git pull --ff-only
npm ci
npx prisma migrate deploy
npm run build
pm2 reload moodmacth
\\\

Pakai Nginx reverse proxy ? port Next.js (mis. 3010). Timezone server: \Asia/Jakarta\.

---

## Troubleshooting

- PostCSS/Tailwind: gunakan \@tailwindcss/postcss\ di \postcss.config.*\
- next/image host: whitelist host eksternal di \
ext.config.mjs\
- Prisma include error (userA/userB): pastikan relasi schema benar
- Node: gunakan v18 (mis. 18.20.3)

---

## License
Private project.
