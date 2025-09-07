
Bumble Skin Patch (Mobile-first, Centered)
==========================================

This bundle adds a Bumble-like UI/UX (≈90% vibe) and end-to-end screens:
register/login → onboarding → mood → feed (swipe) → match → chat (realtime).

ADD/OVERRIDE FILES (merge carefully):
- Components: BumbleShell, ProfileCard, SwipeDeck
- Pages: /feed, /mood, /match, /chat/[id]
- API (additive): /api/me, /api/conversations, /api/conversations/[id]/messages
- Socket: pages/api/socket/io.ts (relay only)
- Helpers: prisma client, toIntId, useSocket, fetchMeId
- Styles: bumble.css (tokens)

Install deps (if missing):
  npm i framer-motion socket.io socket.io-client zod

Ensure tsconfig alias:
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } }

If remote images blocked, add to next.config.js images.remotePatterns:
  cdn.jsdelivr.net, randomuser.me, images.unsplash.com, i.pravatar.cc

Restart dev after adding pages API:
  (Windows) rmdir /s /q .next  &&  npm run dev  → Hard refresh browser

Mapping endpoints:
- SwipeDeck calls: /api/feed, /api/swipe  (adjust if your repo differs)
- Matches/Chat calls: /api/conversations, /api/conversations/[id]/messages
- /api/me returns session user id for client (bubble alignment, typing)

Good luck! 🚀
