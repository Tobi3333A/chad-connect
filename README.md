# ChadConnect

Connect with students for housing, rides, and events — all in one place.

ChadConnect is a verified `.edu` student community built with Expo and Supabase. Sign in with your university email, complete a short profile, and find roommates, share rides, discover events, and message other students.

## Features

- **.edu-only auth** — OTP sign-in with a university email
- **Profile onboarding** — name, university, major, grad year, bio, city, and what you’re looking for
- **Housing** — seek a roommate, offer a spot, or look for a place
- **Rides** — offer or request rides to airports, campuses, and events
- **Events** — browse, create, and join internships, hackathons, conferences, and meetups
- **Home feed** — activity, suggested connections, and trending events
- **Messaging** — conversations tied to housing, rides, and events
- **Connections & notifications** — request, accept, and stay updated

## Tech stack

| Layer | Technology |
|-------|------------|
| App | [Expo](https://expo.dev) SDK 54, React Native, TypeScript |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) |
| Backend | [Supabase](https://supabase.com) (Auth email OTP + Postgres) |
| Session | AsyncStorage (native) via `@supabase/supabase-js` |

There is no separate custom API server — the client talks to Supabase directly.

## Prerequisites

- Node.js (compatible with Expo 54)
- [pnpm](https://pnpm.io) (preferred; `pnpm-lock.yaml` is checked in) or npm
- A [Supabase](https://supabase.com) project with Email OTP enabled
- Expo Go, an iOS Simulator, an Android emulator, or a browser

## Getting started

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-org>/hack-connect.git
   cd hack-connect
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   Or with npm: `npm install`

3. **Configure environment variables**

   Copy the example file and fill in your Supabase project values:

   ```bash
   cp .env.example .env.local
   ```

   Set:

   - `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon (public) key

   Restart Metro after changing env vars. Do not commit `.env.local`.

4. **Start the app**

   ```bash
   pnpm start
   ```

   Or: `npx expo start`

   Then open in Expo Go, the iOS simulator, the Android emulator, or the web (`pnpm web`).

## Project structure

```
hack-connect/
├── app/            # Expo Router screens (auth, tabs, detail, create)
├── components/     # UI and feature components
├── constants/      # Theme and shared labels
├── contexts/       # Auth provider
├── hooks/          # Data hooks (feed, events, housing, rides, …)
├── lib/            # Supabase client and mappers
├── services/       # Supabase API layer
├── types/          # App-facing TypeScript models
├── supabase/       # Generated types and local CLI config
└── assets/         # Icons and splash
```

## Auth flow

1. Welcome → enter a `.edu` email
2. Receive and enter a 6-digit OTP (Supabase email auth)
3. New users complete onboarding; returning users go to the main tabs

Routing is gated in `app/index.tsx`: no session → welcome; session without a name → onboarding; otherwise → tabs.

## Supabase setup notes

Point the app at your own Supabase project and enable **Email** authentication (OTP / magic link style codes).

SQL migrations are not checked into this repository. Schema expectations live in [`supabase/types.ts`](supabase/types.ts). Your database should include tables compatible with those types, including roughly:

`profiles`, `events`, `event_attendees`, `housing_posts`, `ride_requests`, `feed_items`, `connections`, `conversations`, `conversation_participants`, `messages`, `notifications`

**Security**

- Keep `.env.local` out of git (already gitignored).
- Never put the Supabase **service role** key in this client app.
- The anon key is public by design for client apps, but still keep it in env files rather than hard-coding it.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start the Expo dev server |
| `pnpm android` | Start and open Android |
| `pnpm ios` | Start and open iOS |
| `pnpm web` | Start and open web |
| `pnpm lint` | Run ESLint |

## Contributing

Issues and pull requests are welcome. For local work, use a separate Supabase project and never commit secrets or real student data.
