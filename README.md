# Item Buddy Pro

School IT Equipment Checkout System — a kiosk-friendly web app for managing equipment loans to students.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)

## Getting Started

Requires [Node.js](https://github.com/nvm-sh/nvm#installing-and-updating) (v18+).

```sh
# Clone the repo
git clone <YOUR_GIT_URL>
cd item-buddy-pro

# Install dependencies
npm install

# Create a .env file with your Supabase credentials
cp .env.example .env
# Edit .env and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# Start the dev server
npm run dev
```

The app runs at `http://localhost:8080` by default.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |

## Building for Production

```sh
npm run build
```

This outputs a static site to `dist/`. Serve it with any static file server (Nginx, Caddy, `npx serve dist`, etc.).

## Deploying Supabase

The `supabase/` directory contains database migrations and Edge Functions. Use the [Supabase CLI](https://supabase.com/docs/guides/cli) to deploy:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy
```

## Kiosk Mode (Raspberry Pi)

1. Build the app and serve the `dist/` folder
2. Open in Chromium kiosk mode: `chromium-browser --kiosk http://localhost:3000`
3. The built-in virtual keyboard handles touchscreen input
