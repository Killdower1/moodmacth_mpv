Moodmacth — Admin Mini
======================

Fitur:
- /admin (whitelist via ADMIN_EMAILS)
- Suspend/Unsuspend user (hapus/buat Profile supaya hilang/muncul di feed)
- Force Unmatch (hapus match + semua message)
- Delete Message (hapus 1 pesan)

Instalasi:
1) Extract ZIP ini ke root project, replace file jika diminta.
2) Tambahkan env:
   ADMIN_EMAILS=ceo@moodmacth.local, your.email@domain.com
3) Jalankan:
   pnpm i
   pnpm dev

Catatan:
- Suspend = delete Profile; Unsuspend = upsert Profile minimal (user bisa edit via /onboarding).
- Banned user masih bisa login; tapi tidak muncul di feed (tanpa Profile). Untuk production nanti, bisa ditambah flag banned di tabel User.
- Akses /admin hanya untuk email dalam ADMIN_EMAILS.
