Moodmacth — Admin v2 (Reports + Rate Limit)
===========================================

Isi bundle ini:
- prisma/REPORT_MODEL_ADD.txt       -> Copy ke akhir prisma/schema.prisma lalu migrate
- src/lib/ratelimit.ts              -> Rate limit util (in-memory, dev/MVP)
- src/app/api/report/route.ts       -> Endpoint kirim report
- src/app/admin/page.tsx            -> Dashboard admin (Users/Matches/Messages/Reports)
- src/components/MessagesList.tsx   -> UI chat (tambah tombol Report)
- src/app/api/chat/route.ts         -> POST chat dengan rate limit + realtime emit

Langkah pasang:
1) Ekstrak dan replace file ke root project
2) Tambahkan model Report (lihat prisma/REPORT_MODEL_ADD.txt), kemudian:
   pnpm prisma migrate dev --name reports
3) Jalankan ulang:
   pnpm dev
4) Buka /admin (pastikan ADMIN_EMAILS di .env) & test tombol Report di chat
