# Moodmacth — Web MVP Starter

Web-first MVP untuk closed beta internal. Fitur dasar:
- Login dev via **Test OTP Mode** (whitelist + kode 111111).
- Profile dasar + feed sederhana.
- Like → Match (double opt-in) + Chat (polling).
- Mood API (join/leave/feed) sebagai stub awal.
- Prisma + PostgreSQL + seed dummy data.

## Getting Started (Local)

1) Jalankan Postgres via Docker:
```bash
docker compose up -d
```

2) Install deps:
```bash
pnpm i
```

3) Salin env:
```bash
cp .env.example .env
# Ubah NEXTAUTH_SECRET dan whitelist email Anda di TEST_OTP_WHITELIST
```

4) Migrate & seed:
```bash
pnpm prisma migrate dev --name init
pnpm seed
```

5) Run dev:
```bash
pnpm dev
```

6) Login di `/login` menggunakan email yang di-whitelist dan kode `111111`.

## Deploy (ringkas)
- Build: `pnpm build`
- Start: `pnpm start` (rekomendasi pakai PM2)
- Reverse proxy via Nginx + HTTPS (lihat contoh di dokumen masterplan).

## Next Steps
- Onboarding form (nama, DOB, gender, upload foto).
- Adult mood gate + boundaries UI.
- Real-time chat (Socket.IO) + notifications.
- Admin panel (Next.js) untuk reports/ban.
- Coin + Day Pass + membership (stub entitlements).
