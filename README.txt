
Moodmacth – Patch Bundle (chat + matches + feed helpers)
========================================================

WHAT'S INSIDE
-------------
Additive files to enable:
- /match list of conversations
- /chat/[id] realtime chat (Socket.IO)
- /api/conversations + nested messages endpoints
- /api/me for client to know current user id
- Socket.IO server (pages API)
- SwipeDeck integration helpers (no stack, one card, buttons ♥/✕)
- Mood helper (derive current mood from MoodSession)
- Utility: toIntId, useSocket client hook

HOW TO APPLY
------------
1) Unzip into your repo root (merge paths). Review diffs before overwrite.
   *If you already have the same file, merge manually.*

2) Ensure NextAuth options file path in `src/lib/auth.ts` matches your project:
   - Adjust import: `@/app/api/auth/[...nextauth]/options` if different.

3) Install deps if not installed yet:
   npm i socket.io socket.io-client framer-motion zod

4) If you add/changed pages API (we did), restart dev:
   - Stop dev server
   - Delete .next: (Windows) `rmdir /s /q .next`
   - Start again: `npm run dev`
   - Hard refresh browser

5) If images from remote hosts still blocked, add to next.config.js:
   images.remotePatterns = [
     { protocol: "https", hostname: "cdn.jsdelivr.net" },
     { protocol: "https", hostname: "randomuser.me" },
     { protocol: "https", hostname: "images.unsplash.com" },
     { protocol: "https", hostname: "i.pravatar.cc" },
   ]
   Restart dev after editing next.config.js.

KEY PATHS
---------
- src/app/api/me/route.ts
- src/app/api/conversations/route.ts
- src/app/api/conversations/[id]/messages/route.ts
- pages/api/socket/io.ts
- src/app/match/page.tsx
- src/app/chat/[id]/page.tsx
- src/app/chat/[id]/room-client.tsx
- src/lib/useSocket.ts
- src/lib/mood.ts
- src/lib/id.ts
- src/lib/auth.ts  (adjust path to your NextAuth options)
- src/lib/me.ts
- src/components/ProfileCard.tsx
- src/components/SwipeDeck.tsx  (client-only, one card, drag, ♥/✕)

NOTES
-----
- Dynamic routes should use `[id]` consistently.
- Prisma ID type mismatches: we cast strings→number via `toIntId()` before Prisma calls.
- Socket server now relays messages; REST POST persists, then client broadcasts.
- If your schema differs (e.g., Conversation/Message IDs are `String`), the code detects numeric vs string in the messages API and uses a flexible `where`.
