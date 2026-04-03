# Item Buddy Pro

School IT Equipment Checkout System — a kiosk-friendly web app for managing equipment loans to students.

**No backend, no login, no accounts needed.** All data is stored in the browser's localStorage.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Data:** Browser localStorage (zero backend)

## Getting Started

Requires [Node.js](https://github.com/nvm-sh/nvm#installing-and-updating) (v18+).

```sh
git clone <YOUR_GIT_URL>
cd item-buddy-pro
npm install
npm run dev
```

The app runs at `http://localhost:8080`. That's it — no env vars, no database, no config.

## Building for Production

```sh
npm run build
```

Outputs a static site to `dist/`. Serve it with anything:

```sh
npx serve dist
```

Or deploy to Netlify, Vercel, GitHub Pages, a Raspberry Pi — anywhere that can serve static files.

## Kiosk Mode (Raspberry Pi)

1. Build the app and serve the `dist/` folder
2. Open in Chromium kiosk mode: `chromium-browser --kiosk http://localhost:3000`
3. The built-in virtual keyboard handles touchscreen input
4. No internet connection required

## How It Works

- **Students** enter their ID at the kiosk to check out / return equipment
- **Manage** tab lets you add inventory, manage students, view loans, and configure settings
- All data lives in `localStorage` — clearing browser data resets everything
